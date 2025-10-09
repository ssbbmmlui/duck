/**
 * 懸掛和環境控制迷你遊戲
 * 玩家需要正確懸掛鴨胚並調節環境參數
 */
class HangingEnvironmentGame extends MiniGame {
    constructor(config) {
        super(config);
        
        this.name = '懸掛環境控制遊戲';
        this.gameEngine = config.gameEngine;
        this.scene = config.scene;
        this.gameAreaX = config.gameAreaX || 100;
        this.gameAreaY = config.gameAreaY || 140;
        this.gameAreaWidth = config.gameAreaWidth || 600;
        this.gameAreaHeight = config.gameAreaHeight || 320;
        
        // 遊戲狀態
        this.gameState = 'hanging'; // hanging, environment_control, completed
        this.isCompleted = false;
        this.score = 0;
        
        // 懸掛系統
        this.hangingSystem = {
            duck: {
                x: config.duckDisplay.x,
                y: config.duckDisplay.y,
                width: config.duckDisplay.width,
                height: config.duckDisplay.height,
                isDragging: false,
                isHanging: false,
                targetX: 350,
                targetY: 180,
                tolerance: 30
            },
            hook: {
                x: 350,
                y: 120,
                width: 20,
                height: 40,
                isActive: false
            },
            rope: {
                startX: 350,
                startY: 160,
                endX: 350,
                endY: 180,
                length: 20
            }
        };
        
        // 環境控制系統
        this.environmentControls = config.environmentControls;
        this.controlSliders = {
            temperature: {
                x: 480,
                y: 200,
                width: 100,
                height: 20,
                isDragging: false,
                value: this.environmentControls.temperature.current
            },
            humidity: {
                x: 480,
                y: 240,
                width: 100,
                height: 20,
                isDragging: false,
                value: this.environmentControls.humidity.current
            },
            airflow: {
                x: 480,
                y: 280,
                width: 100,
                height: 20,
                isDragging: false,
                value: this.environmentControls.airflow.current
            }
        };
        
        // 遊戲進度
        this.progress = {
            hangingCompleted: false,
            environmentOptimized: false,
            timeElapsed: 0,
            maxTime: 60 // 60秒完成
        };
        
        // 視覺反饋
        this.feedback = {
            showHangingGuide: true,
            showEnvironmentTips: false,
            currentTip: '',
            tipTimer: 0
        };
        
        // 粒子效果
        this.particles = [];
        
        // 進度回調
        this.onProgressUpdate = config.onProgressUpdate || (() => {});
    }

    /**
     * 開始遊戲
     */
    start() {
        super.start();
        console.log('懸掛環境控制遊戲開始');
        console.log('遊戲狀態:', this.gameState);
        console.log('鴨胚位置:', this.hangingSystem.duck);
        console.log('isActive:', this.isActive);

        this.gameState = 'hanging';
        this.showInstructions();

        // 初始化環境控制滑桿
        this.initializeSliders();
    }

    /**
     * 初始化滑桿
     */
    initializeSliders() {
        Object.keys(this.controlSliders).forEach(key => {
            const slider = this.controlSliders[key];
            const control = this.environmentControls[key];
            
            // 設置滑桿初始位置
            const normalizedValue = (control.current - control.min) / (control.max - control.min);
            slider.value = control.current;
            slider.position = normalizedValue * slider.width;
        });
    }

    /**
     * 顯示遊戲說明
     */
    showInstructions() {
        this.feedback.currentTip = '拖拽鴨胚到懸掛鉤上，然後調節環境參數';
        this.feedback.tipTimer = 3.0;
    }

    /**
     * 更新遊戲邏輯
     */
    update(deltaTime) {
        if (!this.isActive) return;
        
        this.progress.timeElapsed += deltaTime;
        
        // 更新提示計時器
        if (this.feedback.tipTimer > 0) {
            this.feedback.tipTimer -= deltaTime;
        }
        
        // 根據遊戲狀態更新
        if (this.gameState === 'hanging') {
            this.updateHangingPhase(deltaTime);
        } else if (this.gameState === 'environment_control') {
            this.updateEnvironmentPhase(deltaTime);
        }
        
        // 更新粒子效果
        this.updateParticles(deltaTime);
        
        // 檢查完成條件
        this.checkCompletion();
        
        // 更新進度回調
        this.updateProgressCallback();
    }

