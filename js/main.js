/**
 * 遊戲主入口文件
 * 負責初始化和啟動北京烤鴨料理遊戲
 */

// 導入所有類別（使用相對路徑）
import './core/GameEngine.js';
import './core/Scene.js';
import './core/MiniGame.js';
import './core/AssetManager.js';
import './core/AudioManager.js';
import './core/ProgressManager.js';
import './core/UIManager.js';
import './core/VisualFeedback.js';
import './core/SceneTransitions.js';

// 導入場景
import './scenes/WelcomeScene.js';
import './scenes/SelectionScene.js';
import './scenes/ProcessingScene.js';
import './scenes/PreparationScene.js';
import './scenes/DryingScene.js';
import './scenes/RoastingScene.js';
import './scenes/SlicingScene.js';
import './scenes/CompletionScene.js';

// 導入迷你遊戲
import './scenes/DuckQualityGame.js';
import './scenes/WeightMeasurementGame.js';
import './scenes/FeatherRemovalGame.js';
import './scenes/OpeningCleaningGame.js';
import './scenes/InflationSupportGame.js';
import './scenes/ScaldingColoringGame.js';
import './scenes/HangingEnvironmentGame.js';
import './scenes/WaterInjectionGame.js';
import './scenes/TemperatureControlGame.js';
import './scenes/RotationTimingGame.js';
import './scenes/SkinSlicingGame.js';
import './scenes/MeatSlicingGame.js';
import './scenes/PlatingArrangementGame.js';

// 全域遊戲實例
let gameEngine = null;

/**
 * 遊戲初始化
 */
async function initializeGame() {
    try {
        console.log('開始初始化北京烤鴨料理遊戲...');
        
        // 檢查必要的類別是否存在
        console.log('檢查必要類別...');
        if (typeof GameEngine === 'undefined') {
            throw new Error('GameEngine 類別未定義');
        }
        if (typeof Scene === 'undefined') {
            throw new Error('Scene 類別未定義');
        }
        if (typeof WelcomeScene === 'undefined') {
            throw new Error('WelcomeScene 類別未定義');
        }
        console.log('所有必要類別檢查通過');
        
        // 創建遊戲引擎實例
        console.log('創建遊戲引擎實例...');
        gameEngine = new GameEngine();
        
        // 初始化遊戲引擎
        console.log('初始化遊戲引擎...');
        const initSuccess = await gameEngine.init();
        
        if (!initSuccess) {
            throw new Error('遊戲引擎初始化失敗');
        }
        console.log('遊戲引擎初始化成功');
        
        // 初始化場景管理器
        console.log('初始化場景管理器...');
        gameEngine.sceneManager.initializeScenes();
        console.log('場景管理器初始化完成');
        
        // 設置UI管理器的Canvas上下文
        console.log('設置UI管理器...');
        gameEngine.uiManager.setCanvas(gameEngine.canvas, gameEngine.context);
        console.log('UI管理器設置完成');
        
        // 預載入音效（可選，不阻塞初始化）
        console.log('開始預載入音效...');
        gameEngine.audioManager.preloadSounds().catch(error => {
            console.warn('音效預載入失敗，遊戲將以靜音模式運行:', error);
        });
        
        // 載入保存的遊戲進度
        console.log('載入遊戲進度...');
        gameEngine.loadGameProgress();
        console.log('遊戲進度載入完成');
        
        // 開始遊戲
        console.log('啟動遊戲...');
        gameEngine.start();
        
        console.log('遊戲初始化完成，開始運行！');
        
    } catch (error) {
        console.error('遊戲初始化失敗:', error);
        console.error('錯誤堆疊:', error.stack);
        showErrorMessage(`遊戲載入失敗: ${error.message}<br>請檢查瀏覽器控制台獲取詳細資訊。`);
    }
}

/**
 * 顯示錯誤訊息
 */
