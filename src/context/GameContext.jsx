import { createContext, useState, useContext } from 'react';
import PropTypes from 'prop-types';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
    const [employeeId, setEmployeeId] = useState(localStorage.getItem('EMPLOYEE_ID') || null);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const login = (id) => {
        setEmployeeId(id);
        localStorage.setItem('EMPLOYEE_ID', id);
    };

    const logout = () => {
        setEmployeeId(null);
        localStorage.removeItem('EMPLOYEE_ID');
    };

    const showMessage = (text, type = 'normal') => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 3000);
    };

    return (
        <GameContext.Provider value={{
            employeeId,
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
