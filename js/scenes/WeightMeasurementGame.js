/**
 * 重量測量迷你遊戲
 * 玩家需要拖拽鴨子到秤上進行重量測量
 */
class WeightMeasurementGame extends MiniGame {
    constructor(config = {}) {
        super({
            name: '重量測量',
            timeLimit: 45000, // 45秒時間限制
            successThreshold: 1.0, // 需要完成測量
            ...config
        });
        
        // 鴨子物件
        this.duck = {
            x: 150,
            y: 250,
            width: 80,
            height: 60,
            isDragging: false,
            dragOffsetX: 0,
            dragOffsetY: 0,
            onScale: false,
            targetWeight: 3.2 // 目標重量（公斤）
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
        
        // 拖拽系統
        this.dragSystem = {
            isDragging: false,
            dragTarget: null,
            lastMouseX: 0,
            lastMouseY: 0
        };
        
        // 物理模擬
        this.physics = {
            gravity: 0.5,
            friction: 0.95,
            velocityX: 0,
            velocityY: 0
        };
        
        // 測量狀態
        this.measurementState = {
            isWeighing: false,
            weightStable: false,
            stabilityTimer: 0,
            requiredStabilityTime: 2000, // 需要穩定2秒
            measurementComplete: false
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
        // 重置鴨子位置
        this.duck.x = 150;
        this.duck.y = 250;
        this.duck.isDragging = false;
        this.duck.onScale = false;
        
        // 重置秤的狀態
        this.scale.currentWeight = 0;
        this.scale.isActive = false;
        
        // 重置測量狀態
        this.measurementState.isWeighing = false;
        this.measurementState.weightStable = false;
        this.measurementState.stabilityTimer = 0;
        this.measurementState.measurementComplete = false;
        
        // 重置拖拽系統
        this.dragSystem.isDragging = false;
        this.dragSystem.dragTarget = null;
        
        // 重置物理
        this.physics.velocityX = 0;
        this.physics.velocityY = 0;
        
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
        if (this.measurementState.measurementComplete) {
            return '測量完成！鴨子重量符合標準';
        } else if (this.measurementState.isWeighing) {
            return '保持鴨子在秤上穩定，等待測量完成...';
        } else {
            return '拖拽鴨子到秤上進行重量測量';
        }
    }

    /**
     * 更新遊戲邏輯
     */
    updateGame(deltaTime) {
        // 更新物理模擬
        this.updatePhysics(deltaTime);
        
        // 更新測量邏輯
        this.updateMeasurement(deltaTime);
        
        // 更新視覺效果
        this.updateVisualEffects(deltaTime);
        
        // 檢查鴨子是否在秤上
        this.checkDuckOnScale();
        
        // 更新進度
        if (this.measurementState.measurementComplete) {
            this.updateProgress(1.0);
        } else if (this.measurementState.isWeighing) {
            this.updateProgress(this.measurementState.stabilityTimer / this.measurementState.requiredStabilityTime);
        } else {
            this.updateProgress(0);
        }
        
        // 更新說明文字
        if (this.instructions) {
            this.instructions.setText(this.getInstructions());
        }
    }

    /**
     * 更新物理模擬
     */
    updatePhysics(deltaTime) {
        if (!this.duck.isDragging && !this.duck.onScale) {
            // 應用重力
            this.physics.velocityY += this.physics.gravity;
            
            // 更新位置
            this.duck.x += this.physics.velocityX;
            this.duck.y += this.physics.velocityY;
            
            // 應用摩擦力
            this.physics.velocityX *= this.physics.friction;
            this.physics.velocityY *= this.physics.friction;
            
            // 邊界檢查
            const area = this.gameArea;
            if (this.duck.x < area.x) {
                this.duck.x = area.x;
                this.physics.velocityX = 0;
            }
            if (this.duck.x + this.duck.width > area.x + area.width) {
                this.duck.x = area.x + area.width - this.duck.width;
                this.physics.velocityX = 0;
            }
            if (this.duck.y + this.duck.height > area.y + area.height) {
                this.duck.y = area.y + area.height - this.duck.height;
                this.physics.velocityY = 0;
            }
        }
    }

    /**
     * 更新測量邏輯
     */
    updateMeasurement(deltaTime) {
        if (this.duck.onScale && !this.measurementState.measurementComplete) {
            if (!this.measurementState.isWeighing) {
                // 開始測量
                this.measurementState.isWeighing = true;
                this.scale.isActive = true;
                this.scale.currentWeight = this.duck.targetWeight + (Math.random() - 0.5) * 0.2; // 添加小幅波動
            }
            
            // 檢查穩定性
            if (this.measurementState.isWeighing) {
                this.measurementState.stabilityTimer += deltaTime;
                
                // 添加重量波動效果
                this.scale.currentWeight = this.duck.targetWeight + Math.sin(Date.now() * 0.01) * 0.05;
                
                if (this.measurementState.stabilityTimer >= this.measurementState.requiredStabilityTime) {
                    this.completeMeasurement();
                }
            }
        } else if (this.measurementState.isWeighing && !this.duck.onScale) {
            // 鴨子離開秤，重置測量
            this.resetMeasurement();
        }
        
        // 更新反饋消息
        this.feedbackMessages = this.feedbackMessages.filter(msg => {
            msg.life -= deltaTime;
            msg.y -= deltaTime * 0.02;
            msg.alpha = Math.max(0, msg.life / msg.maxLife);
            return msg.life > 0;
        });
    }

    /**
     * 更新視覺效果
     */
    updateVisualEffects(deltaTime) {
        // 更新粒子效果
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx * deltaTime * 0.1;
            particle.y += particle.vy * deltaTime * 0.1;
            particle.life -= deltaTime;
            particle.alpha = Math.max(0, particle.life / particle.maxLife);
            return particle.life > 0;
        });
    }

