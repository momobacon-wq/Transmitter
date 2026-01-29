import { useCart } from '../context/CartContext';
import PropTypes from 'prop-types';

const ItemCard = ({ item, onAction }) => {
    const { partNumber, name, brand, spec, location, quantity } = item;

    // defined as quantity <= 1 per user request
    const isLowStock = quantity <= 1;
    // Card Border: Green (Normal) vs Red (Low Stock)
    // Always keep 'is-dark' to match theme, append 'is-error' for red border if needed
    const containerClass = `nes-container is-rounded is-dark ${isLowStock ? 'is-error' : ''}`;

    const { cartItems } = useCart();
    const cartItem = cartItems[partNumber];
    const pendingChange = cartItem ? cartItem.changeAmount : 0;

    return (
        <div className={containerClass} style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', position: 'relative' }}>

            {pendingChange !== 0 && (
                <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    backgroundColor: pendingChange > 0 ? '#92cc41' : '#e76e55',
                    color: '#fff',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    zIndex: 10,
                    boxShadow: '2px 2px 0px #000'
                }}>
                    {pendingChange > 0 ? '+' : ''}{pendingChange}
                </div>
            )}


            <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flexGrow: 1 }}>
                    <div style={{ marginBottom: '0.4rem', fontSize: '1rem', color: '#fff', display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: '8px', fontFamily: "'Press Start 2P', monospace" }}>型號:</span>
                        <span style={{ fontSize: '1rem', fontFamily: "'Press Start 2P', monospace" }}>{partNumber}</span>
                    </div>
                    <div style={{ marginBottom: '0.4rem', fontSize: '1rem', color: '#fff', display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: '8px', fontFamily: "'Press Start 2P', monospace" }}>廠牌:</span>
                        <span style={{ fontSize: '1rem', fontFamily: "'Press Start 2P', monospace" }}>{brand}</span>
                    </div>
                    <div style={{ marginBottom: '0.4rem', fontSize: '1rem', color: '#fff', display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: '8px', fontFamily: "'Press Start 2P', monospace" }}>通訊:</span>
                        <span style={{ fontSize: '1rem', fontFamily: "'Press Start 2P', monospace" }}>{name}</span>
                    </div>
                    <div style={{ marginBottom: '0.4rem', fontSize: '1rem', color: '#fff', display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: '8px', fontFamily: "'Press Start 2P', monospace" }}>位置:</span>
                        <span style={{ fontSize: '1rem', fontFamily: "'Press Start 2P', monospace" }}>{location}</span>
                    </div>
                    <div style={{ marginBottom: '0.4rem', fontSize: '1rem', color: '#fff', display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: '8px', fontFamily: "'Press Start 2P', monospace" }}>範圍:</span>
                        <span style={{ fontSize: '1rem', fontFamily: "'Press Start 2P', monospace" }}>{spec}</span>
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
                        className="nes-btn"
                        onClick={() => onAction('STATS', item)}
                        style={{ padding: '0 10px' }}
                        title="View Trends"
                    >
                        📈
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
