import { useEffect, useState, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { getInventory, updateStock, addItem, getLogs } from '../services/api';
import ItemCard from '../components/ItemCard';
import Modal from '../components/Modal';
import AddItemModal from '../components/AddItemModal';
import LogsModal from '../components/LogsModal';
import SortModal from '../components/SortModal';

const Inventory = () => {
    const { employeeId, logout, inventory, setInventory, setLoading, showMessage } = useGame();

    // Local state for fetching status to avoid flickering if already loaded
    const [initLoad, setInitLoad] = useState(true);

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
    const isProcessingRef = useRef(false);
    const lastActionTimeRef = useRef(0);

    const fetchData = async () => {
        // Prevent background refresh from overwriting optimistic updates during user interaction
        if (isProcessingRef.current) return;

        const requestStartTime = Date.now();

        try {
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
            } else {
                console.error("Error fetching", res);
                showMessage("SYNC ERROR", "error");
            }
        } catch (err) {
            console.error(err);
            showMessage("CONNECTION LOST", "error");
        } finally {
            setLoading(false);
            setInitLoad(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Auto refresh
        const intervalMs = import.meta.env.VITE_REFRESH_INTERVAL || 30000;
        const interval = setInterval(fetchData, intervalMs);
        return () => clearInterval(interval);
    }, []);

    const confirmAction = (actionType, item) => {
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

        // const change = actionType === 'CHECK_IN' ? 1 : -1; // Duplicate removed

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
                showMessage(actionType === 'CHECK_IN' ? 'ACQUIRED!' : 'USED!', 'success');
            } else {
                throw new Error(res.message);
            }

        } catch (err) {
            console.error(err);
            showMessage("TRANSACTION FAILED", "error");
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
                    <button className="nes-btn is-warning" onClick={() => setIsSortModalOpen(true)} style={{ fontSize: '0.7rem' }}>SORT</button>
                    <button className="nes-btn is-primary" onClick={handleOpenLogs} style={{ fontSize: '0.7rem' }}>LOGS</button>
                    <button className="nes-btn is-success" onClick={() => setIsAddModalOpen(true)} style={{ fontSize: '0.7rem' }}>+ NEW ITEM</button>
                    <button className="nes-btn is-error" onClick={logout} style={{ fontSize: '0.7rem' }}>EXIT</button>
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
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {initLoad ? (
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <p>LOADING CARTRIDGE...</p>
                    <progress className="nes-progress is-pattern" value="50" max="100"></progress>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {[...inventory].filter(item => {
                        if (!searchQuery) return true;
                        const lowerQuery = searchQuery.toLowerCase();
                        return (
                            String(item.partNumber).toLowerCase().includes(lowerQuery) ||
                            String(item.name).toLowerCase().includes(lowerQuery) ||
                            String(item.spec).toLowerCase().includes(lowerQuery) ||
                            String(item.location).toLowerCase().includes(lowerQuery)
                        );
                    }).sort((a, b) => {
                        let comparison = 0;
                        if (sortConfig.field === 'quantity') {
                            comparison = a.quantity - b.quantity;
                        } else {
                            // Numeric sort for partNumber if possible, else string
                            comparison = String(a.partNumber).localeCompare(String(b.partNumber), undefined, { numeric: true });
                        }
                        return sortConfig.direction === 'asc' ? comparison : -comparison;
                    }).map(item => (
                        <ItemCard key={item.partNumber} item={item} onAction={confirmAction} />
                    ))}
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
