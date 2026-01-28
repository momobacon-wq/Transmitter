# 🏭 發電廠物料管理系統 (8-bit Edition)

這是一個結合復古 8-bit 像素風格與現代 Web 技術的物料管理系統。前端使用 **React + Vite + NES.css** 建置，後端資料庫則直接串接 **Google Sheets** (透過 Google Apps Script)。

---

## 🚀 0. 自動化部署 (GitHub Pages)

本專案已內建 GitHub Actions 自動部署流程，請依照以下步驟設定：

1.  **上傳程式碼**：將本專案 push 到 GitHub Repository (`main` branch)。
2.  **設定 Variables & Secrets**：
    *   進入 GitHub Repo 的 **Settings** > **Secrets and variables** > **Actions**。
    *   在 **Secrets** 分頁點擊 `New repository secret`，新增：
        *   `VITE_GOOGLE_SCRIPT_URL`: 填入你的 GAS Web App URL。
    *   (選填) 在 **Variables** 分頁點擊 `New repository variable`，新增：
        *   `VITE_LOW_STOCK_THRESHOLD`: 設定低庫存閾值 (預設 5)。
        *   `VITE_REFRESH_INTERVAL`: 設定自動刷新毫秒數 (預設 30000)。
3.  **開啟 Pages 權限**：
    *   進入 **Settings** > **Pages**。
    *   在 **Build and deployment** > **Source** 選擇 **GitHub Actions**。
4.  **觸發部署**：
    *   不管是 Push 新程式碼，或是手動到 **Actions** 頁面觸發 `Deploy to GitHub Pages`，系統都會自動打包並發布。

---

## 💻 1. 前端安裝與執行 (Local Development)

### 安裝依賴
請確保電腦已安裝 [Node.js](https://nodejs.org/)，然後在專案根目錄執行：

```bash
npm install
```

### 啟動開發伺服器
```bash
npm run dev
```
啟動後，請開啟瀏覽器訪問顯示的網址 (通常是 `http://localhost:5173`)。

---

## � 搜尋功能說明 (Search Guide)

本系統支援強大的 **多條件搜尋** (Multi-term Search) 功能：

1.  **批次搜尋 (OR)**：使用 **逗號** (`,`, `，`) 分隔不同關鍵字，可一次查找多種物品。
    *   範例：`電阻, 電容`
    *   說明：會同時列出所有「電阻」**或**所有「電容」。
2.  **精確搜尋 (AND)**：使用 **空白** (` `) 分隔關鍵字，可縮小範圍。
    *   範例：`Sony 電視`
    *   說明：只會列出同時包含「Sony」**且**包含「電視」的項目。
3.  **混合使用**：
    *   範例：`Sony 電視, Samsung 手機`
    *   說明：找出 (Sony AND 電視) **OR** (Samsung AND 手機) 的所有結果。

---

## �📊 2. Google Sheets 資料庫建置 (Backend)

本系統需要兩個工作表 (Sheets) 來運作，請依照以下步驟建立：

1.  前往 [Google Sheets](https://sheets.google.com/) 建立一個新的試算表。
2.  將試算表命名為 `Power Plant Inventory` (或其他你喜歡的名字)。

### 工作表 A: `Inventory` (庫存清單)
請將第一個工作表重新命名為 `Inventory`，並在第一列 (Row 1) 設定以下標題：

| 欄位 (A1) | 欄位 (B1) | 欄位 (C1) | 欄位 (D1) | 欄位 (E1) | 欄位 (F1) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **PartNumber** | **Name** | **Spec** | **Location** | **Quantity** | **ImageSeed** |

*   **PartNumber**: 料號 (唯一識別碼，例如 `P-001`)
*   **Quantity**: 目前庫存數量 (數字)
*   **ImageSeed**: 用於生成機器人圖示的種子碼 (任意英數字，例如 `robot1`)

### 工作表 B: `Logs` (異動紀錄)
新增第二個工作表，命名為 `Logs`，並設定以下標題：

| 欄位 (A1) | 欄位 (B1) | 欄位 (C1) | 欄位 (D1) | 欄位 (E1) | 欄位 (F1) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Timestamp** | **EmployeeID** | **ActionType** | **PartNumber** | **ChangeAmount** | **Balance** |

---

## ⚙️ 3. Google Apps Script (GAS) 部署教學

這是連接前端與 Google Sheets 的橋樑。

1.  在剛剛建立的 Google Sheet 中，點擊上方選單的 **「擴充功能 (Extensions)」** > **「Apps Script」**。
2.  在開啟的編輯器中，將 `Code.gs` 的內容完全清空。
3.  複製本專案 `backend/Code.js` 檔案中的所有程式碼，貼上到編輯器中。
4.  點擊上方「磁片圖示」存檔。

### 部署為 Web App (關鍵步驟)

1.  點擊右上角的 **「部署 (Deploy)」** > **「新增部署 (New deployment)」**。
2.  點擊左側齒輪圖示，選擇 **「網頁應用程式 (Web app)」**。
3.  填寫設定：
    *   **說明 (Description)**: `v1` (隨意)
    *   **執行身分 (Execute as)**: **`我 (Me)`** (請務必選這個，代表用你的權限讀寫試算表)
    *   **誰可以存取 (Who has access)**: **`主權人 (Anyone)`** (這很重要，為了讓 React 前端能跨域呼叫)
4.  點擊 **「部署 (Deploy)」**。
5.  系統可能會要求授權，請點擊「核對權限」> 選擇你的帳號 > 進階 > **前往 (不安全)** > **允許**。
6.  部署成功後，畫面會顯示一串 **「網頁應用程式網址 (Web App URL)」** (以 `https://script.google.com/macros/s/...` 開頭)。
7.  **複製這串網址**。

---

## 🔗 4. 連接前後端

1.  回到本專案的程式碼資料夾。
2.  找到 `.env` 檔案 (如果只有 `.env.example` 請複製一份改名為 `.env`)。
3.  將剛剛複製的 GAS 網址貼上給 `VITE_GOOGLE_SCRIPT_URL`：

```ini
# .env 檔案範例
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/你的長長一串ID/exec

# 其他設定
VITE_LOW_STOCK_THRESHOLD=3  # 低於多少數量顯示紅色警告
VITE_REFRESH_INTERVAL=5000  # 自動刷新間隔 (毫秒)
```

4.  **重新啟動前端** (`Ctrl+C` 停止，再執行 `npm run dev`)。

現在，你在網頁上的任何領料/入庫操作，都會即時同步到你的 Google Sheets 了！🎉

---

## 📱 5. 手機版安裝 (Mobile App)

本系統支援 **PWA (Progressive Web App)** 技術，你可以將它安裝到手機桌面，享受全螢幕如同原生 App 的體驗！

### iOS (iPhone/iPad)
1. 使用 **Safari** 開啟本網頁。
2. 點擊下方的 **分享 (Share)** 按鈕 (方框向上箭頭圖示)。
3. 下滑選單，點擊 **「加入主畫面 (Add to Home Screen)」**。
4. 設定名稱後點擊「新增」，即可在桌面看到 App 圖示。

### Android
1. 使用 **Chrome** 開啟本網頁。
2. 點擊右上角的 **選單 (Menu)** 按鈕 (三點圖示)。
3. 點擊 **「安裝應用程式 (Install App)」** 或 **「加到主畫面」**。
4. 確認後即可在桌面看到 App 圖示。
