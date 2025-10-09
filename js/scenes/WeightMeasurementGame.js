/**
 * 重量測量迷你遊戲
 * 玩家需要點擊移動的鴨子來防止它逃離秤
 */
class WeightMeasurementGame extends MiniGame {
    constructor(config = {}) {
        super({
            name: '重量測量',
            timeLimit: 0, // 移除時間限制
            successThreshold: 1.0,
            ...config
        });

        // 鴨子物件
        this.duck = {
            x: 0,
            y: 0,
            width: 80,
            height: 60,
            baseX: 0,
            baseY: 0,
            onScale: false,
            targetWeight: 3.2,
            moveSpeed: 2,
            moveDirection: 1,
            moveRange: 60,
            escapeAttempting: false,
            escapeSpeed: 0
        };

        // 秤的配置
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
            isActive: false
        };

        // 測量狀態
        this.measurementState = {
            phase: 'drag', // drag, weighing, complete
            weighingTimer: 0,
            requiredWeighingTime: 5000, // 需要保持5秒
            measurementComplete: false
        };

        // 拖拽系統
        this.dragSystem = {
            isDragging: false,
            initialDragComplete: false
        };

        // 視覺效果
        this.particles = [];
        this.feedbackMessages = [];

        // 圖片資源
        this.duckImage = null;
        this.scaleImage = null;
    }

    /**
     * 設置遊戲
     */
    setupGame() {
        // 設置鴨子初始位置
        this.duck.x = 150;
        this.duck.y = 250;
        this.duck.onScale = false;
        this.duck.escapeAttempting = false;
        this.duck.escapeSpeed = 0;
        this.duck.moveDirection = 1;

        // 計算秤上的基準位置
        this.duck.baseX = this.scale.x + (this.scale.width - this.duck.width) / 2;
        this.duck.baseY = this.scale.plateY - this.duck.height + 5;

        // 重置秤的狀態
        this.scale.currentWeight = 0;
        this.scale.isActive = false;

        // 重置測量狀態
        this.measurementState.phase = 'drag';
        this.measurementState.weighingTimer = 0;
        this.measurementState.measurementComplete = false;

        // 重置拖拽系統
        this.dragSystem.isDragging = false;
        this.dragSystem.initialDragComplete = false;

        // 清空效果
        this.particles = [];
        this.feedbackMessages = [];

        // 載入圖片
        if (this.gameEngine && this.gameEngine.assetManager) {
            this.duckImage = this.gameEngine.assetManager.getAsset('raw_duck');
            this.scaleImage = this.gameEngine.assetManager.getAsset('scale');
        }
    }

    /**
     * 獲取遊戲說明
     */
    getInstructions() {
        if (this.measurementState.phase === 'complete') {
            return '測量完成！鴨子重量符合標準';
        } else if (this.measurementState.phase === 'weighing') {
            return '點擊鴨子防止它逃離秤！保持5秒完成測量';
        } else {
            return '拖拽鴨子到秤上進行重量測量';
        }
    }

    /**
     * 更新遊戲邏輯
     */
    updateGame(deltaTime) {
        if (this.measurementState.phase === 'drag') {
            // 拖拽階段
            this.checkDuckOnScale();
        } else if (this.measurementState.phase === 'weighing') {
            // 測量階段
            this.updateWeighingPhase(deltaTime);
        }

        // 更新視覺效果
        this.updateVisualEffects(deltaTime);

        // 更新進度
        if (this.measurementState.phase === 'weighing') {
            const progress = this.measurementState.weighingTimer / this.measurementState.requiredWeighingTime;
            this.updateProgress(Math.min(1.0, progress));
        } else if (this.measurementState.phase === 'complete') {
            this.updateProgress(1.0);
        } else {
            this.updateProgress(0);
        }

        // 更新說明文字
        if (this.instructions) {
            this.instructions.setText(this.getInstructions());
        }
    }

    /**
     * 更新測量階段
     */
    updateWeighingPhase(deltaTime) {
        if (this.measurementState.measurementComplete) return;

        // 鴨子左右移動
        this.duck.x += this.duck.moveSpeed * this.duck.moveDirection;

        // 檢查移動範圍並反轉方向
        const distanceFromBase = this.duck.x - this.duck.baseX;
        if (Math.abs(distanceFromBase) >= this.duck.moveRange) {
            this.duck.moveDirection *= -1;
            this.duck.x = this.duck.baseX + this.duck.moveRange * Math.sign(distanceFromBase);
        }

        // 隨機觸發逃離嘗試
        if (!this.duck.escapeAttempting && Math.random() < 0.002) {
            this.duck.escapeAttempting = true;
            this.duck.escapeSpeed = 3;
        }

        // 處理逃離行為
        if (this.duck.escapeAttempting) {
            this.duck.y -= this.duck.escapeSpeed;
            this.duck.escapeSpeed += 0.1; // 加速

            // 檢查是否逃離秤
            if (this.duck.y < this.duck.baseY - 50) {
                this.resetToScale();
                this.measurementState.weighingTimer = 0;
                this.createFeedbackMessage('鴨子逃跑了！重新計時', this.scale.displayX, this.scale.displayY - 40, '#FF0000');
                return;
            }
        }

        // 檢查鴨子是否還在秤的範圍內
        const isOnScale = this.checkIfOnScale();
        if (!isOnScale) {
            this.resetToScale();
            this.measurementState.weighingTimer = 0;
            this.createFeedbackMessage('鴨子離開秤了！重新計時', this.scale.displayX, this.scale.displayY - 40, '#FF0000');
            return;
        }

        // 增加測量時間
        this.measurementState.weighingTimer += deltaTime;

        // 更新重量顯示
        this.scale.currentWeight = this.duck.targetWeight + Math.sin(Date.now() * 0.01) * 0.05;

        // 檢查是否完成
        if (this.measurementState.weighingTimer >= this.measurementState.requiredWeighingTime) {
            this.completeMeasurement();
        }
    }

    /**
     * 檢查鴨子是否在秤上
     */
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

    /**
     * 檢查鴨子是否被放到秤上（拖拽階段）
     */
    checkDuckOnScale() {
        if (!this.dragSystem.initialDragComplete) return;

        const isOnScale = this.checkIfOnScale();

        if (isOnScale && !this.duck.onScale) {
            // 剛放到秤上
            this.duck.onScale = true;
            this.startWeighing();
        }
    }

    /**
     * 開始測量
     */
    startWeighing() {
        this.measurementState.phase = 'weighing';
        this.scale.isActive = true;
        this.scale.currentWeight = this.duck.targetWeight;

        // 將鴨子固定到秤上的基準位置
        this.duck.x = this.duck.baseX;
        this.duck.y = this.duck.baseY;

        this.createPlacementEffect();
        this.createFeedbackMessage('開始測量！點擊鴨子防止它逃跑', this.scale.displayX, this.scale.displayY - 40, '#32CD32');
    }

    /**
     * 重置鴨子到秤上
     */
    resetToScale() {
        this.duck.x = this.duck.baseX;
        this.duck.y = this.duck.baseY;
        this.duck.escapeAttempting = false;
        this.duck.escapeSpeed = 0;
        this.duck.moveDirection = 1;
    }

    /**
     * 創建放置效果
     */
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

    /**
     * 完成測量
     */
    completeMeasurement() {
        this.measurementState.phase = 'complete';
        this.measurementState.measurementComplete = true;

        const weight = this.scale.currentWeight.toFixed(1);
        this.createFeedbackMessage(
            `測量完成！重量: ${weight}公斤`,
            this.scale.displayX + this.scale.displayWidth / 2,
            this.scale.displayY - 20,
            '#32CD32'
        );

        if (this.gameEngine) {
            this.gameEngine.addScore(50, this.scale.displayX, this.scale.displayY, 'weight_measurement');
        }

        console.log(`重量測量完成: ${weight}公斤`);
    }

    /**
     * 更新視覺效果
     */
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

    /**
     * 創建反饋消息
     */
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

    /**
     * 渲染遊戲內容
     */
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
        }
    }

    /**
     * 渲染秤
     */
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

    /**
     * 渲染鴨子
     */
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
            if (this.dragSystem.isDragging) {
                context.save();
                context.globalAlpha = 0.8;
                context.shadowColor = '#FFD700';
                context.shadowBlur = 10;
            }

            context.drawImage(this.duckImage, duck.x, duck.y, duck.width, duck.height);

            if (this.dragSystem.isDragging) {
                context.restore();
            }
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

        if (duck.escapeAttempting) {
            context.strokeStyle = '#FF0000';
            context.lineWidth = 3;
            context.strokeRect(duck.x - 2, duck.y - 2, duck.width + 4, duck.height + 4);
        }
    }

    /**
     * 渲染粒子效果
     */
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

    /**
     * 渲染反饋消息
     */
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

    /**
     * 渲染拖拽提示
     */
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

    /**
     * 渲染測量進度
     */
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

    /**
     * 處理遊戲特定輸入
     */
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
                this.resetToScale();
                this.createFeedbackMessage('很好！繼續保持', duck.x + duck.width / 2, duck.y - 20, '#32CD32');
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

    /**
     * 檢查完成條件
     */
    checkCompletion() {
        if (this.measurementState.measurementComplete) {
            this.complete(true);
        }
    }

    /**
     * 計算準確度獎勵
     */
    calculateAccuracyBonus() {
        return 20;
    }
}

window.WeightMeasurementGame = WeightMeasurementGame;
