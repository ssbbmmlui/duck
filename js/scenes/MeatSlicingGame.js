/**
 * 片肉迷你遊戲
 * 玩家需要將鴨肉切成適合入口的薄片
 */
class MeatSlicingGame extends MiniGame {
    constructor(config) {
        super(config);
        
        this.name = '片肉遊戲';
        this.gameAreaX = config.gameAreaX;
        this.gameAreaY = config.gameAreaY;
        this.gameAreaWidth = config.gameAreaWidth;
        this.gameAreaHeight = config.gameAreaHeight;
        this.slicingSystem = config.slicingSystem;
        this.workStation = config.workStation;
        
        // 遊戲狀態
        this.gameState = {
            phase: 'instruction',  // instruction, slicing, complete
            targetSlices: 36,      // 目標片數
            currentSlices: 0,      // 當前片數
            timeLimit: 150,        // 時間限制（秒）
            timeRemaining: 150,
            score: 0,
            accuracy: 100,
            speed: 0
        };
        
        // 肉塊區域
        this.meatSections = [];
        this.generateMeatSections();
        
        // 刀具控制（與片皮不同的設定）
        this.knifeControl = {
            x: this.workStation.knifeX,
            y: this.workStation.knifeY,
            angle: 90,              // 垂直切入
            pressure: 50,           // 較大施力
            speed: 40,              // 切片速度
            isSlicing: false,
            sliceStartX: 0,
            sliceStartY: 0,
            sliceEndX: 0,
            sliceEndY: 0,
            trailPoints: []
        };
        
        // 肉質分析
        this.meatAnalysis = {
            texture: 85,            // 肉質紋理
            tenderness: 80,         // 嫩度
            juiciness: 75,          // 汁液含量
            temperature: 60,        // 溫度
            fiberDirection: []      // 纖維方向
        };
        
        // 切片標準
        this.slicingStandards = {
            optimalThickness: 4,    // 最佳厚度(mm)
            minThickness: 2,
            maxThickness: 6,
            optimalLength: 50,      // 最佳長度(mm)
            optimalWidth: 30,       // 最佳寬度(mm)
            againstGrain: true      // 逆紋切片
        };
        
        // 視覺反饋
        this.visualFeedback = {
            showFiberDirection: true,
            showThicknessGuide: true,
            showQualityIndicator: true,
            currentFeedback: null,
            feedbackTimer: 0,
            slicePreview: null
        };
        
        // 輸入處理
        this.inputHandler = {
            mouseDown: false,
            mouseX: 0,
            mouseY: 0,
            lastMouseX: 0,
            lastMouseY: 0,
            dragStartX: 0,
            dragStartY: 0,
            sliceDirection: { x: 0, y: 0 }
        };
        
        // 音效
        this.sounds = {
            sliceSound: 'meat_slice',
            successSound: 'slice_success',
            failSound: 'slice_fail',
            perfectSound: 'perfect_slice'
        };
    }

    /**
     * 生成肉塊區域
     */
    generateMeatSections() {
        this.meatSections = [];
        
        const duckCenterX = this.workStation.duckX;
        const duckCenterY = this.workStation.duckY;
        const duckWidth = this.workStation.duckWidth;
        const duckHeight = this.workStation.duckHeight;
        
        // 胸肉區域
        this.meatSections.push({
            id: 'breast_left',
            name: '左胸肉',
            x: duckCenterX - duckWidth * 0.25,
            y: duckCenterY - duckHeight * 0.1,
            width: duckWidth * 0.3,
            height: duckHeight * 0.4,
            fiberDirection: Math.PI / 6,  // 纖維方向
            slices: [],
            completed: false,
            targetSlices: 12
        });
        
        this.meatSections.push({
            id: 'breast_right',
            name: '右胸肉',
            x: duckCenterX + duckWidth * 0.25,
            y: duckCenterY - duckHeight * 0.1,
            width: duckWidth * 0.3,
            height: duckHeight * 0.4,
            fiberDirection: -Math.PI / 6,
            slices: [],
            completed: false,
            targetSlices: 12
        });
        
        // 腿肉區域
        this.meatSections.push({
            id: 'leg_left',
            name: '左腿肉',
            x: duckCenterX - duckWidth * 0.3,
            y: duckCenterY + duckHeight * 0.2,
            width: duckWidth * 0.25,
            height: duckHeight * 0.3,
            fiberDirection: Math.PI / 4,
            slices: [],
            completed: false,
            targetSlices: 6
        });
        
        this.meatSections.push({
            id: 'leg_right',
            name: '右腿肉',
            x: duckCenterX + duckWidth * 0.3,
            y: duckCenterY + duckHeight * 0.2,
            width: duckWidth * 0.25,
            height: duckHeight * 0.3,
            fiberDirection: -Math.PI / 4,
            slices: [],
            completed: false,
            targetSlices: 6
        });
        
        // 生成纖維方向指示
        this.generateFiberDirections();
    }

