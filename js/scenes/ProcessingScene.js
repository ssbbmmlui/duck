/**
 * 處理場景
 * 鴨子處理階段的場景，包含褪毛、開口、清洗等步驟
 */
class ProcessingScene extends Scene {
    constructor(name, gameEngine) {
        super(name, gameEngine);
        
        // 場景UI元素
        this.titleLabel = null;
        this.instructionLabel = null;
        this.educationPanel = null;
        this.nextButton = null;
        this.backButton = null;
        this.stepIndicator = null;
        
        // 處理步驟管理
        this.processingSteps = [
            {
                id: 'feather_removal',
                name: '褪毛',
                description: '仔細移除鴨子身上的羽毛',
                miniGameClass: 'FeatherRemovalGame',
                completed: false,
                educationContent: {
                    title: '褪毛技巧與要點',
                    content: `🪶 褪毛是處理鴨子的第一步：

🔥 燙毛準備：
• 水溫：60-70°C為最佳溫度
• 時間：浸燙2-3分鐘
• 方法：順著羽毛生長方向燙毛

✋ 褪毛技巧：
• 從頸部開始，逐步向下
• 順著羽毛生長方向拔除
• 保持皮膚完整，避免破損
• 細小絨毛需特別仔細處理

🎯 品質標準：
• 皮膚光滑無羽毛殘留
• 表面無破損或劃傷
• 顏色均勻，呈淡黃色
• 手感光滑有彈性

💡 專業提醒：
• 動作要輕柔但堅決
• 遇到頑固羽毛可重新燙毛
• 保持工作環境清潔衛生`
                }
            },
            {
                id: 'opening_cleaning',
                name: '開口清洗',
                description: '精確開口並徹底清洗內腔',
                miniGameClass: 'OpeningCleaningGame',
                completed: false,
                educationContent: {
                    title: '開口與清洗標準',
                    content: `🔪 開口技術要點：

📏 開口位置：
• 從肛門向上開口約8-10公分
• 切口要直且整齊
• 避免切破內臟

🧽 清洗步驟：
• 取出內臟要完整乾淨
• 用清水沖洗內腔
• 檢查是否有血塊殘留
• 確保腔內乾淨無異味

🏥 衛生要求：
• 使用乾淨的刀具和砧板
• 清洗過程保持水流充足
• 內腔清洗要徹底
• 外表也要清洗乾淨

✅ 完成標準：
• 開口整齊，大小適中
• 內腔乾淨無殘留
• 外表清潔無血污
• 準備進入下一步驟`
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
        
        // 鴨子展示系統
        this.duckDisplay = {
            x: 300,
            y: 180,
            width: 200,
            height: 150,
            duckImage: null,
            processingState: 'raw' // raw, feathers_removed, opened_cleaned
        };
    }

    /**
     * 載入場景資源
     */
    async loadSceneAssets() {
        const assetManager = this.gameEngine.assetManager;
        
        // 載入背景和處理相關圖片
        await assetManager.loadImage('assets/images/backgrounds/processing_bg.png', 'background_processing');
        await assetManager.loadImage('assets/images/duck/raw_duck.png', 'duck_raw');
        await assetManager.loadImage('assets/images/duck/processing_duck.png', 'processing_duck');
        await assetManager.loadImage('assets/images/duck/duck_no_feathers.png', 'duck_no_feathers');
        await assetManager.loadImage('assets/images/duck/duck_opened.png', 'duck_opened');
        await assetManager.loadImage('assets/images/tools/feather_pluck.png', 'feather_pluck_tool');
        await assetManager.loadImage('assets/images/tools/knife.png', 'knife_tool');
        await assetManager.loadImage('assets/images/tools/water.png', 'water_tool');

        this.backgroundImage = assetManager.getAsset('background_processing');
        this.duckDisplay.duckImage = assetManager.getAsset('processing_duck');
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
            y: 50,
            text: '處理階段 - 鴨子初步處理',
            fontSize: 24,
            color: '#8B4513',
            align: 'center'
        });

        // 創建說明文字
        this.instructionLabel = uiManager.createLabel({
            x: canvas.width / 2,
            y: 90,
            text: '學習專業的鴨子處理技術',
            fontSize: 16,
            color: '#654321',
            align: 'center'
        });

        // 創建步驟指示器
        this.createStepIndicator();

        // 創建教育內容按鈕
        this.createEducationButton();

        // 創建開始步驟按鈕
        this.nextButton = uiManager.createButton({
            x: canvas.width - 170,
            y: canvas.height - 80,
            width: 120,
            height: 50,
            text: '開始褪毛',
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

        console.log('處理場景設置完成');
    }

    /**
     * 創建步驟指示器
     */
    createStepIndicator() {
        const uiManager = this.gameEngine.uiManager;
        
        this.stepIndicator = uiManager.createLabel({
            x: 50,
            y: 130,
            text: this.getStepIndicatorText(),
            fontSize: 14,
            color: '#8B4513',
            align: 'left'
        });
    }

    /**
     * 獲取步驟指示器文字
     */
    getStepIndicatorText() {
        let text = '處理步驟進度：\n';
        
        this.processingSteps.forEach((step, index) => {
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
            y: 250,
            width: 120,
            height: 40,
            text: '學習技巧',
            onClick: () => this.showCurrentStepEducation()
        });
        this.addUIElement(educationButton);
        
        this.addUIElement(educationButton);
    }

    /**
     * 顯示當前步驟的教育內容
     */
    showCurrentStepEducation() {
        if (this.currentStepIndex >= this.processingSteps.length) return;
        
        const currentStep = this.processingSteps[this.currentStepIndex];
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
        if (this.currentStepIndex >= this.processingSteps.length) {
            this.proceedToNextScene();
            return;
        }

        const currentStep = this.processingSteps[this.currentStepIndex];
        console.log(`開始步驟: ${currentStep.name}`);
        
        this.hideEducationPanel();
        this.hideSceneUI();
        
        // 根據步驟啟動對應的迷你遊戲
        if (currentStep.id === 'feather_removal') {
            this.startFeatherRemovalGame();
        } else if (currentStep.id === 'opening_cleaning') {
            this.startOpeningCleaningGame();
        }
    }

    /**
     * 開始褪毛迷你遊戲
     */
    startFeatherRemovalGame() {
        console.log('啟動褪毛迷你遊戲');
        
        // 開始褪毛迷你遊戲
        this.startMiniGame(FeatherRemovalGame, {
            gameEngine: this.gameEngine,
            scene: this,
            gameAreaX: 100,
            gameAreaY: 150,
            gameAreaWidth: 600,
            gameAreaHeight: 300
        });
    }

    /**
     * 開始開口清洗迷你遊戲
     */
    startOpeningCleaningGame() {
        console.log('啟動開口清洗迷你遊戲');
        
        // 開始開口清洗迷你遊戲
        this.startMiniGame(OpeningCleaningGame, {
            gameEngine: this.gameEngine,
            scene: this,
            gameAreaX: 100,
            gameAreaY: 150,
            gameAreaWidth: 600,
            gameAreaHeight: 300
        });
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
            // 根據遊戲名稱確定步驟ID
            let stepId = '';
            if (gameName === '褪毛遊戲') {
                stepId = 'feather_removal';
            } else if (gameName === '開口清洗遊戲') {
                stepId = 'opening_cleaning';
            }
            
            if (stepId) {
                this.onStepComplete(stepId, success, stats);
            }
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
            const step = this.processingSteps.find(s => s.id === stepId);
            if (step) {
                step.completed = true;
                
                // 更新鴨子顯示狀態
                this.updateDuckDisplayState(stepId);
                
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
     * 更新鴨子顯示狀態
     */
    updateDuckDisplayState(completedStepId) {
        const assetManager = this.gameEngine.assetManager;
        
        if (completedStepId === 'feather_removal') {
            this.duckDisplay.processingState = 'feathers_removed';
            this.duckDisplay.duckImage = assetManager.getAsset('duck_no_feathers');
        } else if (completedStepId === 'opening_cleaning') {
            this.duckDisplay.processingState = 'opened_cleaned';
            this.duckDisplay.duckImage = assetManager.getAsset('duck_opened');
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
        if (this.currentStepIndex >= this.processingSteps.length) {
            // 所有步驟完成
            this.sceneProgress.allStepsCompleted = true;
            this.sceneProgress.readyForNextScene = true;
            
            this.nextButton.setText('進入製胚階段');
            this.nextButton.onClick = () => this.proceedToNextScene();
            
            // 標記處理階段完成
            this.gameEngine.updateGameState({
                progress: {
                    ...this.gameEngine.gameState.progress,
                    processing: true
                }
            });
        } else {
            // 準備下一步驟
            const nextStep = this.processingSteps[this.currentStepIndex];
            this.nextButton.setText(`開始${nextStep.name}`);
        }
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
            text: `${stepName}完成！\n獲得分數: ${score}`,
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
            text: '請再試一次，注意操作技巧',
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
        this.transitionToScene('selection');
    }

    /**
     * 進入下一個場景
     */
    proceedToNextScene() {
        console.log('處理階段完成，進入製胚階段');
        this.transitionToScene('preparation');
    }

    /**
     * 渲染場景特定內容
     */
    renderScene(context) {
        // 渲染鴨子展示區域
        this.renderDuckDisplay(context);
        
        // 渲染處理工具
        this.renderProcessingTools(context);
        
        // 渲染教育面板背景
        if (this.showingEducation) {
            this.renderEducationPanelBackground(context);
        }
    }

    /**
     * 渲染鴨子展示系統
     */
    renderDuckDisplay(context) {
        const display = this.duckDisplay;
        
        // 繪製展示區域背景
        context.fillStyle = 'rgba(255, 255, 255, 0.9)';
        context.fillRect(display.x - 10, display.y - 10, display.width + 20, display.height + 20);
        
        context.strokeStyle = '#8B4513';
        context.lineWidth = 2;
        context.strokeRect(display.x - 10, display.y - 10, display.width + 20, display.height + 20);
        
        // 繪製鴨子圖片
        if (display.duckImage) {
            context.drawImage(display.duckImage, display.x, display.y, display.width, display.height);
        } else {
            // 如果圖片未載入，顯示佔位符
            context.fillStyle = '#F0F0F0';
            context.fillRect(display.x, display.y, display.width, display.height);
            
            context.fillStyle = '#666666';
            context.font = '16px Microsoft JhengHei';
            context.textAlign = 'center';
            context.fillText('處理中的鴨子', display.x + display.width / 2, display.y + display.height / 2);
        }
        
        // 繪製處理狀態標籤
        context.fillStyle = '#8B4513';
        context.font = 'bold 16px Microsoft JhengHei';
        context.textAlign = 'center';
        
        let statusText = '原始狀態';
        if (display.processingState === 'feathers_removed') {
            statusText = '已褪毛';
        } else if (display.processingState === 'opened_cleaned') {
            statusText = '已開口清洗';
        }
        
        context.fillText(`鴨子狀態: ${statusText}`, display.x + display.width / 2, display.y - 20);
    }

    /**
     * 渲染處理工具
     */
    renderProcessingTools(context) {
        // 根據當前步驟顯示相應工具
        if (this.currentStepIndex < this.processingSteps.length) {
            const currentStep = this.processingSteps[this.currentStepIndex];
            
            // 工具展示區域
            const toolX = 550;
            const toolY = 200;
            
            context.fillStyle = 'rgba(200, 200, 200, 0.8)';
            context.fillRect(toolX, toolY, 100, 100);
            
            context.strokeStyle = '#666666';
            context.lineWidth = 1;
            context.strokeRect(toolX, toolY, 100, 100);
            
            // 顯示工具名稱
            context.fillStyle = '#333333';
            context.font = '14px Microsoft JhengHei';
            context.textAlign = 'center';
            
            if (currentStep.id === 'feather_removal') {
                context.fillText('褪毛工具', toolX + 50, toolY - 10);

                // 顯示褪毛工具圖片
                const featherTool = this.gameEngine.assetManager.getAsset('feather_pluck_tool');
                if (featherTool) {
                    const imgSize = 60;
                    context.drawImage(featherTool, toolX + 20, toolY + 20, imgSize, imgSize);
                } else {
                    context.fillText('🪶', toolX + 50, toolY + 55);
                }
            } else if (currentStep.id === 'opening_cleaning') {
                context.fillText('開口清洗', toolX + 50, toolY - 10);
                context.fillText('🔪💧', toolX + 50, toolY + 55);
            }
        }
    }

    /**
     * 渲染教育面板背景
     */
    renderEducationPanelBackground(context) {
        // 繪製半透明背景
        context.fillStyle = 'rgba(0, 0, 0, 0.8)';
        context.fillRect(40, 110, context.canvas.width - 80, context.canvas.height - 180);
        
        // 繪製邊框
        context.strokeStyle = '#FFD700';
        context.lineWidth = 2;
        context.strokeRect(40, 110, context.canvas.width - 80, context.canvas.height - 180);
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
        
        this.hideEducationPanel();
    }
}
// 匯出到全域作用域
window.ProcessingScene = ProcessingScene;
