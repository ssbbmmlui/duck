/**
 * 重量測量迷你遊戲
 * 玩家需要點擊移動的鴨子來防止它逃離秤，並盡量保持在中心位置獲得更高分數
 */
class WeightMeasurementGame extends MiniGame {
    constructor(config = {}) {
        super({
            name: '重量測量',
            timeLimit: 0,
            successThreshold: 1.0,
            ...config
        });

        this.duck = {
            x: 0,
            y: 0,
            width: 80,
            height: 60,
            baseX: 0,
            baseY: 0,
            onScale: false,
            targetWeight: 3.2,
            moveSpeed: 2.5,
            moveDirection: 1,
            moveRange: 60,
            isEscaping: false,
            escapeSpeed: 0,
            timeSinceLastClick: 0,
            escapeThreshold: 2000
        };

        this.scale = {
            x: 400,
            y: 280,
            width: 120,
            height: 80,
            plateY: 280,
            plateHeight: 15,
            displayX: 450,
            displayY: 200,
            displayWidth: 100,
            displayHeight: 60,
            currentWeight: 0,
            isActive: false,
            centerX: 0
        };

        this.measurementState = {
            phase: 'drag',
            weighingTimer: 0,
            requiredWeighingTime: 5000,
            measurementComplete: false,
            currentScore: 0,
            maxScore: 100,
            centerBonus: 0
        };

        this.dragSystem = {
            isDragging: false,
            initialDragComplete: false
        };

        this.particles = [];
        this.feedbackMessages = [];

        this.duckImage = null;
        this.scaleImage = null;
    }

    setupGame() {
        this.duck.x = 150;
        this.duck.y = 250;
        this.duck.onScale = false;
        this.duck.isEscaping = false;
        this.duck.escapeSpeed = 0;
        this.duck.moveDirection = 1;
        this.duck.timeSinceLastClick = 0;

        this.duck.baseX = this.scale.x + (this.scale.width - this.duck.width) / 2;
        this.duck.baseY = this.scale.plateY - this.duck.height + 5;
        this.scale.centerX = this.scale.x + this.scale.width / 2;

        this.scale.currentWeight = 0;
        this.scale.isActive = false;

        this.measurementState.phase = 'drag';
        this.measurementState.weighingTimer = 0;
        this.measurementState.measurementComplete = false;
        this.measurementState.currentScore = 0;
        this.measurementState.centerBonus = 0;

        this.dragSystem.isDragging = false;
        this.dragSystem.initialDragComplete = false;

        this.particles = [];
        this.feedbackMessages = [];

        if (this.gameEngine && this.gameEngine.assetManager) {
            this.duckImage = this.gameEngine.assetManager.getAsset('raw_duck');
            this.scaleImage = this.gameEngine.assetManager.getAsset('scale');
        }
    }

    getInstructions() {
        if (this.measurementState.phase === 'complete') {
            return `測量完成！分數: ${this.measurementState.currentScore.toFixed(0)}`;
        } else if (this.measurementState.phase === 'weighing') {
            return '點擊鴨子保持在中心！越靠近中心分數越高';
        } else {
            return '拖拽鴨子到秤上進行重量測量';
        }
    }

    updateGame(deltaTime) {
        if (this.measurementState.phase === 'drag') {
            this.checkDuckOnScale();
        } else if (this.measurementState.phase === 'weighing') {
            this.updateWeighingPhase(deltaTime);
        }

        this.updateVisualEffects(deltaTime);

        if (this.measurementState.phase === 'weighing') {
            const progress = this.measurementState.weighingTimer / this.measurementState.requiredWeighingTime;
            this.updateProgress(Math.min(1.0, progress));
        } else if (this.measurementState.phase === 'complete') {
            this.updateProgress(1.0);
        } else {
            this.updateProgress(0);
        }

        if (this.instructions) {
            this.instructions.setText(this.getInstructions());
        }
    }

