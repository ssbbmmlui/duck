/**
 * 翻轉時機迷你遊戲
 * 掌握鴨子翻轉的最佳時機，確保均勻烤製
 */
class RotationTimingGame extends MiniGame {
    constructor(config) {
        super(config);
        
        this.name = '翻轉時機遊戲';
        this.gameArea = {
            x: config.gameAreaX || 100,
            y: config.gameAreaY || 140,
            width: config.gameAreaWidth || 600,
            height: config.gameAreaHeight || 320
        };
        
        // 遊戲狀態
        this.gameState = {
            phase: 'waiting',          // waiting, ready, rotating, completed
            currentRotation: 0,        // 當前翻轉次數 0-3
            totalRotations: 3,         // 總需要翻轉次數
            roastingTime: 0,           // 烤製時間（秒）
            lastRotationTime: 0,       // 上次翻轉時間
            accuracy: 100,             // 精確度分數
            isRotating: false,         // 是否正在翻轉
            rotationProgress: 0,       // 翻轉進度 0-1
            timingScore: 100           // 時機掌握分數
        };
        
        // 翻轉時機設定
        this.rotationTimings = [
            {
                name: '第一次翻轉',
                optimalTime: 15,       // 15秒（代表15分鐘）
                tolerance: 3,          // 容差3秒
                description: '皮面金黃時進行第一次翻轉'
            },
            {
                name: '第二次翻轉',
                optimalTime: 35,       // 35秒（代表35分鐘）
                tolerance: 4,
                description: '確保背面均勻受熱'
            },
            {
                name: '第三次翻轉',
                optimalTime: 50,       // 50秒（代表50分鐘）
                tolerance: 3,
                description: '最後調整，完美上色'
            }
        ];
        
        // 鴨子顯示
        this.duckDisplay = {
            x: this.gameArea.x + 250,
            y: this.gameArea.y + 120,
            width: 120,
            height: 80,
            rotation: 0,               // 當前旋轉角度
            targetRotation: 0,         // 目標旋轉角度
            skinColor: [50, 50, 50, 50], // 四面皮色 0-100
            heatLevel: [0, 0, 0, 0],   // 四面受熱程度
            currentSide: 0             // 當前朝上的面 0-3
        };
        
        // 時機指示器
        this.timingIndicator = {
            x: this.gameArea.x + 50,
            y: this.gameArea.y + 50,
            width: 400,
            height: 30,
            zones: []  // 最佳時機區域
        };
        
        // 控制按鈕
        this.rotateButton = {
            x: this.gameArea.x + 480,
            y: this.gameArea.y + 220,
            width: 100,
            height: 50,
            isPressed: false,
            canRotate: false
        };
        
        // 視覺效果
        this.effects = {
            rotationLines: [],         // 旋轉線條
            heatIndicators: [],        // 受熱指示
            timingAlerts: []           // 時機提醒
        };
        
        // UI元素
        this.uiElements = [];
        
        // 初始化時機區域
        this.initializeTimingZones();
        
        console.log('翻轉時機迷你遊戲初始化完成');
    }

    /**
     * 初始化時機區域
     */
    initializeTimingZones() {
        const indicator = this.timingIndicator;
        const totalTime = 60; // 總烤製時間
        
        this.rotationTimings.forEach((timing, index) => {
            const centerX = indicator.x + (timing.optimalTime / totalTime) * indicator.width;
            const zoneWidth = (timing.tolerance * 2 / totalTime) * indicator.width;
            
            indicator.zones.push({
                x: centerX - zoneWidth / 2,
                width: zoneWidth,
                centerX: centerX,
                timing: timing,
                index: index
            });
        });
    }

    /**
     * 開始遊戲
     */
    start() {
        super.start();
        this.setupGameUI();
        this.gameState.phase = 'waiting';
        this.gameState.roastingTime = 0;
        console.log('翻轉時機遊戲開始');
    }

