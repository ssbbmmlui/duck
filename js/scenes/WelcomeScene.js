/**
 * 歡迎場景
 * 遊戲的入口場景，包含遊戲介紹和開始按鈕
 */
class WelcomeScene extends Scene {
    constructor(name, gameEngine) {
        super(name, gameEngine);
        
        this.startButton = null;
        this.titleLabel = null;
        this.instructionLabel = null;
        this.soundToggleButton = null;
        this.settingsLabel = null;
        this.instructionsButton = null;
        this.knowledgeButton = null;
        
        // 教學系統狀態
        this.showingInstructions = false;
        this.showingKnowledge = false;
        this.instructionPanel = null;
        this.knowledgePanel = null;
    }

    /**
     * 載入場景資源
     */
    async loadSceneAssets() {
        try {
            const assetManager = this.gameEngine.assetManager;
            
            // 嘗試載入歡迎場景相關資源（可選）
            await Promise.allSettled([
                assetManager.loadImage('assets/images/backgrounds/welcome_bg.png', 'background_welcome'),
                assetManager.loadImage('assets/images/ui/game_logo.png', 'logo'),
                assetManager.loadImage('assets/images/ui/button_start.png', 'button_start')
            ]);
            
            this.backgroundImage = assetManager.getAsset('background_welcome');
            console.log('歡迎場景資源載入完成');
        } catch (error) {
            console.warn('歡迎場景資源載入失敗，使用預設樣式:', error);
            this.backgroundImage = null;
        }
    }

    /**
     * 進入場景時的初始化
     */
    async enter() {
        await super.enter();
        
        // 播放背景音樂
        this.gameEngine.playBackgroundMusic('background_music');
    }

    /**
     * 設置場景
     */
    setupScene() {
        const uiManager = this.gameEngine.uiManager;
        const canvas = this.gameEngine.canvas;
        
        // 創建標題 - 現代化配色
        this.titleLabel = uiManager.createLabel({
            x: canvas.width / 2,
            y: 100,
            text: '北京烤鴨料理遊戲',
            fontSize: 36,
            color: '#1a202c',
            align: 'center'
        });

        // 創建說明文字 - 現代化配色
        this.instructionLabel = uiManager.createLabel({
            x: canvas.width / 2,
            y: 160,
            text: '學習正宗北京烤鴨的製作工藝',
            fontSize: 18,
            color: '#4a5568',
            align: 'center'
        });

        // 創建開始按鈕
        this.startButton = uiManager.createButton({
            x: canvas.width / 2 - 60,
            y: canvas.height / 2 + 50,
            width: 120,
            height: 50,
            text: '開始遊戲',
            onClick: () => this.startGame()
        });
        this.addUIElement(this.startButton);

        // 創建設定標籤 - 現代化配色
        this.settingsLabel = uiManager.createLabel({
            x: canvas.width / 2,
            y: canvas.height / 2 + 120,
            text: '遊戲設定',
            fontSize: 16,
            color: '#2d3748',
            align: 'center'
        });

        // 創建音效開關按鈕
        const soundEnabled = this.gameEngine.gameState.settings.soundEnabled;
        this.soundToggleButton = uiManager.createButton({
            x: canvas.width / 2 - 50,
            y: canvas.height / 2 + 150,
            width: 100,
            height: 40,
            text: soundEnabled ? '音效：開啟' : '音效：關閉',
            onClick: () => this.toggleSound()
        });
        this.addUIElement(this.soundToggleButton);

        // 創建遊戲說明按鈕
        this.instructionsButton = uiManager.createButton({
            x: canvas.width / 2 - 120,
            y: canvas.height / 2 + 200,
            width: 100,
            height: 40,
            text: '遊戲說明',
            onClick: () => this.showInstructions()
        });
        this.addUIElement(this.instructionsButton);

        // 創建知識庫按鈕
        this.knowledgeButton = uiManager.createButton({
            x: canvas.width / 2 + 20,
            y: canvas.height / 2 + 200,
            width: 100,
            height: 40,
            text: '知識庫',
            onClick: () => this.showKnowledge()
        });
        this.addUIElement(this.knowledgeButton);
    }

    /**
     * 開始遊戲
     */
    startGame() {
        console.log('開始遊戲');
        this.gameEngine.playSound('button_click');
        this.transitionToScene('selection');
    }

