import axios from 'axios';

const API_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

// Mock Data State (In-memory for simulation)
let mockInventory = [
    { partNumber: 'MOCK-001', name: 'Flux Capacitor', spec: '1.21 GW', location: 'A-01', quantity: 10, imageSeed: 'flux' },
    { partNumber: 'MOCK-002', name: 'Fusion Cell', spec: 'Mk I', location: 'B-02', quantity: 2, imageSeed: 'fusion' },
    { partNumber: 'MOCK-003', name: 'Power Node', spec: 'v5', location: 'C-03', quantity: 0, imageSeed: 'node' },
    { partNumber: 'MOCK-004', name: 'Steam Valve', spec: 'Iron', location: 'D-04', quantity: 15, imageSeed: 'valve' },
];

// GAS Web Apps often behave better with fetch or axios without complex headers
// sending as text/plain prevents preflight in some cases, but 'Anyone' access usually handles CORS.
// We will send data as JSON string in body.

export const getInventory = async () => {
    if (!API_URL) {
        console.warn("VITE_GOOGLE_SCRIPT_URL not set. Using Mock Data.");
        return new Promise(resolve => setTimeout(() => resolve({
            status: 'success',
            data: [...mockInventory]
        }), 800));
    }

    try {
        // Add timestamp to prevent caching
        const response = await axios.get(`${API_URL}?t=${new Date().getTime()}`);
        return response.data;
    } catch (error) {
        console.error("API Fetch Error", error);
        throw error;
    }
};

export const updateStock = async (payload) => {
    // payload: { action: 'CHECK_IN'|'CHECK_OUT', employeeId, partNumber, changeAmount }
    if (!API_URL) {
        console.log('Mock Update:', payload);
        // Update local mock data
        mockInventory = mockInventory.map(item => {
            if (item.partNumber === payload.partNumber) {
                return { ...item, quantity: item.quantity + payload.changeAmount };
            }
            return item;
        });

        const updatedItem = mockInventory.find(i => i.partNumber === payload.partNumber);

        return new Promise(resolve => setTimeout(() => resolve({
            status: 'success',
            newQuantity: updatedItem ? updatedItem.quantity : 0
        }), 500));
    }

    try {
        // Send as POST. For GAS, we might need to send simple content.
        // axios default Content-Type is application/json
        const response = await axios.post(API_URL, JSON.stringify(payload), {
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            }
        });
        return response.data;
    } catch (error) {
        console.error("API Update Error", error);
        throw error;
    }
};

export const addItem = async (newItemData) => {
    // newItemData: { partNumber, name, spec, location, quantity }
    if (!API_URL) {
        console.log('Mock Add Item:', newItemData);
        mockInventory.push({
            ...newItemData,
            imageSeed: newItemData.partNumber.toLowerCase()
        });

        return new Promise(resolve => setTimeout(() => resolve({
            status: 'success',
            message: 'Mock item created'
        }), 500));
    }

    try {
        const payload = {
            action: 'ADD_ITEM',
            employeeId: localStorage.getItem('EMPLOYEE_ID') || 'UNKNOWN',
            newItemData: newItemData
        };

        const response = await axios.post(API_URL, JSON.stringify(payload), {
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        });

        console.log("ADD_ITEM Response:", response.data); // DEBUG LOG

        return response.data;
    } catch (error) {
        console.error("API Add Item Error", error);
        if (error.response) console.error("Error Body:", error.response.data); // DEBUG LOG
        throw error;
    }
};

export const getLogs = async () => {
    if (!API_URL) {
        console.log('Mock Get Logs');
        // Mock Logs
        return new Promise(resolve => setTimeout(() => resolve({
            status: 'success',
            data: [
                { timestamp: new Date(), employeeId: 'MOCK_USER', action: 'CHECK_IN', partNumber: 'MOCK-001', changeAmount: 5, balance: 15 },
                { timestamp: new Date(Date.now() - 100000), employeeId: 'MOCK_USER', action: 'CHECK_OUT', partNumber: 'MOCK-002', changeAmount: -1, balance: 1 }
            ]
        }), 800));
    }

    try {
        const response = await axios.get(`${API_URL}?type=logs&t=${new Date().getTime()}`);
        return response.data;
    } catch (error) {
        console.error("API Get Logs Error", error);
        throw error;
    }
};

export const logLogin = async (employeeId) => {
    if (!API_URL) return; // Mock mode ignore

    try {
        await axios.post(API_URL, JSON.stringify({
            action: 'LOGIN',
            employeeId: employeeId
        }), {
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        });
    } catch (error) {
        console.error("Login Log Error", error);
    }
};
