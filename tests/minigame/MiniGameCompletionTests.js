/**
 * 迷你遊戲完成條件驗證測試
 * 測試各個迷你遊戲的完成邏輯和驗證機制
 */

describe('迷你遊戲完成條件驗證測試', function() {
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
                drawImage: function() {},
                arc: function() {},
                fill: function() {},
                stroke: function() {},
                beginPath: function() {},
                closePath: function() {},
                moveTo: function() {},
                lineTo: function() {},
                fillStyle: '',
                strokeStyle: '',
                lineWidth: 1,
                font: '',
                textAlign: '',
                globalAlpha: 1
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
            },
            assetManager: {
                getAsset: function(name) {
                    return { width: 100, height: 100 };
                }
            }
        };

        mockScene = {
            name: 'testScene',
            gameEngine: mockGameEngine
        };
    });

    describe('鴨子品質檢查遊戲', function() {
        let duckQualityGame;

        beforeEach(function() {
            // 模擬DuckQualityGame類別
            global.DuckQualityGame = class extends MiniGame {
                constructor(config) {
                    super(config);
                    this.checkedFeatures = [];
                    this.requiredFeatures = ['skin', 'body', 'weight'];
                    this.duckImage = null;
                }

                setupGame() {
                    this.checkedFeatures = [];
                    this.duckImage = this.gameEngine.assetManager.getAsset('duck_selection');
                }

                handleGameInput(event) {
                    if (event.type === 'click') {
                        const feature = this.getClickedFeature(event.x, event.y);
                        if (feature && !this.checkedFeatures.includes(feature)) {
                            this.checkedFeatures.push(feature);
                            this.updateProgress(this.checkedFeatures.length / this.requiredFeatures.length);
                            return true;
                        }
                    }
                    return false;
                }

                getClickedFeature(x, y) {
                    const gameArea = this.gameArea;
                    const relativeX = x - gameArea.x;
                    const relativeY = y - gameArea.y;

                    // 模擬點擊區域檢測
                    if (relativeX >= 100 && relativeX <= 200 && relativeY >= 50 && relativeY <= 150) {
                        return 'skin';
                    } else if (relativeX >= 200 && relativeX <= 300 && relativeY >= 100 && relativeY <= 200) {
                        return 'body';
                    } else if (relativeX >= 300 && relativeX <= 400 && relativeY >= 150 && relativeY <= 250) {
                        return 'weight';
                    }
                    return null;
                }

                renderGame(context) {
                    // 渲染鴨子圖片和檢查點
                    const gameArea = this.gameArea;
                    
                    // 渲染檢查點
                    this.requiredFeatures.forEach((feature, index) => {
                        const x = gameArea.x + 150 + (index * 100);
                        const y = gameArea.y + 100 + (index * 50);
                        
                        context.fillStyle = this.checkedFeatures.includes(feature) ? '#32CD32' : '#FFB6C1';
                        context.fillRect(x, y, 80, 80);
                        
                        context.fillStyle = '#000';
                        context.font = '12px Microsoft JhengHei';
                        context.textAlign = 'center';
                        context.fillText(feature, x + 40, y + 45);
                    });
                }
            };

            duckQualityGame = new DuckQualityGame({
                name: 'DuckQualityGame',
                gameEngine: mockGameEngine,
                scene: mockScene,
                successThreshold: 1.0
            });
        });

        it('應該能夠檢測鴨子特徵點擊', function() {
            duckQualityGame.start();
            
            // 點擊皮膚區域
            const skinClickResult = duckQualityGame.handleInput({
                type: 'click',
                x: 250, // gameArea.x(100) + 150
                y: 200  // gameArea.y(150) + 50
            });
            
            assert.isTrue(skinClickResult, '皮膚區域點擊應該被處理');
            assert.isTrue(duckQualityGame.checkedFeatures.includes('skin'), '皮膚特徵應該被標記為已檢查');
            assert.equals(duckQualityGame.progress, 1/3, '進度應該更新為1/3');
        });

        it('應該能夠完成所有特徵檢查', function() {
            duckQualityGame.start();
            
            let completeCalled = false;
            duckQualityGame.onComplete = function(success) {
                completeCalled = true;
                assert.isTrue(success, '遊戲應該成功完成');
            };
            
            // 依次點擊所有特徵
            duckQualityGame.handleInput({ type: 'click', x: 250, y: 200 }); // skin
            duckQualityGame.handleInput({ type: 'click', x: 350, y: 250 }); // body
            duckQualityGame.handleInput({ type: 'click', x: 450, y: 300 }); // weight
            
            assert.equals(duckQualityGame.checkedFeatures.length, 3, '所有特徵都應該被檢查');
            assert.equals(duckQualityGame.progress, 1.0, '進度應該達到100%');
            assert.isTrue(completeCalled, '完成回調應該被調用');
        });

        it('應該能夠防止重複點擊同一特徵', function() {
            duckQualityGame.start();
            
            // 多次點擊同一區域
            duckQualityGame.handleInput({ type: 'click', x: 250, y: 200 }); // skin
            duckQualityGame.handleInput({ type: 'click', x: 250, y: 200 }); // skin again
            
            assert.equals(duckQualityGame.checkedFeatures.length, 1, '重複點擊不應該增加檢查次數');
            assert.equals(duckQualityGame.progress, 1/3, '進度不應該因重複點擊而增加');
        });

        it('應該能夠忽略無效區域的點擊', function() {
            duckQualityGame.start();
            
            // 點擊無效區域
            const invalidClickResult = duckQualityGame.handleInput({
                type: 'click',
                x: 50,  // 遊戲區域外
                y: 50
            });
            
            assert.isFalse(invalidClickResult, '無效區域點擊不應該被處理');
            assert.equals(duckQualityGame.checkedFeatures.length, 0, '無效點擊不應該增加檢查次數');
        });
    });

    describe('重量測量遊戲', function() {
        let weightMeasurementGame;

        beforeEach(function() {
            global.WeightMeasurementGame = class extends MiniGame {
                constructor(config) {
                    super(config);
                    this.duckPosition = { x: 200, y: 200 };
                    this.scalePosition = { x: 400, y: 300 };
                    this.isDragging = false;
                    this.isOnScale = false;
                    this.targetWeight = 2.5; // kg
                    this.measuredWeight = 0;
                }

                setupGame() {
                    this.duckPosition = { x: 200, y: 200 };
                    this.isDragging = false;
                    this.isOnScale = false;
                    this.measuredWeight = 0;
                }

                handleGameInput(event) {
                    const gameArea = this.gameArea;
                    const relativeX = event.x - gameArea.x;
                    const relativeY = event.y - gameArea.y;

                    if (event.type === 'mousedown') {
                        if (this.isPointOnDuck(relativeX, relativeY)) {
                            this.isDragging = true;
                            return true;
                        }
                    } else if (event.type === 'mousemove' && this.isDragging) {
                        this.duckPosition.x = relativeX;
                        this.duckPosition.y = relativeY;
                        this.checkScalePosition();
                        return true;
                    } else if (event.type === 'mouseup') {
                        if (this.isDragging) {
                            this.isDragging = false;
                            if (this.isOnScale) {
                                this.measureWeight();
                            }
                            return true;
                        }
                    }
                    return false;
                }

                isPointOnDuck(x, y) {
                    const dx = x - this.duckPosition.x;
                    const dy = y - this.duckPosition.y;
                    return Math.sqrt(dx * dx + dy * dy) < 30;
                }

                checkScalePosition() {
                    const dx = this.duckPosition.x - this.scalePosition.x;
                    const dy = this.duckPosition.y - this.scalePosition.y;
                    this.isOnScale = Math.sqrt(dx * dx + dy * dy) < 50;
                }

                measureWeight() {
                    if (this.isOnScale) {
                        this.measuredWeight = this.targetWeight + (Math.random() - 0.5) * 0.2; // 模擬測量誤差
                        const accuracy = 1 - Math.abs(this.measuredWeight - this.targetWeight) / this.targetWeight;
                        this.updateProgress(Math.max(0, accuracy));
                        
                        if (accuracy > 0.9) { // 90%準確度視為成功
                            setTimeout(() => this.complete(true), 1000);
                        }
                    }
                }

                renderGame(context) {
                    const gameArea = this.gameArea;
                    
                    // 渲染鴨子
                    context.fillStyle = '#8B4513';
                    context.fillRect(
                        gameArea.x + this.duckPosition.x - 15,
                        gameArea.y + this.duckPosition.y - 15,
                        30, 30
                    );
                    
                    // 渲染秤
                    context.fillStyle = this.isOnScale ? '#32CD32' : '#C0C0C0';
                    context.fillRect(
                        gameArea.x + this.scalePosition.x - 25,
                        gameArea.y + this.scalePosition.y - 25,
                        50, 50
                    );
                    
                    // 顯示測量結果
                    if (this.measuredWeight > 0) {
                        context.fillStyle = '#000';
                        context.font = '16px Microsoft JhengHei';
                        context.textAlign = 'center';
                        context.fillText(
                            `重量: ${this.measuredWeight.toFixed(2)}kg`,
                            gameArea.x + gameArea.width / 2,
                            gameArea.y + 50
                        );
                    }
                }
            };

            weightMeasurementGame = new WeightMeasurementGame({
                name: 'WeightMeasurementGame',
                gameEngine: mockGameEngine,
                scene: mockScene,
                successThreshold: 0.9
            });
        });

        it('應該能夠開始拖拽鴨子', function() {
            weightMeasurementGame.start();
            
            const dragStartResult = weightMeasurementGame.handleInput({
                type: 'mousedown',
                x: 300, // gameArea.x(100) + duckPosition.x(200)
                y: 350  // gameArea.y(150) + duckPosition.y(200)
            });
            
            assert.isTrue(dragStartResult, '鴨子拖拽應該開始');
            assert.isTrue(weightMeasurementGame.isDragging, '拖拽狀態應該被設置');
        });

        it('應該能夠拖拽鴨子到秤上', function() {
            weightMeasurementGame.start();
            
            // 開始拖拽
            weightMeasurementGame.handleInput({
                type: 'mousedown',
                x: 300, y: 350
            });
            
            // 拖拽到秤的位置
            weightMeasurementGame.handleInput({
                type: 'mousemove',
                x: 500, // gameArea.x(100) + scalePosition.x(400)
                y: 450  // gameArea.y(150) + scalePosition.y(300)
            });
            
            assert.isTrue(weightMeasurementGame.isOnScale, '鴨子應該在秤上');
        });

        it('應該能夠測量重量並完成遊戲', function() {
            weightMeasurementGame.start();
            
            let completeCalled = false;
            weightMeasurementGame.onComplete = function(success) {
                completeCalled = true;
            };
            
            // 模擬完整的拖拽和測量過程
            weightMeasurementGame.handleInput({ type: 'mousedown', x: 300, y: 350 });
            weightMeasurementGame.handleInput({ type: 'mousemove', x: 500, y: 450 });
            weightMeasurementGame.handleInput({ type: 'mouseup', x: 500, y: 450 });
            
            assert.isTrue(weightMeasurementGame.measuredWeight > 0, '應該測量到重量');
            assert.isTrue(weightMeasurementGame.progress > 0, '進度應該更新');
            
            // 等待完成回調
            setTimeout(() => {
                if (weightMeasurementGame.progress >= 0.9) {
                    assert.isTrue(completeCalled, '高準確度時應該完成遊戲');
                }
            }, 1100);
        });
    });

    describe('羽毛移除遊戲', function() {
        let featherRemovalGame;

        beforeEach(function() {
            global.FeatherRemovalGame = class extends MiniGame {
                constructor(config) {
                    super(config);
                    this.feathers = [];
                    this.totalFeathers = 10;
                    this.removedFeathers = 0;
                }

                setupGame() {
                    this.feathers = [];
                    this.removedFeathers = 0;
                    
                    // 生成隨機羽毛位置
                    for (let i = 0; i < this.totalFeathers; i++) {
                        this.feathers.push({
                            x: Math.random() * (this.gameArea.width - 20) + 10,
                            y: Math.random() * (this.gameArea.height - 20) + 10,
                            removed: false,
                            size: 8 + Math.random() * 4
                        });
                    }
                }

                handleGameInput(event) {
                    if (event.type === 'click') {
                        const gameArea = this.gameArea;
                        const relativeX = event.x - gameArea.x;
                        const relativeY = event.y - gameArea.y;
                        
                        for (let feather of this.feathers) {
                            if (!feather.removed && this.isPointOnFeather(relativeX, relativeY, feather)) {
                                feather.removed = true;
                                this.removedFeathers++;
                                this.updateProgress(this.removedFeathers / this.totalFeathers);
                                return true;
                            }
                        }
                    }
                    return false;
                }

                isPointOnFeather(x, y, feather) {
                    const dx = x - feather.x;
                    const dy = y - feather.y;
                    return Math.sqrt(dx * dx + dy * dy) < feather.size;
                }

                renderGame(context) {
                    const gameArea = this.gameArea;
                    
                    // 渲染鴨子輪廓
                    context.strokeStyle = '#8B4513';
                    context.lineWidth = 2;
                    context.strokeRect(
                        gameArea.x + 50,
                        gameArea.y + 50,
                        gameArea.width - 100,
                        gameArea.height - 100
                    );
                    
                    // 渲染羽毛
                    this.feathers.forEach(feather => {
                        if (!feather.removed) {
                            context.fillStyle = '#FFB6C1';
                            context.beginPath();
                            context.arc(
                                gameArea.x + feather.x,
                                gameArea.y + feather.y,
                                feather.size,
                                0, 2 * Math.PI
                            );
                            context.fill();
                        }
                    });
                    
                    // 顯示進度
                    context.fillStyle = '#000';
                    context.font = '14px Microsoft JhengHei';
                    context.textAlign = 'left';
                    context.fillText(
                        `已移除: ${this.removedFeathers}/${this.totalFeathers}`,
                        gameArea.x + 10,
                        gameArea.y + 30
                    );
                }
            };

            featherRemovalGame = new FeatherRemovalGame({
                name: 'FeatherRemovalGame',
                gameEngine: mockGameEngine,
                scene: mockScene,
                successThreshold: 1.0
            });
        });

        it('應該能夠生成羽毛', function() {
            featherRemovalGame.start();
            
            assert.equals(featherRemovalGame.feathers.length, 10, '應該生成10根羽毛');
            assert.equals(featherRemovalGame.removedFeathers, 0, '初始移除數量應該為0');
            
            featherRemovalGame.feathers.forEach(feather => {
                assert.isFalse(feather.removed, '羽毛初始狀態應該未移除');
                assert.isTrue(feather.size > 0, '羽毛應該有大小');
            });
        });

        it('應該能夠點擊移除羽毛', function() {
            featherRemovalGame.start();
            
            const firstFeather = featherRemovalGame.feathers[0];
            const clickResult = featherRemovalGame.handleInput({
                type: 'click',
                x: featherRemovalGame.gameArea.x + firstFeather.x,
                y: featherRemovalGame.gameArea.y + firstFeather.y
            });
            
            assert.isTrue(clickResult, '羽毛點擊應該被處理');
            assert.isTrue(firstFeather.removed, '羽毛應該被標記為已移除');
            assert.equals(featherRemovalGame.removedFeathers, 1, '移除計數應該增加');
            assert.equals(featherRemovalGame.progress, 0.1, '進度應該更新為10%');
        });

        it('應該能夠完成所有羽毛移除', function() {
            featherRemovalGame.start();
            
            let completeCalled = false;
            featherRemovalGame.onComplete = function(success) {
                completeCalled = true;
                assert.isTrue(success, '遊戲應該成功完成');
            };
            
            // 移除所有羽毛
            featherRemovalGame.feathers.forEach(feather => {
                featherRemovalGame.handleInput({
                    type: 'click',
                    x: featherRemovalGame.gameArea.x + feather.x,
                    y: featherRemovalGame.gameArea.y + feather.y
                });
            });
            
            assert.equals(featherRemovalGame.removedFeathers, 10, '所有羽毛都應該被移除');
            assert.equals(featherRemovalGame.progress, 1.0, '進度應該達到100%');
            assert.isTrue(completeCalled, '完成回調應該被調用');
        });

        it('應該能夠忽略已移除羽毛的點擊', function() {
            featherRemovalGame.start();
            
            const firstFeather = featherRemovalGame.feathers[0];
            
            // 第一次點擊
            featherRemovalGame.handleInput({
                type: 'click',
                x: featherRemovalGame.gameArea.x + firstFeather.x,
                y: featherRemovalGame.gameArea.y + firstFeather.y
            });
            
            // 第二次點擊同一羽毛
            const secondClickResult = featherRemovalGame.handleInput({
                type: 'click',
                x: featherRemovalGame.gameArea.x + firstFeather.x,
                y: featherRemovalGame.gameArea.y + firstFeather.y
            });
            
            assert.isFalse(secondClickResult, '已移除羽毛的點擊應該被忽略');
            assert.equals(featherRemovalGame.removedFeathers, 1, '移除計數不應該重複增加');
        });
    });

    describe('通用迷你遊戲完成條件測試', function() {
        it('應該能夠處理時間限制完成條件', function() {
            const timedGame = new MiniGame({
                name: 'TimedGame',
                gameEngine: mockGameEngine,
                scene: mockScene,
                timeLimit: 1000, // 1秒
                successThreshold: 0.5
            });
            
            timedGame.start();
            
            let failCalled = false;
            timedGame.onFail = function(reason) {
                failCalled = true;
                assert.isTrue(reason.includes('時間'), '失敗原因應該與時間相關');
            };
            
            // 模擬時間經過
            timedGame.stats.startTime = Date.now() - 1500; // 1.5秒前開始
            timedGame.update(16);
            
            assert.isTrue(failCalled, '超時應該觸發失敗');
        });

        it('應該能夠處理嘗試次數限制', function() {
            const limitedGame = new MiniGame({
                name: 'LimitedGame',
                gameEngine: mockGameEngine,
                scene: mockScene,
                maxAttempts: 2,
                successThreshold: 1.0
            });
            
            limitedGame.start();
            limitedGame.stats.attempts = 2; // 已經嘗試2次
            
            let completeCalled = false;
            limitedGame.onComplete = function(success) {
                completeCalled = true;
                assert.isFalse(success, '達到最大嘗試次數時應該失敗');
            };
            
            limitedGame.fail('測試失敗');
            
            assert.isTrue(completeCalled, '達到最大嘗試次數時應該調用完成回調');
            assert.isTrue(limitedGame.isCompleted, '遊戲應該標記為完成');
            assert.isFalse(limitedGame.isSuccessful, '遊戲應該標記為失敗');
        });

        it('應該能夠處理成功閾值條件', function() {
            const thresholdGame = new MiniGame({
                name: 'ThresholdGame',
                gameEngine: mockGameEngine,
                scene: mockScene,
                successThreshold: 0.8
            });
            
            thresholdGame.start();
            
            let completeCalled = false;
            thresholdGame.onComplete = function(success) {
                completeCalled = true;
                assert.isTrue(success, '達到成功閾值時應該成功');
            };
            
            // 更新進度到閾值
            thresholdGame.updateProgress(0.8);
            thresholdGame.checkCompletion();
            
            assert.isTrue(completeCalled, '達到成功閾值時應該調用完成回調');
            assert.isTrue(thresholdGame.isCompleted, '遊戲應該標記為完成');
            assert.isTrue(thresholdGame.isSuccessful, '遊戲應該標記為成功');
        });
    });
});