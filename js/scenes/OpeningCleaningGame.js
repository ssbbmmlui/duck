/**
 * 開口清洗迷你遊戲
 * 玩家需要精確開口並徹底清洗鴨子內腔
 */
class OpeningCleaningGame extends MiniGame {
    constructor(config = {}) {
        super({
            name: '開口清洗遊戲',
            timeLimit: 90000, // 90秒時間限制
            successThreshold: 1.0, // 需要完成所有步驟
            ...config
        });
        
        // 遊戲階段
        this.gamePhases = [
            {
                id: 'opening',
                name: '精確開口',
                description: '從肛門位置沿著綠色垂直線向下切割',
                completed: false
            },
            {
                id: 'organ_removal',
                name: '取出內臟',
                description: '小心取出內臟器官',
                completed: false
            },
            {
                id: 'cleaning',
                name: '內腔清洗',
                description: '徹底清洗內腔',
                completed: false
            }
        ];
        
        this.currentPhaseIndex = 0;
        
        // 鴨子狀態
        this.duckState = {
            opened: false,
            organsRemoved: false,
            cleaned: false,
            cleanliness: 0 // 0-1之間，表示清潔度
        };
        
        // 開口系統
        this.openingSystem = {
            targetArea: null, // 目標開口區域
            cutLine: [], // 切割軌跡
            isDrawing: false,
            accuracy: 0 // 切割準確度
        };
        
        // 內臟系統
        this.organs = [];
        this.removedOrgans = 0;
        
        // 清洗系統
        this.cleaningAreas = [];
        this.waterFlow = {
            active: false,
            x: 0,
            y: 0,
            particles: []
        };
        
        // 鴨子圖像和位置
        this.duckImage = null;
        this.duckPosition = {
            x: this.gameArea.x + this.gameArea.width / 2 - 100,
            y: this.gameArea.y + this.gameArea.height / 2 - 75,
            width: 200,
            height: 150
        };
        
        // 工具狀態
        this.currentTool = 'knife'; // knife, hand, water
    }

    /**
     * 設置遊戲
     */
    setupGame() {
        this.setupOpeningTarget();
        this.setupOrgans();
        this.setupCleaningAreas();
        this.loadAssets();
        
        // 重置狀態
        this.currentPhaseIndex = 0;
        this.duckState = {
            opened: false,
            organsRemoved: false,
            cleaned: false,
            cleanliness: 0
        };
        
        this.gamePhases.forEach(phase => phase.completed = false);
        this.updateProgress(0);
    }

    /**
     * 載入資源
     */
    loadAssets() {
        if (this.gameEngine && this.gameEngine.assetManager) {
            const assetManager = this.gameEngine.assetManager;
            this.duckImage = assetManager.getAsset('anus_duck');
        }
    }

    /**
     * 設置開口目標區域
     */
    setupOpeningTarget() {
        const duck = this.duckPosition;

        // 開口目標區域（肆門下方垂直切線）
        this.openingSystem.targetArea = {
            x: duck.x + duck.width * 0.45,
            y: duck.y + duck.height * 0.4,
            width: duck.width * 0.1,
            height: duck.height * 0.35,
            idealPath: [
                { x: duck.x + duck.width * 0.5, y: duck.y + duck.height * 0.4 },
                { x: duck.x + duck.width * 0.5, y: duck.y + duck.height * 0.75 }
            ]
        };

        this.openingSystem.cutLine = [];
        this.openingSystem.accuracy = 0;
    }

    /**
     * 設置內臟
     */
    setupOrgans() {
        this.organs = [];
        const duck = this.duckPosition;
        
        // 創建內臟物件
        const organTypes = [
            { name: '心臟', color: '#8B0000', size: 15 },
            { name: '肝臟', color: '#A0522D', size: 25 },
            { name: '腸道', color: '#DDA0DD', size: 20 }
        ];
        
        organTypes.forEach((type, index) => {
            this.organs.push({
                id: index,
                name: type.name,
                x: duck.x + duck.width * 0.4 + Math.random() * duck.width * 0.2,
                y: duck.y + duck.height * 0.4 + Math.random() * duck.height * 0.3,
                size: type.size,
                color: type.color,
                removed: false,
                visible: false // 開口後才可見
            });
        });
        
        this.removedOrgans = 0;
    }