    /**
     * 更新懸掛階段
     */
    updateHangingPhase(deltaTime) {
        const duck = this.hangingSystem.duck;
        const hook = this.hangingSystem.hook;
        
        // 檢查鴨胚是否正確懸掛
        if (!duck.isHanging) {
            const distance = Math.sqrt(
                Math.pow(duck.x + duck.width/2 - hook.x, 2) + 
                Math.pow(duck.y - hook.y - hook.height, 2)
            );
            
            if (distance < duck.tolerance) {
                duck.isHanging = true;
                this.progress.hangingCompleted = true;
                this.gameState = 'environment_control';
                this.feedback.currentTip = '很好！現在調節溫度、濕度和通風參數';
                this.feedback.tipTimer = 3.0;
                this.score += 30;
                
                // 創建成功粒子效果
                this.createSuccessParticles(hook.x, hook.y);
            }
        }
    }

    /**
     * 更新環境控制階段
     */
    updateEnvironmentPhase(deltaTime) {
        // 檢查環境參數是否在最佳範圍內
        let optimalCount = 0;
        
        Object.keys(this.environmentControls).forEach(key => {
            const control = this.environmentControls[key];
            const optimal = control.optimal;
            
            if (control.current >= optimal.min && control.current <= optimal.max) {
                optimalCount++;
            }
        });
        
        // 如果所有參數都在最佳範圍內
        if (optimalCount === 3) {
            this.progress.environmentOptimized = true;
            this.feedback.currentTip = '環境參數已優化！';
            this.score += 50;
        } else {
            this.progress.environmentOptimized = false;
            this.updateEnvironmentTips();
        }
    }

    /**
     * 更新環境提示
     */
    updateEnvironmentTips() {
        const temp = this.environmentControls.temperature;
        const humid = this.environmentControls.humidity;
        const airflow = this.environmentControls.airflow;
        
        let tips = [];
        
        if (temp.current < temp.optimal.min) {
            tips.push('溫度過低，需要提高');
        } else if (temp.current > temp.optimal.max) {
            tips.push('溫度過高，需要降低');
        }
        
        if (humid.current < humid.optimal.min) {
            tips.push('濕度過低，需要增加');
        } else if (humid.current > humid.optimal.max) {
            tips.push('濕度過高，需要減少');
        }
        
        if (airflow.current < airflow.optimal.min) {
            tips.push('通風不足，需要加強');
        } else if (airflow.current > airflow.optimal.max) {
            tips.push('通風過強，需要減弱');
        }
        
        if (tips.length > 0 && this.feedback.tipTimer <= 0) {
            this.feedback.currentTip = tips[Math.floor(Math.random() * tips.length)];
            this.feedback.tipTimer = 2.0;
        }
    }

