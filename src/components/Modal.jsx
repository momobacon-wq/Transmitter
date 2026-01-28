import PropTypes from 'prop-types';

const Modal = ({ isOpen, title, message, onConfirm, onCancel, showConfirm = true, showCancel = true, confirmText = 'Confirm', confirmClass = 'is-primary', cancelText = 'Cancel', children }) => {
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
            <div className="nes-dialog is-dark is-rounded" style={{ minWidth: '350px', backgroundColor: '#212529', padding: '1.5rem 2rem', maxWidth: '90%' }}>
                <form method="dialog">
                    <p className="title">{title}</p>
                    {message && <p>{message}</p>}

                    {/* Render Custom Content */}
                    <div style={{ marginTop: '1rem', width: '100%' }}>
                        {children}
                    </div>

                    <menu className="dialog-menu" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                        {showCancel && (
                            <button className="nes-btn" onClick={(e) => { e.preventDefault(); onCancel(); }}>
                                {cancelText}
                            </button>
                        )}
                        {showConfirm && (
                            <button className={`nes-btn ${confirmClass}`} onClick={(e) => { e.preventDefault(); onConfirm(); }}>
                                {confirmText}
                            </button>
                        )}
                    </menu>
                </form>
            </div>
        </div>
    );
};

Modal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    title: PropTypes.string,
    message: PropTypes.string,
    onConfirm: PropTypes.func,
    onCancel: PropTypes.func.isRequired,
    showConfirm: PropTypes.bool,
    showCancel: PropTypes.bool,
    confirmText: PropTypes.string,
    confirmClass: PropTypes.string,
    cancelText: PropTypes.string,
    children: PropTypes.node
};

export default Modal;
