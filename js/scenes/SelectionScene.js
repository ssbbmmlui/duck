/**
 * 選材場景
 * 選擇優質北京填鴨的場景
 */
class SelectionScene extends Scene {
    constructor(name, gameEngine) {
        super(name, gameEngine);
        
        // 場景UI元素
        this.titleLabel = null;
        this.instructionLabel = null;
        this.educationPanel = null;
        this.nextButton = null;
        this.backButton = null;
        
        // 北京填鴨展示系統
        this.duckDisplay = {
            x: 300,
            y: 200,
            width: 200,
            height: 150,
            duckImage: null,
            highlightAreas: []
        };
        
        // 教育內容狀態
        this.showingEducation = false;
        this.educationContent = {
            title: '北京填鴨選材標準',
            content: `🦆 優質北京填鴨的特徵：

📏 體型標準：
• 體重：2.5-3.5公斤為佳
• 體型：胸部豐滿，腹部不過於肥大
• 比例：頭小頸短，身體勻稱

🎨 外觀特徵：
• 皮膚：淡黃色，光滑有彈性
• 羽毛：白色，乾淨整潔
• 眼睛：明亮有神，無分泌物

🏥 健康指標：
• 肌肉：結實有彈性
• 脂肪：分佈均勻，不過厚
• 氣味：新鮮，無異味

💡 選材小貼士：
• 選擇45-60天齡的填鴨
• 確保來源可靠，檢疫合格
• 宰殺後應儘快處理`
        };
        
        // 場景進度
        this.sceneProgress = {
            educationViewed: false,
            readyForMiniGames: false
        };
    }