    updateWeighingPhase(deltaTime) {
        if (this.measurementState.measurementComplete) return;

        this.duck.timeSinceLastClick += deltaTime;

        if (this.duck.timeSinceLastClick > this.duck.escapeThreshold && !this.duck.isEscaping) {
            this.duck.isEscaping = true;
            this.duck.escapeSpeed = 2;
        }

        if (this.duck.isEscaping) {
            this.duck.y -= this.duck.escapeSpeed;
            this.duck.escapeSpeed += 0.15;

            if (this.duck.y < this.duck.baseY - 80) {
                this.duckEscaped();
                return;
            }
        } else {
            this.duck.x += this.duck.moveSpeed * this.duck.moveDirection;

            const isOnScale = this.checkIfOnScale();
            if (!isOnScale) {
                this.duckEscaped();
                return;
            }

            const distanceFromBase = this.duck.x - this.duck.baseX;
            if (Math.abs(distanceFromBase) >= this.duck.moveRange) {
                this.duck.moveDirection *= -1;
            }

            this.measurementState.weighingTimer += deltaTime;

            const duckCenterX = this.duck.x + this.duck.width / 2;
            const distanceFromCenter = Math.abs(duckCenterX - this.scale.centerX);
            const maxDistance = this.scale.width / 2;
            const centerScore = Math.max(0, 1 - (distanceFromCenter / maxDistance));

            this.measurementState.centerBonus += centerScore * deltaTime * 0.01;
            this.measurementState.currentScore = (this.measurementState.weighingTimer / this.measurementState.requiredWeighingTime) * this.measurementState.maxScore * (1 + this.measurementState.centerBonus * 0.5);

            this.scale.currentWeight = this.duck.targetWeight + Math.sin(Date.now() * 0.01) * 0.05;

            if (this.measurementState.weighingTimer >= this.measurementState.requiredWeighingTime) {
                this.completeMeasurement();
            }
        }
    }

    checkIfOnScale() {
        const duckCenterX = this.duck.x + this.duck.width / 2;
        const duckBottom = this.duck.y + this.duck.height;

        const scaleLeft = this.scale.x;
        const scaleRight = this.scale.x + this.scale.width;
        const scaleTop = this.scale.plateY;
        const scaleBottom = this.scale.plateY + this.scale.plateHeight + 20;

        return duckCenterX >= scaleLeft && duckCenterX <= scaleRight &&
               duckBottom >= scaleTop && duckBottom <= scaleBottom;
    }

    checkDuckOnScale() {
        if (!this.dragSystem.initialDragComplete) return;

        const isOnScale = this.checkIfOnScale();

        if (isOnScale && !this.duck.onScale) {
            this.duck.onScale = true;
            this.startWeighing();
        }
    }

    startWeighing() {
        this.measurementState.phase = 'weighing';
        this.scale.isActive = true;
        this.scale.currentWeight = this.duck.targetWeight;

        this.duck.x = this.duck.baseX;
        this.duck.y = this.duck.baseY;
        this.duck.timeSinceLastClick = 0;

        this.createPlacementEffect();
        this.createFeedbackMessage('開始測量！點擊鴨子防止它逃跑', this.scale.displayX, this.scale.displayY - 40, '#32CD32');
    }

    duckEscaped() {
        this.measurementState.phase = 'drag';
        this.measurementState.weighingTimer = 0;
        this.measurementState.centerBonus = 0;
        this.duck.onScale = false;
        this.duck.isEscaping = false;
        this.duck.escapeSpeed = 0;
        this.duck.timeSinceLastClick = 0;
        this.duck.x = 150;
        this.duck.y = 250;
        this.scale.isActive = false;
        this.dragSystem.initialDragComplete = false;

        this.createFeedbackMessage('鴨子逃跑了！重新放到秤上', this.scale.displayX, this.scale.displayY - 40, '#FF0000');
    }

