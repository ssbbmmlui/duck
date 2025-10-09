/**
 * 場景基類
 * 所有遊戲場景的基礎類別
 */
class Scene {
    constructor(name, gameEngine) {
        this.name = name;
        this.gameEngine = gameEngine;
        this.isActive = false;
        this.isLoaded = false;
        this.isLoading = false;

        // 場景資源
        this.assets = [];
        this.backgroundImage = null;

        // UI元素
        this.uiElements = [];

        // 迷你遊戲
        this.miniGames = [];
        this.currentMiniGame = null;
    }

    /**
     * 進入場景時調用
     */
    async enter() {
        // 如果還沒設置，設置活動和載入狀態
        if (!this.isActive) {
            this.isActive = true;
        }
        if (!this.isLoading) {
            this.isLoading = true;
        }

        // 清除舊的UI元素
        this.cleanup();

        if (!this.isLoaded) {
            await this.loadSceneAssets();
            this.isLoaded = true;
        }

        this.isLoading = false;
        this.setupScene();
        console.log(`進入場景: ${this.name}`);
    }

    /**
     * 離開場景時調用
     */
    exit() {
        this.isActive = false;
        this.cleanup();
        console.log(`離開場景: ${this.name}`);
    }

    /**
     * 載入場景資源
     */
    async loadSceneAssets() {
        // 子類別應該覆寫此方法來載入特定資源
        console.log(`載入場景資源: ${this.name}`);
    }

    /**
     * 設置場景
     */
    setupScene() {
        // 子類別應該覆寫此方法來設置場景元素
    }

    /**
     * 更新場景邏輯
     */
    update(deltaTime) {
        if (!this.isActive) return;

        // 更新當前迷你遊戲
        if (this.currentMiniGame) {
            this.currentMiniGame.update(deltaTime);
        }

        // 更新UI元素
        this.uiElements.forEach(element => {
            if (element.update) {
                element.update(deltaTime);
            }
        });
    }

    /**
     * 渲染場景
     */
    render(context) {
        if (!this.isActive) return;

        // 如果正在載入，顯示載入畫面
        if (this.isLoading) {
            this.renderLoadingScreen(context);
            return;
        }

        // 渲染背景
        if (this.backgroundImage) {
            context.drawImage(this.backgroundImage, 0, 0, context.canvas.width, context.canvas.height);
        }

        // 渲染場景特定內容
        this.renderScene(context);

        // 渲染當前迷你遊戲
        if (this.currentMiniGame) {
            this.currentMiniGame.render(context);
        }

        // 只在非載入狀態渲染UI元素
        if (!this.isLoading) {
            this.uiElements.forEach(element => {
                if (element.render) {
                    element.render(context);
                }
            });
        }
    }

    /**
     * 渲染載入畫面
     */
    renderLoadingScreen(context) {
        const canvas = context.canvas;

        // 填充背景
        const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#2c3e50');
        gradient.addColorStop(1, '#34495e');
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);

        // 獲取遊戲標誌
        const logo = this.gameEngine.assetManager.getAsset('logo');

        if (logo && logo.width) {
            // 渲染標誌（1:1比例）
            const logoSize = 150;
            const logoX = (canvas.width - logoSize) / 2;
            const logoY = canvas.height / 2 - logoSize / 2 - 40;
            context.drawImage(logo, logoX, logoY, logoSize, logoSize);
        }

        // 渲染 "Loading" 文字
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 24px Microsoft JhengHei, sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText('Loading', canvas.width / 2, canvas.height / 2 + 80);

