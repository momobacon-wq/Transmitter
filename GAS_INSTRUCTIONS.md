# Google Apps Script Update Guide (Whitelist Login)

To enable user verification, you need to update your Google Apps Script code.

## 1. Create "Users" Sheet
1. Open your Google Sheet.
2. Create a new tab named **`Users`**.
3. In cell **A1**, type `EmployeeID`.
4. In cell **B1**, type `Name` (Optional).
5. Add allowed IDs in column A (e.g., `BACON`, `USER001`).

## 2. Update Script Code
Replace your `doPost` (or add to it) with the following logic:

```javascript
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    var params = JSON.parse(e.postData.contents);
    var action = params.action;
    
    // --- NEW: CHECK_USER Action ---
    if (action === "CHECK_USER") {
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Users");
      if (!sheet) return ContentService.createTextOutput(JSON.stringify({status: "error", message: "Users sheet missing"}));
      
      var idToCheck = params.employeeId.toString().toUpperCase().trim();
      var data = sheet.getDataRange().getValues();
      var found = false;
      
      // Skip header row
      for (var i = 1; i < data.length; i++) {
        if (data[i][0].toString().toUpperCase().trim() === idToCheck) {
          found = true;
          break;
        }
      }
      
      if (found) {
         return ContentService.createTextOutput(JSON.stringify({status: "success", message: "User verified"}));
      } else {
         return ContentService.createTextOutput(JSON.stringify({status: "error", message: "User not found"}));
      }
    }
    // -----------------------------
    
    // ... (Your existing code for ADD_ITEM, CHECK_IN, CHECK_OUT, etc.)
    // Make sure your existing code is wrapped in similar blocks!
    
    // Example existing structure return:
    return ContentService.createTextOutput(JSON.stringify({status: "success", message: "Action processed"}));
    
  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({status: "error", message: e.toString()}));
  } finally {
    lock.releaseLock();
  }
}
```

## 3. Deploy
1. Click **Deploy** > **New Deployment**.
2. Select **Web app**.
3. Description: `Added User Check`.
4. Executes as: **Me**.
5. Who has access: **Anyone**.
6. Click **Deploy**.
7. (**Important**) If the URL changes, update your `.env` file. Usually, if you use "Manage Deployments" -> "Edit" -> "New Version", the URL stays the same.

Notify me when you have done this!
