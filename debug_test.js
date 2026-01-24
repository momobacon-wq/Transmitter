
import axios from 'axios';

const API_URL = "https://script.google.com/macros/s/AKfycbzZUb1Qkk2l_iRMBAsrHHEybQE5AuFdbvuYsKYYbE2fPAhnw8Et8CDt_X1z5YH_pWPQ9A/exec";

const test = async () => {
    const payload = {
        action: "ADD_ITEM",
        employeeId: "DEBUGGER",
        newItemData: {
            partNumber: "DEBUG-TEST-003",
            name: "Debug Item Node",
            spec: "Test",
            location: "X",
            quantity: 1
        }
    };

    try {
        console.log("Sending...");
        const response = await axios.post(API_URL, JSON.stringify(payload), {
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        });
        console.log("Response:", response.data);
    } catch (e) {
        console.error("Error:", e.message);
        if (e.response) console.log("Body:", e.response.data);
    }
}

test();
