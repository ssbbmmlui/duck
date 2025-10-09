/**
 * 燙皮上糖色迷你遊戲
 * 第一階段：用熱水燙皮
 * 第二階段：塗抹蜂蜜
 */
class ScaldingColoringGame extends MiniGame {
    constructor(config = {}) {
        super({
            name: '燙皮上糖色遊戲',
            timeLimit: 0,
            successThreshold: 0.85,
            ...config
        });

        // 鴨胚
        this.duckEmbryo = {
            x: this.gameArea ? this.gameArea.x + this.gameArea.width / 2 - 100 : 300,
            y: this.gameArea ? this.gameArea.y + this.gameArea.height / 2 - 75 : 200,
            width: 200,
            height: 150
        };

        // 遊戲階段
        this.gamePhase = 'scalding';
        this.scaldingCompleted = false;
        this.coloringCompleted = false;

        // 燙皮階段
        this.scalding = {
            waterPot: {
                x: this.gameArea ? this.gameArea.x + 50 : 100,
                y: this.gameArea ? this.gameArea.y + this.gameArea.height - 120 : 400,
                width: 80,
                height: 80,
                isPouring: false
            },
            pourStream: {
                active: false,
                x: 0,
                y: 0,
                targetX: 0,
                targetY: 0
            },
            scaldingGrid: [],
            scaldedCells: 0,
            totalCells: 100,
            scaldingProgress: 0
        };

        // 上色階段
        this.coloring = {
            brush: {
                x: 0,
                y: 0,
                size: 30,
                isActive: false,
                isDragging: false
            },
            paintGrid: [],
            paintedCells: 0,
            totalCells: 100,
            coloringProgress: 0
        };

        // 視覺效果
        this.steamParticles = [];
        this.waterDroplets = [];

        this.initializeGrids();
    }

