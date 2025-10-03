/**
 * 遊戲引擎單元測試
 * 測試GameEngine類別的核心功能
 */

describe('GameEngine 核心功能測試', function() {
    let gameEngine;
    let mockCanvas;
    let mockContext;

    beforeEach(function() {
        // 創建模擬Canvas和Context
        mockCanvas = {
            width: 800,
            height: 600,
            getContext: function(type) {
                return mockContext;
            },
            addEventListener: function(event, handler) {
                // 模擬事件監聽器
            }
        };

        mockContext = {
            clearRect: function() {},
            fillRect: function() {},
            drawImage: function() {},
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

        // 模擬DOM元素
        global.document = {
            getElementById: function(id) {
                if (id === 'gameCanvas') {
                    return mockCanvas;
                }
                return null;
            },
            createElement: function(tag) {
                if (tag === 'canvas') {
                    return mockCanvas;
                }
                return {};
            },
            body: {
                appendChild: function() {},
                insertAdjacentHTML: function() {}
            }
        };

        // 模擬window物件
        global.window = {
            requestAnimationFrame: function(callback) {
                setTimeout(callback, 16);
            },
            performance: {
                now: function() {
                    return Date.now();
                },
                mark: function() {},
                memory: {
                    usedJSHeapSize: 50000000,
                    jsHeapSizeLimit: 200000000
                }
            },
            localStorage: {
                getItem: function() { return null; },
                setItem: function() {},
                removeItem: function() {}
            },
            Audio: function() {
                return {
                    play: function() {},
                    pause: function() {},
                    load: function() {}
                };
            }
        };

        global.navigator = {
            hardwareConcurrency: 4
        };

        gameEngine = new GameEngine();
    });

    afterEach(function() {
        if (gameEngine) {
            gameEngine.stop();
        }
    });

    it('應該正確初始化遊戲引擎', function() {
        assert.isNotNull(gameEngine, '遊戲引擎應該被創建');
        assert.equals(gameEngine.isRunning, false, '初始狀態應該是未運行');
        assert.equals(gameEngine.isPaused, false, '初始狀態應該是未暫停');
        assert.equals(gameEngine.targetFPS, 60, '目標FPS應該是60');
    });

    it('應該正確設置初始遊戲狀態', function() {
        const gameState = gameEngine.getGameState();
        
        assert.equals(gameState.currentScene, 'welcome', '初始場景應該是歡迎場景');
        assert.equals(gameState.score, 0, '初始分數應該是0');
        assert.isTrue(gameState.settings.soundEnabled, '音效應該預設開啟');
        assert.equals(gameState.settings.language, 'zh-TW', '語言應該是繁體中文');
    });

    it('應該能夠檢查瀏覽器相容性', function() {
        const isCompatible = gameEngine.checkBrowserCompatibility();
        assert.isTrue(isCompatible, '模擬環境應該通過相容性檢查');
    });

    it('應該能夠更新遊戲狀態', function() {
        const newState = {
            currentScene: 'selection',
            score: 100
        };
        
        gameEngine.updateGameState(newState);
        const updatedState = gameEngine.getGameState();
        
        assert.equals(updatedState.currentScene, 'selection', '場景應該被更新');
        assert.equals(updatedState.score, 100, '分數應該被更新');
        assert.isTrue(updatedState.settings.soundEnabled, '其他設定應該保持不變');
    });

    it('應該能夠開始和停止遊戲', function() {
        // 模擬初始化成功
        gameEngine.canvas = mockCanvas;
        gameEngine.context = mockContext;
        
        gameEngine.start();
        assert.isTrue(gameEngine.isRunning, '遊戲應該開始運行');
        
        gameEngine.stop();
        assert.isFalse(gameEngine.isRunning, '遊戲應該停止運行');
    });

    it('應該能夠暫停和恢復遊戲', function() {
        gameEngine.pause();
        assert.isTrue(gameEngine.isPaused, '遊戲應該被暫停');
        
        gameEngine.resume();
        assert.isFalse(gameEngine.isPaused, '遊戲應該恢復運行');
    });

    it('應該能夠檢測裝置效能', function() {
        const performance = gameEngine.detectPerformance();
        assert.isTrue(['low', 'medium', 'high'].includes(performance), '效能檢測應該返回有效值');
    });

    it('應該能夠處理更新錯誤', function() {
        // 模擬錯誤情況
        const originalConsoleError = console.error;
        let errorCaught = false;
        
        console.error = function() {
            errorCaught = true;
        };
        
        // 創建一個會拋出錯誤的場景管理器
        gameEngine.sceneManager = {
            currentScene: {
                update: function() {
                    throw new Error('測試錯誤');
                }
            }
        };
        
        gameEngine.update(16);
        
        console.error = originalConsoleError;
        assert.isTrue(errorCaught, '應該捕獲並處理更新錯誤');
    });

    it('應該能夠處理渲染錯誤', function() {
        const originalConsoleError = console.error;
        let errorCaught = false;
        
        console.error = function() {
            errorCaught = true;
        };
        
        // 模擬渲染錯誤
        gameEngine.context = null;
        gameEngine.render();
        
        console.error = originalConsoleError;
        assert.isTrue(errorCaught, '應該捕獲並處理渲染錯誤');
    });

    it('應該能夠優化Canvas渲染', function() {
        gameEngine.context = mockContext;
        gameEngine.optimizeCanvasRendering();
        
        assert.isTrue(mockContext.imageSmoothingEnabled, '圖像平滑應該被啟用');
        assert.equals(mockContext.imageSmoothingQuality, 'high', '圖像品質應該設為高');
        assert.equals(mockContext.textBaseline, 'top', '文字基線應該設為top');
        assert.equals(mockContext.textAlign, 'left', '文字對齊應該設為left');
    });

    it('應該能夠監控效能', function() {
        gameEngine.monitorPerformance();
        
        // 檢查效能統計是否被初始化
        assert.isNotNull(gameEngine.performanceStats, '效能統計應該被初始化');
        assert.equals(gameEngine.performanceStats.frameCount, 1, '幀數計數應該增加');
    });

    it('應該能夠執行記憶體清理', function() {
        // 模擬管理器
        gameEngine.assetManager = {
            cleanupUnusedAssets: function() {}
        };
        gameEngine.audioManager = {
            cleanupUnusedSounds: function() {}
        };
        gameEngine.visualFeedback = {
            cleanup: function() {}
        };
        
        // 執行記憶體清理不應該拋出錯誤
        assert.doesNotThrow(function() {
            gameEngine.performMemoryCleanup();
        }, '記憶體清理應該正常執行');
    });

    it('應該能夠啟用低效能模式', function() {
        // 模擬管理器
        gameEngine.visualFeedback = {
            setLowPerformanceMode: function(enabled) {
                this.lowPerformanceMode = enabled;
            }
        };
        gameEngine.sceneTransitions = {
            setLowPerformanceMode: function(enabled) {
                this.lowPerformanceMode = enabled;
            }
        };
        
        gameEngine.enableLowPerformanceMode();
        
        assert.isTrue(gameEngine.visualFeedback.lowPerformanceMode, '視覺反饋應該啟用低效能模式');
        assert.isTrue(gameEngine.sceneTransitions.lowPerformanceMode, '場景切換應該啟用低效能模式');
    });
});

// 為了讓測試能夠運行，添加一個簡單的doesNotThrow斷言
assert.doesNotThrow = function(func, message = '函數不應該拋出錯誤') {
    try {
        func();
    } catch (error) {
        throw new Error(`${message}. 拋出了錯誤: ${error.message}`);
    }
};