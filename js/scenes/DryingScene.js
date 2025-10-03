/**
 * 晾胚場景
 * 北京烤鴨製作的風乾階段，包含懸掛、時間管理和環境控制
 */
class DryingScene extends Scene {
    constructor(name, gameEngine) {
        super(name, gameEngine);
        
        // 場景UI元素
        this.titleLabel = null;
        this.instructionLabel = null;
        this.educationPanel = null;
        this.nextButton = null;
        this.backButton = null;
        this.stepIndicator = null;
        
        // 晾胚步驟管理
        this.dryingSteps = [
            {
                id: 'hanging_setup',
                name: '懸掛設置',
                description: '正確懸掛鴨胚並調整環境',
                miniGameClass: 'HangingEnvironmentGame',
                completed: false,
                educationContent: {
                    title: '晾胚懸掛的技術要點',
                    content: `🪝 懸掛技術精要：

📍 懸掛位置：
• 選擇：通風良好的陰涼處
• 高度：離地面1.5-2米
• 間距：鴨胚間保持30cm距離
• 方向：頭部向下，利於瀝水

🌡️ 環境控制：
• 溫度：15-20°C最佳
• 濕度：60-70%相對濕度
• 通風：微風循環，避免強風
• 時間：根據季節調整6-24小時

🔬 風乾原理：
• 水分蒸發：皮下水分緩慢散失
• 皮質收縮：形成緊實質感
• 蛋白凝固：增強皮肉結構
• 風味濃縮：提升整體口感

⚖️ 品質指標：
• 皮面乾燥無水珠
• 觸感緊實有彈性
• 色澤均勻自然
• 無異味產生`
                }
            }
        ];
        
        // 當前步驟狀態
        this.currentStepIndex = 0;
        this.showingEducation = false;
        
        // 場景進度
        this.sceneProgress = {
            allStepsCompleted: false,
            readyForNextScene: false
        };
        
        // 時間管理系統
        this.timeManager = {
            totalDryingTime: 12 * 60 * 60, // 12小時（秒）
            currentTime: 0,
            timeSpeed: 1, // 時間倍速
            isPaused: false,
            qualityFactor: 1.0, // 品質因子，受環境影響
            dryingProgress: 0 // 0-100%
        };
        
        // 鴨胚展示系統
        this.duckDisplay = {
            x: 300,
            y: 120,
            width: 200,
            height: 150,
            duckImage: null,
            dryingState: 'prepared', // prepared, hanging, drying, dried
            moistureLevel: 100, // 100-0%
            skinTightness: 0,   // 0-100%
            isHanging: false,
            hangingHeight: 0
        };
        
        // 環境控制系統
        this.environmentControls = {
            temperature: {
                current: 18,
                target: 18,
                min: 10,
                max: 25,
                optimal: { min: 15, max: 20 }
            },
            humidity: {
                current: 65,
                target: 65,
                min: 40,
                max: 90,
                optimal: { min: 60, max: 70 }
            },
            airflow: {
                current: 2,
                target: 2,
                min: 0,
                max: 5,
                optimal: { min: 1, max: 3 }
            }
        };
        
        // 視覺效果系統
        this.visualEffects = {
            windParticles: [],
            moistureDrops: [],
            temperatureIndicators: []
        };
    }

    /**
     * 載入場景資源
     */
    async loadSceneAssets() {
        const assetManager = this.gameEngine.assetManager;
        
        // 載入背景和晾胚相關圖片
        await assetManager.loadImage('assets/images/backgrounds/drying_bg.png', 'background_drying');
        await assetManager.loadImage('assets/images/duck/duck_prepared.png', 'duck_prepared');
        await assetManager.loadImage('assets/images/duck/duck_hanging.png', 'duck_hanging');
        await assetManager.loadImage('assets/images/duck/duck_drying.png', 'duck_drying');
        await assetManager.loadImage('assets/images/duck/duck_dried.png', 'duck_dried');
        
        // 載入環境控制相關圖片
        await assetManager.loadImage('assets/images/environment/thermometer.png', 'thermometer');
        await assetManager.loadImage('assets/images/environment/hygrometer.png', 'hygrometer');
        await assetManager.loadImage('assets/images/environment/fan.png', 'fan');
        await assetManager.loadImage('assets/images/environment/hook.png', 'hanging_hook');
        
        // 載入效果圖片
        await assetManager.loadImage('assets/images/effects/wind_lines.png', 'wind_effect');
        await assetManager.loadImage('assets/images/effects/water_drop.png', 'water_drop');
        await assetManager.loadImage('assets/images/effects/time_clock.png', 'time_clock');
        
        this.backgroundImage = assetManager.getAsset('background_drying');
        this.duckDisplay.duckImage = assetManager.getAsset('duck_prepared');
    }

