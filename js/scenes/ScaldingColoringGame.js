/**
 * 燙皮上糖色迷你遊戲
 * 玩家需要控制熱水澆淋時間和位置，然後均勻塗抹糖漿
 */
class ScaldingColoringGame extends MiniGame {
    constructor(config = {}) {
        super({
            name: '燫皮上糖色遊戲',
            timeLimit: 120000, // 120秒時間限制
            successThreshold: 0.85, // 需要達到85%完成度
            ...config
        });
        
        // 燙皮系統
        this.scaldingPhase = {
            active: false,
            waterTemperature: 85, // 水溫度
            optimalTemp: { min: 85, max: 90 },
            scaldingAreas: [], // 已燙皮的區域
            totalAreas: 12, // 需要燙皮的總區域數
            currentArea: null,
            waterFlow: {
                x: 0,
                y: 0,
                active: false,
                intensity: 0
            }
        };
        
        // 上糖色系統
        this.coloringPhase = {
            active: false,
            sugarSyrup: {
                concentration: 75, // 糖漿濃度
                temperature: 40, // 糖漿溫度
                optimalConcentration: { min: 70, max: 80 }
            },
            coloringAreas: [], // 已上色的區域
            totalAreas: 15, // 需要上色的總區域數
            brush: {
                x: 0,
                y: 0,
                size: 20,
                isApplying: false,
                syrupAmount: 100 // 刷子上的糖漿量
            },
            uniformity: 0 // 均勻度 0-100
        };
        
        // 鴨胚狀態
        this.duckEmbryo = {
            x: this.gameArea ? this.gameArea.x + this.gameArea.width / 2 - 120 : 300,
            y: this.gameArea ? this.gameArea.y + this.gameArea.height / 2 - 90 : 200,
            width: 240,
            height: 180,
            scaldingProgress: 0, // 燙皮進度 0-100
            coloringProgress: 0, // 上色進度 0-100
            skinTightness: 0, // 皮膚緊實度
            colorUniformity: 0 // 顏色均勻度
        };
        
        // 工具系統
        this.tools = {
            hotWaterPot: {
                x: this.gameArea ? this.gameArea.x + 50 : 100,
                y: this.gameArea ? this.gameArea.y + this.gameArea.height - 100 : 400,
                width: 60,
                height: 60,
                isActive: false,
                temperature: 85
            },
            sugarBrush: {
                x: this.gameArea ? this.gameArea.x + 150 : 200,
                y: this.gameArea ? this.gameArea.y + this.gameArea.height - 100 : 400,
                width: 50,
                height: 80,
                isActive: false,
                syrupLevel: 100
            }
        };
        
        // 視覺效果
        this.steamParticles = [];
        this.sugarGlaze = [];
        this.waterDroplets = [];
        
        // 遊戲階段
        this.gamePhase = 'scalding'; // scalding, coloring
        this.scaldingCompleted = false;
        this.coloringCompleted = false;
        
        // 美拉德反應效果
        this.maillardReaction = {
            active: false,
            intensity: 0,
            areas: []
        };
        
        // 初始化燙皮和上色區域
        this.initializeAreas();
    }

    /**
     * 初始化燙皮和上色區域
     */
    initializeAreas() {
        const duck = this.duckEmbryo;
        
        // 創建燙皮區域
        this.scaldingPhase.scaldingAreas = [];
        for (let i = 0; i < this.scaldingPhase.totalAreas; i++) {
            this.scaldingPhase.scaldingAreas.push({
                id: i,
                x: duck.x + (i % 4) * (duck.width / 4) + Math.random() * 20,
                y: duck.y + Math.floor(i / 4) * (duck.height / 3) + Math.random() * 20,
                width: 40,
                height: 30,
                scalded: false,
                scaldingTime: 0,
                requiredTime: 2000 + Math.random() * 1000 // 2-3秒
            });
        }
        
        // 創建上色區域
        this.coloringPhase.coloringAreas = [];
        for (let i = 0; i < this.coloringPhase.totalAreas; i++) {
            this.coloringPhase.coloringAreas.push({
                id: i,
                x: duck.x + (i % 5) * (duck.width / 5) + Math.random() * 15,
                y: duck.y + Math.floor(i / 5) * (duck.height / 3) + Math.random() * 15,
                width: 35,
                height: 25,
                colored: false,
                colorIntensity: 0, // 0-100
                syrupThickness: 0 // 糖漿厚度
            });
        }
    }

