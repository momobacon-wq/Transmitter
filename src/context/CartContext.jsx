import { createContext, useState, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { batchTransaction } from '../services/api';
import { useGame } from './GameContext';
import { useSound } from './SoundContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState({}); // { partNumber: { item, changeAmount } }
    const { setInventory, showMessage } = useGame(); // Assuming GameContext provides showMessage
    const { playSuccess, playError, playSort } = useSound();

    const addToCart = (item, amount) => {
        setCartItems(prev => {
            const currentAmount = prev[item.partNumber]?.changeAmount || 0;
            const newAmount = currentAmount + amount;

            if (newAmount === 0) {
                const newState = { ...prev };
                delete newState[item.partNumber];
                return newState;
            }

            return {
                ...prev,
                [item.partNumber]: {
                    item,
                    changeAmount: newAmount
                }
            };
        });
        playSort();
    };

    const clearCart = () => {
        setCartItems({});
    };

    const submitCart = async () => {
        const itemsToSubmit = Object.values(cartItems).map(entry => ({
            partNumber: entry.item.partNumber,
            changeAmount: entry.changeAmount
        }));

        if (itemsToSubmit.length === 0) return;

        try {
            const res = await batchTransaction(itemsToSubmit);
            if (res.status === 'success') {
                playSuccess();
                showMessage("BATCH SUCCESS!", "success");
                clearCart();
                // Trigger inventory refresh (handled by parent usually, or we call setInventory if we fetch)
                // Ideally Inventory.jsx should listen to a success and refresh. 
                // For now, we rely on Inventory.jsx to fast-refresh or we can return true here.
                return true;
            } else {
                throw new Error(res.message);
            }
        } catch (error) {
            console.error(error);
            playError();
            showMessage("BATCH FAILED", "error");
            return false;
        }
    };

    const totalItems = useMemo(() => Object.keys(cartItems).length, [cartItems]);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            clearCart,
            submitCart,
            totalItems
        }}>
            {children}
        </CartContext.Provider>
    );
};

CartProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export default CartContext;
