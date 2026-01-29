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

            // [NEW] Validation: Prevent taking more than available stock
            // Taking means newAmount is negative.
            if (newAmount < 0 && Math.abs(newAmount) > item.quantity) {
                playError(); // Use existing playError
                // We can't use showMessage easily inside set state callback effectively without side effects
                // But since we are inside a hook, we can do it before setting state if we calculate first.
                // However, 'prev' is only available inside set state or we must depend on cartItems dependency.
                // To keep it clean, we'll check it inside, returns prev unchanged, and trigger side effect outside?
                // Actually, let's restructure: calculate outside set state if possible.
                // But currentAmount depends on prev.

                // Let's rely on the fact validation failure returns 'prev' (no change).
                // We'll move the side-effect (sound/alert) to a useEffect or trigger it via a helper?
                // Better: Check state *before* calling setCartItems? 
                // We need access to current cart state. `cartItems` is available in scope!
                return prev;
            }

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

        // This playSort will play even if validation failed inside setState (if we don't move validation out).
        // Let's rewrite slightly to access state processing properly.
    };

    // Refactored addToCart to handle validation cleanly
    const addToCartSafe = (item, amount) => {
        // Access current state directly from the variable in scope
        const currentEntry = cartItems[item.partNumber];
        const currentAmount = currentEntry ? currentEntry.changeAmount : 0;
        const newAmount = currentAmount + amount;

        // Validation
        if (newAmount < 0 && Math.abs(newAmount) > item.quantity) {
            playError();
            if (showMessage) showMessage("NOT ENOUGH STOCK!", "error");
            return;
        }

        setCartItems(prev => {
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

    const totalItems = useMemo(() => {
        return Object.values(cartItems).reduce((acc, curr) => acc + Math.abs(curr.changeAmount), 0);
    }, [cartItems]);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart: addToCartSafe,
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
