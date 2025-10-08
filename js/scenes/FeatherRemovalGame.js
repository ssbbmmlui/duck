/**
 * 褪毛迷你遊戲
 * 玩家需要點擊和拖拽來移除鴨子身上的羽毛
 */
class FeatherRemovalGame extends MiniGame {
    constructor(config = {}) {
        super({
            name: '褪毛遊戲',
            timeLimit: 60000, // 60秒時間限制
            successThreshold: 1.0, // 需要移除所有羽毛
            ...config
        });
        
        // 羽毛系統
        this.feathers = [];
        this.totalFeathers = 15; // 總羽毛數量
        this.removedFeathers = 0;
        
        // 互動狀態
        this.isDragging = false;
        this.dragStartPos = null;
        this.currentFeather = null;
        
        // 視覺效果
        this.particles = []; // 羽毛移除時的粒子效果
        this.hotWaterEffect = {
            active: false,
            x: 0,
            y: 0,
            radius: 0,
            maxRadius: 150 // 增加範圍以覆蓋整隻鴨子
        };
        
        // 鴨子圖像
        this.duckImage = null;
        this.duckPosition = {
            x: this.gameArea.x + this.gameArea.width / 2 - 100,
            y: this.gameArea.y + this.gameArea.height / 2 - 75,
            width: 200,
            height: 150
        };
        
        // 工具狀態
        this.currentTool = 'hand'; // hand, hot_water
        this.hotWaterUsed = false;
    }

    /**
     * 設置遊戲
     */
    setupGame() {
        this.createFeathers();
        this.loadAssets();
        
        // 重置狀態
        this.removedFeathers = 0;
        this.hotWaterUsed = false;
        this.particles = [];
        this.updateProgress(0);
    }

    /**
     * 載入資源
     */
    loadAssets() {
        if (this.gameEngine && this.gameEngine.assetManager) {
            const assetManager = this.gameEngine.assetManager;
            this.duckImage = assetManager.getAsset('processing_duck');
        }
    }

    /**
     * 創建羽毛
     */
    createFeathers() {
        this.feathers = [];
        const duck = this.duckPosition;
        
        // 在鴨子身上隨機分佈羽毛
        for (let i = 0; i < this.totalFeathers; i++) {
            const feather = {
                id: i,
                x: duck.x + Math.random() * duck.width,
                y: duck.y + Math.random() * duck.height,
                size: 8 + Math.random() * 12, // 羽毛大小
                type: Math.random() > 0.85 ? 'stubborn' : 'normal', // 只有15%是頑固羽毛
                removed: false,
                softened: false, // 是否被熱水軟化
                angle: Math.random() * Math.PI * 2,
                color: this.getFeatherColor()
            };
            
            this.feathers.push(feather);
        }
    }