    /**
     * 設置清洗區域
     */
    setupCleaningAreas() {
        this.cleaningAreas = [];
        const duck = this.duckPosition;
        
        // 創建需要清洗的區域
        for (let i = 0; i < 8; i++) {
            this.cleaningAreas.push({
                id: i,
                x: duck.x + duck.width * 0.3 + Math.random() * duck.width * 0.4,
                y: duck.y + duck.height * 0.4 + Math.random() * duck.height * 0.4,
                size: 12 + Math.random() * 8,
                cleanliness: 0, // 0-1之間
                visible: false // 內臟移除後才可見
            });
        }
    }

    /**
     * 獲取遊戲說明
     */
    getInstructions() {
        const currentPhase = this.gamePhases[this.currentPhaseIndex];
        if (currentPhase) {
            return `${currentPhase.name}: ${currentPhase.description}`;
        }
        return '按照步驟完成開口和清洗';
    }

    /**
     * 創建UI
     */
    createUI() {
        super.createUI();
        
        if (!this.gameEngine || !this.gameEngine.uiManager) return;
        
        const uiManager = this.gameEngine.uiManager;
        
        // 創建工具按鈕
        const knifeButton = uiManager.createButton({
            x: this.gameArea.x + 10,
            y: this.gameArea.y + 10,
            width: 60,
            height: 35,
            text: '刀具',
            onClick: () => this.selectTool('knife')
        });
        
        const handButton = uiManager.createButton({
            x: this.gameArea.x + 80,
            y: this.gameArea.y + 10,
            width: 60,
            height: 35,
            text: '手取',
            onClick: () => this.selectTool('hand')
        });
        
        const waterButton = uiManager.createButton({
            x: this.gameArea.x + 150,
            y: this.gameArea.y + 10,
            width: 60,
            height: 35,
            text: '清水',
            onClick: () => this.selectTool('water')
        });
        
        // 創建階段指示器
        this.phaseIndicator = uiManager.createLabel({
            x: this.gameArea.x + this.gameArea.width - 10,
            y: this.gameArea.y + 30,
            text: this.getPhaseIndicatorText(),
            fontSize: 12,
            color: '#654321',
            align: 'right'
        });
        
        this.uiElements.push(knifeButton, handButton, waterButton, this.phaseIndicator);
        
        // 設置初始工具
        this.selectTool('knife');
    }

    /**
     * 獲取階段指示器文字
     */
    getPhaseIndicatorText() {
        let text = '進度:\n';
        this.gamePhases.forEach((phase, index) => {
            const status = phase.completed ? '✅' : 
                          (index === this.currentPhaseIndex ? '🔄' : '⏳');
            text += `${status} ${phase.name}\n`;
        });
        return text;
    }

    /**
     * 選擇工具
     */
    selectTool(tool) {
        this.currentTool = tool;
        
        // 更新說明文字
        if (this.instructions) {
            const currentPhase = this.gamePhases[this.currentPhaseIndex];
            if (currentPhase) {
                if (tool === 'knife' && currentPhase.id === 'opening') {
                    this.instructions.setText('沿著標示線精確切割開口');
                } else if (tool === 'hand' && currentPhase.id === 'organ_removal') {
                    this.instructions.setText('點擊內臟小心取出');
                } else if (tool === 'water' && currentPhase.id === 'cleaning') {
                    this.instructions.setText('拖拽水流清洗內腔');
                } else {
                    this.instructions.setText(currentPhase.description);
                }
            }
        }
    }

    /**
     * 更新遊戲邏輯
     */
    updateGame(deltaTime) {
        // 更新水流粒子
        this.updateWaterParticles(deltaTime);
        
        // 更新階段指示器
        if (this.phaseIndicator) {
            this.phaseIndicator.setText(this.getPhaseIndicatorText());
        }
        
        // 計算總進度
        const completedPhases = this.gamePhases.filter(p => p.completed).length;
        const progress = completedPhases / this.gamePhases.length;
        this.updateProgress(progress);
        
        // 檢查階段完成
        this.checkPhaseCompletion();
    }

    /**
     * 更新水流粒子
     */
    updateWaterParticles(deltaTime) {
        for (let i = this.waterFlow.particles.length - 1; i >= 0; i--) {
            const particle = this.waterFlow.particles[i];
            
            particle.x += particle.vx * deltaTime / 16;
            particle.y += particle.vy * deltaTime / 16;
            particle.life -= deltaTime / 16;
            particle.alpha = Math.max(0, particle.life / particle.maxLife);
            
            if (particle.life <= 0) {
                this.waterFlow.particles.splice(i, 1);
            }
        }
    }