    /**
     * 設置遊戲
     */
    setupGame() {
        this.loadAssets();
        
        // 重置狀態
        this.gamePhase = 'scalding';
        this.scaldingCompleted = false;
        this.coloringCompleted = false;
        this.scaldingPhase.active = false;
        this.coloringPhase.active = false;
        this.steamParticles = [];
        this.sugarGlaze = [];
        this.waterDroplets = [];
        
        // 重置鴨胚狀態
        this.duckEmbryo.scaldingProgress = 0;
        this.duckEmbryo.coloringProgress = 0;
        this.duckEmbryo.skinTightness = 0;
        this.duckEmbryo.colorUniformity = 0;
        
        // 重置區域狀態
        this.scaldingPhase.scaldingAreas.forEach(area => {
            area.scalded = false;
            area.scaldingTime = 0;
        });
        
        this.coloringPhase.coloringAreas.forEach(area => {
            area.colored = false;
            area.colorIntensity = 0;
            area.syrupThickness = 0;
        });
        
        this.updateProgress(0);
    }

    /**
     * 載入資源
     */
    loadAssets() {
        if (this.gameEngine && this.gameEngine.assetManager) {
            const assetManager = this.gameEngine.assetManager;
            this.duckImage = assetManager.getAsset('duck_inflated');
            this.hotWaterImage = assetManager.getAsset('hot_water_pot');
            this.brushImage = assetManager.getAsset('sugar_syrup');
            this.steamImage = assetManager.getAsset('steam_effect');
            this.glazeImage = assetManager.getAsset('sugar_glaze');
        }
    }

    /**
     * 獲取遊戲說明
     */
    getInstructions() {
        if (this.gamePhase === 'scalding') {
            return '拖拽熱水壺澆淋鴨胚，控制時間和位置使皮膚緊實';
        } else {
            return '用刷子均勻塗抹糖漿，創造美麗的糖色效果';
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
            text: '階段: 燙皮',
            fontSize: 16,
            color: '#FF4500',
            align: 'left'
        });
        
        // 創建溫度指示器
        this.temperatureLabel = uiManager.createLabel({
            x: this.gameArea.x + 20,
            y: this.gameArea.y + 50,
            text: `水溫: ${this.scaldingPhase.waterTemperature}°C`,
            fontSize: 14,
            color: '#FF6B6B',
            align: 'left'
        });
        
        // 創建燙皮進度標籤
        this.scaldingProgressLabel = uiManager.createLabel({
            x: this.gameArea.x + 20,
            y: this.gameArea.y + 80,
            text: `燙皮進度: ${Math.round(this.duckEmbryo.scaldingProgress)}%`,
            fontSize: 14,
            color: '#FF8C00',
            align: 'left'
        });
        
        // 創建上色進度標籤
        this.coloringProgressLabel = uiManager.createLabel({
            x: this.gameArea.x + 20,
            y: this.gameArea.y + 110,
            text: `上色進度: ${Math.round(this.duckEmbryo.coloringProgress)}%`,
            fontSize: 14,
            color: '#DAA520',
            align: 'left'
        });
        
        // 創建均勻度標籤
        this.uniformityLabel = uiManager.createLabel({
            x: this.gameArea.x + 20,
            y: this.gameArea.y + 140,
            text: `均勻度: ${Math.round(this.coloringPhase.uniformity)}%`,
            fontSize: 14,
            color: '#B8860B',
            align: 'left'
        });
        
