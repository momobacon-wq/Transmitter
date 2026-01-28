import { createContext, useState, useContext } from 'react';
import PropTypes from 'prop-types';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
    const [employeeId, setEmployeeId] = useState(localStorage.getItem('EMPLOYEE_ID') || null);
    const [employeeName, setEmployeeName] = useState(localStorage.getItem('EMPLOYEE_NAME') || null); // [NEW]
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const login = (id, name = '') => {
        setEmployeeId(id);
        setEmployeeName(name); // [NEW]
        localStorage.setItem('EMPLOYEE_ID', id);
        if (name) localStorage.setItem('EMPLOYEE_NAME', name); // [NEW]
    };

    const logout = () => {
        setEmployeeId(null);
        setEmployeeName(null);
        localStorage.removeItem('EMPLOYEE_ID');
        localStorage.removeItem('EMPLOYEE_NAME');
    };

    const showMessage = (text, type = 'normal') => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 3000);
    };

    return (
        <GameContext.Provider value={{
            employeeId,
            employeeName, // [NEW]
            login,
            logout,
            inventory,
            setInventory,
            loading,
            setLoading,
            message,
            showMessage
        }}>
            {children}
        </GameContext.Provider>
    );
};

GameProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
