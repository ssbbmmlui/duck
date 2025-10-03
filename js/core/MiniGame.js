/**
 * 迷你遊戲基類
 * 所有迷你遊戲的基礎類別
 */
class MiniGame {
    constructor(config = {}) {
        this.name = config.name || 'MiniGame';
        this.gameEngine = config.gameEngine;
        this.scene = config.scene;
        
        // 遊戲狀態
        this.isActive = false;
        this.isCompleted = false;
        this.isSuccessful = false;
        this.progress = 0; // 0-1之間
        
        // 遊戲配置
        this.config = {
            timeLimit: config.timeLimit || 0, // 0表示無時間限制
            maxAttempts: config.maxAttempts || 0, // 0表示無限制
            successThreshold: config.successThreshold || 1.0,
            ...config
        };
        
        // 遊戲統計
        this.stats = {
            attempts: 0,
            startTime: 0,
            endTime: 0,
            score: 0
        };
        
        // 回調函數
        this.onComplete = null;
        this.onProgress = null;
        this.onFail = null;
        
        // UI元素
        this.uiElements = [];
        this.instructions = null;
        this.progressBar = null;
        
        // 遊戲區域
        this.gameArea = {
            x: config.gameAreaX || 100,
            y: config.gameAreaY || 150,
            width: config.gameAreaWidth || 600,
            height: config.gameAreaHeight || 300
        };
    }

    /**
     * 開始迷你遊戲
     */
    start() {
        this.isActive = true;
        this.isCompleted = false;
        this.isSuccessful = false;
        this.progress = 0;
        this.stats.startTime = Date.now();
        this.stats.attempts++;
        
        this.setupGame();
        this.createUI();
        
        console.log(`開始迷你遊戲: ${this.name}`);
    }

    /**
     * 設置遊戲
     */
    setupGame() {
        // 子類別應該覆寫此方法來設置遊戲特定內容
    }

    /**
     * 創建UI
     */
    createUI() {
        if (!this.gameEngine || !this.gameEngine.uiManager) return;
        
        const uiManager = this.gameEngine.uiManager;
        const canvas = this.gameEngine.canvas;
        
        // 創建說明文字
        this.instructions = uiManager.createLabel({
            x: canvas.width / 2,
            y: 120,
            text: this.getInstructions(),
            fontSize: 16,
            color: '#654321',
            align: 'center'
        });
        
        // 創建進度條
        this.progressBar = uiManager.createProgressBar({
            x: this.gameArea.x,
            y: this.gameArea.y - 30,
            width: this.gameArea.width,
            height: 20,
            progress: this.progress,
            color: '#32CD32'
        });
        
        this.uiElements.push(this.instructions, this.progressBar);
    }

    /**
     * 獲取遊戲說明
     */
    getInstructions() {
        return '請按照提示完成操作';
    }

    /**
     * 更新迷你遊戲
     */
    update(deltaTime) {
        if (!this.isActive || this.isCompleted) return;
        
        // 檢查時間限制
        if (this.config.timeLimit > 0) {
            const elapsed = Date.now() - this.stats.startTime;
            if (elapsed > this.config.timeLimit) {
                this.fail('時間到了！');
                return;
            }
        }
        
        // 更新遊戲邏輯
        this.updateGame(deltaTime);
        
        // 更新進度條
        if (this.progressBar) {
            this.progressBar.setProgress(this.progress);
        }
        
        // 檢查完成條件
        this.checkCompletion();
    }

    /**
     * 更新遊戲邏輯
     */
    updateGame(deltaTime) {
        // 子類別應該覆寫此方法來更新遊戲特定邏輯
    }

    /**
     * 渲染迷你遊戲
     */
    render(context) {
        if (!this.isActive) return;
        
        // 渲染遊戲區域背景
        this.renderGameArea(context);
        
        // 渲染遊戲內容
        this.renderGame(context);
        
        // 渲染遊戲狀態
        this.renderGameStatus(context);
    }

    /**
     * 渲染遊戲區域
     */
    renderGameArea(context) {
        const area = this.gameArea;
        
        // 繪製遊戲區域背景
        context.fillStyle = 'rgba(255, 255, 255, 0.9)';
        context.fillRect(area.x, area.y, area.width, area.height);
        
        // 繪製邊框
        context.strokeStyle = '#8B4513';
        context.lineWidth = 2;
        context.strokeRect(area.x, area.y, area.width, area.height);
    }

    /**
     * 渲染遊戲內容
     */
    renderGame(context) {
        // 子類別應該覆寫此方法來渲染遊戲特定內容
    }

