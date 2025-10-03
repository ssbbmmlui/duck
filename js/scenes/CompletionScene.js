/**
 * 完成場景
 * 遊戲結束時的成果展示、分數統計和學習總結
 */
class CompletionScene extends Scene {
    constructor(name, gameEngine) {
        super(name, gameEngine);
        
        // 場景UI元素
        this.titleLabel = null;
        this.congratulationLabel = null;
        this.scoreDisplay = null;
        this.achievementsList = null;
        this.knowledgeSummary = null;
        this.restartButton = null;
        this.mainMenuButton = null;
        this.shareButton = null;
        
        // 成果展示相關
        this.finalDuckImage = null;
        this.scoreBreakdown = null;
        this.completionStats = null;
        this.newAchievements = [];
        
        // 動畫和效果
        this.celebrationAnimation = null;
        this.scoreCountAnimation = null;
        this.showingKnowledgeReview = false;
        this.knowledgePanel = null;
        
        // 分數統計
        this.finalScore = 0;
        this.scoreDetails = {
            selection: 0,
            processing: 0,
            preparation: 0,
            drying: 0,
            roasting: 0,
            slicing: 0,
            bonus: 0
        };
    }

    /**
     * 載入場景資源
     */
    async loadSceneAssets() {
        const assetManager = this.gameEngine.assetManager;
        
        // 載入完成場景相關資源
        await assetManager.loadImage('assets/images/backgrounds/completion_bg.png', 'background_completion');
        await assetManager.loadImage('assets/images/final_duck/complete_duck.png', 'final_duck');
        await assetManager.loadImage('assets/images/ui/trophy.png', 'trophy');
        await assetManager.loadImage('assets/images/ui/star_gold.png', 'star_gold');
        await assetManager.loadImage('assets/images/ui/celebration.png', 'celebration');
        
        this.backgroundImage = assetManager.getAsset('background_completion');
        this.finalDuckImage = assetManager.getAsset('final_duck');
    }

    /**
     * 設置場景
     */
    setupScene() {
        const uiManager = this.gameEngine.uiManager;
        const canvas = this.gameEngine.canvas;
        const progressManager = this.gameEngine.progressManager;
        
        // 計算最終分數和統計
        this.calculateFinalScore();
        
        // 檢查新成就
        this.newAchievements = progressManager.checkAchievements();
        
        // 創建標題
        this.titleLabel = uiManager.createLabel({
            x: canvas.width / 2,
            y: 60,
            text: '🎉 恭喜完成北京烤鴨製作！',
            fontSize: 28,
            color: '#FFD700',
            align: 'center'
        });

        // 創建祝賀文字
        this.congratulationLabel = uiManager.createLabel({
            x: canvas.width / 2,
            y: 100,
            text: '您已成功掌握了正宗北京烤鴨的製作工藝',
            fontSize: 16,
            color: '#8B4513',
            align: 'center'
        });

        // 創建分數顯示
        this.scoreDisplay = uiManager.createLabel({
            x: canvas.width / 2,
            y: 200,
            text: `最終分數：${this.finalScore}`,
            fontSize: 24,
            color: '#FF6B35',
            align: 'center'
        });

        // 創建分數詳情按鈕
        this.scoreBreakdownButton = uiManager.createButton({
            x: canvas.width / 2 - 60,
            y: 230,
            width: 120,
            height: 35,
            text: '分數詳情',
            onClick: () => this.showScoreBreakdown()
        });

        // 創建成就顯示
        this.createAchievementDisplay();

        // 創建統計資訊
        this.createStatisticsDisplay();

        // 創建知識回顧按鈕
        this.knowledgeReviewButton = uiManager.createButton({
            x: canvas.width / 2 - 80,
            y: canvas.height - 150,
            width: 160,
            height: 40,
            text: '知識回顧',
            onClick: () => this.showKnowledgeReview()
        });

        // 創建重新開始按鈕
        this.restartButton = uiManager.createButton({
            x: canvas.width / 2 - 180,
            y: canvas.height - 100,
            width: 120,
            height: 45,
            text: '重新遊戲',
            onClick: () => this.restartGame()
        });

        // 創建主選單按鈕
        this.mainMenuButton = uiManager.createButton({
            x: canvas.width / 2 - 50,
            y: canvas.height - 100,
            width: 100,
            height: 45,
            text: '主選單',
            onClick: () => this.returnToMainMenu()
        });

        // 創建分享按鈕
        this.shareButton = uiManager.createButton({
            x: canvas.width / 2 + 60,
            y: canvas.height - 100,
            width: 120,
            height: 45,
            text: '分享成果',
            onClick: () => this.shareResults()
        });

        // 開始慶祝動畫
        this.startCelebrationAnimation();
        
        // 開始分數計數動畫
        this.startScoreCountAnimation();
    }

