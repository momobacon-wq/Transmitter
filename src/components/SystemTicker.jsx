import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getLogs } from '../services/api';

const SystemTicker = ({ inventory }) => {
    const [recentLogs, setRecentLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRecent = async () => {
        try {
            const res = await getLogs();
            if (res.status === 'success') {
                // Get last 10 logs
                setRecentLogs(res.data.slice(0, 10));
            }
        } catch (error) {
            console.error("Ticker fetch failed", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecent();
        const interval = setInterval(fetchRecent, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    if (loading || recentLogs.length === 0) return null;

    // Helper to find item name
    const getItemName = (partNumber) => {
        const item = inventory.find(i => i.partNumber === partNumber);
        return item ? item.name : partNumber;
    };

    // Helper to format log text
    const formatLog = (log) => {
        const time = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const name = getItemName(log.partNumber);
        const action = log.action.includes('IN') || log.changeAmount > 0 ? 'RETURNED' : 'TOOK';
        const qty = Math.abs(log.changeAmount);
        return `[${time}] ID:${log.employeeId} ${action} ${qty}x ${name}`;
    };

    return (
        <div style={{
            width: '100%',
            backgroundColor: '#000',
            color: '#0f0', // Hacker green
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
                animation: 'marquee 30s linear infinite',
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