    /**
     * 生成纖維方向指示
     */
    generateFiberDirections() {
        this.meatAnalysis.fiberDirection = [];
        
        this.meatSections.forEach(section => {
            const fibers = [];
            const fiberCount = 8;
            
            for (let i = 0; i < fiberCount; i++) {
                const offsetX = (i - fiberCount/2) * (section.width / fiberCount);
                fibers.push({
                    startX: section.x + offsetX,
                    startY: section.y - section.height/2,
                    endX: section.x + offsetX + Math.cos(section.fiberDirection) * section.height,
                    endY: section.y + section.height/2,
                    direction: section.fiberDirection
                });
            }
            
            this.meatAnalysis.fiberDirection.push({
                sectionId: section.id,
                fibers: fibers
            });
        });
    }

    /**
     * 開始遊戲
     */
    start() {
        super.start();
        
        this.setupGameUI();
        this.setupInputHandlers();
        
        console.log('片肉遊戲開始');
    }

    /**
     * 設置遊戲UI
     */
    setupGameUI() {
        const uiManager = this.gameEngine.uiManager;
        
        // 遊戲標題
        this.gameTitle = uiManager.createLabel({
            x: this.gameAreaX + this.gameAreaWidth / 2,
            y: this.gameAreaY - 20,
            text: '片肉技巧 - 逆紋切片，厚度均勻',
            fontSize: 18,
            color: '#DC143C',
            align: 'center'
        });
        
        // 進度顯示
        this.progressLabel = uiManager.createLabel({
            x: this.gameAreaX + 20,
            y: this.gameAreaY + 20,
            text: this.getProgressText(),
            fontSize: 14,
            color: '#8B4513',
            align: 'left'
        });
        
        // 時間顯示
        this.timeLabel = uiManager.createLabel({
            x: this.gameAreaX + this.gameAreaWidth - 20,
            y: this.gameAreaY + 20,
            text: this.getTimeText(),
            fontSize: 14,
            color: '#FF4500',
            align: 'right'
        });
        
        // 技巧提示
        this.techniqueLabel = uiManager.createLabel({
            x: this.gameAreaX + 20,
            y: this.gameAreaY + 50,
            text: '技巧：垂直切入，逆著纖維方向切片',
            fontSize: 12,
            color: '#4682B4',
            align: 'left'
        });
        
        // 品質指標
        this.qualityLabel = uiManager.createLabel({
            x: this.gameAreaX + this.gameAreaWidth - 20,
            y: this.gameAreaY + 50,
            text: this.getQualityText(),
            fontSize: 12,
            color: '#228B22',
            align: 'right'
        });
        
        // 說明文字
        this.instructionLabel = uiManager.createLabel({
            x: this.gameAreaX + this.gameAreaWidth / 2,
            y: this.gameAreaY + this.gameAreaHeight - 40,
            text: '在肉塊上拖拽切片，注意纖維方向和厚度控制',
            fontSize: 14,
            color: '#4682B4',
            align: 'center'
        });
        
        this.addUIElement(this.gameTitle);
        this.addUIElement(this.progressLabel);
        this.addUIElement(this.timeLabel);
        this.addUIElement(this.techniqueLabel);
        this.addUIElement(this.qualityLabel);
        this.addUIElement(this.instructionLabel);
    }

