import PropTypes from 'prop-types';

const SortModal = ({ isOpen, onClose, onSort, currentSort }) => {
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
            <div className="nes-dialog is-dark is-rounded" style={{ backgroundColor: '#212529', minWidth: '320px', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <p className="title" style={{ margin: 0 }}>排序設定</p>
                    <button className="nes-btn is-error" onClick={onClose} style={{ padding: '0 8px', fontSize: '0.8rem' }}>X</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <p style={{ marginBottom: '0.5rem', color: '#f7d51d' }}>依 數量 (Quantity) 排序</p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                className={`nes-btn ${currentSort.field === 'quantity' && currentSort.direction === 'desc' ? 'is-primary' : ''}`}
                                onClick={() => onSort('quantity', 'desc')}
                                style={{ fontSize: '0.7rem', flex: 1 }}
                            >大 → 小</button>
                            <button
                                className={`nes-btn ${currentSort.field === 'quantity' && currentSort.direction === 'asc' ? 'is-primary' : ''}`}
                                onClick={() => onSort('quantity', 'asc')}
                                style={{ fontSize: '0.7rem', flex: 1 }}
                            >小 → 大</button>
                        </div>
                    </div>

                    <div>
                        <p style={{ marginBottom: '0.5rem', color: '#f7d51d' }}>依 型號 (Model) 排序</p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                className={`nes-btn ${currentSort.field === 'partNumber' && currentSort.direction === 'desc' ? 'is-primary' : ''}`}
                                onClick={() => onSort('partNumber', 'desc')}
                                style={{ fontSize: '0.7rem', flex: 1 }}
                            >大 → 小</button>
                            <button
                                className={`nes-btn ${currentSort.field === 'partNumber' && currentSort.direction === 'asc' ? 'is-primary' : ''}`}
                                onClick={() => onSort('partNumber', 'asc')}
                                style={{ fontSize: '0.7rem', flex: 1 }}
                            >小 → 大</button>
                        </div>
                    </div>

                    <div>
                        <p style={{ marginBottom: '0.5rem', color: '#f7d51d' }}>依 廠牌 (Brand) 排序</p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                className={`nes-btn ${currentSort.field === 'brand' && currentSort.direction === 'desc' ? 'is-primary' : ''}`}
                                onClick={() => onSort('brand', 'desc')}
                                style={{ fontSize: '0.7rem', flex: 1 }}
                            >Z → A</button>
                            <button
                                className={`nes-btn ${currentSort.field === 'brand' && currentSort.direction === 'asc' ? 'is-primary' : ''}`}
                                onClick={() => onSort('brand', 'asc')}
                                style={{ fontSize: '0.7rem', flex: 1 }}
                            >A → Z</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

SortModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSort: PropTypes.func.isRequired,
    currentSort: PropTypes.object.isRequired
};

export default SortModal;