    /**
     * 初始化網格
     */
    initializeGrids() {
        const gridRows = 10;
        const gridCols = 10;
        const cellWidth = this.duckEmbryo.width / gridCols;
        const cellHeight = this.duckEmbryo.height / gridRows;

        for (let row = 0; row < gridRows; row++) {
            for (let col = 0; col < gridCols; col++) {
                this.scalding.scaldingGrid.push({
                    x: this.duckEmbryo.x + col * cellWidth,
                    y: this.duckEmbryo.y + row * cellHeight,
                    width: cellWidth,
                    height: cellHeight,
                    scalded: false,
                    opacity: 0
                });

                this.coloring.paintGrid.push({
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
        this.gamePhase = 'scalding';
        this.scaldingCompleted = false;
        this.coloringCompleted = false;

        this.scalding.scaldedCells = 0;
        this.scalding.scaldingProgress = 0;
        this.scalding.waterPot.isPouring = false;
        this.scalding.pourStream.active = false;
        this.scalding.scaldingGrid.forEach(cell => {
            cell.scalded = false;
            cell.opacity = 0;
        });

        this.coloring.paintedCells = 0;
        this.coloring.coloringProgress = 0;
        this.coloring.brush.isActive = false;
        this.coloring.brush.isDragging = false;
        this.coloring.paintGrid.forEach(cell => {
            cell.painted = false;
            cell.opacity = 0;
        });

        this.steamParticles = [];
        this.waterDroplets = [];

        this.updateProgress(0);
    }

    /**
     * 獲取遊戲說明
     */
    getInstructions() {
        if (this.gamePhase === 'scalding') {
            return '按住熱水壺，將熱水澆在鴨子上進行燙皮';
        } else {
            return '拖動刷子在鴨子上塗抹蜂蜜';
        }
    }

    /**
     * 創建UI
     */
    createUI() {
        super.createUI();

        if (this.gameEngine && this.gameEngine.uiManager) {
            this.phaseLabel = this.gameEngine.uiManager.createLabel({
                x: this.gameArea.x + 20,
                y: this.gameArea.y + 60,
                text: '階段: 燙皮',
                fontSize: 14,
                color: '#333333'
            });

            this.progressLabel = this.gameEngine.uiManager.createLabel({
                x: this.gameArea.x + 20,
                y: this.gameArea.y + 85,
                text: '燙皮進度: 0%',
                fontSize: 14,
                color: '#333333'
            });
        }
    }

    /**
     * 更新遊戲邏輯
     */
    updateGame(deltaTime) {
        if (this.gamePhase === 'scalding') {
            this.updateScaldingPhase(deltaTime);
        } else if (this.gamePhase === 'coloring') {
            this.updateColoringPhase(deltaTime);
        }

        this.updateVisualEffects(deltaTime);
    }

    /**
     * 更新燙皮階段
     */
    updateScaldingPhase(deltaTime) {
        if (this.scalding.pourStream.active) {
            this.checkScaldingCollision();
            this.createSteamParticles();
        }

        this.scalding.scaldingProgress = (this.scalding.scaldedCells / this.scalding.totalCells) * 100;
        this.updateProgress(this.scalding.scaldingProgress / 200);

        if (this.progressLabel) {
            this.progressLabel.setText(`燙皮進度: ${Math.round(this.scalding.scaldingProgress)}%`);
        }

        if (this.scalding.scaldingProgress >= 90 && !this.scaldingCompleted) {
            this.scaldingCompleted = true;
            this.transitionToColoring();
        }
    }

    /**
     * 更新上色階段
     */
    updateColoringPhase(deltaTime) {
        if (this.coloring.brush.isActive && this.coloring.brush.isDragging) {
            this.checkColoringCollision();
        }

        this.coloring.coloringProgress = (this.coloring.paintedCells / this.coloring.totalCells) * 100;
        this.updateProgress(0.5 + this.coloring.coloringProgress / 200);

        if (this.progressLabel) {
            this.progressLabel.setText(`塗抹進度: ${Math.round(this.coloring.coloringProgress)}%`);
        }

        if (this.coloring.coloringProgress >= 85 && !this.coloringCompleted) {
            this.coloringCompleted = true;
            setTimeout(() => {
                this.complete(true);
            }, 500);
        }
    }

    /**
     * 檢查燙皮碰撞
     */
    checkScaldingCollision() {
        const streamX = this.scalding.pourStream.targetX;
        const streamY = this.scalding.pourStream.targetY;
        const streamRadius = 25;

        this.scalding.scaldingGrid.forEach(cell => {
            if (!cell.scalded) {
                const cellCenterX = cell.x + cell.width / 2;
                const cellCenterY = cell.y + cell.height / 2;

                const dx = streamX - cellCenterX;
                const dy = streamY - cellCenterY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < streamRadius + Math.min(cell.width, cell.height) / 2) {
                    cell.scalded = true;
                    cell.opacity = 1;
                    this.scalding.scaldedCells++;
                }
            }
        });
    }

    /**
     * 檢查上色碰撞
     */
    checkColoringCollision() {
        const brushRadius = this.coloring.brush.size / 2;

        this.coloring.paintGrid.forEach(cell => {
            if (!cell.painted) {
                const cellCenterX = cell.x + cell.width / 2;
                const cellCenterY = cell.y + cell.height / 2;

                const dx = this.coloring.brush.x - cellCenterX;
                const dy = this.coloring.brush.y - cellCenterY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < brushRadius + Math.min(cell.width, cell.height) / 2) {
                    cell.painted = true;
                    cell.opacity = 1;
                    this.coloring.paintedCells++;
                }
            }
        });
    }

    /**
     * 創建蒸汽粒子
     */
    createSteamParticles() {
        if (Math.random() < 0.3) {
            this.steamParticles.push({
                x: this.scalding.pourStream.targetX + (Math.random() - 0.5) * 30,
                y: this.scalding.pourStream.targetY,
                vx: (Math.random() - 0.5) * 2,
                vy: -2 - Math.random() * 2,
                life: 1,
                maxLife: 60,
                size: 5 + Math.random() * 10
            });
        }
    }

    /**
     * 更新視覺效果
     */
    updateVisualEffects(deltaTime) {
        this.steamParticles = this.steamParticles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            return particle.life > 0;
        });
    }

    /**
     * 轉換到上色階段
     */
    transitionToColoring() {
        setTimeout(() => {
            this.gamePhase = 'coloring';
            this.scalding.pourStream.active = false;
            this.scalding.waterPot.isPouring = false;

            if (this.phaseLabel) {
                this.phaseLabel.setText('階段: 上色');
            }
            if (this.progressLabel) {
                this.progressLabel.setText('塗抹進度: 0%');
            }
        }, 1000);
    }

    /**
     * 渲染遊戲內容
     */
    renderGame(context) {
        context.fillStyle = '#D2B48C';
        context.fillRect(
            this.duckEmbryo.x,
            this.duckEmbryo.y,
            this.duckEmbryo.width,
            this.duckEmbryo.height
        );

        if (this.gamePhase === 'scalding' || this.scaldingCompleted) {
            this.scalding.scaldingGrid.forEach(cell => {
                if (cell.scalded) {
                    context.fillStyle = `rgba(205, 133, 63, ${cell.opacity * 0.5})`;
                    context.fillRect(cell.x, cell.y, cell.width, cell.height);
                }
            });
        }

        if (this.gamePhase === 'coloring') {
            this.coloring.paintGrid.forEach(cell => {
                if (cell.painted) {
                    context.fillStyle = `rgba(255, 193, 7, ${cell.opacity})`;
                    context.fillRect(cell.x, cell.y, cell.width, cell.height);
                }
            });
        }

        this.renderDuckOutline(context);

        if (this.gamePhase === 'scalding') {
            this.renderScaldingPhase(context);
        } else if (this.gamePhase === 'coloring') {
            this.renderColoringPhase(context);
        }
    }

