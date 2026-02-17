# GitHub Pages 部署設定指南

## ✅ 已完成的設定

1. ✅ 已建立 GitHub Actions workflow 檔案 (`.github/workflows/deploy.yml`)
2. ✅ Vite 設定已正確設定 `base: '/Floor-Planner/'`
3. ✅ Workflow 已推送到 GitHub

## 📋 需要手動完成的步驟

請按照以下步驟在 GitHub 網站上完成設定：

### 步驟 1：前往 GitHub Pages 設定頁面
🔗 https://github.com/peggylo/Floor-Planner/settings/pages

### 步驟 2：設定 Build and deployment
1. 找到 "Build and deployment" 區塊
2. 在 **Source** 下拉選單中，選擇 **"GitHub Actions"**
3. 儲存設定

### 步驟 3：等待部署完成
1. 前往 Actions 頁面：https://github.com/peggylo/Floor-Planner/actions
2. 查看 "Deploy to GitHub Pages" workflow 是否正在執行
3. 等待 workflow 完成（綠色勾勾）

### 步驟 4：訪問網站
部署完成後，您的網站將可在以下網址訪問：
🌐 https://peggylo.github.io/Floor-Planner/

---

## 🔧 Workflow 說明

這個 workflow 會在以下情況自動執行：
- 每次推送到 `main` 分支時
- 手動觸發（在 Actions 頁面點擊 "Run workflow"）

Workflow 流程：
1. 📦 安裝 Node.js 20
2. 📥 安裝專案依賴 (`npm ci`)
3. 🔨 建置專案 (`npm run build`)
4. 📤 上傳建置結果到 GitHub Pages
5. 🚀 自動部署

---

## ❗ 常見問題

### Q: 如果網站顯示 404？
- 確認 GitHub Pages 設定中的 Source 是 "GitHub Actions"
- 確認 workflow 已成功執行完成
- 等待 5-10 分鐘讓 GitHub Pages 完全部署

### Q: 如何查看部署狀態？
前往 Actions 頁面：https://github.com/peggylo/Floor-Planner/actions

### Q: 如何手動觸發部署？
1. 前往 Actions 頁面
2. 點擊左側 "Deploy to GitHub Pages"
3. 點擊右側 "Run workflow" 按鈕

---

## 📝 目前狀態

- ✅ Workflow 檔案已建立並推送
- ⏳ 等待 GitHub Pages 設定完成
- ⏳ 等待首次部署完成

**下一步：請依照上述步驟在 GitHub 網站上完成設定！**
