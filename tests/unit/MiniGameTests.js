/**
 * 迷你遊戲單元測試
 * 測試MiniGame基類的功能
 */

describe('MiniGame 迷你遊戲基類測試', function() {
    let miniGame;
    let mockGameEngine;
    let mockScene;

    beforeEach(function() {
        // 創建模擬遊戲引擎
        mockGameEngine = {
            canvas: { width: 800, height: 600 },
            context: {
                clearRect: function() {},
                fillRect: function() {},
                strokeRect: function() {},
                fillText: function() {},
                fillStyle: '',
                strokeStyle: '',
                lineWidth: 1,
                font: '',
                textAlign: ''
            },
            uiManager: {
                createLabel: function(config) {
                    return { type: 'label', config: config };
                },
                createProgressBar: function(config) {
                    return { 
                        type: 'progressBar', 
                        config: config,
                        setProgress: function(progress) {
                            this.progress = progress;
                        }
                    };
                },
                removeUIElement: function(element) {}
            }
        };

        mockScene = {
            name: 'testScene'
        };

        miniGame = new MiniGame({
            name: 'TestMiniGame',
            gameEngine: mockGameEngine,
            scene: mockScene,
            timeLimit: 30000,
            maxAttempts: 3,
            successThreshold: 0.8
        });
    });

    afterEach(function() {
        if (miniGame) {
            miniGame.cleanup();
        }
    });

    it('應該正確初始化迷你遊戲', function() {
        assert.equals(miniGame.name, 'TestMiniGame', '遊戲名稱應該正確設置');
        assert.equals(miniGame.gameEngine, mockGameEngine, '遊戲引擎引用應該正確設置');
        assert.equals(miniGame.scene, mockScene, '場景引用應該正確設置');
        assert.isFalse(miniGame.isActive, '初始狀態應該是非活躍');
        assert.isFalse(miniGame.isCompleted, '初始狀態應該是未完成');
        assert.isFalse(miniGame.isSuccessful, '初始狀態應該是未成功');
        assert.equals(miniGame.progress, 0, '初始進度應該是0');
    });

    it('應該正確設置遊戲配置', function() {
        assert.equals(miniGame.config.timeLimit, 30000, '時間限制應該正確設置');
        assert.equals(miniGame.config.maxAttempts, 3, '最大嘗試次數應該正確設置');
        assert.equals(miniGame.config.successThreshold, 0.8, '成功閾值應該正確設置');
    });

    it('應該正確設置遊戲區域', function() {
        const gameArea = miniGame.gameArea;
        assert.equals(gameArea.x, 100, '遊戲區域X座標應該有預設值');
        assert.equals(gameArea.y, 150, '遊戲區域Y座標應該有預設值');
        assert.equals(gameArea.width, 600, '遊戲區域寬度應該有預設值');
        assert.equals(gameArea.height, 300, '遊戲區域高度應該有預設值');
    });

    it('應該能夠開始遊戲', function() {
        miniGame.start();
        
        assert.isTrue(miniGame.isActive, '遊戲應該變為活躍狀態');
        assert.isFalse(miniGame.isCompleted, '遊戲應該未完成');
        assert.equals(miniGame.progress, 0, '進度應該重置為0');
        assert.equals(miniGame.stats.attempts, 1, '嘗試次數應該增加');
        assert.isTrue(miniGame.stats.startTime > 0, '開始時間應該被記錄');
    });

    it('應該能夠創建UI元素', function() {
        miniGame.createUI();
        
        assert.equals(miniGame.uiElements.length, 2, '應該創建2個UI元素');
        assert.equals(miniGame.instructions.type, 'label', '說明應該是標籤類型');
        assert.equals(miniGame.progressBar.type, 'progressBar', '進度條應該是進度條類型');
    });

    it('應該能夠更新進度', function() {
        miniGame.start();
        miniGame.createUI();
        
        miniGame.updateProgress(0.5);
        
        assert.equals(miniGame.progress, 0.5, '進度應該被更新');
        assert.equals(miniGame.progressBar.progress, 0.5, '進度條應該反映新進度');
    });

    it('應該能夠檢查點是否在遊戲區域內', function() {
        const gameArea = miniGame.gameArea;
        
        // 測試區域內的點
        assert.isTrue(miniGame.isPointInGameArea(gameArea.x + 50, gameArea.y + 50), '區域內的點應該返回true');
        
        // 測試區域外的點
        assert.isFalse(miniGame.isPointInGameArea(gameArea.x - 10, gameArea.y - 10), '區域外的點應該返回false');
        assert.isFalse(miniGame.isPointInGameArea(gameArea.x + gameArea.width + 10, gameArea.y + gameArea.height + 10), '區域外的點應該返回false');
        
        // 測試邊界點
        assert.isTrue(miniGame.isPointInGameArea(gameArea.x, gameArea.y), '左上角邊界點應該返回true');
        assert.isTrue(miniGame.isPointInGameArea(gameArea.x + gameArea.width, gameArea.y + gameArea.height), '右下角邊界點應該返回true');
    });

    it('應該能夠處理輸入事件', function() {
        miniGame.isActive = true;
        
        // 測試區域外的輸入
        const outsideEvent = { x: 50, y: 50 };
        const outsideResult = miniGame.handleInput(outsideEvent);
        assert.isFalse(outsideResult, '區域外的輸入應該返回false');
        
        // 測試區域內的輸入
        const insideEvent = { x: 200, y: 200 };
        let gameInputCalled = false;
        miniGame.handleGameInput = function(event) {
            gameInputCalled = true;
            return true;
        };
        
        const insideResult = miniGame.handleInput(insideEvent);
        assert.isTrue(gameInputCalled, '區域內的輸入應該調用遊戲特定處理');
    });

    it('應該能夠檢查完成條件', function() {
        miniGame.start();
        
        // 設置完成回調
        let completeCalled = false;
        miniGame.onComplete = function(success) {
            completeCalled = true;
        };
        
        // 更新進度到成功閾值
        miniGame.updateProgress(0.8);
        miniGame.checkCompletion();
        
        assert.isTrue(miniGame.isCompleted, '遊戲應該標記為完成');
        assert.isTrue(miniGame.isSuccessful, '遊戲應該標記為成功');
        assert.isTrue(completeCalled, '完成回調應該被調用');
    });

    it('應該能夠計算分數', function() {
        miniGame.stats.startTime = Date.now() - 5000; // 5秒前開始
        miniGame.stats.endTime = Date.now();
        miniGame.stats.attempts = 1;
        
        miniGame.calculateScore();
        
        assert.isTrue(miniGame.stats.score > 0, '分數應該大於0');
        assert.isTrue(miniGame.stats.score <= 200, '分數應該在合理範圍內'); // 基礎分100 + 時間獎勵50 + 準確度獎勵50
    });

    it('應該能夠計算時間獎勵', function() {
        miniGame.config.timeLimit = 10000; // 10秒限制
        miniGame.stats.startTime = Date.now() - 5000; // 5秒前開始
        miniGame.stats.endTime = Date.now();
        
        const timeBonus = miniGame.calculateTimeBonus();
        
        assert.isTrue(timeBonus > 0, '時間獎勵應該大於0');
        assert.isTrue(timeBonus <= 50, '時間獎勵應該不超過50分');
    });

    it('應該能夠計算準確度獎勵', function() {
        // 測試一次成功
        miniGame.stats.attempts = 1;
        let accuracyBonus = miniGame.calculateAccuracyBonus();
        assert.equals(accuracyBonus, 50, '一次成功應該獲得50分獎勵');
        
        // 測試三次內成功
        miniGame.stats.attempts = 3;
        accuracyBonus = miniGame.calculateAccuracyBonus();
        assert.equals(accuracyBonus, 25, '三次內成功應該獲得25分獎勵');
        
        // 測試超過三次
        miniGame.stats.attempts = 5;
        accuracyBonus = miniGame.calculateAccuracyBonus();
        assert.equals(accuracyBonus, 0, '超過三次應該無獎勵');
    });

    it('應該能夠處理失敗情況', function() {
        miniGame.start();
        
        let failCalled = false;
        miniGame.onFail = function(reason) {
            failCalled = true;
        };
        
        miniGame.fail('測試失敗');
        
        assert.isTrue(failCalled, '失敗回調應該被調用');
    });

    it('應該能夠處理最大嘗試次數限制', function() {
        miniGame.config.maxAttempts = 2;
        miniGame.stats.attempts = 2;
        
        let completeCalled = false;
        miniGame.onComplete = function(success) {
            completeCalled = true;
        };
        
        miniGame.fail('測試失敗');
        
        assert.isTrue(completeCalled, '達到最大嘗試次數時應該調用完成回調');
        assert.isTrue(miniGame.isCompleted, '遊戲應該標記為完成');
        assert.isFalse(miniGame.isSuccessful, '遊戲應該標記為失敗');
    });

    it('應該能夠重置遊戲', function() {
        miniGame.progress = 0.5;
        miniGame.isCompleted = true;
        miniGame.isSuccessful = true;
        
        miniGame.reset();
        
        assert.equals(miniGame.progress, 0, '進度應該重置為0');
        assert.isFalse(miniGame.isCompleted, '完成狀態應該重置');
        assert.isFalse(miniGame.isSuccessful, '成功狀態應該重置');
    });

    it('應該能夠暫停和恢復遊戲', function() {
        miniGame.isActive = true;
        
        miniGame.pause();
        assert.isFalse(miniGame.isActive, '遊戲應該被暫停');
        
        miniGame.resume();
        assert.isTrue(miniGame.isActive, '遊戲應該恢復');
    });

    it('應該能夠清理資源', function() {
        miniGame.createUI();
        assert.isTrue(miniGame.uiElements.length > 0, '應該有UI元素');
        
        miniGame.cleanup();
        
        assert.isFalse(miniGame.isActive, '遊戲應該變為非活躍');
        assert.equals(miniGame.uiElements.length, 0, 'UI元素應該被清理');
        assert.isNull(miniGame.instructions, '說明應該被清理');
        assert.isNull(miniGame.progressBar, '進度條應該被清理');
    });

    it('應該能夠獲取遊戲結果', function() {
        miniGame.isCompleted = true;
        miniGame.isSuccessful = true;
        miniGame.progress = 1.0;
        miniGame.stats.score = 150;
        
        const result = miniGame.getResult();
        
        assert.equals(result.name, 'TestMiniGame', '結果應該包含遊戲名稱');
        assert.isTrue(result.completed, '結果應該反映完成狀態');
        assert.isTrue(result.successful, '結果應該反映成功狀態');
        assert.equals(result.progress, 1.0, '結果應該包含進度');
        assert.equals(result.stats.score, 150, '結果應該包含分數');
    });

    it('應該能夠處理時間限制', function() {
        miniGame.config.timeLimit = 100; // 100毫秒限制
        miniGame.start();
        
        let failCalled = false;
        miniGame.onFail = function(reason) {
            failCalled = true;
        };
        
        // 模擬時間經過
        miniGame.stats.startTime = Date.now() - 200; // 200毫秒前開始
        
        miniGame.update(16);
        
        assert.isTrue(failCalled, '超時應該調用失敗回調');
    });

    it('應該能夠渲染遊戲區域', function() {
        const mockContext = mockGameEngine.context;
        let fillRectCalled = false;
        let strokeRectCalled = false;
        
        mockContext.fillRect = function(x, y, width, height) {
            fillRectCalled = true;
            assert.equals(x, miniGame.gameArea.x, '填充矩形X座標應該正確');
            assert.equals(y, miniGame.gameArea.y, '填充矩形Y座標應該正確');
            assert.equals(width, miniGame.gameArea.width, '填充矩形寬度應該正確');
            assert.equals(height, miniGame.gameArea.height, '填充矩形高度應該正確');
        };
        
        mockContext.strokeRect = function(x, y, width, height) {
            strokeRectCalled = true;
            assert.equals(x, miniGame.gameArea.x, '邊框矩形X座標應該正確');
            assert.equals(y, miniGame.gameArea.y, '邊框矩形Y座標應該正確');
            assert.equals(width, miniGame.gameArea.width, '邊框矩形寬度應該正確');
            assert.equals(height, miniGame.gameArea.height, '邊框矩形高度應該正確');
        };
        
        miniGame.renderGameArea(mockContext);
        
        assert.isTrue(fillRectCalled, '應該繪製填充矩形');
        assert.isTrue(strokeRectCalled, '應該繪製邊框矩形');
    });
});