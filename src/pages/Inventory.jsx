import { useEffect, useState, useRef, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { useSound } from '../context/SoundContext';
import { getInventory, updateStock, addItem, getLogs } from '../services/api';
import ItemCard from '../components/ItemCard';
import Modal from '../components/Modal';
import AddItemModal from '../components/AddItemModal';
import LogsModal from '../components/LogsModal';
import SortModal from '../components/SortModal';

const Inventory = () => {
    const { employeeId, logout, inventory, setInventory, setLoading, showMessage } = useGame();
    const { playClick, playSuccess, playError, playZap, playWarning, playKeystroke, playDataLoad, playUIOpen, playRetroAlarm, playPowerDown, speak, playCheckIn, playCheckOut, playHover } = useSound();

    // Local state for fetching status to avoid flickering if already loaded
    // Local state for fetching status to avoid flickering if already loaded
    const [initLoad, setInitLoad] = useState(true);
    const [loadStatus, setLoadStatus] = useState("LOADING CARTRIDGE...");
    const [fetchError, setFetchError] = useState(null);


    // Modal State
    const [modalState, setModalState] = useState({ isOpen: false, type: '', item: null });
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
    const [isSortModalOpen, setIsSortModalOpen] = useState(false);

    const [sortConfig, setSortConfig] = useState({ field: 'partNumber', direction: 'asc' });
    const [searchQuery, setSearchQuery] = useState('');
    const [logs, setLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);

    // Concurrency Lock & Timestamp Validation
    const isProcessingRef = useRef(false); // For Actions (Check-in/out)
    const fetchLockRef = useRef(false);   // For Fetching Data
    const lastActionTimeRef = useRef(0);

    const fetchData = useCallback(async () => {
        // Prevent background refresh from overwriting optimistic updates during user interaction
        if (isProcessingRef.current) return;

        // Prevent overlapping fetches
        if (fetchLockRef.current) {
            console.log("Fetch skipped: Request already in progress");
            return;
        }

        const requestStartTime = Date.now();

        try {
            fetchLockRef.current = true;
            if (initLoad) playDataLoad();
            setLoading(true);
            const res = await getInventory();

            // Double check lock: if user started action during fetch, ignore this stale result
            if (isProcessingRef.current) return;

            // Triple check: if a transaction happened AFTER this request started, ignore result
            if (requestStartTime < lastActionTimeRef.current) {
                console.log("Ignored stale data");
                return;
            }

            if (res.status === 'success') {
                setInventory(res.data);

                // Sound Pack v3: Low Stock Alarm (Disabled by user request)
                // const lowStockItems = res.data.filter(i => i.quantity <= 5);
                // if (lowStockItems.length > 0 && (initLoad || !isProcessingRef.current)) {
                //    playRetroAlarm();
                // }

                setFetchError(null);
            } else {
                console.error("Error fetching", res);
                showMessage("SYNC ERROR", "error");
                setFetchError(res.message || "Unknown Server Error");
            }
        } catch (err) {
            console.error(err);
            playPowerDown(); // Sound Pack v3: Critical Error Sound
            showMessage("CONNECTION LOST", "error");
            setLoadStatus("CONNECTION FAILED");
            setFetchError(err.message || "Network Error");
        } finally {
            fetchLockRef.current = false;
            // Ensure timer is cleared if error occurred (can't reach timerId here easily without scope change, 
            // but the component unmount or next fetch cleans up. Actually, let's fix scope.)
            // NOTE: In this scope structure, timerId is lost in catch. 
            // Correct approach: wrap fetch in specific try/finally for timer.
            // But for now, user will just see error and timer stops updating UI technically if logic flow exits.
            // Actually, setInterval keeps running! We MUST clear it.
        }

        if (!initLoad) { // Only clear global loading, let initLoad handle itself or timeout
            setLoading(false);
        } else {
            // First load success/fail
            setLoading(false);
            setInitLoad(false);
        }
    }, [setInventory, setLoading, showMessage, initLoad]);

    useEffect(() => {
        fetchData();

        // Auto refresh
        const intervalMs = import.meta.env.VITE_REFRESH_INTERVAL || 30000;
        const interval = setInterval(fetchData, intervalMs);

        // Safety Timeout for Init Load
        const safetyTimeout = setInterval(() => {
            if (initLoad) {
                setLoadStatus(prev => {
                    if (prev === "LOADING CARTRIDGE...") return "CONNECTING TO SATELLITE...";
                    if (prev === "CONNECTING TO SATELLITE...") return "DECRYPTING DATA...";
                    return prev;
                });
            }
        }, 3000);

        return () => {
            clearInterval(interval);
            clearInterval(safetyTimeout);
        };
    }, [fetchData, initLoad]);

    const confirmAction = (actionType, item) => {
        if (actionType === 'CHECK_OUT') {
            playWarning();
        } else {
            playCheckIn(); // Use CheckIn sound as generic "Select" or "Power Up" context
        }
        playUIOpen();
        setModalState({
            isOpen: true,
            type: actionType,
            item: item
        });
    };

    const executeAction = async () => {
        const { type: actionType, item } = modalState;
        setModalState({ ...modalState, isOpen: false }); // Close modal

        // 2. Optimistic Update
        const originalInventory = [...inventory];
        const change = actionType === 'CHECK_IN' ? 1 : -1;

        isProcessingRef.current = true; // LOCK
        lastActionTimeRef.current = Date.now(); // Mark action time

        // Optimistically update UI
        setInventory(prev => prev.map(invItem => {
            if (invItem.partNumber === item.partNumber) {
                return { ...invItem, quantity: invItem.quantity + change };
            }
            return invItem;
        }));

        // 3. API Call
        try {
            const payload = {
                action: actionType,
                employeeId,
                partNumber: item.partNumber,
                changeAmount: change
            };

            const res = await updateStock(payload);

            if (res.status === 'success') {
                // If server returns new qty, sync it
                if (res.newQuantity !== undefined) {
                    setInventory(prev => prev.map(invItem => {
                        if (invItem.partNumber === item.partNumber) {
                            return { ...invItem, quantity: res.newQuantity };
                        }
                        return invItem;
                    }));
                }
                if (actionType === 'CHECK_IN') {
                    showMessage('ACQUIRED!', 'success');
                    playCheckIn();
                    speak("Access Granted");
                } else {
                    showMessage('USED!', 'success');
                    playCheckOut();
                    speak("Discharge Complete");
                }
            } else {
                throw new Error(res.message);
            }

        } catch (err) {
            console.error(err);
            showMessage("TRANSACTION FAILED", "error");
            playError();
            // Revert
            setInventory(originalInventory);
        } finally {
            // Wait a moment before allowing refresh again to ensure no race condition with polling
            setTimeout(() => {
                isProcessingRef.current = false; // UNLOCK
            }, 1000);
        }
    };

    const handleAddItem = async (newItemData) => {
        setIsAddModalOpen(false);

        // Optimistic update (optional, but fetching is safer for duplicates)
        setLoading(true);

        try {
            const res = await addItem(newItemData);
            if (res.status === 'success') {
                showMessage("ITEM CREATED!", "success");
                playSuccess();
                speak("New Item Initialized");
                fetchData(); // Refresh list
            } else {
                throw new Error(res.message);
            }
        } catch (err) {
            console.error(err);
            showMessage(err.message || "CREATE FAILED", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenLogs = async () => {
        setIsLogsModalOpen(true);
        setLogsLoading(true);
        try {
            const res = await getLogs();
            if (res.status === 'success') {
                setLogs(res.data);
            } else {
                showMessage("LOGS ERROR", "error");
            }
        } catch (err) {
            console.error(err);
            showMessage("FETCH FAILED", "error");
        } finally {
            setLogsLoading(false);
        }
    };

    const handleSort = (field, direction) => {
        setSortConfig({ field, direction });
        setIsSortModalOpen(false);
    };

    return (
        <div>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '4px solid #fff', paddingBottom: '10px' }}>
                <div>
                    <i className="nes-icon coin"></i>
                    <span style={{ marginLeft: '10px' }}>ID: {employeeId}</span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="nes-btn is-warning" onMouseEnter={playHover} onClick={() => { playClick(); setIsSortModalOpen(true); }} style={{ fontSize: '0.7rem' }}>SORT</button>
                    <button className="nes-btn is-primary" onMouseEnter={playHover} onClick={() => { playClick(); handleOpenLogs(); }} style={{ fontSize: '0.7rem' }}>LOGS</button>
                    <button className="nes-btn is-success" onMouseEnter={playHover} onClick={() => { playClick(); setIsAddModalOpen(true); }} style={{ fontSize: '0.7rem' }}>+ NEW ITEM</button>
                    <button className="nes-btn is-error" onMouseEnter={playHover} onClick={() => { playZap(); logout(); }} style={{ fontSize: '0.7rem' }}>EXIT</button>
                </div>
            </header>

            <div style={{ marginBottom: '20px' }}>
                <div className="nes-field">
                    <label htmlFor="search_field" style={{ color: '#fff' }}>Search Inventory:</label>
                    <input
                        type="text"
                        id="search_field"
                        className="nes-input is-dark"
                        placeholder="Type to filter..."
                        value={searchQuery}
                        onChange={(e) => {
                            playKeystroke();
                            setSearchQuery(e.target.value);
                        }}
                    />
                </div>
            </div>

            {/* Error Message Display */}
            {fetchError && (
                <div style={{ textAlign: 'center', color: '#ff0000', padding: '20px', border: '2px dashed red', marginBottom: '20px' }}>
                    <i className="nes-icon close is-small"></i> ERROR: {fetchError}
                    <br />
                    <button className="nes-btn is-primary" onClick={() => window.location.reload()} style={{ marginTop: '10px' }}>RETRY</button>
                </div>
            )}

            {initLoad ? (
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <p>{loadStatus}</p>
                    <progress className="nes-progress is-pattern" value="50" max="100"></progress>

                    {loadStatus.includes("FAILED") || loadStatus.includes("DECRYPTING") ? (
                        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button className="nes-btn is-error" onClick={() => window.location.reload()}>FORCE RESTART</button>
                        </div>
                    ) : null}
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {[...new Map(inventory.map(item => [item.partNumber, item])).values()] // Deduplicate by PartNumber
                        .filter(item => {
                            if (!searchQuery) return true;

                            // Split by comma (OR logic) for batch search
                            const distinctQueries = searchQuery.toLowerCase().split(/[,，]/);

                            // Return true if ANY of the distinct queries match (OR)
                            return distinctQueries.some(query => {
                                const terms = query.trim().split(/\s+/); // Split by space (AND logic)
                                if (terms.length === 0 || (terms.length === 1 && terms[0] === '')) return false;

                                // Return true if ALL terms match (AND)
                                return terms.every(term => {
                                    return (
                                        String(item.partNumber || '').toLowerCase().includes(term) ||
                                        String(item.name || '').toLowerCase().includes(term) ||
                                        String(item.brand || '').toLowerCase().includes(term) ||
                                        String(item.spec || '').toLowerCase().includes(term) ||
                                        String(item.location || '').toLowerCase().includes(term)
                                    );
                                });
                            });
                        }).sort((a, b) => {
                            let comparison = 0;
                            if (sortConfig.field === 'quantity') {
                                comparison = a.quantity - b.quantity;
                            } else if (sortConfig.field === 'brand') {
                                comparison = String(a.brand || '').localeCompare(String(b.brand || ''));
                            } else {
                                // Numeric sort for partNumber if possible, else string
                                comparison = String(a.partNumber).localeCompare(String(b.partNumber), undefined, { numeric: true });
                            }
                            return sortConfig.direction === 'asc' ? comparison : -comparison;
                        }).map(item => (
                            <ItemCard key={item.partNumber} item={item} onAction={confirmAction} />
                        ))}

                    {!initLoad && !fetchError && inventory.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '50px', color: '#888' }}>
                            <p>NO INVENTORY ITEMS FOUND</p>
                            <p style={{ fontSize: '0.8rem' }}>Verify Google Sheet Content</p>
                        </div>
                    )}
                </div>
            )}

            <Modal
                isOpen={modalState.isOpen}
                title={modalState.type === 'CHECK_IN' ? 'SYSTEM ALERT' : 'WARNING'}
                message={modalState.type === 'CHECK_IN'
                    ? `Authorized to ACQUIRE 1x ${modalState.item?.name}?`
                    : `Authorized to DISPENSE 1x ${modalState.item?.name}?`
                }
                onConfirm={executeAction}
                onCancel={() => setModalState({ ...modalState, isOpen: false })}
            />

            <AddItemModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onConfirm={handleAddItem}
            />

            <LogsModal
                isOpen={isLogsModalOpen}
                onClose={() => setIsLogsModalOpen(false)}
                logs={logs}
                loading={logsLoading}
            />

            <SortModal
                isOpen={isSortModalOpen}
                onClose={() => setIsSortModalOpen(false)}
                onSort={handleSort}
                currentSort={sortConfig}
            />
        </div>
    );
};

export default Inventory;
