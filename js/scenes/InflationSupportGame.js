/**
 * 充氣支撐迷你遊戲
 * 玩家需要長按充氣並精確拖拽木棍到正確位置
 */
class InflationSupportGame extends MiniGame {
    constructor(config = {}) {
        super({
            name: '充氣支撐遊戲',
            timeLimit: 0, // 無時間限制，計時向上累加
            successThreshold: 0.85, // 需要達到85%完成度
            ...config
        });
        
        // 充氣系統
        this.inflationLevel = 0; // 0-100
        this.targetInflationLevel = 85; // 目標充氣水平
        this.inflationRate = 0.8; // 充氣速度
        this.deflationRate = 0.3; // 洩氣速度
        this.isInflating = false;
        this.inflationPressure = 0; // 當前壓力
        this.maxPressure = 100;
        this.optimalPressureRange = { min: 70, max: 90 };
        this.optimalPressureTime = 0; // 保持在最佳壓力的時間（秒）
        this.requiredOptimalTime = 5; // 需要維持5秒
        
        // 支撐系統
        this.supportStick = {
            x: 0,
            y: 0,
            width: 80,
            height: 8,
            isDragging: false,
            isPlaced: false,
            targetX: 0,
            targetY: 0,
            placementAccuracy: 0 // 0-100
        };
        
        // 鴨胚狀態
        this.duckEmbryo = {
            x: this.gameArea ? this.gameArea.x + this.gameArea.width / 2 - 120 : 300,
            y: this.gameArea ? this.gameArea.y + this.gameArea.height / 2 - 90 : 200,
            width: 240,
            height: 180,
            baseWidth: 240,
            baseHeight: 180,
            inflationExpansion: 0 // 充氣膨脹效果
        };
        
        // 充氣工具
        this.inflationPump = {
            x: this.gameArea ? this.gameArea.x + 50 : 100,
            y: this.gameArea ? this.gameArea.y + this.gameArea.height - 120 : 400,
            width: 60,
            height: 80,
            isActive: false,
            pumpAnimation: 0
        };
        
        // 視覺效果
        this.airParticles = [];
        this.pressureIndicator = {
            x: this.gameArea ? this.gameArea.x + this.gameArea.width - 150 : 600,
            y: this.gameArea ? this.gameArea.y + 50 : 100,
            width: 120,
            height: 20
        };
        
        // 遊戲階段
        this.gamePhase = 'inflation'; // inflation, support_placement
        this.inflationCompleted = false;
        this.supportCompleted = false;
        this.stickPlaced = false;
        this.shouldRender = true; // 控制是否渲染
        this.overInflationWarned = false; // 過度充氣警告標記
        
        // 設置支撐木棍的目標位置
        this.setupSupportTarget();
    }

    /**
     * 設置支撐木棍目標位置
     */
    setupSupportTarget() {
        // 目標位置在鴨胚胸腔內部
        this.supportStick.targetX = this.duckEmbryo.x + this.duckEmbryo.width * 0.3;
        this.supportStick.targetY = this.duckEmbryo.y + this.duckEmbryo.height * 0.6;
        
        // 初始位置在工具區
        this.supportStick.x = this.gameArea ? this.gameArea.x + 150 : 200;
        this.supportStick.y = this.gameArea ? this.gameArea.y + this.gameArea.height - 100 : 420;
    }

    /**
     * 設置遊戲
     */
    setupGame() {
        this.loadAssets();
        
        // 重置狀態
        this.inflationLevel = 0;
        this.inflationPressure = 0;
        this.isInflating = false;
        this.gamePhase = 'inflation';
        this.inflationCompleted = false;
        this.supportCompleted = false;
        this.stickPlaced = false;
        this.optimalPressureTime = 0;
        this.overInflationWarned = false;
        this.supportStick.isPlaced = false;
        this.supportStick.isDragging = false;
        this.airParticles = [];
        
        this.updateProgress(0);
    }

