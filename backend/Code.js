/**
 * Power Plant Material Management System - Backend Script
 * 
 * INSTRUCTIONS:
 * 1. Open your Google Sheet.
 * 2. In "Inventory" sheet, Insert a new column after "Name" (Column B).
 * 3. Name the new Column C "Brand".
 * 4. Ensure header row is: [PartNumber, Name, Brand, Spec, Location, Quantity]
 *    (You can delete the old ImageSeed column if you want)
 * 5. Tools > Script editor.
 * 6. Replace ALL code with this new version.
 * 7. Deploy > New Deployment > Web App (Version: New, Desc: "v2 Brand Update").
 * 8. Copy the URL (it should be same if you update properly, but re-copy to be safe).
 */

function doGet(e) {
    const lock = LockService.getScriptLock();
    lock.tryLock(10000);

    try {
        const type = e.parameter.type || 'inventory';
        const doc = SpreadsheetApp.getActiveSpreadsheet();

        if (type === 'logs') {
            const sheet = doc.getSheetByName("Logs");
            // Get top 50 logs (excluding header row 1, so start at row 2)
            const lastRow = sheet.getLastRow();
            if (lastRow < 2) {
                return ContentService.createTextOutput(JSON.stringify({
                    status: "success",
                    data: []
                })).setMimeType(ContentService.MimeType.JSON);
            }

            const numRows = Math.min(lastRow - 1, 50);
            const data = sheet.getRange(2, 1, numRows, 6).getValues();

            const logs = data.map(row => ({
                timestamp: row[0],
                employeeId: row[1],
                action: row[2],
                partNumber: row[3],
                changeAmount: row[4],
                balance: row[5]
            }));

            return ContentService.createTextOutput(JSON.stringify({
                status: "success",
                data: logs
            })).setMimeType(ContentService.MimeType.JSON);
        }

        const sheet = doc.getSheetByName("Inventory");

        // Get all data
        const data = sheet.getDataRange().getValues();
        const headers = data[0];
        const rows = data.slice(1);

        // Map data to JSON objects
        // Expected Columns: [PartNumber, Name, Brand, Spec, Location, Quantity]
        const inventory = rows.map(row => {
            return {
                partNumber: row[0],
                name: row[1],
                brand: row[2], // Brand
                spec: row[3],
                location: row[4],
                quantity: row[5]
            };
        });

        return ContentService.createTextOutput(JSON.stringify({
            status: "success",
            data: inventory
        })).setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
            status: "error",
            message: error.toString()
        })).setMimeType(ContentService.MimeType.JSON);

    } finally {
        lock.releaseLock();
    }
}

function doPost(e) {
    const lock = LockService.getScriptLock();
    lock.tryLock(10000);

    try {
        const postData = JSON.parse(e.postData.contents);
        const { action, employeeId, partNumber, changeAmount, newItemData } = postData;

        const doc = SpreadsheetApp.getActiveSpreadsheet();
        const inventorySheet = doc.getSheetByName("Inventory");
        const logsSheet = doc.getSheetByName("Logs");

        // === HANDLE LOGIN LOG ===
        if (action === "LOGIN") {
            logsSheet.insertRowBefore(2);
            logsSheet.getRange(2, 1, 1, 6).setValues([[
                new Date(),
                employeeId,
                "LOGIN",
                "-", // PartNumber
                "-", // ChangeAmount
                "-"  // Balance
            ]]);
            return ContentService.createTextOutput(JSON.stringify({
                status: "success"
            })).setMimeType(ContentService.MimeType.JSON);
        }

        // === HANDLE ADD ITEM ===
        if (action === "ADD_ITEM") {
            // newItemData: { partNumber, name, brand, spec, location, quantity }

            // 1. Check duplicate
            const data = inventorySheet.getDataRange().getValues();
            for (let i = 1; i < data.length; i++) {
                if (data[i][0] == newItemData.partNumber) {
                    throw new Error("Part Number already exists: " + newItemData.partNumber);
                }
            }

            // 2. Append to Inventory
            // [PartNumber, Name, Brand, Spec, Location, Quantity]
            inventorySheet.appendRow([
                newItemData.partNumber,
                newItemData.name,
                newItemData.brand || '', // Brand (allow empty)
                newItemData.spec,
                newItemData.location,
                newItemData.quantity
            ]);

            // 3. Log
            logsSheet.insertRowBefore(2);
            logsSheet.getRange(2, 1, 1, 6).setValues([[
                new Date(),
                employeeId,
                "CREATE",
                newItemData.partNumber,
                newItemData.quantity,
                newItemData.quantity
            ]]);

            return ContentService.createTextOutput(JSON.stringify({
                status: "success",
                message: "Item created successfully"
            })).setMimeType(ContentService.MimeType.JSON);
        }

        // === HANDLE STOCK UPDATE (CHECK_IN/OUT) ===

        // 1. Find the item
        const data = inventorySheet.getDataRange().getValues();
        // Assuming PartNumber is in column A (index 0)
        let rowIndex = -1;
        let currentQty = 0;

        // Find row (start from 1 to skip header)
        for (let i = 1; i < data.length; i++) {
            if (data[i][0] == partNumber) {
                rowIndex = i;
                // Quantity is now in Column 6 (index 5)
                currentQty = parseInt(data[i][5]) || 0;
                break;
            }
        }

        if (rowIndex === -1) {
            throw new Error("Item not found: " + partNumber);
        }

        // 2. Validate move
        const newQty = currentQty + parseInt(changeAmount);

        if (newQty < 0) {
            throw new Error("Insufficient stock. Current: " + currentQty);
        }

        // 3. Update Inventory (Row index is 0-based, so +1 for Sheet's 1-based index)
        // Quantity is 6th column (index 5 -> column 6)
        inventorySheet.getRange(rowIndex + 1, 6).setValue(newQty);

        // 4. Log Transaction
        logsSheet.insertRowBefore(2);
        logsSheet.getRange(2, 1, 1, 6).setValues([[
            new Date(),
            employeeId,
            action, // "CHECK_IN" or "CHECK_OUT"
            partNumber,
            changeAmount,
            newQty
        ]]);

        return ContentService.createTextOutput(JSON.stringify({
            status: "success",
            newQuantity: newQty,
            message: "Transaction successful"
        })).setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService.createTextOutput(JSON.stringify({
            status: "error",
            message: error.toString(),
            stack: error.stack
        })).setMimeType(ContentService.MimeType.JSON);

    } finally {
        lock.releaseLock();
    }
}

function setup() {
    const doc = SpreadsheetApp.getActiveSpreadsheet();

    if (!doc.getSheetByName("Inventory")) {
        const s = doc.insertSheet("Inventory");
        s.appendRow(["PartNumber", "Name", "Brand", "Spec", "Location", "Quantity"]);
        s.appendRow(["P-001", "Core Control Chip", "Intel", "v2.4", "A-01", 10]);
    }

    if (!doc.getSheetByName("Logs")) {
        const s = doc.insertSheet("Logs");
        s.appendRow(["Timestamp", "EmployeeID", "ActionType", "PartNumber", "ChangeAmount", "Balance"]);
    }
}