    /**
     * 切換音效設定
     */
    toggleSound() {
        const currentSettings = this.gameEngine.gameState.settings;
        const newSoundEnabled = !currentSettings.soundEnabled;
        
        // 使用GameEngine的音效設定方法
        this.gameEngine.setSoundEnabled(newSoundEnabled);
        
        // 更新按鈕文字
        this.soundToggleButton.setText(newSoundEnabled ? '音效：開啟' : '音效：關閉');
        
        // 播放確認音效（如果音效已開啟）
        if (newSoundEnabled) {
            this.gameEngine.playSound('button_click');
        }
        
        console.log(`音效設定已${newSoundEnabled ? '開啟' : '關閉'}`);
    }

    /**
     * 顯示遊戲說明
     */
    showInstructions() {
        if (this.showingInstructions) {
            this.hideInstructions();
            return;
        }

        this.showingInstructions = true;
        this.showingKnowledge = false;
        
        if (this.knowledgePanel) {
            this.hideKnowledge();
        }

        const uiManager = this.gameEngine.uiManager;
        const canvas = this.gameEngine.canvas;

        // 創建說明面板背景
        this.instructionPanel = {
            background: uiManager.createLabel({
                x: 50,
                y: 80,
                text: '',
                fontSize: 1,
                color: 'rgba(0, 0, 0, 0.8)'
            }),
            title: uiManager.createLabel({
                x: canvas.width / 2,
                y: 100,
                text: '遊戲操作說明',
                fontSize: 24,
                color: '#FFD700',
                align: 'center'
            }),
            content: uiManager.createLabel({
                x: 80,
                y: 140,
                text: `歡迎來到北京烤鴨料理遊戲！

🎯 遊戲目標：
學習正宗北京烤鴨的完整製作工藝，從選材到享用的全過程。

🎮 操作方式：
• 點擊按鈕進行各種料理動作
• 拖拽物品到指定位置
• 長按進行持續性操作（如充氣）
• 跟隨螢幕提示完成每個步驟

📚 學習內容：
• 北京填鴨的選材標準
• 傳統的處理和製胚技法
• 烤製過程的溫度和時間控制
• 片鴨技藝和傳統吃法

✨ 遊戲特色：
• 簡單直觀的操作方式
• 豐富的文化教育內容
• 即時的操作反饋和指導
• 完整的進度追蹤系統`,
                fontSize: 14,
                color: '#FFFFFF',
                align: 'left'
            }),
            closeButton: uiManager.createButton({
                x: canvas.width / 2 - 40,
                y: canvas.height - 80,
                width: 80,
                height: 35,
                text: '關閉',
                onClick: () => this.hideInstructions()
            })
        };

        // 更新按鈕文字
        this.instructionsButton.setText('關閉說明');

        this.gameEngine.playSound('button_click');
    }

    /**
     * 隱藏遊戲說明
     */
    hideInstructions() {
        if (!this.showingInstructions || !this.instructionPanel) return;

        this.showingInstructions = false;
        const uiManager = this.gameEngine.uiManager;

        // 移除說明面板元素
        Object.values(this.instructionPanel).forEach(element => {
            uiManager.removeUIElement(element);
        });

        this.instructionPanel = null;
        this.instructionsButton.setText('遊戲說明');
    }

    /**
     * 顯示知識庫
     */
    showKnowledge() {
        if (this.showingKnowledge) {
            this.hideKnowledge();
            return;
        }

        this.showingKnowledge = true;
        this.showingInstructions = false;
        
        if (this.instructionPanel) {
            this.hideInstructions();
        }

        const uiManager = this.gameEngine.uiManager;
        const canvas = this.gameEngine.canvas;

        // 創建知識庫面板
        this.knowledgePanel = {
            title: uiManager.createLabel({
                x: canvas.width / 2,
                y: 100,
                text: '北京烤鴨知識庫',
                fontSize: 24,
                color: '#FFD700',
                align: 'center'
            }),
            content: uiManager.createLabel({
                x: 80,
                y: 140,
                text: `🦆 關於北京烤鴨：
北京烤鴨是中國著名的傳統菜餚，有著600多年的歷史。
以其酥脆的皮、嫩滑的肉和獨特的風味聞名於世。

📖 歷史淵源：
• 起源於南北朝時期
• 明朝時期在宮廷中發展完善
• 清朝時期傳入民間，形成不同流派

🏪 著名老字號：
• 全聚德：掛爐烤鴨的代表
• 便宜坊：燜爐烤鴨的傳承者

🥢 傳統吃法：
• 荷葉餅包裹鴨皮鴨肉
• 搭配蔥絲、黃瓜條
• 蘸甜麵醬享用

🎯 製作要點：
• 選用優質北京填鴨
• 嚴格控制烤製溫度和時間
• 掌握片鴨的刀工技巧`,
                fontSize: 14,
                color: '#FFFFFF',
                align: 'left'
            }),
            closeButton: uiManager.createButton({
                x: canvas.width / 2 - 40,
                y: canvas.height - 80,
                width: 80,
                height: 35,
                text: '關閉',
                onClick: () => this.hideKnowledge()
            })
        };

        // 更新按鈕文字
        this.knowledgeButton.setText('關閉知識庫');

        this.gameEngine.playSound('button_click');
    }

