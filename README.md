# 北京烤鴨料理遊戲

一款基於HTML5的互動教育遊戲，教授用戶北京烤鴨的完整製作流程。

## 專案結構

```
beijing-roast-duck-game/
├── index.html                 # 主HTML文件
├── README.md                  # 專案說明文件
├── css/
│   └── styles.css            # 遊戲樣式表
├── js/
│   ├── core/                 # 核心系統
│   │   ├── GameEngine.js     # 遊戲引擎
│   │   ├── Scene.js          # 場景基類和場景管理器
│   │   ├── AssetManager.js   # 資源管理器
│   │   ├── AudioManager.js   # 音效管理器
│   │   ├── ProgressManager.js # 進度管理器
│   │   └── UIManager.js      # UI管理器
│   ├── scenes/               # 遊戲場景
│   │   ├── WelcomeScene.js   # 歡迎場景
│   │   ├── SelectionScene.js # 選材場景
│   │   ├── ProcessingScene.js # 處理場景
│   │   ├── PreparationScene.js # 製胚場景
│   │   ├── DryingScene.js    # 晾胚場景
│   │   ├── RoastingScene.js  # 烤製場景
│   │   ├── SlicingScene.js   # 片鴨場景
│   │   └── CompletionScene.js # 完成場景
│   └── main.js               # 遊戲初始化
└── assets/                   # 遊戲資源
    ├── images/               # 圖片資源
    │   ├── backgrounds/      # 背景圖片 (800x600)
    │   ├── ui/              # UI元素 (按鈕120x40, 圖標32x32)
    │   ├── duck/            # 鴨子相關圖片 (200x200)
    │   └── tools/           # 工具器具圖片 (100x100)
    └── sounds/              # 音效資源
        ├── background_music.mp3
        ├── button_click.wav
        ├── success.wav
        ├── cooking.wav
        └── completion.wav
```

## 核心系統

### GameEngine (遊戲引擎)
- 負責遊戲的初始化、更新循環和渲染管理
- 管理所有子系統的協調工作
- 處理遊戲狀態和輸入事件

### Scene (場景系統)
- 場景基類提供統一的場景介面
- SceneManager負責場景切換和管理
- 支援場景資源的載入和清理

### AssetManager (資源管理)
- 支援圖片和音效的載入管理
- 內建佔位符系統，資源載入失敗時自動使用佔位符
- 預載入和懶載入機制

### AudioManager (音效管理)
- 背景音樂和音效的播放控制
- 音量控制和靜音功能
- 音效開關設定

### ProgressManager (進度管理)
- 遊戲進度的保存和載入
- LocalStorage持久化存儲
- 成就系統和統計資料

### UIManager (UI管理)
- UI元素的創建和管理
- 支援按鈕、標籤、進度條等基礎組件
- 事件處理和渲染

## 遊戲場景

1. **WelcomeScene** - 歡迎場景：遊戲介紹和開始
2. **SelectionScene** - 選材場景：選擇優質北京填鴨
3. **ProcessingScene** - 處理場景：鴨子的初步處理
4. **PreparationScene** - 製胚場景：關鍵的製胚步驟
5. **DryingScene** - 晾胚場景：風乾過程模擬
6. **RoastingScene** - 烤製場景：烤製過程控制
7. **SlicingScene** - 片鴨場景：片鴨技藝展示
8. **CompletionScene** - 完成場景：成果展示和總結

## 資源規範

### 圖片資源
- **背景圖片**: 800x600 像素，PNG或JPG格式
- **UI元素**: 按鈕120x40像素，圖標32x32像素，PNG格式（支援透明）
- **鴨子圖片**: 200x200 像素，PNG格式（支援透明）
- **工具圖片**: 100x100 像素，PNG格式（支援透明）

### 音效資源
- **背景音樂**: MP3格式，建議循環播放
- **音效**: WAV格式，短音效

## 技術特性

- **純HTML5技術**: 無需額外框架，相容性好
- **響應式設計**: 支援不同螢幕尺寸
- **繁體中文**: 完整的繁體中文介面
- **佔位符系統**: 資源載入失敗時自動降級
- **進度保存**: LocalStorage本地存儲
- **錯誤處理**: 完善的錯誤處理和恢復機制

## 開發狀態

目前已完成：
- ✅ 專案結構建立
- ✅ 核心系統架構
- ✅ 資源管理系統
- ✅ 佔位符系統
- ✅ 場景框架

待開發：
- 🔄 各場景的具體實作
- 🔄 迷你遊戲系統
- 🔄 教育內容整合
- 🔄 音效和動畫
- 🔄 測試和優化

## 使用方法

1. 在支援HTML5的現代瀏覽器中開啟 `index.html`
2. 遊戲會自動載入並初始化
3. 點擊「開始遊戲」按鈕開始體驗

## 瀏覽器支援

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 授權

本專案僅供教育和學習使用。