    /**
     * 設置場景
     */
    setupScene() {
        const uiManager = this.gameEngine.uiManager;
        const canvas = this.gameEngine.canvas;
        
        // 創建場景標題
        this.titleLabel = uiManager.createLabel({
            x: canvas.width / 2,
            y: 40,
            text: '晾胚階段 - 風乾工藝',
            fontSize: 26,
            color: '#4682B4',
            align: 'center'
        });

        // 創建說明文字
        this.instructionLabel = uiManager.createLabel({
            x: canvas.width / 2,
            y: 80,
            text: '掌握北京烤鴨晾胚的時間與環境控制',
            fontSize: 16,
            color: '#708090',
            align: 'center'
        });

        // 創建步驟指示器
        this.createStepIndicator();

        // 創建教育內容按鈕
        this.createEducationButton();

        // 創建時間控制面板
        this.createTimeControlPanel();

        // 創建環境控制面板
        this.createEnvironmentControlPanel();

        // 創建開始步驟按鈕
        this.nextButton = uiManager.createButton({
            x: canvas.width - 180,
            y: canvas.height - 80,
            width: 130,
            height: 50,
            text: '開始懸掛',
            onClick: () => this.startCurrentStep()
        });
        this.addUIElement(this.nextButton);

        // 創建返回按鈕
        this.backButton = uiManager.createButton({
            x: 50,
            y: canvas.height - 80,
            width: 100,
            height: 50,
            text: '返回',
            onClick: () => this.goBack()
        });
        this.addUIElement(this.backButton);

        // 創建晾胚進度顯示
        this.createDryingProgress();

        console.log('晾胚場景設置完成');
    }

    /**
     * 創建步驟指示器
     */
    createStepIndicator() {
        const uiManager = this.gameEngine.uiManager;
        
        this.stepIndicator = uiManager.createLabel({
            x: 50,
            y: 120,
            text: this.getStepIndicatorText(),
            fontSize: 14,
            color: '#4682B4',
            align: 'left'
        });
    }

    /**
     * 獲取步驟指示器文字
     */
    getStepIndicatorText() {
        let text = '晾胚步驟進度：\n';
        
        this.dryingSteps.forEach((step, index) => {
            const status = step.completed ? '✅' : 
                          (index === this.currentStepIndex ? '🔄' : '⏳');
            text += `${status} ${index + 1}. ${step.name}\n`;
        });
        
        return text;
    }

    /**
     * 創建教育內容按鈕
     */
    createEducationButton() {
        const uiManager = this.gameEngine.uiManager;
        
        const educationButton = uiManager.createButton({
            x: 50,
            y: 200,
            width: 130,
            height: 40,
            text: '學習晾胚技術',
            onClick: () => this.showCurrentStepEducation()
        });
        
        this.addUIElement(educationButton);
    }

    /**
     * 創建時間控制面板
     */
    createTimeControlPanel() {
        const uiManager = this.gameEngine.uiManager;
        
        // 時間顯示標籤
        this.timeDisplayLabel = uiManager.createLabel({
            x: 580,
            y: 120,
            text: this.getTimeDisplayText(),
            fontSize: 14,
            color: '#2F4F4F',
            align: 'left'
        });
        
        // 時間控制按鈕
        this.timeSpeedButton = uiManager.createButton({
            x: 580,
            y: 140,
            width: 100,
            height: 30,
            text: '正常速度 1x',
            onClick: () => this.toggleTimeSpeed()
        });
        
        this.pauseButton = uiManager.createButton({
            x: 580,
            y: 175,
            width: 100,
            height: 30,
            text: '暫停',
            onClick: () => this.togglePause()
        });
        
        this.addUIElement(this.timeDisplayLabel);
        this.addUIElement(this.timeSpeedButton);
        this.addUIElement(this.pauseButton);
    }

    /**
     * 創建環境控制面板
     */
    createEnvironmentControlPanel() {
        const uiManager = this.gameEngine.uiManager;
        
        // 溫度控制
        this.temperatureLabel = uiManager.createLabel({
            x: 580,
            y: 220,
            text: `溫度: ${this.environmentControls.temperature.current}°C`,
            fontSize: 14,
            color: '#FF4500',
            align: 'left'
        });
        
        // 濕度控制
        this.humidityLabel = uiManager.createLabel({
            x: 580,
            y: 240,
            text: `濕度: ${this.environmentControls.humidity.current}%`,
            fontSize: 14,
            color: '#4169E1',
            align: 'left'
        });
        
        // 通風控制
        this.airflowLabel = uiManager.createLabel({
            x: 580,
            y: 260,
            text: `通風: ${this.environmentControls.airflow.current}級`,
            fontSize: 14,
            color: '#32CD32',
            align: 'left'
        });
        
        this.addUIElement(this.temperatureLabel);
        this.addUIElement(this.humidityLabel);
        this.addUIElement(this.airflowLabel);
    }

    /**
     * 創建晾胚進度顯示
     */
    createDryingProgress() {
        const uiManager = this.gameEngine.uiManager;
        
        // 晾胚進度標籤
        this.dryingProgressLabel = uiManager.createLabel({
            x: 580,
            y: 290,
            text: '晾胚進度: 0%',
            fontSize: 14,
            color: '#8B4513',
            align: 'left'
        });
        
        // 水分含量標籤
        this.moistureLabel = uiManager.createLabel({
            x: 580,
            y: 310,
            text: '水分含量: 100%',
            fontSize: 14,
            color: '#1E90FF',
            align: 'left'
        });
        
        // 皮質緊實度標籤
        this.tightnessLabel = uiManager.createLabel({
            x: 580,
            y: 330,
            text: '皮質緊實度: 0%',
            fontSize: 14,
            color: '#DAA520',
            align: 'left'
        });
        
        this.addUIElement(this.dryingProgressLabel);
        this.addUIElement(this.moistureLabel);
        this.addUIElement(this.tightnessLabel);
    }

