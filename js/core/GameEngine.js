/**
 * 遊戲引擎核心類別
 * 負責遊戲的初始化、更新循環和渲染管理
 */
class GameEngine {
    constructor() {
        this.canvas = null;
        this.context = null;
        this.isRunning = false;
        this.isPaused = false;
        this.lastTime = 0;
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS;
        
        // 管理器實例
        this.sceneManager = null;
        this.assetManager = null;
        this.audioManager = null;
        this.progressManager = null;
        this.uiManager = null;
        this.visualFeedback = null;
        this.sceneTransitions = null;
        
        // 自動保存相關
        this.autoSaveInterval = 30000; // 30秒自動保存一次
        this.lastAutoSave = 0;
        
        // 遊戲狀態
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
            settings: {
                soundEnabled: true,
                language: 'zh-TW'
            }
        };
    }

    /**
     * 初始化遊戲引擎
     */
    async init() {
        try {
            // 檢查瀏覽器相容性
            if (!this.checkBrowserCompatibility()) {
                throw new Error('瀏覽器不支援此遊戲所需的功能');
            }
            
            // 獲取Canvas元素
            this.canvas = document.getElementById('gameCanvas');
            if (!this.canvas) {
                throw new Error('找不到遊戲Canvas元素');
            }
            
            this.context = this.canvas.getContext('2d');
            if (!this.context) {
                throw new Error('無法獲取Canvas 2D上下文');
            }

            // 初始化管理器
            console.log('初始化 AssetManager...');
            this.assetManager = new AssetManager();
            
            console.log('初始化 AudioManager...');
            this.audioManager = new AudioManager();
            
            console.log('初始化 ProgressManager...');
            this.progressManager = new ProgressManager();
            
            console.log('初始化 UIManager...');
            this.uiManager = new UIManager();
            
            console.log('初始化 VisualFeedbackManager...');
            this.visualFeedback = new VisualFeedbackManager();
            
            console.log('初始化 SceneTransitionManager...');
            this.sceneTransitions = new SceneTransitionManager();
            
            console.log('初始化 SceneManager...');
            this.sceneManager = new SceneManager(this);
            
            // 設置管理器間的關聯
            this.progressManager.setVisualFeedback(this.visualFeedback);
            this.progressManager.setEventCallbacks({
                onScoreChange: (oldScore, newScore, points) => {
                    console.log(`分數從 ${oldScore} 增加到 ${newScore} (+${points})`);
                },
                onStepComplete: (stepName, completionPercentage) => {
                    console.log(`步驟完成: ${stepName}, 總進度: ${completionPercentage.toFixed(1)}%`);
                },
                onAchievementUnlock: (achievement) => {
                    console.log(`解鎖成就: ${achievement.name}`);
                    // 創建成就通知
                    const notification = new AchievementNotification({
                        achievement: achievement,
                        x: 400,
                        y: 100
                    });
                    this.visualFeedback.feedbackElements.push(notification);
                }
            });
            
            // 同步音效設定
            this.audioManager.setSoundEnabled(this.gameState.settings.soundEnabled);

            // 效能優化
            this.optimizePerformance();

            // 設置輸入事件監聽
            this.setupInputHandlers();
            
            // 載入遊戲資源
            await this.loadGameAssets();
            
            console.log('遊戲引擎初始化完成');
            return true;
        } catch (error) {
            console.error('遊戲引擎初始化失敗:', error);
            return false;
        }
    }

    /**
     * 載入遊戲資源
     */
    async loadGameAssets() {
        try {
            console.log('開始載入遊戲資源...');
            
            // 預載入核心資源（可選，失敗不影響遊戲運行）
            const coreAssets = [
                { type: 'image', name: 'background_welcome', path: 'assets/images/backgrounds/welcome_bg.png' },
                { type: 'image', name: 'logo', path: 'assets/images/ui/game_logo.png' },
                { type: 'image', name: 'button_start', path: 'assets/images/ui/button_start.png' }
            ];

            // 嘗試載入資源，但不阻塞遊戲初始化
            this.assetManager.preloadAssets(coreAssets).catch(error => {
                console.warn('部分資源載入失敗，遊戲將使用佔位符:', error);
            });
            
            // 預載入音效資源（可選）
            this.audioManager.preloadSounds().catch(error => {
                console.warn('音效資源載入失敗，遊戲將以靜音模式運行:', error);
            });
            
            console.log('遊戲資源載入程序已啟動');
        } catch (error) {
            console.warn('資源載入過程中發生錯誤，遊戲將繼續運行:', error);
        }
    }

    /**
     * 設置輸入事件處理
     */
    setupInputHandlers() {
        // 滑鼠點擊事件
        this.canvas.addEventListener('click', (event) => {
            if (this.sceneManager.currentScene) {
                const rect = this.canvas.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                this.sceneManager.currentScene.handleInput({
                    type: 'click',
                    x: x,
                    y: y
                });
            }
        });

        // 滑鼠移動事件
        this.canvas.addEventListener('mousemove', (event) => {
            if (this.sceneManager.currentScene) {
                const rect = this.canvas.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                this.sceneManager.currentScene.handleInput({
                    type: 'mousemove',
                    x: x,
                    y: y
                });
            }
        });

        // 滑鼠釋放事件
        this.canvas.addEventListener('mouseup', (event) => {
            if (this.sceneManager.currentScene) {
                const rect = this.canvas.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                this.sceneManager.currentScene.handleInput({
                    type: 'mouseup',
                    x: x,
                    y: y
                });
            }
        });

        // 滑鼠按下事件
        this.canvas.addEventListener('mousedown', (event) => {
            if (this.sceneManager.currentScene) {
                const rect = this.canvas.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                this.sceneManager.currentScene.handleInput({
                    type: 'mousedown',
                    x: x,
                    y: y
                });
            }
        });

        // 觸控事件支援
        this.canvas.addEventListener('touchstart', (event) => {
            event.preventDefault();
            if (this.sceneManager.currentScene && event.touches.length > 0) {
                const rect = this.canvas.getBoundingClientRect();
                const touch = event.touches[0];
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;
                this.sceneManager.currentScene.handleInput({
                    type: 'click',
                    x: x,
                    y: y
                });
            }
        });

        // 觸控移動事件
        this.canvas.addEventListener('touchmove', (event) => {
            event.preventDefault();
            if (this.sceneManager.currentScene && event.touches.length > 0) {
                const rect = this.canvas.getBoundingClientRect();
                const touch = event.touches[0];
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;
                this.sceneManager.currentScene.handleInput({
                    type: 'mousemove',
                    x: x,
                    y: y
                });
            }
        });

        // 觸控結束事件
        this.canvas.addEventListener('touchend', (event) => {
            event.preventDefault();
            if (this.sceneManager.currentScene) {
                this.sceneManager.currentScene.handleInput({
                    type: 'mouseup',
                    x: 0,
                    y: 0
                });
            }
        });
    }

    /**
     * 開始遊戲循環
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.isPaused = false;
        this.lastTime = performance.now();
        
        // 開始第一個場景
        this.sceneManager.changeScene('welcome');
        
        // 開始遊戲循環
        this.gameLoop();
        
        console.log('遊戲開始運行');
    }

    /**
     * 主遊戲循環
     */
    gameLoop() {
        if (!this.isRunning) return;

        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastTime;

        if (deltaTime >= this.frameInterval) {
            if (!this.isPaused) {
                this.update(deltaTime);
                this.render();
            }
            this.lastTime = currentTime;
        }

        requestAnimationFrame(() => this.gameLoop());
    }

    /**
     * 更新遊戲邏輯
     */
    update(deltaTime) {
        try {
            // 效能監控
            this.monitorPerformance();
            
            // 更新遊戲時間統計
            this.progressManager.updatePlayTime(deltaTime);
            
            // 自動保存檢查
            this.lastAutoSave += deltaTime;
            if (this.lastAutoSave >= this.autoSaveInterval) {
                this.saveGameProgress();
                this.lastAutoSave = 0;
            }
            
            if (this.sceneManager.currentScene) {
                this.sceneManager.currentScene.update(deltaTime);
            }
            
            this.uiManager.update(deltaTime);
            this.visualFeedback.update(deltaTime);
            this.sceneTransitions.update(deltaTime);
        } catch (error) {
            console.error('更新邏輯錯誤:', error);
            // 嘗試恢復
            this.handleUpdateError(error);
        }
    }

    /**
     * 處理更新錯誤
     */
    handleUpdateError(error) {
        console.error('遊戲更新錯誤，嘗試恢復:', error);
        
        try {
            // 重置有問題的管理器
            if (error.message.includes('sceneManager')) {
                console.log('重置場景管理器');
                this.sceneManager.changeScene('welcome');
            }
            
            if (error.message.includes('uiManager')) {
                console.log('重置UI管理器');
                this.uiManager = new UIManager();
            }
            
        } catch (recoveryError) {
            console.error('無法恢復遊戲狀態:', recoveryError);
            this.showFatalError('遊戲狀態錯誤，請重新載入頁面');
        }
    }

    /**
     * 渲染遊戲畫面
     */
    render() {
        try {
            // 優化Canvas渲染
            this.optimizeCanvasRendering();
            
            // 清空畫布
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            // 渲染當前場景
            if (this.sceneManager.currentScene) {
                this.sceneManager.currentScene.render(this.context);
            }
            
            // 渲染UI覆蓋層
            this.uiManager.render(this.context);
            
            // 渲染視覺反饋效果
            this.visualFeedback.render(this.context);
            
            // 渲染場景切換效果（最上層）
            this.sceneTransitions.render(this.context);
        } catch (error) {
            console.error('渲染錯誤:', error);
            // 嘗試恢復渲染
            this.handleRenderError(error);
        }
    }

    /**
     * 優化Canvas渲染
     */
    optimizeCanvasRendering() {
        // 設置圖像平滑
        this.context.imageSmoothingEnabled = true;
        this.context.imageSmoothingQuality = 'high';
        
        // 設置文字渲染優化
        this.context.textBaseline = 'top';
        this.context.textAlign = 'left';
    }

    /**
     * 處理渲染錯誤
     */
    handleRenderError(error) {
        console.error('渲染系統錯誤，嘗試恢復:', error);
        
        try {
            // 重新獲取Canvas上下文
            this.context = this.canvas.getContext('2d');
            
            // 重置Canvas狀態
            this.context.save();
            this.context.restore();
            
            // 降低品質模式
            this.enableLowPerformanceMode();
            
        } catch (recoveryError) {
            console.error('無法恢復渲染系統:', recoveryError);
            this.showFatalError('渲染系統故障，請重新載入頁面');
        }
    }

    /**
     * 顯示致命錯誤
     */
    showFatalError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Arial, sans-serif;
            font-size: 18px;
            text-align: center;
            z-index: 10000;
        `;
        
        errorDiv.innerHTML = `
            <div>
                <h2>遊戲錯誤</h2>
                <p>${message}</p>
                <button onclick="location.reload()" style="
                    padding: 10px 20px;
                    font-size: 16px;
                    background: #007bff;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-top: 20px;
                ">重新載入遊戲</button>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
    }

    /**
     * 記憶體管理和清理
     */
    performMemoryCleanup() {
        try {
            // 清理未使用的資源
            if (this.assetManager) {
                this.assetManager.cleanupUnusedAssets();
            }
            
            // 清理音效資源
            if (this.audioManager) {
                this.audioManager.cleanupUnusedSounds();
            }
            
            // 清理視覺效果
            if (this.visualFeedback) {
                this.visualFeedback.cleanup();
            }
            
            // 強制垃圾回收（如果支援）
            if (window.gc) {
                window.gc();
            }
            
            console.log('記憶體清理完成');
        } catch (error) {
            console.error('記憶體清理失敗:', error);
        }
    }

    /**
     * 監控效能
     */
    monitorPerformance() {
        if (!performance.mark) return;
        
        const now = performance.now();
        
        // 記錄FPS
        if (!this.performanceStats) {
            this.performanceStats = {
                frameCount: 0,
                lastFPSCheck: now,
                currentFPS: 0,
                memoryUsage: 0
            };
        }
        
        this.performanceStats.frameCount++;
        
        // 每秒計算一次FPS
        if (now - this.performanceStats.lastFPSCheck >= 1000) {
            this.performanceStats.currentFPS = this.performanceStats.frameCount;
            this.performanceStats.frameCount = 0;
            this.performanceStats.lastFPSCheck = now;
            
            // 檢查記憶體使用
            if (performance.memory) {
                this.performanceStats.memoryUsage = performance.memory.usedJSHeapSize;
            }
            
            // 如果效能太低，自動優化
            if (this.performanceStats.currentFPS < this.targetFPS * 0.7) {
                console.warn(`FPS過低 (${this.performanceStats.currentFPS})，啟用效能優化`);
                this.enableLowPerformanceMode();
            }
            
            // 如果記憶體使用過高，執行清理
            if (this.performanceStats.memoryUsage > 100000000) { // 100MB
                console.warn('記憶體使用過高，執行清理');
                this.performMemoryCleanup();
            }
        }
    }

    /**
     * 暫停遊戲
     */
    pause() {
        this.isPaused = true;
        console.log('遊戲已暫停');
    }

    /**
     * 恢復遊戲
     */
    resume() {
        this.isPaused = false;
        this.lastTime = performance.now();
        console.log('遊戲已恢復');
    }

    /**
     * 停止遊戲
     */
    stop() {
        this.isRunning = false;
        this.isPaused = false;
        console.log('遊戲已停止');
    }

    /**
     * 獲取遊戲狀態
     */
    getGameState() {
        return { ...this.gameState };
    }

    /**
     * 更新遊戲狀態
     */
    updateGameState(newState) {
        this.gameState = { ...this.gameState, ...newState };
        this.progressManager.saveProgress(this.gameState);
    }

    /**
     * 創建場景切換效果
     */
    createSceneTransition(type, targetScene, config = {}) {
        const transition = this.sceneTransitions.startTransition(type, {
            ...config,
            onMidpoint: () => {
                if (targetScene && this.sceneManager) {
                    this.sceneManager.changeScene(targetScene);
                }
            }
        });
        
        return transition;
    }

    /**
     * 觸發步驟完成
     */
    completeStep(stepName, x, y) {
        this.progressManager.completeStep(stepName, x, y);
    }

    /**
     * 增加分數
     */
    addScore(points, x, y, type) {
        this.progressManager.addScore(points, x, y, type);
    }

    /**
     * 開始新遊戲
     */
    startNewGame() {
        console.log('開始新遊戲');
        
        // 重置進度管理器
        const newGameState = this.progressManager.startNewGame();
        
        // 更新遊戲引擎狀態
        this.gameState = { ...newGameState };
        
        // 重置場景到歡迎畫面
        this.sceneManager.changeScene('welcome');
        
        return newGameState;
    }

    /**
     * 完成當前遊戲
     */
    completeCurrentGame() {
        console.log('完成當前遊戲');
        
        // 調用進度管理器的完成遊戲方法
        const completionData = this.progressManager.completeGame();
        
        // 更新遊戲狀態
        this.updateGameState({
            gameCompleted: true,
            completionData: completionData
        });
        
        return completionData;
    }

    /**
     * 重置遊戲進度
     */
    resetGameProgress() {
        console.log('重置遊戲進度');
        
        // 重置進度管理器
        this.progressManager.resetProgress();
        
        // 重置遊戲引擎狀態
        this.gameState = this.progressManager.getCurrentProgress();
        
        // 返回歡迎場景
        this.sceneManager.changeScene('welcome');
    }

    /**
     * 載入遊戲進度
     */
    loadGameProgress() {
        console.log('載入遊戲進度');
        
        // 從進度管理器載入進度
        this.progressManager.loadProgress();
        
        // 更新遊戲引擎狀態
        this.gameState = this.progressManager.getCurrentProgress();
        
        // 根據進度切換到對應場景
        const currentScene = this.gameState.currentScene || 'welcome';
        this.sceneManager.changeScene(currentScene);
        
        return this.gameState;
    }

    /**
     * 保存遊戲進度
     */
    saveGameProgress() {
        console.log('保存遊戲進度');
        
        // 保存當前狀態
        this.progressManager.saveProgress(this.gameState);
        
        return true;
    }

    /**
     * 檢查遊戲是否已完成
     */
    isGameCompleted() {
        return this.progressManager.isGameCompleted();
    }

    /**
     * 獲取遊戲統計資料
     */
    getGameStatistics() {
        return this.progressManager.getStatistics();
    }

    /**
     * 獲取遊戲成就
     */
    getGameAchievements() {
        return this.progressManager.getAchievements();
    }

    /**
     * 設置音效開關
     */
    setSoundEnabled(enabled) {
        this.gameState.settings.soundEnabled = enabled;
        this.audioManager.setSoundEnabled(enabled);
        this.saveGameProgress();
    }

    /**
     * 設置音樂音量
     */
    setMusicVolume(volume) {
        this.audioManager.setMusicVolume(volume);
    }

    /**
     * 設置音效音量
     */
    setSoundVolume(volume) {
        this.audioManager.setSoundVolume(volume);
    }

    /**
     * 播放音效
     */
    playSound(soundName, volume = null) {
        if (this.gameState.settings.soundEnabled) {
            this.audioManager.playSound(soundName, volume);
        }
    }

    /**
     * 播放背景音樂
     */
    playBackgroundMusic(musicName, loop = true) {
        if (this.gameState.settings.soundEnabled) {
            this.audioManager.playBackgroundMusic(musicName, loop);
        }
    }

    /**
     * 停止背景音樂
     */
    stopBackgroundMusic() {
        this.audioManager.stopBackgroundMusic();
    }

    /**
     * 檢查瀏覽器相容性
     */
    checkBrowserCompatibility() {
        const compatibility = {
            canvas: false,
            audio: false,
            localStorage: false,
            requestAnimationFrame: false,
            es6: false
        };

        try {
            // 檢查Canvas支援
            const testCanvas = document.createElement('canvas');
            compatibility.canvas = !!(testCanvas.getContext && testCanvas.getContext('2d'));

            // 檢查Audio支援
            compatibility.audio = !!(window.Audio);

            // 檢查LocalStorage支援
            compatibility.localStorage = !!(window.localStorage);

            // 檢查requestAnimationFrame支援
            compatibility.requestAnimationFrame = !!(window.requestAnimationFrame);

            // 檢查ES6支援（箭頭函數、const/let等）
            try {
                eval('const test = () => {}; let x = 1;');
                compatibility.es6 = true;
            } catch (e) {
                compatibility.es6 = false;
            }

            // 記錄相容性資訊
            console.log('瀏覽器相容性檢查:', compatibility);

            // 檢查必要功能
            const required = ['canvas', 'localStorage', 'requestAnimationFrame'];
            const missing = required.filter(feature => !compatibility[feature]);

            if (missing.length > 0) {
                console.error('缺少必要功能:', missing);
                this.showCompatibilityError(missing);
                return false;
            }

            // 檢查可選功能
            if (!compatibility.audio) {
                console.warn('音效功能不可用，遊戲將以靜音模式運行');
                this.gameState.settings.soundEnabled = false;
            }

            if (!compatibility.es6) {
                console.warn('ES6功能不完全支援，可能影響遊戲效能');
            }

            return true;
        } catch (error) {
            console.error('相容性檢查失敗:', error);
            return false;
        }
    }

    /**
     * 顯示相容性錯誤訊息
     */
    showCompatibilityError(missingFeatures) {
        const errorMessage = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #fff;
                border: 2px solid #ff0000;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                z-index: 9999;
                font-family: Arial, sans-serif;
                text-align: center;
                max-width: 400px;
            ">
                <h3 style="color: #ff0000; margin-top: 0;">瀏覽器不相容</h3>
                <p>您的瀏覽器缺少以下必要功能：</p>
                <ul style="text-align: left; color: #666;">
                    ${missingFeatures.map(feature => `<li>${this.getFeatureName(feature)}</li>`).join('')}
                </ul>
                <p>請更新您的瀏覽器或使用以下推薦瀏覽器：</p>
                <ul style="text-align: left; color: #333;">
                    <li>Chrome 60+</li>
                    <li>Firefox 55+</li>
                    <li>Safari 11+</li>
                    <li>Edge 79+</li>
                </ul>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', errorMessage);
    }

    /**
     * 獲取功能名稱
     */
    getFeatureName(feature) {
        const names = {
            canvas: 'HTML5 Canvas',
            audio: 'HTML5 Audio',
            localStorage: 'Local Storage',
            requestAnimationFrame: 'Request Animation Frame',
            es6: 'ES6 JavaScript'
        };
        return names[feature] || feature;
    }

    /**
     * 效能優化設定
     */
    optimizePerformance() {
        // 根據裝置效能調整設定
        const performance = this.detectPerformance();
        
        if (performance === 'low') {
            console.log('檢測到低效能裝置，啟用效能優化模式');
            this.targetFPS = 30;
            this.frameInterval = 1000 / this.targetFPS;
            this.enableLowPerformanceMode();
        } else if (performance === 'medium') {
            console.log('檢測到中等效能裝置，使用標準設定');
            this.targetFPS = 45;
            this.frameInterval = 1000 / this.targetFPS;
        } else {
            console.log('檢測到高效能裝置，使用最佳品質設定');
            this.targetFPS = 60;
            this.frameInterval = 1000 / this.targetFPS;
        }
    }

    /**
     * 檢測裝置效能
     */
    detectPerformance() {
        // 簡單的效能檢測
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 測試渲染效能
        const startTime = performance.now();
        for (let i = 0; i < 1000; i++) {
            ctx.fillRect(Math.random() * 100, Math.random() * 100, 10, 10);
        }
        const renderTime = performance.now() - startTime;
        
        // 檢查記憶體
        const memoryInfo = performance.memory;
        const availableMemory = memoryInfo ? memoryInfo.jsHeapSizeLimit : 0;
        
        // 檢查CPU核心數
        const cores = navigator.hardwareConcurrency || 1;
        
        console.log(`效能檢測 - 渲染時間: ${renderTime.toFixed(2)}ms, 記憶體: ${availableMemory}, CPU核心: ${cores}`);
        
        if (renderTime > 50 || availableMemory < 50000000 || cores < 2) {
            return 'low';
        } else if (renderTime > 20 || availableMemory < 100000000 || cores < 4) {
            return 'medium';
        } else {
            return 'high';
        }
    }

    /**
     * 啟用低效能模式
     */
    enableLowPerformanceMode() {
        // 減少視覺效果
        if (this.visualFeedback) {
            this.visualFeedback.setLowPerformanceMode(true);
        }
        
        // 減少場景切換效果
        if (this.sceneTransitions) {
            this.sceneTransitions.setLowPerformanceMode(true);
        }

        console.log('低效能模式已啟用');
    }
}

// 匯出到全域作用域
window.GameEngine = GameEngine;