    /**
     * 計算最終分數
     */
    calculateFinalScore() {
        const progressManager = this.gameEngine.progressManager;
        const currentProgress = progressManager.getCurrentProgress();
        
        this.finalScore = currentProgress.score;
        
        // 計算各階段分數（簡化版本，實際應該從遊戲過程中記錄）
        const completedSteps = currentProgress.completedSteps;
        const baseScore = 100;
        
        // 根據完成的步驟分配分數
        if (completedSteps.includes('selection')) this.scoreDetails.selection = baseScore;
        if (completedSteps.includes('processing')) this.scoreDetails.processing = baseScore;
        if (completedSteps.includes('preparation')) this.scoreDetails.preparation = baseScore * 1.5; // 製胚是關鍵步驟
        if (completedSteps.includes('drying')) this.scoreDetails.drying = baseScore;
        if (completedSteps.includes('roasting')) this.scoreDetails.roasting = baseScore * 1.5; // 烤製是關鍵步驟
        if (completedSteps.includes('slicing')) this.scoreDetails.slicing = baseScore;
        
        // 完成度獎勵
        const completionPercentage = progressManager.getCompletionPercentage();
        if (completionPercentage === 100) {
            this.scoreDetails.bonus = baseScore * 2;
        }
    }

    /**
     * 創建成就顯示
     */
    createAchievementDisplay() {
        const uiManager = this.gameEngine.uiManager;
        const canvas = this.gameEngine.canvas;
        
        if (this.newAchievements.length > 0) {
            // 新成就標題
            this.newAchievementLabel = uiManager.createLabel({
                x: canvas.width / 2,
                y: 280,
                text: '🏆 獲得新成就！',
                fontSize: 18,
                color: '#FFD700',
                align: 'center'
            });

            // 顯示成就列表
            this.newAchievements.forEach((achievement, index) => {
                const achievementLabel = uiManager.createLabel({
                    x: canvas.width / 2,
                    y: 310 + (index * 25),
                    text: `⭐ ${achievement.name}: ${achievement.description}`,
                    fontSize: 14,
                    color: '#FF6B35',
                    align: 'center'
                });
                this.addUIElement(achievementLabel);
            });
        }
    }

    /**
     * 創建統計資訊顯示
     */
    createStatisticsDisplay() {
        const uiManager = this.gameEngine.uiManager;
        const canvas = this.gameEngine.canvas;
        const progressManager = this.gameEngine.progressManager;
        const stats = progressManager.getStatistics();
        
        const yStart = 380 + (this.newAchievements.length * 25);
        
        // 統計標題
        this.statsLabel = uiManager.createLabel({
            x: canvas.width / 2,
            y: yStart,
            text: '📊 遊戲統計',
            fontSize: 16,
            color: '#8B4513',
            align: 'center'
        });

        // 完成次數
        this.gamesCompletedLabel = uiManager.createLabel({
            x: canvas.width / 2,
            y: yStart + 30,
            text: `完成次數：${stats.gamesCompleted}`,
            fontSize: 14,
            color: '#654321',
            align: 'center'
        });

        // 最佳分數
        this.bestScoreLabel = uiManager.createLabel({
            x: canvas.width / 2,
            y: yStart + 50,
            text: `最佳分數：${stats.bestScore}`,
            fontSize: 14,
            color: '#654321',
            align: 'center'
        });

        // 完成度
        const completionPercentage = progressManager.getCompletionPercentage();
        this.completionLabel = uiManager.createLabel({
            x: canvas.width / 2,
            y: yStart + 70,
            text: `完成度：${completionPercentage.toFixed(1)}%`,
            fontSize: 14,
            color: '#654321',
            align: 'center'
        });
    }

