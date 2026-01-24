import { useState } from 'react';
import PropTypes from 'prop-types';

const AddItemModal = ({ isOpen, onClose, onConfirm }) => {
    const [formData, setFormData] = useState({
        partNumber: '',
        name: '',
        spec: '',
        location: '',
        quantity: 0
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'quantity' ? parseInt(value) || 0 : value
        }));
    };

    const handleSubmit = () => {
        if (!formData.partNumber || !formData.name) {
            alert("Part Number and Name are required!");
            return;
        }
        onConfirm(formData);
        setFormData({ partNumber: '', name: '', spec: '', location: '', quantity: 0 }); // Reset
    };

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
            <div className="nes-dialog is-dark is-rounded" style={{ minWidth: '400px', backgroundColor: '#212529', padding: '1.5rem 2rem' }}>
                <p className="title">新增物料</p>

                <div className="nes-field" style={{ marginBottom: '1rem' }}>
                    <label htmlFor="partNumber" style={{ color: '#fff' }}>物料編號</label>
                    <input type="text" id="partNumber" name="partNumber" className="nes-input" value={formData.partNumber} onChange={handleChange} placeholder="例如: P-999" />
                </div>

                <div className="nes-field" style={{ marginBottom: '1rem' }}>
                    <label htmlFor="name" style={{ color: '#fff' }}>名稱</label>
                    <input type="text" id="name" name="name" className="nes-input" value={formData.name} onChange={handleChange} placeholder="例如: 超級引擎" />
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="nes-field" style={{ flex: 1 }}>
                        <label htmlFor="spec" style={{ color: '#fff' }}>規格</label>
                        <input type="text" id="spec" name="spec" className="nes-input" value={formData.spec} onChange={handleChange} />
                    </div>
                    <div className="nes-field" style={{ flex: 1 }}>
                        <label htmlFor="location" style={{ color: '#fff' }}>位置</label>
                        <input type="text" id="location" name="location" className="nes-input" value={formData.location} onChange={handleChange} />
                    </div>
                </div>

                <div className="nes-field" style={{ marginBottom: '2rem' }}>
                    <label htmlFor="quantity" style={{ color: '#fff' }}>初始數量</label>
                    <input type="number" id="quantity" name="quantity" className="nes-input" value={formData.quantity} onChange={handleChange} min="0" />
                </div>

                <menu className="dialog-menu" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button className="nes-btn" onClick={onClose}>取消</button>
                    <button className="nes-btn is-success" onClick={handleSubmit}>建立</button>
                </menu>
            </div>
        </div>
    );
};

AddItemModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
};

export default AddItemModal;
