import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
    return (
        <GameProvider>
            <Router>
                <AppContent />
            </Router>
        </GameProvider>
    );
}

export default App;
