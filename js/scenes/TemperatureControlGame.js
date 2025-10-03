/**
 * 溫度控制迷你遊戲
 * 精確控制烤爐溫度，按照不同階段調節火候
 */
class TemperatureControlGame extends MiniGame {
    constructor(config) {
        super(config);
        
        this.name = '溫度控制遊戲';
        this.gameArea = {
            x: config.gameAreaX || 100,
            y: config.gameAreaY || 140,
            width: config.gameAreaWidth || 600,
            height: config.gameAreaHeight || 320
        };
        
        // 遊戲狀態
        this.gameState = {
            phase: 'stage1',       // stage1, stage2, stage3, completed
            currentTemp: 25,       // 當前溫度
            targetTemp: 260,       // 目標溫度
            fuelLevel: 100,        // 燃料水平 0-100%
            airflow: 50,           // 通風量 0-100%
            timeInStage: 0,        // 當前階段時間
            totalTime: 0,          // 總時間
            accuracy: 100,         // 精確度分數
            stageComplete: false   // 當前階段是否完成
        };
        
        // 溫度階段設定
        this.temperatureStages = [
            {
                name: '高溫定型',
                targetTemp: 260,
                duration: 15,      // 15秒（代表15分鐘）
                tolerance: 10,     // 溫度容差
                description: '快速升溫到260°C，定型鴨皮'
            },
            {
                name: '中溫烤製',
                targetTemp: 210,
                duration: 20,      // 20秒（代表30分鐘）
                tolerance: 8,
                description: '降溫到210°C，均勻烤製'
            },
            {
                name: '低溫收色',
                targetTemp: 180,
                duration: 10,      // 10秒（代表15分鐘）
                tolerance: 5,
                description: '降到180°C，完美上色'
            }
        ];
        
        this.currentStageIndex = 0;
        
        // 控制面板
        this.controls = {
            fuelControl: {
                x: this.gameArea.x + 50,
                y: this.gameArea.y + 200,
                width: 120,
                height: 20,
                value: 50,  // 0-100
                isDragging: false
            },
            airflowControl: {
                x: this.gameArea.x + 200,
                y: this.gameArea.y + 200,
                width: 120,
                height: 20,
                value: 50,  // 0-100
                isDragging: false
            },
            emergencyStop: {
                x: this.gameArea.x + 350,
                y: this.gameArea.y + 180,
                width: 80,
                height: 40,
                isPressed: false
            }
        };
        
        // 烤爐顯示
        this.ovenDisplay = {
            x: this.gameArea.x + 450,
            y: this.gameArea.y + 50,
            width: 120,
            height: 150,
            flameHeight: 0,
            heatLevel: 0
        };
        
        // 溫度計顯示
        this.thermometer = {
            x: this.gameArea.x + 400,
            y: this.gameArea.y + 50,
            width: 30,
            height: 150
        };
        
        // 視覺效果
        this.effects = {
            flames: [],
            smoke: [],
            sparks: []
        };
        
        // UI元素
        this.uiElements = [];
        
        console.log('溫度控制迷你遊戲初始化完成');
    }