    /**
     * 檢查階段完成
     */
    checkPhaseCompletion() {
        const currentPhase = this.gamePhases[this.currentPhaseIndex];
        if (!currentPhase || currentPhase.completed) return;
        
        let phaseComplete = false;
        
        if (currentPhase.id === 'opening') {
            // 檢查開口是否完成
            phaseComplete = this.openingSystem.accuracy >= 0.8;
        } else if (currentPhase.id === 'organ_removal') {
            // 檢查內臟是否全部移除
            phaseComplete = this.removedOrgans >= this.organs.length;
        } else if (currentPhase.id === 'cleaning') {
            // 檢查清潔度
            const avgCleanliness = this.cleaningAreas.reduce((sum, area) => sum + area.cleanliness, 0) / this.cleaningAreas.length;
            phaseComplete = avgCleanliness >= 0.9;
        }
        
        if (phaseComplete) {
            this.completeCurrentPhase();
        }
    }

    /**
     * 完成當前階段
     */
    completeCurrentPhase() {
        const currentPhase = this.gamePhases[this.currentPhaseIndex];
        if (!currentPhase) return;
        
        currentPhase.completed = true;
        
        // 更新鴨子狀態
        if (currentPhase.id === 'opening') {
            this.duckState.opened = true;
            // 顯示內臟
            this.organs.forEach(organ => organ.visible = true);
        } else if (currentPhase.id === 'organ_removal') {
            this.duckState.organsRemoved = true;
            // 顯示清洗區域
            this.cleaningAreas.forEach(area => area.visible = true);
        } else if (currentPhase.id === 'cleaning') {
            this.duckState.cleaned = true;
        }
        
        // 移動到下一階段
        this.currentPhaseIndex++;
        
        // 自動切換工具
        if (this.currentPhaseIndex < this.gamePhases.length) {
            const nextPhase = this.gamePhases[this.currentPhaseIndex];
            if (nextPhase.id === 'organ_removal') {
                this.selectTool('hand');
            } else if (nextPhase.id === 'cleaning') {
                this.selectTool('water');
            }
        }
        
        console.log(`階段完成: ${currentPhase.name}`);
        
        // 播放音效
        if (this.gameEngine.gameState.settings.soundEnabled) {
            this.gameEngine.audioManager.playSound('phase_complete');
        }
    }

    /**
     * 渲染遊戲內容
     */
    renderGame(context) {
        // 渲染鴨子
        this.renderDuck(context);
        
        // 渲染開口系統
        if (this.currentPhaseIndex === 0) {
            this.renderOpeningSystem(context);
        }
        
        // 渲染內臟
        if (this.duckState.opened) {
            this.renderOrgans(context);
        }
        
        // 渲染清洗區域
        if (this.duckState.organsRemoved) {
            this.renderCleaningAreas(context);
        }
        
        // 渲染水流效果
        this.renderWaterFlow(context);
        
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
        }
        