    /**
     * 獲取羽毛顏色
     */
    getFeatherColor() {
        const colors = ['#FFFFFF', '#F5F5F5', '#E8E8E8', '#DCDCDC'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * 獲取遊戲說明
     */
    getInstructions() {
        if (!this.hotWaterUsed) {
            return '先用熱水燙毛軟化羽毛，然後點擊拖拽移除羽毛';
        }
        return '點擊並拖拽移除羽毛，注意順著羽毛生長方向';
    }

    /**
     * 創建UI
     */
    createUI() {
        super.createUI();
        
        if (!this.gameEngine || !this.gameEngine.uiManager) return;
        
        const uiManager = this.gameEngine.uiManager;
        
        // 創建工具按鈕 - 更好的布局
        this.hotWaterButton = uiManager.createButton({
            x: this.gameArea.x + 20,
            y: this.gameArea.y + 15,
            width: 100,
            height: 40,
            text: '熱水燙毛',
            onClick: () => this.selectTool('hot_water')
        });

        this.handButton = uiManager.createButton({
            x: this.gameArea.x + 130,
            y: this.gameArea.y + 15,
            width: 100,
            height: 40,
            text: '手工拔毛',
            onClick: () => this.selectTool('hand')
        });

        // 創建羽毛計數器 - 更清晰的位置
        this.featherCounter = uiManager.createLabel({
            x: this.gameArea.x + this.gameArea.width - 20,
            y: this.gameArea.y + 35,
            text: `剩餘: ${this.totalFeathers - this.removedFeathers}`,
            fontSize: 18,
            color: '#2563eb',
            align: 'right'
        });

        this.uiElements.push(this.hotWaterButton, this.handButton, this.featherCounter);

        // 設置初始工具
        this.selectTool('hot_water');
    }

    /**
     * 選擇工具
     */
    selectTool(tool) {
        // 如果選擇熱水但已經用過，則不允許
        if (tool === 'hot_water' && this.hotWaterUsed) {
            this.showMessage('熱水已經使用過了！請用手工拔毛。');
            return;
        }

        this.currentTool = tool;

        // 更新說明文字
        if (this.instructions) {
            if (tool === 'hot_water') {
                this.instructions.setText('點擊鴨子使用熱水軟化羽毛（僅能使用一次）');
            } else {
                this.instructions.setText('點擊並拖拽移除軟化的羽毛');
            }
        }
    }

    /**
     * 更新遊戲邏輯
     */
    updateGame(deltaTime) {
        // 更新粒子效果
        this.updateParticles(deltaTime);
        
        // 更新熱水效果
        this.updateHotWaterEffect(deltaTime);
        
        // 更新羽毛計數器
        if (this.featherCounter) {
            this.featherCounter.setText(`剩餘羽毛: ${this.totalFeathers - this.removedFeathers}`);
        }
        
        // 更新進度
        const progress = this.removedFeathers / this.totalFeathers;
        this.updateProgress(progress);
    }

    /**
     * 更新粒子效果
     */
    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.x += particle.vx * deltaTime / 16;
            particle.y += particle.vy * deltaTime / 16;
            particle.life -= deltaTime / 16;
            particle.alpha = Math.max(0, particle.life / particle.maxLife);
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    /**
     * 更新熱水效果
     */
    updateHotWaterEffect(deltaTime) {
        if (this.hotWaterEffect.active) {
            this.hotWaterEffect.radius += deltaTime * 0.3;
            
            if (this.hotWaterEffect.radius >= this.hotWaterEffect.maxRadius) {
                this.hotWaterEffect.active = false;
                this.hotWaterEffect.radius = 0;
                
                // 軟化範圍內的羽毛
                this.softenFeathersInRange(
                    this.hotWaterEffect.x,
                    this.hotWaterEffect.y,
                    this.hotWaterEffect.maxRadius
                );
            }
        }
    }

    /**
     * 軟化範圍內的羽毛
     */
    softenFeathersInRange(x, y, radius) {
        this.feathers.forEach(feather => {
            if (!feather.removed) {
                const distance = Math.sqrt(
                    Math.pow(feather.x - x, 2) + Math.pow(feather.y - y, 2)
                );

                if (distance <= radius) {
                    feather.softened = true;
                }
            }
        });

        console.log('羽毛已軟化，現在可以用手拔除');

        // 禁用熱水按鈕
        if (this.hotWaterButton) {
            this.hotWaterButton.setEnabled(false);
            this.hotWaterButton.setText('已使用');
        }

        // 自動切換到手工工具
        this.currentTool = 'hand';
    }

    /**
     * 渲染遊戲內容
     */
    renderGame(context) {
        // 渲染鴨子
        this.renderDuck(context);
        
        // 渲染羽毛
        this.renderFeathers(context);
        
        // 渲染熱水效果
        this.renderHotWaterEffect(context);
        
        // 渲染粒子效果
        this.renderParticles(context);
        
        // 渲染工具提示
        this.renderToolHint(context);
    }

    /**
     * 渲染鴨子
     */
    renderDuck(context) {
        const duck = this.duckPosition;
        
        if (this.duckImage) {
            context.drawImage(this.duckImage, duck.x, duck.y, duck.width, duck.height);
        } else {
            // 繪製佔位符
            context.fillStyle = '#F5DEB3';
            context.fillRect(duck.x, duck.y, duck.width, duck.height);
            
            context.strokeStyle = '#8B4513';
            context.lineWidth = 2;
            context.strokeRect(duck.x, duck.y, duck.width, duck.height);
            
            context.fillStyle = '#654321';
            context.font = '16px Microsoft JhengHei';
            context.textAlign = 'center';
            context.fillText('鴨子', duck.x + duck.width / 2, duck.y + duck.height / 2);
        }
    }

    /**
     * 渲染羽毛
     */
    renderFeathers(context) {
        this.feathers.forEach(feather => {
            if (feather.removed) return;
            
            context.save();
            context.translate(feather.x, feather.y);
            context.rotate(feather.angle);
            
            // 根據狀態設置顏色
            if (feather.softened) {
                context.fillStyle = feather.color;
                context.strokeStyle = '#32CD32'; // 綠色邊框表示已軟化
                context.lineWidth = 2;
            } else if (feather.type === 'stubborn') {
                context.fillStyle = '#D3D3D3'; // 頑固羽毛顏色較深
                context.strokeStyle = '#FF6B6B'; // 紅色邊框表示需要熱水
                context.lineWidth = 1;
            } else {
                context.fillStyle = feather.color;
                context.strokeStyle = '#CCCCCC';
                context.lineWidth = 1;
            }
            
            // 繪製羽毛形狀
            context.beginPath();
            context.ellipse(0, 0, feather.size / 2, feather.size, 0, 0, Math.PI * 2);
            context.fill();
            context.stroke();
            
            // 繪製羽毛紋理
            context.strokeStyle = 'rgba(0, 0, 0, 0.3)';
            context.lineWidth = 1;
            context.beginPath();
            context.moveTo(-feather.size / 4, -feather.size / 2);
            context.lineTo(feather.size / 4, feather.size / 2);
            context.stroke();
            
            context.restore();
        });
    }

    /**
     * 渲染熱水效果
     */
    renderHotWaterEffect(context) {
        if (!this.hotWaterEffect.active) return;
        
        const effect = this.hotWaterEffect;
        
        // 繪製熱水波紋
        context.save();
        context.globalAlpha = 0.6;
        
        for (let i = 0; i < 3; i++) {
            const radius = effect.radius - i * 15;
            if (radius > 0) {
                context.strokeStyle = `hsl(200, 70%, ${50 + i * 10}%)`;
                context.lineWidth = 3 - i;
                context.beginPath();
                context.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
                context.stroke();
            }
        }
        
        context.restore();
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
            context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            context.fill();
            
            context.restore();
        });
    }

