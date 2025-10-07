/**
 * 烤製場景
 * 北京烤鴨製作的烤製階段，包含灌湯、溫度控制、翻轉和時間管理
 */
class RoastingScene extends Scene {
    constructor(name, gameEngine) {
        super(name, gameEngine);
        
        // 場景UI元素
        this.titleLabel = null;
        this.instructionLabel = null;
        this.educationPanel = null;
        this.nextButton = null;
        this.backButton = null;
        this.stepIndicator = null;
        
        // 烤製步驟管理
        this.roastingSteps = [
            {
                id: 'water_injection',
                name: '灌湯準備',
                description: '向鴨腹內注入適量熱水',
                miniGameClass: 'WaterInjectionGame',
                completed: false,
                educationContent: {
                    title: '灌湯技術的科學原理',
                    content: `💧 灌湯工藝精要：

🌡️ 水溫控制：
• 最佳溫度：80-85°C
• 水量比例：鴨重的1/3
• 注入速度：緩慢均勻
• 密封要求：確保不漏水

🔬 科學原理：
• 內部蒸煮：熱水產生蒸汽
• 肉質嫩化：蛋白質變性
• 汁液保持：防止水分流失
• 風味提升：內外同時烹調

⚖️ 品質控制：
• 水量精確：過多會破皮
• 溫度穩定：過熱會燙傷
• 時機把握：烤製前注入
• 密封檢查：防止漏水影響`
                }
            },
            {
                id: 'temperature_control',
                name: '溫度調控',
                description: '精確控制烤爐溫度變化',
                miniGameClass: 'TemperatureControlGame',
                completed: false,
                educationContent: {
                    title: '烤製溫度的階段控制',
                    content: `🔥 溫度控制技術：

📊 溫度階段：
• 初期：250-270°C（15分鐘）
• 中期：200-220°C（30分鐘）
• 後期：180-200°C（15分鐘）
• 收尾：160-180°C（調色）

🎯 控制要點：
• 高溫定型：快速鎖住水分
• 中溫烤製：均勻受熱
• 低溫收色：完美外觀
• 即時調整：根據狀態變化

🔍 判斷標準：
• 皮色變化：金黃透亮
• 油脂滲出：表面光澤
• 香味散發：烤製香氣
• 時間控制：總計約60分鐘`
                }
            },
            {
                id: 'rotation_timing',
                name: '翻轉時機',
                description: '掌握鴨子翻轉的最佳時機',
                miniGameClass: 'RotationTimingGame',
                completed: false,
                educationContent: {
                    title: '翻轉技巧與時機掌握',
                    content: `🔄 翻轉工藝要領：

⏰ 翻轉時機：
• 第一次：烤製15分鐘後
• 第二次：烤製35分鐘後
• 第三次：烤製50分鐘後
• 觀察法：皮色金黃時翻轉

🎯 技術要點：
• 動作輕柔：避免破皮
• 速度快捷：減少熱量流失
• 角度準確：確保均勻受熱
• 工具使用：專用烤叉

📈 品質影響：
• 色澤均勻：防止局部過焦
• 受熱平衡：內外同熟
• 油脂分布：表面光澤
• 形狀保持：避免變形`
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
        
        // 烤製系統
        this.roastingSystem = {
            // 烤爐狀態
            oven: {
                currentTemp: 25,      // 當前溫度
                targetTemp: 250,      // 目標溫度
                maxTemp: 300,         // 最高溫度
                minTemp: 150,         // 最低溫度
                heatRate: 5,          // 升溫速率 °C/秒
                coolRate: 2,          // 降溫速率 °C/秒
                isHeating: false,     // 是否加熱中
                fuelLevel: 100        // 燃料水平 0-100%
            },
            
            // 鴨子狀態
            duck: {
                internalTemp: 25,     // 內部溫度
                skinColor: 0,         // 皮色 0-100 (0=原色, 100=金黃)
                cookingProgress: 0,   // 烹飪進度 0-100%
                moistureLevel: 85,    // 水分含量 0-100%
                rotationCount: 0,     // 翻轉次數
                lastRotationTime: 0,  // 上次翻轉時間
                waterAmount: 0,       // 灌水量 0-100%
                isWaterSealed: false  // 是否密封
            },
            
            // 時間管理
            timer: {
                totalTime: 60 * 60,   // 總烤製時間 60分鐘
                currentTime: 0,       // 當前時間
                isPaused: false,      // 是否暫停
                timeSpeed: 1,         // 時間倍速
                stageTime: 0,         // 當前階段時間
                currentStage: 'initial' // initial, high, medium, low, finish
            }
        };
        
        // 視覺效果系統
        this.visualEffects = {
            flames: [],              // 火焰效果
            smoke: [],               // 煙霧效果
            steam: [],               // 蒸汽效果
            oilDrops: [],           // 油滴效果
            heatWaves: []           // 熱浪效果
        };
        
        // 烤爐顯示區域
        this.ovenDisplay = {
            x: 150,
            y: 150,
            width: 400,
            height: 250,
            duckX: 300,
            duckY: 200,
            duckWidth: 120,
            duckHeight: 80,
            duckRotation: 0,        // 鴨子旋轉角度
            flameHeight: 0          // 火焰高度
        };
    }

    /**
     * 載入場景資源
     */
    async loadSceneAssets() {
        const assetManager = this.gameEngine.assetManager;
        
        // 載入背景和烤製相關圖片
        await assetManager.loadImage('assets/images/backgrounds/roasting_bg.png', 'background_roasting');
        await assetManager.loadImage('assets/images/oven/oven_body.png', 'oven_body');
        await assetManager.loadImage('assets/images/oven/oven_door.png', 'oven_door');
        await assetManager.loadImage('assets/images/oven/flame_small.png', 'flame_small');
        await assetManager.loadImage('assets/images/oven/flame_medium.png', 'flame_medium');
        await assetManager.loadImage('assets/images/oven/flame_large.png', 'flame_large');
        
        // 載入鴨子烤製階段圖片
        await assetManager.loadImage('assets/images/duck/duck_raw_roasting.png', 'duck_raw');
        await assetManager.loadImage('assets/images/duck/duck_cooking.png', 'duck_cooking');
        await assetManager.loadImage('assets/images/duck/duck_golden.png', 'duck_golden');
        await assetManager.loadImage('assets/images/duck/duck_roasted.png', 'duck_roasted');
        
        // 載入控制面板圖片
        await assetManager.loadImage('assets/images/controls/temperature_gauge.png', 'temp_gauge');
        await assetManager.loadImage('assets/images/controls/timer_display.png', 'timer_display');
        await assetManager.loadImage('assets/images/controls/fuel_meter.png', 'fuel_meter');
        
        // 載入效果圖片
        await assetManager.loadImage('assets/images/effects/smoke_particle.png', 'smoke_particle');
        await assetManager.loadImage('assets/images/effects/steam_particle.png', 'steam_particle');
        await assetManager.loadImage('assets/images/effects/oil_drop.png', 'oil_drop');
        await assetManager.loadImage('assets/images/effects/heat_wave.png', 'heat_wave');
        
        this.backgroundImage = assetManager.getAsset('background_roasting');
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
            text: '烤製階段 - 火候掌控',
            fontSize: 26,
            color: '#DC143C',
            align: 'center'
        });

        // 創建說明文字
        this.instructionLabel = uiManager.createLabel({
            x: canvas.width / 2,
            y: 80,
            text: '精確控制溫度、時間與翻轉，成就完美北京烤鴨',
            fontSize: 16,
            color: '#8B4513',
            align: 'center'
        });

        // 創建步驟指示器
        this.createStepIndicator();

        // 創建教育內容按鈕
        this.createEducationButton();

        // 創建烤製控制面板
        this.createRoastingControlPanel();

        // 創建溫度監控面板
        this.createTemperatureMonitor();

        // 創建時間管理面板
        this.createTimeManagementPanel();

        // 創建開始步驟按鈕
        this.nextButton = uiManager.createButton({
            x: canvas.width - 180,
            y: canvas.height - 80,
            width: 130,
            height: 50,
            text: '開始灌湯',
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

        console.log('烤製場景設置完成');
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
            color: '#DC143C',
            align: 'left'
        });
    }

    /**
     * 獲取步驟指示器文字
     */
    getStepIndicatorText() {
        let text = '烤製步驟進度：\n';
        
        this.roastingSteps.forEach((step, index) => {
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
            text: '學習烤製技術',
            onClick: () => this.showCurrentStepEducation()
        });
        this.addUIElement(educationButton);
        
        this.addUIElement(educationButton);
    }

    /**
     * 創建烤製控制面板
     */
    createRoastingControlPanel() {
        const uiManager = this.gameEngine.uiManager;
        
        // 溫度控制標籤
        this.tempControlLabel = uiManager.createLabel({
            x: 580,
            y: 120,
            text: '烤爐控制面板',
            fontSize: 16,
            color: '#8B0000',
            align: 'left'
        });
        
        // 目標溫度顯示
        this.targetTempLabel = uiManager.createLabel({
            x: 580,
            y: 145,
            text: `目標溫度: ${this.roastingSystem.oven.targetTemp}°C`,
            fontSize: 14,
            color: '#FF4500',
            align: 'left'
        });
        
        // 當前溫度顯示
        this.currentTempLabel = uiManager.createLabel({
            x: 580,
            y: 165,
            text: `當前溫度: ${this.roastingSystem.oven.currentTemp}°C`,
            fontSize: 14,
            color: '#FF6347',
            align: 'left'
        });
        
        // 燃料水平顯示
        this.fuelLabel = uiManager.createLabel({
            x: 580,
            y: 185,
            text: `燃料水平: ${this.roastingSystem.oven.fuelLevel}%`,
            fontSize: 14,
            color: '#DAA520',
            align: 'left'
        });
        
        this.addUIElement(this.tempControlLabel);
        this.addUIElement(this.targetTempLabel);
        this.addUIElement(this.currentTempLabel);
        this.addUIElement(this.fuelLabel);
    }

    /**
     * 創建溫度監控面板
     */
    createTemperatureMonitor() {
        const uiManager = this.gameEngine.uiManager;
        
        // 鴨子內部溫度
        this.duckTempLabel = uiManager.createLabel({
            x: 580,
            y: 220,
            text: `鴨子內溫: ${this.roastingSystem.duck.internalTemp}°C`,
            fontSize: 14,
            color: '#CD853F',
            align: 'left'
        });
        
        // 皮色進度
        this.skinColorLabel = uiManager.createLabel({
            x: 580,
            y: 240,
            text: `皮色進度: ${this.roastingSystem.duck.skinColor}%`,
            fontSize: 14,
            color: '#DEB887',
            align: 'left'
        });
        
        // 烹飪進度
        this.cookingProgressLabel = uiManager.createLabel({
            x: 580,
            y: 260,
            text: `烹飪進度: ${this.roastingSystem.duck.cookingProgress}%`,
            fontSize: 14,
            color: '#D2691E',
            align: 'left'
        });
        
        this.addUIElement(this.duckTempLabel);
        this.addUIElement(this.skinColorLabel);
        this.addUIElement(this.cookingProgressLabel);
    }

    /**
     * 創建時間管理面板
     */
    createTimeManagementPanel() {
        const uiManager = this.gameEngine.uiManager;
        
        // 烤製時間顯示
        this.timeDisplayLabel = uiManager.createLabel({
            x: 580,
            y: 300,
            text: this.getTimeDisplayText(),
            fontSize: 14,
            color: '#2F4F4F',
            align: 'left'
        });
        
        // 當前階段顯示
        this.stageLabel = uiManager.createLabel({
            x: 580,
            y: 320,
            text: `當前階段: ${this.getStageDisplayText()}`,
            fontSize: 14,
            color: '#4682B4',
            align: 'left'
        });
        
        // 翻轉次數顯示
        this.rotationLabel = uiManager.createLabel({
            x: 580,
            y: 340,
            text: `翻轉次數: ${this.roastingSystem.duck.rotationCount}/3`,
            fontSize: 14,
            color: '#708090',
            align: 'left'
        });
        
        this.addUIElement(this.timeDisplayLabel);
        this.addUIElement(this.stageLabel);
        this.addUIElement(this.rotationLabel);
    }

    /**
     * 獲取時間顯示文字
     */
    getTimeDisplayText() {
        const current = Math.floor(this.roastingSystem.timer.currentTime / 60);
        const total = Math.floor(this.roastingSystem.timer.totalTime / 60);
        return `烤製時間: ${current}:${(this.roastingSystem.timer.currentTime % 60).toFixed(0).padStart(2, '0')} / ${total}:00`;
    }

    /**
     * 獲取階段顯示文字
     */
    getStageDisplayText() {
        const stageNames = {
            'initial': '準備階段',
            'high': '高溫定型',
            'medium': '中溫烤製',
            'low': '低溫收色',
            'finish': '完成階段'
        };
        return stageNames[this.roastingSystem.timer.currentStage] || '未知階段';
    }

    /**
     * 顯示當前步驟的教育內容
     */
    showCurrentStepEducation() {
        if (this.currentStepIndex >= this.roastingSteps.length) return;
        
        const currentStep = this.roastingSteps[this.currentStepIndex];
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
        if (this.currentStepIndex >= this.roastingSteps.length) {
            this.proceedToNextScene();
            return;
        }

        const currentStep = this.roastingSteps[this.currentStepIndex];
        console.log(`開始步驟: ${currentStep.name}`);
        
        this.hideEducationPanel();
        this.hideSceneUI();
        
        // 根據當前步驟啟動對應的迷你遊戲
        switch (currentStep.id) {
            case 'water_injection':
                this.startWaterInjectionGame();
                break;
            case 'temperature_control':
                this.startTemperatureControlGame();
                break;
            case 'rotation_timing':
                this.startRotationTimingGame();
                break;
        }
    }

    /**
     * 開始灌湯迷你遊戲
     */
    startWaterInjectionGame() {
        console.log('啟動灌湯迷你遊戲');
        
        this.startMiniGame(WaterInjectionGame, {
            gameEngine: this.gameEngine,
            scene: this,
            gameAreaX: 100,
            gameAreaY: 140,
            gameAreaWidth: 600,
            gameAreaHeight: 320,
            roastingSystem: this.roastingSystem
        });
    }

    /**
     * 開始溫度控制迷你遊戲
     */
    startTemperatureControlGame() {
        console.log('啟動溫度控制迷你遊戲');
        
        this.startMiniGame(TemperatureControlGame, {
            gameEngine: this.gameEngine,
            scene: this,
            gameAreaX: 100,
            gameAreaY: 140,
            gameAreaWidth: 600,
            gameAreaHeight: 320,
            roastingSystem: this.roastingSystem
        });
    }

    /**
     * 開始翻轉時機迷你遊戲
     */
    startRotationTimingGame() {
        console.log('啟動翻轉時機迷你遊戲');
        
        this.startMiniGame(RotationTimingGame, {
            gameEngine: this.gameEngine,
            scene: this,
            gameAreaX: 100,
            gameAreaY: 140,
            gameAreaWidth: 600,
            gameAreaHeight: 320,
            roastingSystem: this.roastingSystem
        });
    }

    /**
     * 隱藏場景UI
     */
    hideSceneUI() {
        this.uiElements.forEach(element => {
            if (element.setVisible) {
                element.setVisible(false);
            }
        });
    }

    /**
     * 顯示場景UI
     */
    showSceneUI() {
        this.uiElements.forEach(element => {
            if (element.setVisible) {
                element.setVisible(true);
            }
        });
    }

    /**
     * 更新場景邏輯
     */
    update(deltaTime) {
        super.update(deltaTime);
        
        // 更新烤製系統
        this.updateRoastingSystem(deltaTime);
        
        // 更新視覺效果
        this.updateVisualEffects(deltaTime);
        
        // 更新UI顯示
        this.updateUIDisplays();
    }

    /**
     * 更新烤製系統
     */
    updateRoastingSystem(deltaTime) {
        const system = this.roastingSystem;
        
        // 更新烤爐溫度
        this.updateOvenTemperature(deltaTime);
        
        // 更新鴨子狀態
        this.updateDuckState(deltaTime);
        
        // 更新時間管理
        this.updateTimeManagement(deltaTime);
        
        // 更新烤製階段
        this.updateRoastingStage();
    }

    /**
     * 更新烤爐溫度
     */
    updateOvenTemperature(deltaTime) {
        const oven = this.roastingSystem.oven;
        
        if (oven.isHeating && oven.fuelLevel > 0) {
            // 加熱中
            if (oven.currentTemp < oven.targetTemp) {
                oven.currentTemp = Math.min(
                    oven.targetTemp,
                    oven.currentTemp + oven.heatRate * deltaTime
                );
            }
            
            // 消耗燃料
            oven.fuelLevel = Math.max(0, oven.fuelLevel - 0.5 * deltaTime);
        } else {
            // 自然降溫
            oven.currentTemp = Math.max(
                25, // 室溫
                oven.currentTemp - oven.coolRate * deltaTime
            );
        }
    }

    /**
     * 更新鴨子狀態
     */
    updateDuckState(deltaTime) {
        const duck = this.roastingSystem.duck;
        const oven = this.roastingSystem.oven;
        
        // 更新內部溫度
        if (oven.currentTemp > duck.internalTemp) {
            const tempDiff = oven.currentTemp - duck.internalTemp;
            duck.internalTemp += Math.min(tempDiff * 0.1 * deltaTime, 2 * deltaTime);
        }
        
        // 更新皮色
        if (duck.internalTemp > 60) {
            const colorRate = (duck.internalTemp - 60) / 100;
            duck.skinColor = Math.min(100, duck.skinColor + colorRate * 10 * deltaTime);
        }
        
        // 更新烹飪進度
        if (duck.internalTemp > 50) {
            const cookRate = (duck.internalTemp - 50) / 80;
            duck.cookingProgress = Math.min(100, duck.cookingProgress + cookRate * 5 * deltaTime);
        }
        
        // 更新水分含量
        if (duck.internalTemp > 70) {
            duck.moistureLevel = Math.max(40, duck.moistureLevel - 2 * deltaTime);
        }
    }

    /**
     * 更新時間管理
     */
    updateTimeManagement(deltaTime) {
        const timer = this.roastingSystem.timer;
        
        if (!timer.isPaused) {
            timer.currentTime += deltaTime * timer.timeSpeed;
            timer.stageTime += deltaTime * timer.timeSpeed;
        }
    }

    /**
     * 更新烤製階段
     */
    updateRoastingStage() {
        const timer = this.roastingSystem.timer;
        const currentMinutes = timer.currentTime / 60;
        
        if (currentMinutes < 15) {
            timer.currentStage = 'high';
            this.roastingSystem.oven.targetTemp = 260;
        } else if (currentMinutes < 45) {
            timer.currentStage = 'medium';
            this.roastingSystem.oven.targetTemp = 210;
        } else if (currentMinutes < 55) {
            timer.currentStage = 'low';
            this.roastingSystem.oven.targetTemp = 190;
        } else {
            timer.currentStage = 'finish';
            this.roastingSystem.oven.targetTemp = 170;
        }
    }

    /**
     * 更新視覺效果
     */
    updateVisualEffects(deltaTime) {
        // 更新火焰效果
        this.updateFlameEffects(deltaTime);
        
        // 更新煙霧效果
        this.updateSmokeEffects(deltaTime);
        
        // 更新蒸汽效果
        this.updateSteamEffects(deltaTime);
        
        // 更新油滴效果
        this.updateOilDropEffects(deltaTime);
    }

    /**
     * 更新火焰效果
     */
    updateFlameEffects(deltaTime) {
        const oven = this.roastingSystem.oven;
        
        // 根據加熱狀態生成火焰
        if (oven.isHeating && oven.fuelLevel > 0) {
            const flameIntensity = Math.min(1.0, oven.fuelLevel / 100);
            
            if (Math.random() < flameIntensity * 0.3) {
                this.visualEffects.flames.push({
                    x: this.ovenDisplay.x + 50 + Math.random() * 300,
                    y: this.ovenDisplay.y + this.ovenDisplay.height - 20,
                    height: 20 + Math.random() * 30 * flameIntensity,
                    life: 0.5 + Math.random() * 0.5,
                    intensity: flameIntensity
                });
            }
        }
        
        // 更新現有火焰
        this.visualEffects.flames = this.visualEffects.flames.filter(flame => {
            flame.life -= deltaTime * 2;
            flame.height *= 0.98;
            return flame.life > 0;
        });
    }

    /**
     * 更新煙霧效果
     */
    updateSmokeEffects(deltaTime) {
        const duck = this.roastingSystem.duck;
        
        // 根據烹飪進度生成煙霧
        if (duck.cookingProgress > 20) {
            if (Math.random() < duck.cookingProgress * 0.002) {
                this.visualEffects.smoke.push({
                    x: this.ovenDisplay.duckX + Math.random() * this.ovenDisplay.duckWidth,
                    y: this.ovenDisplay.duckY,
                    vx: (Math.random() - 0.5) * 10,
                    vy: -20 - Math.random() * 10,
                    life: 2.0 + Math.random(),
                    size: 3 + Math.random() * 5,
                    opacity: 0.6
                });
            }
        }
        
        // 更新煙霧粒子
        this.visualEffects.smoke = this.visualEffects.smoke.filter(particle => {
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;
            particle.life -= deltaTime;
            particle.opacity = particle.life / 3.0;
            particle.size += deltaTime * 2;
            return particle.life > 0;
        });
    }

    /**
     * 更新蒸汽效果
     */
    updateSteamEffects(deltaTime) {
        const duck = this.roastingSystem.duck;
        
        // 如果有灌水且溫度足夠，產生蒸汽
        if (duck.waterAmount > 0 && duck.internalTemp > 80) {
            if (Math.random() < 0.1) {
                this.visualEffects.steam.push({
                    x: this.ovenDisplay.duckX + this.ovenDisplay.duckWidth / 2,
                    y: this.ovenDisplay.duckY + this.ovenDisplay.duckHeight,
                    vx: (Math.random() - 0.5) * 5,
                    vy: -15 - Math.random() * 5,
                    life: 1.5,
                    size: 2 + Math.random() * 3,
                    opacity: 0.8
                });
            }
        }
        
        // 更新蒸汽粒子
        this.visualEffects.steam = this.visualEffects.steam.filter(particle => {
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;
            particle.life -= deltaTime;
            particle.opacity = particle.life / 1.5;
            return particle.life > 0;
        });
    }

    /**
     * 更新油滴效果
     */
    updateOilDropEffects(deltaTime) {
        const duck = this.roastingSystem.duck;
        
        // 根據皮色進度產生油滴
        if (duck.skinColor > 30) {
            if (Math.random() < duck.skinColor * 0.001) {
                this.visualEffects.oilDrops.push({
                    x: this.ovenDisplay.duckX + Math.random() * this.ovenDisplay.duckWidth,
                    y: this.ovenDisplay.duckY + this.ovenDisplay.duckHeight,
                    vy: 20 + Math.random() * 10,
                    life: 1.0,
                    size: 1 + Math.random() * 2
                });
            }
        }
        
        // 更新油滴
        this.visualEffects.oilDrops = this.visualEffects.oilDrops.filter(drop => {
            drop.y += drop.vy * deltaTime;
            drop.life -= deltaTime;
            return drop.life > 0 && drop.y < this.ovenDisplay.y + this.ovenDisplay.height + 50;
        });
    }

    /**
     * 更新UI顯示
     */
    updateUIDisplays() {
        const system = this.roastingSystem;
        
        if (this.targetTempLabel) {
            this.targetTempLabel.setText(`目標溫度: ${Math.round(system.oven.targetTemp)}°C`);
        }
        
        if (this.currentTempLabel) {
            this.currentTempLabel.setText(`當前溫度: ${Math.round(system.oven.currentTemp)}°C`);
        }
        
        if (this.fuelLabel) {
            this.fuelLabel.setText(`燃料水平: ${Math.round(system.oven.fuelLevel)}%`);
        }
        
        if (this.duckTempLabel) {
            this.duckTempLabel.setText(`鴨子內溫: ${Math.round(system.duck.internalTemp)}°C`);
        }
        
        if (this.skinColorLabel) {
            this.skinColorLabel.setText(`皮色進度: ${Math.round(system.duck.skinColor)}%`);
        }
        
        if (this.cookingProgressLabel) {
            this.cookingProgressLabel.setText(`烹飪進度: ${Math.round(system.duck.cookingProgress)}%`);
        }
        
        if (this.timeDisplayLabel) {
            this.timeDisplayLabel.setText(this.getTimeDisplayText());
        }
        
        if (this.stageLabel) {
            this.stageLabel.setText(`當前階段: ${this.getStageDisplayText()}`);
        }
        
        if (this.rotationLabel) {
            this.rotationLabel.setText(`翻轉次數: ${system.duck.rotationCount}/3`);
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
            const currentStep = this.roastingSteps[this.currentStepIndex];
            this.onStepComplete(currentStep.id, success, stats);
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
            const step = this.roastingSteps.find(s => s.id === stepId);
            if (step) {
                step.completed = true;
                
                // 根據步驟更新烤製系統狀態
                this.updateSystemAfterStep(stepId, stats);
                
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
     * 根據完成的步驟更新系統狀態
     */
    updateSystemAfterStep(stepId, stats) {
        const system = this.roastingSystem;
        
        switch (stepId) {
            case 'water_injection':
                system.duck.waterAmount = stats.waterAmount || 75;
                system.duck.isWaterSealed = true;
                system.oven.isHeating = true; // 開始加熱
                break;
                
            case 'temperature_control':
                // 溫度控制完成，進入自動烤製模式
                system.timer.isPaused = false;
                break;
                
            case 'rotation_timing':
                system.duck.rotationCount++;
                system.duck.lastRotationTime = system.timer.currentTime;
                break;
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
        if (this.currentStepIndex >= this.roastingSteps.length) {
            // 所有步驟完成，檢查烤製是否完成
            this.sceneProgress.allStepsCompleted = true;
            
            this.nextButton.setText('檢查烤製進度');
            this.nextButton.onClick = () => this.checkRoastingCompletion();
        } else {
            // 更新按鈕文字為下一步驟
            const nextStep = this.roastingSteps[this.currentStepIndex];
            const buttonTexts = {
                'water_injection': '開始灌湯',
                'temperature_control': '控制溫度',
                'rotation_timing': '掌握翻轉'
            };
            this.nextButton.setText(buttonTexts[nextStep.id] || '下一步');
        }
    }

    /**
     * 檢查烤製完成狀態
     */
    checkRoastingCompletion() {
        const duck = this.roastingSystem.duck;
        const timer = this.roastingSystem.timer;
        
        // 檢查烤製是否達到完成標準
        const isTimeComplete = timer.currentTime >= timer.totalTime * 0.9; // 90%時間
        const isCookingComplete = duck.cookingProgress >= 85;
        const isSkinColorGood = duck.skinColor >= 70;
        
        if (isTimeComplete && isCookingComplete && isSkinColorGood) {
            this.sceneProgress.readyForNextScene = true;
            this.nextButton.setText('進入片鴨階段');
            this.nextButton.onClick = () => this.proceedToNextScene();
            
            // 標記烤製階段完成
            this.gameEngine.updateGameState({
                progress: {
                    ...this.gameEngine.gameState.progress,
                    roasting: true
                }
            });
            
            this.showCompletionMessage();
        } else {
            this.showIncompleteMessage(isTimeComplete, isCookingComplete, isSkinColorGood);
        }
    }

    /**
     * 顯示完成消息
     */
    showCompletionMessage() {
        const uiManager = this.gameEngine.uiManager;
        const canvas = this.gameEngine.canvas;
        const duck = this.roastingSystem.duck;
        
        const qualityScore = Math.round((duck.cookingProgress + duck.skinColor) / 2);
        
        uiManager.createDismissibleMessage({
            text: `烤製完成！\n品質評分: ${qualityScore}\n北京烤鴨已達到完美狀態！`,
            x: canvas.width / 2,
            y: canvas.height / 2 - 50,
            fontSize: 18,
            color: '#32CD32',
            autoDismissTime: 5000
        });
        
        if (this.gameEngine.gameState.settings.soundEnabled) {
            this.gameEngine.audioManager.playSound('success_sound');
        }
    }

    /**
     * 顯示未完成消息
     */
    showIncompleteMessage(timeComplete, cookingComplete, skinColorGood) {
        const uiManager = this.gameEngine.uiManager;
        const canvas = this.gameEngine.canvas;
        
        let message = '烤製尚未完成：\n';
        if (!timeComplete) message += '• 烤製時間不足\n';
        if (!cookingComplete) message += '• 烹飪程度不夠\n';
        if (!skinColorGood) message += '• 皮色還需改善\n';
        message += '請繼續烤製或調整參數';
        
        uiManager.createDismissibleMessage({
            text: message,
            x: canvas.width / 2,
            y: canvas.height / 2 - 50,
            fontSize: 16,
            color: '#FF8C00',
            autoDismissTime: 5000
        });
    }

    /**
     * 顯示成功消息
     */
    showSuccessMessage(stepName, score) {
        const uiManager = this.gameEngine.uiManager;
        const canvas = this.gameEngine.canvas;
        
        uiManager.createDismissibleMessage({
            text: `${stepName}完成！\n獲得分數: ${score}\n烤製過程繼續進行`,
            x: canvas.width / 2,
            y: canvas.height / 2 - 50,
            fontSize: 18,
            color: '#32CD32',
            autoDismissTime: 5000
        });
        
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
            text: '烤製需要精確控制，請再試一次',
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
        this.transitionToScene('drying');
    }

    /**
     * 進入下一個場景
     */
    proceedToNextScene() {
        console.log('烤製階段完成，進入片鴨階段');
        this.transitionToScene('slicing');
    }

    /**
     * 渲染場景特定內容
     */
    renderScene(context) {
        // 渲染烤爐系統
        this.renderOvenSystem(context);
        
        // 渲染鴨子狀態
        this.renderDuckState(context);
        
        // 渲染控制面板
        this.renderControlPanels(context);
        
        // 渲染視覺效果
        this.renderVisualEffects(context);
        
        // 渲染教育面板背景
        if (this.showingEducation) {
            this.renderEducationPanelBackground(context);
        }
    }

    /**
     * 渲染烤爐系統
     */
    renderOvenSystem(context) {
        const display = this.ovenDisplay;
        const oven = this.roastingSystem.oven;
        
        // 繪製烤爐主體
        context.fillStyle = '#8B4513';
        context.fillRect(display.x, display.y, display.width, display.height);
        
        // 繪製烤爐邊框
        context.strokeStyle = '#654321';
        context.lineWidth = 4;
        context.strokeRect(display.x, display.y, display.width, display.height);
        
        // 繪製烤爐內部
        context.fillStyle = oven.isHeating ? '#FF4500' : '#2F2F2F';
        context.fillRect(display.x + 10, display.y + 10, display.width - 20, display.height - 20);
        
        // 繪製溫度指示
        const tempRatio = Math.min(1.0, oven.currentTemp / oven.maxTemp);
        const tempBarHeight = (display.height - 40) * tempRatio;
        
        context.fillStyle = this.getTemperatureColor(oven.currentTemp);
        context.fillRect(display.x + display.width - 30, display.y + display.height - 20 - tempBarHeight, 20, tempBarHeight);
        
        // 溫度刻度
        context.strokeStyle = '#FFFFFF';
        context.lineWidth = 1;
        context.strokeRect(display.x + display.width - 30, display.y + 20, 20, display.height - 40);
    }

    /**
     * 獲取溫度對應的顏色
     */
    getTemperatureColor(temp) {
        if (temp < 100) return '#4169E1';      // 藍色 - 低溫
        if (temp < 150) return '#32CD32';      // 綠色 - 溫和
        if (temp < 200) return '#FFD700';      // 黃色 - 中溫
        if (temp < 250) return '#FF8C00';      // 橙色 - 高溫
        return '#FF0000';                      // 紅色 - 極高溫
    }

    /**
     * 渲染鴨子狀態
     */
    renderDuckState(context) {
        const display = this.ovenDisplay;
        const duck = this.roastingSystem.duck;
        
        // 計算鴨子顏色（根據皮色進度）
        const colorProgress = duck.skinColor / 100;
        const red = Math.floor(139 + (255 - 139) * colorProgress);   // 從深棕到金黃
        const green = Math.floor(69 + (215 - 69) * colorProgress);
        const blue = Math.floor(19 + (0 - 19) * colorProgress);
        
        // 繪製鴨子
        context.save();
        context.translate(display.duckX + display.duckWidth / 2, display.duckY + display.duckHeight / 2);
        context.rotate(duck.rotationCount * Math.PI); // 根據翻轉次數旋轉
        
        context.fillStyle = `rgb(${red}, ${green}, ${blue})`;
        context.fillRect(-display.duckWidth / 2, -display.duckHeight / 2, display.duckWidth, display.duckHeight);
        
        // 繪製鴨子輪廓
        context.strokeStyle = '#654321';
        context.lineWidth = 2;
        context.strokeRect(-display.duckWidth / 2, -display.duckHeight / 2, display.duckWidth, display.duckHeight);
        
        context.restore();
        
        // 繪製烹飪進度條
        const progressBarY = display.y - 30;
        context.fillStyle = '#CCCCCC';
        context.fillRect(display.x, progressBarY, display.width, 15);
        
        context.fillStyle = '#32CD32';
        context.fillRect(display.x, progressBarY, display.width * (duck.cookingProgress / 100), 15);
        
        context.strokeStyle = '#000000';
        context.lineWidth = 1;
        context.strokeRect(display.x, progressBarY, display.width, 15);
        
        // 進度文字
        context.fillStyle = '#000000';
        context.font = '12px Arial';
        context.textAlign = 'center';
        context.fillText(`烹飪進度: ${Math.round(duck.cookingProgress)}%`, display.x + display.width / 2, progressBarY - 5);
    }

    /**
     * 渲染控制面板
     */
    renderControlPanels(context) {
        // 繪製控制面板背景
        context.fillStyle = 'rgba(47, 79, 79, 0.9)';
        context.fillRect(570, 110, 220, 250);
        
        context.strokeStyle = '#708090';
        context.lineWidth = 2;
        context.strokeRect(570, 110, 220, 250);
        
        // 繪製燃料指示器
        const fuelLevel = this.roastingSystem.oven.fuelLevel / 100;
        context.fillStyle = '#8B0000';
        context.fillRect(720, 180, 15, 50);
        
        context.fillStyle = fuelLevel > 0.3 ? '#32CD32' : '#FF0000';
        context.fillRect(720, 180 + 50 * (1 - fuelLevel), 15, 50 * fuelLevel);
        
        context.strokeStyle = '#000000';
        context.lineWidth = 1;
        context.strokeRect(720, 180, 15, 50);
    }

    /**
     * 渲染視覺效果
     */
    renderVisualEffects(context) {
        // 渲染火焰效果
        this.renderFlames(context);
        
        // 渲染煙霧效果
        this.renderSmoke(context);
        
        // 渲染蒸汽效果
        this.renderSteam(context);
        
        // 渲染油滴效果
        this.renderOilDrops(context);
    }

    /**
     * 渲染火焰效果
     */
    renderFlames(context) {
        this.visualEffects.flames.forEach(flame => {
            const alpha = flame.life / 1.0;
            context.fillStyle = `rgba(255, ${Math.floor(100 + 155 * flame.intensity)}, 0, ${alpha})`;
            
            context.fillRect(
                flame.x - 5,
                flame.y - flame.height,
                10,
                flame.height
            );
        });
    }

    /**
     * 渲染煙霧效果
     */
    renderSmoke(context) {
        this.visualEffects.smoke.forEach(particle => {
            context.fillStyle = `rgba(105, 105, 105, ${particle.opacity})`;
            context.beginPath();
            context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            context.fill();
        });
    }

    /**
     * 渲染蒸汽效果
     */
    renderSteam(context) {
        this.visualEffects.steam.forEach(particle => {
            context.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
            context.beginPath();
            context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            context.fill();
        });
    }

    /**
     * 渲染油滴效果
     */
    renderOilDrops(context) {
        this.visualEffects.oilDrops.forEach(drop => {
            context.fillStyle = `rgba(255, 215, 0, ${drop.life})`;
            context.beginPath();
            context.arc(drop.x, drop.y, drop.size, 0, Math.PI * 2);
            context.fill();
        });
    }

    /**
     * 渲染教育面板背景
     */
    renderEducationPanelBackground(context) {
        // 半透明背景
        context.fillStyle = 'rgba(0, 0, 0, 0.8)';
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
        
        // 教育面板背景
        const panelX = 60;
        const panelY = 100;
        const panelWidth = context.canvas.width - 120;
        const panelHeight = context.canvas.height - 200;
        
        context.fillStyle = 'rgba(139, 69, 19, 0.95)';
        context.fillRect(panelX, panelY, panelWidth, panelHeight);
        
        context.strokeStyle = '#FFD700';
        context.lineWidth = 3;
        context.strokeRect(panelX, panelY, panelWidth, panelHeight);
    }
}
// 匯出到全域作用域
window.RoastingScene = RoastingScene;