    /**
     * 顯示分數詳情
     */
    showScoreBreakdown() {
        if (this.showingScoreBreakdown) {
            this.hideScoreBreakdown();
            return;
        }

        this.showingScoreBreakdown = true;
        const uiManager = this.gameEngine.uiManager;
        const canvas = this.gameEngine.canvas;

        // 創建分數詳情面板
        this.scoreBreakdownPanel = {
            title: uiManager.createLabel({
                x: canvas.width / 2,
                y: 120,
                text: '📋 分數詳細統計',
                fontSize: 20,
                color: '#FFD700',
                align: 'center'
            }),
            selection: uiManager.createLabel({
                x: canvas.width / 2,
                y: 160,
                text: `選材階段：${this.scoreDetails.selection} 分`,
                fontSize: 14,
                color: '#FFFFFF',
                align: 'center'
            }),
            processing: uiManager.createLabel({
                x: canvas.width / 2,
                y: 180,
                text: `處理階段：${this.scoreDetails.processing} 分`,
                fontSize: 14,
                color: '#FFFFFF',
                align: 'center'
            }),
            preparation: uiManager.createLabel({
                x: canvas.width / 2,
                y: 200,
                text: `製胚階段：${this.scoreDetails.preparation} 分`,
                fontSize: 14,
                color: '#FFFFFF',
                align: 'center'
            }),
            drying: uiManager.createLabel({
                x: canvas.width / 2,
                y: 220,
                text: `晾胚階段：${this.scoreDetails.drying} 分`,
                fontSize: 14,
                color: '#FFFFFF',
                align: 'center'
            }),
            roasting: uiManager.createLabel({
                x: canvas.width / 2,
                y: 240,
                text: `烤製階段：${this.scoreDetails.roasting} 分`,
                fontSize: 14,
                color: '#FFFFFF',
                align: 'center'
            }),
            slicing: uiManager.createLabel({
                x: canvas.width / 2,
                y: 260,
                text: `片鴨階段：${this.scoreDetails.slicing} 分`,
                fontSize: 14,
                color: '#FFFFFF',
                align: 'center'
            }),
            bonus: uiManager.createLabel({
                x: canvas.width / 2,
                y: 280,
                text: `完成獎勵：${this.scoreDetails.bonus} 分`,
                fontSize: 14,
                color: '#FFD700',
                align: 'center'
            }),
            closeButton: uiManager.createButton({
                x: canvas.width / 2 - 40,
                y: 320,
                width: 80,
                height: 35,
                text: '關閉',
                onClick: () => this.hideScoreBreakdown()
            })
        };

        // 更新按鈕文字
        this.scoreBreakdownButton.setText('關閉詳情');

        if (this.gameEngine.gameState.settings.soundEnabled) {
            this.gameEngine.audioManager.playSound('button_click');
        }
    }

    /**
     * 隱藏分數詳情
     */
    hideScoreBreakdown() {
        if (!this.showingScoreBreakdown || !this.scoreBreakdownPanel) return;

        this.showingScoreBreakdown = false;
        const uiManager = this.gameEngine.uiManager;

        // 移除分數詳情面板元素
        Object.values(this.scoreBreakdownPanel).forEach(element => {
            uiManager.removeUIElement(element);
        });

        this.scoreBreakdownPanel = null;
        this.scoreBreakdownButton.setText('分數詳情');
    }