    /**
     * 隱藏知識庫
     */
    hideKnowledge() {
        if (!this.showingKnowledge || !this.knowledgePanel) return;

        this.showingKnowledge = false;
        const uiManager = this.gameEngine.uiManager;

        // 移除知識庫面板元素
        Object.values(this.knowledgePanel).forEach(element => {
            uiManager.removeUIElement(element);
        });

        this.knowledgePanel = null;
        this.knowledgeButton.setText('知識庫');
    }

    /**
     * 渲染場景特定內容
     */
    renderScene(context) {
        // 如果沒有背景圖片，渲染預設背景
        if (!this.backgroundImage) {
            // 創建漸層背景
            const gradient = context.createLinearGradient(0, 0, 0, context.canvas.height);
            gradient.addColorStop(0, '#FFF8DC');
            gradient.addColorStop(1, '#F5DEB3');
            context.fillStyle = gradient;
            context.fillRect(0, 0, context.canvas.width, context.canvas.height);
            
            // 添加裝飾邊框
            context.strokeStyle = '#654321';
            context.lineWidth = 4;
            context.strokeRect(10, 10, context.canvas.width - 20, context.canvas.height - 20);
        }
        
        // 渲染遊戲標誌（如果有的話）
        const logo = this.gameEngine.assetManager.getAsset('logo');
        if (logo && logo.width) {
            const logoSize = 150; // 1:1 ratio
            const logoX = (context.canvas.width - logoSize) / 2;
            const logoY = 150;
            context.drawImage(logo, logoX, logoY, logoSize, logoSize);
        } else {
            // 如果沒有標誌圖片，渲染文字標誌
            context.fillStyle = '#8B4513';
            context.font = 'bold 28px Microsoft JhengHei, sans-serif';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText('🦆', context.canvas.width / 2, 180);
        }

        // 渲染說明面板背景
        if (this.showingInstructions) {
            context.fillStyle = 'rgba(0, 0, 0, 0.8)';
            context.fillRect(40, 90, context.canvas.width - 80, context.canvas.height - 160);
            
            context.strokeStyle = '#FFD700';
            context.lineWidth = 2;
            context.strokeRect(40, 90, context.canvas.width - 80, context.canvas.height - 160);
        }

        // 渲染知識庫面板背景
        if (this.showingKnowledge) {
            context.fillStyle = 'rgba(0, 0, 0, 0.8)';
            context.fillRect(40, 90, context.canvas.width - 80, context.canvas.height - 160);
            
            context.strokeStyle = '#FFD700';
            context.lineWidth = 2;
            context.strokeRect(40, 90, context.canvas.width - 80, context.canvas.height - 160);
        }
    }

    /**
     * 清理場景
     */
    cleanup() {
        super.cleanup();
        
        const uiManager = this.gameEngine.uiManager;
        if (this.startButton) uiManager.removeUIElement(this.startButton);
        if (this.titleLabel) uiManager.removeUIElement(this.titleLabel);
        if (this.instructionLabel) uiManager.removeUIElement(this.instructionLabel);
        if (this.soundToggleButton) uiManager.removeUIElement(this.soundToggleButton);
        if (this.settingsLabel) uiManager.removeUIElement(this.settingsLabel);
        if (this.instructionsButton) uiManager.removeUIElement(this.instructionsButton);
        if (this.knowledgeButton) uiManager.removeUIElement(this.knowledgeButton);
        
        // 清理面板
        this.hideInstructions();
        this.hideKnowledge();
    }
}
// 匯出到全域作用域
window.WelcomeScene = WelcomeScene;