    /**
     * 載入資源
     */
    loadAssets() {
        if (this.gameEngine && this.gameEngine.assetManager) {
            const assetManager = this.gameEngine.assetManager;
            this.duckImage = assetManager.getAsset('before_inflation_duck');
            this.pumpImage = assetManager.getAsset('inflation_pump');
            this.stickImage = assetManager.getAsset('support_stick');
        }
    }

    /**
     * 獲取遊戲說明
     */
    getInstructions() {
        if (this.gamePhase === 'inflation') {
            return '長按充氣泵為鴨胚充氣，保持適當壓力避免破皮';
        } else {
            return '拖拽木棍到鴨胚胸腔內正確位置進行支撐';
        }
    }

    /**
     * 創建UI
     */
    createUI() {
        super.createUI();
        
        if (!this.gameEngine || !this.gameEngine.uiManager) return;
        
        const uiManager = this.gameEngine.uiManager;
        
        // 創建階段指示器
        this.phaseIndicator = uiManager.createLabel({
            x: this.gameArea.x + 20,
            y: this.gameArea.y + 20,
            text: '階段: 充氣',
            fontSize: 16,
            color: '#4169E1',
            align: 'left'
        });
        
        // 創建壓力指示器標籤
        this.pressureLabel = uiManager.createLabel({
            x: this.pressureIndicator.x,
            y: this.pressureIndicator.y - 25,
            text: '充氣壓力',
            fontSize: 14,
            color: '#654321',
            align: 'left'
        });
        
        // 創建充氣水平標籤
        this.inflationLabel = uiManager.createLabel({
            x: this.gameArea.x + 20,
            y: this.gameArea.y + 50,
            text: `充氣水平: ${Math.round(this.inflationLevel)}%`,
            fontSize: 14,
            color: '#32CD32',
            align: 'left'
        });
        
        // 創建支撐精確度標籤
        this.accuracyLabel = uiManager.createLabel({
            x: this.gameArea.x + 20,
            y: this.gameArea.y + 80,
            text: `支撐精確度: ${Math.round(this.supportStick.placementAccuracy)}%`,
            fontSize: 14,
            color: '#FF8C00',
            align: 'left'
        });

        // 創建最佳壓力計時器標籤
        this.optimalTimeLabel = uiManager.createLabel({
            x: this.gameArea.x + 20,
            y: this.gameArea.y + 110,
            text: `最佳壓力時間: 0.0 / 5.0秒`,
            fontSize: 14,
            color: '#4169E1',
            align: 'left'
        });

        this.uiElements.push(
            this.phaseIndicator,
            this.pressureLabel,
            this.inflationLabel,
            this.accuracyLabel,
            this.optimalTimeLabel
        );
    }

    /**
     * 更新遊戲邏輯
     */
    updateGame(deltaTime) {
        // 更新充氣系統
        this.updateInflationSystem(deltaTime);
        
        // 更新支撐系統
        this.updateSupportSystem(deltaTime);
        
        // 更新視覺效果
        this.updateVisualEffects(deltaTime);
        
        // 更新UI標籤
        this.updateUILabels();
        
        // 檢查遊戲階段轉換
        this.checkPhaseTransition();
        
        // 更新總進度
        this.updateTotalProgress();
        
        // 檢查遊戲完成條件
        this.checkCompletion();
    }