    /**
     * 載入場景資源
     */
    async loadSceneAssets() {
        const assetManager = this.gameEngine.assetManager;
        
        // 載入背景和鴨子相關圖片
        await assetManager.loadImage('assets/images/backgrounds/selection_bg.png', 'background_selection');
        await assetManager.loadImage('assets/images/duck/raw_duck.png', 'raw_duck');
        await assetManager.loadImage('assets/images/duck/duck_highlight.png', 'duck_highlight');
        await assetManager.loadImage('assets/images/ui/info_icon.png', 'info_icon');
        
        this.backgroundImage = assetManager.getAsset('background_selection');
        this.duckDisplay.duckImage = assetManager.getAsset('raw_duck');
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
            text: '選材階段 - 挑選優質北京填鴨',
            fontSize: 24,
            color: '#8B4513',
            align: 'center'
        });

        // 創建說明文字
        this.instructionLabel = uiManager.createLabel({
            x: canvas.width / 2,
            y: 90,
            text: '學習如何選擇最適合製作烤鴨的北京填鴨',
            fontSize: 16,
            color: '#654321',
            align: 'center'
        });

        // 創建教育內容按鈕 - 放置在卡片左上角
        const educationButton = uiManager.createButton({
            x: 90,
            y: 120,
            width: 100,
            height: 35,
            text: '選材知識',
            onClick: () => this.toggleEducationPanel()
        });
        this.addUIElement(educationButton);

        // 創建開始迷你遊戲按鈕
        this.nextButton = uiManager.createButton({
            x: canvas.width - 170,
            y: canvas.height - 80,
            width: 120,
            height: 50,
            text: '開始檢查',
            onClick: () => this.startMiniGames()
        });
        this.nextButton.setEnabled(false);
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

        // 設置鴨子展示區域的高亮點
        this.setupDuckHighlights();
        
        console.log('選材場景設置完成');
    }

    /**
     * 設置鴨子高亮區域
     */
    setupDuckHighlights() {
        this.duckDisplay.highlightAreas = [
            {
                name: '頭部',
                x: this.duckDisplay.x + 47,
                y: this.duckDisplay.y + 10,
                width: 45,
                height: 35,
                info: '頭部應該小巧，眼睛明亮'
            },
            {
                name: '胸部',
                x: this.duckDisplay.x + 35,
                y: this.duckDisplay.y + 60,
                width: 40,
                height: 23,
                info: '胸部應該豐滿，肌肉結實'
            },
            {
                name: '腹部',
                x: this.duckDisplay.x + 40,
                y: this.duckDisplay.y + 95,
                width: 75,
                height: 18,
                info: '腹部不應過於肥大'
            }
        ];
    }

    /**
     * 切換教育面板顯示
     */
    toggleEducationPanel() {
        if (this.showingEducation) {
            this.hideEducationPanel();
        } else {
            this.showEducationPanel();
        }
    }

    /**
     * 顯示教育面板
     */
    showEducationPanel() {
        this.showingEducation = true;
        const uiManager = this.gameEngine.uiManager;
        const canvas = this.gameEngine.canvas;

        // 分割內容為多行
        const contentLines = [
            '🦆 優質北京填鴨的特徵：',
            '',
            '📏 體型標準：',
            '  • 體重：2.5-3.5公斤為佳',
            '  • 體型：胸部豐滿，腹部不過於肥大',
            '  • 比例：頭小頸短，身體勻稱',
            '',
            '🎨 外觀特徵：',
            '  • 皮膚：淡黃色，光滑有彈性',
            '  • 羽毛：白色，乾淨整潔',
            '  • 眼睛：明亮有神，無分泌物',
            '',
            '🏥 健康指標：',
            '  • 肌肉：結實有彈性',
            '  • 脂肪：分佈均勻，不過厚',
            '  • 氣味：新鮮，無異味',
            '',
            '💡 選材小貼士：',
            '  • 選擇45-60天齡的填鴨',
            '  • 確保來源可靠，檢疫合格',
            '  • 宰殺後應儘快處理'
        ];

        // 創建教育面板
        this.educationPanel = {
            title: uiManager.createLabel({
                x: canvas.width / 2,
                y: 70,
                text: this.educationContent.title,
                fontSize: 18,
                color: '#FFD700',
                align: 'center'
            }),
            contentLabels: [],
            closeButton: uiManager.createButton({
                x: canvas.width / 2 - 40,
                y: canvas.height - 80,
                width: 80,
                height: 35,
                text: '關閉',
                onClick: () => this.hideEducationPanel()
            })
        };

        // 創建每一行內容
        const startY = 110;
        const lineHeight = 22;
        contentLines.forEach((line, index) => {
            const label = uiManager.createLabel({
                x: 100,
                y: startY + (index * lineHeight),
                text: line,
                fontSize: 15,
                color: '#FFFFFF',
                align: 'left'
            });
            this.educationPanel.contentLabels.push(label);
        });

        this.addUIElement(this.educationPanel.closeButton);

        // 標記教育內容已查看
        this.sceneProgress.educationViewed = true;
        this.updateSceneProgress();

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

        // 移除標題
        if (this.educationPanel.title) {
            uiManager.removeUIElement(this.educationPanel.title);
            this.removeUIElement(this.educationPanel.title);
        }

        // 移除所有內容標籤
        if (this.educationPanel.contentLabels) {
            this.educationPanel.contentLabels.forEach(label => {
                uiManager.removeUIElement(label);
                this.removeUIElement(label);
            });
        }

        // 移除關閉按鈕
        if (this.educationPanel.closeButton) {
            uiManager.removeUIElement(this.educationPanel.closeButton);
            this.removeUIElement(this.educationPanel.closeButton);
        }

        this.educationPanel = null;
    }

    /**
     * 更新場景進度
     */
    updateSceneProgress() {
        // 檢查是否可以開始迷你遊戲
        if (this.sceneProgress.educationViewed) {
            this.sceneProgress.readyForMiniGames = true;
            this.nextButton.setEnabled(true);
            this.nextButton.setText('開始品質檢查');
        }
    }

    /**
     * 開始迷你遊戲
     */
    startMiniGames() {
        if (!this.sceneProgress.readyForMiniGames) {
            console.log('請先查看選材知識');
            return;
        }

        console.log('開始鴨子品質檢查迷你遊戲');
        this.hideEducationPanel();
        
        // 隱藏場景UI元素
        this.hideSceneUI();
        
        // 開始品質檢查迷你遊戲
        this.startMiniGame(DuckQualityGame, {
            gameEngine: this.gameEngine,
            scene: this,
            gameAreaX: 100,
            gameAreaY: 150,
            gameAreaWidth: 600,
            gameAreaHeight: 300
        });
    }

    /**
     * 返回上一個場景
     */
    goBack() {
        this.transitionToScene('welcome');
    }

    /**
     * 渲染場景特定內容
     */
    renderScene(context) {
        // 渲染鴨子展示區域
        this.renderDuckDisplay(context);
        
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
            context.fillText('北京填鴨', display.x + display.width / 2, display.y + display.height / 2);
        }
        
        // 繪製高亮區域（如果不在教育模式）
        if (!this.showingEducation) {
            this.renderHighlightAreas(context);
        }
        
        // 繪製展示標籤
        context.fillStyle = '#8B4513';
        context.font = 'bold 16px Microsoft JhengHei';
        context.textAlign = 'center';
        context.fillText('優質北京填鴨展示', display.x + display.width / 2, display.y - 20);
    }

    /**
     * 渲染高亮區域
     */
    renderHighlightAreas(context) {
        this.duckDisplay.highlightAreas.forEach(area => {
            // 繪製半透明高亮框
            context.strokeStyle = '#FFD700';
            context.lineWidth = 2;
            context.setLineDash([5, 5]);
            context.strokeRect(area.x, area.y, area.width, area.height);
            context.setLineDash([]);
            
            // 繪製標籤
            context.fillStyle = 'rgba(255, 215, 0, 0.8)';
            context.fillRect(area.x, area.y - 20, area.width, 18);
            
            context.fillStyle = '#8B4513';
            context.font = '12px Microsoft JhengHei';
            context.textAlign = 'center';
            context.fillText(area.name, area.x + area.width / 2, area.y - 6);
        });
    }

    /**
     * 渲染教育面板背景
     */
    renderEducationPanelBackground(context) {
        // 繪製半透明背景
        context.fillStyle = 'rgba(0, 0, 0, 0.85)';
        context.fillRect(40, 50, context.canvas.width - 80, context.canvas.height - 130);

        // 繪製邊框
        context.strokeStyle = '#FFD700';
        context.lineWidth = 2;
        context.strokeRect(40, 50, context.canvas.width - 80, context.canvas.height - 130);
    }

    /**
     * 處理場景特定輸入
     */
    handleSceneInput(event) {
        if (event.type === 'click' && !this.showingEducation) {
            // 檢查是否點擊了高亮區域
            for (let area of this.duckDisplay.highlightAreas) {
                if (event.x >= area.x && event.x <= area.x + area.width &&
                    event.y >= area.y && event.y <= area.y + area.height) {
                    
                    this.showAreaInfo(area);
                    return;
                }
            }
        }
    }

    /**
     * 顯示區域資訊
     */
    showAreaInfo(area) {
        const uiManager = this.gameEngine.uiManager;
        
        // 創建臨時資訊標籤
        const infoLabel = uiManager.createLabel({
            x: area.x + area.width + 10,
            y: area.y,
            text: area.info,
            fontSize: 14,
            color: '#FFD700',
            align: 'left'
        });
        
        // 3秒後移除
        setTimeout(() => {
            uiManager.removeUIElement(infoLabel);
        }, 3000);
        
        if (this.gameEngine.gameState.settings.soundEnabled) {
            this.gameEngine.audioManager.playSound('info_sound');
        }
    }

    /**
     * 隱藏場景UI元素
     */
    hideSceneUI() {
        if (this.titleLabel) this.titleLabel.setVisible(false);
        if (this.instructionLabel) this.instructionLabel.setVisible(false);
        if (this.nextButton) this.nextButton.setVisible(false);
        if (this.backButton) this.backButton.setVisible(false);
    }

    /**
     * 顯示場景UI元素
     */
    showSceneUI() {
        if (this.titleLabel) this.titleLabel.setVisible(true);
        if (this.instructionLabel) this.instructionLabel.setVisible(true);
        if (this.nextButton) this.nextButton.setVisible(true);
        if (this.backButton) this.backButton.setVisible(true);
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
            const uiManager = this.gameEngine.uiManager;
            const canvas = this.gameEngine.canvas;
            
            if (gameName === '鴨子品質檢查') {
                // 品質檢查完成
                this.gameEngine.progressManager.completeStep('duck_quality_check');

                // 更新按鈕，準備重量測量
                this.nextButton.setText('重量測量');
                this.nextButton.onClick = () => this.startWeightGame();

                // 顯示可關閉的成功消息
                uiManager.createDismissibleMessage({
                    text: `品質檢查完成！\n獲得分數: ${stats.score}`,
                    x: canvas.width / 2,
                    y: canvas.height / 2 - 50,
                    fontSize: 18,
                    color: '#32CD32',
                    autoDismissTime: 5000
                });
                
            } else if (gameName === '重量測量') {
                // 重量測量完成
                this.gameEngine.progressManager.completeStep('duck_weight_measurement');

                // 選材階段完成，準備進入下一個場景
                this.nextButton.setText('進入處理階段');
                this.nextButton.onClick = () => this.proceedToNextScene();

                // 顯示可關閉的成功消息
                uiManager.createDismissibleMessage({
                    text: `重量測量完成！\n獲得分數: ${stats.score}\n\n選材階段全部完成！`,
                    x: canvas.width / 2,
                    y: canvas.height / 2 - 50,
                    fontSize: 18,
                    color: '#32CD32',
                    autoDismissTime: 5000
                });
                
                // 標記選材階段完成
                this.gameEngine.updateGameState({
                    progress: {
                        ...this.gameEngine.gameState.progress,
                        selection: true
                    }
                });
            }
        } else {
            // 失敗時重置按鈕
            if (gameName === '鴨子品質檢查') {
                this.nextButton.setText('重新檢查');
                this.nextButton.onClick = () => this.startMiniGames();
            } else if (gameName === '重量測量') {
                this.nextButton.setText('重新測量');
                this.nextButton.onClick = () => this.startWeightGame();
            }
        }
        
        this.currentMiniGame = null;
    }

    /**
     * 進入下一個場景
     */
    proceedToNextScene() {
        console.log('選材階段完成，進入處理階段');
        this.transitionToScene('processing');
    }

    /**
     * 開始重量測量遊戲
     */
    startWeightGame() {
        console.log('開始重量測量迷你遊戲');
        
        // 隱藏場景UI元素
        this.hideSceneUI();
        
        // 開始重量測量迷你遊戲
        this.startMiniGame(WeightMeasurementGame, {
            gameEngine: this.gameEngine,
            scene: this,
            gameAreaX: 100,
            gameAreaY: 150,
            gameAreaWidth: 600,
            gameAreaHeight: 300
        });
    }

    /**
     * 清理場景
     */
    cleanup() {
        super.cleanup();
        
        const uiManager = this.gameEngine.uiManager;
        if (this.titleLabel) uiManager.removeUIElement(this.titleLabel);
        if (this.instructionLabel) uiManager.removeUIElement(this.instructionLabel);
        if (this.nextButton) uiManager.removeUIElement(this.nextButton);
        if (this.backButton) uiManager.removeUIElement(this.backButton);
        
        this.hideEducationPanel();
    }
}
// 匯出到全域作用域
window.SelectionScene = SelectionScene;
