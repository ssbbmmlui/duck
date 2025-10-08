/**
 * 片鴨場景
 * 北京烤鴨製作的最後階段，展示傳統片鴨技藝和擺盤藝術
 */
class SlicingScene extends Scene {
    constructor(name, gameEngine) {
        super(name, gameEngine);
        
        // 場景UI元素
        this.titleLabel = null;
        this.instructionLabel = null;
        this.educationPanel = null;
        this.nextButton = null;
        this.backButton = null;
        this.stepIndicator = null;
        
        // 片鴨步驟管理
        this.slicingSteps = [
            {
                id: 'skin_slicing',
                name: '片皮技法',
                description: '運用傳統技法精確片取鴨皮',
                miniGameClass: 'SkinSlicingGame',
                completed: false,
                educationContent: {
                    title: '北京烤鴨片皮技藝',
                    content: `🔪 片皮技法精要：

📏 刀法要求：
• 刀具選擇：薄刃片刀，鋒利無比
• 角度控制：與皮面成15-20度角
• 力度掌握：輕柔均勻，不可用力
• 速度節奏：穩定連貫，一氣呵成

🎯 片皮標準：
• 厚度均勻：約2-3毫米
• 大小一致：長約5公分，寬約3公分
• 形狀規整：長方形或橢圓形
• 皮肉分離：帶少許肉絲增加口感

🏆 技藝要點：
• 觀察紋理：順著皮的紋理切片
• 保持溫度：趁熱片切，皮脆肉嫩
• 動作流暢：連續不斷，避免停頓
• 擺盤美觀：片片分明，層次清晰`
                }
            },
            {
                id: 'meat_slicing',
                name: '片肉技巧',
                description: '將鴨肉切成適合入口的薄片',
                miniGameClass: 'MeatSlicingGame',
                completed: false,
                educationContent: {
                    title: '鴨肉切片的精細工藝',
                    content: `🥩 片肉技術要領：

✂️ 切片技巧：
• 刀法變化：與片皮不同，需垂直切入
• 厚度控制：約3-4毫米，略厚於皮片
• 紋理處理：逆紋切片，口感更佳
• 部位選擇：胸肉、腿肉分別處理

🎨 美觀要求：
• 形狀統一：長條形或扇形排列
• 色澤保持：保持肉質的自然色澤
• 汁液保存：避免過度擠壓失水
• 溫度維持：保持適宜的食用溫度

📐 分量控制：
• 每片重量：約8-10克
• 總片數：根據鴨子大小調整
• 搭配比例：皮肉比例約1:2
• 剩餘處理：骨架可製作鴨架湯`
                }
            },
            {
                id: 'plating_arrangement',
                name: '擺盤藝術',
                description: '將片好的鴨皮鴨肉進行藝術擺盤',
                miniGameClass: 'PlatingArrangementGame',
                completed: false,
                educationContent: {
                    title: '北京烤鴨擺盤的藝術美學',
                    content: `🍽️ 擺盤美學原理：

🎨 視覺設計：
• 色彩搭配：金黃鴨皮與紅潤鴨肉對比
• 層次分明：皮片在上，肉片在下
• 形狀美觀：扇形、花瓣形等經典造型
• 留白藝術：適當空間增加美感

🏮 傳統元素：
• 對稱美學：體現中式審美理念
• 寓意吉祥：圓滿、豐收等美好寓意
• 季節特色：根據時令調整擺盤風格
• 文化內涵：體現飲食文化的深度

🌟 創新融合：
• 現代技法：結合當代擺盤理念
• 個性表達：展現廚師的藝術修養
• 實用性：美觀與實用並重
• 溫度保持：確保最佳品嚐溫度`
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
        
        // 片鴨系統
        this.slicingSystem = {
            // 鴨子狀態
            duck: {
                temperature: 65,        // 當前溫度
                skinIntegrity: 100,     // 皮的完整度
                meatTexture: 100,       // 肉質狀態
                juiciness: 85,          // 汁液含量
                totalWeight: 2500,      // 總重量(克)
                slicedWeight: 0,        // 已切片重量
                wasteAmount: 0          // 浪費量
            },
            
            // 切片工具
            knife: {
                sharpness: 100,         // 刀具鋒利度
                angle: 20,              // 切片角度
                speed: 50,              // 切片速度
                pressure: 30,           // 施力大小
                technique: 'traditional' // 技法類型
            },
            
            // 切片結果
            slices: {
                skin: {
                    count: 0,           // 皮片數量
                    averageThickness: 0, // 平均厚度
                    uniformity: 0,      // 均勻度
                    quality: 0          // 品質評分
                },
                meat: {
                    count: 0,           // 肉片數量
                    averageThickness: 0, // 平均厚度
                    uniformity: 0,      // 均勻度
                    quality: 0          // 品質評分
                }
            },
            
            // 擺盤狀態
            plating: {
                style: 'traditional',   // 擺盤風格
                symmetry: 0,           // 對稱度
                colorBalance: 0,       // 色彩平衡
                spacing: 0,            // 間距控制
                creativity: 0,         // 創意度
                overallScore: 0        // 總體評分
            }
        };
        
        // 視覺效果系統
        this.visualEffects = {
            knifeTrails: [],          // 刀痕軌跡
            sliceParticles: [],       // 切片粒子
            steamEffects: [],         // 蒸汽效果
            juiceDrops: [],          // 汁液滴落
            sparkles: []             // 閃光效果
        };
        
        // 工作台顯示區域
        this.workStation = {
            x: 100,
            y: 120,
            width: 500,
            height: 300,
            duckX: 250,
            duckY: 200,
            duckWidth: 200,
            duckHeight: 120,
            plateX: 450,
            plateY: 180,
            plateWidth: 120,
            plateHeight: 80,
            knifeX: 150,
            knifeY: 250,
            knifeAngle: 0
        };
        
        // 傳統吃法展示
        this.traditionalServing = {
            pancakes: { count: 0, prepared: false },    // 荷葉餅
            scallions: { count: 0, prepared: false },   // 蔥絲
            cucumber: { count: 0, prepared: false },    // 黃瓜條
            sauce: { amount: 0, prepared: false },      // 甜麵醬
            presentation: { style: 'classic', score: 0 } // 呈現方式
        };
    }

    /**
     * 載入場景資源
     */
    async loadSceneAssets() {
        const assetManager = this.gameEngine.assetManager;
        
        // 載入背景和工作台圖片
        await assetManager.loadImage('assets/images/backgrounds/slicing_bg.png', 'background_slicing');
        await assetManager.loadImage('assets/images/workstation/cutting_board.png', 'cutting_board');
        await assetManager.loadImage('assets/images/workstation/serving_plate.png', 'serving_plate');
        await assetManager.loadImage('assets/images/workstation/knife_set.png', 'knife_set');
        
        // 載入鴨子不同狀態圖片
        await assetManager.loadImage('assets/images/duck/duck_roasted_whole.png', 'duck_whole');
        await assetManager.loadImage('assets/images/duck/duck_skin_sliced.png', 'duck_skin_sliced');
        await assetManager.loadImage('assets/images/duck/duck_meat_sliced.png', 'duck_meat_sliced');
        await assetManager.loadImage('assets/images/duck/duck_bones_remaining.png', 'duck_bones');
        
        // 載入切片和配菜圖片
        await assetManager.loadImage('assets/images/slices/skin_slice.png', 'skin_slice');
        await assetManager.loadImage('assets/images/slices/meat_slice.png', 'meat_slice');
        await assetManager.loadImage('assets/images/accompaniments/pancake.png', 'pancake');
        await assetManager.loadImage('assets/images/accompaniments/scallion.png', 'scallion');
        await assetManager.loadImage('assets/images/accompaniments/cucumber.png', 'cucumber');
        await assetManager.loadImage('assets/images/accompaniments/sauce_bowl.png', 'sauce_bowl');
        
        // 載入工具和效果圖片
        await assetManager.loadImage('assets/images/tools/slicing_knife.png', 'slicing_knife');
        await assetManager.loadImage('assets/images/effects/knife_trail.png', 'knife_trail');
        await assetManager.loadImage('assets/images/effects/slice_particle.png', 'slice_particle');
        await assetManager.loadImage('assets/images/effects/juice_drop.png', 'juice_drop');
        await assetManager.loadImage('assets/images/effects/sparkle.png', 'sparkle');
        
        this.backgroundImage = assetManager.getAsset('background_slicing');
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
            text: '片鴨階段 - 技藝展示',
            fontSize: 26,
            color: '#DC143C',
            align: 'center'
        });

        // 創建說明文字
        this.instructionLabel = uiManager.createLabel({
            x: canvas.width / 2,
            y: 80,
            text: '運用傳統技法，將烤鴨片成薄片，展現千年技藝精髓',
            fontSize: 16,
            color: '#8B4513',
            align: 'center'
        });

        // 創建步驟指示器
        this.createStepIndicator();

        // 創建教育內容按鈕
        this.createEducationButton();

        // 創建片鴨技法面板
        this.createSlicingTechniquePanel();

        // 創建品質監控面板
        this.createQualityMonitorPanel();

        // 創建傳統吃法面板
        this.createTraditionalServingPanel();

        // 創建開始步驟按鈕
        this.nextButton = uiManager.createButton({
            x: canvas.width - 180,
            y: canvas.height - 80,
            width: 130,
            height: 50,
            text: '開始片皮',
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

        console.log('片鴨場景設置完成');
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
        let text = '片鴨步驟進度：\n';
        
        this.slicingSteps.forEach((step, index) => {
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
            text: '學習片鴨技藝',
            onClick: () => this.showCurrentStepEducation()
        });
        this.addUIElement(educationButton);
        
        this.addUIElement(educationButton);
    }

    /**
     * 創建片鴨技法面板
     */
    createSlicingTechniquePanel() {
        const uiManager = this.gameEngine.uiManager;
        
        // 技法控制標籤
        this.techniqueLabel = uiManager.createLabel({
            x: 620,
            y: 120,
            text: '片鴨技法控制',
            fontSize: 16,
            color: '#8B0000',
            align: 'left'
        });
        
        // 刀具狀態顯示
        this.knifeStatusLabel = uiManager.createLabel({
            x: 620,
            y: 145,
            text: `刀具鋒利度: ${this.slicingSystem.knife.sharpness}%`,
            fontSize: 14,
            color: '#FF4500',
            align: 'left'
        });
        
        // 切片角度顯示
        this.angleLabel = uiManager.createLabel({
            x: 620,
            y: 165,
            text: `切片角度: ${this.slicingSystem.knife.angle}°`,
            fontSize: 14,
            color: '#FF6347',
            align: 'left'
        });
        
        // 施力控制顯示
        this.pressureLabel = uiManager.createLabel({
            x: 620,
            y: 185,
            text: `施力大小: ${this.slicingSystem.knife.pressure}%`,
            fontSize: 14,
            color: '#DAA520',
            align: 'left'
        });
        
        this.addUIElement(this.techniqueLabel);
        this.addUIElement(this.knifeStatusLabel);
        this.addUIElement(this.angleLabel);
        this.addUIElement(this.pressureLabel);
    }

    /**
     * 創建品質監控面板
     */
    createQualityMonitorPanel() {
        const uiManager = this.gameEngine.uiManager;
        
        // 鴨子溫度
        this.duckTempLabel = uiManager.createLabel({
            x: 620,
            y: 220,
            text: `鴨子溫度: ${this.slicingSystem.duck.temperature}°C`,
            fontSize: 14,
            color: '#CD853F',
            align: 'left'
        });
        
        // 皮片品質
        this.skinQualityLabel = uiManager.createLabel({
            x: 620,
            y: 240,
            text: `皮片品質: ${this.slicingSystem.slices.skin.quality}%`,
            fontSize: 14,
            color: '#DEB887',
            align: 'left'
        });
        
        // 肉片品質
        this.meatQualityLabel = uiManager.createLabel({
            x: 620,
            y: 260,
            text: `肉片品質: ${this.slicingSystem.slices.meat.quality}%`,
            fontSize: 14,
            color: '#D2691E',
            align: 'left'
        });
        
        // 浪費率
        this.wasteRateLabel = uiManager.createLabel({
            x: 620,
            y: 280,
            text: `浪費率: ${this.calculateWasteRate()}%`,
            fontSize: 14,
            color: '#B22222',
            align: 'left'
        });
        
        this.addUIElement(this.duckTempLabel);
        this.addUIElement(this.skinQualityLabel);
        this.addUIElement(this.meatQualityLabel);
        this.addUIElement(this.wasteRateLabel);
    }

    /**
     * 創建傳統吃法面板
     */
    createTraditionalServingPanel() {
        const uiManager = this.gameEngine.uiManager;
        
        // 傳統吃法標題
        this.servingLabel = uiManager.createLabel({
            x: 620,
            y: 320,
            text: '傳統吃法配菜',
            fontSize: 16,
            color: '#8B0000',
            align: 'left'
        });
        
        // 荷葉餅狀態
        this.pancakeLabel = uiManager.createLabel({
            x: 620,
            y: 345,
            text: `荷葉餅: ${this.traditionalServing.pancakes.count}張`,
            fontSize: 14,
            color: '#DEB887',
            align: 'left'
        });
        
        // 蔥絲狀態
        this.scallionLabel = uiManager.createLabel({
            x: 620,
            y: 365,
            text: `蔥絲: ${this.traditionalServing.scallions.prepared ? '已準備' : '未準備'}`,
            fontSize: 14,
            color: '#228B22',
            align: 'left'
        });
        
        // 黃瓜條狀態
        this.cucumberLabel = uiManager.createLabel({
            x: 620,
            y: 385,
            text: `黃瓜條: ${this.traditionalServing.cucumber.prepared ? '已準備' : '未準備'}`,
            fontSize: 14,
            color: '#32CD32',
            align: 'left'
        });
        
        // 甜麵醬狀態
        this.sauceLabel = uiManager.createLabel({
            x: 620,
            y: 405,
            text: `甜麵醬: ${this.traditionalServing.sauce.prepared ? '已準備' : '未準備'}`,
            fontSize: 14,
            color: '#8B4513',
            align: 'left'
        });
        
        this.addUIElement(this.servingLabel);
        this.addUIElement(this.pancakeLabel);
        this.addUIElement(this.scallionLabel);
        this.addUIElement(this.cucumberLabel);
        this.addUIElement(this.sauceLabel);
    }

    /**
     * 計算浪費率
     */
    calculateWasteRate() {
        const totalWeight = this.slicingSystem.duck.totalWeight;
        const wasteAmount = this.slicingSystem.duck.wasteAmount;
        return totalWeight > 0 ? Math.round((wasteAmount / totalWeight) * 100) : 0;
    }

    /**
     * 顯示當前步驟的教育內容
     */
    showCurrentStepEducation() {
        if (this.currentStepIndex >= this.slicingSteps.length) return;
        
        const currentStep = this.slicingSteps[this.currentStepIndex];
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
        if (this.currentStepIndex >= this.slicingSteps.length) {
            this.proceedToNextScene();
            return;
        }

        const currentStep = this.slicingSteps[this.currentStepIndex];
        console.log(`開始步驟: ${currentStep.name}`);
        
        this.hideEducationPanel();
        this.hideSceneUI();
        
        // 根據當前步驟啟動對應的迷你遊戲
        switch (currentStep.id) {
            case 'skin_slicing':
                this.startSkinSlicingGame();
                break;
            case 'meat_slicing':
                this.startMeatSlicingGame();
                break;
            case 'plating_arrangement':
                this.startPlatingArrangementGame();
                break;
        }
    }

    /**
     * 開始片皮迷你遊戲
     */
    startSkinSlicingGame() {
        console.log('啟動片皮迷你遊戲');
        
        this.startMiniGame(SkinSlicingGame, {
            gameEngine: this.gameEngine,
            scene: this,
            gameAreaX: 100,
            gameAreaY: 140,
            gameAreaWidth: 500,
            gameAreaHeight: 300,
            slicingSystem: this.slicingSystem,
            workStation: this.workStation
        });
    }

    /**
     * 開始片肉迷你遊戲
     */
    startMeatSlicingGame() {
        console.log('啟動片肉迷你遊戲');
        
        this.startMiniGame(MeatSlicingGame, {
            gameEngine: this.gameEngine,
            scene: this,
            gameAreaX: 100,
            gameAreaY: 140,
            gameAreaWidth: 500,
            gameAreaHeight: 300,
            slicingSystem: this.slicingSystem,
            workStation: this.workStation
        });
    }

    /**
     * 開始擺盤迷你遊戲
     */
    startPlatingArrangementGame() {
        console.log('啟動擺盤迷你遊戲');
        
        this.startMiniGame(PlatingArrangementGame, {
            gameEngine: this.gameEngine,
            scene: this,
            gameAreaX: 100,
            gameAreaY: 140,
            gameAreaWidth: 500,
            gameAreaHeight: 300,
            slicingSystem: this.slicingSystem,
            workStation: this.workStation,
            traditionalServing: this.traditionalServing
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
                // 只在當前步驟有教育內容時顯示教育按鈕
                if (element === this.educationButton) {
                    if (this.currentStepIndex < this.slicingSteps.length) {
                        const currentStep = this.slicingSteps[this.currentStepIndex];
                        if (currentStep && currentStep.educationContent) {
                            element.setVisible(true);
                        }
                    }
                } else {
                    element.setVisible(true);
                }
            }
        });
    }

    /**
     * 更新場景邏輯
     */
    update(deltaTime) {
        super.update(deltaTime);
        
        // 更新片鴨系統
        this.updateSlicingSystem(deltaTime);
        
        // 更新視覺效果
        this.updateVisualEffects(deltaTime);
        
        // 更新UI顯示
        this.updateUIDisplays();
    }

    /**
     * 更新片鴨系統
     */
    updateSlicingSystem(deltaTime) {
        // 更新鴨子溫度（自然降溫）
        this.updateDuckTemperature(deltaTime);
        
        // 更新刀具狀態
        this.updateKnifeCondition(deltaTime);
        
        // 更新切片品質
        this.updateSliceQuality();
    }

    /**
     * 更新鴨子溫度
     */
    updateDuckTemperature(deltaTime) {
        const duck = this.slicingSystem.duck;
        
        // 自然降溫，但不低於室溫
        if (duck.temperature > 25) {
            duck.temperature = Math.max(25, duck.temperature - 2 * deltaTime);
        }
        
        // 溫度影響切片品質
        if (duck.temperature < 45) {
            // 溫度過低會影響切片效果
            this.slicingSystem.knife.sharpness *= 0.999;
        }
    }

    /**
     * 更新刀具狀態
     */
    updateKnifeCondition(deltaTime) {
        const knife = this.slicingSystem.knife;
        
        // 使用過程中刀具會逐漸變鈍
        if (knife.sharpness > 0) {
            knife.sharpness = Math.max(0, knife.sharpness - 0.1 * deltaTime);
        }
    }

    /**
     * 更新切片品質
     */
    updateSliceQuality() {
        const system = this.slicingSystem;
        
        // 皮片品質計算
        system.slices.skin.quality = this.calculateSliceQuality('skin');
        
        // 肉片品質計算
        system.slices.meat.quality = this.calculateSliceQuality('meat');
    }

    /**
     * 計算切片品質
     */
    calculateSliceQuality(type) {
        const knife = this.slicingSystem.knife;
        const duck = this.slicingSystem.duck;
        
        let quality = 0;
        
        // 刀具鋒利度影響
        quality += knife.sharpness * 0.4;
        
        // 溫度影響
        const tempFactor = duck.temperature > 45 ? 1.0 : duck.temperature / 45;
        quality += tempFactor * 30;
        
        // 角度影響
        const optimalAngle = type === 'skin' ? 20 : 90;
        const angleFactor = 1 - Math.abs(knife.angle - optimalAngle) / optimalAngle;
        quality += angleFactor * 20;
        
        // 施力影響
        const optimalPressure = type === 'skin' ? 30 : 50;
        const pressureFactor = 1 - Math.abs(knife.pressure - optimalPressure) / optimalPressure;
        quality += pressureFactor * 10;
        
        return Math.max(0, Math.min(100, quality));
    }

    /**
     * 更新視覺效果
     */
    updateVisualEffects(deltaTime) {
        // 更新刀痕軌跡
        this.updateKnifeTrails(deltaTime);
        
        // 更新切片粒子
        this.updateSliceParticles(deltaTime);
        
        // 更新蒸汽效果
        this.updateSteamEffects(deltaTime);
        
        // 更新汁液滴落
        this.updateJuiceDrops(deltaTime);
    }

    /**
     * 更新刀痕軌跡
     */
    updateKnifeTrails(deltaTime) {
        // 更新現有軌跡
        this.visualEffects.knifeTrails = this.visualEffects.knifeTrails.filter(trail => {
            trail.life -= deltaTime * 2;
            trail.opacity = trail.life / trail.maxLife;
            return trail.life > 0;
        });
    }

    /**
     * 更新切片粒子
     */
    updateSliceParticles(deltaTime) {
        // 更新粒子
        this.visualEffects.sliceParticles = this.visualEffects.sliceParticles.filter(particle => {
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;
            particle.life -= deltaTime;
            particle.opacity = particle.life / particle.maxLife;
            return particle.life > 0;
        });
    }

    /**
     * 更新蒸汽效果
     */
    updateSteamEffects(deltaTime) {
        const duck = this.slicingSystem.duck;
        
        // 如果鴨子還有溫度，產生蒸汽
        if (duck.temperature > 40) {
            if (Math.random() < 0.1) {
                this.visualEffects.steamEffects.push({
                    x: this.workStation.duckX + Math.random() * this.workStation.duckWidth,
                    y: this.workStation.duckY,
                    vx: (Math.random() - 0.5) * 10,
                    vy: -20 - Math.random() * 10,
                    life: 2.0,
                    maxLife: 2.0,
                    size: 2 + Math.random() * 3,
                    opacity: 0.6
                });
            }
        }
        
        // 更新蒸汽粒子
        this.visualEffects.steamEffects = this.visualEffects.steamEffects.filter(steam => {
            steam.x += steam.vx * deltaTime;
            steam.y += steam.vy * deltaTime;
            steam.life -= deltaTime;
            steam.opacity = steam.life / steam.maxLife * 0.6;
            steam.size += deltaTime;
            return steam.life > 0;
        });
    }

    /**
     * 更新汁液滴落
     */
    updateJuiceDrops(deltaTime) {
        // 更新汁液滴落
        this.visualEffects.juiceDrops = this.visualEffects.juiceDrops.filter(drop => {
            drop.y += drop.vy * deltaTime;
            drop.life -= deltaTime;
            return drop.life > 0 && drop.y < this.workStation.y + this.workStation.height + 50;
        });
    }

    /**
     * 更新UI顯示
     */
    updateUIDisplays() {
        const system = this.slicingSystem;
        
        if (this.knifeStatusLabel) {
            this.knifeStatusLabel.setText(`刀具鋒利度: ${Math.round(system.knife.sharpness)}%`);
        }
        
        if (this.angleLabel) {
            this.angleLabel.setText(`切片角度: ${Math.round(system.knife.angle)}°`);
        }
        
        if (this.pressureLabel) {
            this.pressureLabel.setText(`施力大小: ${Math.round(system.knife.pressure)}%`);
        }
        
        if (this.duckTempLabel) {
            this.duckTempLabel.setText(`鴨子溫度: ${Math.round(system.duck.temperature)}°C`);
        }
        
        if (this.skinQualityLabel) {
            this.skinQualityLabel.setText(`皮片品質: ${Math.round(system.slices.skin.quality)}%`);
        }
        
        if (this.meatQualityLabel) {
            this.meatQualityLabel.setText(`肉片品質: ${Math.round(system.slices.meat.quality)}%`);
        }
        
        if (this.wasteRateLabel) {
            this.wasteRateLabel.setText(`浪費率: ${this.calculateWasteRate()}%`);
        }
        
        // 更新傳統吃法顯示
        if (this.pancakeLabel) {
            this.pancakeLabel.setText(`荷葉餅: ${this.traditionalServing.pancakes.count}張`);
        }
        
        if (this.scallionLabel) {
            this.scallionLabel.setText(`蔥絲: ${this.traditionalServing.scallions.prepared ? '已準備' : '未準備'}`);
        }
        
        if (this.cucumberLabel) {
            this.cucumberLabel.setText(`黃瓜條: ${this.traditionalServing.cucumber.prepared ? '已準備' : '未準備'}`);
        }
        
        if (this.sauceLabel) {
            this.sauceLabel.setText(`甜麵醬: ${this.traditionalServing.sauce.prepared ? '已準備' : '未準備'}`);
        }
    }

    /**
     * 迷你遊戲返回回調
     */
    onMiniGameBack() {
        console.log('從迷你遊戲返回到切片場景');
        this.showSceneUI();
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
            const currentStep = this.slicingSteps[this.currentStepIndex];
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
            const step = this.slicingSteps.find(s => s.id === stepId);
            if (step) {
                step.completed = true;
                
                // 根據步驟更新片鴨系統狀態
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
        const system = this.slicingSystem;
        
        switch (stepId) {
            case 'skin_slicing':
                system.slices.skin.count = stats.sliceCount || 24;
                system.slices.skin.quality = stats.quality || 85;
                system.slices.skin.uniformity = stats.uniformity || 80;
                system.duck.slicedWeight += stats.slicedWeight || 200;
                system.duck.wasteAmount += stats.wasteAmount || 20;
                break;
                
            case 'meat_slicing':
                system.slices.meat.count = stats.sliceCount || 36;
                system.slices.meat.quality = stats.quality || 80;
                system.slices.meat.uniformity = stats.uniformity || 75;
                system.duck.slicedWeight += stats.slicedWeight || 800;
                system.duck.wasteAmount += stats.wasteAmount || 50;
                break;
                
            case 'plating_arrangement':
                system.plating.style = stats.style || 'traditional';
                system.plating.symmetry = stats.symmetry || 85;
                system.plating.colorBalance = stats.colorBalance || 80;
                system.plating.creativity = stats.creativity || 75;
                system.plating.overallScore = stats.overallScore || 80;
                
                // 更新傳統吃法配菜
                this.traditionalServing.pancakes.count = stats.pancakeCount || 12;
                this.traditionalServing.pancakes.prepared = true;
                this.traditionalServing.scallions.prepared = true;
                this.traditionalServing.cucumber.prepared = true;
                this.traditionalServing.sauce.prepared = true;
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
        if (!this.nextButton) return;
        
        if (this.currentStepIndex >= this.slicingSteps.length) {
            this.nextButton.setText('完成片鴨');
            this.sceneProgress.allStepsCompleted = true;
            this.sceneProgress.readyForNextScene = true;
        } else {
            const nextStep = this.slicingSteps[this.currentStepIndex];
            const buttonTexts = {
                'skin_slicing': '開始片皮',
                'meat_slicing': '開始片肉',
                'plating_arrangement': '開始擺盤'
            };
            this.nextButton.setText(buttonTexts[nextStep.id] || '下一步');
        }
    }

    /**
     * 顯示成功消息
     */
    showSuccessMessage(stepName, score) {
        const uiManager = this.gameEngine.uiManager;
        const canvas = this.gameEngine.canvas;
        
        const successMessage = uiManager.createLabel({
            x: canvas.width / 2,
            y: canvas.height / 2,
            text: `${stepName}完成！\n評分: ${score}分`,
            fontSize: 20,
            color: '#32CD32',
            align: 'center'
        });
        
        // 3秒後移除消息
        setTimeout(() => {
            uiManager.removeUIElement(successMessage);
        }, 3000);
        
        if (this.gameEngine.gameState.settings.soundEnabled) {
            this.gameEngine.audioManager.playSound('success');
        }
    }

    /**
     * 顯示重試消息
     */
    showRetryMessage() {
        const uiManager = this.gameEngine.uiManager;
        const canvas = this.gameEngine.canvas;
        
        const retryMessage = uiManager.createLabel({
            x: canvas.width / 2,
            y: canvas.height / 2,
            text: '請再試一次，熟能生巧！',
            fontSize: 18,
            color: '#FFD700',
            align: 'center'
        });
        
        // 2秒後移除消息
        setTimeout(() => {
            uiManager.removeUIElement(retryMessage);
        }, 2000);
    }

    /**
     * 返回上一場景
     */
    goBack() {
        console.log('返回烤製場景');
        this.transitionToScene('roasting');
    }

    /**
     * 進入下一場景
     */
    proceedToNextScene() {
        console.log('進入完成場景');
        
        // 完成片鴨步驟
        this.gameEngine.progressManager.completeStep('slicing');
        
        // 標記遊戲完成並獲取完成資料
        const completionData = this.gameEngine.progressManager.completeGame();
        
        // 更新遊戲狀態
        this.gameEngine.updateGameState({
            progress: { ...this.gameEngine.gameState.progress, slicing: true },
            gameCompleted: true,
            completionData: completionData
        });
        
        // 切換到完成場景
        this.transitionToScene('completion');
    }

    /**
     * 渲染場景
     */
    render(context) {
        super.render(context);
        
        // 渲染工作台
        this.renderWorkStation(context);
        
        // 渲染鴨子和切片
        this.renderDuckAndSlices(context);
        
        // 渲染視覺效果
        this.renderVisualEffects(context);
        
        // 渲染教育面板（如果顯示）
        if (this.showingEducation && this.educationPanel) {
            this.renderEducationPanel(context);
        }
    }

    /**
     * 渲染工作台
     */
    renderWorkStation(context) {
        const ws = this.workStation;
        
        // 渲染切菜板
        context.fillStyle = '#DEB887';
        context.fillRect(ws.x, ws.y, ws.width, ws.height);
        
        // 渲染盤子
        context.fillStyle = '#FFFFFF';
        context.beginPath();
        context.ellipse(ws.plateX, ws.plateY, ws.plateWidth/2, ws.plateHeight/2, 0, 0, 2 * Math.PI);
        context.fill();
        context.strokeStyle = '#D3D3D3';
        context.stroke();
    }

    /**
     * 渲染鴨子和切片
     */
    renderDuckAndSlices(context) {
        const ws = this.workStation;
        const system = this.slicingSystem;
        
        // 渲染鴨子（根據切片進度顯示不同狀態）
        context.fillStyle = '#8B4513';
        
        if (system.slices.skin.count === 0 && system.slices.meat.count === 0) {
            // 完整烤鴨
            context.fillRect(ws.duckX - ws.duckWidth/2, ws.duckY - ws.duckHeight/2, ws.duckWidth, ws.duckHeight);
        } else if (system.slices.meat.count === 0) {
            // 已片皮，未片肉
            context.fillStyle = '#CD853F';
            context.fillRect(ws.duckX - ws.duckWidth/2, ws.duckY - ws.duckHeight/2, ws.duckWidth, ws.duckHeight);
        } else {
            // 已片肉，剩餘骨架
            context.fillStyle = '#A0522D';
            context.fillRect(ws.duckX - ws.duckWidth/3, ws.duckY - ws.duckHeight/3, ws.duckWidth/1.5, ws.duckHeight/1.5);
        }
        
        // 渲染切片（在盤子上）
        this.renderSlicesOnPlate(context);
    }

    /**
     * 渲染盤子上的切片
     */
    renderSlicesOnPlate(context) {
        const ws = this.workStation;
        const system = this.slicingSystem;
        
        // 渲染皮片
        context.fillStyle = '#DAA520';
        for (let i = 0; i < system.slices.skin.count; i++) {
            const angle = (i / system.slices.skin.count) * Math.PI * 2;
            const radius = 30;
            const x = ws.plateX + Math.cos(angle) * radius;
            const y = ws.plateY + Math.sin(angle) * radius;
            
            context.save();
            context.translate(x, y);
            context.rotate(angle);
            context.fillRect(-8, -3, 16, 6);
            context.restore();
        }
        
        // 渲染肉片
        context.fillStyle = '#CD853F';
        for (let i = 0; i < Math.min(system.slices.meat.count, 20); i++) {
            const angle = (i / 20) * Math.PI * 2;
            const radius = 15;
            const x = ws.plateX + Math.cos(angle) * radius;
            const y = ws.plateY + Math.sin(angle) * radius;
            
            context.save();
            context.translate(x, y);
            context.rotate(angle);
            context.fillRect(-6, -2, 12, 4);
            context.restore();
        }
    }

    /**
     * 渲染視覺效果
     */
    renderVisualEffects(context) {
        // 渲染刀痕軌跡
        this.visualEffects.knifeTrails.forEach(trail => {
            context.save();
            context.globalAlpha = trail.opacity;
            context.strokeStyle = '#C0C0C0';
            context.lineWidth = 2;
            context.beginPath();
            context.moveTo(trail.startX, trail.startY);
            context.lineTo(trail.endX, trail.endY);
            context.stroke();
            context.restore();
        });
        
        // 渲染切片粒子
        this.visualEffects.sliceParticles.forEach(particle => {
            context.save();
            context.globalAlpha = particle.opacity;
            context.fillStyle = particle.color;
            context.fillRect(particle.x - particle.size/2, particle.y - particle.size/2, particle.size, particle.size);
            context.restore();
        });
        
        // 渲染蒸汽效果
        this.visualEffects.steamEffects.forEach(steam => {
            context.save();
            context.globalAlpha = steam.opacity;
            context.fillStyle = '#E6E6FA';
            context.beginPath();
            context.arc(steam.x, steam.y, steam.size, 0, 2 * Math.PI);
            context.fill();
            context.restore();
        });
        
        // 渲染汁液滴落
        this.visualEffects.juiceDrops.forEach(drop => {
            context.save();
            context.fillStyle = '#8B4513';
            context.beginPath();
            context.arc(drop.x, drop.y, drop.size, 0, 2 * Math.PI);
            context.fill();
            context.restore();
        });
    }

    /**
     * 渲染教育面板
     */
    renderEducationPanel(context) {
        const canvas = this.gameEngine.canvas;
        
        // 渲染半透明背景
        context.save();
        context.fillStyle = 'rgba(0, 0, 0, 0.8)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // 渲染面板背景
        context.fillStyle = 'rgba(139, 69, 19, 0.95)';
        context.fillRect(60, 100, canvas.width - 120, canvas.height - 200);
        
        // 渲染邊框
        context.strokeStyle = '#FFD700';
        context.lineWidth = 3;
        context.strokeRect(60, 100, canvas.width - 120, canvas.height - 200);
        
        context.restore();
    }
}
// 匯出到全域作用域
window.SlicingScene = SlicingScene;