    /**
     * 更新充氣系統
     */
    updateInflationSystem(deltaTime) {
        if (this.gamePhase !== 'inflation' && !this.isInflating) return;

        if (this.isInflating) {
            // 充氣中
            this.inflationPressure += this.inflationRate * deltaTime / 16;
            this.inflationPressure = Math.min(this.inflationPressure, this.maxPressure);

            // 根據壓力增加充氣水平
            if (this.inflationPressure >= this.optimalPressureRange.min) {
                this.inflationLevel += (this.inflationRate * 0.8) * deltaTime / 16;
            }

            // 創建空氣粒子效果
            if (Math.random() < 0.3) {
                this.createAirParticle();
            }

            // 更新充氣泵動畫
            this.inflationPump.pumpAnimation += deltaTime * 0.01;
            this.inflationPump.isActive = true;

        } else {
            // 自然洩氣
            this.inflationPressure -= this.deflationRate * deltaTime / 16;
            this.inflationPressure = Math.max(0, this.inflationPressure);

            this.inflationPump.isActive = false;
            this.inflationPump.pumpAnimation = 0;
        }

        // 限制充氣水平
        this.inflationLevel = Math.min(this.inflationLevel, 100);

        // 計算膨脹效果
        this.duckEmbryo.inflationExpansion = (this.inflationLevel / 100) * 20;

        // 檢查壓力是否在最佳範圍內
        if (this.inflationPressure >= this.optimalPressureRange.min &&
            this.inflationPressure <= this.optimalPressureRange.max &&
            !this.inflationCompleted) {
            // 在最佳範圍內，累積時間
            this.optimalPressureTime += deltaTime / 1000;
        } else if (!this.inflationCompleted) {
            // 不在最佳範圍內，重置計時
            this.optimalPressureTime = 0;
        }

        // 檢查過度充氣
        if (this.inflationLevel > 95) {
            this.handleOverInflation();
        }
    }

    /**
     * 更新支撐系統
     */
    updateSupportSystem(deltaTime) {
        if (this.gamePhase !== 'support_placement') return;

        // 計算支撐木棍的放置精確度（無論是否正在拖拽）
        const distance = Math.sqrt(
            Math.pow(this.supportStick.x - this.supportStick.targetX, 2) +
            Math.pow(this.supportStick.y - this.supportStick.targetY, 2)
        );

        const maxDistance = 50; // 最大允許距離
        this.supportStick.placementAccuracy = Math.max(0,
            100 - (distance / maxDistance) * 100
        );
    }

    /**
     * 更新視覺效果
     */
    updateVisualEffects(deltaTime) {
        // 更新空氣粒子
        for (let i = this.airParticles.length - 1; i >= 0; i--) {
            const particle = this.airParticles[i];
            
            particle.x += particle.vx * deltaTime / 16;
            particle.y += particle.vy * deltaTime / 16;
            particle.life -= deltaTime / 16;
            particle.alpha = Math.max(0, particle.life / particle.maxLife);
            particle.size *= 1.01; // 粒子逐漸變大
            
            if (particle.life <= 0) {
                this.airParticles.splice(i, 1);
            }
        }
    }

    /**
     * 更新UI標籤
     */
    updateUILabels() {
        if (this.phaseIndicator) {
            const phaseText = this.gamePhase === 'inflation' ? '充氣' : '支撐放置';
            this.phaseIndicator.setText(`階段: ${phaseText}`);
        }

        if (this.inflationLabel) {
            this.inflationLabel.setText(`充氣水平: ${Math.round(this.inflationLevel)}%`);
        }

        if (this.accuracyLabel) {
            this.accuracyLabel.setText(`支撐精確度: ${Math.round(this.supportStick.placementAccuracy)}%`);
        }

        if (this.optimalTimeLabel) {
            const timeText = this.optimalPressureTime.toFixed(1);
            const requiredText = this.requiredOptimalTime.toFixed(1);
            const isOptimal = this.inflationPressure >= this.optimalPressureRange.min &&
                             this.inflationPressure <= this.optimalPressureRange.max;

            if (this.gamePhase === 'inflation') {
                this.optimalTimeLabel.setText(`最佳壓力時間: ${timeText} / ${requiredText}秒`);
                this.optimalTimeLabel.setColor(isOptimal ? '#32CD32' : '#FF6347');
                this.optimalTimeLabel.setVisible(true);
            } else {
                this.optimalTimeLabel.setVisible(false);
            }
        }
    }