    /**
     * 顯示知識回顧
     */
    showKnowledgeReview() {
        if (this.showingKnowledgeReview) {
            this.hideKnowledgeReview();
            return;
        }

        this.showingKnowledgeReview = true;
        const uiManager = this.gameEngine.uiManager;
        const canvas = this.gameEngine.canvas;

        // 創建知識回顧面板
        this.knowledgePanel = {
            title: uiManager.createLabel({
                x: canvas.width / 2,
                y: 100,
                text: '📚 北京烤鴨製作知識總結',
                fontSize: 20,
                color: '#FFD700',
                align: 'center'
            }),
            content: uiManager.createLabel({
                x: 60,
                y: 140,
                text: `🦆 您已經學會了：

🔸 選材技巧：
• 識別優質北京填鴨的特徵
• 掌握重量和外觀的評估標準

🔸 處理工藝：
• 正確的褪毛和清洗方法
• 開口技術和衛生要求

🔸 製胚精髓：
• 充氣技術的壓力控制
• 燙皮和上糖色的時機掌握

🔸 晾胚要點：
• 環境控制的重要性
• 風乾時間的精確把握

🔸 烤製技藝：
• 溫度控制和時間管理
• 翻轉技巧和火候掌握

🔸 片鴨藝術：
• 刀工技法和擺盤美學
• 傳統吃法和文化內涵

🎓 恭喜您成為北京烤鴨製作達人！`,
                fontSize: 12,
                color: '#FFFFFF',
                align: 'left'
            }),
            closeButton: uiManager.createButton({
                x: canvas.width / 2 - 40,
                y: canvas.height - 80,
                width: 80,
                height: 35,
                text: '關閉',
                onClick: () => this.hideKnowledgeReview()
            })
        };

        // 更新按鈕文字
        this.knowledgeReviewButton.setText('關閉回顧');

        if (this.gameEngine.gameState.settings.soundEnabled) {
            this.gameEngine.audioManager.playSound('button_click');
        }
    }

    /**
     * 隱藏知識回顧
     */
    hideKnowledgeReview() {
        if (!this.showingKnowledgeReview || !this.knowledgePanel) return;

        this.showingKnowledgeReview = false;
        const uiManager = this.gameEngine.uiManager;

        // 移除知識回顧面板元素
        Object.values(this.knowledgePanel).forEach(element => {
            uiManager.removeUIElement(element);
        });

        this.knowledgePanel = null;
        this.knowledgeReviewButton.setText('知識回顧');
    }

