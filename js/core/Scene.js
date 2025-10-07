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
        this.isActive = true;
        
        if (!this.isLoaded) {
            await this.loadSceneAssets();
            this.isLoaded = true;
        }
        
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

        // 渲染UI元素
        this.uiElements.forEach(element => {
            if (element.render) {
                element.render(context);
            }
        });
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
            return;
        }

        this.isTransitioning = true;

        try {
            // 離開當前場景
            if (this.currentScene) {
                await this.currentScene.exit();
            }

            // 創建並進入新場景
            this.currentScene = new SceneClass(sceneName, this.gameEngine);
            await this.currentScene.enter();

            // 更新遊戲狀態
            this.gameEngine.updateGameState({ currentScene: sceneName });

            console.log(`場景切換完成: ${sceneName}`);
        } catch (error) {
            console.error('場景切換失敗:', error);
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