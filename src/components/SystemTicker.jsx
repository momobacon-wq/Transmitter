import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getLogs } from '../services/api';

const SystemTicker = ({ inventory }) => {
    const [recentLogs, setRecentLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRecent = async () => {
        try {
            const res = await getLogs();
            if (res.status === 'success' && res.data.length > 0) {
                // Get ONLY the last log
                const lastLog = res.data.slice(0, 1);
                setRecentLogs(lastLog);
                // Persist to localStorage
                localStorage.setItem('LAST_SYSTEM_LOG', JSON.stringify(lastLog));
            } else if (res.status === 'success' && res.data.length === 0) {
                // If connection success but no logs (e.g. empty sheet), try to keep old one or clear?
                // User wants to see "Last person", so keep showing old one is better than empty.
                // Do nothing, let existing state persist or fallback below.
            }
        } catch (error) {
            console.error("Ticker fetch failed", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Load from local storage initially
        const savedLog = localStorage.getItem('LAST_SYSTEM_LOG');
        if (savedLog) {
            try {
                setRecentLogs(JSON.parse(savedLog));
                setLoading(false);
            } catch (e) {
                console.error("Failed to parse saved log", e);
            }
        }

        fetchRecent();
        const interval = setInterval(fetchRecent, 10000); // Check faster (10s) since we only show 1
        return () => clearInterval(interval);
    }, []);

    if (loading || recentLogs.length === 0) return null;

    // Helper to format log text
    const formatLog = (log) => {
        // User requested: "上一個人拿的東西型號與數量" (Last person's Item Model & Qty)
        // We assume "Model" = PartNumber (User terminology in ItemCard)
        const action = log.action.includes('IN') || log.changeAmount > 0 ? 'RETURNED' : 'TOOK';
        const qty = Math.abs(log.changeAmount);
        return `LAST TRANSACTION >> ID:${log.employeeId} ${action} ${log.partNumber} x${qty}`;
    };

    return (
        <div style={{
            width: '100%',
            backgroundColor: '#000',
            color: '#0f0',
            borderBottom: '2px solid #333',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            fontSize: '0.8rem',
            fontFamily: "'Press Start 2P', monospace",
            padding: '5px 0',
            position: 'relative'
        }}>
            <div style={{
                display: 'inline-block',
                animation: 'marquee 20s linear infinite', // Constant slow scroll for single item
                paddingLeft: '100%'
            }}>
                {recentLogs.map((log, index) => (
                    <span key={index} style={{ marginRight: '50px' }}>
                        {formatLog(log)}
                    </span>
                ))}
            </div>
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-100%); }
                }
            `}</style>
        </div>
    );
};

SystemTicker.propTypes = {
    inventory: PropTypes.array.isRequired
};

export default SystemTicker;