    /**
     * 開始慶祝動畫
     */
    startCelebrationAnimation() {
        const visualFeedback = this.gameEngine.visualFeedback;
        if (visualFeedback) {
            // 創建多個慶祝效果
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    const x = 200 + Math.random() * 400;
                    const y = 150 + Math.random() * 200;
                    visualFeedback.createCompletionCelebration(x, y);
                    visualFeedback.createStarReward(x, y, 3);
                }, i * 500);
            }
        }
    }

    /**
     * 開始分數計數動畫
     */
    startScoreCountAnimation() {
        let currentScore = 0;
        const targetScore = this.finalScore;
        const increment = Math.max(1, Math.floor(targetScore / 50));
        
        const countInterval = setInterval(() => {
            currentScore += increment;
            if (currentScore >= targetScore) {
                currentScore = targetScore;
                clearInterval(countInterval);
            }
            
            if (this.scoreDisplay) {
                this.scoreDisplay.setText(`最終分數：${currentScore}`);
            }
        }, 50);
    }

    /**
     * 重新開始遊戲
     */
    restartGame() {
        console.log('重新開始遊戲');
        
        if (this.gameEngine.gameState.settings.soundEnabled) {
            this.gameEngine.audioManager.playSound('button_click');
        }
        
        // 使用新的開始新遊戲方法
        const progressManager = this.gameEngine.progressManager;
        const newGameState = progressManager.startNewGame();
        
        // 更新遊戲引擎的狀態
        this.gameEngine.gameState = { ...newGameState };
        
        // 返回歡迎場景
        this.transitionToScene('welcome');
    }

    /**
     * 返回主選單
     */
    returnToMainMenu() {
        console.log('返回主選單');
        
        if (this.gameEngine.gameState.settings.soundEnabled) {
            this.gameEngine.audioManager.playSound('button_click');
        }
        
        this.transitionToScene('welcome');
    }

    /**
     * 分享遊戲結果
     */
    shareResults() {
        console.log('分享遊戲結果');
        
        if (this.gameEngine.gameState.settings.soundEnabled) {
            this.gameEngine.audioManager.playSound('button_click');
        }
        
        // 創建分享內容
        const shareText = `我在北京烤鴨料理遊戲中獲得了 ${this.finalScore} 分！🦆✨\n` +
                         `已經掌握了正宗北京烤鴨的製作工藝！\n` +
                         `#北京烤鴨 #料理遊戲 #中華美食`;
        
        // 嘗試使用Web Share API
        if (navigator.share) {
            navigator.share({
                title: '北京烤鴨料理遊戲成果',
                text: shareText,
                url: window.location.href
            }).catch(err => {
                console.log('分享失敗:', err);
                this.fallbackShare(shareText);
            });
        } else {
            this.fallbackShare(shareText);
        }
    }

    /**
     * 備用分享方法
     */
    fallbackShare(text) {
        // 複製到剪貼簿
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                alert('成果已複製到剪貼簿！');
            }).catch(() => {
                this.showShareDialog(text);
            });
        } else {
            this.showShareDialog(text);
        }
    }

    /**
     * 顯示分享對話框
     */
    showShareDialog(text) {
        const shareDialog = prompt('複製以下內容分享您的成果：', text);
        if (shareDialog !== null) {
            console.log('用戶選擇分享內容');
        }
    }

    /**
     * 渲染場景特定內容
     */
    renderScene(context) {
        // 渲染最終成品圖片
        if (this.finalDuckImage) {
            const imageX = (context.canvas.width - 200) / 2;
            const imageY = 300;
            context.drawImage(this.finalDuckImage, imageX, imageY, 200, 150);
        }

        // 渲染分數詳情面板背景
        if (this.showingScoreBreakdown) {
            context.fillStyle = 'rgba(0, 0, 0, 0.8)';
            context.fillRect(40, 110, context.canvas.width - 80, 230);
            
            context.strokeStyle = '#FFD700';
            context.lineWidth = 2;
            context.strokeRect(40, 110, context.canvas.width - 80, 230);
        }

        // 渲染知識回顧面板背景
        if (this.showingKnowledgeReview) {
            context.fillStyle = 'rgba(0, 0, 0, 0.8)';
            context.fillRect(40, 90, context.canvas.width - 80, context.canvas.height - 160);
            
            context.strokeStyle = '#FFD700';
            context.lineWidth = 2;
            context.strokeRect(40, 90, context.canvas.width - 80, context.canvas.height - 160);
        }

        // 渲染裝飾元素
        this.renderDecorations(context);
    }

    /**
     * 渲染裝飾元素
     */
    renderDecorations(context) {
        // 渲染獎盃圖標
        const trophy = this.gameEngine.assetManager.getAsset('trophy');
        if (trophy) {
            context.drawImage(trophy, 50, 50, 40, 40);
            context.drawImage(trophy, context.canvas.width - 90, 50, 40, 40);
        }

        // 渲染星星裝飾
        const star = this.gameEngine.assetManager.getAsset('star_gold');
        if (star) {
            // 在標題周圍渲染星星
            const positions = [
                {x: 150, y: 60}, {x: context.canvas.width - 150, y: 60},
                {x: 100, y: 100}, {x: context.canvas.width - 100, y: 100}
            ];
            
            positions.forEach(pos => {
                context.drawImage(star, pos.x, pos.y, 25, 25);
            });
        }
    }

    /**
     * 清理場景
     */
    cleanup() {
        super.cleanup();
        
        const uiManager = this.gameEngine.uiManager;
        
        // 清理所有UI元素
        if (this.titleLabel) uiManager.removeUIElement(this.titleLabel);
        if (this.congratulationLabel) uiManager.removeUIElement(this.congratulationLabel);
        if (this.scoreDisplay) uiManager.removeUIElement(this.scoreDisplay);
        if (this.scoreBreakdownButton) uiManager.removeUIElement(this.scoreBreakdownButton);
        if (this.knowledgeReviewButton) uiManager.removeUIElement(this.knowledgeReviewButton);
        if (this.restartButton) uiManager.removeUIElement(this.restartButton);
        if (this.mainMenuButton) uiManager.removeUIElement(this.mainMenuButton);
        if (this.shareButton) uiManager.removeUIElement(this.shareButton);
        
        // 清理面板
        this.hideScoreBreakdown();
        this.hideKnowledgeReview();
        
        // 清理成就和統計顯示
        if (this.newAchievementLabel) uiManager.removeUIElement(this.newAchievementLabel);
        if (this.statsLabel) uiManager.removeUIElement(this.statsLabel);
        if (this.gamesCompletedLabel) uiManager.removeUIElement(this.gamesCompletedLabel);
        if (this.bestScoreLabel) uiManager.removeUIElement(this.bestScoreLabel);
        if (this.completionLabel) uiManager.removeUIElement(this.completionLabel);
    }
}
// 匯出到全域作用域
window.CompletionScene = CompletionScene;