    resetToCenter() {
        this.duck.x = this.duck.baseX;
        this.duck.y = this.duck.baseY;
        this.duck.isEscaping = false;
        this.duck.escapeSpeed = 0;
        this.duck.moveDirection = 1;
        this.duck.timeSinceLastClick = 0;
    }

    createPlacementEffect() {
        const centerX = this.duck.x + this.duck.width / 2;
        const centerY = this.duck.y + this.duck.height / 2;

        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: centerX,
                y: centerY,
                vx: (Math.random() - 0.5) * 3,
                vy: (Math.random() - 0.5) * 3,
                life: 1000,
                maxLife: 1000,
                alpha: 1,
                color: '#FFD700'
            });
        }

        if (this.gameEngine && this.gameEngine.gameState.settings.soundEnabled) {
            this.gameEngine.audioManager.playSound('place_on_scale');
        }
    }

    completeMeasurement() {
        this.measurementState.phase = 'complete';
        this.measurementState.measurementComplete = true;

        const weight = this.scale.currentWeight.toFixed(1);
        const finalScore = Math.round(this.measurementState.currentScore);

        this.createFeedbackMessage(
            `測量完成！重量: ${weight}公斤 | 分數: ${finalScore}`,
            this.scale.displayX + this.scale.displayWidth / 2,
            this.scale.displayY - 20,
            '#32CD32'
        );

        if (this.gameEngine) {
            this.gameEngine.addScore(finalScore, this.scale.displayX, this.scale.displayY, 'weight_measurement');
        }

        console.log(`重量測量完成: ${weight}公斤, 分數: ${finalScore}`);
    }

    updateVisualEffects(deltaTime) {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx * deltaTime * 0.1;
            particle.y += particle.vy * deltaTime * 0.1;
            particle.life -= deltaTime;
            particle.alpha = Math.max(0, particle.life / particle.maxLife);
            return particle.life > 0;
        });

        this.feedbackMessages = this.feedbackMessages.filter(msg => {
            msg.life -= deltaTime;
            msg.y -= deltaTime * 0.02;
            msg.alpha = Math.max(0, msg.life / msg.maxLife);
            return msg.life > 0;
        });
    }

    createFeedbackMessage(text, x, y, color = '#32CD32') {
        this.feedbackMessages.push({
            text: text,
            x: x,
            y: y,
            color: color,
            fontSize: 14,
            life: 3000,
            maxLife: 3000,
            alpha: 1
        });
    }

    renderGame(context) {
        this.renderScale(context);
        this.renderDuck(context);
        this.renderParticles(context);
        this.renderFeedbackMessages(context);

        if (this.measurementState.phase === 'drag') {
            this.renderDragHints(context);
        }

        if (this.measurementState.phase === 'weighing') {
            this.renderWeighingProgress(context);
            this.renderCenterIndicator(context);
            this.renderScoreDisplay(context);
        }
    }

    renderScale(context) {
        const scale = this.scale;

        context.fillStyle = '#8B4513';
        context.fillRect(scale.x, scale.y + 60, scale.width, 20);

        context.fillStyle = '#A0522D';
        context.fillRect(scale.x + scale.width / 2 - 5, scale.y + 20, 10, 60);

        const plateColor = scale.isActive ? '#FFD700' : '#CCCCCC';
        context.fillStyle = plateColor;
        context.fillRect(scale.x, scale.plateY, scale.width, scale.plateHeight);

        context.strokeStyle = '#8B4513';
        context.lineWidth = 2;
        context.strokeRect(scale.x, scale.plateY, scale.width, scale.plateHeight);

        context.fillStyle = '#2F4F4F';
        context.fillRect(scale.displayX, scale.displayY, scale.displayWidth, scale.displayHeight);

        context.strokeStyle = '#000000';
        context.lineWidth = 2;
        context.strokeRect(scale.displayX, scale.displayY, scale.displayWidth, scale.displayHeight);

        context.fillStyle = scale.isActive ? '#00FF00' : '#666666';
        context.font = 'bold 16px Microsoft JhengHei';
        context.textAlign = 'center';
        context.fillText(
            scale.isActive ? `${scale.currentWeight.toFixed(1)}kg` : '0.0kg',
            scale.displayX + scale.displayWidth / 2,
            scale.displayY + scale.displayHeight / 2 + 6
        );

        context.fillStyle = '#654321';
        context.font = '14px Microsoft JhengHei';
        context.textAlign = 'center';
        context.fillText('電子秤', scale.x + scale.width / 2, scale.y + scale.height + 20);
    }

    renderDuck(context) {
        const duck = this.duck;

        if (!this.dragSystem.isDragging && this.measurementState.phase !== 'weighing') {
            context.fillStyle = 'rgba(0, 0, 0, 0.2)';
            context.beginPath();
            context.ellipse(
                duck.x + duck.width / 2,
                duck.y + duck.height + 5,
                duck.width / 2,
                10,
                0, 0, Math.PI * 2
            );
            context.fill();
        }

        if (this.duckImage) {
            context.save();

            if (this.dragSystem.isDragging) {
                context.globalAlpha = 0.8;
                context.shadowColor = '#FFD700';
                context.shadowBlur = 10;
            }

            if (this.measurementState.phase === 'weighing' && duck.moveDirection === 1) {
                context.translate(duck.x + duck.width, duck.y);
                context.scale(-1, 1);
                context.drawImage(this.duckImage, 0, 0, duck.width, duck.height);
            } else {
                context.drawImage(this.duckImage, duck.x, duck.y, duck.width, duck.height);
            }

            context.restore();
        } else {
            context.fillStyle = this.dragSystem.isDragging ? '#FFE4B5' : '#F0F0F0';
            context.fillRect(duck.x, duck.y, duck.width, duck.height);

            context.strokeStyle = this.dragSystem.isDragging ? '#FFD700' : '#CCCCCC';
            context.lineWidth = 2;
            context.strokeRect(duck.x, duck.y, duck.width, duck.height);

            context.fillStyle = '#654321';
            context.font = '12px Microsoft JhengHei';
            context.textAlign = 'center';
            context.fillText('鴨子', duck.x + duck.width / 2, duck.y + duck.height / 2);
        }

        if (duck.isEscaping) {
            context.strokeStyle = '#FF0000';
            context.lineWidth = 3;
            context.strokeRect(duck.x - 2, duck.y - 2, duck.width + 4, duck.height + 4);
        }
    }

    renderCenterIndicator(context) {
        const centerX = this.scale.centerX;
        const centerY = this.scale.plateY + this.scale.plateHeight / 2;

        context.strokeStyle = '#32CD32';
        context.lineWidth = 2;
        context.setLineDash([5, 5]);
        context.beginPath();
        context.moveTo(centerX, centerY - 40);
        context.lineTo(centerX, centerY + 10);
        context.stroke();
        context.setLineDash([]);

        context.fillStyle = '#32CD32';
        context.beginPath();
        context.arc(centerX, centerY, 4, 0, Math.PI * 2);
        context.fill();
    }

    renderScoreDisplay(context) {
        const score = Math.round(this.measurementState.currentScore);
        const x = this.scale.displayX + this.scale.displayWidth / 2;
        const y = this.scale.displayY - 60;

        context.fillStyle = '#FFD700';
        context.font = 'bold 20px Microsoft JhengHei';
        context.textAlign = 'center';
        context.fillText(`分數: ${score}`, x, y);
    }

    renderParticles(context) {
        this.particles.forEach(particle => {
            context.save();
            context.globalAlpha = particle.alpha;
            context.fillStyle = particle.color;
            context.beginPath();
            context.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
            context.fill();
            context.restore();
        });
    }

    renderFeedbackMessages(context) {
        this.feedbackMessages.forEach(msg => {
            context.save();
            context.globalAlpha = msg.alpha;
            context.fillStyle = msg.color;
            context.font = `${msg.fontSize}px Microsoft JhengHei`;
            context.textAlign = 'center';
            context.fillText(msg.text, msg.x, msg.y);
            context.restore();
        });
    }

    renderDragHints(context) {
        if (this.measurementState.phase === 'drag' && !this.duck.onScale) {
            const arrowStartX = this.duck.x + this.duck.width;
            const arrowStartY = this.duck.y + this.duck.height / 2;
            const arrowEndX = this.scale.x - 20;
            const arrowEndY = this.scale.plateY + this.scale.plateHeight / 2;

            context.strokeStyle = '#FFD700';
            context.lineWidth = 3;
            context.setLineDash([10, 5]);
            context.beginPath();
            context.moveTo(arrowStartX, arrowStartY);
            context.lineTo(arrowEndX, arrowEndY);
            context.stroke();
            context.setLineDash([]);

            const angle = Math.atan2(arrowEndY - arrowStartY, arrowEndX - arrowStartX);
            context.beginPath();
            context.moveTo(arrowEndX, arrowEndY);
            context.lineTo(arrowEndX - 15 * Math.cos(angle - 0.5), arrowEndY - 15 * Math.sin(angle - 0.5));
            context.lineTo(arrowEndX - 15 * Math.cos(angle + 0.5), arrowEndY - 15 * Math.sin(angle + 0.5));
            context.closePath();
            context.fillStyle = '#FFD700';
            context.fill();
        }
    }

    renderWeighingProgress(context) {
        const progressBarX = this.scale.displayX;
        const progressBarY = this.scale.displayY + this.scale.displayHeight + 20;
        const progressBarWidth = this.scale.displayWidth;
        const progressBarHeight = 15;

        context.fillStyle = '#333333';
        context.fillRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight);

        const progress = this.measurementState.weighingTimer / this.measurementState.requiredWeighingTime;
        context.fillStyle = '#32CD32';
        context.fillRect(progressBarX, progressBarY, progressBarWidth * Math.min(progress, 1), progressBarHeight);

        context.strokeStyle = '#000000';
        context.lineWidth = 2;
        context.strokeRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight);

        const remainingTime = Math.max(0, (this.measurementState.requiredWeighingTime - this.measurementState.weighingTimer) / 1000);
        context.fillStyle = '#FFFFFF';
        context.font = '12px Microsoft JhengHei';
        context.textAlign = 'center';
        context.fillText(`${remainingTime.toFixed(1)}秒`, progressBarX + progressBarWidth / 2, progressBarY + progressBarHeight + 15);
    }

    handleGameInput(event) {
        const duck = this.duck;

        if (event.type === 'mousedown') {
            const clickedOnDuck = event.x >= duck.x && event.x <= duck.x + duck.width &&
                                  event.y >= duck.y && event.y <= duck.y + duck.height;

            if (this.measurementState.phase === 'drag' && clickedOnDuck) {
                this.dragSystem.isDragging = true;
                duck.dragOffsetX = event.x - duck.x;
                duck.dragOffsetY = event.y - duck.y;
                return true;
            } else if (this.measurementState.phase === 'weighing' && clickedOnDuck) {
                this.resetToCenter();
                this.createFeedbackMessage('很好！', duck.x + duck.width / 2, duck.y - 20, '#32CD32');
                return true;
            }
        } else if (event.type === 'mousemove' && this.dragSystem.isDragging) {
            duck.x = event.x - duck.dragOffsetX;
            duck.y = event.y - duck.dragOffsetY;
            return true;
        } else if (event.type === 'mouseup' && this.dragSystem.isDragging) {
            this.dragSystem.isDragging = false;
            this.dragSystem.initialDragComplete = true;
            return true;
        }

        return false;
    }

    checkCompletion() {
        if (this.measurementState.measurementComplete) {
            this.complete(true);
        }
    }

    calculateAccuracyBonus() {
        return Math.round(this.measurementState.currentScore * 0.2);
    }
}

window.WeightMeasurementGame = WeightMeasurementGame;