    /**
     * 渲染工具提示
     */
    renderToolHint(context) {
        const hintY = this.gameArea.y + this.gameArea.height - 30;

        context.fillStyle = '#2d3748';
        context.font = '14px Microsoft JhengHei';
        context.textAlign = 'left';

        if (this.currentTool === 'hot_water' && !this.hotWaterUsed) {
            context.fillText('💧 熱水工具已選擇 - 點擊鴨子進行燙毛（僅能使用一次）', this.gameArea.x + 10, hintY);
        } else if (this.currentTool === 'hot_water' && this.hotWaterUsed) {
            context.fillStyle = '#e53e3e';
            context.fillText('❌ 熱水已使用完畢 - 請切換到手工拔毛', this.gameArea.x + 10, hintY);
        } else {
            context.fillText('✋ 手工工具已選擇 - 拖拽移除軟化的羽毛', this.gameArea.x + 10, hintY);
        }
    }

    /**
     * 處理遊戲特定輸入
     */
    handleGameInput(event) {
        if (event.type === 'mousedown') {
            return this.handleClick(event.x, event.y);
        } else if (event.type === 'click' && this.currentTool === 'hot_water') {
            return this.handleClick(event.x, event.y);
        } else if (event.type === 'mousemove') {
            if (this.isDragging) {
                return this.handleDrag(event.x, event.y);
            }
            return false;
        } else if (event.type === 'mouseup') {
            if (this.isDragging) {
                return this.handleDragEnd(event.x, event.y);
            }
            return false;
        }

        return false;
    }

    /**
     * 處理點擊
     */
    handleClick(x, y) {
        if (this.currentTool === 'hot_water') {
            return this.useHotWater(x, y);
        } else if (this.currentTool === 'hand') {
            return this.startFeatherRemoval(x, y);
        }
        
        return false;
    }

    /**
     * 使用熱水
     */
    useHotWater(x, y) {
        // 檢查是否點擊在鴨子上
        const duck = this.duckPosition;
        if (x >= duck.x && x <= duck.x + duck.width &&
            y >= duck.y && y <= duck.y + duck.height) {

            this.hotWaterEffect.active = true;
            // 將熱水效果置於鴨子中心，確保覆蓋所有羽毛
            this.hotWaterEffect.x = duck.x + duck.width / 2;
            this.hotWaterEffect.y = duck.y + duck.height / 2;
            this.hotWaterEffect.radius = 0;
            this.hotWaterUsed = true;

            // 播放音效
            if (this.gameEngine.gameState.settings.soundEnabled) {
                this.gameEngine.audioManager.playSound('water_splash');
            }

            return true;
        }

        return false;
    }

