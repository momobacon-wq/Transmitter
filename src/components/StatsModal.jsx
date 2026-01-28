import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Modal from './Modal';

// Custom Tooltip for 8-bit style
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="nes-container is-rounded is-dark" style={{ padding: '0.5rem', fontSize: '0.8rem' }}>
                <p style={{ margin: 0 }}>{label}</p>
                <p style={{ margin: 0, color: '#209cee' }}>Qty: {payload[0].value}</p>
            </div>
        );
    }
    return null;
};

const StatsModal = ({ isOpen, onClose, item, logs }) => {
    const chartData = useMemo(() => {
        if (!item || !logs || logs.length === 0) return [];

        // 1. Filter logs for this item
        const itemLogs = logs.filter(log => log.partNumber === item.partNumber);

        // 2. Sort by date (Oldest first)
        itemLogs.sort((a, b) => new Date(a.date) - new Date(b.date));

        // 3. Map to chart format
        // Recharts prefers simple objects. We need 'name' (Time) and 'value' (Balance)
        return itemLogs.map(log => {
            const date = new Date(log.timestamp);
            const dateStr = !isNaN(date)
                ? date.toLocaleDateString([], { month: '2-digit', day: '2-digit' })
                : log.timestamp.split('T')[0].substring(5); // Fallback to string parsing if needed

            return {
                name: dateStr,
                value: parseInt(log.balance, 10),
            };
        });
    }, [item, logs]);

    // If no recent logs, maybe show current quantity as a single point or empty state
    // For now, if no logs, we just show empty chart

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose} // StatsModal prop is onClose
            onCancel={onClose} // Modal prop is onCancel
            title={item ? `TREND: ${item.partNumber}` : 'STATS'}
            showConfirm={false}
            cancelText="Close"
        >
            <div style={{ width: '100%', height: 300, marginTop: '1rem' }}>
                {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
                            <XAxis
                                dataKey="name"
                                tick={{ fill: '#fff', fontSize: 10, fontFamily: "'Press Start 2P'" }}
                                stroke="#fff"
                                minTickGap={30}
                                height={30}
                            />
                            <YAxis
                                tick={{ fill: '#fff', fontSize: 10, fontFamily: "'Press Start 2P'" }}
                                stroke="#fff"
                                domain={['auto', 'auto']}
                                allowDecimals={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Line
                                type="stepAfter" // Retro stepped look
                                dataKey="value"
                                stroke="#209cee"
                                strokeWidth={3}
                                dot={{ stroke: '#209cee', fill: '#000', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div style={{ textAlign: 'center', padding: '50px', color: '#888' }}>
                        <i className="nes-icon close is-small"></i><br />
                        NO LOGS FOUND
                    </div>
                )}
            </div>
            <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.8rem', color: '#666' }}>
                * Shows recent transactions
            </div>
        </Modal>
    );
};

StatsModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    item: PropTypes.object,
    logs: PropTypes.array
};

export default StatsModal;