    /**
     * 設置遊戲UI
     */
    setupGameUI() {
        const uiManager = this.gameEngine.uiManager;
        
        // 遊戲標題
        this.titleLabel = uiManager.createLabel({
            x: this.gameArea.x + this.gameArea.width / 2,
            y: this.gameArea.y - 20,
            text: '翻轉時機 - 掌握烤製節奏',
            fontSize: 18,
            color: '#8B4513',
            align: 'center'
        });
        
        // 說明文字
        this.instructionLabel = uiManager.createLabel({
            x: this.gameArea.x + this.gameArea.width / 2,
            y: this.gameArea.y + 10,
            text: '在最佳時機翻轉鴨子，確保四面均勻烤製',
            fontSize: 14,
            color: '#654321',
            align: 'center'
        });
        
        // 烤製時間顯示
        this.timeLabel = uiManager.createLabel({
            x: this.gameArea.x + 50,
            y: this.gameArea.y + 100,
            text: `烤製時間: ${Math.floor(this.gameState.roastingTime)}秒`,
            fontSize: 16,
            color: '#DC143C',
            align: 'left'
        });
        
        // 翻轉次數顯示
        this.rotationLabel = uiManager.createLabel({
            x: this.gameArea.x + 50,
            y: this.gameArea.y + 130,
            text: `翻轉次數: ${this.gameState.currentRotation}/${this.gameState.totalRotations}`,
            fontSize: 16,
            color: '#4682B4',
            align: 'left'
        });
        
        // 當前階段顯示
        this.stageLabel = uiManager.createLabel({
            x: this.gameArea.x + 50,
            y: this.gameArea.y + 160,
            text: this.getCurrentStageText(),
            fontSize: 14,
            color: '#2F4F4F',
            align: 'left'
        });
        
        // 時機分數顯示
        this.timingScoreLabel = uiManager.createLabel({
            x: this.gameArea.x + 50,
            y: this.gameArea.y + 190,
            text: `時機掌握: ${Math.round(this.gameState.timingScore)}%`,
            fontSize: 16,
            color: '#32CD32',
            align: 'left'
        });
        
        this.uiElements.push(
            this.titleLabel,
            this.instructionLabel,
            this.timeLabel,
            this.rotationLabel,
            this.stageLabel,
            this.timingScoreLabel
        );
    }

    /**
     * 獲取當前階段文字
     */
    getCurrentStageText() {
        if (this.gameState.currentRotation >= this.gameState.totalRotations) {
            return '烤製完成';
        }
        
        const nextTiming = this.rotationTimings[this.gameState.currentRotation];
        return nextTiming ? `下次翻轉: ${nextTiming.name}` : '等待中';
    }

    /**
     * 更新遊戲邏輯
     */
    update(deltaTime) {
        if (!this.isActive) return;
        
        // 更新遊戲狀態
        this.updateGameState(deltaTime);
        
        // 更新鴨子狀態
        this.updateDuckState(deltaTime);
        
        // 更新翻轉邏輯
        this.updateRotationLogic(deltaTime);
        
        // 更新視覺效果
        this.updateEffects(deltaTime);
        
        // 更新UI顯示
        this.updateUI();
        
        // 檢查完成條件
        this.checkCompletion();
    }

    /**
     * 更新遊戲狀態
     */
    updateGameState(deltaTime) {
        if (this.gameState.phase !== 'completed') {
            this.gameState.roastingTime += deltaTime;
        }
        
        // 檢查是否可以翻轉
        this.updateRotationAvailability();
        
        // 更新時機分數
        this.updateTimingScore();
    }

    /**
     * 更新翻轉可用性
     */
    updateRotationAvailability() {
        if (this.gameState.currentRotation >= this.gameState.totalRotations) {
            this.rotateButton.canRotate = false;
            return;
        }
        
        const nextTiming = this.rotationTimings[this.gameState.currentRotation];
        if (!nextTiming) {
            this.rotateButton.canRotate = false;
            return;
        }
        
        // 檢查是否在合理的時間範圍內
        const timeDiff = Math.abs(this.gameState.roastingTime - nextTiming.optimalTime);
        this.rotateButton.canRotate = timeDiff <= nextTiming.tolerance * 2; // 允許更寬鬆的操作範圍
        
        // 更新階段狀態
        if (this.rotateButton.canRotate && this.gameState.phase === 'waiting') {
            this.gameState.phase = 'ready';
            this.createTimingAlert();
        }
    }

