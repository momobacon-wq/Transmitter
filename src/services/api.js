// Local Storage Keys
const STORAGE_KEYS = {
    INVENTORY: 'app_inventory_data',
    LOGS: 'app_transaction_logs',
};

// Initial Default Data (Simulating a fresh install)
const DEFAULT_INVENTORY = [
    { partNumber: 'MOCK-001', name: 'Flux Capacitor', brand: 'Dr. Brown Ent.', spec: '1.21 GW', location: 'A-01', quantity: 10, imageSeed: 'flux' },
    { partNumber: 'MOCK-002', name: 'Fusion Cell', brand: 'Vault-Tec', spec: 'Mk I', location: 'B-02', quantity: 2, imageSeed: 'fusion' },
    { partNumber: 'MOCK-003', name: 'Power Node', brand: 'CEC', spec: 'v5', location: 'C-03', quantity: 0, imageSeed: 'node' },
    { partNumber: 'MOCK-004', name: 'Steam Valve', brand: 'Valve Corp', spec: 'Iron', location: 'D-04', quantity: 15, imageSeed: 'valve' },
];

/**
 * Helper to get data from LocalStorage with default fallback
 */
const getStoredData = (key, defaultValue) => {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    try {
        return JSON.parse(stored);
    } catch (e) {
        console.error(`Error parsing ${key} from localStorage`, e);
        return defaultValue;
    }
};

/**
 * Helper to save data to LocalStorage
 */
const setStoredData = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
};

// Initialize logs if empty
if (!localStorage.getItem(STORAGE_KEYS.LOGS)) {
    setStoredData(STORAGE_KEYS.LOGS, []);
}
// Initialize inventory if empty (optional, or we can just return defaults if null)
if (!localStorage.getItem(STORAGE_KEYS.INVENTORY)) {
    setStoredData(STORAGE_KEYS.INVENTORY, DEFAULT_INVENTORY);
}

export const getInventory = async () => {
    console.log("Fetching Inventory from LocalStorage...");
    // Simulate network delay for realism
    return new Promise(resolve => {
        setTimeout(() => {
            const data = getStoredData(STORAGE_KEYS.INVENTORY, DEFAULT_INVENTORY);
            resolve({
                status: 'success',
                data: data
            });
        }, 300);
    });
};

export const updateStock = async (payload) => {
    // payload: { action: 'CHECK_IN'|'CHECK_OUT', employeeId, partNumber, changeAmount }
    console.log('Update Stock (Local):', payload);

    return new Promise(resolve => {
        setTimeout(() => {
            const currentInventory = getStoredData(STORAGE_KEYS.INVENTORY, DEFAULT_INVENTORY);
            let newQty = 0;

            const updatedInventory = currentInventory.map(item => {
                if (item.partNumber === payload.partNumber) {
                    newQty = item.quantity + payload.changeAmount;
                    // Prevent negative stock
                    if (newQty < 0) newQty = 0;
                    return { ...item, quantity: newQty };
                }
                return item;
            });

            setStoredData(STORAGE_KEYS.INVENTORY, updatedInventory);

            // Log the transaction
            const logs = getStoredData(STORAGE_KEYS.LOGS, []);
            const newLog = {
                timestamp: new Date().toISOString(),
                employeeId: payload.employeeId,
                action: payload.action,
                partNumber: payload.partNumber,
                changeAmount: payload.changeAmount,
                balance: newQty
            };
            // Keep logs reasonable size? Maybe limit to last 100?
            const updatedLogs = [newLog, ...logs].slice(0, 200);
            setStoredData(STORAGE_KEYS.LOGS, updatedLogs);

            resolve({
                status: 'success',
                newQuantity: newQty
            });
        }, 300);
    });
};

export const addItem = async (newItemData) => {
    // newItemData: { partNumber, name, spec, location, quantity }
    console.log('Add Item (Local):', newItemData);

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const currentInventory = getStoredData(STORAGE_KEYS.INVENTORY, DEFAULT_INVENTORY);

            // Validation: Check if Part Number exists
            if (currentInventory.some(i => i.partNumber === newItemData.partNumber)) {
                reject(new Error("Part Number already exists"));
                return;
            }

            const newItem = {
                ...newItemData,
                imageSeed: newItemData.partNumber.toLowerCase() // Generate seed from ID
            };

            const updatedInventory = [...currentInventory, newItem];
            setStoredData(STORAGE_KEYS.INVENTORY, updatedInventory);

            resolve({
                status: 'success',
                message: 'Item created locally'
            });
        }, 300);
    });
};

export const getLogs = async () => {
    console.log('Fetching Logs from LocalStorage...');
    return new Promise(resolve => {
        setTimeout(() => {
            const logs = getStoredData(STORAGE_KEYS.LOGS, []);
            resolve({
                status: 'success',
                data: logs
            });
        }, 300);
    });
};

export const logLogin = async (employeeId) => {
    console.log(`User ${employeeId} logged in (Local Log)`);
    // Ideally we log this too, but for now just console
};