        // 渲染載入動畫點
        const dots = '.'.repeat((Math.floor(Date.now() / 500) % 4));
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 24px Microsoft JhengHei, sans-serif';
        context.fillText(dots, canvas.width / 2 + 80, canvas.height / 2 + 80);
    }

    /**
     * 渲染場景特定內容
     */
    renderScene(context) {
        // 子類別應該覆寫此方法來渲染場景特定內容
    }

    /**
     * 處理輸入事件
     */
    handleInput(event) {
        if (!this.isActive) return;

        // 首先檢查當前迷你遊戲
        if (this.currentMiniGame && this.currentMiniGame.handleInput) {
            if (this.currentMiniGame.handleInput(event)) {
                return; // 迷你遊戲處理了輸入
            }
        }

        // 檢查UI元素
        for (let element of this.uiElements) {
            if (element.handleInput && element.handleInput(event)) {
                return; // UI元素處理了輸入
            }
        }

        // 場景特定的輸入處理
        this.handleSceneInput(event);
    }

    /**
     * 處理場景特定輸入
     */
    handleSceneInput(event) {
        // 子類別可以覆寫此方法來處理場景特定輸入
    }

    /**
     * 開始迷你遊戲
     */
    startMiniGame(miniGameClass, config = {}) {
        if (this.currentMiniGame) {
            this.currentMiniGame.cleanup();
        }

        this.currentMiniGame = new miniGameClass(config);
        this.currentMiniGame.start();

        // 設置完成回調
        this.currentMiniGame.onComplete = (success, stats) => {
            this.onMiniGameComplete(success, stats);
        };

        // 設置返回回調
        this.currentMiniGame.onBack = () => {
            console.log('玩家點擊返回按鈕');
            this.currentMiniGame.cleanup();
            this.currentMiniGame = null;
            this.onMiniGameBack();
        };

        // 設置跳過回調
        this.currentMiniGame.onSkip = () => {
            console.log('玩家點擊跳過按鈕');
            this.currentMiniGame.cleanup();
            this.currentMiniGame = null;
            this.onMiniGameSkip();
        };
    }

    /**
     * 迷你遊戲完成回調
     */
    onMiniGameComplete(success, stats) {
        if (success) {
            console.log('迷你遊戲完成成功', stats);
            // 更新進度
            this.gameEngine.progressManager.completeStep(this.name);
        } else {
            console.log('迷你遊戲失敗，可以重試');
        }

        this.currentMiniGame = null;
    }

    /**
     * 迷你遊戲返回回調
     */
    onMiniGameBack() {
        console.log('從迷你遊戲返回');
        // 子類別可以覆寫此方法來處理返回邏輯
        // 默認行為：顯示場景UI
        if (this.showSceneUI) {
            this.showSceneUI();
        }
    }

    /**
     * 迷你遊戲跳過回調
     */
    onMiniGameSkip() {
        console.log('跳過迷你遊戲');
        // 子類別可以覆寫此方法來處理跳過邏輯
        // 默認行為：當作成功完成
        this.onMiniGameComplete(true, { score: 0, skipped: true });
        if (this.showSceneUI) {
            this.showSceneUI();
        }
    }

    /**
     * 切換到下一個場景
     */
    transitionToScene(sceneName) {
        this.gameEngine.sceneManager.changeScene(sceneName);
    }

    /**
     * 清理場景資源
     */
    cleanup() {
        if (this.currentMiniGame) {
            this.currentMiniGame.cleanup();
            this.currentMiniGame = null;
        }
        
        this.uiElements = [];
    }

    /**
     * 添加UI元素
     */
    addUIElement(element) {
        this.uiElements.push(element);
    }

    /**
     * 移除UI元素
     */
    removeUIElement(element) {
        const index = this.uiElements.indexOf(element);
        if (index > -1) {
            this.uiElements.splice(index, 1);
        }
    }
}

/**
 * 場景管理器
 * 負責場景的切換和管理
 */
class SceneManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.scenes = new Map();
        this.currentScene = null;
        this.isTransitioning = false;
    }

    /**
     * 註冊場景
     */
    registerScene(name, sceneClass) {
        this.scenes.set(name, sceneClass);
    }

    /**
     * 切換場景
     */
    async changeScene(sceneName) {
        if (this.isTransitioning) {
            console.warn('場景切換進行中，忽略新的切換請求');
            return;
        }

        const SceneClass = this.scenes.get(sceneName);
        if (!SceneClass) {
            console.error(`找不到場景: ${sceneName}`);
            console.error('已註冊的場景:', Array.from(this.scenes.keys()));
            return;
        }

        this.isTransitioning = true;

        try {
            const newScene = new SceneClass(sceneName, this.gameEngine);
            newScene.isActive = true;
            newScene.isLoading = true;

            if (this.currentScene) {
                await this.currentScene.exit();
            }

            this.currentScene = newScene;
            await this.currentScene.enter();

            this.gameEngine.updateGameState({ currentScene: sceneName });
            console.log(`場景切換完成: ${sceneName}`);
        } catch (error) {
            console.error('場景切換失敗:', error);
            console.error('錯誤堆疊:', error.stack);
        } finally {
            this.isTransitioning = false;
        }
    }

    /**
     * 獲取當前場景
     */
    getCurrentScene() {
        return this.currentScene;
    }

    /**
     * 初始化所有場景
     */
    initializeScenes() {
        // 註冊所有場景類別
        this.registerScene('welcome', WelcomeScene);
        this.registerScene('selection', SelectionScene);
        this.registerScene('processing', ProcessingScene);
        this.registerScene('preparation', PreparationScene);
        this.registerScene('drying', DryingScene);
        this.registerScene('roasting', RoastingScene);
        this.registerScene('slicing', SlicingScene);
        this.registerScene('completion', CompletionScene);
    }
}

// 匯出到全域作用域
window.Scene = Scene;
window.SceneManager = SceneManager;