    /**
     * 檢查階段轉換
     */
    checkPhaseTransition() {
        // 檢查是否在最佳壓力範圍內維持了足夠時間
        if (this.gamePhase === 'inflation' &&
            this.optimalPressureTime >= this.requiredOptimalTime &&
            !this.inflationCompleted) {

            this.inflationCompleted = true;
            this.gamePhase = 'support_placement';

            // 更新說明
            if (this.instructions) {
                this.instructions.setText(this.getInstructions());
            }

            // 顯示階段完成提示
            if (this.gameEngine && this.gameEngine.uiManager) {
                const phaseCompleteLabel = this.gameEngine.uiManager.createLabel({
                    x: this.gameArea.x + this.gameArea.width / 2,
                    y: this.gameArea.y + 50,
                    text: '✓ 充氣完成！現在拖拽木棍到目標位置',
                    fontSize: 18,
                    color: '#32CD32',
                    align: 'center'
                });

                setTimeout(() => {
                    this.gameEngine.uiManager.removeUIElement(phaseCompleteLabel);
                }, 3000);
            }

            console.log('充氣完成，進入支撐放置階段');
        }
    }

    /**
     * 更新總進度
     */
    updateTotalProgress() {
        let totalProgress = 0;

        // 充氣進度 (70%) - 基於維持最佳壓力的時間
        if (this.inflationCompleted) {
            totalProgress += 0.7; // 充氣完成貢獻70%
        } else {
            // 根據維持時間計算進度
            const inflationProgress = Math.min(this.optimalPressureTime / this.requiredOptimalTime, 1) * 0.7;
            totalProgress += inflationProgress;
        }

        // 支撐進度 (30%) - 只要放置就貢獻30%，不管精確度
        if (this.stickPlaced || this.supportCompleted) {
            totalProgress += 0.3;
        }

        const oldProgress = this.progress;
        this.updateProgress(totalProgress);

        // 只在進度變化時記錄
        if (Math.abs(oldProgress - this.progress) > 0.01) {
            console.log(`進度更新: ${(this.progress * 100).toFixed(1)}% (充氣完成: ${this.inflationCompleted}, 木棍放置: ${this.stickPlaced})`);
        }

        // 通知場景更新充氣進度
        if (this.config.onProgressUpdate) {
            this.config.onProgressUpdate(this.inflationLevel);
        }
    }

    /**
     * 創建空氣粒子
     */
    createAirParticle() {
        const pump = this.inflationPump;
        
        this.airParticles.push({
            x: pump.x + pump.width / 2,
            y: pump.y,
            vx: (Math.random() - 0.5) * 2,
            vy: -2 - Math.random() * 2,
            size: 3 + Math.random() * 4,
            color: '#87CEEB',
            life: 60,
            maxLife: 60,
            alpha: 0.8
        });
    }

    /**
     * 處理過度充氣
     */
    handleOverInflation() {
        // 只在第一次觸發警告時執行
        if (!this.overInflationWarned) {
            this.overInflationWarned = true;

            // 減少分數並顯示警告
            this.stats.score = Math.max(0, this.stats.score - 5);

            if (this.gameEngine && this.gameEngine.uiManager) {
                const warningLabel = this.gameEngine.uiManager.createLabel({
                    x: this.gameArea.x + this.gameArea.width / 2,
                    y: this.gameArea.y + 100,
                    text: '⚠️ 充氣過度！小心破皮！',
                    fontSize: 16,
                    color: '#FF4500',
                    align: 'center'
                });

                setTimeout(() => {
                    this.gameEngine.uiManager.removeUIElement(warningLabel);
                }, 2000);
            }

            // 強制停止充氣
            this.isInflating = false;

            // 3秒後重置警告標記，允許再次顯示
            setTimeout(() => {
                this.overInflationWarned = false;
            }, 3000);
        }
    }

