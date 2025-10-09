/**
 * 燙皮上糖色迷你遊戲 - 簡化版
 * 玩家用刷子塗抹蜂蜜在鴨子上
 */
class ScaldingColoringGame extends MiniGame {
    constructor(config = {}) {
        super({
            name: '塗抹蜂蜜',
            timeLimit: 0,
            successThreshold: 0.90,
            ...config
        });

        // 鴨胚
        this.duckEmbryo = {
            x: this.gameArea ? this.gameArea.x + this.gameArea.width / 2 - 100 : 300,
            y: this.gameArea ? this.gameArea.y + this.gameArea.height / 2 - 75 : 200,
            width: 200,
            height: 150
        };

        // 刷子
        this.brush = {
            x: 0,
            y: 0,
            size: 30,
            isActive: false,
            isDragging: false
        };

        // 塗抹的區域網格
        this.paintGrid = [];
        this.gridRows = 10;
        this.gridCols = 10;
        this.initializePaintGrid();

        // 進度
        this.paintedCells = 0;
        this.totalCells = this.gridRows * this.gridCols;
        this.coloringProgress = 0;
    }

    /**
     * 初始化塗抹網格
     */
    initializePaintGrid() {
        const cellWidth = this.duckEmbryo.width / this.gridCols;
        const cellHeight = this.duckEmbryo.height / this.gridRows;

        for (let row = 0; row < this.gridRows; row++) {
            for (let col = 0; col < this.gridCols; col++) {
                this.paintGrid.push({
                    x: this.duckEmbryo.x + col * cellWidth,
                    y: this.duckEmbryo.y + row * cellHeight,
                    width: cellWidth,
                    height: cellHeight,
                    painted: false,
                    opacity: 0
                });
            }
        }
    }

    /**
     * 設置遊戲
     */
    setupGame() {
        this.paintedCells = 0;
        this.coloringProgress = 0;
        this.brush.isActive = false;
        this.brush.isDragging = false;

        // 重置網格
        this.paintGrid.forEach(cell => {
            cell.painted = false;
            cell.opacity = 0;
        });

        this.updateProgress(0);
    }

    /**
     * 獲取遊戲說明
     */
    getInstructions() {
        return '拖動刷子在鴨子上塗抹蜂蜜，完全覆蓋鴨子表面';
    }

    /**
     * 創建UI
     */
    createUI() {
        super.createUI();

        if (this.gameEngine && this.gameEngine.uiManager) {
            // 進度標籤
            this.progressLabel = this.gameEngine.uiManager.createLabel({
                x: this.gameArea.x + 20,
                y: this.gameArea.y + 60,
                text: '塗抹進度: 0%',
                fontSize: 14,
                color: '#333333'
            });
        }
    }

    /**
     * 更新遊戲邏輯
     */
    updateGame(deltaTime) {
        // 如果刷子激活，檢查與網格的碰撞
        if (this.brush.isActive && this.brush.isDragging) {
            this.checkBrushCollision();
        }

        // 更新進度
        this.updateColoringProgress();

        // 檢查完成
        if (this.coloringProgress >= 90 && !this.isCompleted) {
            this.isCompleted = true;
            setTimeout(() => {
                this.complete(true);
            }, 500);
        }
    }