    /**
     * 更新粒子效果
     */
    updateParticles(deltaTime) {
        // 更新現有粒子
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;
            particle.life -= deltaTime;
            particle.opacity = particle.life / particle.maxLife;
            
            return particle.life > 0;
        });
        
        // 根據環境參數生成粒子
        this.generateEnvironmentParticles();
    }

    /**
     * 生成環境粒子
     */
    generateEnvironmentParticles() {
        const airflow = this.environmentControls.airflow.current;
        
        // 根據通風強度生成風粒子
        if (Math.random() < airflow * 0.02) {
            this.particles.push({
                x: this.gameAreaX,
                y: this.gameAreaY + Math.random() * this.gameAreaHeight,
                vx: airflow * 30 + Math.random() * 20,
                vy: (Math.random() - 0.5) * 10,
                life: 2.0,
                maxLife: 2.0,
                opacity: 0.6,
                size: 2 + Math.random() * 3,
                color: '#87CEEB'
            });
        }
    }

    /**
     * 創建成功粒子效果
     */
    createSuccessParticles(x, y) {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 100,
                vy: (Math.random() - 0.5) * 100,
                life: 1.5,
                maxLife: 1.5,
                opacity: 1.0,
                size: 3 + Math.random() * 4,
                color: '#FFD700'
            });
        }
    }

    /**
     * 檢查完成條件
     */
    checkCompletion() {
        if (this.progress.hangingCompleted && this.progress.environmentOptimized && !this.isCompleted) {
            this.completeGame(true);
        } else if (this.progress.timeElapsed > this.progress.maxTime && !this.isCompleted) {
            this.completeGame(false);
        }
    }

    /**
     * 更新進度回調
     */
    updateProgressCallback() {
        const progressData = {
            dryingProgress: this.progress.hangingCompleted ? 10 : 0,
            moistureLevel: 100,
            skinTightness: this.progress.environmentOptimized ? 5 : 0
        };
        
        this.onProgressUpdate(progressData);
    }

    /**
     * 處理輸入事件
     */
    handleInput(event) {
        console.log('HangingEnvironmentGame.handleInput called, isActive:', this.isActive, 'event:', event.type);
        if (!this.isActive) return false;

        const rect = this.gameEngine.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        console.log('Mouse position:', x, y, 'Game state:', this.gameState);

        if (event.type === 'mousedown') {
            return this.handleMouseDown(x, y);
        } else if (event.type === 'mousemove') {
            return this.handleMouseMove(x, y);
        } else if (event.type === 'mouseup') {
            return this.handleMouseUp(x, y);
        }

        return false;
    }

    /**
     * 處理滑鼠按下事件
     */
    handleMouseDown(x, y) {
        // 檢查是否點擊鴨胚（懸掛階段）
        if (this.gameState === 'hanging') {
            const duck = this.hangingSystem.duck;
            if (x >= duck.x && x <= duck.x + duck.width &&
                y >= duck.y && y <= duck.y + duck.height) {
                duck.isDragging = true;
                return true;
            }
        }
        
        // 檢查是否點擊滑桿（環境控制階段）
        if (this.gameState === 'environment_control') {
            Object.keys(this.controlSliders).forEach(key => {
                const slider = this.controlSliders[key];
                if (x >= slider.x && x <= slider.x + slider.width &&
                    y >= slider.y && y <= slider.y + slider.height) {
                    slider.isDragging = true;
                    this.updateSliderValue(key, x);
                }
            });
            return true;
        }
        
        return false;
    }

    /**
     * 處理滑鼠移動事件
     */
    handleMouseMove(x, y) {
        // 拖拽鴨胚
        if (this.gameState === 'hanging') {
            const duck = this.hangingSystem.duck;
            if (duck.isDragging) {
                duck.x = x - duck.width / 2;
                duck.y = y - duck.height / 2;
                return true;
            }
        }
        
        // 拖拽滑桿
        if (this.gameState === 'environment_control') {
            Object.keys(this.controlSliders).forEach(key => {
                const slider = this.controlSliders[key];
                if (slider.isDragging) {
                    this.updateSliderValue(key, x);
                }
            });
            return true;
        }
        
        return false;
    }

    /**
     * 處理滑鼠釋放事件
     */
    handleMouseUp(x, y) {
        // 停止拖拽鴨胚
        if (this.gameState === 'hanging') {
            this.hangingSystem.duck.isDragging = false;
        }
        
        // 停止拖拽滑桿
        Object.keys(this.controlSliders).forEach(key => {
            this.controlSliders[key].isDragging = false;
        });
        
        return false;
    }

    /**
     * 更新滑桿數值
     */
    updateSliderValue(sliderKey, mouseX) {
        const slider = this.controlSliders[sliderKey];
        const control = this.environmentControls[sliderKey];
        
        // 計算滑桿位置
        let position = mouseX - slider.x;
        position = Math.max(0, Math.min(slider.width, position));
        
        // 計算數值
        const normalizedValue = position / slider.width;
        const value = control.min + normalizedValue * (control.max - control.min);
        
        // 更新數值
        slider.value = Math.round(value);
        slider.position = position;
        control.current = slider.value;
        
        // 更新場景中的環境控制
        this.scene.environmentControls[sliderKey].current = slider.value;
    }

    /**
     * 渲染遊戲
     */
    render(context) {
        if (!this.isActive) return;
        
        // 渲染遊戲區域背景
        this.renderGameArea(context);
        
        // 根據遊戲狀態渲染不同內容
        if (this.gameState === 'hanging') {
            this.renderHangingPhase(context);
        } else if (this.gameState === 'environment_control') {
            this.renderEnvironmentPhase(context);
        }
        
        // 渲染粒子效果
        this.renderParticles(context);
        
        // 渲染UI元素
        this.renderUI(context);
    }

    /**
     * 渲染遊戲區域
     */
    renderGameArea(context) {
        // 遊戲區域背景
        context.fillStyle = 'rgba(240, 248, 255, 0.9)';
        context.fillRect(this.gameAreaX, this.gameAreaY, this.gameAreaWidth, this.gameAreaHeight);
        
        // 遊戲區域邊框
        context.strokeStyle = '#4682B4';
        context.lineWidth = 2;
        context.strokeRect(this.gameAreaX, this.gameAreaY, this.gameAreaWidth, this.gameAreaHeight);
    }

    /**
     * 渲染懸掛階段
     */
    renderHangingPhase(context) {
        const duck = this.hangingSystem.duck;
        const hook = this.hangingSystem.hook;
        const rope = this.hangingSystem.rope;
        
        // 渲染懸掛鉤
        context.fillStyle = '#8B4513';
        context.fillRect(hook.x - hook.width/2, hook.y, hook.width, hook.height);
        
        // 渲染懸掛鉤頭部
        context.beginPath();
        context.arc(hook.x, hook.y, 8, 0, Math.PI * 2);
        context.fill();
        
        // 渲染目標區域指示
        if (!duck.isHanging) {
            context.strokeStyle = '#32CD32';
            context.lineWidth = 3;
            context.setLineDash([5, 5]);
            context.strokeRect(
                hook.x - duck.tolerance,
                hook.y + hook.height - duck.tolerance,
                duck.tolerance * 2,
                duck.tolerance * 2
            );
            context.setLineDash([]);
        }
        
        // 渲染懸掛繩索（如果鴨胚已懸掛）
        if (duck.isHanging) {
            context.strokeStyle = '#654321';
            context.lineWidth = 3;
            context.beginPath();
            context.moveTo(hook.x, hook.y + hook.height);
            context.lineTo(duck.x + duck.width/2, duck.y);
            context.stroke();
        }
        
        // 渲染鴨胚
        context.fillStyle = duck.isDragging ? '#FFE4B5' : '#F5DEB3';
        context.fillRect(duck.x, duck.y, duck.width, duck.height);
        
        // 鴨胚邊框
        context.strokeStyle = duck.isDragging ? '#FF8C00' : '#D2B48C';
        context.lineWidth = 2;
        context.strokeRect(duck.x, duck.y, duck.width, duck.height);
        
        // 鴨胚標籤
        context.fillStyle = '#8B4513';
        context.font = '14px Microsoft JhengHei';
        context.textAlign = 'center';
        context.fillText('鴨胚', duck.x + duck.width/2, duck.y + duck.height/2 + 5);
    }

    /**
     * 渲染環境控制階段
     */
    renderEnvironmentPhase(context) {
        // 渲染已懸掛的鴨胚
        const duck = this.hangingSystem.duck;
        const hook = this.hangingSystem.hook;
        
        // 懸掛繩索
        context.strokeStyle = '#654321';
        context.lineWidth = 3;
        context.beginPath();
        context.moveTo(hook.x, hook.y + hook.height);
        context.lineTo(duck.targetX + duck.width/2, duck.targetY);
        context.stroke();
        
        // 鴨胚
        context.fillStyle = '#F5DEB3';
        context.fillRect(duck.targetX, duck.targetY, duck.width, duck.height);
        context.strokeStyle = '#D2B48C';
        context.lineWidth = 2;
        context.strokeRect(duck.targetX, duck.targetY, duck.width, duck.height);
        
        // 渲染環境控制滑桿
        this.renderEnvironmentSliders(context);
    }

    /**
     * 渲染環境控制滑桿
     */
    renderEnvironmentSliders(context) {
        const sliders = ['temperature', 'humidity', 'airflow'];
        const labels = ['溫度', '濕度', '通風'];
        const colors = ['#FF4500', '#4169E1', '#32CD32'];
        
        sliders.forEach((key, index) => {
            const slider = this.controlSliders[key];
            const control = this.environmentControls[key];
            const optimal = control.optimal;
            
            // 滑桿背景
            context.fillStyle = '#E0E0E0';
            context.fillRect(slider.x, slider.y, slider.width, slider.height);
            
            // 最佳範圍指示
            const optimalStart = ((optimal.min - control.min) / (control.max - control.min)) * slider.width;
            const optimalWidth = ((optimal.max - optimal.min) / (control.max - control.min)) * slider.width;
            
            context.fillStyle = 'rgba(50, 205, 50, 0.3)';
            context.fillRect(slider.x + optimalStart, slider.y, optimalWidth, slider.height);
            
            // 滑桿手柄
            const handleX = slider.x + ((slider.value - control.min) / (control.max - control.min)) * slider.width;
            context.fillStyle = colors[index];
            context.fillRect(handleX - 5, slider.y - 2, 10, slider.height + 4);
            
            // 滑桿邊框
            context.strokeStyle = '#808080';
            context.lineWidth = 1;
            context.strokeRect(slider.x, slider.y, slider.width, slider.height);
            
            // 標籤和數值
            context.fillStyle = '#2F4F4F';
            context.font = '12px Microsoft JhengHei';
            context.textAlign = 'left';
            context.fillText(`${labels[index]}: ${slider.value}`, slider.x - 60, slider.y + 15);
            
            // 範圍標籤
            context.font = '10px Microsoft JhengHei';
            context.fillText(`${control.min}`, slider.x - 15, slider.y + 30);
            context.textAlign = 'right';
            context.fillText(`${control.max}`, slider.x + slider.width + 15, slider.y + 30);
            context.textAlign = 'left';
        });
    }

    /**
     * 渲染粒子效果
     */
    renderParticles(context) {
        context.save();
        
        this.particles.forEach(particle => {
            context.globalAlpha = particle.opacity;
            context.fillStyle = particle.color;
            context.beginPath();
            context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            context.fill();
        });
        
        context.restore();
    }

    /**
     * 渲染UI元素
     */
    renderUI(context) {
        // 渲染遊戲標題
        context.fillStyle = '#2F4F4F';
        context.font = 'bold 16px Microsoft JhengHei';
        context.textAlign = 'center';
        context.fillText('懸掛和環境控制', this.gameAreaX + this.gameAreaWidth/2, this.gameAreaY - 10);
        
        // 渲染進度指示
        this.renderProgressIndicator(context);
        
        // 渲染提示信息
        if (this.feedback.tipTimer > 0) {
            this.renderTip(context);
        }
        
        // 渲染時間剩餘
        this.renderTimeRemaining(context);
    }

    /**
     * 渲染進度指示器
     */
    renderProgressIndicator(context) {
        const x = this.gameAreaX + 10;
        const y = this.gameAreaY + 10;
        
        // 懸掛進度
        const hangingStatus = this.progress.hangingCompleted ? '✅' : '⏳';
        context.fillStyle = '#2F4F4F';
        context.font = '14px Microsoft JhengHei';
        context.textAlign = 'left';
        context.fillText(`${hangingStatus} 懸掛鴨胚`, x, y);
        
        // 環境控制進度
        const envStatus = this.progress.environmentOptimized ? '✅' : '⏳';
        context.fillText(`${envStatus} 環境控制`, x, y + 20);
    }

    /**
     * 渲染提示信息
     */
    renderTip(context) {
        const x = this.gameAreaX + this.gameAreaWidth/2;
        const y = this.gameAreaY + this.gameAreaHeight - 30;
        
        // 提示背景
        const textWidth = context.measureText(this.feedback.currentTip).width;
        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.fillRect(x - textWidth/2 - 10, y - 20, textWidth + 20, 25);
        
        // 提示文字
        context.fillStyle = '#FFFFFF';
        context.font = '14px Microsoft JhengHei';
        context.textAlign = 'center';
        context.fillText(this.feedback.currentTip, x, y - 5);
    }

    /**
     * 渲染剩餘時間
     */
    renderTimeRemaining(context) {
        const timeLeft = Math.max(0, this.progress.maxTime - this.progress.timeElapsed);
        const minutes = Math.floor(timeLeft / 60);
        const seconds = Math.floor(timeLeft % 60);
        
        context.fillStyle = timeLeft < 10 ? '#FF6B6B' : '#2F4F4F';
        context.font = '14px Microsoft JhengHei';
        context.textAlign = 'right';
        context.fillText(
            `剩餘時間: ${minutes}:${seconds.toString().padStart(2, '0')}`,
            this.gameAreaX + this.gameAreaWidth - 10,
            this.gameAreaY + 25
        );
    }

    /**
     * 完成遊戲
     */
    completeGame(success) {
        this.isCompleted = true;
        
        if (success) {
            // 計算最終分數
            const timeBonus = Math.max(0, (this.progress.maxTime - this.progress.timeElapsed) / this.progress.maxTime * 20);
            this.score += Math.round(timeBonus);
            
            console.log(`懸掛環境控制遊戲成功完成，分數: ${this.score}`);
        } else {
            console.log('懸掛環境控制遊戲失敗');
            this.score = Math.max(10, this.score); // 最低分數
        }
        
        // 調用完成回調
        if (this.onComplete) {
            this.onComplete(success, { score: this.score, timeUsed: this.progress.timeElapsed });
        }
    }

    /**
     * 清理遊戲資源
     */
    cleanup() {
        super.cleanup();
        this.particles = [];
        console.log('懸掛環境控制遊戲清理完成');
    }
}
// 匯出到全域作用域
window.HangingEnvironmentGame = HangingEnvironmentGame;
