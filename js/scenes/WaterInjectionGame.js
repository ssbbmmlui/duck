/**
 * 灌湯迷你遊戲
 * 控制水量和溫度，向鴨腹內注入適量熱水
 */
class WaterInjectionGame extends MiniGame {
    constructor(config) {
        super(config);
        
        this.name = '灌湯遊戲';
        this.gameArea = {
            x: config.gameAreaX || 100,
            y: config.gameAreaY || 140,
            width: config.gameAreaWidth || 600,
            height: config.gameAreaHeight || 320
        };
        
        // 遊戲狀態
        this.gameState = {
            phase: 'preparation',  // preparation, injecting, completed
            waterTemp: 25,         // 當前水溫
            targetTemp: 82,        // 目標水溫 80-85°C
            waterAmount: 0,        // 已注入水量 0-100%
            targetAmount: 75,      // 目標水量
            injectionRate: 0,      // 注入速率
            isHeating: false,      // 是否加熱中
            isInjecting: false,    // 是否注入中
            timeRemaining: 60,     // 剩餘時間（秒）
            accuracy: 100          // 精確度分數
        };
        
        // 控制系統
        this.controls = {
            heater: {
                x: this.gameArea.x + 50,
                y: this.gameArea.y + 200,
                width: 80,
                height: 60,
                isPressed: false,
                heatRate: 3  // °C/秒
            },
            injector: {
                x: this.gameArea.x + 200,
                y: this.gameArea.y + 200,
                width: 80,
                height: 60,
                isPressed: false,
                injectionRate: 15  // %/秒
            },
            thermometer: {
                x: this.gameArea.x + 350,
                y: this.gameArea.y + 50,
                width: 30,
                height: 120
            }
        };
        
        // 鴨子顯示
        this.duckDisplay = {
            x: this.gameArea.x + 400,
            y: this.gameArea.y + 120,
            width: 150,
            height: 100,
            waterLevel: 0,  // 0-100%
            isSealed: false
        };
        
        // 視覺效果
        this.effects = {
            steam: [],
            waterDrops: [],
            bubbles: []
        };
        
        // 完成條件
        this.completionCriteria = {
            minWaterAmount: 70,
            maxWaterAmount: 80,
            minTemp: 80,
            maxTemp: 85,
            timeBonus: true
        };
        
        // UI元素
        this.uiElements = [];
        
        console.log('灌湯迷你遊戲初始化完成');
    }

