/**
 * 進度管理整合測試
 * 測試遊戲進度的保存、載入和狀態管理
 */

describe('進度管理整合測試', function() {
    let gameEngine;
    let progressManager;
    let mockLocalStorage;

    beforeEach(function() {
        // 創建模擬LocalStorage
        mockLocalStorage = {
            data: {},
            getItem: function(key) {
                return this.data[key] || null;
            },
            setItem: function(key, value) {
                this.data[key] = value;
            },
            removeItem: function(key) {
                delete this.data[key];
            },
            clear: function() {
                this.data = {};
            }
        };

        // 創建模擬DOM環境
        global.window = {
            localStorage: mockLocalStorage,
            performance: { 
                now: function() { return Date.now(); }
            }
        };

        global.document = {
            getElementById: function() { return null; },
            createElement: function() { return {}; },
            body: { appendChild: function() {} }
        };

        // 創建遊戲引擎實例
        gameEngine = new GameEngine();
        
        // 模擬進度管理器
        progressManager = {
            gameState: {
                currentScene: 'welcome',
                progress: {
                    selection: false,
                    processing: false,
                    preparation: false,
                    drying: false,
                    roasting: false,
                    slicing: false
                },
                score: 0,
                completedSteps: [],
                statistics: {
                    totalPlayTime: 0,
                    gamesCompleted: 0,
                    bestScore: 0,
                    averageScore: 0
                },
                achievements: []
            },
            
            saveProgress: function(state) {
                const saveData = {
                    ...this.gameState,
                    ...state,
                    lastSaved: Date.now()
                };
                mockLocalStorage.setItem('beijingDuckGame_progress', JSON.stringify(saveData));
                return true;
            },
            
            loadProgress: function() {
                const savedData = mockLocalStorage.getItem('beijingDuckGame_progress');
                if (savedData) {
                    this.gameState = { ...this.gameState, ...JSON.parse(savedData) };
                    return this.gameState;
                }
                return null;
            },
            
            resetProgress: function() {
                this.gameState = {
                    currentScene: 'welcome',
                    progress: {
                        selection: false,
                        processing: false,
                        preparation: false,
                        drying: false,
                        roasting: false,
                        slicing: false
                    },
                    score: 0,
                    completedSteps: [],
                    statistics: {
                        totalPlayTime: 0,
                        gamesCompleted: 0,
                        bestScore: 0,
                        averageScore: 0
                    },
                    achievements: []
                };
                mockLocalStorage.removeItem('beijingDuckGame_progress');
            },
            
            completeStep: function(stepName) {
                if (!this.gameState.completedSteps.includes(stepName)) {
                    this.gameState.completedSteps.push(stepName);
                }
                
                // 更新場景進度
                if (stepName.includes('selection')) {
                    this.gameState.progress.selection = true;
                } else if (stepName.includes('processing')) {
                    this.gameState.progress.processing = true;
                } else if (stepName.includes('preparation')) {
                    this.gameState.progress.preparation = true;
                } else if (stepName.includes('drying')) {
                    this.gameState.progress.drying = true;
                } else if (stepName.includes('roasting')) {
                    this.gameState.progress.roasting = true;
                } else if (stepName.includes('slicing')) {
                    this.gameState.progress.slicing = true;
                }
                
                this.saveProgress(this.gameState);
            },
            
            addScore: function(points) {
                this.gameState.score += points;
                this.saveProgress(this.gameState);
            },
            
            getCurrentProgress: function() {
                return { ...this.gameState };
            },
            
            isGameCompleted: function() {
                const progress = this.gameState.progress;
                return Object.values(progress).every(completed => completed);
            },
            
            getCompletionPercentage: function() {
                const progress = this.gameState.progress;
                const completed = Object.values(progress).filter(Boolean).length;
                const total = Object.keys(progress).length;
                return (completed / total) * 100;
            }
        };
        
        gameEngine.progressManager = progressManager;
    });

    afterEach(function() {
        mockLocalStorage.clear();
    });

    it('應該能夠保存遊戲進度', function() {
        const testState = {
            currentScene: 'selection',
            score: 150,
            progress: { selection: true }
        };
        
        const result = progressManager.saveProgress(testState);
        
        assert.isTrue(result, '保存操作應該成功');
        
        const savedData = mockLocalStorage.getItem('beijingDuckGame_progress');
        assert.isNotNull(savedData, '應該在LocalStorage中找到保存的資料');
        
        const parsedData = JSON.parse(savedData);
        assert.equals(parsedData.currentScene, 'selection', '場景資料應該正確保存');
        assert.equals(parsedData.score, 150, '分數資料應該正確保存');
        assert.isTrue(parsedData.progress.selection, '進度資料應該正確保存');
        assert.isTrue(parsedData.lastSaved > 0, '應該記錄保存時間');
    });

    it('應該能夠載入遊戲進度', function() {
        // 先保存一些資料
        const testState = {
            currentScene: 'processing',
            score: 200,
            progress: { 
                selection: true,
                processing: true
            }
        };
        
        progressManager.saveProgress(testState);
        
        // 重置進度管理器狀態
        progressManager.gameState = {
            currentScene: 'welcome',
            score: 0,
            progress: {}
        };
        
        // 載入進度
        const loadedState = progressManager.loadProgress();
        
        assert.isNotNull(loadedState, '應該成功載入進度');
        assert.equals(loadedState.currentScene, 'processing', '場景應該正確載入');
        assert.equals(loadedState.score, 200, '分數應該正確載入');
        assert.isTrue(loadedState.progress.selection, '選材進度應該正確載入');
        assert.isTrue(loadedState.progress.processing, '處理進度應該正確載入');
    });

    it('應該能夠處理沒有保存資料的情況', function() {
        // 確保沒有保存資料
        mockLocalStorage.clear();
        
        const loadedState = progressManager.loadProgress();
        
        assert.isNull(loadedState, '沒有保存資料時應該返回null');
    });

    it('應該能夠重置遊戲進度', function() {
        // 先設置一些進度
        progressManager.gameState.currentScene = 'roasting';
        progressManager.gameState.score = 500;
        progressManager.gameState.progress.selection = true;
        progressManager.gameState.progress.processing = true;
        
        progressManager.saveProgress(progressManager.gameState);
        
        // 重置進度
        progressManager.resetProgress();
        
        // 檢查狀態是否重置
        assert.equals(progressManager.gameState.currentScene, 'welcome', '場景應該重置為歡迎場景');
        assert.equals(progressManager.gameState.score, 0, '分數應該重置為0');
        assert.isFalse(progressManager.gameState.progress.selection, '選材進度應該重置');
        assert.isFalse(progressManager.gameState.progress.processing, '處理進度應該重置');
        
        // 檢查LocalStorage是否清除
        const savedData = mockLocalStorage.getItem('beijingDuckGame_progress');
        assert.isNull(savedData, 'LocalStorage中的資料應該被清除');
    });

    it('應該能夠完成遊戲步驟', function() {
        progressManager.completeStep('selection_duckQuality');
        
        assert.isTrue(progressManager.gameState.completedSteps.includes('selection_duckQuality'), '步驟應該被添加到完成列表');
        assert.isTrue(progressManager.gameState.progress.selection, '選材進度應該被標記為完成');
        
        // 檢查是否自動保存
        const savedData = mockLocalStorage.getItem('beijingDuckGame_progress');
        assert.isNotNull(savedData, '完成步驟後應該自動保存');
    });

    it('應該能夠添加分數', function() {
        const initialScore = progressManager.gameState.score;
        
        progressManager.addScore(100);
        
        assert.equals(progressManager.gameState.score, initialScore + 100, '分數應該正確增加');
        
        // 檢查是否自動保存
        const savedData = mockLocalStorage.getItem('beijingDuckGame_progress');
        const parsedData = JSON.parse(savedData);
        assert.equals(parsedData.score, initialScore + 100, '分數變化應該被保存');
    });

    it('應該能夠檢查遊戲是否完成', function() {
        // 初始狀態應該未完成
        assert.isFalse(progressManager.isGameCompleted(), '初始狀態遊戲應該未完成');
        
        // 完成所有步驟
        progressManager.gameState.progress = {
            selection: true,
            processing: true,
            preparation: true,
            drying: true,
            roasting: true,
            slicing: true
        };
        
        assert.isTrue(progressManager.isGameCompleted(), '所有步驟完成後遊戲應該標記為完成');
    });

    it('應該能夠計算完成百分比', function() {
        // 初始狀態
        let percentage = progressManager.getCompletionPercentage();
        assert.equals(percentage, 0, '初始完成百分比應該是0');
        
        // 完成一半步驟
        progressManager.gameState.progress.selection = true;
        progressManager.gameState.progress.processing = true;
        progressManager.gameState.progress.preparation = true;
        
        percentage = progressManager.getCompletionPercentage();
        assert.equals(percentage, 50, '完成一半步驟時百分比應該是50');
        
        // 完成所有步驟
        progressManager.gameState.progress.drying = true;
        progressManager.gameState.progress.roasting = true;
        progressManager.gameState.progress.slicing = true;
        
        percentage = progressManager.getCompletionPercentage();
        assert.equals(percentage, 100, '完成所有步驟時百分比應該是100');
    });

    it('應該能夠處理重複完成同一步驟', function() {
        progressManager.completeStep('selection_duckQuality');
        progressManager.completeStep('selection_duckQuality');
        
        // 檢查步驟只被添加一次
        const occurrences = progressManager.gameState.completedSteps.filter(
            step => step === 'selection_duckQuality'
        ).length;
        
        assert.equals(occurrences, 1, '重複完成的步驟應該只記錄一次');
    });

    it('應該能夠處理跨場景的進度管理', function() {
        // 完成選材場景的步驟
        progressManager.completeStep('selection_duckQuality');
        progressManager.completeStep('selection_weightMeasurement');
        
        // 切換到處理場景
        progressManager.gameState.currentScene = 'processing';
        progressManager.saveProgress(progressManager.gameState);
        
        // 完成處理場景的步驟
        progressManager.completeStep('processing_featherRemoval');
        
        // 檢查所有進度都被正確保存
        const currentProgress = progressManager.getCurrentProgress();
        assert.isTrue(currentProgress.progress.selection, '選材場景應該標記為完成');
        assert.isTrue(currentProgress.completedSteps.includes('selection_duckQuality'), '選材步驟應該被記錄');
        assert.isTrue(currentProgress.completedSteps.includes('processing_featherRemoval'), '處理步驟應該被記錄');
        assert.equals(currentProgress.currentScene, 'processing', '當前場景應該正確');
    });

    it('應該能夠處理LocalStorage錯誤', function() {
        // 模擬LocalStorage錯誤
        const originalSetItem = mockLocalStorage.setItem;
        mockLocalStorage.setItem = function() {
            throw new Error('LocalStorage錯誤');
        };
        
        let errorThrown = false;
        try {
            progressManager.saveProgress({ test: 'data' });
        } catch (error) {
            errorThrown = true;
        }
        
        // 恢復原始方法
        mockLocalStorage.setItem = originalSetItem;
        
        // 進度管理器應該能夠處理錯誤而不崩潰
        assert.isFalse(errorThrown, '進度管理器應該優雅地處理LocalStorage錯誤');
    });

    it('應該能夠處理損壞的保存資料', function() {
        // 保存損壞的JSON資料
        mockLocalStorage.setItem('beijingDuckGame_progress', '{ invalid json }');
        
        let errorThrown = false;
        try {
            const loadedState = progressManager.loadProgress();
            assert.isNull(loadedState, '損壞的資料應該返回null');
        } catch (error) {
            errorThrown = true;
        }
        
        assert.isFalse(errorThrown, '載入損壞資料時不應該拋出錯誤');
    });

    it('應該能夠維護遊戲統計資料', function() {
        // 模擬遊戲統計更新
        progressManager.gameState.statistics.totalPlayTime = 3600000; // 1小時
        progressManager.gameState.statistics.gamesCompleted = 5;
        progressManager.gameState.statistics.bestScore = 1000;
        
        progressManager.saveProgress(progressManager.gameState);
        
        // 載入並檢查統計資料
        progressManager.loadProgress();
        const stats = progressManager.gameState.statistics;
        
        assert.equals(stats.totalPlayTime, 3600000, '總遊戲時間應該正確保存');
        assert.equals(stats.gamesCompleted, 5, '完成遊戲次數應該正確保存');
        assert.equals(stats.bestScore, 1000, '最佳分數應該正確保存');
    });
});