# Floor Planner 場地座位安排工具

互動式平面圖座位配置工具，可用於各類場地的活動座位規劃。
上傳場地底圖後，透過拖放方式快速配置桌椅位置。

## 功能

- 拖放式座位配置（IBM桌、電資學院桌、椅子等）
- 多選框選與批次操作
- 旋轉、複製、貼上
- 縮放平面圖
- 儲存/載入多組配置方案
- 匯出配置為 PNG 圖檔
- 匯入/匯出 JSON 備份

## 技術架構

- React 19 + TypeScript
- Vite 7
- react-draggable（拖放互動）
- html-to-image（圖檔匯出）

## 開發

```bash
npm install
npm run dev
```