    /**
     * 檢查鴨子是否在秤上
     */
    checkDuckOnScale() {
        const duckCenterX = this.duck.x + this.duck.width / 2;
        const duckCenterY = this.duck.y + this.duck.height / 2;
        
        const scaleLeft = this.scale.x;
        const scaleRight = this.scale.x + this.scale.width;
        const scaleTop = this.scale.plateY;
        const scaleBottom = this.scale.plateY + this.scale.plateHeight;
        
        const wasOnScale = this.duck.onScale;
        this.duck.onScale = duckCenterX >= scaleLeft && duckCenterX <= scaleRight &&
                           duckCenterY >= scaleTop && duckCenterY <= scaleBottom;
        
        // 如果剛放到秤上，創建粒子效果
        if (this.duck.onScale && !wasOnScale) {
            this.createPlacementEffect();
        }
    }

    /**
     * 創建放置效果
     */
    createPlacementEffect() {
        const centerX = this.duck.x + this.duck.width / 2;
        const centerY = this.duck.y + this.duck.height / 2;
        
        // 創建粒子
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: centerX,
                y: centerY,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                life: 1000,
                maxLife: 1000,
                alpha: 1,
                color: '#FFD700'
            });
        }
        
        // 播放音效
        if (this.gameEngine && this.gameEngine.gameState.settings.soundEnabled) {
            this.gameEngine.audioManager.playSound('place_on_scale');
        }
    }

    /**
     * 完成測量
     */
    completeMeasurement() {
        this.measurementState.measurementComplete = true;
        this.measurementState.weightStable = true;
        
        // 創建完成消息
        const weight = this.scale.currentWeight.toFixed(1);
        this.createFeedbackMessage(
            `測量完成！重量: ${weight}公斤`,
            this.scale.displayX + this.scale.displayWidth / 2,
            this.scale.displayY - 20,
            '#32CD32'
        );
        
        // 增加分數
        if (this.gameEngine) {
            this.gameEngine.addScore(50, this.scale.displayX, this.scale.displayY, 'weight_measurement');
        }
        
        console.log(`重量測量完成: ${weight}公斤`);
    }

    /**
     * 重置測量
     */
    resetMeasurement() {
        this.measurementState.isWeighing = false;
        this.measurementState.weightStable = false;
        this.measurementState.stabilityTimer = 0;
        this.scale.isActive = false;
        this.scale.currentWeight = 0;
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
        // 渲染秤
        this.renderScale(context);
        
        // 渲染鴨子
        this.renderDuck(context);
        
        // 渲染粒子效果
        this.renderParticles(context);
        
        // 渲染反饋消息
        this.renderFeedbackMessages(context);
        
        // 渲染拖拽提示
        this.renderDragHints(context);
    }

    /**
     * 渲染秤
     */
    renderScale(context) {
        const scale = this.scale;
        
        // 渲染秤的底座
        context.fillStyle = '#8B4513';
        context.fillRect(scale.x, scale.y + 60, scale.width, 20);
        
        // 渲染秤的支柱
        context.fillStyle = '#A0522D';
        context.fillRect(scale.x + scale.width / 2 - 5, scale.y + 20, 10, 60);
        
        // 渲染秤盤
        const plateColor = scale.isActive ? '#FFD700' : '#CCCCCC';
        context.fillStyle = plateColor;
        context.fillRect(scale.x, scale.plateY, scale.width, scale.plateHeight);
        
        // 渲染秤盤邊框
        context.strokeStyle = '#8B4513';
        context.lineWidth = 2;
        context.strokeRect(scale.x, scale.plateY, scale.width, scale.plateHeight);
        
        // 渲染顯示器
        context.fillStyle = '#2F4F4F';
        context.fillRect(scale.displayX, scale.displayY, scale.displayWidth, scale.displayHeight);
        
        context.strokeStyle = '#000000';
        context.lineWidth = 2;
        context.strokeRect(scale.displayX, scale.displayY, scale.displayWidth, scale.displayHeight);
        
        // 渲染重量顯示
        context.fillStyle = scale.isActive ? '#00FF00' : '#666666';
        context.font = 'bold 16px Microsoft JhengHei';
        context.textAlign = 'center';
        context.fillText(
            scale.isActive ? `${scale.currentWeight.toFixed(1)}kg` : '0.0kg',
            scale.displayX + scale.displayWidth / 2,
            scale.displayY + scale.displayHeight / 2 + 6
        );
        
        // 渲染標籤
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
        
        // 渲染陰影
        if (!duck.isDragging) {
            context.fillStyle = 'rgba(0, 0, 0, 0.2)';
            context.ellipse(
                duck.x + duck.width / 2,
                duck.y + duck.height + 5,
                duck.width / 2,
                10,
                0, 0, Math.PI * 2
            );
            context.fill();
        }
        
        // 渲染鴨子
        if (this.duckImage) {
            // 如果正在拖拽，添加視覺效果
            if (duck.isDragging) {
                context.save();
                context.globalAlpha = 0.8;
                context.shadowColor = '#FFD700';
                context.shadowBlur = 10;
            }
            
            context.drawImage(this.duckImage, duck.x, duck.y, duck.width, duck.height);
            
            if (duck.isDragging) {
                context.restore();
            }
        } else {
            // 佔位符
            context.fillStyle = duck.isDragging ? '#FFE4B5' : '#F0F0F0';
            context.fillRect(duck.x, duck.y, duck.width, duck.height);
            
            context.strokeStyle = duck.isDragging ? '#FFD700' : '#CCCCCC';
            context.lineWidth = 2;
            context.strokeRect(duck.x, duck.y, duck.width, duck.height);
            
            context.fillStyle = '#654321';
            context.font = '12px Microsoft JhengHei';
            context.textAlign = 'center';
            context.fillText('鴨子', duck.x + duck.width / 2, duck.y + duck.height / 2);
        }
        
        // 如果在秤上，顯示高亮邊框
        if (duck.onScale) {
            context.strokeStyle = '#32CD32';
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
        if (!this.measurementState.measurementComplete && !this.duck.onScale) {
            // 渲染箭頭指向秤
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
            
            // 渲染箭頭頭部
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
     * 處理遊戲特定輸入
     */
    handleGameInput(event) {
        const duck = this.duck;

        if (event.type === 'mousedown') {
            // 檢查是否點擊了鴨子
            if (event.x >= duck.x && event.x <= duck.x + duck.width &&
                event.y >= duck.y && event.y <= duck.y + duck.height) {

                // 開始拖拽
                duck.isDragging = true;
                duck.dragOffsetX = event.x - duck.x;
                duck.dragOffsetY = event.y - duck.y;

                this.dragSystem.isDragging = true;
                this.dragSystem.dragTarget = duck;
                this.dragSystem.lastMouseX = event.x;
                this.dragSystem.lastMouseY = event.y;

                // 重置物理
                this.physics.velocityX = 0;
                this.physics.velocityY = 0;

                return true;
            }
        } else if (event.type === 'mousemove' && this.dragSystem.isDragging) {
            // 更新拖拽位置
            duck.x = event.x - duck.dragOffsetX;
            duck.y = event.y - duck.dragOffsetY;
            
            // 計算拖拽速度
            this.physics.velocityX = (event.x - this.dragSystem.lastMouseX) * 0.1;
            this.physics.velocityY = (event.y - this.dragSystem.lastMouseY) * 0.1;
            
            this.dragSystem.lastMouseX = event.x;
            this.dragSystem.lastMouseY = event.y;
            
            return true;
        } else if (event.type === 'mouseup' && this.dragSystem.isDragging) {
            // 結束拖拽
            duck.isDragging = false;
            this.dragSystem.isDragging = false;
            this.dragSystem.dragTarget = null;
            
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
        // 基於測量速度計算獎勵
        const totalTime = this.stats.endTime - this.stats.startTime;
        if (totalTime < 20000) return 30; // 20秒內完成
        if (totalTime < 30000) return 20; // 30秒內完成
        if (totalTime < 40000) return 10; // 40秒內完成
        return 0;
    }
}
// 匯出到全域作用域
window.WeightMeasurementGame = WeightMeasurementGame;