        this.uiElements.push(
            this.phaseIndicator,
            this.temperatureLabel,
            this.scaldingProgressLabel,
            this.coloringProgressLabel,
            this.uniformityLabel
        );
    }

    /**
     * 更新遊戲邏輯
     */
    updateGame(deltaTime) {
        // 更新燙皮系統
        this.updateScaldingSystem(deltaTime);
        
        // 更新上色系統
        this.updateColoringSystem(deltaTime);
        
        // 更新視覺效果
        this.updateVisualEffects(deltaTime);
        
        // 更新美拉德反應
        this.updateMaillardReaction(deltaTime);
        
        // 更新UI標籤
        this.updateUILabels();
        
        // 檢查階段轉換
        this.checkPhaseTransition();
        
        // 更新總進度
        this.updateTotalProgress();
    }

    /**
     * 更新燙皮系統
     */
    updateScaldingSystem(deltaTime) {
        if (this.gamePhase !== 'scalding') return;
        
        // 更新燙皮區域
        if (this.scaldingPhase.waterFlow.active) {
            const waterFlow = this.scaldingPhase.waterFlow;
            
            // 檢查水流覆蓋的區域
            this.scaldingPhase.scaldingAreas.forEach(area => {
                if (!area.scalded) {
                    const distance = Math.sqrt(
                        Math.pow(waterFlow.x - (area.x + area.width / 2), 2) +
                        Math.pow(waterFlow.y - (area.y + area.height / 2), 2)
                    );
                    
                    if (distance < 30) { // 水流覆蓋範圍
                        area.scaldingTime += deltaTime;
                        
                        if (area.scaldingTime >= area.requiredTime) {
                            area.scalded = true;
                            this.createScaldingEffect(area.x + area.width / 2, area.y + area.height / 2);
                        }
                    }
                }
            });
            
            // 創建蒸汽粒子
            if (Math.random() < 0.4) {
                this.createSteamParticle(waterFlow.x, waterFlow.y);
            }
            
            // 創建水滴效果
            if (Math.random() < 0.6) {
                this.createWaterDroplet(waterFlow.x, waterFlow.y);
            }
        }
        
        // 計算燙皮進度
        const scaldedAreas = this.scaldingPhase.scaldingAreas.filter(area => area.scalded).length;
        this.duckEmbryo.scaldingProgress = (scaldedAreas / this.scaldingPhase.totalAreas) * 100;
        this.duckEmbryo.skinTightness = this.duckEmbryo.scaldingProgress;
    }

    /**
     * 更新上色系統
     */
    updateColoringSystem(deltaTime) {
        if (this.gamePhase !== 'coloring') return;
        
        // 更新刷子上色
        if (this.coloringPhase.brush.isApplying) {
            const brush = this.coloringPhase.brush;
            
            // 檢查刷子覆蓋的區域
            this.coloringPhase.coloringAreas.forEach(area => {
                const distance = Math.sqrt(
                    Math.pow(brush.x - (area.x + area.width / 2), 2) +
                    Math.pow(brush.y - (area.y + area.height / 2), 2)
                );
                
                if (distance < brush.size && brush.syrupAmount > 0) {
                    area.colorIntensity += deltaTime * 0.05;
                    area.syrupThickness += deltaTime * 0.03;
                    brush.syrupAmount -= deltaTime * 0.02;
                    
                    area.colorIntensity = Math.min(100, area.colorIntensity);
                    area.syrupThickness = Math.min(100, area.syrupThickness);
                    brush.syrupAmount = Math.max(0, brush.syrupAmount);
                    
                    if (area.colorIntensity >= 80 && !area.colored) {
                        area.colored = true;
                        this.createColoringEffect(area.x + area.width / 2, area.y + area.height / 2);
                    }
                }
            });
            
            // 創建糖漿光澤效果
            if (Math.random() < 0.3) {
                this.createSugarGlazeEffect(brush.x, brush.y);
            }
        }
        
        // 計算上色進度
        const coloredAreas = this.coloringPhase.coloringAreas.filter(area => area.colored).length;
        this.duckEmbryo.coloringProgress = (coloredAreas / this.coloringPhase.totalAreas) * 100;
        
        // 計算均勻度
        this.calculateColoringUniformity();
    }

    /**
     * 計算上色均勻度
     */
    calculateColoringUniformity() {
        const areas = this.coloringPhase.coloringAreas;
        let totalVariance = 0;
        let avgIntensity = 0;
        
        // 計算平均強度
        areas.forEach(area => {
            avgIntensity += area.colorIntensity;
        });
        avgIntensity /= areas.length;
        
        // 計算方差
        areas.forEach(area => {
            totalVariance += Math.pow(area.colorIntensity - avgIntensity, 2);
        });
        
        const variance = totalVariance / areas.length;
        const uniformity = Math.max(0, 100 - variance);
        
        this.coloringPhase.uniformity = uniformity;
        this.duckEmbryo.colorUniformity = uniformity;
    }

    /**
     * 更新視覺效果
     */
    updateVisualEffects(deltaTime) {
        // 更新蒸汽粒子
        for (let i = this.steamParticles.length - 1; i >= 0; i--) {
            const particle = this.steamParticles[i];
            
            particle.x += particle.vx * deltaTime / 16;
            particle.y += particle.vy * deltaTime / 16;
            particle.life -= deltaTime / 16;
            particle.alpha = Math.max(0, particle.life / particle.maxLife);
            particle.size *= 1.005; // 蒸汽逐漸擴散
            
            if (particle.life <= 0) {
                this.steamParticles.splice(i, 1);
            }
        }
        
        // 更新糖漿光澤效果
        for (let i = this.sugarGlaze.length - 1; i >= 0; i--) {
            const glaze = this.sugarGlaze[i];
            
            glaze.life -= deltaTime / 16;
            glaze.alpha = Math.max(0, glaze.life / glaze.maxLife);
            
            if (glaze.life <= 0) {
                this.sugarGlaze.splice(i, 1);
            }
        }
        
        // 更新水滴效果
        for (let i = this.waterDroplets.length - 1; i >= 0; i--) {
            const droplet = this.waterDroplets[i];
            
            droplet.x += droplet.vx * deltaTime / 16;
            droplet.y += droplet.vy * deltaTime / 16;
            droplet.vy += 0.2; // 重力效果
            droplet.life -= deltaTime / 16;
            droplet.alpha = Math.max(0, droplet.life / droplet.maxLife);
            
            if (droplet.life <= 0) {
                this.waterDroplets.splice(i, 1);
            }
        }
    }

    /**
     * 更新美拉德反應
     */
    updateMaillardReaction(deltaTime) {
        if (this.gamePhase === 'coloring' && this.duckEmbryo.coloringProgress > 50) {
            this.maillardReaction.active = true;
            this.maillardReaction.intensity = Math.min(100, this.duckEmbryo.coloringProgress - 50);
        }
    }

    /**
     * 更新UI標籤
     */
    updateUILabels() {
        if (this.phaseIndicator) {
            const phaseText = this.gamePhase === 'scalding' ? '燙皮' : '上糖色';
            this.phaseIndicator.setText(`階段: ${phaseText}`);
        }
        
        if (this.temperatureLabel) {
            this.temperatureLabel.setText(`水溫: ${this.scaldingPhase.waterTemperature}°C`);
        }
        
        if (this.scaldingProgressLabel) {
            this.scaldingProgressLabel.setText(`燙皮進度: ${Math.round(this.duckEmbryo.scaldingProgress)}%`);
        }
        
        if (this.coloringProgressLabel) {
            this.coloringProgressLabel.setText(`上色進度: ${Math.round(this.duckEmbryo.coloringProgress)}%`);
        }
        
        if (this.uniformityLabel) {
            this.uniformityLabel.setText(`均勻度: ${Math.round(this.coloringPhase.uniformity)}%`);
        }
    }

    /**
     * 檢查階段轉換
     */
    checkPhaseTransition() {
        if (this.gamePhase === 'scalding' && 
            this.duckEmbryo.scaldingProgress >= 90 && 
            !this.scaldingCompleted) {
            
            this.scaldingCompleted = true;
            this.gamePhase = 'coloring';
            this.coloringPhase.active = true;
            
            // 更新說明
            if (this.instructions) {
                this.instructions.setText(this.getInstructions());
            }
            
            console.log('燙皮完成，進入上糖色階段');
        }
    }

    /**
     * 更新總進度
     */
    updateTotalProgress() {
        let totalProgress = 0;
        
        // 燙皮進度 (50%)
        const scaldingProgress = (this.duckEmbryo.scaldingProgress / 100) * 0.5;
        totalProgress += scaldingProgress;
        
        // 上色進度 (40%)
        const coloringProgress = (this.duckEmbryo.coloringProgress / 100) * 0.4;
        totalProgress += coloringProgress;
        
        // 均勻度獎勵 (10%)
        const uniformityBonus = (this.coloringPhase.uniformity / 100) * 0.1;
        totalProgress += uniformityBonus;
        
        this.updateProgress(totalProgress);
        
        // 通知場景更新上色進度
        if (this.config.onProgressUpdate) {
            this.config.onProgressUpdate(this.duckEmbryo.coloringProgress);
        }
    }

    /**
     * 創建蒸汽粒子
     */
    createSteamParticle(x, y) {
        this.steamParticles.push({
            x: x + (Math.random() - 0.5) * 20,
            y: y,
            vx: (Math.random() - 0.5) * 1,
            vy: -1 - Math.random() * 2,
            size: 5 + Math.random() * 8,
            color: '#F0F8FF',
            life: 80,
            maxLife: 80,
            alpha: 0.7
        });
    }

    /**
     * 創建水滴效果
     */
    createWaterDroplet(x, y) {
        this.waterDroplets.push({
            x: x + (Math.random() - 0.5) * 15,
            y: y,
            vx: (Math.random() - 0.5) * 2,
            vy: Math.random() * 2,
            size: 2 + Math.random() * 3,
            color: '#4169E1',
            life: 40,
            maxLife: 40,
            alpha: 0.8
        });
    }

    /**
     * 創建燙皮效果
     */
    createScaldingEffect(x, y) {
        // 創建蒸汽爆發
        for (let i = 0; i < 5; i++) {
            this.createSteamParticle(x, y);
        }
        
        // 播放音效
        if (this.gameEngine.gameState.settings.soundEnabled) {
            this.gameEngine.audioManager.playSound('water_sizzle');
        }
    }

    /**
     * 創建糖漿光澤效果
     */
    createSugarGlazeEffect(x, y) {
        this.sugarGlaze.push({
            x: x + (Math.random() - 0.5) * 10,
            y: y + (Math.random() - 0.5) * 10,
            size: 8 + Math.random() * 12,
            color: '#FFD700',
            life: 60,
            maxLife: 60,
            alpha: 0.6
        });
    }

    /**
     * 創建上色效果
     */
    createColoringEffect(x, y) {
        // 創建糖漿光澤
        for (let i = 0; i < 3; i++) {
            this.createSugarGlazeEffect(x, y);
        }
        
        // 播放音效
        if (this.gameEngine.gameState.settings.soundEnabled) {
            this.gameEngine.audioManager.playSound('brush_stroke');
        }
    }

    /**
     * 渲染遊戲內容
     */
    renderGame(context) {
        // 渲染鴨胚
        this.renderDuckEmbryo(context);
        
        // 渲染燙皮區域
        this.renderScaldingAreas(context);
        
        // 渲染上色區域
        this.renderColoringAreas(context);
        
        // 渲染工具
        this.renderTools(context);
        
        // 渲染視覺效果
        this.renderVisualEffects(context);
        
        // 渲染美拉德反應效果
        this.renderMaillardReaction(context);
        
        // 渲染水流效果
        this.renderWaterFlow(context);
    }

    /**
     * 渲染鴨胚
     */
    renderDuckEmbryo(context) {
        const duck = this.duckEmbryo;
        
        if (this.duckImage) {
            context.drawImage(this.duckImage, duck.x, duck.y, duck.width, duck.height);
        } else {
            // 繪製佔位符
            context.fillStyle = '#F5DEB3';
            context.fillRect(duck.x, duck.y, duck.width, duck.height);
            
            context.strokeStyle = '#8B4513';
            context.lineWidth = 2;
            context.strokeRect(duck.x, duck.y, duck.width, duck.height);
        }
        
        // 繪製燙皮緊實效果
        if (duck.skinTightness > 0) {
            context.save();
            context.globalAlpha = duck.skinTightness / 200;
            context.strokeStyle = '#FF6B6B';
            context.lineWidth = 2;
            context.strokeRect(duck.x - 2, duck.y - 2, duck.width + 4, duck.height + 4);
            context.restore();
        }
        
        // 繪製糖色光澤
        if (duck.coloringProgress > 0) {
            context.save();
            context.globalAlpha = duck.coloringProgress / 300;
            context.fillStyle = '#FFD700';
            context.fillRect(duck.x, duck.y, duck.width, duck.height);
            context.restore();
        }
    }

    /**
     * 渲染燙皮區域
     */
    renderScaldingAreas(context) {
        if (this.gamePhase !== 'scalding') return;
        
        this.scaldingPhase.scaldingAreas.forEach(area => {
            if (area.scalded) {
                // 已燙皮區域
                context.fillStyle = 'rgba(255, 107, 107, 0.6)';
                context.fillRect(area.x, area.y, area.width, area.height);
                
                context.strokeStyle = '#FF4500';
                context.lineWidth = 1;
                context.strokeRect(area.x, area.y, area.width, area.height);
            } else {
                // 未燙皮區域
                context.strokeStyle = 'rgba(255, 107, 107, 0.3)';
                context.lineWidth = 1;
                context.setLineDash([5, 5]);
                context.strokeRect(area.x, area.y, area.width, area.height);
                context.setLineDash([]);
                
                // 顯示燙皮進度
                if (area.scaldingTime > 0) {
                    const progress = area.scaldingTime / area.requiredTime;
                    context.fillStyle = `rgba(255, 107, 107, ${progress * 0.5})`;
                    context.fillRect(area.x, area.y, area.width * progress, area.height);
                }
            }
        });
    }

    /**
     * 渲染上色區域
     */
    renderColoringAreas(context) {
        if (this.gamePhase !== 'coloring') return;
        
        this.coloringPhase.coloringAreas.forEach(area => {
            if (area.colored) {
                // 已上色區域
                const intensity = area.colorIntensity / 100;
                context.fillStyle = `rgba(255, 215, 0, ${intensity * 0.8})`;
                context.fillRect(area.x, area.y, area.width, area.height);
                
                context.strokeStyle = '#DAA520';
                context.lineWidth = 1;
                context.strokeRect(area.x, area.y, area.width, area.height);
            } else {
                // 未上色區域
                context.strokeStyle = 'rgba(255, 215, 0, 0.3)';
                context.lineWidth = 1;
                context.setLineDash([3, 3]);
                context.strokeRect(area.x, area.y, area.width, area.height);
                context.setLineDash([]);
                
                // 顯示上色進度
                if (area.colorIntensity > 0) {
                    const progress = area.colorIntensity / 100;
                    context.fillStyle = `rgba(255, 215, 0, ${progress * 0.4})`;
                    context.fillRect(area.x, area.y, area.width * progress, area.height);
                }
            }
        });
    }

    /**
     * 渲染工具
     */
    renderTools(context) {
        // 渲染熱水壺
        const hotWater = this.tools.hotWaterPot;
        if (this.hotWaterImage) {
            context.drawImage(
                this.hotWaterImage,
                hotWater.x,
                hotWater.y,
                hotWater.width,
                hotWater.height
            );
        } else {
            context.fillStyle = hotWater.isActive ? '#FF4500' : '#FF6B6B';
            context.fillRect(hotWater.x, hotWater.y, hotWater.width, hotWater.height);
            
            context.strokeStyle = '#8B0000';
            context.lineWidth = 2;
            context.strokeRect(hotWater.x, hotWater.y, hotWater.width, hotWater.height);
        }
        
        // 渲染糖漿刷
        const brush = this.tools.sugarBrush;
        if (this.brushImage) {
            context.drawImage(
                this.brushImage,
                brush.x,
                brush.y,
                brush.width,
                brush.height
            );
        } else {
            context.fillStyle = brush.isActive ? '#FFD700' : '#DAA520';
            context.fillRect(brush.x, brush.y, brush.width, brush.height);
            
            context.strokeStyle = '#B8860B';
            context.lineWidth = 2;
            context.strokeRect(brush.x, brush.y, brush.width, brush.height);
        }
        
        // 工具標籤
        context.fillStyle = '#654321';
        context.font = '12px Microsoft JhengHei';
        context.textAlign = 'center';
        
        if (this.gamePhase === 'scalding') {
            context.fillText('熱水燙皮', hotWater.x + hotWater.width / 2, hotWater.y + hotWater.height + 15);
        } else {
            context.fillText('糖漿刷', brush.x + brush.width / 2, brush.y + brush.height + 15);
        }
    }

    /**
     * 渲染視覺效果
     */
    renderVisualEffects(context) {
        // 渲染蒸汽粒子
        this.steamParticles.forEach(particle => {
            context.save();
            context.globalAlpha = particle.alpha;
            context.fillStyle = particle.color;
            
            context.beginPath();
            context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            context.fill();
            
            context.restore();
        });
        
        // 渲染糖漿光澤
        this.sugarGlaze.forEach(glaze => {
            context.save();
            context.globalAlpha = glaze.alpha;
            context.fillStyle = glaze.color;
            
            context.beginPath();
            context.arc(glaze.x, glaze.y, glaze.size, 0, Math.PI * 2);
            context.fill();
            
            context.restore();
        });
        
        // 渲染水滴
        this.waterDroplets.forEach(droplet => {
            context.save();
            context.globalAlpha = droplet.alpha;
            context.fillStyle = droplet.color;
            
            context.beginPath();
            context.arc(droplet.x, droplet.y, droplet.size, 0, Math.PI * 2);
            context.fill();
            
            context.restore();
        });
    }

    /**
     * 渲染美拉德反應效果
     */
    renderMaillardReaction(context) {
        if (!this.maillardReaction.active) return;
        
        const duck = this.duckEmbryo;
        const intensity = this.maillardReaction.intensity / 100;
        
        // 繪製美拉德反應光澤
        context.save();
        context.globalAlpha = intensity * 0.4;
        
        const gradient = context.createRadialGradient(
            duck.x + duck.width / 2,
            duck.y + duck.height / 2,
            0,
            duck.x + duck.width / 2,
            duck.y + duck.height / 2,
            Math.max(duck.width, duck.height) / 2
        );
        
        gradient.addColorStop(0, '#FFD700');
        gradient.addColorStop(0.5, '#FFA500');
        gradient.addColorStop(1, '#FF8C00');
        
        context.fillStyle = gradient;
        context.fillRect(duck.x, duck.y, duck.width, duck.height);
        
        context.restore();
    }

    /**
     * 渲染水流效果
     */
    renderWaterFlow(context) {
        if (!this.scaldingPhase.waterFlow.active) return;
        
        const flow = this.scaldingPhase.waterFlow;
        
        // 繪製水流
        context.save();
        context.globalAlpha = 0.7;
        context.strokeStyle = '#4169E1';
        context.lineWidth = 5;
        
        context.beginPath();
        context.moveTo(this.tools.hotWaterPot.x + this.tools.hotWaterPot.width / 2, 
                      this.tools.hotWaterPot.y);
        context.lineTo(flow.x, flow.y);
        context.stroke();
        
        // 繪製水流擴散
        context.fillStyle = 'rgba(65, 105, 225, 0.3)';
        context.beginPath();
        context.arc(flow.x, flow.y, 25, 0, Math.PI * 2);
        context.fill();
        
        context.restore();
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
            const hotWater = this.tools.hotWaterPot;
            if (x >= hotWater.x && x <= hotWater.x + hotWater.width &&
                y >= hotWater.y && y <= hotWater.y + hotWater.height) {
                
                hotWater.isActive = true;
                this.scaldingPhase.waterFlow.active = true;
                this.scaldingPhase.waterFlow.x = x;
                this.scaldingPhase.waterFlow.y = y;
                return true;
            }
        } else if (this.gamePhase === 'coloring') {
            const brush = this.tools.sugarBrush;
            if (x >= brush.x && x <= brush.x + brush.width &&
                y >= brush.y && y <= brush.y + brush.height) {
                
                brush.isActive = true;
                this.coloringPhase.brush.isApplying = true;
                this.coloringPhase.brush.x = x;
                this.coloringPhase.brush.y = y;
                return true;
            }
        }
        
        return false;
    }

    /**
     * 處理滑鼠釋放
     */
    handleMouseUp(x, y) {
        this.tools.hotWaterPot.isActive = false;
        this.tools.sugarBrush.isActive = false;
        this.scaldingPhase.waterFlow.active = false;
        this.coloringPhase.brush.isApplying = false;
        
        return true;
    }

    /**
     * 處理滑鼠移動
     */
    handleMouseMove(x, y) {
        if (this.scaldingPhase.waterFlow.active) {
            this.scaldingPhase.waterFlow.x = x;
            this.scaldingPhase.waterFlow.y = y;
            return true;
        }
        
        if (this.coloringPhase.brush.isApplying) {
            this.coloringPhase.brush.x = x;
            this.coloringPhase.brush.y = y;
            return true;
        }
        
        return false;
    }

    /**
     * 計算準確度獎勵
     */
    calculateAccuracyBonus() {
        let bonus = 0;
        
        // 燙皮完成度獎勵
        bonus += Math.round(this.duckEmbryo.scaldingProgress * 0.3);
        
        // 上色完成度獎勵
        bonus += Math.round(this.duckEmbryo.coloringProgress * 0.3);
        
        // 均勻度獎勵
        bonus += Math.round(this.coloringPhase.uniformity * 0.4);
        
        // 時間獎勵
        const gameTime = this.stats.endTime - this.stats.startTime;
        if (gameTime < 90000) { // 90秒內完成
            bonus += 40;
        } else if (gameTime < 105000) { // 105秒內完成
            bonus += 20;
        }
        
        return bonus;
    }

    /**
     * 檢查遊戲完成條件
     */
    checkWinCondition() {
        return this.scaldingCompleted && 
               this.duckEmbryo.coloringProgress >= 80 && 
               this.coloringPhase.uniformity >= 70;
    }
}