    /**
     * 獲取時間顯示文字
     */
    getTimeDisplayText() {
        const hours = Math.floor(this.timeManager.currentTime / 3600);
        const minutes = Math.floor((this.timeManager.currentTime % 3600) / 60);
        const totalHours = Math.floor(this.timeManager.totalDryingTime / 3600);
        
        return `晾胚時間: ${hours}:${minutes.toString().padStart(2, '0')} / ${totalHours}:00`;
    }

    /**
     * 切換時間速度
     */
    toggleTimeSpeed() {
        const speeds = [1, 2, 5, 10];
        const currentIndex = speeds.indexOf(this.timeManager.timeSpeed);
        const nextIndex = (currentIndex + 1) % speeds.length;
        
        this.timeManager.timeSpeed = speeds[nextIndex];
        this.timeSpeedButton.setText(`${this.timeManager.timeSpeed === 1 ? '正常' : '加速'}速度 ${this.timeManager.timeSpeed}x`);
        
        // 時間加速會影響品質
        if (this.timeManager.timeSpeed > 2) {
            this.timeManager.qualityFactor = Math.max(0.7, 1.0 - (this.timeManager.timeSpeed - 2) * 0.1);
        } else {
            this.timeManager.qualityFactor = 1.0;
        }
    }

    /**
     * 切換暫停狀態
     */
    togglePause() {
        this.timeManager.isPaused = !this.timeManager.isPaused;
        this.pauseButton.setText(this.timeManager.isPaused ? '繼續' : '暫停');
    }

    /**
     * 顯示當前步驟的教育內容
     */
    showCurrentStepEducation() {
        if (this.currentStepIndex >= this.dryingSteps.length) return;
        
        const currentStep = this.dryingSteps[this.currentStepIndex];
        this.showEducationPanel(currentStep.educationContent);
    }

    /**
     * 顯示教育面板
     */
    showEducationPanel(content) {
        this.showingEducation = true;
        const uiManager = this.gameEngine.uiManager;
        const canvas = this.gameEngine.canvas;

        // 創建教育面板
        this.educationPanel = {
            title: uiManager.createLabel({
                x: canvas.width / 2,
                y: 120,
                text: content.title,
                fontSize: 20,
                color: '#FFD700',
                align: 'center'
            }),
            content: uiManager.createLabel({
                x: 80,
                y: 160,
                text: content.content,
                fontSize: 14,
                color: '#FFFFFF',
                align: 'left'
            }),
            closeButton: uiManager.createButton({
                x: canvas.width / 2 - 40,
                y: canvas.height - 120,
                width: 80,
                height: 35,
                text: '關閉',
                onClick: () => this.hideEducationPanel()
            })
        };

        this.addUIElement(this.educationPanel.closeButton);

        if (this.gameEngine.gameState.settings.soundEnabled) {
            this.gameEngine.audioManager.playSound('button_click');
        }
    }

    /**
     * 隱藏教育面板
     */
    hideEducationPanel() {
        if (!this.showingEducation || !this.educationPanel) return;

        this.showingEducation = false;
        const uiManager = this.gameEngine.uiManager;

        // 移除教育面板元素
        Object.values(this.educationPanel).forEach(element => {
            uiManager.removeUIElement(element);
            this.removeUIElement(element);
        });

        this.educationPanel = null;
    }

    /**
     * 開始當前步驟
     */
    startCurrentStep() {
        if (this.currentStepIndex >= this.dryingSteps.length) {
            this.proceedToNextScene();
            return;
        }

        const currentStep = this.dryingSteps[this.currentStepIndex];
        console.log(`開始步驟: ${currentStep.name}`);
        
        this.hideEducationPanel();
        this.hideSceneUI();
        
        // 開始懸掛和環境控制遊戲
        this.startHangingEnvironmentGame();
    }

    /**
     * 開始懸掛和環境控制迷你遊戲
     */
    startHangingEnvironmentGame() {
        console.log('啟動懸掛和環境控制迷你遊戲');
        
        // 開始懸掛環境迷你遊戲
        this.startMiniGame(HangingEnvironmentGame, {
            gameEngine: this.gameEngine,
            scene: this,
            gameAreaX: 100,
            gameAreaY: 140,
            gameAreaWidth: 600,
            gameAreaHeight: 320,
            duckDisplay: this.duckDisplay,
            environmentControls: this.environmentControls,
            onProgressUpdate: (progress) => {
                this.updateDryingProgress(progress);
            }
        });
    }

    /**
     * 更新晾胚進度
     */
    updateDryingProgress(progress) {
        this.timeManager.dryingProgress = progress.dryingProgress || 0;
        this.duckDisplay.moistureLevel = progress.moistureLevel || 100;
        this.duckDisplay.skinTightness = progress.skinTightness || 0;
        
        if (this.dryingProgressLabel) {
            this.dryingProgressLabel.setText(`晾胚進度: ${Math.round(this.timeManager.dryingProgress)}%`);
        }
        if (this.moistureLabel) {
            this.moistureLabel.setText(`水分含量: ${Math.round(this.duckDisplay.moistureLevel)}%`);
        }
        if (this.tightnessLabel) {
            this.tightnessLabel.setText(`皮質緊實度: ${Math.round(this.duckDisplay.skinTightness)}%`);
        }
    }

