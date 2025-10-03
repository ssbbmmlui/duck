/**
 * 場景切換整合測試
 * 測試場景間的切換和狀態管理
 */

describe('場景切換整合測試', function() {
    let gameEngine;
    let sceneManager;
    let mockCanvas;
    let mockContext;

    beforeEach(function() {
        // 創建模擬DOM環境
        mockCanvas = {
            width: 800,
            height: 600,
            getContext: function() { return mockContext; },
            addEventListener: function() {}
        };

        mockContext = {
            clearRect: function() {},
            fillRect: function() {},
            drawImage: function() {},
            strokeRect: function() {},
            fillText: function() {},
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 1,
            font: '',
            textAlign: '',
            textBaseline: '',
            save: function() {},
            restore: function() {},
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high'
        };

        global.document = {
            getElementById: function(id) {
                if (id === 'gameCanvas') return mockCanvas;
                return null;
            },
            createElement: function() { return mockCanvas; },
            body: { appendChild: function() {}, insertAdjacentHTML: function() {} }
        };

        global.window = {
            requestAnimationFrame: function(callback) { setTimeout(callback, 16); },
            performance: { 
                now: function() { return Date.now(); },
                mark: function() {},
                memory: { usedJSHeapSize: 50000000, jsHeapSizeLimit: 200000000 }
            },
            localStorage: {
                getItem: function() { return null; },
                setItem: function() {},
                removeItem: function() {}
            },
            Audio: function() {
                return { play: function() {}, pause: function() {}, load: function() {} };
            }
        };

        global.navigator = { hardwareConcurrency: 4 };

        // 創建測試場景類別
        global.TestScene1 = class extends Scene {
            constructor(name, gameEngine) {
                super(name, gameEngine);
                this.setupCalled = false;
                this.enterCalled = false;
                this.exitCalled = false;
            }

            async enter() {
                await super.enter();
                this.enterCalled = true;
            }

            exit() {
                super.exit();
                this.exitCalled = true;
            }

            setupScene() {
                this.setupCalled = true;
            }
        };

        global.TestScene2 = class extends Scene {
            constructor(name, gameEngine) {
                super(name, gameEngine);
                this.setupCalled = false;
                this.enterCalled = false;
                this.exitCalled = false;
            }

            async enter() {
                await super.enter();
                this.enterCalled = true;
            }

            exit() {
                super.exit();
                this.exitCalled = true;
            }

            setupScene() {
                this.setupCalled = true;
            }
        };

        gameEngine = new GameEngine();
        gameEngine.canvas = mockCanvas;
        gameEngine.context = mockContext;
        
        // 初始化管理器
        gameEngine.assetManager = { preloadAssets: async function() {} };
        gameEngine.audioManager = { 
            preloadSounds: async function() {},
            setSoundEnabled: function() {}
        };
        gameEngine.progressManager = { 
            setVisualFeedback: function() {},
            setEventCallbacks: function() {}
        };
        gameEngine.uiManager = { update: function() {} };
        gameEngine.visualFeedback = { 
            update: function() {},
            render: function() {},
            setLowPerformanceMode: function() {}
        };
        gameEngine.sceneTransitions = { 
            update: function() {},
            render: function() {},
            setLowPerformanceMode: function() {}
        };
        
        sceneManager = new SceneManager(gameEngine);
        gameEngine.sceneManager = sceneManager;
        
        // 註冊測試場景
        sceneManager.registerScene('test1', TestScene1);
        sceneManager.registerScene('test2', TestScene2);
    });

    afterEach(function() {
        if (gameEngine) {
            gameEngine.stop();
        }
    });

    it('應該能夠從無場景狀態切換到第一個場景', async function() {
        assert.isNull(sceneManager.currentScene, '初始狀態應該沒有當前場景');
        
        await sceneManager.changeScene('test1');
        
        assert.isNotNull(sceneManager.currentScene, '應該設置當前場景');
        assert.isInstanceOf(sceneManager.currentScene, TestScene1, '當前場景應該是TestScene1');
        assert.isTrue(sceneManager.currentScene.enterCalled, '場景的enter方法應該被調用');
        assert.isTrue(sceneManager.currentScene.setupCalled, '場景的setupScene方法應該被調用');
        assert.isTrue(sceneManager.currentScene.isActive, '場景應該是活躍狀態');
        assert.isTrue(sceneManager.currentScene.isLoaded, '場景應該是已載入狀態');
    });

    it('應該能夠在兩個場景間切換', async function() {
        // 先切換到第一個場景
        await sceneManager.changeScene('test1');
        const firstScene = sceneManager.currentScene;
        
        // 再切換到第二個場景
        await sceneManager.changeScene('test2');
        const secondScene = sceneManager.currentScene;
        
        // 檢查第一個場景是否正確退出
        assert.isTrue(firstScene.exitCalled, '第一個場景的exit方法應該被調用');
        assert.isFalse(firstScene.isActive, '第一個場景應該變為非活躍狀態');
        
        // 檢查第二個場景是否正確進入
        assert.isInstanceOf(secondScene, TestScene2, '當前場景應該是TestScene2');
        assert.isTrue(secondScene.enterCalled, '第二個場景的enter方法應該被調用');
        assert.isTrue(secondScene.isActive, '第二個場景應該是活躍狀態');
        
        // 檢查遊戲狀態是否更新
        assert.equals(gameEngine.gameState.currentScene, 'test2', '遊戲狀態應該反映當前場景');
    });

    it('應該能夠處理場景切換過程中的錯誤', async function() {
        // 創建會拋出錯誤的場景
        global.ErrorScene = class extends Scene {
            async enter() {
                throw new Error('場景進入錯誤');
            }
        };
        
        sceneManager.registerScene('error', ErrorScene);
        
        const originalConsoleError = console.error;
        let errorCaught = false;
        
        console.error = function() {
            errorCaught = true;
        };
        
        await sceneManager.changeScene('error');
        
        console.error = originalConsoleError;
        
        assert.isTrue(errorCaught, '應該捕獲並記錄錯誤');
        assert.isFalse(sceneManager.isTransitioning, '切換狀態應該被重置');
    });

    it('應該能夠防止並發場景切換', async function() {
        // 開始第一個切換
        const firstPromise = sceneManager.changeScene('test1');
        
        // 立即嘗試第二個切換
        const originalConsoleWarn = console.warn;
        let warningLogged = false;
        
        console.warn = function() {
            warningLogged = true;
        };
        
        const secondPromise = sceneManager.changeScene('test2');
        
        await Promise.all([firstPromise, secondPromise]);
        
        console.warn = originalConsoleWarn;
        
        assert.isTrue(warningLogged, '應該記錄並發切換警告');
        assert.isInstanceOf(sceneManager.currentScene, TestScene1, '應該只執行第一個切換');
    });

    it('應該能夠在場景切換後正確更新和渲染', async function() {
        await sceneManager.changeScene('test1');
        
        const scene = sceneManager.currentScene;
        let updateCalled = false;
        let renderCalled = false;
        
        // 覆寫場景方法來檢測調用
        const originalUpdate = scene.update;
        const originalRender = scene.render;
        
        scene.update = function(deltaTime) {
            updateCalled = true;
            originalUpdate.call(this, deltaTime);
        };
        
        scene.render = function(context) {
            renderCalled = true;
            originalRender.call(this, context);
        };
        
        // 執行遊戲循環
        gameEngine.update(16);
        gameEngine.render();
        
        assert.isTrue(updateCalled, '場景的update方法應該被調用');
        assert.isTrue(renderCalled, '場景的render方法應該被調用');
    });

    it('應該能夠處理場景間的資料傳遞', async function() {
        // 在第一個場景設置一些資料
        await sceneManager.changeScene('test1');
        gameEngine.updateGameState({ 
            testData: 'from scene 1',
            score: 100
        });
        
        // 切換到第二個場景
        await sceneManager.changeScene('test2');
        
        // 檢查資料是否保持
        const gameState = gameEngine.getGameState();
        assert.equals(gameState.testData, 'from scene 1', '場景間資料應該保持');
        assert.equals(gameState.score, 100, '分數資料應該保持');
        assert.equals(gameState.currentScene, 'test2', '當前場景應該更新');
    });

    it('應該能夠處理場景的資源載入', async function() {
        // 創建需要載入資源的場景
        global.AssetScene = class extends Scene {
            constructor(name, gameEngine) {
                super(name, gameEngine);
                this.assetsLoaded = false;
            }

            async loadSceneAssets() {
                await super.loadSceneAssets();
                // 模擬資源載入
                await new Promise(resolve => setTimeout(resolve, 10));
                this.assetsLoaded = true;
            }
        };
        
        sceneManager.registerScene('asset', AssetScene);
        
        await sceneManager.changeScene('asset');
        
        const scene = sceneManager.currentScene;
        assert.isTrue(scene.assetsLoaded, '場景資源應該被載入');
        assert.isTrue(scene.isLoaded, '場景應該標記為已載入');
    });

    it('應該能夠處理場景的清理工作', async function() {
        // 切換到第一個場景並添加一些元素
        await sceneManager.changeScene('test1');
        const firstScene = sceneManager.currentScene;
        
        // 模擬添加UI元素和迷你遊戲
        const mockUIElement = { id: 'test' };
        const mockMiniGame = { 
            cleanup: function() { this.cleaned = true; }
        };
        
        firstScene.addUIElement(mockUIElement);
        firstScene.currentMiniGame = mockMiniGame;
        
        // 切換到第二個場景
        await sceneManager.changeScene('test2');
        
        // 檢查第一個場景是否正確清理
        assert.equals(firstScene.uiElements.length, 0, 'UI元素應該被清理');
        assert.isNull(firstScene.currentMiniGame, '迷你遊戲應該被清理');
        assert.isTrue(mockMiniGame.cleaned, '迷你遊戲的cleanup方法應該被調用');
    });

    it('應該能夠處理快速連續的場景切換', async function() {
        // 快速連續切換場景
        const promises = [
            sceneManager.changeScene('test1'),
            sceneManager.changeScene('test2'),
            sceneManager.changeScene('test1')
        ];
        
        await Promise.all(promises);
        
        // 最後一個切換應該生效（如果沒有被並發保護阻止）
        // 或者第一個切換生效（如果有並發保護）
        assert.isNotNull(sceneManager.currentScene, '應該有一個當前場景');
        assert.isFalse(sceneManager.isTransitioning, '切換狀態應該被重置');
    });

    it('應該能夠在場景切換時保持遊戲引擎狀態', async function() {
        // 設置一些遊戲引擎狀態
        gameEngine.isRunning = true;
        gameEngine.isPaused = false;
        
        await sceneManager.changeScene('test1');
        
        // 檢查遊戲引擎狀態是否保持
        assert.isTrue(gameEngine.isRunning, '遊戲引擎運行狀態應該保持');
        assert.isFalse(gameEngine.isPaused, '遊戲引擎暫停狀態應該保持');
        
        await sceneManager.changeScene('test2');
        
        // 再次檢查狀態
        assert.isTrue(gameEngine.isRunning, '遊戲引擎運行狀態應該繼續保持');
        assert.isFalse(gameEngine.isPaused, '遊戲引擎暫停狀態應該繼續保持');
    });
});