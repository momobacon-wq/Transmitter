import PropTypes from 'prop-types';

const Modal = ({ isOpen, title, message, onConfirm, onCancel }) => {
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
            <div className="nes-dialog is-dark is-rounded" style={{ minWidth: '300px', backgroundColor: '#212529', padding: '1.5rem 2rem' }}>
                <form method="dialog">
                    <p className="title">{title}</p>
                    <p>{message}</p>
                    <menu className="dialog-menu" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                        <button className="nes-btn" onClick={(e) => { e.preventDefault(); onCancel(); }}>Cancel</button>
                        <button className="nes-btn is-primary" onClick={(e) => { e.preventDefault(); onConfirm(); }}>Confirm</button>
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
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

export default Modal;