    /**
     * 更新場景邏輯
     */
    update(deltaTime) {
        super.update(deltaTime);
        
        // 更新時間管理系統
        this.updateTimeManager(deltaTime);
        
        // 更新環境系統
        this.updateEnvironmentSystem(deltaTime);
        
        // 更新視覺效果
        this.updateVisualEffects(deltaTime);
        
        // 更新UI顯示
        this.updateUIDisplays();
    }

    /**
     * 更新時間管理系統
     */
    updateTimeManager(deltaTime) {
        if (!this.timeManager.isPaused && this.duckDisplay.isHanging) {
            this.timeManager.currentTime += deltaTime * this.timeManager.timeSpeed;
            
            // 計算晾胚進度
            const timeProgress = Math.min(this.timeManager.currentTime / this.timeManager.totalDryingTime, 1.0);
            this.timeManager.dryingProgress = timeProgress * 100 * this.timeManager.qualityFactor;
            
            // 更新鴨胚狀態
            this.updateDuckDryingState(timeProgress);
        }
    }

    /**
     * 更新環境系統
     */
    updateEnvironmentSystem(deltaTime) {
        const controls = this.environmentControls;
        
        // 計算環境品質因子
        let environmentQuality = 1.0;
        
        // 溫度影響
        const tempOptimal = controls.temperature.optimal;
        if (controls.temperature.current < tempOptimal.min || controls.temperature.current > tempOptimal.max) {
            environmentQuality *= 0.8;
        }
        
        // 濕度影響
        const humidOptimal = controls.humidity.optimal;
        if (controls.humidity.current < humidOptimal.min || controls.humidity.current > humidOptimal.max) {
            environmentQuality *= 0.8;
        }
        
        // 通風影響
        const airflowOptimal = controls.airflow.optimal;
        if (controls.airflow.current < airflowOptimal.min || controls.airflow.current > airflowOptimal.max) {
            environmentQuality *= 0.9;
        }
        
        // 更新品質因子
        this.timeManager.qualityFactor = Math.min(this.timeManager.qualityFactor, environmentQuality);
    }

    /**
     * 更新鴨胚晾胚狀態
     */
    updateDuckDryingState(timeProgress) {
        const assetManager = this.gameEngine.assetManager;
        
        // 更新水分含量
        this.duckDisplay.moistureLevel = Math.max(0, 100 - timeProgress * 100);
        
        // 更新皮質緊實度
        this.duckDisplay.skinTightness = Math.min(100, timeProgress * 100);
        
        // 更新鴨胚圖片
        if (timeProgress < 0.3) {
            this.duckDisplay.dryingState = 'hanging';
            this.duckDisplay.duckImage = assetManager.getAsset('duck_hanging');
        } else if (timeProgress < 0.8) {
            this.duckDisplay.dryingState = 'drying';
            this.duckDisplay.duckImage = assetManager.getAsset('duck_drying');
        } else {
            this.duckDisplay.dryingState = 'dried';
            this.duckDisplay.duckImage = assetManager.getAsset('duck_dried');
        }
    }

    /**
     * 更新視覺效果
     */
    updateVisualEffects(deltaTime) {
        // 更新風粒子效果
        this.updateWindParticles(deltaTime);
        
        // 更新水分蒸發效果
        this.updateMoistureEffects(deltaTime);
        
        // 更新溫度指示器
        this.updateTemperatureIndicators(deltaTime);
    }

    /**
     * 更新風粒子效果
     */
    updateWindParticles(deltaTime) {
        const airflow = this.environmentControls.airflow.current;
        
        // 根據通風強度生成粒子
        if (Math.random() < airflow * 0.1) {
            this.visualEffects.windParticles.push({
                x: 0,
                y: 150 + Math.random() * 200,
                vx: airflow * 20 + Math.random() * 10,
                vy: (Math.random() - 0.5) * 5,
                life: 1.0,
                size: 2 + Math.random() * 3
            });
        }
        
        // 更新現有粒子
        this.visualEffects.windParticles = this.visualEffects.windParticles.filter(particle => {
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;
            particle.life -= deltaTime * 0.5;
            return particle.life > 0 && particle.x < 800;
        });
    }

    /**
     * 更新水分蒸發效果
     */
    updateMoistureEffects(deltaTime) {
        if (this.duckDisplay.isHanging && this.duckDisplay.moistureLevel > 20) {
            // 根據水分含量生成水滴
            if (Math.random() < this.duckDisplay.moistureLevel * 0.001) {
                this.visualEffects.moistureDrops.push({
                    x: this.duckDisplay.x + Math.random() * this.duckDisplay.width,
                    y: this.duckDisplay.y + this.duckDisplay.height,
                    vy: 50 + Math.random() * 30,
                    life: 1.0,
                    size: 2 + Math.random() * 2
                });
            }
        }
        
        // 更新水滴
        this.visualEffects.moistureDrops = this.visualEffects.moistureDrops.filter(drop => {
            drop.y += drop.vy * deltaTime;
            drop.life -= deltaTime;
            return drop.life > 0 && drop.y < 500;
        });
    }