function showErrorMessage(message) {
    const gameContainer = document.getElementById('gameContainer');
    if (gameContainer) {
        gameContainer.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                width: 800px;
                height: 600px;
                background: #FFF8DC;
                border: 3px solid #654321;
                border-radius: 10px;
                font-family: 'Microsoft JhengHei', Arial, sans-serif;
            ">
                <h2 style="color: #8B4513; margin-bottom: 20px;">遊戲載入錯誤</h2>
                <p style="color: #654321; margin-bottom: 30px;">${message}</p>
                <button onclick="location.reload()" style="
                    background: linear-gradient(145deg, #FFD700, #FFA500);
                    border: 2px solid #FF8C00;
                    border-radius: 8px;
                    color: #8B4513;
                    font-weight: bold;
                    font-size: 16px;
                    padding: 10px 20px;
                    cursor: pointer;
                ">重新載入</button>
            </div>
        `;
    }
}

/**
 * 檢查瀏覽器相容性
 */
function checkBrowserCompatibility() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
        showErrorMessage('您的瀏覽器不支援HTML5 Canvas，請使用現代瀏覽器。');
        return false;
    }
    
    if (!window.localStorage) {
        console.warn('LocalStorage不可用，遊戲進度將無法保存');
    }
    
    if (!window.Audio) {
        console.warn('Audio API不可用，遊戲將無音效');
    }
    
    return true;
}

/**
 * 頁面載入完成後初始化遊戲
 */
function startGame() {
    console.log('開始載入遊戲...');
    
    // 檢查瀏覽器相容性
    if (!checkBrowserCompatibility()) {
        return;
    }
    
    // 添加載入畫面
    const gameContainer = document.getElementById('gameContainer');
    if (gameContainer) {
        gameContainer.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                width: 800px;
                height: 600px;
                background: linear-gradient(135deg, #FFF8DC 0%, #F5DEB3 100%);
                border: 3px solid #654321;
                border-radius: 10px;
                font-family: 'Microsoft JhengHei', Arial, sans-serif;
            ">
                <h1 style="color: #8B4513; margin-bottom: 30px;">北京烤鴨料理遊戲</h1>
                <div style="
                    width: 200px;
                    height: 20px;
                    background: #CCCCCC;
                    border-radius: 10px;
                    overflow: hidden;
                    margin-bottom: 20px;
                ">
                    <div id="loadingBar" style="
                        width: 0%;
                        height: 100%;
                        background: linear-gradient(90deg, #32CD32, #228B22);
                        transition: width 0.3s ease;
                    "></div>
                </div>
                <p style="color: #654321;">載入中...</p>
            </div>
        `;
    }
    
    // 模擬載入進度
    let progress = 0;
    const loadingBar = document.getElementById('loadingBar');
    const loadingInterval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadingInterval);
            
            // 載入完成後初始化遊戲
            setTimeout(() => {
                initializeGame();
            }, 500);
        }
        
        if (loadingBar) {
            loadingBar.style.width = progress + '%';
        }
    }, 200);
}

// 立即執行初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startGame);
} else {
    // DOM已經載入完成
    startGame();
}

/**
 * 頁面卸載時清理資源
 */
window.addEventListener('beforeunload', () => {
    if (gameEngine) {
        gameEngine.stop();
        gameEngine.audioManager.cleanup();
        console.log('遊戲資源已清理');
    }
});

/**
 * 處理頁面可見性變化（暫停/恢復遊戲）
 */
document.addEventListener('visibilitychange', () => {
    if (gameEngine) {
        if (document.hidden) {
            gameEngine.pause();
        } else {
            gameEngine.resume();
        }
    }
});

/**
 * 全域錯誤處理
 */
window.addEventListener('error', (event) => {
    console.error('全域錯誤:', event.error);
    console.error('錯誤檔案:', event.filename);
    console.error('錯誤行號:', event.lineno);
    console.error('錯誤列號:', event.colno);
    
    // 顯示詳細錯誤資訊
    showErrorMessage(`
        發生錯誤: ${event.error?.message || event.message}<br>
        檔案: ${event.filename}<br>
        行號: ${event.lineno}<br>
        請檢查瀏覽器控制台獲取更多資訊。
    `);
    
    if (gameEngine) {
        gameEngine.pause();
    }
});

/**
 * 未捕獲的Promise錯誤處理
 */
window.addEventListener('unhandledrejection', (event) => {
    console.error('未處理的Promise錯誤:', event.reason);
    showErrorMessage(`Promise錯誤: ${event.reason?.message || event.reason}`);
});

/**
 * 匯出全域函數供調試使用
 */
window.gameEngine = gameEngine;
window.initializeGame = initializeGame;

// 確保類別在全域可用
console.log('Main.js模組已載入');