        // 如果已開口，繪製開口
        if (this.duckState.opened) {
            const target = this.openingSystem.targetArea;
            context.strokeStyle = '#8B0000';
            context.lineWidth = 3;
            context.beginPath();
            context.moveTo(target.x, target.y + target.height / 2);
            context.lineTo(target.x + target.width, target.y + target.height / 2);
            context.stroke();
        }
    }

    /**
     * 渲染開口系統
     */
    renderOpeningSystem(context) {
        const target = this.openingSystem.targetArea;

        // 繪製目標開口區域（垂直區域）
        context.strokeStyle = '#FFD700';
        context.lineWidth = 2;
        context.setLineDash([5, 5]);
        context.strokeRect(target.x, target.y, target.width, target.height);
        context.setLineDash([]);

        // 繪製理想切割線（垂直線從肛門向下）
        context.strokeStyle = '#32CD32';
        context.lineWidth = 3;
        context.beginPath();
        const idealPath = target.idealPath;
        context.moveTo(idealPath[0].x, idealPath[0].y);
        context.lineTo(idealPath[1].x, idealPath[1].y);
        context.stroke();

        // 在切割線起點標記肛門位置
        context.fillStyle = '#FF4444';
        context.beginPath();
        context.arc(idealPath[0].x, idealPath[0].y, 4, 0, Math.PI * 2);
        context.fill();
        
        // 繪製玩家的切割軌跡
        if (this.openingSystem.cutLine.length > 1) {
            context.strokeStyle = '#FF6B6B';
            context.lineWidth = 3;
            context.beginPath();
            context.moveTo(this.openingSystem.cutLine[0].x, this.openingSystem.cutLine[0].y);
            
            for (let i = 1; i < this.openingSystem.cutLine.length; i++) {
                context.lineTo(this.openingSystem.cutLine[i].x, this.openingSystem.cutLine[i].y);
            }
            context.stroke();
        }
        
        // 顯示準確度
        context.fillStyle = '#654321';
        context.font = '14px Microsoft JhengHei';
        context.textAlign = 'center';
        context.fillText(
            `切割準確度: ${Math.round(this.openingSystem.accuracy * 100)}%`,
            target.x + target.width / 2,
            target.y - 10
        );
    }

    /**
     * 渲染內臟
     */
    renderOrgans(context) {
        this.organs.forEach(organ => {
            if (!organ.visible || organ.removed) return;
            
            context.fillStyle = organ.color;
            context.strokeStyle = '#000000';
            context.lineWidth = 1;
            
            context.beginPath();
            context.arc(organ.x, organ.y, organ.size, 0, Math.PI * 2);
            context.fill();
            context.stroke();
            
            // 繪製名稱
            context.fillStyle = '#FFFFFF';
            context.font = '10px Microsoft JhengHei';
            context.textAlign = 'center';
            context.fillText(organ.name, organ.x, organ.y + 3);
        });
    }

    /**
     * 渲染清洗區域
     */
    renderCleaningAreas(context) {
        this.cleaningAreas.forEach(area => {
            if (!area.visible) return;
            
            // 根據清潔度設置顏色
            const dirtiness = 1 - area.cleanliness;
            const red = Math.round(139 * dirtiness + 245 * area.cleanliness);
            const green = Math.round(69 * dirtiness + 245 * area.cleanliness);
            const blue = Math.round(19 * dirtiness + 245 * area.cleanliness);
            
            context.fillStyle = `rgb(${red}, ${green}, ${blue})`;
            context.strokeStyle = '#666666';
            context.lineWidth = 1;
            
            context.beginPath();
            context.arc(area.x, area.y, area.size, 0, Math.PI * 2);
            context.fill();
            context.stroke();
        });
    }

    /**
     * 渲染水流效果
     */
    renderWaterFlow(context) {
        // 渲染水流粒子
        this.waterFlow.particles.forEach(particle => {
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
        
        context.fillStyle = '#654321';
        context.font = '12px Microsoft JhengHei';
        context.textAlign = 'left';
        
        if (this.currentTool === 'knife') {
            context.fillText('🔪 刀具已選擇 - 拖拽進行精確切割', this.gameArea.x + 10, hintY);
        } else if (this.currentTool === 'hand') {
            context.fillText('✋ 手取已選擇 - 點擊內臟進行移除', this.gameArea.x + 10, hintY);
        } else if (this.currentTool === 'water') {
            context.fillText('💧 清水已選擇 - 拖拽水流進行清洗', this.gameArea.x + 10, hintY);
        }
    }

    /**
     * 處理遊戲特定輸入
     */
    handleGameInput(event) {
        if (event.type === 'mousedown') {
            return this.handleMouseDown(event.x, event.y);
        } else if (event.type === 'mousemove') {
            return this.handleMouseMove(event.x, event.y);
        } else if (event.type === 'mouseup') {
            return this.handleMouseUp(event.x, event.y);
        } else if (event.type === 'click') {
            return this.handleClick(event.x, event.y);
        }
        
        return false;
    }

    /**
     * 處理鼠標按下
     */
    handleMouseDown(x, y) {
        if (this.currentTool === 'knife' && this.currentPhaseIndex === 0) {
            // 開始切割
            this.openingSystem.isDrawing = true;
            this.openingSystem.cutLine = [{ x, y }];
            return true;
        } else if (this.currentTool === 'water' && this.currentPhaseIndex === 2) {
            // 開始水流
            this.waterFlow.active = true;
            this.waterFlow.x = x;
            this.waterFlow.y = y;
            return true;
        }
        
        return false;
    }

    /**
     * 處理鼠標移動
     */
    handleMouseMove(x, y) {
        if (this.openingSystem.isDrawing) {
            // 繼續切割軌跡
            this.openingSystem.cutLine.push({ x, y });
            this.calculateCuttingAccuracy();
            return true;
        } else if (this.waterFlow.active) {
            // 更新水流位置並創建粒子
            this.waterFlow.x = x;
            this.waterFlow.y = y;
            this.createWaterParticles(x, y);
            this.cleanAreasNearWater(x, y);
            return true;
        }
        
        return false;
    }

    /**
     * 處理鼠標釋放
     */
    handleMouseUp(x, y) {
        if (this.openingSystem.isDrawing) {
            this.openingSystem.isDrawing = false;
            return true;
        } else if (this.waterFlow.active) {
            this.waterFlow.active = false;
            return true;
        }
        
        return false;
    }

    /**
     * 處理點擊
     */
    handleClick(x, y) {
        if (this.currentTool === 'hand' && this.currentPhaseIndex === 1) {
            // 嘗試移除內臟
            return this.removeOrganAt(x, y);
        }
        
        return false;
    }

    /**
     * 計算切割準確度
     */
    calculateCuttingAccuracy() {
        if (this.openingSystem.cutLine.length < 2) return;
        
        const target = this.openingSystem.targetArea;
        const idealPath = target.idealPath;
        
        // 計算切割軌跡與理想路徑的偏差
        let totalDeviation = 0;
        let validPoints = 0;
        
        this.openingSystem.cutLine.forEach(point => {
            // 檢查點是否在目標區域內
            if (point.x >= target.x && point.x <= target.x + target.width &&
                point.y >= target.y && point.y <= target.y + target.height) {
                
                // 計算到理想線的距離
                const distanceToIdeal = this.distanceToLine(
                    point, idealPath[0], idealPath[1]
                );
                
                totalDeviation += distanceToIdeal;
                validPoints++;
            }
        });
        
        if (validPoints > 0) {
            const avgDeviation = totalDeviation / validPoints;
            const maxAllowedDeviation = 20; // 最大允許偏差
            this.openingSystem.accuracy = Math.max(0, 1 - avgDeviation / maxAllowedDeviation);
        }
    }

    /**
     * 計算點到線段的距離
     */
    distanceToLine(point, lineStart, lineEnd) {
        const A = point.x - lineStart.x;
        const B = point.y - lineStart.y;
        const C = lineEnd.x - lineStart.x;
        const D = lineEnd.y - lineStart.y;
        
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        
        if (lenSq === 0) return Math.sqrt(A * A + B * B);
        
        const param = dot / lenSq;
        
        let xx, yy;
        if (param < 0) {
            xx = lineStart.x;
            yy = lineStart.y;
        } else if (param > 1) {
            xx = lineEnd.x;
            yy = lineEnd.y;
        } else {
            xx = lineStart.x + param * C;
            yy = lineStart.y + param * D;
        }
        
        const dx = point.x - xx;
        const dy = point.y - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * 移除指定位置的內臟
     */
    removeOrganAt(x, y) {
        for (let organ of this.organs) {
            if (organ.removed || !organ.visible) continue;
            
            const distance = Math.sqrt(
                Math.pow(x - organ.x, 2) + Math.pow(y - organ.y, 2)
            );
            
            if (distance <= organ.size) {
                organ.removed = true;
                this.removedOrgans++;
                
                console.log(`移除內臟: ${organ.name}`);
                
                // 播放音效
                if (this.gameEngine.gameState.settings.soundEnabled) {
                    this.gameEngine.audioManager.playSound('organ_remove');
                }
                
                return true;
            }
        }
        
        return false;
    }

    /**
     * 創建水流粒子
     */
    createWaterParticles(x, y) {
        for (let i = 0; i < 3; i++) {
            this.waterFlow.particles.push({
                x: x + (Math.random() - 0.5) * 10,
                y: y + (Math.random() - 0.5) * 10,
                vx: (Math.random() - 0.5) * 2,
                vy: Math.random() * 2 + 1,
                size: 2 + Math.random() * 3,
                color: '#87CEEB',
                life: 20,
                maxLife: 20,
                alpha: 1
            });
        }
    }

    /**
     * 清洗水流附近的區域
     */
    cleanAreasNearWater(x, y) {
        this.cleaningAreas.forEach(area => {
            if (!area.visible) return;
            
            const distance = Math.sqrt(
                Math.pow(x - area.x, 2) + Math.pow(y - area.y, 2)
            );
            
            if (distance <= 30) { // 水流影響範圍
                area.cleanliness = Math.min(1, area.cleanliness + 0.02);
            }
        });
    }

    /**
     * 計算準確度獎勵
     */
    calculateAccuracyBonus() {
        let bonus = 0;
        
        // 開口準確度獎勵
        bonus += Math.round(this.openingSystem.accuracy * 30);
        
        // 內臟移除效率獎勵
        if (this.removedOrgans === this.organs.length) {
            bonus += 20;
        }
        
        // 清洗完成度獎勵
        const avgCleanliness = this.cleaningAreas.reduce((sum, area) => sum + area.cleanliness, 0) / this.cleaningAreas.length;
        bonus += Math.round(avgCleanliness * 25);
        
        return bonus;
    }
}
// 匯出到全域作用域
window.OpeningCleaningGame = OpeningCleaningGame;