    /**
     * 更新溫度指示器
     */
    updateTemperatureIndicators(deltaTime) {
        // 根據溫度生成熱氣效果
        const temp = this.environmentControls.temperature.current;
        if (temp > 20 && Math.random() < 0.05) {
            this.visualEffects.temperatureIndicators.push({
                x: 100 + Math.random() * 600,
                y: 400,
                vy: -20 - Math.random() * 10,
                life: 2.0,
                opacity: 0.3,
                size: 5 + Math.random() * 5
            });
        }
        
        // 更新溫度指示器
        this.visualEffects.temperatureIndicators = this.visualEffects.temperatureIndicators.filter(indicator => {
            indicator.y += indicator.vy * deltaTime;
            indicator.life -= deltaTime;
            indicator.opacity = indicator.life / 2.0;
            return indicator.life > 0;
        });
    }

    /**
     * 更新UI顯示
     */
    updateUIDisplays() {
        if (this.timeDisplayLabel) {
            this.timeDisplayLabel.setText(this.getTimeDisplayText());
        }
        
        if (this.temperatureLabel) {
            this.temperatureLabel.setText(`溫度: ${this.environmentControls.temperature.current}°C`);
        }
        
        if (this.humidityLabel) {
            this.humidityLabel.setText(`濕度: ${this.environmentControls.humidity.current}%`);
        }
        
        if (this.airflowLabel) {
            this.airflowLabel.setText(`通風: ${this.environmentControls.airflow.current}級`);
        }
    }

    /**
     * 迷你遊戲完成回調
     */
    onMiniGameComplete(success, stats) {
        const gameName = this.currentMiniGame ? this.currentMiniGame.name : '未知遊戲';
        console.log(`${gameName}完成:`, success ? '成功' : '失敗');
        
        // 顯示場景UI
        this.showSceneUI();
        
        if (success) {
            this.onStepComplete('hanging_setup', success, stats);
        } else {
            // 失敗時允許重試
            this.showRetryMessage();
        }
        
        this.currentMiniGame = null;
    }

    /**
     * 步驟完成回調
     */
    onStepComplete(stepId, success, stats) {
        console.log(`步驟 ${stepId} 完成:`, success ? '成功' : '失敗');
        
        if (success) {
            // 標記步驟完成
            const step = this.dryingSteps.find(s => s.id === stepId);
            if (step) {
                step.completed = true;
                
                // 開始晾胚過程
                this.duckDisplay.isHanging = true;
                
                // 更新進度管理器
                this.gameEngine.progressManager.completeStep(stepId);
                
                // 顯示成功消息
                this.showSuccessMessage(step.name, stats.score);
                
                // 移動到下一步驟
                this.currentStepIndex++;
                this.updateStepIndicator();
                this.updateNextButton();
            }
        } else {
            // 失敗時允許重試
            this.showRetryMessage();
        }
    }

    /**
     * 更新步驟指示器
     */
    updateStepIndicator() {
        if (this.stepIndicator) {
            this.stepIndicator.setText(this.getStepIndicatorText());
        }
    }

    /**
     * 更新下一步按鈕
     */
    updateNextButton() {
        if (this.currentStepIndex >= this.dryingSteps.length) {
            // 所有步驟完成，等待晾胚完成
            this.sceneProgress.allStepsCompleted = true;
            
            this.nextButton.setText('等待晾胚完成');
            this.nextButton.onClick = () => this.checkDryingCompletion();
            
            // 標記晾胚階段開始
            this.gameEngine.updateGameState({
                progress: {
                    ...this.gameEngine.gameState.progress,
                    drying: false // 還未完全完成
                }
            });
        }
    }

    /**
     * 檢查晾胚完成狀態
     */
    checkDryingCompletion() {
        if (this.timeManager.dryingProgress >= 80) {
            this.sceneProgress.readyForNextScene = true;
            this.nextButton.setText('進入烤製階段');
            this.nextButton.onClick = () => this.proceedToNextScene();
            
            // 標記晾胚階段完成
            this.gameEngine.updateGameState({
                progress: {
                    ...this.gameEngine.gameState.progress,
                    drying: true
                }
            });
            
            this.showCompletionMessage();
        } else {
            this.showIncompleteMessage();
        }
    }

    /**
     * 顯示完成消息
     */
    showCompletionMessage() {
        const uiManager = this.gameEngine.uiManager;
        const canvas = this.gameEngine.canvas;
        
        const completionLabel = uiManager.createLabel({
            x: canvas.width / 2,
            y: canvas.height / 2 - 50,
            text: `晾胚完成！\n品質評分: ${Math.round(this.timeManager.qualityFactor * 100)}\n鴨胚已達到最佳狀態！`,
            fontSize: 18,
            color: '#32CD32',
            align: 'center'
        });
        
        setTimeout(() => {
            uiManager.removeUIElement(completionLabel);
        }, 4000);
        
        if (this.gameEngine.gameState.settings.soundEnabled) {
            this.gameEngine.audioManager.playSound('success_sound');
        }
    }

    /**
     * 顯示未完成消息
     */
    showIncompleteMessage() {
        const uiManager = this.gameEngine.uiManager;
        const canvas = this.gameEngine.canvas;
        
        const incompleteLabel = uiManager.createLabel({
            x: canvas.width / 2,
            y: canvas.height / 2 - 50,
            text: `晾胚進度: ${Math.round(this.timeManager.dryingProgress)}%\n需要達到80%才能進入下一階段\n請耐心等待或調整環境條件`,
            fontSize: 16,
            color: '#FF8C00',
            align: 'center'
        });
        
        setTimeout(() => {
            uiManager.removeUIElement(incompleteLabel);
        }, 3000);
    }