    /**
     * 渲染遊戲狀態
     */
    renderGameStatus(context) {
        // 渲染嘗試次數（如果有限制）
        if (this.config.maxAttempts > 0) {
            context.fillStyle = '#654321';
            context.font = '14px Microsoft JhengHei';
            context.textAlign = 'right';
            context.fillText(
                `嘗試次數: ${this.stats.attempts}/${this.config.maxAttempts}`,
                this.gameArea.x + this.gameArea.width - 10,
                this.gameArea.y + 20
            );
        }
        
        // 渲染時間（如果有限制）
        if (this.config.timeLimit > 0) {
            const elapsed = Date.now() - this.stats.startTime;
            const remaining = Math.max(0, this.config.timeLimit - elapsed);
            const seconds = Math.ceil(remaining / 1000);
            
            context.fillStyle = seconds <= 10 ? '#FF6B6B' : '#654321';
            context.font = '14px Microsoft JhengHei';
            context.textAlign = 'left';
            context.fillText(
                `剩餘時間: ${seconds}秒`,
                this.gameArea.x + 10,
                this.gameArea.y + 20
            );
        }
    }

    /**
     * 處理輸入事件
     */
    handleInput(event) {
        if (!this.isActive || this.isCompleted) return false;
        
        // 檢查是否在遊戲區域內
        if (!this.isPointInGameArea(event.x, event.y)) {
            return false;
        }
        
        // 處理遊戲特定輸入
        return this.handleGameInput(event);
    }

    /**
     * 處理遊戲特定輸入
     */
    handleGameInput(event) {
        // 子類別應該覆寫此方法來處理遊戲特定輸入
        return false;
    }

    /**
     * 檢查點是否在遊戲區域內
     */
    isPointInGameArea(x, y) {
        const area = this.gameArea;
        return x >= area.x && x <= area.x + area.width &&
               y >= area.y && y <= area.y + area.height;
    }

    /**
     * 更新進度
     */
    updateProgress(newProgress) {
        this.progress = Math.max(0, Math.min(1, newProgress));
        
        if (this.onProgress) {
            this.onProgress(this.progress);
        }
    }

    /**
     * 檢查完成條件
     */
    checkCompletion() {
        if (this.progress >= this.config.successThreshold) {
            this.complete(true);
        }
    }

    /**
     * 完成迷你遊戲
     */
    complete(success = true) {
        if (this.isCompleted) return;
        
        this.isCompleted = true;
        this.isSuccessful = success;
        this.stats.endTime = Date.now();
        
        // 計算分數
        this.calculateScore();
        
        console.log(`迷你遊戲完成: ${this.name}, 成功: ${success}, 分數: ${this.stats.score}`);
        
        if (this.onComplete) {
            this.onComplete(success, this.stats);
        }
        
        // 延遲清理，讓玩家看到結果
        setTimeout(() => {
            this.cleanup();
        }, 2000);
    }

    /**
     * 失敗
     */
    fail(reason = '遊戲失敗') {
        console.log(`迷你遊戲失敗: ${this.name}, 原因: ${reason}`);
        
        if (this.onFail) {
            this.onFail(reason);
        }
        
        // 檢查是否還有嘗試機會
        if (this.config.maxAttempts > 0 && this.stats.attempts >= this.config.maxAttempts) {
            this.complete(false);
        } else {
            // 重置遊戲狀態，允許重試
            this.reset();
        }
    }

    /**
     * 重置遊戲
     */
    reset() {
        this.progress = 0;
        this.isCompleted = false;
        this.isSuccessful = false;
        
        // 重新設置遊戲
        this.setupGame();
        
        console.log(`重置迷你遊戲: ${this.name}`);
    }

    /**
     * 計算分數
     */
    calculateScore() {
        const baseScore = 100;
        const timeBonus = this.calculateTimeBonus();
        const accuracyBonus = this.calculateAccuracyBonus();
        
        this.stats.score = Math.round(baseScore + timeBonus + accuracyBonus);
    }

    /**
     * 計算時間獎勵
     */
    calculateTimeBonus() {
        if (this.config.timeLimit <= 0) return 0;
        
        const elapsed = this.stats.endTime - this.stats.startTime;
        const remaining = Math.max(0, this.config.timeLimit - elapsed);
        const timeRatio = remaining / this.config.timeLimit;
        
        return Math.round(timeRatio * 50); // 最多50分時間獎勵
    }

    /**
     * 計算準確度獎勵
     */
    calculateAccuracyBonus() {
        // 基於嘗試次數計算準確度獎勵
        if (this.stats.attempts === 1) return 50; // 一次成功
        if (this.stats.attempts <= 3) return 25; // 三次內成功
        return 0; // 超過三次無獎勵
    }

    /**
     * 暫停遊戲
     */
    pause() {
        this.isActive = false;
    }

    /**
     * 恢復遊戲
     */
    resume() {
        this.isActive = true;
    }

    /**
     * 清理資源
     */
    cleanup() {
        this.isActive = false;
        
        // 清理UI元素
        if (this.gameEngine && this.gameEngine.uiManager) {
            this.uiElements.forEach(element => {
                this.gameEngine.uiManager.removeUIElement(element);
            });
        }
        
        this.uiElements = [];
        this.instructions = null;
        this.progressBar = null;
        
        console.log(`清理迷你遊戲: ${this.name}`);
    }

    /**
     * 獲取遊戲結果
     */
    getResult() {
        return {
            name: this.name,
            completed: this.isCompleted,
            successful: this.isSuccessful,
            progress: this.progress,
            stats: { ...this.stats }
        };
    }
}