    /**
     * 更新時機分數
     */
    updateTimingScore() {
        let totalScore = 0;
        let completedRotations = 0;
        
        // 計算已完成翻轉的分數
        for (let i = 0; i < this.gameState.currentRotation; i++) {
            const timing = this.rotationTimings[i];
            if (timing && timing.actualTime !== undefined) {
                const timeDiff = Math.abs(timing.actualTime - timing.optimalTime);
                const score = Math.max(0, 100 - (timeDiff / timing.tolerance) * 20);
                totalScore += score;
                completedRotations++;
            }
        }
        
        // 計算平均分數
        if (completedRotations > 0) {
            this.gameState.timingScore = totalScore / completedRotations;
        }
        
        // 更新總精確度
        this.gameState.accuracy = this.gameState.timingScore;
    }

    /**
     * 更新鴨子狀態
     */
    updateDuckState(deltaTime) {
        const duck = this.duckDisplay;
        
        // 更新旋轉動畫
        if (this.gameState.isRotating) {
            this.gameState.rotationProgress += deltaTime * 2; // 0.5秒完成旋轉
            
            if (this.gameState.rotationProgress >= 1.0) {
                // 旋轉完成
                this.gameState.isRotating = false;
                this.gameState.rotationProgress = 0;
                duck.rotation = duck.targetRotation;
                duck.currentSide = (duck.currentSide + 1) % 4;
                
                console.log(`翻轉完成，當前面: ${duck.currentSide}`);
            } else {
                // 更新旋轉角度
                const startRotation = duck.targetRotation - 90;
                duck.rotation = startRotation + (this.gameState.rotationProgress * 90);
            }
        }
        
        // 更新受熱程度
        this.updateHeatDistribution(deltaTime);
        
        // 更新皮色
        this.updateSkinColor(deltaTime);
    }

    /**
     * 更新受熱分布
     */
    updateHeatDistribution(deltaTime) {
        const duck = this.duckDisplay;
        const heatRate = 10 * deltaTime; // 受熱速率
        
        // 當前朝上的面受熱更多
        duck.heatLevel[duck.currentSide] = Math.min(100, duck.heatLevel[duck.currentSide] + heatRate * 2);
        
        // 其他面受熱較少
        for (let i = 0; i < 4; i++) {
            if (i !== duck.currentSide) {
                duck.heatLevel[i] = Math.min(100, duck.heatLevel[i] + heatRate * 0.3);
            }
        }
    }

    /**
     * 更新皮色
     */
    updateSkinColor(deltaTime) {
        const duck = this.duckDisplay;
        
        // 根據受熱程度更新皮色
        for (let i = 0; i < 4; i++) {
            if (duck.heatLevel[i] > 30) {
                const colorRate = (duck.heatLevel[i] - 30) / 70;
                duck.skinColor[i] = Math.min(100, duck.skinColor[i] + colorRate * 15 * deltaTime);
            }
        }
    }

    /**
     * 更新翻轉邏輯
     */
    updateRotationLogic(deltaTime) {
        // 檢查是否錯過了翻轉時機
        if (this.gameState.currentRotation < this.gameState.totalRotations) {
            const nextTiming = this.rotationTimings[this.gameState.currentRotation];
            if (nextTiming) {
                const timePassed = this.gameState.roastingTime - nextTiming.optimalTime;
                
                // 如果超過容差太多，自動標記為錯過
                if (timePassed > nextTiming.tolerance * 3) {
                    console.log(`錯過翻轉時機: ${nextTiming.name}`);
                    nextTiming.actualTime = this.gameState.roastingTime;
                    nextTiming.missed = true;
                    this.gameState.currentRotation++;
                    this.gameState.phase = 'waiting';
                }
            }
        }
    }

    /**
     * 執行翻轉
     */
    performRotation() {
        if (!this.rotateButton.canRotate || this.gameState.isRotating) return;
        
        const timing = this.rotationTimings[this.gameState.currentRotation];
        if (!timing) return;
        
        console.log(`執行翻轉: ${timing.name}`);
        
        // 記錄實際翻轉時間
        timing.actualTime = this.gameState.roastingTime;
        
        // 開始旋轉動畫
        this.gameState.isRotating = true;
        this.gameState.rotationProgress = 0;
        this.duckDisplay.targetRotation += 90;
        
        // 更新狀態
        this.gameState.currentRotation++;
        this.gameState.lastRotationTime = this.gameState.roastingTime;
        this.gameState.phase = 'rotating';
        
        // 創建旋轉效果
        this.createRotationEffect();
        
        // 播放音效
        if (this.gameEngine.gameState.settings.soundEnabled) {
            this.gameEngine.audioManager.playSound('rotation_sound');
        }
    }