    /**
     * 顯示成功消息
     */
    showSuccessMessage(stepName, score) {
        const uiManager = this.gameEngine.uiManager;
        const canvas = this.gameEngine.canvas;
        
        const successLabel = uiManager.createLabel({
            x: canvas.width / 2,
            y: canvas.height / 2 - 50,
            text: `${stepName}完成！\n獲得分數: ${score}\n晾胚過程開始！`,
            fontSize: 18,
            color: '#32CD32',
            align: 'center'
        });
        
        setTimeout(() => {
            uiManager.removeUIElement(successLabel);
        }, 3000);
        
        if (this.gameEngine.gameState.settings.soundEnabled) {
            this.gameEngine.audioManager.playSound('success_sound');
        }
    }

    /**
     * 顯示重試消息
     */
    showRetryMessage() {
        const uiManager = this.gameEngine.uiManager;
        const canvas = this.gameEngine.canvas;
        
        const retryLabel = uiManager.createLabel({
            x: canvas.width / 2,
            y: canvas.height / 2 - 50,
            text: '懸掛需要精確操作，請再試一次',
            fontSize: 18,
            color: '#FF6B6B',
            align: 'center'
        });
        
        setTimeout(() => {
            uiManager.removeUIElement(retryLabel);
        }, 3000);
    }

    /**
     * 返回上一個場景
     */
    goBack() {
        this.transitionToScene('preparation');
    }

    /**
     * 進入下一個場景
     */
    proceedToNextScene() {
        console.log('晾胚階段完成，進入烤製階段');
        this.transitionToScene('roasting');
    }

    /**
     * 渲染場景特定內容
     */
    renderScene(context) {
        // 渲染鴨胚展示區域
        this.renderDuckDisplay(context);
        
        // 渲染環境控制面板
        this.renderEnvironmentPanel(context);
        
        // 渲染時間管理面板
        this.renderTimePanel(context);
        
        // 渲染視覺效果
        this.renderVisualEffects(context);
        
        // 渲染教育面板背景
        if (this.showingEducation) {
            this.renderEducationPanelBackground(context);
        }
    }

    /**
     * 渲染鴨胚展示系統
     */
    renderDuckDisplay(context) {
        const display = this.duckDisplay;
        
        // 繪製展示區域背景
        context.fillStyle = 'rgba(240, 248, 255, 0.95)';
        context.fillRect(display.x - 15, display.y - 15, display.width + 30, display.height + 30);
        
        context.strokeStyle = '#4682B4';
        context.lineWidth = 3;
        context.strokeRect(display.x - 15, display.y - 15, display.width + 30, display.height + 30);
        
        // 繪製懸掛系統
        if (display.isHanging) {
            this.renderHangingSystem(context, display);
        }
        
        // 繪製鴨胚圖片
        if (display.duckImage) {
            const yOffset = display.isHanging ? display.hangingHeight : 0;
            context.drawImage(display.duckImage, display.x, display.y + yOffset, display.width, display.height);
        } else {
            // 如果圖片未載入，顯示佔位符
            context.fillStyle = '#F0F8FF';
            context.fillRect(display.x, display.y, display.width, display.height);
            
            context.fillStyle = '#708090';
            context.font = '16px Microsoft JhengHei';
            context.textAlign = 'center';
            context.fillText('晾胚中的鴨胚', display.x + display.width / 2, display.y + display.height / 2);
        }
        
        // 繪製晾胚狀態標籤
        context.fillStyle = '#4682B4';
        context.font = 'bold 16px Microsoft JhengHei';
        context.textAlign = 'center';
        
        let statusText = '準備晾胚';
        if (display.dryingState === 'hanging') {
            statusText = '開始風乾';
        } else if (display.dryingState === 'drying') {
            statusText = '風乾中';
        } else if (display.dryingState === 'dried') {
            statusText = '風乾完成';
        }
        
        context.fillText(`鴨胚狀態: ${statusText}`, display.x + display.width / 2, display.y - 25);
        
        // 繪製晾胚進度條
        this.renderDryingProgressBar(context, display);
    }

    /**
     * 渲染懸掛系統
     */
    renderHangingSystem(context, display) {
        // 繪製懸掛鉤
        context.strokeStyle = '#8B4513';
        context.lineWidth = 4;
        context.beginPath();
        context.moveTo(display.x + display.width / 2, display.y - 40);
        context.lineTo(display.x + display.width / 2, display.y - 10);
        context.stroke();
        
        // 繪製懸掛鉤頭
        context.fillStyle = '#8B4513';
        context.beginPath();
        context.arc(display.x + display.width / 2, display.y - 40, 6, 0, Math.PI * 2);
        context.fill();
        
        // 繪製懸掛線
        context.strokeStyle = '#654321';
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(display.x + display.width / 2, display.y - 10);
        context.lineTo(display.x + display.width / 2, display.y + 10);
        context.stroke();
    }