    /**
     * 檢查刷子與網格碰撞
     */
    checkBrushCollision() {
        const brushRadius = this.brush.size / 2;

        this.paintGrid.forEach(cell => {
            if (!cell.painted) {
                const cellCenterX = cell.x + cell.width / 2;
                const cellCenterY = cell.y + cell.height / 2;

                const dx = this.brush.x - cellCenterX;
                const dy = this.brush.y - cellCenterY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < brushRadius + Math.min(cell.width, cell.height) / 2) {
                    cell.painted = true;
                    cell.opacity = 1;
                    this.paintedCells++;
                }
            }
        });
    }

    /**
     * 更新上色進度
     */
    updateColoringProgress() {
        this.coloringProgress = (this.paintedCells / this.totalCells) * 100;
        this.updateProgress(this.coloringProgress / 100);

        if (this.progressLabel) {
            this.progressLabel.setText(`塗抹進度: ${Math.round(this.coloringProgress)}%`);
        }
    }

    /**
     * 渲染遊戲內容
     */
    renderGame(context) {
        // 繪製鴨胚輪廓
        context.strokeStyle = '#8B4513';
        context.lineWidth = 2;
        context.strokeRect(
            this.duckEmbryo.x,
            this.duckEmbryo.y,
            this.duckEmbryo.width,
            this.duckEmbryo.height
        );

        // 繪製鴨子基礎顏色
        context.fillStyle = '#D2B48C';
        context.fillRect(
            this.duckEmbryo.x,
            this.duckEmbryo.y,
            this.duckEmbryo.width,
            this.duckEmbryo.height
        );

        // 繪製塗抹的蜂蜜
        this.paintGrid.forEach(cell => {
            if (cell.painted) {
                context.fillStyle = `rgba(255, 193, 7, ${cell.opacity})`;
                context.fillRect(cell.x, cell.y, cell.width, cell.height);
            }
        });

        // 繪製鴨子輪廓以顯示形狀
        this.renderDuckOutline(context);

        // 繪製刷子
        if (this.brush.isActive) {
            context.fillStyle = this.brush.isDragging ? 'rgba(255, 193, 7, 0.6)' : 'rgba(255, 193, 7, 0.3)';
            context.beginPath();
            context.arc(this.brush.x, this.brush.y, this.brush.size / 2, 0, Math.PI * 2);
            context.fill();

            context.strokeStyle = '#FFA000';
            context.lineWidth = 2;
            context.stroke();

            // 刷子中心點
            context.fillStyle = '#F57C00';
            context.beginPath();
            context.arc(this.brush.x, this.brush.y, 3, 0, Math.PI * 2);
            context.fill();
        }
    }

    /**
     * 繪製鴨子輪廓
     */
    renderDuckOutline(context) {
        const centerX = this.duckEmbryo.x + this.duckEmbryo.width / 2;
        const centerY = this.duckEmbryo.y + this.duckEmbryo.height / 2;

        context.strokeStyle = '#8B4513';
        context.lineWidth = 3;

        // 簡化的鴨子輪廓
        context.beginPath();

        // 身體（橢圓）
        context.ellipse(
            centerX,
            centerY + 10,
            this.duckEmbryo.width * 0.35,
            this.duckEmbryo.height * 0.35,
            0,
            0,
            Math.PI * 2
        );

        context.stroke();

        // 頭部（小圓）
        context.beginPath();
        context.arc(
            centerX - this.duckEmbryo.width * 0.15,
            centerY - this.duckEmbryo.height * 0.2,
            this.duckEmbryo.width * 0.15,
            0,
            Math.PI * 2
        );
        context.stroke();
    }

    /**
     * 處理遊戲特定輸入
     */
    handleGameInput(event) {
        if (event.type === 'mousedown') {
            return this.handleMouseDown(event.x, event.y);
        } else if (event.type === 'mouseup') {
            return this.handleMouseUp(event.x, event.y);
        } else if (event.type === 'mousemove') {
            return this.handleMouseMove(event.x, event.y);
        }

        return false;
    }

    /**
     * 處理滑鼠按下
     */
    handleMouseDown(x, y) {
        // 檢查是否在鴨子區域內
        if (x >= this.duckEmbryo.x - 50 &&
            x <= this.duckEmbryo.x + this.duckEmbryo.width + 50 &&
            y >= this.duckEmbryo.y - 50 &&
            y <= this.duckEmbryo.y + this.duckEmbryo.height + 50) {

            this.brush.isActive = true;
            this.brush.isDragging = true;
            this.brush.x = x;
            this.brush.y = y;
            return true;
        }

        return false;
    }

    /**
     * 處理滑鼠釋放
     */
    handleMouseUp(x, y) {
        this.brush.isDragging = false;
        return false;
    }

    /**
     * 處理滑鼠移動
     */
    handleMouseMove(x, y) {
        if (this.brush.isActive) {
            this.brush.x = x;
            this.brush.y = y;
            return true;
        }

        return false;
    }

    /**
     * 計算準確度獎勵
     */
    calculateAccuracyBonus() {
        let bonus = 0;

        // 覆蓋率獎勵
        if (this.coloringProgress >= 95) {
            bonus += 50;
        } else if (this.coloringProgress >= 90) {
            bonus += 30;
        }

        // 時間獎勵
        const gameTime = this.stats.endTime - this.stats.startTime;
        if (gameTime < 30000) {
            bonus += 30;
        } else if (gameTime < 45000) {
            bonus += 15;
        }

        return bonus;
    }
}

// 匯出到全域作用域
window.ScaldingColoringGame = ScaldingColoringGame;
