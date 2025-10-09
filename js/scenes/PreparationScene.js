/**
 * 製胚場景
 * 北京烤鴨製作的關鍵階段，包含充氣、支撐、燙皮、上糖色等步驟
 */
class PreparationScene extends Scene {
    constructor(name, gameEngine) {
        super(name, gameEngine);
        
        // 場景UI元素
        this.titleLabel = null;
        this.instructionLabel = null;
        this.educationPanel = null;
        this.educationButton = null;
        this.nextButton = null;
        this.backButton = null;
        this.stepIndicator = null;
        
        // 製胚步驟管理
        this.preparationSteps = [
            {
                id: 'inflation_support',
                name: '充氣支撐',
                description: '為鴨胚充氣並放置支撐木棍',
                miniGameClass: 'InflationSupportGame',
                completed: false,
                educationContent: {
                    title: '充氣支撐的科學原理',
                    content: `🎈 充氣支撐技術要點：

💨 充氣原理：
• 目的：使鴨皮與肉分離，形成空氣層
• 壓力：適中壓力，避免過度充氣破皮
• 方法：從頸部切口緩慢充入空氣
• 效果：烤製時皮脆肉嫩，層次分明

🪵 支撐技巧：
• 木棍選擇：光滑無刺的硬木棍
• 放置位置：胸腔內橫向支撐
• 作用：保持鴨胚形狀，防止塌陷
• 長度：略短於鴨胚寬度

⚖️ 品質控制：
• 充氣均勻，無局部過脹
• 皮肉分離完全
• 支撐穩固不移位
• 外形飽滿自然

🔬 科學依據：
• 空氣層隔熱效應
• 均勻受熱原理
• 脂肪滲透機制
• 皮肉分層烹飪`
                }
            },
            {
                id: 'scalding_coloring',
                name: '燙皮上糖色',
                description: '用熱水燙皮並均勻塗抹糖漿',
                miniGameClass: 'ScaldingColoringGame',
                completed: false,
                educationContent: {
                    title: '燙皮上糖色的關鍵技術',
                    content: `🔥 燙皮技術精要：

🌡️ 溫度控制：
• 水溫：85-90°C最佳
• 時間：快速均勻澆淋
• 方法：從上到下，不留死角
• 效果：收縮毛孔，緊實皮質

🍯 糖漿配製：
• 成分：麥芽糖、蜂蜜、料酒
• 比例：3:1:1的黃金比例
• 濃度：適中，易於塗抹
• 溫度：微溫狀態使用

🎨 上色技巧：
• 塗抹方向：順著鴨身紋理
• 厚度：薄而均勻
• 覆蓋：全身無遺漏
• 重點：胸部和腿部

🧪 美拉德反應：
• 原理：糖分與蛋白質反應
• 條件：高溫下產生
• 效果：形成誘人色澤和香味
• 時機：烤製過程中完成`
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
        
        // 鴨胚展示系統
        this.duckDisplay = {
            x: 280,
            y: 160,
            width: 240,
            height: 180,
            duckImage: null,
            preparationState: 'cleaned', // cleaned, inflated, scalded_colored
            inflationLevel: 0, // 0-100
            coloringLevel: 0   // 0-100
        };
        
        // 製胚工具系統
        this.preparationTools = {
            inflationPump: { x: 100, y: 300, active: false },
            supportStick: { x: 150, y: 300, active: false },
            hotWater: { x: 200, y: 300, active: false },
            sugarSyrup: { x: 250, y: 300, active: false }
        };
    }

    /**
     * 載入場景資源
     */
    async loadSceneAssets() {
        const assetManager = this.gameEngine.assetManager;

        // 並行載入所有圖片以加快速度
        await Promise.all([
            assetManager.loadImage('assets/images/backgrounds/preparation_bg.png', 'background_preparation'),
            assetManager.loadImage('assets/images/duck/before_inflation_duck.png', 'before_inflation_duck'),
            assetManager.loadImage('assets/images/duck/duck_inflated.png', 'duck_inflated'),
            assetManager.loadImage('assets/images/duck/duck_prepared.png', 'duck_prepared'),
            assetManager.loadImage('assets/images/tools/inflation_pump.png', 'inflation_pump'),
            assetManager.loadImage('assets/images/tools/support_stick.png', 'support_stick'),
            assetManager.loadImage('assets/images/tools/hot_water_pot.png', 'hot_water_pot'),
            assetManager.loadImage('assets/images/tools/sugar_syrup.png', 'sugar_syrup'),
            assetManager.loadImage('assets/images/effects/steam.png', 'steam_effect'),
            assetManager.loadImage('assets/images/effects/sugar_glaze.png', 'sugar_glaze')
        ]);

        this.backgroundImage = assetManager.getAsset('background_preparation');
        this.duckDisplay.duckImage = assetManager.getAsset('before_inflation_duck');
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
            text: '製胚階段 - 關鍵製作工藝',
            fontSize: 26,
            color: '#B8860B',
            align: 'center'
        });

        // 創建說明文字
        this.instructionLabel = uiManager.createLabel({
            x: canvas.width / 2,
            y: 80,
            text: '掌握北京烤鴨製胚的核心技術',
            fontSize: 16,
            color: '#8B7355',
            align: 'center'
        });

        // 創建步驟指示器
        this.createStepIndicator();

        // 創建教育內容按鈕
        this.createEducationButton();

        // 創建開始步驟按鈕
        this.nextButton = uiManager.createButton({
            x: canvas.width - 180,
            y: canvas.height - 80,
            width: 130,
            height: 50,
            text: '開始充氣支撐',
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

        // 創建製胚進度顯示
        this.createPreparationProgress();

        console.log('製胚場景設置完成');
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
            color: '#B8860B',
            align: 'left'
        });
    }

    /**
     * 獲取步驟指示器文字
     */
    getStepIndicatorText() {
        let text = '製胚步驟進度：\n';
        
        this.preparationSteps.forEach((step, index) => {
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

        this.educationButton = uiManager.createButton({
            x: 50,
            y: 220,
            width: 130,
            height: 40,
            text: '學習製胚技術',
            onClick: () => this.showCurrentStepEducation()
        });

        this.addUIElement(this.educationButton);
    }

    /**
     * 創建製胚進度顯示
     */
    createPreparationProgress() {
        const uiManager = this.gameEngine.uiManager;
        
        // 充氣進度標籤
        this.inflationProgressLabel = uiManager.createLabel({
            x: 580,
            y: 200,
            text: '充氣進度: 0%',
            fontSize: 14,
            color: '#4169E1',
            align: 'left'
        });
        
        // 上色進度標籤
        this.coloringProgressLabel = uiManager.createLabel({
            x: 580,
            y: 220,
            text: '上色進度: 0%',
            fontSize: 14,
            color: '#FF8C00',
            align: 'left'
        });
        
        this.addUIElement(this.inflationProgressLabel);
        this.addUIElement(this.coloringProgressLabel);
    }

    /**
     * 顯示當前步驟的教育內容
     */
    showCurrentStepEducation() {
        if (this.currentStepIndex >= this.preparationSteps.length) return;
        
        const currentStep = this.preparationSteps[this.currentStepIndex];
        this.showEducationPanel(currentStep.educationContent);
    }

    /**
     * 顯示教育面板
     */
    showEducationPanel(content) {
        this.showingEducation = true;
        this.educationContent = content;
        const uiManager = this.gameEngine.uiManager;
        const canvas = this.gameEngine.canvas;

        // 創建教育面板
        this.educationPanel = {
            closeButton: uiManager.createButton({
                x: canvas.width / 2 - 40,
                y: canvas.height - 90,
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
        this.educationContent = null;
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
        if (this.currentStepIndex >= this.preparationSteps.length) {
            this.proceedToNextScene();
            return;
        }

        const currentStep = this.preparationSteps[this.currentStepIndex];
        console.log(`開始步驟: ${currentStep.name}`);
        
        this.hideEducationPanel();
        this.hideSceneUI();
        
        // 根據步驟啟動對應的迷你遊戲
        if (currentStep.id === 'inflation_support') {
            this.startInflationSupportGame();
        } else if (currentStep.id === 'scalding_coloring') {
            this.startScaldingColoringGame();
        }
    }

    /**
     * 開始充氣支撐迷你遊戲
     */
    startInflationSupportGame() {
        console.log('啟動充氣支撐迷你遊戲');
        
        // 開始充氣支撐迷你遊戲
        this.startMiniGame(InflationSupportGame, {
            gameEngine: this.gameEngine,
            scene: this,
            gameAreaX: 100,
            gameAreaY: 140,
            gameAreaWidth: 600,
            gameAreaHeight: 320,
            duckDisplay: this.duckDisplay,
            onProgressUpdate: (inflationLevel) => {
                this.updateInflationProgress(inflationLevel);
            }
        });
    }

    /**
     * 開始燙皮上糖色迷你遊戲
     */
    startScaldingColoringGame() {
        console.log('啟動燙皮上糖色迷你遊戲');
        
        // 開始燙皮上糖色迷你遊戲
        this.startMiniGame(ScaldingColoringGame, {
            gameEngine: this.gameEngine,
            scene: this,
            gameAreaX: 100,
            gameAreaY: 140,
            gameAreaWidth: 600,
            gameAreaHeight: 320,
            duckDisplay: this.duckDisplay,
            onProgressUpdate: (coloringLevel) => {
                this.updateColoringProgress(coloringLevel);
            }
        });
    }

    /**
     * 更新充氣進度
     */
    updateInflationProgress(level) {
        this.duckDisplay.inflationLevel = level;
        if (this.inflationProgressLabel) {
            this.inflationProgressLabel.setText(`充氣進度: ${Math.round(level)}%`);
        }
    }

    /**
     * 更新上色進度
     */
    updateColoringProgress(level) {
        this.duckDisplay.coloringLevel = level;
        if (this.coloringProgressLabel) {
            this.coloringProgressLabel.setText(`上色進度: ${Math.round(level)}%`);
        }
    }

    /**
     * 迷你遊戲返回回調
     */
    onMiniGameBack() {
        console.log('從迷你遊戲返回到製胚場景');
        this.showSceneUI();
    }

    /**
     * 迷你遊戲完成回調
     */
    onMiniGameComplete(success, stats) {
        const gameName = this.currentMiniGame ? this.currentMiniGame.name : '未知遊戲';
        console.log(`${gameName}完成:`, success ? '成功' : '失敗');

        if (success) {
            // 根據遊戲名稱確定步驟ID
            let stepId = '';
            if (gameName === '充氣支撐遊戲') {
                stepId = 'inflation_support';
            } else if (gameName === '燙皮上糖色遊戲') {
                stepId = 'scalding_coloring';
            }

            if (stepId) {
                this.onStepComplete(stepId, success, stats);
            }
        } else {
            // 失敗時允許重試
            this.showRetryMessage();
            this.showSceneUI();
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
            const step = this.preparationSteps.find(s => s.id === stepId);
            if (step) {
                step.completed = true;

                // 更新鴨胚顯示狀態
                this.updateDuckDisplayState(stepId);

                // 更新進度管理器
                this.gameEngine.progressManager.completeStep(stepId);

                // 顯示成功消息
                this.showSuccessMessage(step.name, stats.score);

                // 移動到下一步驟
                this.currentStepIndex++;
                this.updateStepIndicator();
                this.updateNextButton();

                // 顯示場景UI
                this.showSceneUI();

                // 自動開始下一個步驟並顯示載入畫面
                setTimeout(() => {
                    if (this.currentStepIndex < this.preparationSteps.length) {
                        console.log('自動開始下一個步驟');
                        this.showLoadingForNextStep();
                    } else {
                        console.log('所有步驟完成，準備進入下一場景');
                    }
                }, 1500);
            }
        } else {
            // 失敗時允許重試
            this.showRetryMessage();
        }
    }

    /**
     * 顯示載入畫面並開始下一步驟
     */
    showLoadingForNextStep() {
        // 設置載入狀態
        this.isLoading = true;

        // 隱藏所有UI
        this.hideSceneUI();
        this.hideEducationPanel();

        // 清理當前迷你遊戲
        if (this.currentMiniGame) {
            this.currentMiniGame.cleanup();
            this.currentMiniGame = null;
        }

        // 1秒後開始下一步驟
        setTimeout(() => {
            this.isLoading = false;
            this.startCurrentStep();
        }, 1000);
    }

    /**
     * 更新鴨胚顯示狀態
     */
    updateDuckDisplayState(completedStepId) {
        const assetManager = this.gameEngine.assetManager;
        
        if (completedStepId === 'inflation_support') {
            this.duckDisplay.preparationState = 'inflated';
            this.duckDisplay.duckImage = assetManager.getAsset('duck_inflated');
        } else if (completedStepId === 'scalding_coloring') {
            this.duckDisplay.preparationState = 'scalded_colored';
            this.duckDisplay.duckImage = assetManager.getAsset('duck_prepared');
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
        if (this.currentStepIndex >= this.preparationSteps.length) {
            // 所有步驟完成
            this.sceneProgress.allStepsCompleted = true;
            this.sceneProgress.readyForNextScene = true;
            
            this.nextButton.setText('進入晾胚階段');
            this.nextButton.onClick = () => this.proceedToNextScene();
            
            // 標記製胚階段完成
            this.gameEngine.updateGameState({
                progress: {
                    ...this.gameEngine.gameState.progress,
                    preparation: true
                }
            });
        } else {
            // 準備下一步驟
            const nextStep = this.preparationSteps[this.currentStepIndex];
            this.nextButton.setText(`開始${nextStep.name}`);
        }
    }

    /**
     * 顯示成功消息
     */
    showSuccessMessage(stepName, score) {
        const uiManager = this.gameEngine.uiManager;
        const canvas = this.gameEngine.canvas;

        uiManager.createDismissibleMessage({
            text: `${stepName}完成！\n獲得分數: ${score}\n製胚技藝精進！`,
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

        uiManager.createDismissibleMessage({
            text: '製胚需要精確技巧，請再試一次',
            x: canvas.width / 2,
            y: canvas.height / 2 - 50,
            fontSize: 18,
            color: '#FF6B6B',
            autoDismissTime: 5000
        });
    }

    /**
     * 返回上一個場景
     */
    goBack() {
        this.transitionToScene('processing');
    }

    /**
     * 進入下一個場景
     */
    proceedToNextScene() {
        console.log('製胚階段完成，進入晾胚階段');
        this.transitionToScene('drying');
    }

    /**
     * 自定義載入畫面
     */
    renderLoadingScreen(context) {
        const canvas = context.canvas;

        // 填充背景
        const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#2c3e50');
        gradient.addColorStop(1, '#34495e');
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);

        // 渲染載入文字
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 32px Microsoft JhengHei, sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';

        const nextStep = this.preparationSteps[this.currentStepIndex];
        const loadingText = nextStep ? `準備 ${nextStep.name} ...` : '載入中...';
        context.fillText(loadingText, canvas.width / 2, canvas.height / 2);

        // 渲染載入動畫點
        const dots = '.'.repeat((Math.floor(Date.now() / 500) % 4));
        context.fillStyle = '#FFFFFF';
        context.font = 'bold 32px Microsoft JhengHei, sans-serif';
        context.fillText(dots, canvas.width / 2 + 150, canvas.height / 2);
    }

    /**
     * 渲染場景特定內容
     */
    renderScene(context) {
        // 渲染鴨胚展示區域
        this.renderDuckDisplay(context);

        // 渲染製胚工具
        this.renderPreparationTools(context);

        // 渲染製胚效果
        this.renderPreparationEffects(context);

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
        context.fillStyle = 'rgba(255, 248, 220, 0.95)';
        context.fillRect(display.x - 15, display.y - 15, display.width + 30, display.height + 30);
        
        context.strokeStyle = '#B8860B';
        context.lineWidth = 3;
        context.strokeRect(display.x - 15, display.y - 15, display.width + 30, display.height + 30);
        
        // 繪製鴨胚圖片
        if (display.duckImage) {
            context.drawImage(display.duckImage, display.x, display.y, display.width, display.height);
        } else {
            // 如果圖片未載入，顯示佔位符
            context.fillStyle = '#F5F5DC';
            context.fillRect(display.x, display.y, display.width, display.height);
            
            context.fillStyle = '#8B7355';
            context.font = '16px Microsoft JhengHei';
            context.textAlign = 'center';
            context.fillText('製胚中的鴨胚', display.x + display.width / 2, display.y + display.height / 2);
        }
        
        // 繪製製胚狀態標籤
        context.fillStyle = '#B8860B';
        context.font = 'bold 16px Microsoft JhengHei';
        context.textAlign = 'center';
        
        let statusText = '已清洗';
        if (display.preparationState === 'inflated') {
            statusText = '已充氣支撐';
        } else if (display.preparationState === 'scalded_colored') {
            statusText = '已燙皮上色';
        }
        
        context.fillText(`鴨胚狀態: ${statusText}`, display.x + display.width / 2, display.y - 25);
        
        // 繪製充氣效果指示
        if (display.inflationLevel > 0) {
            this.renderInflationEffect(context, display);
        }
        
        // 繪製上色效果指示
        if (display.coloringLevel > 0) {
            this.renderColoringEffect(context, display);
        }
    }

    /**
     * 渲染充氣效果
     */
    renderInflationEffect(context, display) {
        const inflationAlpha = display.inflationLevel / 100;
        
        // 繪製充氣膨脹效果
        context.save();
        context.globalAlpha = inflationAlpha * 0.3;
        context.strokeStyle = '#87CEEB';
        context.lineWidth = 2;
        
        // 繪製膨脹輪廓
        const expandSize = (display.inflationLevel / 100) * 10;
        context.strokeRect(
            display.x - expandSize, 
            display.y - expandSize, 
            display.width + expandSize * 2, 
            display.height + expandSize * 2
        );
        
        context.restore();
    }

    /**
     * 渲染上色效果
     */
    renderColoringEffect(context, display) {
        const coloringAlpha = display.coloringLevel / 100;
        
        // 繪製糖色光澤效果
        context.save();
        context.globalAlpha = coloringAlpha * 0.4;
        context.fillStyle = '#FFD700';
        
        // 繪製光澤覆蓋層
        context.fillRect(display.x, display.y, display.width, display.height);
        
        context.restore();
    }

    /**
     * 渲染製胚工具
     */
    renderPreparationTools(context) {
        const tools = this.preparationTools;
        
        // 工具展示區域背景
        context.fillStyle = 'rgba(210, 180, 140, 0.8)';
        context.fillRect(80, 280, 300, 80);
        
        context.strokeStyle = '#8B7355';
        context.lineWidth = 2;
        context.strokeRect(80, 280, 300, 80);
        
        // 工具標題
        context.fillStyle = '#8B4513';
        context.font = 'bold 14px Microsoft JhengHei';
        context.textAlign = 'center';
        context.fillText('製胚工具', 230, 275);
        
        // 繪製各種工具
        const toolSize = 40;
        const toolY = 300;
        
        // 充氣泵
        context.fillStyle = tools.inflationPump.active ? '#4169E1' : '#696969';
        context.fillRect(tools.inflationPump.x, toolY, toolSize, toolSize);
        context.fillStyle = '#FFFFFF';
        context.font = '12px Microsoft JhengHei';
        context.textAlign = 'center';
        context.fillText('充氣泵', tools.inflationPump.x + toolSize/2, toolY + toolSize + 15);
        
        // 支撐木棍
        context.fillStyle = tools.supportStick.active ? '#8B4513' : '#696969';
        context.fillRect(tools.supportStick.x, toolY, toolSize, toolSize);
        context.fillStyle = '#FFFFFF';
        context.fillText('木棍', tools.supportStick.x + toolSize/2, toolY + toolSize + 15);
        
        // 熱水
        context.fillStyle = tools.hotWater.active ? '#FF4500' : '#696969';
        context.fillRect(tools.hotWater.x, toolY, toolSize, toolSize);
        context.fillStyle = '#FFFFFF';
        context.fillText('熱水', tools.hotWater.x + toolSize/2, toolY + toolSize + 15);
        
        // 糖漿
        context.fillStyle = tools.sugarSyrup.active ? '#FFD700' : '#696969';
        context.fillRect(tools.sugarSyrup.x, toolY, toolSize, toolSize);
        context.fillStyle = '#FFFFFF';
        context.fillText('糖漿', tools.sugarSyrup.x + toolSize/2, toolY + toolSize + 15);
    }

    /**
     * 渲染製胚效果
     */
    renderPreparationEffects(context) {
        // 根據當前步驟顯示相應的視覺效果
        if (this.currentStepIndex < this.preparationSteps.length) {
            const currentStep = this.preparationSteps[this.currentStepIndex];
            
            if (currentStep.id === 'inflation_support') {
                this.renderInflationEffects(context);
            } else if (currentStep.id === 'scalding_coloring') {
                this.renderScaldingEffects(context);
            }
        }
    }

    /**
     * 渲染充氣效果
     */
    renderInflationEffects(context) {
        // 繪製空氣流動效果
        const time = Date.now() * 0.003;
        
        for (let i = 0; i < 3; i++) {
            const x = 150 + Math.sin(time + i) * 20;
            const y = 200 + i * 30;
            
            context.save();
            context.globalAlpha = 0.6;
            context.fillStyle = '#87CEEB';
            context.beginPath();
            context.arc(x, y, 5, 0, Math.PI * 2);
            context.fill();
            context.restore();
        }
    }

    /**
     * 渲染燙皮效果
     */
    renderScaldingEffects(context) {
        // 繪製蒸汽效果
        const time = Date.now() * 0.002;
        
        for (let i = 0; i < 5; i++) {
            const x = 300 + Math.sin(time + i * 0.5) * 15;
            const y = 150 - i * 20 + Math.cos(time + i) * 10;
            
            context.save();
            context.globalAlpha = 0.4 - i * 0.08;
            context.fillStyle = '#F0F8FF';
            context.beginPath();
            context.arc(x, y, 8 - i, 0, Math.PI * 2);
            context.fill();
            context.restore();
        }
    }

    /**
     * 渲染教育面板背景
     */
    renderEducationPanelBackground(context) {
        if (!this.educationContent) return;

        const canvas = context.canvas;

        // 繪製全螢幕半透明背景遮罩
        context.fillStyle = 'rgba(0, 0, 0, 0.9)';
        context.fillRect(0, 0, canvas.width, canvas.height);

        // 繪製教育面板背景
        const panelX = 60;
        const panelY = 80;
        const panelWidth = canvas.width - 120;
        const panelHeight = canvas.height - 160;

        context.fillStyle = 'rgba(139, 69, 19, 0.98)';
        context.fillRect(panelX, panelY, panelWidth, panelHeight);

        // 繪製邊框
        context.strokeStyle = '#FFD700';
        context.lineWidth = 3;
        context.strokeRect(panelX, panelY, panelWidth, panelHeight);

        // 繪製標題
        context.fillStyle = '#FFD700';
        context.font = 'bold 22px Microsoft JhengHei, sans-serif';
        context.textAlign = 'center';
        context.fillText(this.educationContent.title, canvas.width / 2, panelY + 40);

        // 繪製分隔線
        context.strokeStyle = '#FFD700';
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(panelX + 40, panelY + 60);
        context.lineTo(panelX + panelWidth - 40, panelY + 60);
        context.stroke();

        // 分割內容為兩欄
        const contentLines = this.educationContent.content.split('\n');
        const midPoint = Math.ceil(contentLines.length / 2);
        const leftColumnLines = contentLines.slice(0, midPoint);
        const rightColumnLines = contentLines.slice(midPoint);

        // 設置文字樣式
        context.fillStyle = '#FFFFFF';
        context.font = '15px Microsoft JhengHei, sans-serif';
        context.textAlign = 'left';

        const columnWidth = (panelWidth - 100) / 2;
        const leftColumnX = panelX + 30;
        const rightColumnX = panelX + panelWidth / 2 + 20;
        const startY = panelY + 90;
        const lineHeight = 24;

        // 繪製左欄
        leftColumnLines.forEach((line, index) => {
            const y = startY + index * lineHeight;
            if (y < panelY + panelHeight - 80) {
                this.wrapText(context, line, leftColumnX, y, columnWidth, lineHeight);
            }
        });

        // 繪製右欄
        rightColumnLines.forEach((line, index) => {
            const y = startY + index * lineHeight;
            if (y < panelY + panelHeight - 80) {
                this.wrapText(context, line, rightColumnX, y, columnWidth, lineHeight);
            }
        });
    }

    /**
     * 包裝文字以適應寬度
     */
    wrapText(context, text, x, y, maxWidth, lineHeight) {
        const words = text.split('');
        let line = '';
        let offsetY = 0;

        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i];
            const metrics = context.measureText(testLine);
            const testWidth = metrics.width;

            if (testWidth > maxWidth && i > 0) {
                context.fillText(line, x, y + offsetY);
                line = words[i];
                offsetY += lineHeight;
            } else {
                line = testLine;
            }
        }
        context.fillText(line, x, y + offsetY);
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
        if (this.educationButton) this.educationButton.setVisible(false);
        if (this.inflationProgressLabel) this.inflationProgressLabel.setVisible(false);
        if (this.coloringProgressLabel) this.coloringProgressLabel.setVisible(false);
    }

    /**
     * 顯示場景UI元素
     */
    showSceneUI() {
        if (this.titleLabel) this.titleLabel.setVisible(true);
        if (this.instructionLabel) this.instructionLabel.setVisible(true);
        if (this.stepIndicator) this.stepIndicator.setVisible(true);
        if (this.backButton) this.backButton.setVisible(true);

        // 更新按鈕狀態和文字
        this.updateNextButton();
        if (this.nextButton) this.nextButton.setVisible(true);

        // 只在當前步驟有教育內容時顯示教育按鈕
        if (this.educationButton && this.currentStepIndex < this.preparationSteps.length) {
            const currentStep = this.preparationSteps[this.currentStepIndex];
            if (currentStep && currentStep.educationContent) {
                this.educationButton.setVisible(true);
            }
        }

        if (this.inflationProgressLabel) this.inflationProgressLabel.setVisible(true);
        if (this.coloringProgressLabel) this.coloringProgressLabel.setVisible(true);
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
        if (this.educationButton) uiManager.removeUIElement(this.educationButton);
        if (this.inflationProgressLabel) uiManager.removeUIElement(this.inflationProgressLabel);
        if (this.coloringProgressLabel) uiManager.removeUIElement(this.coloringProgressLabel);

        this.hideEducationPanel();
    }
}
// 匯出到全域作用域
window.PreparationScene = PreparationScene;