    /**
     * 渲染遊戲內容
     */
    renderGame(context) {
        // 如果不應該渲染，直接返回
        if (!this.shouldRender) return;

        // 渲染鴨胚
        this.renderDuckEmbryo(context);
        
        // 渲染充氣泵
        this.renderInflationPump(context);
        
        // 渲染支撐木棍
        this.renderSupportStick(context);
        
        // 渲染壓力指示器
        this.renderPressureIndicator(context);
        
        // 渲染空氣粒子
        this.renderAirParticles(context);
        
        // 渲染目標位置指示
        this.renderTargetIndicator(context);
        
        // 渲染充氣效果
        this.renderInflationEffects(context);
    }

    /**
     * 渲染鴨胚
     */
    renderDuckEmbryo(context) {
        const duck = this.duckEmbryo;
        const expansion = duck.inflationExpansion;
        
        // 計算膨脹後的尺寸
        const currentWidth = duck.baseWidth + expansion;
        const currentHeight = duck.baseHeight + expansion * 0.6;
        const offsetX = expansion / 2;
        const offsetY = expansion * 0.3;
        
        if (this.duckImage) {
            context.drawImage(
                this.duckImage,
                duck.x - offsetX,
                duck.y - offsetY,
                currentWidth,
                currentHeight
            );
        } else {
            // 繪製佔位符
            context.fillStyle = '#F5DEB3';
            context.fillRect(duck.x - offsetX, duck.y - offsetY, currentWidth, currentHeight);
            
            context.strokeStyle = '#8B4513';
            context.lineWidth = 2;
            context.strokeRect(duck.x - offsetX, duck.y - offsetY, currentWidth, currentHeight);
        }
        
        // 繪製充氣膨脹效果
        if (expansion > 0) {
            context.save();
            context.globalAlpha = 0.3;
            context.strokeStyle = '#87CEEB';
            context.lineWidth = 3;
            context.strokeRect(
                duck.x - offsetX - 5,
                duck.y - offsetY - 5,
                currentWidth + 10,
                currentHeight + 10
            );
            context.restore();
        }
    }

    /**
     * 渲染充氣泵
     */
    renderInflationPump(context) {
        const pump = this.inflationPump;
        
        // 繪製充氣泵主體
        if (this.pumpImage) {
            // 根據動畫狀態調整位置
            const animationOffset = pump.isActive ? Math.sin(pump.pumpAnimation) * 3 : 0;
            context.drawImage(
                this.pumpImage,
                pump.x,
                pump.y + animationOffset,
                pump.width,
                pump.height
            );
        } else {
            // 繪製佔位符
            context.fillStyle = pump.isActive ? '#4169E1' : '#6495ED';
            context.fillRect(pump.x, pump.y, pump.width, pump.height);
            
            context.strokeStyle = '#191970';
            context.lineWidth = 2;
            context.strokeRect(pump.x, pump.y, pump.width, pump.height);
            
            // 繪製泵柄
            const handleY = pump.y + (pump.isActive ? Math.sin(pump.pumpAnimation) * 5 : 0);
            context.fillStyle = '#8B4513';
            context.fillRect(pump.x + 20, handleY - 10, 20, 15);
        }
        
        // 繪製充氣管道
        if (pump.isActive) {
            context.strokeStyle = '#4169E1';
            context.lineWidth = 3;
            context.setLineDash([5, 5]);
            context.beginPath();
            context.moveTo(pump.x + pump.width, pump.y + pump.height / 2);
            context.lineTo(this.duckEmbryo.x, this.duckEmbryo.y + this.duckEmbryo.height / 2);
            context.stroke();
            context.setLineDash([]);
        }
        
        // 繪製操作提示
        context.fillStyle = '#654321';
        context.font = '12px Microsoft JhengHei';
        context.textAlign = 'center';
        context.fillText('長按充氣', pump.x + pump.width / 2, pump.y + pump.height + 20);
    }

