import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { GameProvider, useGame } from './context/GameContext';
import Login from './pages/Login';
import Inventory from './pages/Inventory';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { employeeId } = useGame();
    if (!employeeId) {
        return <Navigate to="/" replace />;
    }
    return children;
};

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
};

function AppContent() {
    return (
        <div className="container">
            <Routes>
                <Route path="/" element={<Login />} />
                <Route
                    path="/inventory"
                    element={
                        <ProtectedRoute>
                            <Inventory />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </div>
    );
}

import { SoundProvider } from './context/SoundContext';
import { CartProvider } from './context/CartContext';
import ScreensaverWrapper from './components/ScreensaverWrapper';

function App() {
    return (
        <GameProvider>
            <SoundProvider>
                <CartProvider>
                    <ScreensaverWrapper timeoutMs={120000}>
                        <div className="crt-overlay"></div>
                        <Router>
                            <div className="crt-container">
                                <AppContent />
                            </div>
                        </Router>
                    </ScreensaverWrapper>
                </CartProvider>
            </SoundProvider>
        </GameProvider>
    );
}

export default App;