    /**
     * 繪製燙皮階段
     */
    renderScaldingPhase(context) {
        const pot = this.scalding.waterPot;
        context.fillStyle = pot.isPouring ? '#CD853F' : '#8B4513';
        context.fillRect(pot.x, pot.y, pot.width, pot.height);

        context.strokeStyle = '#654321';
        context.lineWidth = 3;
        context.strokeRect(pot.x, pot.y, pot.width, pot.height);

        context.fillStyle = pot.isPouring ? '#CD853F' : '#8B4513';
        context.beginPath();
        context.moveTo(pot.x + pot.width, pot.y + 20);
        context.lineTo(pot.x + pot.width + 15, pot.y + 15);
        context.lineTo(pot.x + pot.width + 15, pot.y + 30);
        context.closePath();
        context.fill();
        context.stroke();

        if (this.scalding.pourStream.active) {
            const stream = this.scalding.pourStream;

            context.strokeStyle = 'rgba(135, 206, 235, 0.7)';
            context.lineWidth = 10;
            context.beginPath();
            context.moveTo(stream.x, stream.y);
            context.lineTo(stream.targetX, stream.targetY);
            context.stroke();

            for (let i = 0; i < 3; i++) {
                const t = i / 3;
                const x = stream.x + (stream.targetX - stream.x) * t;
                const y = stream.y + (stream.targetY - stream.y) * t;

                context.fillStyle = 'rgba(135, 206, 235, 0.6)';
                context.beginPath();
                context.arc(x, y, 5, 0, Math.PI * 2);
                context.fill();
            }
        }

        this.steamParticles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            context.fillStyle = `rgba(200, 200, 200, ${alpha * 0.5})`;
            context.beginPath();
            context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            context.fill();
        });

        context.fillStyle = '#333333';
        context.font = '12px Arial';
        context.textAlign = 'center';
        context.fillText('熱水壺', pot.x + pot.width / 2, pot.y + pot.height + 20);
    }

    /**
     * 繪製上色階段
     */
    renderColoringPhase(context) {
        if (this.coloring.brush.isActive) {
            const brush = this.coloring.brush;
            context.fillStyle = brush.isDragging ? 'rgba(255, 193, 7, 0.6)' : 'rgba(255, 193, 7, 0.3)';
            context.beginPath();
            context.arc(brush.x, brush.y, brush.size / 2, 0, Math.PI * 2);
            context.fill();

            context.strokeStyle = '#FFA000';
            context.lineWidth = 2;
            context.stroke();

            context.fillStyle = '#F57C00';
            context.beginPath();
            context.arc(brush.x, brush.y, 3, 0, Math.PI * 2);
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

        context.beginPath();
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
        if (this.gamePhase === 'scalding') {
            const pot = this.scalding.waterPot;
            if (x >= pot.x && x <= pot.x + pot.width &&
                y >= pot.y && y <= pot.y + pot.height) {
                pot.isPouring = true;
                this.scalding.pourStream.active = true;
                this.scalding.pourStream.x = pot.x + pot.width + 15;
                this.scalding.pourStream.y = pot.y + 22;
                return true;
            }
        } else if (this.gamePhase === 'coloring') {
            if (x >= this.duckEmbryo.x - 50 &&
                x <= this.duckEmbryo.x + this.duckEmbryo.width + 50 &&
                y >= this.duckEmbryo.y - 50 &&
                y <= this.duckEmbryo.y + this.duckEmbryo.height + 50) {

                this.coloring.brush.isActive = true;
                this.coloring.brush.isDragging = true;
                this.coloring.brush.x = x;
                this.coloring.brush.y = y;
                return true;
            }
        }

        return false;
    }

    /**
     * 處理滑鼠釋放
     */
    handleMouseUp(x, y) {
        if (this.gamePhase === 'scalding') {
            this.scalding.waterPot.isPouring = false;
            this.scalding.pourStream.active = false;
        } else if (this.gamePhase === 'coloring') {
            this.coloring.brush.isDragging = false;
        }

        return false;
    }

    /**
     * 處理滑鼠移動
     */
    handleMouseMove(x, y) {
        if (this.gamePhase === 'scalding' && this.scalding.pourStream.active) {
            this.scalding.pourStream.targetX = x;
            this.scalding.pourStream.targetY = y;
            return true;
        } else if (this.gamePhase === 'coloring' && this.coloring.brush.isActive) {
            this.coloring.brush.x = x;
            this.coloring.brush.y = y;
            return true;
        }

        return false;
    }

    /**
     * 計算準確度獎勵
     */
    calculateAccuracyBonus() {
        let bonus = 0;

        if (this.scalding.scaldingProgress >= 95) {
            bonus += 25;
        }

        if (this.coloring.coloringProgress >= 90) {
            bonus += 25;
        }

        return bonus;
    }
}

window.ScaldingColoringGame = ScaldingColoringGame;