    /**
     * 渲染晾胚進度條
     */
    renderDryingProgressBar(context, display) {
        const barWidth = display.width;
        const barHeight = 8;
        const barX = display.x;
        const barY = display.y + display.height + 20;
        
        // 背景
        context.fillStyle = '#E0E0E0';
        context.fillRect(barX, barY, barWidth, barHeight);
        
        // 進度
        const progressWidth = (this.timeManager.dryingProgress / 100) * barWidth;
        context.fillStyle = '#4682B4';
        context.fillRect(barX, barY, progressWidth, barHeight);
        
        // 邊框
        context.strokeStyle = '#708090';
        context.lineWidth = 1;
        context.strokeRect(barX, barY, barWidth, barHeight);
        
        // 進度文字
        context.fillStyle = '#2F4F4F';
        context.font = '12px Microsoft JhengHei';
        context.textAlign = 'center';
        context.fillText(`${Math.round(this.timeManager.dryingProgress)}%`, barX + barWidth / 2, barY + barHeight + 15);
    }

    /**
     * 渲染環境控制面板
     */
    renderEnvironmentPanel(context) {
        // 環境控制區域背景
        context.fillStyle = 'rgba(176, 196, 222, 0.8)';
        context.fillRect(560, 200, 180, 140);
        
        context.strokeStyle = '#4682B4';
        context.lineWidth = 2;
        context.strokeRect(560, 200, 180, 140);
        
        // 面板標題
        context.fillStyle = '#2F4F4F';
        context.font = 'bold 14px Microsoft JhengHei';
        context.textAlign = 'center';
        context.fillText('環境控制', 650, 195);
        
        // 繪製環境指示器
        this.renderEnvironmentIndicators(context);
    }

    /**
     * 渲染環境指示器
     */
    renderEnvironmentIndicators(context) {
        const controls = this.environmentControls;
        
        // 溫度指示器
        const tempColor = this.getEnvironmentColor(controls.temperature.current, controls.temperature.optimal);
        context.fillStyle = tempColor;
        context.fillRect(570, 350, 15, 15);
        
        // 濕度指示器
        const humidColor = this.getEnvironmentColor(controls.humidity.current, controls.humidity.optimal);
        context.fillStyle = humidColor;
        context.fillRect(570, 370, 15, 15);
        
        // 通風指示器
        const airflowColor = this.getEnvironmentColor(controls.airflow.current, controls.airflow.optimal);
        context.fillStyle = airflowColor;
        context.fillRect(570, 390, 15, 15);
    }

    /**
     * 獲取環境指示器顏色
     */
    getEnvironmentColor(current, optimal) {
        if (current >= optimal.min && current <= optimal.max) {
            return '#32CD32'; // 綠色 - 最佳
        } else if (current >= optimal.min - 2 && current <= optimal.max + 2) {
            return '#FFD700'; // 黃色 - 可接受
        } else {
            return '#FF6B6B'; // 紅色 - 不佳
        }
    }

    /**
     * 渲染時間管理面板
     */
    renderTimePanel(context) {
        // 時間控制區域背景
        context.fillStyle = 'rgba(255, 248, 220, 0.8)';
        context.fillRect(560, 100, 180, 90);
        
        context.strokeStyle = '#B8860B';
        context.lineWidth = 2;
        context.strokeRect(560, 100, 180, 90);
        
        // 面板標題
        context.fillStyle = '#8B4513';
        context.font = 'bold 14px Microsoft JhengHei';
        context.textAlign = 'center';
        context.fillText('時間管理', 650, 95);
        
        // 繪製時間進度圓環
        this.renderTimeProgressRing(context);
    }

    /**
     * 渲染時間進度圓環
     */
    renderTimeProgressRing(context) {
        const centerX = 650;
        const centerY = 130;
        const radius = 20;
        
        // 背景圓環
        context.strokeStyle = '#E0E0E0';
        context.lineWidth = 4;
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, Math.PI * 2);
        context.stroke();
        
        // 進度圓環
        const progress = this.timeManager.currentTime / this.timeManager.totalDryingTime;
        const endAngle = -Math.PI / 2 + progress * Math.PI * 2;
        
        context.strokeStyle = '#4682B4';
        context.lineWidth = 4;
        context.beginPath();
        context.arc(centerX, centerY, radius, -Math.PI / 2, endAngle);
        context.stroke();
        