    /**
     * 創建時機提醒效果
     */
    createTimingAlert() {
        this.effects.timingAlerts.push({
            x: this.gameArea.x + this.gameArea.width / 2,
            y: this.gameArea.y + 50,
            life: 2.0,
            opacity: 1.0,
            scale: 1.0
        });
    }

    /**
     * 創建旋轉效果
     */
    createRotationEffect() {
        const duck = this.duckDisplay;
        
        // 創建旋轉線條效果
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            this.effects.rotationLines.push({
                x: duck.x + duck.width / 2,
                y: duck.y + duck.height / 2,
                angle: angle,
                length: 30,
                life: 1.0,
                opacity: 0.8
            });
        }
    }

    /**
     * 更新視覺效果
     */
    updateEffects(deltaTime) {
        // 更新旋轉線條
        this.effects.rotationLines = this.effects.rotationLines.filter(line => {
            line.life -= deltaTime * 2;
            line.opacity = line.life;
            line.length += deltaTime * 20;
            return line.life > 0;
        });
        
        // 更新時機提醒
        this.effects.timingAlerts = this.effects.timingAlerts.filter(alert => {
            alert.life -= deltaTime;
            alert.opacity = alert.life / 2.0;
            alert.scale = 1.0 + (2.0 - alert.life) * 0.2;
            return alert.life > 0;
        });
        
        // 生成受熱指示器
        if (Math.random() < 0.3) {
            this.createHeatIndicator();
        }
        
        // 更新受熱指示器
        this.effects.heatIndicators = this.effects.heatIndicators.filter(indicator => {
            indicator.y -= indicator.vy * deltaTime;
            indicator.life -= deltaTime;
            indicator.opacity = indicator.life / 1.5;
            return indicator.life > 0;
        });
    }

    /**
     * 創建受熱指示器
     */
    createHeatIndicator() {
        const duck = this.duckDisplay;
        const currentHeat = duck.heatLevel[duck.currentSide];
        
        if (currentHeat > 50) {
            this.effects.heatIndicators.push({
                x: duck.x + Math.random() * duck.width,
                y: duck.y + duck.height,
                vy: 20 + Math.random() * 10,
                life: 1.5,
                opacity: 0.7,
                size: 2 + Math.random() * 3,
                color: currentHeat > 80 ? '#FF4500' : '#FFD700'
            });
        }
    }

    /**
     * 檢查完成條件
     */
    checkCompletion() {
        if (this.gameState.phase === 'completed') return;
        
        // 檢查是否完成所有翻轉
        if (this.gameState.currentRotation >= this.gameState.totalRotations) {
            // 等待最後的旋轉動畫完成
            if (!this.gameState.isRotating) {
                this.completeGame(true);
            }
        }
        
        // 檢查是否烤製時間過長
        if (this.gameState.roastingTime > 70) { // 超過70秒
            this.completeGame(false);
        }
    }

    /**
     * 完成遊戲
     */
    completeGame(success) {
        if (this.gameState.phase === 'completed') return;
        
        this.gameState.phase = 'completed';
        
        // 計算最終分數
        const uniformity = this.calculateUniformity();
        const finalScore = Math.round((this.gameState.timingScore + uniformity) / 2);
        
        const stats = {
            score: finalScore,
            rotationTiming: Math.round(this.gameState.timingScore),
            uniformity: Math.round(uniformity),
            rotationsCompleted: this.gameState.currentRotation,
            totalTime: this.gameState.roastingTime
        };
        
        console.log('翻轉時機遊戲完成:', success ? '成功' : '失敗', stats);
        
        // 延遲調用完成回調
        setTimeout(() => {
            this.complete(success, stats);
        }, 2000);
    }

    /**
     * 計算烤製均勻度
     */
    calculateUniformity() {
        const duck = this.duckDisplay;
        const avgHeat = duck.heatLevel.reduce((sum, heat) => sum + heat, 0) / 4;
        
        let variance = 0;
        duck.heatLevel.forEach(heat => {
            variance += Math.pow(heat - avgHeat, 2);
        });
        variance /= 4;
        
        // 均勻度分數（方差越小分數越高）
        const uniformity = Math.max(0, 100 - variance);
        return uniformity;
    }

    /**
     * 更新UI顯示
     */
    updateUI() {
        if (this.timeLabel) {
            this.timeLabel.setText(`烤製時間: ${Math.floor(this.gameState.roastingTime)}秒`);
        }
        
        if (this.rotationLabel) {
            this.rotationLabel.setText(`翻轉次數: ${this.gameState.currentRotation}/${this.gameState.totalRotations}`);
        }
        
        if (this.stageLabel) {
            this.stageLabel.setText(this.getCurrentStageText());
        }
        
        if (this.timingScoreLabel) {
            this.timingScoreLabel.setText(`時機掌握: ${Math.round(this.gameState.timingScore)}%`);
        }
    }

    /**
     * 處理輸入事件
     */
    handleInput(event) {
        if (!this.isActive || this.gameState.phase === 'completed') return false;
        
        const rect = this.gameEngine.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        if (event.type === 'mousedown' || event.type === 'touchstart') {
            // 檢查翻轉按鈕
            if (this.isPointInRect(x, y, this.rotateButton)) {
                if (this.rotateButton.canRotate) {
                    this.rotateButton.isPressed = true;
                    this.performRotation();
                }
                return true;
            }
        } else if (event.type === 'mouseup' || event.type === 'touchend') {
            this.rotateButton.isPressed = false;
            return true;
        }
        
        return false;
    }

    /**
     * 檢查點是否在矩形內
     */
    isPointInRect(x, y, rect) {
        return x >= rect.x && x <= rect.x + rect.width &&
               y >= rect.y && y <= rect.y + rect.height;
    }

    /**
     * 渲染遊戲
     */
    render(context) {
        if (!this.isActive) return;
        
        // 渲染遊戲區域背景
        this.renderGameArea(context);
        
        // 渲染時機指示器
        this.renderTimingIndicator(context);
        
        // 渲染鴨子
        this.renderDuck(context);
        
        // 渲染控制按鈕
        this.renderControls(context);
        
        // 渲染視覺效果
        this.renderEffects(context);
        
        // 渲染完成狀態
        if (this.gameState.phase === 'completed') {
            this.renderCompletionMessage(context);
        }
    }

    /**
     * 渲染遊戲區域
     */
    renderGameArea(context) {
        // 背景
        context.fillStyle = 'rgba(222, 184, 135, 0.1)';
        context.fillRect(this.gameArea.x, this.gameArea.y, this.gameArea.width, this.gameArea.height);
        
        // 邊框
        context.strokeStyle = '#8B4513';
        context.lineWidth = 2;
        context.strokeRect(this.gameArea.x, this.gameArea.y, this.gameArea.width, this.gameArea.height);
    }

    /**
     * 渲染時機指示器
     */
    renderTimingIndicator(context) {
        const indicator = this.timingIndicator;
        const totalTime = 60;
        
        // 時間軸背景
        context.fillStyle = '#F5F5DC';
        context.fillRect(indicator.x, indicator.y, indicator.width, indicator.height);
        
        context.strokeStyle = '#8B4513';
        context.lineWidth = 2;
        context.strokeRect(indicator.x, indicator.y, indicator.width, indicator.height);
        
        // 渲染最佳時機區域
        indicator.zones.forEach((zone, index) => {
            const completed = index < this.gameState.currentRotation;
            const current = index === this.gameState.currentRotation;
            
            let color = '#90EE90'; // 綠色 - 未來時機
            if (completed) {
                const timing = zone.timing;
                if (timing.missed) {
                    color = '#FF6B6B'; // 紅色 - 錯過
                } else {
                    const timeDiff = Math.abs(timing.actualTime - timing.optimalTime);
                    color = timeDiff <= timing.tolerance ? '#32CD32' : '#FFD700'; // 綠色好，黃色一般
                }
            } else if (current && this.rotateButton.canRotate) {
                color = '#00FF00'; // 亮綠色 - 當前可操作
            }
            
            context.fillStyle = color;
            context.fillRect(zone.x, indicator.y + 5, zone.width, indicator.height - 10);
            
            // 最佳時機線
            context.strokeStyle = '#000000';
            context.lineWidth = 2;
            context.beginPath();
            context.moveTo(zone.centerX, indicator.y);
            context.lineTo(zone.centerX, indicator.y + indicator.height);
            context.stroke();
        });
        
        // 當前時間指示器
        const currentX = indicator.x + (this.gameState.roastingTime / totalTime) * indicator.width;
        context.strokeStyle = '#FF0000';
        context.lineWidth = 3;
        context.beginPath();
        context.moveTo(currentX, indicator.y - 5);
        context.lineTo(currentX, indicator.y + indicator.height + 5);
        context.stroke();
        
        // 時間刻度
        context.fillStyle = '#000000';
        context.font = '10px Arial';
        context.textAlign = 'center';
        for (let i = 0; i <= 6; i++) {
            const time = i * 10;
            const x = indicator.x + (time / totalTime) * indicator.width;
            context.fillText(`${time}s`, x, indicator.y + indicator.height + 15);
        }
    }

    /**
     * 渲染鴨子
     */
    renderDuck(context) {
        const duck = this.duckDisplay;
        
        context.save();
        context.translate(duck.x + duck.width / 2, duck.y + duck.height / 2);
        context.rotate((duck.rotation * Math.PI) / 180);
        
        // 計算當前面的皮色
        const currentSkinColor = duck.skinColor[duck.currentSide];
        const colorIntensity = currentSkinColor / 100;
        
        // 鴨子顏色（從淺棕到金黃）
        const red = Math.floor(139 + (255 - 139) * colorIntensity);
        const green = Math.floor(69 + (215 - 69) * colorIntensity);
        const blue = Math.floor(19 + (0 - 19) * colorIntensity);
        
        // 繪製鴨子主體
        context.fillStyle = `rgb(${red}, ${green}, ${blue})`;
        context.fillRect(-duck.width / 2, -duck.height / 2, duck.width, duck.height);
        
        // 繪製鴨子輪廓
        context.strokeStyle = '#654321';
        context.lineWidth = 2;
        context.strokeRect(-duck.width / 2, -duck.height / 2, duck.width, duck.height);
        
        // 繪製受熱指示
        const heatLevel = duck.heatLevel[duck.currentSide];
        if (heatLevel > 30) {
            context.fillStyle = `rgba(255, 69, 0, ${(heatLevel - 30) / 70 * 0.5})`;
            context.fillRect(-duck.width / 2 + 5, -duck.height / 2 + 5, duck.width - 10, duck.height - 10);
        }
        
        context.restore();
        
        // 繪製四面受熱狀態指示器
        this.renderHeatStatus(context, duck);
    }

    /**
     * 渲染受熱狀態
     */
    renderHeatStatus(context, duck) {
        const statusX = duck.x + duck.width + 20;
        const statusY = duck.y;
        const statusSize = 15;
        
        context.font = '12px Arial';
        context.textAlign = 'left';
        context.fillStyle = '#000000';
        context.fillText('受熱狀態:', statusX, statusY - 5);
        
        const sideNames = ['上', '右', '下', '左'];
        
        for (let i = 0; i < 4; i++) {
            const y = statusY + i * 20;
            const heatRatio = duck.heatLevel[i] / 100;
            const colorRatio = duck.skinColor[i] / 100;
            
            // 受熱程度條
            context.fillStyle = '#CCCCCC';
            context.fillRect(statusX, y, 50, statusSize);
            
            context.fillStyle = `rgb(${Math.floor(255 * heatRatio)}, ${Math.floor(100 + 155 * colorRatio)}, 0)`;
            context.fillRect(statusX, y, 50 * heatRatio, statusSize);
            
            context.strokeStyle = i === duck.currentSide ? '#FF0000' : '#000000';
            context.lineWidth = i === duck.currentSide ? 2 : 1;
            context.strokeRect(statusX, y, 50, statusSize);
            
            // 面名稱
            context.fillStyle = '#000000';
            context.fillText(sideNames[i], statusX + 55, y + 12);
        }
    }

    /**
     * 渲染控制按鈕
     */
    renderControls(context) {
        const button = this.rotateButton;
        
        // 按鈕顏色
        let buttonColor = '#CCCCCC'; // 灰色 - 不可用
        if (button.canRotate) {
            buttonColor = button.isPressed ? '#FF8C00' : '#FFA500'; // 橙色 - 可用
        }
        
        context.fillStyle = buttonColor;
        context.fillRect(button.x, button.y, button.width, button.height);
        
        context.strokeStyle = '#000000';
        context.lineWidth = 2;
        context.strokeRect(button.x, button.y, button.width, button.height);
        
        // 按鈕文字
        context.fillStyle = button.canRotate ? '#000000' : '#666666';
        context.font = '16px Arial';
        context.textAlign = 'center';
        context.fillText('翻轉', button.x + button.width / 2, button.y + button.height / 2 + 6);
        
        // 可用性提示
        if (button.canRotate) {
            context.fillStyle = '#32CD32';
            context.font = '12px Arial';
            context.fillText('最佳時機！', button.x + button.width / 2, button.y - 10);
        }
    }

    /**
     * 渲染視覺效果
     */
    renderEffects(context) {
        // 渲染旋轉線條
        this.effects.rotationLines.forEach(line => {
            context.strokeStyle = `rgba(255, 215, 0, ${line.opacity})`;
            context.lineWidth = 2;
            context.beginPath();
            context.moveTo(line.x, line.y);
            context.lineTo(
                line.x + Math.cos(line.angle) * line.length,
                line.y + Math.sin(line.angle) * line.length
            );
            context.stroke();
        });
        
        // 渲染時機提醒
        this.effects.timingAlerts.forEach(alert => {
            context.save();
            context.translate(alert.x, alert.y);
            context.scale(alert.scale, alert.scale);
            
            context.fillStyle = `rgba(0, 255, 0, ${alert.opacity})`;
            context.font = '20px Arial';
            context.textAlign = 'center';
            context.fillText('翻轉時機！', 0, 0);
            
            context.restore();
        });
        
        // 渲染受熱指示器
        this.effects.heatIndicators.forEach(indicator => {
            context.fillStyle = `rgba(255, 165, 0, ${indicator.opacity})`;
            context.beginPath();
            context.arc(indicator.x, indicator.y, indicator.size, 0, Math.PI * 2);
            context.fill();
        });
    }

    /**
     * 渲染完成消息
     */
    renderCompletionMessage(context) {
        const centerX = this.gameArea.x + this.gameArea.width / 2;
        const centerY = this.gameArea.y + this.gameArea.height / 2;
        
        // 半透明背景
        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.fillRect(this.gameArea.x, this.gameArea.y, this.gameArea.width, this.gameArea.height);
        
        // 完成消息
        const success = this.gameState.accuracy >= 70;
        context.fillStyle = success ? '#32CD32' : '#FF6B6B';
        context.font = '24px Arial';
        context.textAlign = 'center';
        context.fillText(
            success ? '翻轉完成！' : '需要重試',
            centerX,
            centerY - 40
        );
        
        context.font = '16px Arial';
        context.fillStyle = '#FFFFFF';
        context.fillText(
            `翻轉次數: ${this.gameState.currentRotation}/${this.gameState.totalRotations}`,
            centerX,
            centerY - 10
        );
        
        context.fillText(
            `時機掌握: ${Math.round(this.gameState.timingScore)}%`,
            centerX,
            centerY + 20
        );
        
        const uniformity = this.calculateUniformity();
        context.fillText(
            `烤製均勻度: ${Math.round(uniformity)}%`,
            centerX,
            centerY + 50
        );
    }

    /**
     * 清理資源
     */
    cleanup() {
        super.cleanup();
        
        // 清理UI元素
        this.uiElements.forEach(element => {
            if (this.gameEngine.uiManager) {
                this.gameEngine.uiManager.removeUIElement(element);
            }
        });
        
        this.uiElements = [];
        console.log('翻轉時機遊戲清理完成');
    }
}