    /**
     * 渲染支撐木棍
     */
    renderSupportStick(context) {
        const stick = this.supportStick;

        // 只在支撐放置階段顯示木棍
        if (this.gamePhase !== 'support_placement') return;

        // 設置顏色
        let stickColor = '#8B4513';
        if (stick.isDragging) {
            stickColor = '#FF8C00';
        } else if (stick.isPlaced) {
            stickColor = '#32CD32';
        }

        // 繪製高亮效果（如果未放置）
        if (!stick.isPlaced && !stick.isDragging) {
            const pulse = Math.sin(Date.now() * 0.003) * 0.3 + 0.7;
            context.save();
            context.globalAlpha = pulse;
            context.strokeStyle = '#FFD700';
            context.lineWidth = 4;
            context.strokeRect(stick.x - 2, stick.y - 2, stick.width + 4, stick.height + 4);
            context.restore();
        }

        if (this.stickImage) {
            context.save();
            context.translate(stick.x + stick.width / 2, stick.y + stick.height / 2);
            context.rotate(Math.PI / 2);
            context.drawImage(
                this.stickImage,
                -stick.height / 2,
                -stick.width / 2,
                stick.height,
                stick.width
            );
            context.restore();
        } else {
            // 繪製佔位符
            context.fillStyle = stickColor;
            context.fillRect(stick.x, stick.y, stick.width, stick.height);

            context.strokeStyle = '#654321';
            context.lineWidth = 2;
            context.strokeRect(stick.x, stick.y, stick.width, stick.height);
        }

        // 繪製拖拽提示（更明顯）
        if (!stick.isPlaced) {
            context.fillStyle = '#FF4500';
            context.font = 'bold 14px Microsoft JhengHei';
            context.textAlign = 'center';
            context.fillText(
                '👆 拖拽到目標位置',
                stick.x + stick.width / 2,
                stick.y - 10
            );
        }
    }

    /**
     * 渲染壓力指示器
     */
    renderPressureIndicator(context) {
        const indicator = this.pressureIndicator;
        
        // 繪製背景
        context.fillStyle = '#E0E0E0';
        context.fillRect(indicator.x, indicator.y, indicator.width, indicator.height);
        
        context.strokeStyle = '#666666';
        context.lineWidth = 1;
        context.strokeRect(indicator.x, indicator.y, indicator.width, indicator.height);
        
        // 繪製壓力條
        const pressureWidth = (this.inflationPressure / this.maxPressure) * indicator.width;
        
        // 根據壓力範圍設置顏色
        let pressureColor = '#32CD32'; // 綠色 - 正常
        if (this.inflationPressure < this.optimalPressureRange.min) {
            pressureColor = '#FFD700'; // 黃色 - 壓力不足
        } else if (this.inflationPressure > this.optimalPressureRange.max) {
            pressureColor = '#FF4500'; // 紅色 - 壓力過高
        }
        
        context.fillStyle = pressureColor;
        context.fillRect(indicator.x, indicator.y, pressureWidth, indicator.height);
        
        // 繪製最佳壓力範圍標記
        const minX = indicator.x + (this.optimalPressureRange.min / this.maxPressure) * indicator.width;
        const maxX = indicator.x + (this.optimalPressureRange.max / this.maxPressure) * indicator.width;
        
        context.strokeStyle = '#228B22';
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(minX, indicator.y - 5);
        context.lineTo(minX, indicator.y + indicator.height + 5);
        context.moveTo(maxX, indicator.y - 5);
        context.lineTo(maxX, indicator.y + indicator.height + 5);
        context.stroke();
        
        // 繪製壓力數值
        context.fillStyle = '#654321';
        context.font = '12px Microsoft JhengHei';
        context.textAlign = 'center';
        context.fillText(
            `${Math.round(this.inflationPressure)}%`,
            indicator.x + indicator.width / 2,
            indicator.y + indicator.height + 15
        );
    }