        // 中心文字
        context.fillStyle = '#2F4F4F';
        context.font = '10px Microsoft JhengHei';
        context.textAlign = 'center';
        context.fillText(`${Math.round(progress * 100)}%`, centerX, centerY + 3);
    }

    /**
     * 渲染視覺效果
     */
    renderVisualEffects(context) {
        // 渲染風粒子
        this.renderWindParticles(context);
        
        // 渲染水分蒸發效果
        this.renderMoistureDrops(context);
        
        // 渲染溫度指示器
        this.renderTemperatureEffects(context);
    }

    /**
     * 渲染風粒子
     */
    renderWindParticles(context) {
        context.save();
        
        this.visualEffects.windParticles.forEach(particle => {
            context.globalAlpha = particle.life * 0.6;
            context.fillStyle = '#87CEEB';
            context.beginPath();
            context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            context.fill();
        });
        
        context.restore();
    }

    /**
     * 渲染水滴效果
     */
    renderMoistureDrops(context) {
        context.save();
        
        this.visualEffects.moistureDrops.forEach(drop => {
            context.globalAlpha = drop.life;
            context.fillStyle = '#1E90FF';
            context.beginPath();
            context.arc(drop.x, drop.y, drop.size, 0, Math.PI * 2);
            context.fill();
        });
        
        context.restore();
    }

    /**
     * 渲染溫度效果
     */
    renderTemperatureEffects(context) {
        context.save();
        
        this.visualEffects.temperatureIndicators.forEach(indicator => {
            context.globalAlpha = indicator.opacity;
            context.fillStyle = '#FFB6C1';
            context.beginPath();
            context.arc(indicator.x, indicator.y, indicator.size, 0, Math.PI * 2);
            context.fill();
        });
        
        context.restore();
    }

    /**
     * 渲染教育面板背景
     */
    renderEducationPanelBackground(context) {
        // 繪製半透明背景
        context.fillStyle = 'rgba(0, 0, 0, 0.85)';
        context.fillRect(40, 110, context.canvas.width - 80, context.canvas.height - 180);
        
        // 繪製邊框
        context.strokeStyle = '#FFD700';
        context.lineWidth = 3;
        context.strokeRect(40, 110, context.canvas.width - 80, context.canvas.height - 180);
        
        // 繪製裝飾角落
        const cornerSize = 20;
        context.fillStyle = '#FFD700';
        
        // 左上角
        context.fillRect(40, 110, cornerSize, 3);
        context.fillRect(40, 110, 3, cornerSize);
        
        // 右上角
        context.fillRect(context.canvas.width - 60 - cornerSize, 110, cornerSize, 3);
        context.fillRect(context.canvas.width - 43, 110, 3, cornerSize);
        
        // 左下角
        context.fillRect(40, context.canvas.height - 73, cornerSize, 3);
        context.fillRect(40, context.canvas.height - 90, 3, cornerSize);
        
        // 右下角
        context.fillRect(context.canvas.width - 60 - cornerSize, context.canvas.height - 73, cornerSize, 3);
        context.fillRect(context.canvas.width - 43, context.canvas.height - 90, 3, cornerSize);
    }

    /**
     * 隱藏場景UI元素
     */
    hideSceneUI() {
        if (this.titleLabel) this.titleLabel.setVisible(false);
        if (this.instructionLabel) this.instructionLabel.setVisible(false);
        if (this.stepIndicator) this.stepIndicator.setVisible(false);
        if (this.nextButton) this.nextButton.setVisible(false);
        if (this.backButton) this.backButton.setVisible(false);
        if (this.timeDisplayLabel) this.timeDisplayLabel.setVisible(false);
        if (this.timeSpeedButton) this.timeSpeedButton.setVisible(false);
        if (this.pauseButton) this.pauseButton.setVisible(false);
        if (this.temperatureLabel) this.temperatureLabel.setVisible(false);
        if (this.humidityLabel) this.humidityLabel.setVisible(false);
        if (this.airflowLabel) this.airflowLabel.setVisible(false);
        if (this.dryingProgressLabel) this.dryingProgressLabel.setVisible(false);
        if (this.moistureLabel) this.moistureLabel.setVisible(false);
        if (this.tightnessLabel) this.tightnessLabel.setVisible(false);
    }

    /**
     * 顯示場景UI元素
     */
    showSceneUI() {
        if (this.titleLabel) this.titleLabel.setVisible(true);
        if (this.instructionLabel) this.instructionLabel.setVisible(true);
        if (this.stepIndicator) this.stepIndicator.setVisible(true);
        if (this.nextButton) this.nextButton.setVisible(true);
        if (this.backButton) this.backButton.setVisible(true);
        if (this.timeDisplayLabel) this.timeDisplayLabel.setVisible(true);
        if (this.timeSpeedButton) this.timeSpeedButton.setVisible(true);
        if (this.pauseButton) this.pauseButton.setVisible(true);
        if (this.temperatureLabel) this.temperatureLabel.setVisible(true);
        if (this.humidityLabel) this.humidityLabel.setVisible(true);
        if (this.airflowLabel) this.airflowLabel.setVisible(true);
        if (this.dryingProgressLabel) this.dryingProgressLabel.setVisible(true);
        if (this.moistureLabel) this.moistureLabel.setVisible(true);
        if (this.tightnessLabel) this.tightnessLabel.setVisible(true);
    }

    /**
     * 清理場景
     */
    cleanup() {
        super.cleanup();
        
        const uiManager = this.gameEngine.uiManager;
        if (this.titleLabel) uiManager.removeUIElement(this.titleLabel);
        if (this.instructionLabel) uiManager.removeUIElement(this.instructionLabel);
        if (this.stepIndicator) uiManager.removeUIElement(this.stepIndicator);
        if (this.nextButton) uiManager.removeUIElement(this.nextButton);
        if (this.backButton) uiManager.removeUIElement(this.backButton);
        if (this.timeDisplayLabel) uiManager.removeUIElement(this.timeDisplayLabel);
        if (this.timeSpeedButton) uiManager.removeUIElement(this.timeSpeedButton);
        if (this.pauseButton) uiManager.removeUIElement(this.pauseButton);
        if (this.temperatureLabel) uiManager.removeUIElement(this.temperatureLabel);
        if (this.humidityLabel) uiManager.removeUIElement(this.humidityLabel);
        if (this.airflowLabel) uiManager.removeUIElement(this.airflowLabel);
        if (this.dryingProgressLabel) uiManager.removeUIElement(this.dryingProgressLabel);
        if (this.moistureLabel) uiManager.removeUIElement(this.moistureLabel);
        if (this.tightnessLabel) uiManager.removeUIElement(this.tightnessLabel);
        
        this.hideEducationPanel();
    }
}
// 匯出到全域作用域
window.DryingScene = DryingScene;