    /**
     * 開始羽毛移除
     */
    startFeatherRemoval(x, y) {
        // 查找點擊的羽毛
        const clickedFeather = this.findFeatherAt(x, y);
        
        if (clickedFeather && !clickedFeather.removed) {
            if (!clickedFeather.softened && clickedFeather.type === 'stubborn') {
                // 頑固羽毛需要先軟化
                this.showMessage('這根羽毛太頑固，需要先用熱水軟化！');
                return false;
            }
            
            this.isDragging = true;
            this.dragStartPos = { x, y };
            this.currentFeather = clickedFeather;
            
            return true;
        }
        
        return false;
    }

    /**
     * 處理拖拽
     */
    handleDrag(x, y) {
        if (!this.isDragging || !this.currentFeather) return false;
        
        // 計算拖拽距離
        const dragDistance = Math.sqrt(
            Math.pow(x - this.dragStartPos.x, 2) + 
            Math.pow(y - this.dragStartPos.y, 2)
        );
        
        // 如果拖拽距離足夠，移除羽毛
        if (dragDistance > 20) {
            this.removeFeather(this.currentFeather);
            this.isDragging = false;
            this.currentFeather = null;
        }
        
        return true;
    }

    /**
     * 處理拖拽結束
     */
    handleDragEnd(x, y) {
        if (this.isDragging) {
            this.isDragging = false;
            this.currentFeather = null;
        }
        
        return true;
    }

    /**
     * 查找指定位置的羽毛
     */
    findFeatherAt(x, y) {
        for (let feather of this.feathers) {
            if (feather.removed) continue;
            
            const distance = Math.sqrt(
                Math.pow(x - feather.x, 2) + Math.pow(y - feather.y, 2)
            );
            
            if (distance <= feather.size) {
                return feather;
            }
        }
        
        return null;
    }

    /**
     * 移除羽毛
     */
    removeFeather(feather) {
        feather.removed = true;
        this.removedFeathers++;

        // 更新計數器
        if (this.featherCounter) {
            this.featherCounter.setText(`剩餘: ${this.totalFeathers - this.removedFeathers}`);
        }

        // 創建粒子效果
        this.createRemovalParticles(feather.x, feather.y);

        // 播放音效
        if (this.gameEngine.gameState.settings.soundEnabled) {
            this.gameEngine.audioManager.playSound('feather_remove');
        }

        // 更新進度
        const progress = this.removedFeathers / this.totalFeathers;
        this.updateProgress(progress);

        console.log(`移除羽毛，剩餘: ${this.totalFeathers - this.removedFeathers}, 進度: ${progress}, 已完成: ${this.isCompleted}`);
    }

    /**
     * 創建移除粒子效果
     */
    createRemovalParticles(x, y) {
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                size: 2 + Math.random() * 3,
                color: '#FFFFFF',
                life: 30,
                maxLife: 30,
                alpha: 1
            });
        }
    }

    /**
     * 顯示消息
     */
    showMessage(text) {
        if (this.gameEngine && this.gameEngine.uiManager) {
            const messageLabel = this.gameEngine.uiManager.createLabel({
                x: this.gameArea.x + this.gameArea.width / 2,
                y: this.gameArea.y + 50,
                text: text,
                fontSize: 14,
                color: '#FF6B6B',
                align: 'center'
            });
            
            setTimeout(() => {
                this.gameEngine.uiManager.removeUIElement(messageLabel);
            }, 2000);
        }
    }

    /**
     * 計算準確度獎勵
     */
    calculateAccuracyBonus() {
        // 基於是否正確使用熱水和移除效率
        let bonus = 0;
        
        if (this.hotWaterUsed) {
            bonus += 30; // 正確使用熱水獎勵
        }
        
        // 基於移除速度的獎勵
        const gameTime = this.stats.endTime - this.stats.startTime;
        if (gameTime < 30000) { // 30秒內完成
            bonus += 20;
        } else if (gameTime < 45000) { // 45秒內完成
            bonus += 10;
        }
        
        return bonus;
    }
}
// 匯出到全域作用域
window.FeatherRemovalGame = FeatherRemovalGame;
