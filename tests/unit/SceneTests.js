/**
 * 場景系統單元測試
 * 測試Scene和SceneManager類別的功能
 */

describe('Scene 場景系統測試', function() {
    let scene;
    let sceneManager;
    let mockGameEngine;

    beforeEach(function() {
        // 創建模擬遊戲引擎
        mockGameEngine = {
            canvas: { width: 800, height: 600 },
            context: {
                clearRect: function() {},
                drawImage: function() {},
                fillRect: function() {},
                strokeRect: function() {},
                fillStyle: '',
                strokeStyle: '',
                lineWidth: 1
            },
            assetManager: {
                getAsset: function(name) {
                    return { width: 100, height: 100 };
                }
            },
            progressManager: {
                completeStep: function() {}
            },
            updateGameState: function() {}
        };

        scene = new Scene('testScene', mockGameEngine);
        sceneManager = new SceneManager(mockGameEngine);
    });

    afterEach(function() {
        if (scene) {
            scene.cleanup();
        }
    });

    it('應該正確初始化場景', function() {
        assert.equals(scene.name, 'testScene', '場景名稱應該正確設置');
        assert.equals(scene.gameEngine, mockGameEngine, '遊戲引擎引用應該正確設置');
        assert.isFalse(scene.isActive, '場景初始狀態應該是非活躍');
        assert.isFalse(scene.isLoaded, '場景初始狀態應該是未載入');
        assert.arrayEquals(scene.uiElements, [], 'UI元素陣列應該為空');
        assert.arrayEquals(scene.miniGames, [], '迷你遊戲陣列應該為空');
        assert.isNull(scene.currentMiniGame, '當前迷你遊戲應該為null');
    });

    it('應該能夠進入場景', async function() {
        await scene.enter();
        
        assert.isTrue(scene.isActive, '場景應該變為活躍狀態');
        assert.isTrue(scene.isLoaded, '場景應該標記為已載入');
    });

    it('應該能夠離開場景', function() {
        scene.isActive = true;
        scene.exit();
        
        assert.isFalse(scene.isActive, '場景應該變為非活躍狀態');
    });

    it('應該能夠添加和移除UI元素', function() {
        const mockUIElement = { id: 'testElement' };
        
        scene.addUIElement(mockUIElement);
        assert.equals(scene.uiElements.length, 1, '應該添加一個UI元素');
        assert.equals(scene.uiElements[0], mockUIElement, 'UI元素應該正確添加');
        
        scene.removeUIElement(mockUIElement);
        assert.equals(scene.uiElements.length, 0, 'UI元素應該被移除');
    });

    it('應該能夠處理輸入事件', function() {
        scene.isActive = true;
        
        // 測試場景輸入處理
        let inputHandled = false;
        scene.handleSceneInput = function(event) {
            inputHandled = true;
        };
        
        const mockEvent = { type: 'click', x: 100, y: 100 };
        scene.handleInput(mockEvent);
        
        assert.isTrue(inputHandled, '場景應該處理輸入事件');
    });

    it('應該能夠開始迷你遊戲', function() {
        // 創建模擬迷你遊戲類別
        class MockMiniGame {
            constructor(config) {
                this.config = config;
                this.started = false;
                this.onComplete = null;
            }
            
            start() {
                this.started = true;
            }
            
            cleanup() {}
        }
        
        scene.startMiniGame(MockMiniGame, { testConfig: true });
        
        assert.isNotNull(scene.currentMiniGame, '應該設置當前迷你遊戲');
        assert.isInstanceOf(scene.currentMiniGame, MockMiniGame, '迷你遊戲應該是正確的類型');
        assert.isTrue(scene.currentMiniGame.started, '迷你遊戲應該被啟動');
        assert.isNotNull(scene.currentMiniGame.onComplete, '應該設置完成回調');
    });

    it('應該能夠處理迷你遊戲完成', function() {
        // 創建模擬迷你遊戲
        const mockMiniGame = {
            cleanup: function() {
                this.cleaned = true;
            }
        };
        
        scene.currentMiniGame = mockMiniGame;
        scene.onMiniGameComplete(true);
        
        assert.isNull(scene.currentMiniGame, '當前迷你遊戲應該被清除');
    });

    it('應該能夠更新場景', function() {
        scene.isActive = true;
        
        // 添加模擬UI元素
        const mockUIElement = {
            updated: false,
            update: function(deltaTime) {
                this.updated = true;
                this.deltaTime = deltaTime;
            }
        };
        
        scene.addUIElement(mockUIElement);
        
        // 添加模擬迷你遊戲
        const mockMiniGame = {
            updated: false,
            update: function(deltaTime) {
                this.updated = true;
                this.deltaTime = deltaTime;
            }
        };
        
        scene.currentMiniGame = mockMiniGame;
        
        scene.update(16);
        
        assert.isTrue(mockUIElement.updated, 'UI元素應該被更新');
        assert.equals(mockUIElement.deltaTime, 16, 'UI元素應該收到正確的deltaTime');
        assert.isTrue(mockMiniGame.updated, '迷你遊戲應該被更新');
        assert.equals(mockMiniGame.deltaTime, 16, '迷你遊戲應該收到正確的deltaTime');
    });

    it('應該能夠渲染場景', function() {
        scene.isActive = true;
        
        // 設置背景圖片
        scene.backgroundImage = { width: 800, height: 600 };
        
        // 添加模擬UI元素
        const mockUIElement = {
            rendered: false,
            render: function(context) {
                this.rendered = true;
                this.context = context;
            }
        };
        
        scene.addUIElement(mockUIElement);
        
        // 添加模擬迷你遊戲
        const mockMiniGame = {
            rendered: false,
            render: function(context) {
                this.rendered = true;
                this.context = context;
            }
        };
        
        scene.currentMiniGame = mockMiniGame;
        
        const mockContext = mockGameEngine.context;
        scene.render(mockContext);
        
        assert.isTrue(mockUIElement.rendered, 'UI元素應該被渲染');
        assert.equals(mockUIElement.context, mockContext, 'UI元素應該收到正確的context');
        assert.isTrue(mockMiniGame.rendered, '迷你遊戲應該被渲染');
        assert.equals(mockMiniGame.context, mockContext, '迷你遊戲應該收到正確的context');
    });

    it('非活躍場景不應該更新或渲染', function() {
        scene.isActive = false;
        
        const mockUIElement = {
            updated: false,
            update: function() { this.updated = true; }
        };
        
        scene.addUIElement(mockUIElement);
        scene.update(16);
        
        assert.isFalse(mockUIElement.updated, '非活躍場景的UI元素不應該被更新');
        
        const mockUIElementRender = {
            rendered: false,
            render: function() { this.rendered = true; }
        };
        
        scene.addUIElement(mockUIElementRender);
        scene.render(mockGameEngine.context);
        
        assert.isFalse(mockUIElementRender.rendered, '非活躍場景的UI元素不應該被渲染');
    });
});

