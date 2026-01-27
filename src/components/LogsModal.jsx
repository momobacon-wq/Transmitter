import PropTypes from 'prop-types';
import { useSound } from '../context/SoundContext';

const LogsModal = ({ isOpen, onClose, logs, loading }) => {
    const { playClick } = useSound();
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div className="nes-dialog is-dark is-rounded" style={{
                width: '95%',
                maxWidth: '900px',
                height: '80vh',
                backgroundColor: '#212529',
                padding: '2.5rem 1.5rem 1.5rem 1.5rem', // Top padding for close button
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
            }}>
                <button
                    className="nes-btn is-error"
                    onClick={() => { playClick(); onClose(); }}
                    style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        zIndex: 100,
                        padding: '0 12px'
                    }}
                >X</button>

                <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                    <p className="title" style={{ margin: 0 }}>SYSTEM LOGS</p>
                </div>

                <div className="nes-table-responsive" style={{ flex: 1, overflowY: 'auto', border: '2px solid #fff', padding: '5px' }}>
                    <table className="nes-table is-bordered is-dark is-centered" style={{ width: '100%', fontSize: '0.7rem', color: '#fff', tableLayout: 'fixed' }}>
                        <thead>
                            <tr>
                                <th style={{ color: '#f7d51d', width: '30%' }}>時間</th>
                                <th style={{ color: '#f7d51d', width: '20%' }}>人員</th>
                                <th style={{ color: '#f7d51d' }}>動作</th>
                                <th style={{ color: '#f7d51d', width: '12%' }}>料號</th>
                                <th style={{ color: '#f7d51d', width: '10%' }}>異動</th>
                                <th style={{ color: '#f7d51d', width: '10%' }}>餘額</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ color: '#fff' }}>LOADING...</td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan="6" style={{ color: '#fff' }}>NO LOGS</td></tr>
                            ) : (
                                logs.map((log, index) => (
                                    <tr key={index}>
                                        <td style={{ color: '#fff', wordBreak: 'break-all', lineHeight: '1.2' }}>
                                            {log.timestamp.replace('T', ' ').substring(5, 19)}
                                        </td>
                                        <td style={{ color: '#fff' }}>
                                            {String(log.employeeId).split('.')[0]}
                                        </td>
                                        <td style={{ padding: '2px' }}>
                                            <span className={
                                                log.action === 'CHECK_IN' ? 'nes-text is-success' :
                                                    log.action === 'CHECK_OUT' ? 'nes-text is-warning' :
                                                        'nes-text is-primary'
                                            } style={{ fontSize: '0.6rem' }}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td style={{ color: '#fff' }}>{log.partNumber}</td>
                                        <td style={{ color: '#fff' }}>
                                            {Number(log.changeAmount) > 0 ? '+' : ''}{log.changeAmount}
                                        </td>
                                        <td style={{ color: '#fff' }}>{log.balance}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

LogsModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    logs: PropTypes.array.isRequired,
    loading: PropTypes.bool
};

export default LogsModal;