    /**
     * 開始遊戲
     */
    start() {
        super.start();
        this.setupGameUI();
        this.gameState.phase = 'preparation';
        console.log('灌湯遊戲開始');
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
            text: '灌湯工藝 - 控制水溫與水量',
            fontSize: 18,
            color: '#4169E1',
            align: 'center'
        });
        
        // 說明文字
        this.instructionLabel = uiManager.createLabel({
            x: this.gameArea.x + this.gameArea.width / 2,
            y: this.gameArea.y + 10,
            text: '目標：將80-85°C的熱水注入鴨腹，水量控制在70-80%',
            fontSize: 14,
            color: '#2F4F4F',
            align: 'center'
        });
        
        // 溫度顯示
        this.tempLabel = uiManager.createLabel({
            x: this.gameArea.x + 50,
            y: this.gameArea.y + 50,
            text: `水溫: ${this.gameState.waterTemp}°C`,
            fontSize: 16,
            color: '#FF4500',
            align: 'left'
        });
        
        // 水量顯示
        this.amountLabel = uiManager.createLabel({
            x: this.gameArea.x + 50,
            y: this.gameArea.y + 80,
            text: `水量: ${this.gameState.waterAmount}%`,
            fontSize: 16,
            color: '#1E90FF',
            align: 'left'
        });
        
        // 時間顯示
        this.timeLabel = uiManager.createLabel({
            x: this.gameArea.x + 50,
            y: this.gameArea.y + 110,
            text: `時間: ${Math.ceil(this.gameState.timeRemaining)}秒`,
            fontSize: 16,
            color: '#8B0000',
            align: 'left'
        });
        
        // 精確度顯示
        this.accuracyLabel = uiManager.createLabel({
            x: this.gameArea.x + 50,
            y: this.gameArea.y + 140,
            text: `精確度: ${this.gameState.accuracy}%`,
            fontSize: 16,
            color: '#32CD32',
            align: 'left'
        });
        
        this.uiElements.push(
            this.titleLabel,
            this.instructionLabel,
            this.tempLabel,
            this.amountLabel,
            this.timeLabel,
            this.accuracyLabel
        );
    }

    /**
     * 更新遊戲邏輯
     */
    update(deltaTime) {
        if (!this.isActive) return;
        
        // 更新遊戲狀態
        this.updateGameState(deltaTime);
        
        // 更新控制系統
        this.updateControls(deltaTime);
        
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
        // 更新時間
        if (this.gameState.phase !== 'completed') {
            this.gameState.timeRemaining -= deltaTime;
            
            if (this.gameState.timeRemaining <= 0) {
                this.gameState.timeRemaining = 0;
                this.completeGame(false); // 時間到，失敗
                return;
            }
        }
        
        // 更新水溫
        if (this.gameState.isHeating) {
            const maxTemp = 100; // 沸點
            this.gameState.waterTemp = Math.min(
                maxTemp,
                this.gameState.waterTemp + this.controls.heater.heatRate * deltaTime
            );
        } else {
            // 自然降溫
            const roomTemp = 25;
            if (this.gameState.waterTemp > roomTemp) {
                this.gameState.waterTemp = Math.max(
                    roomTemp,
                    this.gameState.waterTemp - 0.5 * deltaTime
                );
            }
        }
        
        // 更新水量注入
        if (this.gameState.isInjecting && this.gameState.waterAmount < 100) {
            this.gameState.waterAmount = Math.min(
                100,
                this.gameState.waterAmount + this.controls.injector.injectionRate * deltaTime
            );
            
            this.duckDisplay.waterLevel = this.gameState.waterAmount;
            
            // 生成水滴效果
            if (Math.random() < 0.3) {
                this.createWaterDropEffect();
            }
        }
        
        // 更新精確度
        this.updateAccuracy();
    }

    /**
     * 更新精確度分數
     */
    updateAccuracy() {
        let accuracy = 100;
        
        // 溫度精確度
        const tempDiff = Math.abs(this.gameState.waterTemp - this.gameState.targetTemp);
        if (tempDiff > 5) {
            accuracy -= tempDiff * 2;
        }
        
        // 水量精確度
        const amountDiff = Math.abs(this.gameState.waterAmount - this.gameState.targetAmount);
        if (amountDiff > 5) {
            accuracy -= amountDiff;
        }
        
        // 時間獎勵
        const timeRatio = this.gameState.timeRemaining / 60;
        if (timeRatio > 0.5) {
            accuracy += 10;
        }
        
        this.gameState.accuracy = Math.max(0, Math.min(100, accuracy));
    }

    /**
     * 更新控制系統
     */
    updateControls(deltaTime) {
        // 更新加熱器狀態
        this.gameState.isHeating = this.controls.heater.isPressed;
        
        // 更新注入器狀態
        this.gameState.isInjecting = this.controls.injector.isPressed;
        
        // 生成蒸汽效果
        if (this.gameState.waterTemp > 70 && Math.random() < 0.2) {
            this.createSteamEffect();
        }
        
        // 生成氣泡效果
        if (this.gameState.isHeating && this.gameState.waterTemp > 80 && Math.random() < 0.4) {
            this.createBubbleEffect();
        }
    }

    /**
     * 創建蒸汽效果
     */
    createSteamEffect() {
        this.effects.steam.push({
            x: this.controls.thermometer.x + Math.random() * 20,
            y: this.controls.thermometer.y,
            vx: (Math.random() - 0.5) * 10,
            vy: -20 - Math.random() * 10,
            life: 1.5 + Math.random() * 0.5,
            size: 2 + Math.random() * 3,
            opacity: 0.7
        });
    }

    /**
     * 創建水滴效果
     */
    createWaterDropEffect() {
        this.effects.waterDrops.push({
            x: this.controls.injector.x + this.controls.injector.width / 2,
            y: this.controls.injector.y + this.controls.injector.height,
            vx: (Math.random() - 0.5) * 5,
            vy: 30 + Math.random() * 20,
            life: 1.0,
            size: 2 + Math.random() * 2
        });
    }

    /**
     * 創建氣泡效果
     */
    createBubbleEffect() {
        this.effects.bubbles.push({
            x: this.controls.heater.x + Math.random() * this.controls.heater.width,
            y: this.controls.heater.y + this.controls.heater.height,
            vy: -15 - Math.random() * 10,
            life: 2.0,
            size: 3 + Math.random() * 4,
            opacity: 0.6
        });
    }

    /**
     * 更新視覺效果
     */
    updateEffects(deltaTime) {
        // 更新蒸汽
        this.effects.steam = this.effects.steam.filter(particle => {
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;
            particle.life -= deltaTime;
            particle.opacity = particle.life / 2.0;
            return particle.life > 0;
        });
        
        // 更新水滴
        this.effects.waterDrops = this.effects.waterDrops.filter(drop => {
            drop.x += drop.vx * deltaTime;
            drop.y += drop.vy * deltaTime;
            drop.life -= deltaTime;
            return drop.life > 0 && drop.y < this.gameArea.y + this.gameArea.height;
        });
        
        // 更新氣泡
        this.effects.bubbles = this.effects.bubbles.filter(bubble => {
            bubble.y += bubble.vy * deltaTime;
            bubble.life -= deltaTime;
            bubble.opacity = bubble.life / 2.0;
            return bubble.life > 0;
        });
    }

    /**
     * 更新UI顯示
     */
    updateUI() {
        if (this.tempLabel) {
            this.tempLabel.setText(`水溫: ${Math.round(this.gameState.waterTemp)}°C`);
        }
        
        if (this.amountLabel) {
            this.amountLabel.setText(`水量: ${Math.round(this.gameState.waterAmount)}%`);
        }
        
        if (this.timeLabel) {
            this.timeLabel.setText(`時間: ${Math.ceil(this.gameState.timeRemaining)}秒`);
        }
        
        if (this.accuracyLabel) {
            this.accuracyLabel.setText(`精確度: ${Math.round(this.gameState.accuracy)}%`);
        }
    }

    /**
     * 檢查完成條件
     */
    checkCompletion() {
        if (this.gameState.phase === 'completed') return;
        
        const criteria = this.completionCriteria;
        const state = this.gameState;
        
        // 檢查是否達到完成條件
        const tempInRange = state.waterTemp >= criteria.minTemp && state.waterTemp <= criteria.maxTemp;
        const amountInRange = state.waterAmount >= criteria.minWaterAmount && state.waterAmount <= criteria.maxWaterAmount;
        
        if (tempInRange && amountInRange) {
            this.completeGame(true);
        } else if (state.waterAmount >= 100) {
            // 水量過多，失敗
            this.completeGame(false);
        } else if (state.waterTemp >= 95) {
            // 溫度過高，失敗
            this.completeGame(false);
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
            waterAmount: Math.round(this.gameState.waterAmount),
            waterTemp: Math.round(this.gameState.waterTemp),
            timeUsed: 60 - this.gameState.timeRemaining
        };
        
        console.log('灌湯遊戲完成:', success ? '成功' : '失敗', stats);
        
        // 延遲調用完成回調，讓玩家看到結果
        setTimeout(() => {
            this.complete(success, stats);
        }, 1500);
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
            // 檢查加熱器按鈕
            if (this.isPointInRect(x, y, this.controls.heater)) {
                this.controls.heater.isPressed = true;
                return true;
            }
            
            // 檢查注入器按鈕
            if (this.isPointInRect(x, y, this.controls.injector)) {
                this.controls.injector.isPressed = true;
                return true;
            }
        } else if (event.type === 'mouseup' || event.type === 'touchend') {
            // 釋放所有按鈕
            this.controls.heater.isPressed = false;
            this.controls.injector.isPressed = false;
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
        
        // 渲染控制面板
        this.renderControls(context);
        
        // 渲染鴨子和水位
        this.renderDuckDisplay(context);
        
        // 渲染溫度計
        this.renderThermometer(context);
        
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
        context.fillStyle = 'rgba(240, 248, 255, 0.9)';
        context.fillRect(this.gameArea.x, this.gameArea.y, this.gameArea.width, this.gameArea.height);
        
        // 邊框
        context.strokeStyle = '#4169E1';
        context.lineWidth = 2;
        context.strokeRect(this.gameArea.x, this.gameArea.y, this.gameArea.width, this.gameArea.height);
    }

    /**
     * 渲染控制面板
     */
    renderControls(context) {
        // 渲染加熱器
        const heater = this.controls.heater;
        context.fillStyle = heater.isPressed ? '#FF6347' : '#FF4500';
        context.fillRect(heater.x, heater.y, heater.width, heater.height);
        
        context.strokeStyle = '#8B0000';
        context.lineWidth = 2;
        context.strokeRect(heater.x, heater.y, heater.width, heater.height);
        
        // 加熱器標籤
        context.fillStyle = '#FFFFFF';
        context.font = '14px Arial';
        context.textAlign = 'center';
        context.fillText('加熱', heater.x + heater.width / 2, heater.y + heater.height / 2 + 5);
        
        // 渲染注入器
        const injector = this.controls.injector;
        context.fillStyle = injector.isPressed ? '#00BFFF' : '#1E90FF';
        context.fillRect(injector.x, injector.y, injector.width, injector.height);
        
        context.strokeStyle = '#000080';
        context.lineWidth = 2;
        context.strokeRect(injector.x, injector.y, injector.width, injector.height);
        
        // 注入器標籤
        context.fillStyle = '#FFFFFF';
        context.fillText('注入', injector.x + injector.width / 2, injector.y + injector.height / 2 + 5);
    }

    /**
     * 渲染鴨子顯示
     */
    renderDuckDisplay(context) {
        const duck = this.duckDisplay;
        
        // 鴨子輪廓
        context.fillStyle = '#DEB887';
        context.fillRect(duck.x, duck.y, duck.width, duck.height);
        
        context.strokeStyle = '#8B7355';
        context.lineWidth = 2;
        context.strokeRect(duck.x, duck.y, duck.width, duck.height);
        
        // 水位顯示
        if (duck.waterLevel > 0) {
            const waterHeight = (duck.height * duck.waterLevel) / 100;
            context.fillStyle = 'rgba(30, 144, 255, 0.7)';
            context.fillRect(
                duck.x + 10,
                duck.y + duck.height - waterHeight - 10,
                duck.width - 20,
                waterHeight
            );
        }
        
        // 鴨子標籤
        context.fillStyle = '#000000';
        context.font = '12px Arial';
        context.textAlign = 'center';
        context.fillText('鴨腹', duck.x + duck.width / 2, duck.y - 10);
    }

    /**
     * 渲染溫度計
     */
    renderThermometer(context) {
        const thermo = this.controls.thermometer;
        
        // 溫度計主體
        context.fillStyle = '#FFFFFF';
        context.fillRect(thermo.x, thermo.y, thermo.width, thermo.height);
        
        context.strokeStyle = '#000000';
        context.lineWidth = 2;
        context.strokeRect(thermo.x, thermo.y, thermo.width, thermo.height);
        
        // 溫度指示
        const tempRatio = Math.min(1.0, this.gameState.waterTemp / 100);
        const tempHeight = thermo.height * tempRatio;
        
        // 溫度顏色
        let tempColor = '#4169E1'; // 藍色 - 低溫
        if (this.gameState.waterTemp > 50) tempColor = '#32CD32'; // 綠色
        if (this.gameState.waterTemp > 70) tempColor = '#FFD700'; // 黃色
        if (this.gameState.waterTemp > 85) tempColor = '#FF4500'; // 橙色
        if (this.gameState.waterTemp > 95) tempColor = '#FF0000'; // 紅色 - 過熱
        
        context.fillStyle = tempColor;
        context.fillRect(
            thermo.x + 2,
            thermo.y + thermo.height - tempHeight - 2,
            thermo.width - 4,
            tempHeight
        );
        
        // 目標溫度範圍標記
        const targetMinRatio = 80 / 100;
        const targetMaxRatio = 85 / 100;
        const targetMinY = thermo.y + thermo.height * (1 - targetMinRatio);
        const targetMaxY = thermo.y + thermo.height * (1 - targetMaxRatio);
        
        context.strokeStyle = '#00FF00';
        context.lineWidth = 3;
        context.beginPath();
        context.moveTo(thermo.x - 5, targetMinY);
        context.lineTo(thermo.x + thermo.width + 5, targetMinY);
        context.moveTo(thermo.x - 5, targetMaxY);
        context.lineTo(thermo.x + thermo.width + 5, targetMaxY);
        context.stroke();
    }

    /**
     * 渲染視覺效果
     */
    renderEffects(context) {
        // 渲染蒸汽
        this.effects.steam.forEach(particle => {
            context.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
            context.beginPath();
            context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            context.fill();
        });
        
        // 渲染水滴
        this.effects.waterDrops.forEach(drop => {
            context.fillStyle = `rgba(30, 144, 255, ${drop.life})`;
            context.beginPath();
            context.arc(drop.x, drop.y, drop.size, 0, Math.PI * 2);
            context.fill();
        });
        
        // 渲染氣泡
        this.effects.bubbles.forEach(bubble => {
            context.strokeStyle = `rgba(255, 255, 255, ${bubble.opacity})`;
            context.lineWidth = 1;
            context.beginPath();
            context.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
            context.stroke();
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
            success ? '灌湯完成！' : '需要重試',
            centerX,
            centerY - 20
        );
        
        context.font = '16px Arial';
        context.fillStyle = '#FFFFFF';
        context.fillText(
            `精確度: ${Math.round(this.gameState.accuracy)}%`,
            centerX,
            centerY + 20
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
        console.log('灌湯遊戲清理完成');
    }
}
// 匯出到全域作用域
window.WaterInjectionGame = WaterInjectionGame;
