import PropTypes from 'prop-types';

const ItemCard = ({ item, onAction }) => {
    const { partNumber, name, spec, location, quantity, imageSeed } = item;

    const lowStockThreshold = import.meta.env.VITE_LOW_STOCK_THRESHOLD || 5;
    const isLowStock = quantity <= lowStockThreshold;
    const isOut = quantity === 0;

    const imageUrl = `https://api.dicebear.com/9.x/bottts/svg?seed=${imageSeed || partNumber}`;

    // Card Border: Green (Normal) vs Red (Low Stock)
    // Always keep 'is-dark' to match theme, append 'is-error' for red border if needed
    const containerClass = `nes-container is-rounded with-title is-dark ${isLowStock ? 'is-error' : ''}`;
    const statusText = isOut ? 'EMPTY' : (isLowStock ? 'CRITICAL' : 'READY');

    return (
        <div className={containerClass} style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column' }}>
            <p className="title" style={{ fontSize: '0.9rem', backgroundColor: '#212529', color: '#fff' }}>
                <span style={{ fontSize: '1.2em', marginRight: '5px' }}>物料</span> {partNumber}
            </p>

            <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flexShrink: 0 }}>
                    <img src={imageUrl} alt={name} style={{ width: '64px', height: '64px', imageRendering: 'pixelated', border: '2px solid #fff' }} />
                </div>

                <div style={{ flexGrow: 1 }}>
                    <div style={{ marginBottom: '0.4rem', fontSize: '1rem', color: '#fff', display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: '8px', fontFamily: "'Press Start 2P', monospace" }}>名稱:</span>
                        <span style={{ fontSize: '1rem', fontFamily: "'Press Start 2P', monospace" }}>{name}</span>
                    </div>
                    <div style={{ marginBottom: '0.4rem', fontSize: '1rem', color: '#fff', display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: '8px', fontFamily: "'Press Start 2P', monospace" }}>規格:</span>
                        <span style={{ fontSize: '1rem', fontFamily: "'Press Start 2P', monospace" }}>{spec}</span>
                    </div>
                    <div style={{ marginBottom: '0.4rem', fontSize: '1rem', color: '#fff', display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: '8px', fontFamily: "'Press Start 2P', monospace" }}>位置:</span>
                        <span style={{ fontSize: '1rem', fontFamily: "'Press Start 2P', monospace" }}>{location}</span>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '1rem', borderTop: '2px dashed #fff', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <span style={{ display: 'block', fontSize: '0.9rem' }}>
                        <span style={{ fontSize: '1.2em' }}>數量</span>:
                    </span>
                    <span style={{ fontSize: '1.2rem', color: isLowStock ? '#e76e55' : '#92cc41' }}>
                        {quantity}
                    </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        className={`nes-btn ${quantity <= 0 ? 'is-disabled' : 'is-warning'}`}
                        onClick={() => onAction('CHECK_OUT', item)}
                        disabled={quantity <= 0}
                        style={{ padding: '0 10px' }}
                    >
                        -
                    </button>
                    <button
                        className="nes-btn is-primary"
                        onClick={() => onAction('CHECK_IN', item)}
                        style={{ padding: '0 10px' }}
                    >
                        +
                    </button>
                </div>
            </div>
        </div>
    );
};

ItemCard.propTypes = {
    item: PropTypes.object.isRequired,
    onAction: PropTypes.func.isRequired
};

export default ItemCard;