    /**
     * 設置輸入處理器
     */
    setupInputHandlers() {
        const canvas = this.gameEngine.canvas;
        
        // 滑鼠按下事件
        this.mouseDownHandler = (event) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
            
            this.inputHandler.mouseDown = true;
            this.inputHandler.mouseX = mouseX;
            this.inputHandler.mouseY = mouseY;
            this.inputHandler.lastMouseX = mouseX;
            this.inputHandler.lastMouseY = mouseY;
            this.inputHandler.dragStartX = mouseX;
            this.inputHandler.dragStartY = mouseY;
            
            // 檢查是否開始切片
            this.checkSliceStart(mouseX, mouseY);
        };
        
        // 滑鼠移動事件
        this.mouseMoveHandler = (event) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
            
            this.inputHandler.lastMouseX = this.inputHandler.mouseX;
            this.inputHandler.lastMouseY = this.inputHandler.mouseY;
            this.inputHandler.mouseX = mouseX;
            this.inputHandler.mouseY = mouseY;
            
            if (this.inputHandler.mouseDown) {
                // 更新切片軌跡
                this.updateSliceTrail(mouseX, mouseY);
                
                // 更新切片方向
                this.updateSliceDirection();
                
                // 更新切片預覽
                this.updateSlicePreview();
            }
        };
        
        // 滑鼠釋放事件
        this.mouseUpHandler = (event) => {
            this.inputHandler.mouseDown = false;
            
            // 完成切片
            this.completeSlice();
        };
        
        canvas.addEventListener('mousedown', this.mouseDownHandler);
        canvas.addEventListener('mousemove', this.mouseMoveHandler);
        canvas.addEventListener('mouseup', this.mouseUpHandler);
    }

    /**
     * 檢查是否開始切片
     */
    checkSliceStart(mouseX, mouseY) {
        // 檢查是否在肉塊區域內
        for (let section of this.meatSections) {
            if (!section.completed &&
                mouseX >= section.x - section.width/2 &&
                mouseX <= section.x + section.width/2 &&
                mouseY >= section.y - section.height/2 &&
                mouseY <= section.y + section.height/2) {
                
                this.knifeControl.isSlicing = true;
                this.knifeControl.sliceStartX = mouseX;
                this.knifeControl.sliceStartY = mouseY;
                this.knifeControl.trailPoints = [{x: mouseX, y: mouseY}];
                this.currentSection = section;
                break;
            }
        }
    }

    /**
     * 更新切片軌跡
     */
    updateSliceTrail(mouseX, mouseY) {
        if (this.knifeControl.isSlicing) {
            this.knifeControl.trailPoints.push({x: mouseX, y: mouseY});
            this.knifeControl.sliceEndX = mouseX;
            this.knifeControl.sliceEndY = mouseY;
        }
    }

    /**
     * 更新切片方向
     */
    updateSliceDirection() {
        if (this.knifeControl.trailPoints.length >= 2) {
            const start = this.knifeControl.trailPoints[0];
            const end = this.knifeControl.trailPoints[this.knifeControl.trailPoints.length - 1];
            
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            
            if (length > 0) {
                this.inputHandler.sliceDirection = {
                    x: dx / length,
                    y: dy / length,
                    angle: Math.atan2(dy, dx)
                };
            }
        }
    }

    /**
     * 更新切片預覽
     */
    updateSlicePreview() {
        if (!this.knifeControl.isSlicing || !this.currentSection) return;
        
        const thickness = this.calculateSliceThickness();
        const quality = this.calculateSliceQuality();
        
        this.visualFeedback.slicePreview = {
            section: this.currentSection,
            thickness: thickness,
            quality: quality,
            direction: this.inputHandler.sliceDirection
        };
    }

    /**
     * 完成切片
     */
    completeSlice() {
        if (!this.knifeControl.isSlicing || !this.currentSection) return;
        
        this.knifeControl.isSlicing = false;
        
        // 計算切片品質
        const sliceQuality = this.calculateSliceQuality();
        const thickness = this.calculateSliceThickness();
        
        // 檢查切片是否有效
        if (this.isValidSlice()) {
            // 成功切片
            this.processSuccessfulSlice(sliceQuality, thickness);
        } else {
            // 切片失敗
            this.processFailedSlice();
        }
        
        // 清空軌跡和預覽
        this.knifeControl.trailPoints = [];
        this.visualFeedback.slicePreview = null;
        this.currentSection = null;
        
        // 檢查遊戲完成條件
        this.checkGameCompletion();
    }

    /**
     * 計算切片厚度
     */
    calculateSliceThickness() {
        if (!this.inputHandler.sliceDirection) return 0;
        
        // 根據切片速度和壓力計算厚度
        const speed = this.calculateSliceSpeed();
        const pressure = this.knifeControl.pressure;
        
        // 速度越快，厚度越不均勻
        // 壓力適中時厚度最佳
        let thickness = this.slicingStandards.optimalThickness;
        
        if (speed > 60) {
            thickness += (speed - 60) * 0.05;
        }
        
        if (pressure < 40 || pressure > 60) {
            thickness += Math.abs(pressure - 50) * 0.02;
        }
        
        return Math.max(this.slicingStandards.minThickness, 
                       Math.min(this.slicingStandards.maxThickness, thickness));
    }

    /**
     * 計算切片速度
     */
    calculateSliceSpeed() {
        if (this.knifeControl.trailPoints.length < 2) return 0;
        
        const totalLength = this.calculateTrailLength();
        const timeSpent = this.knifeControl.trailPoints.length * 0.016; // 假設60fps
        
        return timeSpent > 0 ? totalLength / timeSpent : 0;
    }

    /**
     * 計算軌跡長度
     */
    calculateTrailLength() {
        let length = 0;
        const points = this.knifeControl.trailPoints;
        
        for (let i = 1; i < points.length; i++) {
            const dx = points[i].x - points[i-1].x;
            const dy = points[i].y - points[i-1].y;
            length += Math.sqrt(dx * dx + dy * dy);
        }
        
        return length;
    }

    /**
     * 計算切片品質
     */
    calculateSliceQuality() {
        if (!this.currentSection || !this.inputHandler.sliceDirection) return 0;
        
        let quality = 0;
        
        // 纖維方向評分（逆紋切片得高分）
        const fiberAngle = this.currentSection.fiberDirection;
        const sliceAngle = this.inputHandler.sliceDirection.angle;
        let angleDiff = Math.abs(sliceAngle - (fiberAngle + Math.PI/2));
        
        // 標準化角度差
        if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
        if (angleDiff > Math.PI/2) angleDiff = Math.PI - angleDiff;
        
        const angleScore = Math.max(0, 100 - (angleDiff / (Math.PI/4)) * 50);
        quality += angleScore * 0.4;
        
        // 厚度評分
        const thickness = this.calculateSliceThickness();
        const thicknessDiff = Math.abs(thickness - this.slicingStandards.optimalThickness);
        const thicknessScore = Math.max(0, 100 - thicknessDiff * 25);
        quality += thicknessScore * 0.3;
        
        // 切片長度評分
        const length = this.calculateTrailLength();
        const lengthDiff = Math.abs(length - this.slicingStandards.optimalLength);
        const lengthScore = Math.max(0, 100 - lengthDiff * 2);
        quality += lengthScore * 0.2;
        
        // 切片平滑度評分
        const smoothness = this.calculateTrailSmoothness();
        quality += smoothness * 0.1;
        
        return Math.round(quality);
    }

    /**
     * 計算軌跡平滑度
     */
    calculateTrailSmoothness() {
        const points = this.knifeControl.trailPoints;
        if (points.length < 3) return 100;
        
        let totalAngleChange = 0;
        let segments = 0;
        
        for (let i = 2; i < points.length; i++) {
            const v1x = points[i-1].x - points[i-2].x;
            const v1y = points[i-1].y - points[i-2].y;
            const v2x = points[i].x - points[i-1].x;
            const v2y = points[i].y - points[i-1].y;
            
            const angle1 = Math.atan2(v1y, v1x);
            const angle2 = Math.atan2(v2y, v2x);
            
            let angleDiff = Math.abs(angle2 - angle1);
            if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
            
            totalAngleChange += angleDiff;
            segments++;
        }
        
        const averageAngleChange = segments > 0 ? totalAngleChange / segments : 0;
        return Math.max(0, 100 - averageAngleChange * 180 / Math.PI * 15);
    }

    /**
     * 檢查切片是否有效
     */
    isValidSlice() {
        if (!this.currentSection || this.knifeControl.trailPoints.length < 3) return false;
        
        const length = this.calculateTrailLength();
        return length >= 20; // 最小切片長度
    }

    /**
     * 處理成功切片
     */
    processSuccessfulSlice(quality, thickness) {
        const slice = {
            id: this.currentSection.slices.length,
            quality: quality,
            thickness: thickness,
            direction: { ...this.inputHandler.sliceDirection },
            trail: [...this.knifeControl.trailPoints]
        };
        
        this.currentSection.slices.push(slice);
        this.gameState.currentSlices++;
        this.gameState.score += Math.round(quality * 15);
        
        // 檢查區域是否完成
        if (this.currentSection.slices.length >= this.currentSection.targetSlices) {
            this.currentSection.completed = true;
        }
        
        // 播放成功音效
        if (this.gameEngine.gameState.settings.soundEnabled) {
            if (quality >= 95) {
                this.gameEngine.audioManager.playSound(this.sounds.perfectSound);
            } else {
                this.gameEngine.audioManager.playSound(this.sounds.successSound);
            }
        }
        
        // 顯示品質反饋
        this.showQualityFeedback(quality, thickness);
        
        console.log(`成功切片，品質: ${quality}，厚度: ${thickness.toFixed(1)}mm`);
    }

    /**
     * 處理失敗切片
     */
    processFailedSlice() {
        // 扣除少量分數
        this.gameState.score = Math.max(0, this.gameState.score - 100);
        
        // 播放失敗音效
        if (this.gameEngine.gameState.settings.soundEnabled) {
            this.gameEngine.audioManager.playSound(this.sounds.failSound);
        }
        
        // 顯示失敗反饋
        this.showFailureFeedback();
        
        console.log('切片失敗');
    }

    /**
     * 顯示品質反饋
     */
    showQualityFeedback(quality, thickness) {
        let feedbackText = '';
        let feedbackColor = '';
        
        if (quality >= 95) {
            feedbackText = `完美！大師級刀工！\n厚度: ${thickness.toFixed(1)}mm`;
            feedbackColor = '#32CD32';
        } else if (quality >= 85) {
            feedbackText = `優秀！逆紋切片！\n厚度: ${thickness.toFixed(1)}mm`;
            feedbackColor = '#FFD700';
        } else if (quality >= 70) {
            feedbackText = `良好！繼續保持！\n厚度: ${thickness.toFixed(1)}mm`;
            feedbackColor = '#FFA500';
        } else if (quality >= 50) {
            feedbackText = `一般，注意纖維方向\n厚度: ${thickness.toFixed(1)}mm`;
            feedbackColor = '#FF6347';
        } else {
            feedbackText = `需要改進角度和厚度\n厚度: ${thickness.toFixed(1)}mm`;
            feedbackColor = '#FF4500';
        }
        
        this.visualFeedback.currentFeedback = {
            text: feedbackText,
            color: feedbackColor,
            x: this.gameAreaX + this.gameAreaWidth / 2,
            y: this.gameAreaY + this.gameAreaHeight / 2
        };
        this.visualFeedback.feedbackTimer = 2.5;
    }

    /**
     * 顯示失敗反饋
     */
    showFailureFeedback() {
        this.visualFeedback.currentFeedback = {
            text: '切片太短或偏離目標！',
            color: '#FF4500',
            x: this.gameAreaX + this.gameAreaWidth / 2,
            y: this.gameAreaY + this.gameAreaHeight / 2
        };
        this.visualFeedback.feedbackTimer = 1.5;
    }

    /**
     * 檢查遊戲完成條件
     */
    checkGameCompletion() {
        const allCompleted = this.meatSections.every(section => section.completed);
        
        if (allCompleted || this.gameState.currentSlices >= this.gameState.targetSlices) {
            this.completeGame(true);
        } else if (this.gameState.timeRemaining <= 0) {
            this.completeGame(false);
        }
    }

    /**
     * 完成遊戲
     */
    completeGame(success) {
        this.gameState.phase = 'complete';
        
        // 計算最終統計
        const stats = {
            success: success,
            score: this.gameState.score,
            sliceCount: this.gameState.currentSlices,
            accuracy: this.calculateAccuracy(),
            quality: this.calculateAverageQuality(),
            uniformity: this.calculateUniformity(),
            slicedWeight: this.gameState.currentSlices * 22, // 每片約22克
            wasteAmount: Math.max(0, (this.gameState.targetSlices - this.gameState.currentSlices) * 5)
        };
        
        console.log('片肉遊戲完成:', stats);
        
        // 清理輸入處理器
        this.cleanup();
        
        // 通知場景遊戲完成
        setTimeout(() => {
            this.scene.onMiniGameComplete(success, stats);
        }, 1000);
    }

    /**
     * 計算準確度
     */
    calculateAccuracy() {
        return Math.round((this.gameState.currentSlices / this.gameState.targetSlices) * 100);
    }

    /**
     * 計算平均品質
     */
    calculateAverageQuality() {
        let totalQuality = 0;
        let totalSlices = 0;
        
        this.meatSections.forEach(section => {
            section.slices.forEach(slice => {
                totalQuality += slice.quality;
                totalSlices++;
            });
        });
        
        return totalSlices > 0 ? Math.round(totalQuality / totalSlices) : 0;
    }

    /**
     * 計算均勻度
     */
    calculateUniformity() {
        let allThicknesses = [];
        
        this.meatSections.forEach(section => {
            section.slices.forEach(slice => {
                allThicknesses.push(slice.thickness);
            });
        });
        
        if (allThicknesses.length < 2) return 100;
        
        const average = allThicknesses.reduce((sum, t) => sum + t, 0) / allThicknesses.length;
        const variance = allThicknesses.reduce((sum, t) => sum + Math.pow(t - average, 2), 0) / allThicknesses.length;
        const standardDeviation = Math.sqrt(variance);
        
        return Math.max(0, Math.round(100 - standardDeviation * 20));
    }

    /**
     * 獲取進度文字
     */
    getProgressText() {
        return `進度: ${this.gameState.currentSlices}/${this.gameState.targetSlices} 片 | 分數: ${this.gameState.score}`;
    }

    /**
     * 獲取時間文字
     */
    getTimeText() {
        const minutes = Math.floor(this.gameState.timeRemaining / 60);
        const seconds = Math.floor(this.gameState.timeRemaining % 60);
        return `時間: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * 獲取品質文字
     */
    getQualityText() {
        const avgQuality = this.calculateAverageQuality();
        return `平均品質: ${avgQuality}%`;
    }

    /**
     * 更新遊戲邏輯
     */
    update(deltaTime) {
        super.update(deltaTime);
        
        // 更新時間
        if (this.gameState.phase === 'slicing') {
            this.gameState.timeRemaining = Math.max(0, this.gameState.timeRemaining - deltaTime);
        }
        
        // 更新肉質分析
        this.updateMeatAnalysis(deltaTime);
        
        // 更新視覺反饋計時器
        if (this.visualFeedback.feedbackTimer > 0) {
            this.visualFeedback.feedbackTimer -= deltaTime;
        }
        
        // 更新UI顯示
        this.updateUIDisplays();
        
        // 檢查遊戲完成條件
        if (this.gameState.phase === 'slicing') {
            this.checkGameCompletion();
        }
    }

    /**
     * 更新肉質分析
     */
    updateMeatAnalysis(deltaTime) {
        // 溫度逐漸降低
        if (this.meatAnalysis.temperature > 25) {
            this.meatAnalysis.temperature = Math.max(25, this.meatAnalysis.temperature - 1 * deltaTime);
        }
        
        // 溫度影響切片品質
        if (this.meatAnalysis.temperature < 45) {
            this.meatAnalysis.tenderness *= 0.999;
        }
    }

    /**
     * 更新UI顯示
     */
    updateUIDisplays() {
        if (this.progressLabel) {
            this.progressLabel.setText(this.getProgressText());
        }
        
        if (this.timeLabel) {
            this.timeLabel.setText(this.getTimeText());
        }
        
        if (this.qualityLabel) {
            this.qualityLabel.setText(this.getQualityText());
        }
    }

    /**
     * 渲染遊戲
     */
    render(context) {
        super.render(context);
        
        // 渲染遊戲區域背景
        this.renderGameArea(context);
        
        // 渲染肉塊和纖維方向
        this.renderMeatSections(context);
        
        // 渲染切片軌跡
        this.renderKnifeTrail(context);
        
        // 渲染切片預覽
        this.renderSlicePreview(context);
        
        // 渲染視覺反饋
        this.renderVisualFeedback(context);
    }

    /**
     * 渲染遊戲區域
     */
    renderGameArea(context) {
        // 渲染遊戲區域邊框
        context.strokeStyle = '#8B4513';
        context.lineWidth = 2;
        context.strokeRect(this.gameAreaX, this.gameAreaY, this.gameAreaWidth, this.gameAreaHeight);
    }

    /**
     * 渲染肉塊區域
     */
    renderMeatSections(context) {
        this.meatSections.forEach(section => {
            // 渲染肉塊
            if (section.completed) {
                context.fillStyle = 'rgba(205, 133, 63, 0.5)';
            } else {
                context.fillStyle = '#CD853F';
            }
            
            context.fillRect(
                section.x - section.width/2,
                section.y - section.height/2,
                section.width,
                section.height
            );
            
            // 渲染邊框
            context.strokeStyle = section.completed ? '#32CD32' : '#8B4513';
            context.lineWidth = 2;
            context.strokeRect(
                section.x - section.width/2,
                section.y - section.height/2,
                section.width,
                section.height
            );
            
            // 渲染纖維方向
            if (this.visualFeedback.showFiberDirection) {
                this.renderFiberDirection(context, section);
            }
            
            // 渲染已切片
            this.renderExistingSlices(context, section);
            
            // 渲染區域標籤
            context.fillStyle = '#FFFFFF';
            context.font = '12px Arial';
            context.textAlign = 'center';
            context.fillText(
                `${section.name} (${section.slices.length}/${section.targetSlices})`,
                section.x,
                section.y - section.height/2 - 10
            );
        });
    }

    /**
     * 渲染纖維方向
     */
    renderFiberDirection(context, section) {
        const fiberData = this.meatAnalysis.fiberDirection.find(f => f.sectionId === section.id);
        if (!fiberData) return;
        
        context.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        context.lineWidth = 1;
        
        fiberData.fibers.forEach(fiber => {
            context.beginPath();
            context.moveTo(fiber.startX, fiber.startY);
            context.lineTo(fiber.endX, fiber.endY);
            context.stroke();
        });
    }

    /**
     * 渲染已有切片
     */
    renderExistingSlices(context, section) {
        section.slices.forEach((slice, index) => {
            // 渲染切片軌跡
            if (slice.trail && slice.trail.length > 1) {
                context.strokeStyle = slice.quality >= 80 ? '#32CD32' : 
                                    slice.quality >= 60 ? '#FFD700' : '#FF6347';
                context.lineWidth = 2;
                context.lineCap = 'round';
                
                context.beginPath();
                context.moveTo(slice.trail[0].x, slice.trail[0].y);
                
                for (let i = 1; i < slice.trail.length; i++) {
                    context.lineTo(slice.trail[i].x, slice.trail[i].y);
                }
                
                context.stroke();
            }
        });
    }

    /**
     * 渲染刀具軌跡
     */
    renderKnifeTrail(context) {
        if (this.knifeControl.trailPoints.length < 2) return;
        
        context.strokeStyle = '#C0C0C0';
        context.lineWidth = 3;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        
        context.beginPath();
        context.moveTo(this.knifeControl.trailPoints[0].x, this.knifeControl.trailPoints[0].y);
        
        for (let i = 1; i < this.knifeControl.trailPoints.length; i++) {
            context.lineTo(this.knifeControl.trailPoints[i].x, this.knifeControl.trailPoints[i].y);
        }
        
        context.stroke();
    }

    /**
     * 渲染切片預覽
     */
    renderSlicePreview(context) {
        if (!this.visualFeedback.slicePreview) return;
        
        const preview = this.visualFeedback.slicePreview;
        
        // 顯示厚度指示
        if (this.visualFeedback.showThicknessGuide) {
            const thickness = preview.thickness;
            let color = '#32CD32';
            
            if (thickness < this.slicingStandards.minThickness || 
                thickness > this.slicingStandards.maxThickness) {
                color = '#FF4500';
            } else if (Math.abs(thickness - this.slicingStandards.optimalThickness) > 1) {
                color = '#FFD700';
            }
            
            context.fillStyle = color;
            context.font = '14px Arial';
            context.textAlign = 'center';
            context.fillText(
                `厚度: ${thickness.toFixed(1)}mm`,
                this.inputHandler.mouseX,
                this.inputHandler.mouseY - 20
            );
        }
        
        // 顯示品質指示
        if (this.visualFeedback.showQualityIndicator) {
            const quality = preview.quality;
            let color = quality >= 80 ? '#32CD32' : 
                       quality >= 60 ? '#FFD700' : '#FF6347';
            
            context.fillStyle = color;
            context.font = '12px Arial';
            context.textAlign = 'center';
            context.fillText(
                `品質: ${Math.round(quality)}%`,
                this.inputHandler.mouseX,
                this.inputHandler.mouseY + 30
            );
        }
    }

    /**
     * 渲染視覺反饋
     */
    renderVisualFeedback(context) {
        if (this.visualFeedback.feedbackTimer > 0 && this.visualFeedback.currentFeedback) {
            const feedback = this.visualFeedback.currentFeedback;
            
            context.save();
            context.globalAlpha = Math.min(1, this.visualFeedback.feedbackTimer);
            context.fillStyle = feedback.color;
            context.font = '16px Arial';
            context.textAlign = 'center';
            
            const lines = feedback.text.split('\n');
            lines.forEach((line, index) => {
                context.fillText(line, feedback.x, feedback.y + index * 20);
            });
            
            context.restore();
        }
    }

    /**
     * 清理資源
     */
    cleanup() {
        const canvas = this.gameEngine.canvas;
        
        if (this.mouseDownHandler) {
            canvas.removeEventListener('mousedown', this.mouseDownHandler);
        }
        if (this.mouseMoveHandler) {
            canvas.removeEventListener('mousemove', this.mouseMoveHandler);
        }
        if (this.mouseUpHandler) {
            canvas.removeEventListener('mouseup', this.mouseUpHandler);
        }
        
        super.cleanup();
    }
}