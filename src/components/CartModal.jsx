import React from 'react';
import PropTypes from 'prop-types';
import { useCart } from '../context/CartContext';
import { useSound } from '../context/SoundContext';

const CartModal = ({ isOpen, onClose, onRefresh }) => {
    const { cartItems, submitCart, clearCart, addToCart } = useCart();
    const { playClick, playUIClose, playWarning } = useSound();
    const [submitting, setSubmitting] = React.useState(false);
    const [confirmClear, setConfirmClear] = React.useState(false);

    if (!isOpen) return null;

    const items = Object.values(cartItems);
    const totalChanges = items.reduce((acc, curr) => acc + Math.abs(curr.changeAmount), 0);

    const handleConfirm = async () => {
        playClick();
        if (items.length === 0) return;

        setSubmitting(true);
        const success = await submitCart();
        setSubmitting(false);

        if (success) {
            if (onRefresh) onRefresh();
            onClose();
        }
    };



    const handleClear = () => {
        if (!confirmClear) {
            playWarning();
            setConfirmClear(true);
            // Auto-reset confirmation after 3 seconds
            setTimeout(() => setConfirmClear(false), 3000);
            return;
        }

        // Confirmed
        playClick(); // Or playZap for destruction
        clearCart();
        onClose();
    };

    return (
        <div className="nes-dialog is-dark is-rounded" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.85)'
        }}>
            <div style={{
                backgroundColor: '#212529',
                padding: '20px',
                border: '4px solid #fff',
                maxWidth: '600px',
                width: '90%',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <h3 className="title">PENDING TRANSACTIONS</h3>

                <div style={{ flex: 1, overflowY: 'auto', margin: '20px 0', border: '2px dashed #666', padding: '10px' }}>
                    {items.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#666' }}>CART IS EMPTY</p>
                    ) : (
                        <table className="nes-table is-dark is-bordered" style={{ width: '100%' }}>
                            <thead>
                                <tr>
                                    <th>ITEM</th>
                                    <th>CHANGE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((entry) => (
                                    <tr key={entry.item.partNumber}>
                                        <td style={{ fontSize: '0.8rem' }}>
                                            {entry.item.name}<br />
                                            <span style={{ color: '#666' }}>{entry.item.partNumber}</span>
                                        </td>
                                        <td style={{
                                            color: entry.changeAmount > 0 ? '#92cc41' : '#e76e55',
                                            textAlign: 'center'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                                <button
                                                    className="nes-btn is-error"
                                                    style={{ padding: '0 5px', fontSize: '0.6rem' }}
                                                    onClick={() => {
                                                        // Standardized: [-] Button always subtracts 1.
                                                        // If Taking (-1), becomes -2 (Take More).
                                                        // If Returning (+1), becomes 0 (Return Less).
                                                        addToCart(entry.item, -1);
                                                        playClick();
                                                    }}
                                                >-</button>

                                                <span style={{ minWidth: '30px' }}>
                                                    {entry.changeAmount > 0 ? '+' : ''}{entry.changeAmount}
                                                </span>

                                                <button
                                                    className="nes-btn is-success"
                                                    style={{ padding: '0 5px', fontSize: '0.6rem' }}
                                                    onClick={() => {
                                                        // Standardized: [+] Button always adds 1.
                                                        // If Taking (-1), becomes 0 (Take Less).
                                                        // If Returning (+1), becomes +2 (Return More).
                                                        addToCart(entry.item, 1);
                                                        playClick();
                                                    }}
                                                >+</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                    <button className="nes-btn is-error" onClick={handleClear} disabled={items.length === 0 || submitting} style={{ flex: '1 1 auto', minWidth: '80px', fontSize: '0.8rem' }}>
                        {confirmClear ? 'REALLY?' : 'CLEAR'}
                    </button>
                    <button className="nes-btn" onClick={() => { playUIClose(); onClose(); }} disabled={submitting} style={{ flex: '1 1 auto', minWidth: '80px', fontSize: '0.8rem' }}>
                        CANCEL
                    </button>
                    <button className={`nes-btn ${submitting ? 'is-disabled' : 'is-success'}`} onClick={handleConfirm} disabled={items.length === 0 || submitting} style={{ flex: '1 1 100%', minWidth: '120px', fontSize: '0.9rem' }}>
                        {submitting ? 'PROCESSING...' : 'CONFIRM ALL'}
                    </button>
                </div>
            </div>
        </div>
    );
};

CartModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onRefresh: PropTypes.func
};

export default CartModal;