    /**
     * 開始遊戲
     */
    start() {
        super.start();
        this.setupGameUI();
        this.gameState.phase = 'stage1';
        this.currentStageIndex = 0;
        this.updateTargetTemperature();
        console.log('溫度控制遊戲開始');
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
            text: '溫度控制 - 掌握烤製火候',
            fontSize: 18,
            color: '#DC143C',
            align: 'center'
        });
        
        // 階段說明
        this.stageLabel = uiManager.createLabel({
            x: this.gameArea.x + this.gameArea.width / 2,
            y: this.gameArea.y + 10,
            text: this.getCurrentStageDescription(),
            fontSize: 14,
            color: '#8B0000',
            align: 'center'
        });
        
        // 當前溫度顯示
        this.currentTempLabel = uiManager.createLabel({
            x: this.gameArea.x + 50,
            y: this.gameArea.y + 50,
            text: `當前溫度: ${Math.round(this.gameState.currentTemp)}°C`,
            fontSize: 16,
            color: '#FF4500',
            align: 'left'
        });
        
        // 目標溫度顯示
        this.targetTempLabel = uiManager.createLabel({
            x: this.gameArea.x + 50,
            y: this.gameArea.y + 80,
            text: `目標溫度: ${this.gameState.targetTemp}°C`,
            fontSize: 16,
            color: '#32CD32',
            align: 'left'
        });
        
        // 燃料水平顯示
        this.fuelLabel = uiManager.createLabel({
            x: this.gameArea.x + 50,
            y: this.gameArea.y + 110,
            text: `燃料水平: ${Math.round(this.gameState.fuelLevel)}%`,
            fontSize: 14,
            color: '#DAA520',
            align: 'left'
        });
        
        // 通風量顯示
        this.airflowLabel = uiManager.createLabel({
            x: this.gameArea.x + 50,
            y: this.gameArea.y + 130,
            text: `通風量: ${Math.round(this.gameState.airflow)}%`,
            fontSize: 14,
            color: '#4682B4',
            align: 'left'
        });
        
        // 階段時間顯示
        this.timeLabel = uiManager.createLabel({
            x: this.gameArea.x + 50,
            y: this.gameArea.y + 150,
            text: this.getTimeDisplayText(),
            fontSize: 14,
            color: '#2F4F4F',
            align: 'left'
        });
        
        // 精確度顯示
        this.accuracyLabel = uiManager.createLabel({
            x: this.gameArea.x + 250,
            y: this.gameArea.y + 50,
            text: `精確度: ${Math.round(this.gameState.accuracy)}%`,
            fontSize: 16,
            color: '#9932CC',
            align: 'left'
        });
        
        this.uiElements.push(
            this.titleLabel,
            this.stageLabel,
            this.currentTempLabel,
            this.targetTempLabel,
            this.fuelLabel,
            this.airflowLabel,
            this.timeLabel,
            this.accuracyLabel
        );
    }

    /**
     * 獲取當前階段描述
     */
    getCurrentStageDescription() {
        const stage = this.temperatureStages[this.currentStageIndex];
        return stage ? `${stage.name}: ${stage.description}` : '完成';
    }

    /**
     * 獲取時間顯示文字
     */
    getTimeDisplayText() {
        const stage = this.temperatureStages[this.currentStageIndex];
        if (!stage) return '完成';
        
        const remaining = Math.max(0, stage.duration - this.gameState.timeInStage);
        return `階段時間: ${Math.ceil(remaining)}秒`;
    }

    /**
     * 更新目標溫度
     */
    updateTargetTemperature() {
        const stage = this.temperatureStages[this.currentStageIndex];
        if (stage) {
            this.gameState.targetTemp = stage.targetTemp;
        }
    }

    /**
     * 更新遊戲邏輯
     */
    update(deltaTime) {
        if (!this.isActive) return;
        
        // 更新遊戲狀態
        this.updateGameState(deltaTime);
        
        // 更新溫度系統
        this.updateTemperatureSystem(deltaTime);
        
        // 更新視覺效果
        this.updateEffects(deltaTime);
        
        // 更新UI顯示
        this.updateUI();
        
        // 檢查階段完成
        this.checkStageCompletion();
    }

    /**
     * 更新遊戲狀態
     */
    updateGameState(deltaTime) {
        // 更新時間
        this.gameState.timeInStage += deltaTime;
        this.gameState.totalTime += deltaTime;
        
        // 更新燃料消耗
        const fuelConsumption = this.controls.fuelControl.value * 0.5 * deltaTime;
        this.gameState.fuelLevel = Math.max(0, this.gameState.fuelLevel - fuelConsumption);
        
        // 更新精確度
        this.updateAccuracy();
    }

    /**
     * 更新溫度系統
     */
    updateTemperatureSystem(deltaTime) {
        const fuelPower = this.controls.fuelControl.value / 100;
        const airflowEffect = this.controls.airflowControl.value / 100;
        
        // 計算加熱功率
        let heatingPower = 0;
        if (this.gameState.fuelLevel > 0 && !this.controls.emergencyStop.isPressed) {
            heatingPower = fuelPower * (0.5 + airflowEffect * 0.5);
        }
        
        // 計算目標溫度變化
        const maxTemp = 300;
        const roomTemp = 25;
        
        if (heatingPower > 0) {
            // 加熱
            const heatRate = heatingPower * 100; // °C/秒
            this.gameState.currentTemp = Math.min(
                maxTemp,
                this.gameState.currentTemp + heatRate * deltaTime
            );
        } else {
            // 自然降溫
            const coolRate = 20 + airflowEffect * 30; // 通風影響降溫速度
            this.gameState.currentTemp = Math.max(
                roomTemp,
                this.gameState.currentTemp - coolRate * deltaTime
            );
        }
        
        // 更新烤爐顯示
        this.ovenDisplay.heatLevel = heatingPower;
        this.ovenDisplay.flameHeight = heatingPower * 50;
        
        // 更新控制值
        this.gameState.airflow = this.controls.airflowControl.value;
        
        // 生成視覺效果
        if (heatingPower > 0.3) {
            this.generateFlameEffects();
        }
        
        if (this.gameState.currentTemp > 200) {
            this.generateSmokeEffects();
        }
    }

    /**
     * 更新精確度
     */
    updateAccuracy() {
        const stage = this.temperatureStages[this.currentStageIndex];
        if (!stage) return;
        
        const tempDiff = Math.abs(this.gameState.currentTemp - this.gameState.targetTemp);
        const tolerance = stage.tolerance;
        
        let stageAccuracy = 100;
        
        // 溫度精確度
        if (tempDiff > tolerance) {
            stageAccuracy -= (tempDiff - tolerance) * 2;
        }
        
        // 燃料效率獎勵
        if (this.gameState.fuelLevel > 20) {
            stageAccuracy += 5;
        }
        
        // 時間管理獎勵
        const timeRatio = this.gameState.timeInStage / stage.duration;
        if (timeRatio < 1.2) { // 在時間內完成
            stageAccuracy += 10;
        }
        
        this.gameState.accuracy = Math.max(0, Math.min(100, stageAccuracy));
    }

    /**
     * 生成火焰效果
     */
    generateFlameEffects() {
        if (Math.random() < 0.4) {
            this.effects.flames.push({
                x: this.ovenDisplay.x + 20 + Math.random() * 80,
                y: this.ovenDisplay.y + this.ovenDisplay.height - 10,
                height: 10 + Math.random() * this.ovenDisplay.flameHeight,
                life: 0.3 + Math.random() * 0.4,
                intensity: this.ovenDisplay.heatLevel
            });
        }
    }

    /**
     * 生成煙霧效果
     */
    generateSmokeEffects() {
        if (Math.random() < 0.2) {
            this.effects.smoke.push({
                x: this.ovenDisplay.x + this.ovenDisplay.width / 2,
                y: this.ovenDisplay.y,
                vx: (Math.random() - 0.5) * 20,
                vy: -30 - Math.random() * 20,
                life: 2.0 + Math.random(),
                size: 3 + Math.random() * 5,
                opacity: 0.6
            });
        }
    }

    /**
     * 更新視覺效果
     */
    updateEffects(deltaTime) {
        // 更新火焰
        this.effects.flames = this.effects.flames.filter(flame => {
            flame.life -= deltaTime * 3;
            flame.height *= 0.95;
            return flame.life > 0;
        });
        
        // 更新煙霧
        this.effects.smoke = this.effects.smoke.filter(particle => {
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;
            particle.life -= deltaTime;
            particle.opacity = particle.life / 3.0;
            particle.size += deltaTime * 2;
            return particle.life > 0;
        });
    }

    /**
     * 檢查階段完成
     */
    checkStageCompletion() {
        const stage = this.temperatureStages[this.currentStageIndex];
        if (!stage) return;
        
        const tempInRange = Math.abs(this.gameState.currentTemp - this.gameState.targetTemp) <= stage.tolerance;
        const timeComplete = this.gameState.timeInStage >= stage.duration;
        
        if (tempInRange && timeComplete) {
            this.completeCurrentStage();
        } else if (this.gameState.timeInStage > stage.duration * 1.5) {
            // 超時太多，失敗
            this.completeGame(false);
        } else if (this.gameState.fuelLevel <= 0 && this.gameState.currentTemp < this.gameState.targetTemp * 0.8) {
            // 燃料耗盡且溫度過低，失敗
            this.completeGame(false);
        }
    }

    /**
     * 完成當前階段
     */
    completeCurrentStage() {
        console.log(`階段 ${this.currentStageIndex + 1} 完成`);
        
        this.currentStageIndex++;
        
        if (this.currentStageIndex >= this.temperatureStages.length) {
            // 所有階段完成
            this.completeGame(true);
        } else {
            // 進入下一階段
            this.gameState.timeInStage = 0;
            this.updateTargetTemperature();
            
            // 更新階段說明
            if (this.stageLabel) {
                this.stageLabel.setText(this.getCurrentStageDescription());
            }
        }
    }

    /**
     * 完成遊戲
     */
    completeGame(success) {
        if (this.gameState.phase === 'completed') return;
        
        this.gameState.phase = 'completed';
        
        const stats = {
            score: Math.round(this.gameState.accuracy),
            tempControl: Math.round(this.gameState.accuracy),
            fuelEfficiency: Math.round(this.gameState.fuelLevel),
            timeUsed: this.gameState.totalTime,
            stagesCompleted: this.currentStageIndex
        };
        
        console.log('溫度控制遊戲完成:', success ? '成功' : '失敗', stats);
        
        // 延遲調用完成回調
        setTimeout(() => {
            this.complete(success, stats);
        }, 2000);
    }

    /**
     * 更新UI顯示
     */
    updateUI() {
        if (this.currentTempLabel) {
            this.currentTempLabel.setText(`當前溫度: ${Math.round(this.gameState.currentTemp)}°C`);
        }
        
        if (this.targetTempLabel) {
            this.targetTempLabel.setText(`目標溫度: ${this.gameState.targetTemp}°C`);
        }
        
        if (this.fuelLabel) {
            this.fuelLabel.setText(`燃料水平: ${Math.round(this.gameState.fuelLevel)}%`);
        }
        
        if (this.airflowLabel) {
            this.airflowLabel.setText(`通風量: ${Math.round(this.gameState.airflow)}%`);
        }
        
        if (this.timeLabel) {
            this.timeLabel.setText(this.getTimeDisplayText());
        }
        
        if (this.accuracyLabel) {
            this.accuracyLabel.setText(`精確度: ${Math.round(this.gameState.accuracy)}%`);
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
            // 檢查燃料控制滑桿
            if (this.isPointInSlider(x, y, this.controls.fuelControl)) {
                this.controls.fuelControl.isDragging = true;
                this.updateSliderValue(x, this.controls.fuelControl);
                return true;
            }
            
            // 檢查通風控制滑桿
            if (this.isPointInSlider(x, y, this.controls.airflowControl)) {
                this.controls.airflowControl.isDragging = true;
                this.updateSliderValue(x, this.controls.airflowControl);
                return true;
            }
            
            // 檢查緊急停止按鈕
            if (this.isPointInRect(x, y, this.controls.emergencyStop)) {
                this.controls.emergencyStop.isPressed = !this.controls.emergencyStop.isPressed;
                return true;
            }
        } else if (event.type === 'mousemove' || event.type === 'touchmove') {
            // 拖拽滑桿
            if (this.controls.fuelControl.isDragging) {
                this.updateSliderValue(x, this.controls.fuelControl);
                return true;
            }
            
            if (this.controls.airflowControl.isDragging) {
                this.updateSliderValue(x, this.controls.airflowControl);
                return true;
            }
        } else if (event.type === 'mouseup' || event.type === 'touchend') {
            // 停止拖拽
            this.controls.fuelControl.isDragging = false;
            this.controls.airflowControl.isDragging = false;
            return true;
        }
        
        return false;
    }

    /**
     * 檢查點是否在滑桿內
     */
    isPointInSlider(x, y, slider) {
        return x >= slider.x && x <= slider.x + slider.width &&
               y >= slider.y - 10 && y <= slider.y + slider.height + 10;
    }

    /**
     * 檢查點是否在矩形內
     */
    isPointInRect(x, y, rect) {
        return x >= rect.x && x <= rect.x + rect.width &&
               y >= rect.y && y <= rect.y + rect.height;
    }

    /**
     * 更新滑桿值
     */
    updateSliderValue(x, slider) {
        const relativeX = x - slider.x;
        const ratio = Math.max(0, Math.min(1, relativeX / slider.width));
        slider.value = ratio * 100;
    }

    /**
     * 渲染遊戲
     */
    render(context) {
        if (!this.isActive) return;
        
        // 渲染遊戲區域背景
        this.renderGameArea(context);
        
        // 渲染烤爐
        this.renderOven(context);
        
        // 渲染溫度計
        this.renderThermometer(context);
        
        // 渲染控制面板
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
        context.fillStyle = 'rgba(139, 69, 19, 0.1)';
        context.fillRect(this.gameArea.x, this.gameArea.y, this.gameArea.width, this.gameArea.height);
        
        // 邊框
        context.strokeStyle = '#DC143C';
        context.lineWidth = 2;
        context.strokeRect(this.gameArea.x, this.gameArea.y, this.gameArea.width, this.gameArea.height);
    }

    /**
     * 渲染烤爐
     */
    renderOven(context) {
        const oven = this.ovenDisplay;
        
        // 烤爐主體
        context.fillStyle = '#8B4513';
        context.fillRect(oven.x, oven.y, oven.width, oven.height);
        
        // 烤爐邊框
        context.strokeStyle = '#654321';
        context.lineWidth = 3;
        context.strokeRect(oven.x, oven.y, oven.width, oven.height);
        
        // 烤爐內部
        const heatColor = this.getHeatColor(this.gameState.currentTemp);
        context.fillStyle = heatColor;
        context.fillRect(oven.x + 5, oven.y + 5, oven.width - 10, oven.height - 10);
        
        // 烤爐門
        context.fillStyle = 'rgba(0, 0, 0, 0.3)';
        context.fillRect(oven.x + 10, oven.y + 10, oven.width - 20, oven.height - 20);
    }

    /**
     * 獲取熱量對應的顏色
     */
    getHeatColor(temp) {
        if (temp < 100) return '#2F2F2F';
        if (temp < 150) return '#8B0000';
        if (temp < 200) return '#DC143C';
        if (temp < 250) return '#FF4500';
        return '#FF6347';
    }

    /**
     * 渲染溫度計
     */
    renderThermometer(context) {
        const thermo = this.thermometer;
        
        // 溫度計主體
        context.fillStyle = '#FFFFFF';
        context.fillRect(thermo.x, thermo.y, thermo.width, thermo.height);
        
        context.strokeStyle = '#000000';
        context.lineWidth = 2;
        context.strokeRect(thermo.x, thermo.y, thermo.width, thermo.height);
        
        // 溫度指示
        const tempRatio = Math.min(1.0, this.gameState.currentTemp / 300);
        const tempHeight = thermo.height * tempRatio;
        
        context.fillStyle = this.getTemperatureColor(this.gameState.currentTemp);
        context.fillRect(
            thermo.x + 2,
            thermo.y + thermo.height - tempHeight - 2,
            thermo.width - 4,
            tempHeight
        );
        
        // 目標溫度標記
        const targetRatio = this.gameState.targetTemp / 300;
        const targetY = thermo.y + thermo.height * (1 - targetRatio);
        
        context.strokeStyle = '#00FF00';
        context.lineWidth = 3;
        context.beginPath();
        context.moveTo(thermo.x - 5, targetY);
        context.lineTo(thermo.x + thermo.width + 5, targetY);
        context.stroke();
    }

    /**
     * 獲取溫度對應的顏色
     */
    getTemperatureColor(temp) {
        if (temp < 50) return '#4169E1';
        if (temp < 100) return '#32CD32';
        if (temp < 150) return '#FFD700';
        if (temp < 200) return '#FF8C00';
        if (temp < 250) return '#FF4500';
        return '#FF0000';
    }

    /**
     * 渲染控制面板
     */
    renderControls(context) {
        // 渲染燃料控制滑桿
        this.renderSlider(context, this.controls.fuelControl, '燃料控制', '#DAA520');
        
        // 渲染通風控制滑桿
        this.renderSlider(context, this.controls.airflowControl, '通風控制', '#4682B4');
        
        // 渲染緊急停止按鈕
        const emergency = this.controls.emergencyStop;
        context.fillStyle = emergency.isPressed ? '#8B0000' : '#FF0000';
        context.fillRect(emergency.x, emergency.y, emergency.width, emergency.height);
        
        context.strokeStyle = '#000000';
        context.lineWidth = 2;
        context.strokeRect(emergency.x, emergency.y, emergency.width, emergency.height);
        
        context.fillStyle = '#FFFFFF';
        context.font = '12px Arial';
        context.textAlign = 'center';
        context.fillText('緊急停止', emergency.x + emergency.width / 2, emergency.y + emergency.height / 2 + 4);
    }

    /**
     * 渲染滑桿
     */
    renderSlider(context, slider, label, color) {
        // 滑桿軌道
        context.fillStyle = '#CCCCCC';
        context.fillRect(slider.x, slider.y, slider.width, slider.height);
        
        // 滑桿填充
        const fillWidth = (slider.width * slider.value) / 100;
        context.fillStyle = color;
        context.fillRect(slider.x, slider.y, fillWidth, slider.height);
        
        // 滑桿邊框
        context.strokeStyle = '#000000';
        context.lineWidth = 1;
        context.strokeRect(slider.x, slider.y, slider.width, slider.height);
        
        // 滑桿手柄
        const handleX = slider.x + fillWidth - 5;
        context.fillStyle = '#FFFFFF';
        context.fillRect(handleX, slider.y - 5, 10, slider.height + 10);
        context.strokeRect(handleX, slider.y - 5, 10, slider.height + 10);
        
        // 標籤
        context.fillStyle = '#000000';
        context.font = '12px Arial';
        context.textAlign = 'left';
        context.fillText(label, slider.x, slider.y - 5);
        
        // 數值
        context.textAlign = 'right';
        context.fillText(`${Math.round(slider.value)}%`, slider.x + slider.width, slider.y - 5);
    }

    /**
     * 渲染視覺效果
     */
    renderEffects(context) {
        // 渲染火焰
        this.effects.flames.forEach(flame => {
            const alpha = flame.life / 0.7;
            context.fillStyle = `rgba(255, ${Math.floor(100 + 155 * flame.intensity)}, 0, ${alpha})`;
            context.fillRect(
                flame.x - 3,
                flame.y - flame.height,
                6,
                flame.height
            );
        });
        
        // 渲染煙霧
        this.effects.smoke.forEach(particle => {
            context.fillStyle = `rgba(105, 105, 105, ${particle.opacity})`;
            context.beginPath();
            context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
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
            success ? '溫度控制完成！' : '需要重試',
            centerX,
            centerY - 30
        );
        
        context.font = '16px Arial';
        context.fillStyle = '#FFFFFF';
        context.fillText(
            `完成階段: ${this.currentStageIndex}/${this.temperatureStages.length}`,
            centerX,
            centerY
        );
        
        context.fillText(
            `精確度: ${Math.round(this.gameState.accuracy)}%`,
            centerX,
            centerY + 30
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
        console.log('溫度控制遊戲清理完成');
    }
}