describe('SceneManager 場景管理器測試', function() {
    let sceneManager;
    let mockGameEngine;

    beforeEach(function() {
        mockGameEngine = {
            updateGameState: function(state) {
                this.gameState = { ...this.gameState, ...state };
            },
            gameState: {}
        };
        
        sceneManager = new SceneManager(mockGameEngine);
    });

    it('應該正確初始化場景管理器', function() {
        assert.equals(sceneManager.gameEngine, mockGameEngine, '遊戲引擎引用應該正確設置');
        assert.isInstanceOf(sceneManager.scenes, Map, '場景映射應該是Map實例');
        assert.isNull(sceneManager.currentScene, '當前場景應該為null');
        assert.isFalse(sceneManager.isTransitioning, '初始狀態不應該在切換中');
    });

    it('應該能夠註冊場景', function() {
        class TestScene extends Scene {}
        
        sceneManager.registerScene('test', TestScene);
        
        assert.isTrue(sceneManager.scenes.has('test'), '場景應該被註冊');
        assert.equals(sceneManager.scenes.get('test'), TestScene, '場景類別應該正確存儲');
    });

    it('應該能夠切換場景', async function() {
        // 創建測試場景類別
        class TestScene extends Scene {
            constructor(name, gameEngine) {
                super(name, gameEngine);
                this.entered = false;
                this.exited = false;
            }
            
            async enter() {
                await super.enter();
                this.entered = true;
            }
            
            exit() {
                super.exit();
                this.exited = true;
            }
        }
        
        sceneManager.registerScene('test', TestScene);
        
        await sceneManager.changeScene('test');
        
        assert.isNotNull(sceneManager.currentScene, '當前場景應該被設置');
        assert.isInstanceOf(sceneManager.currentScene, TestScene, '當前場景應該是正確的類型');
        assert.isTrue(sceneManager.currentScene.entered, '場景應該被進入');
        assert.equals(mockGameEngine.gameState.currentScene, 'test', '遊戲狀態應該被更新');
    });

    it('應該能夠處理場景切換時的前一個場景', async function() {
        class TestScene1 extends Scene {
            constructor(name, gameEngine) {
                super(name, gameEngine);
                this.exited = false;
            }
            
            exit() {
                super.exit();
                this.exited = true;
            }
        }
        
        class TestScene2 extends Scene {
            constructor(name, gameEngine) {
                super(name, gameEngine);
                this.entered = false;
            }
            
            async enter() {
                await super.enter();
                this.entered = true;
            }
        }
        
        sceneManager.registerScene('test1', TestScene1);
        sceneManager.registerScene('test2', TestScene2);
        
        // 先切換到第一個場景
        await sceneManager.changeScene('test1');
        const firstScene = sceneManager.currentScene;
        
        // 再切換到第二個場景
        await sceneManager.changeScene('test2');
        
        assert.isTrue(firstScene.exited, '前一個場景應該被退出');
        assert.isInstanceOf(sceneManager.currentScene, TestScene2, '當前場景應該是新場景');
        assert.isTrue(sceneManager.currentScene.entered, '新場景應該被進入');
    });

    it('應該能夠處理不存在的場景', async function() {
        const originalConsoleError = console.error;
        let errorLogged = false;
        
        console.error = function() {
            errorLogged = true;
        };
        
        await sceneManager.changeScene('nonexistent');
        
        console.error = originalConsoleError;
        
        assert.isTrue(errorLogged, '應該記錄錯誤');
        assert.isNull(sceneManager.currentScene, '當前場景應該保持為null');
    });

    it('應該能夠防止並發場景切換', async function() {
        class TestScene extends Scene {}
        
        sceneManager.registerScene('test', TestScene);
        
        // 設置切換狀態
        sceneManager.isTransitioning = true;
        
        const originalConsoleWarn = console.warn;
        let warningLogged = false;
        
        console.warn = function() {
            warningLogged = true;
        };
        
        await sceneManager.changeScene('test');
        
        console.warn = originalConsoleWarn;
        
        assert.isTrue(warningLogged, '應該記錄警告');
        assert.isNull(sceneManager.currentScene, '場景不應該被切換');
    });

    it('應該能夠獲取當前場景', function() {
        const mockScene = new Scene('test', mockGameEngine);
        sceneManager.currentScene = mockScene;
        
        const currentScene = sceneManager.getCurrentScene();
        assert.equals(currentScene, mockScene, '應該返回當前場景');
    });

    it('應該能夠初始化所有場景', function() {
        // 模擬場景類別存在
        global.WelcomeScene = class extends Scene {};
        global.SelectionScene = class extends Scene {};
        global.ProcessingScene = class extends Scene {};
        global.PreparationScene = class extends Scene {};
        global.DryingScene = class extends Scene {};
        global.RoastingScene = class extends Scene {};
        global.SlicingScene = class extends Scene {};
        global.CompletionScene = class extends Scene {};
        
        sceneManager.initializeScenes();
        
        assert.isTrue(sceneManager.scenes.has('welcome'), '歡迎場景應該被註冊');
        assert.isTrue(sceneManager.scenes.has('selection'), '選材場景應該被註冊');
        assert.isTrue(sceneManager.scenes.has('processing'), '處理場景應該被註冊');
        assert.isTrue(sceneManager.scenes.has('preparation'), '製胚場景應該被註冊');
        assert.isTrue(sceneManager.scenes.has('drying'), '晾胚場景應該被註冊');
        assert.isTrue(sceneManager.scenes.has('roasting'), '烤製場景應該被註冊');
        assert.isTrue(sceneManager.scenes.has('slicing'), '片鴨場景應該被註冊');
        assert.isTrue(sceneManager.scenes.has('completion'), '完成場景應該被註冊');
    });
});