    /**
     * 渲染空氣粒子
     */
    renderAirParticles(context) {
        this.airParticles.forEach(particle => {
            context.save();
            context.globalAlpha = particle.alpha;
            context.fillStyle = particle.color;
            
            context.beginPath();
            context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            context.fill();
            
            context.restore();
        });
    }

    /**
     * 渲染目標位置指示
     */
    renderTargetIndicator(context) {
        if (this.gamePhase !== 'support_placement' || this.supportStick.isPlaced) return;

        const target = this.supportStick;

        // 繪製目標位置（動畫效果）
        const pulse = Math.sin(Date.now() * 0.005) * 0.2 + 0.8;
        context.save();
        context.globalAlpha = pulse;
        context.strokeStyle = '#32CD32';
        context.lineWidth = 4;
        context.setLineDash([10, 5]);

        // 繪製目標框
        context.strokeRect(
            target.targetX - 5,
            target.targetY - 5,
            target.width + 10,
            target.height + 10
        );

        // 繪製內部填充（半透明）
        context.fillStyle = 'rgba(50, 205, 50, 0.2)';
        context.fillRect(
            target.targetX - 5,
            target.targetY - 5,
            target.width + 10,
            target.height + 10
        );

        context.setLineDash([]);
        context.restore();

        // 繪製目標標籤（更明顯）
        context.fillStyle = '#32CD32';
        context.font = 'bold 16px Microsoft JhengHei';
        context.textAlign = 'center';
        context.fillText(
            '🎯 目標位置',
            target.targetX + target.width / 2,
            target.targetY - 15
        );

        // 繪製箭頭指示
        context.strokeStyle = '#32CD32';
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(target.targetX + target.width / 2, target.targetY - 25);
        context.lineTo(target.targetX + target.width / 2 - 5, target.targetY - 15);
        context.moveTo(target.targetX + target.width / 2, target.targetY - 25);
        context.lineTo(target.targetX + target.width / 2 + 5, target.targetY - 15);
        context.stroke();
    }

    /**
     * 渲染充氣效果
     */
    renderInflationEffects(context) {
        if (this.inflationLevel <= 0) return;
        
        const duck = this.duckEmbryo;
        const time = Date.now() * 0.003;
        
        // 繪製充氣波紋效果
        for (let i = 0; i < 3; i++) {
            const radius = 20 + i * 15 + Math.sin(time + i) * 5;
            const alpha = (this.inflationLevel / 100) * (0.3 - i * 0.1);
            
            context.save();
            context.globalAlpha = alpha;
            context.strokeStyle = '#87CEEB';
            context.lineWidth = 2;
            context.beginPath();
            context.arc(
                duck.x + duck.width / 2,
                duck.y + duck.height / 2,
                radius,
                0,
                Math.PI * 2
            );
            context.stroke();
            context.restore();
        }
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
        // 檢查充氣泵
        const pump = this.inflationPump;
        if (this.gamePhase === 'inflation' &&
            x >= pump.x && x <= pump.x + pump.width &&
            y >= pump.y && y <= pump.y + pump.height) {
            
            this.isInflating = true;
            return true;
        }
        
        // 檢查支撐木棍
        const stick = this.supportStick;
        if (this.gamePhase === 'support_placement' &&
            x >= stick.x && x <= stick.x + stick.width &&
            y >= stick.y && y <= stick.y + stick.height) {
            
            stick.isDragging = true;
            return true;
        }
        
        return false;
    }

    /**
     * 處理滑鼠釋放
     */
    handleMouseUp(x, y) {
        this.isInflating = false;

        if (this.supportStick.isDragging) {
            this.supportStick.isDragging = false;

            if (this.gamePhase === 'support_placement' && !this.stickPlaced) {
                this.stickPlaced = true;
                console.log('木棍已放置，標記為完成');
            }

            return true;
        }

        return false;
    }

