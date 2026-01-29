import React from 'react';
import PropTypes from 'prop-types';
import { useCart } from '../context/CartContext';
import { useSound } from '../context/SoundContext';

const CartModal = ({ isOpen, onClose, onRefresh }) => {
    const { cartItems, submitCart, clearCart } = useCart();
    const { playClick, playUIClose, playWarning } = useSound();
    const [submitting, setSubmitting] = React.useState(false);

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
        playWarning();
        if (confirm("Clear all pending items?")) {
            clearCart();
            onClose();
        }
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
                                            {entry.changeAmount > 0 ? '+' : ''}{entry.changeAmount}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button className="nes-btn is-error" onClick={handleClear} disabled={items.length === 0 || submitting}>
                        CLEAR
                    </button>
                    <button className="nes-btn" onClick={() => { playUIClose(); onClose(); }} disabled={submitting}>
                        CANCEL
                    </button>
                    <button className={`nes-btn ${submitting ? 'is-disabled' : 'is-success'}`} onClick={handleConfirm} disabled={items.length === 0 || submitting}>
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
