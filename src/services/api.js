import { useGame } from '../context/GameContext'; // Not used here directly, but consistent imports

const API_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;

/**
 * Robust fetch wrapper with timeout
 */
const fetchWithTimeout = async (url, options = {}, timeout = 5000) => { // Timeout reduced to 5s
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        if (error.name === 'AbortError') {
            throw new Error('Connection timed out (5s)');
        }
        throw error;
    }
};

export const getInventory = async () => {
    if (!API_URL) {
        console.error("VITE_GOOGLE_SCRIPT_URL is not set!");
        throw new Error("Configuration Error: API URL missing");
    }

    try {
        console.log("Fetching Inventory from:", API_URL);
        const response = await fetchWithTimeout(`${API_URL}?t=${new Date().getTime()}`);

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const text = await response.text();
        try {
            return JSON.parse(text);
        } catch (e) {
            throw new Error("Server returned invalid JSON");
        }
    } catch (error) {
        console.error("API Fetch Failed:", error);
        throw error;
    }
};

export const updateStock = async (payload) => {
    if (!API_URL) throw new Error("API URL missing");

    try {
        const response = await fetchWithTimeout(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("API Update Failed", error);
        throw error;
    }
};

export const addItem = async (newItemData) => {
    if (!API_URL) throw new Error("API URL missing");

    try {
        const payload = {
            action: 'ADD_ITEM',
            employeeId: localStorage.getItem('EMPLOYEE_ID') || 'UNKNOWN',
            newItemData: newItemData
        };

        const response = await fetchWithTimeout(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("API Add Item Error:", error);
        throw error;
    }
};

export const getLogs = async () => {
    if (!API_URL) throw new Error("API URL missing");

    try {
        const response = await fetchWithTimeout(`${API_URL}?type=logs&t=${new Date().getTime()}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("API Get Logs Error", error);
        throw error;
    }
};

export const logLogin = async (employeeId) => {
    if (!API_URL) return;
    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: 'LOGIN', employeeId: employeeId })
        });
    } catch (error) {
        console.error("Login Log Error", error);
    }
};

export const checkUser = async (employeeId) => {
    if (!API_URL) throw new Error("API URL missing");

    try {
        const response = await fetchWithTimeout(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: 'CHECK_USER', employeeId: employeeId })
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Check User Error:", error);
        throw error;
    }
};