    /**
     * 處理滑鼠移動
     */
    handleMouseMove(x, y) {
        if (this.supportStick.isDragging) {
            this.supportStick.x = x - this.supportStick.width / 2;
            this.supportStick.y = y - this.supportStick.height / 2;
            return true;
        }
        
        return false;
    }

    /**
     * 計算準確度獎勵
     */
    calculateAccuracyBonus() {
        let bonus = 0;

        // 充氣精確度獎勵
        const inflationAccuracy = Math.max(0, 100 - Math.abs(this.inflationLevel - this.targetInflationLevel));
        bonus += Math.round(inflationAccuracy * 0.3);

        // 支撐放置精確度獎勵
        bonus += Math.round(this.supportStick.placementAccuracy * 0.4);

        // 時間獎勵
        const gameTime = this.stats.endTime - this.stats.startTime;
        if (gameTime < 60000) { // 60秒內完成
            bonus += 30;
        } else if (gameTime < 75000) { // 75秒內完成
            bonus += 15;
        }

        return bonus;
    }

    /**
     * 檢查遊戲完成條件
     */
    checkCompletion() {
        // 當充氣完成且木棍已放置時，自動完成遊戲
        if (this.inflationCompleted && this.stickPlaced && !this.isCompleted) {
            console.log('遊戲條件達成，直接啟動下一個遊戲');
            console.log(`充氣完成: ${this.inflationCompleted}, 木棍放置: ${this.stickPlaced}, 進度: ${this.progress}`);

            this.supportCompleted = true;
            this.isCompleted = true;

            console.log(`充氣支撐遊戲完成！充氣水平: ${this.inflationLevel.toFixed(1)}%, 支撐精確度: ${this.supportStick.placementAccuracy.toFixed(1)}%`);

            if (this.gameEngine && this.gameEngine.gameState && this.gameEngine.gameState.settings.soundEnabled) {
                this.gameEngine.audioManager.playSound('success_sound');
            }

            // 延遲1秒後啟動下一個遊戲
            setTimeout(() => {
                this.startNextGame();
            }, 1000);
        }
    }

    /**
     * 啟動下一個遊戲（燙皮上糖色）
     */
    startNextGame() {
        console.log('啟動燙皮上糖色遊戲，覆蓋當前遊戲');

        // 停止渲染當前遊戲
        this.shouldRender = false;
        this.isActive = false;

        // 如果有場景引用，通知場景更新進度
        if (this.config.scene) {
            const scene = this.config.scene;

            // 標記當前步驟完成
            scene.gameEngine.progressManager.completeStep('inflation_support');

            // 創建並啟動燙皮上糖色遊戲
            const coloringGame = new window.ScaldingColoringGame({
                gameEngine: this.gameEngine,
                scene: scene,
                gameAreaX: 50,
                gameAreaY: 100,
                gameAreaWidth: 700,
                gameAreaHeight: 400,
                duckDisplay: this.config.duckDisplay,
                onProgressUpdate: (coloringLevel) => {
                    if (scene.updateColoringProgress) {
                        scene.updateColoringProgress(coloringLevel);
                    }
                }
            });

            // 替換當前遊戲
            scene.currentMiniGame = coloringGame;
            coloringGame.start();

            // 設置完成回調
            coloringGame.onComplete = (success, stats) => {
                scene.onMiniGameComplete(success, stats);
            };

            // 清理當前遊戲的UI但保持場景活躍
            this.hideControls();
        }
    }

    /**
     * 隱藏控制按鈕
     */
    hideControls() {
        // 隱藏返回按鈕
        if (this.backButton) {
            this.backButton.visible = false;
        }
        // 隱藏跳過按鈕
        if (this.skipButton) {
            this.skipButton.visible = false;
        }
    }
}
// 匯出到全域作用域
window.InflationSupportGame = InflationSupportGame;
