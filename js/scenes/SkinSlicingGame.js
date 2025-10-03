/**
 * 片皮迷你遊戲
 * 玩家需要精確控制刀具角度和力度來片取鴨皮
 */
class SkinSlicingGame extends MiniGame {
    constructor(config) {
        super(config);
        
        this.name = '片皮遊戲';
        this.gameAreaX = config.gameAreaX;
        this.gameAreaY = config.gameAreaY;
        this.gameAreaWidth = config.gameAreaWidth;
        this.gameAreaHeight = config.gameAreaHeight;
        this.slicingSystem = config.slicingSystem;
        this.workStation = config.workStation;
        
        // 遊戲狀態
        this.gameState = {
            phase: 'instruction',  // instruction, slicing, complete
            targetSlices: 24,      // 目標片數
            currentSlices: 0,      // 當前片數
            timeLimit: 120,        // 時間限制（秒）
            timeRemaining: 120,
            score: 0,
            accuracy: 100,
            speed: 0
        };
        
        // 切片目標區域
        this.sliceTargets = [];
        this.generateSliceTargets();
        
        // 刀具控制
        this.knifeControl = {
            x: this.workStation.knifeX,
            y: this.workStation.knifeY,
            angle: 20,              // 切片角度
            pressure: 30,           // 施力大小
            isSlicing: false,       // 是否正在切片
            sliceStartX: 0,
            sliceStartY: 0,
            sliceEndX: 0,
            sliceEndY: 0,
            trailPoints: []         // 刀痕軌跡點
        };
        
        // 視覺反饋
        this.visualFeedback = {
            showAngleGuide: true,
            showPressureIndicator: true,
            showAccuracyFeedback: true,
            currentFeedback: null,
            feedbackTimer: 0
        };
        
        // 輸入處理
        this.inputHandler = {
            mouseDown: false,
            mouseX: 0,
            mouseY: 0,
            lastMouseX: 0,
            lastMouseY: 0,
            dragStartX: 0,
            dragStartY: 0
        };
        
        // 音效
        this.sounds = {
            sliceSound: 'slice_cut',
            successSound: 'slice_success',
            failSound: 'slice_fail'
        };
    }

    /**
     * 生成切片目標區域
     */
    generateSliceTargets() {
        this.sliceTargets = [];
        
        // 在鴨子表面生成切片目標點
        const duckCenterX = this.workStation.duckX;
        const duckCenterY = this.workStation.duckY;
        const duckWidth = this.workStation.duckWidth;
        const duckHeight = this.workStation.duckHeight;
        
        // 生成網格狀的切片目標
        const rows = 6;
        const cols = 4;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = duckCenterX - duckWidth/2 + (col + 0.5) * (duckWidth / cols);
                const y = duckCenterY - duckHeight/2 + (row + 0.5) * (duckHeight / rows);
                
                this.sliceTargets.push({
                    id: row * cols + col,
                    x: x,
                    y: y,
                    width: duckWidth / cols * 0.8,
                    height: duckHeight / rows * 0.8,
                    sliced: false,
                    quality: 0,
                    angle: 0,
                    pressure: 0
                });
            }
        }
    }

    /**
     * 開始遊戲
     */
    start() {
        super.start();
        
        this.setupGameUI();
        this.setupInputHandlers();
        
        console.log('片皮遊戲開始');
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
            text: '片皮技法 - 精確控制刀具角度和力度',
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
        
        // 角度控制滑桿
        this.angleSlider = this.createAngleSlider();
        
        // 壓力控制滑桿
        this.pressureSlider = this.createPressureSlider();
        
        // 說明文字
        this.instructionLabel = uiManager.createLabel({
            x: this.gameAreaX + this.gameAreaWidth / 2,
            y: this.gameAreaY + this.gameAreaHeight - 60,
            text: '拖拽滑桿調整角度和壓力，然後在鴨皮上劃線切片',
            fontSize: 14,
            color: '#4682B4',
            align: 'center'
        });
        
        this.addUIElement(this.gameTitle);
        this.addUIElement(this.progressLabel);
        this.addUIElement(this.timeLabel);
        this.addUIElement(this.instructionLabel);
    }

    /**
     * 創建角度控制滑桿
     */
    createAngleSlider() {
        const sliderX = this.gameAreaX + 20;
        const sliderY = this.gameAreaY + 60;
        const sliderWidth = 150;
        
        return {
            x: sliderX,
            y: sliderY,
            width: sliderWidth,
            height: 20,
            minValue: 10,
            maxValue: 45,
            currentValue: 20,
            isDragging: false,
            label: '切片角度'
        };
    }

    /**
     * 創建壓力控制滑桿
     */
    createPressureSlider() {
        const sliderX = this.gameAreaX + 20;
        const sliderY = this.gameAreaY + 100;
        const sliderWidth = 150;
        
        return {
            x: sliderX,
            y: sliderY,
            width: sliderWidth,
            height: 20,
            minValue: 10,
            maxValue: 60,
            currentValue: 30,
            isDragging: false,
            label: '施力大小'
        };
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
            
            // 檢查是否點擊滑桿
            this.checkSliderClick(mouseX, mouseY);
            
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
                // 更新滑桿
                this.updateSliders(mouseX, mouseY);
                
                // 更新切片軌跡
                this.updateSliceTrail(mouseX, mouseY);
            }
        };
        
        // 滑鼠釋放事件
        this.mouseUpHandler = (event) => {
            this.inputHandler.mouseDown = false;
            
            // 結束滑桿拖拽
            this.angleSlider.isDragging = false;
            this.pressureSlider.isDragging = false;
            
            // 完成切片
            this.completeSlice();
        };
        
        canvas.addEventListener('mousedown', this.mouseDownHandler);
        canvas.addEventListener('mousemove', this.mouseMoveHandler);
        canvas.addEventListener('mouseup', this.mouseUpHandler);
    }

    /**
     * 檢查滑桿點擊
     */
    checkSliderClick(mouseX, mouseY) {
        // 檢查角度滑桿
        if (this.isPointInSlider(mouseX, mouseY, this.angleSlider)) {
            this.angleSlider.isDragging = true;
        }
        
        // 檢查壓力滑桿
        if (this.isPointInSlider(mouseX, mouseY, this.pressureSlider)) {
            this.pressureSlider.isDragging = true;
        }
    }

    /**
     * 檢查點是否在滑桿內
     */
    isPointInSlider(x, y, slider) {
        return x >= slider.x && x <= slider.x + slider.width &&
               y >= slider.y && y <= slider.y + slider.height;
    }

    /**
     * 檢查是否開始切片
     */
    checkSliceStart(mouseX, mouseY) {
        // 檢查是否在鴨子區域內
        const duckArea = {
            x: this.workStation.duckX - this.workStation.duckWidth / 2,
            y: this.workStation.duckY - this.workStation.duckHeight / 2,
            width: this.workStation.duckWidth,
            height: this.workStation.duckHeight
        };
        
        if (mouseX >= duckArea.x && mouseX <= duckArea.x + duckArea.width &&
            mouseY >= duckArea.y && mouseY <= duckArea.y + duckArea.height) {
            
            this.knifeControl.isSlicing = true;
            this.knifeControl.sliceStartX = mouseX;
            this.knifeControl.sliceStartY = mouseY;
            this.knifeControl.trailPoints = [{x: mouseX, y: mouseY}];
        }
    }

    /**
     * 更新滑桿
     */
    updateSliders(mouseX, mouseY) {
        // 更新角度滑桿
        if (this.angleSlider.isDragging) {
            const ratio = Math.max(0, Math.min(1, (mouseX - this.angleSlider.x) / this.angleSlider.width));
            this.angleSlider.currentValue = this.angleSlider.minValue + 
                ratio * (this.angleSlider.maxValue - this.angleSlider.minValue);
            this.knifeControl.angle = this.angleSlider.currentValue;
        }
        
        // 更新壓力滑桿
        if (this.pressureSlider.isDragging) {
            const ratio = Math.max(0, Math.min(1, (mouseX - this.pressureSlider.x) / this.pressureSlider.width));
            this.pressureSlider.currentValue = this.pressureSlider.minValue + 
                ratio * (this.pressureSlider.maxValue - this.pressureSlider.minValue);
            this.knifeControl.pressure = this.pressureSlider.currentValue;
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
     * 完成切片
     */
    completeSlice() {
        if (!this.knifeControl.isSlicing) return;
        
        this.knifeControl.isSlicing = false;
        
        // 計算切片品質
        const sliceQuality = this.calculateSliceQuality();
        
        // 檢查是否命中目標區域
        const hitTargets = this.checkTargetHits();
        
        if (hitTargets.length > 0) {
            // 成功切片
            this.processSuccessfulSlice(hitTargets, sliceQuality);
        } else {
            // 切片失敗
            this.processFailedSlice();
        }
        
        // 清空軌跡
        this.knifeControl.trailPoints = [];
        
        // 檢查遊戲完成條件
        this.checkGameCompletion();
    }

    /**
     * 計算切片品質
     */
    calculateSliceQuality() {
        const angle = this.knifeControl.angle;
        const pressure = this.knifeControl.pressure;
        const trailLength = this.calculateTrailLength();
        
        let quality = 0;
        
        // 角度評分（最佳角度15-25度）
        const optimalAngle = 20;
        const angleDiff = Math.abs(angle - optimalAngle);
        const angleScore = Math.max(0, 100 - angleDiff * 4);
        quality += angleScore * 0.4;
        
        // 壓力評分（最佳壓力25-35）
        const optimalPressure = 30;
        const pressureDiff = Math.abs(pressure - optimalPressure);
        const pressureScore = Math.max(0, 100 - pressureDiff * 3);
        quality += pressureScore * 0.3;
        
        // 軌跡長度評分（適中長度最佳）
        const optimalLength = 60;
        const lengthDiff = Math.abs(trailLength - optimalLength);
        const lengthScore = Math.max(0, 100 - lengthDiff * 2);
        quality += lengthScore * 0.2;
        
        // 軌跡平滑度評分
        const smoothness = this.calculateTrailSmoothness();
        quality += smoothness * 0.1;
        
        return Math.round(quality);
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
        return Math.max(0, 100 - averageAngleChange * 180 / Math.PI * 10);
    }

    /**
     * 檢查目標命中
     */
    checkTargetHits() {
        const hitTargets = [];
        const points = this.knifeControl.trailPoints;
        
        this.sliceTargets.forEach(target => {
            if (target.sliced) return;
            
            // 檢查軌跡是否穿過目標區域
            for (let point of points) {
                if (point.x >= target.x - target.width/2 &&
                    point.x <= target.x + target.width/2 &&
                    point.y >= target.y - target.height/2 &&
                    point.y <= target.y + target.height/2) {
                    
                    hitTargets.push(target);
                    break;
                }
            }
        });
        
        return hitTargets;
    }

    /**
     * 處理成功切片
     */
    processSuccessfulSlice(hitTargets, quality) {
        hitTargets.forEach(target => {
            target.sliced = true;
            target.quality = quality;
            target.angle = this.knifeControl.angle;
            target.pressure = this.knifeControl.pressure;
            
            this.gameState.currentSlices++;
            this.gameState.score += Math.round(quality * 10);
        });
        
        // 播放成功音效
        if (this.gameEngine.gameState.settings.soundEnabled) {
            this.gameEngine.audioManager.playSound(this.sounds.successSound);
        }
        
        // 顯示品質反饋
        this.showQualityFeedback(quality);
        
        console.log(`成功切片 ${hitTargets.length} 片，品質: ${quality}`);
    }

    /**
     * 處理失敗切片
     */
    processFailedSlice() {
        // 扣除少量分數
        this.gameState.score = Math.max(0, this.gameState.score - 50);
        
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
    showQualityFeedback(quality) {
        let feedbackText = '';
        let feedbackColor = '';
        
        if (quality >= 90) {
            feedbackText = '完美！刀工精湛！';
            feedbackColor = '#32CD32';
        } else if (quality >= 75) {
            feedbackText = '很好！技法熟練！';
            feedbackColor = '#FFD700';
        } else if (quality >= 60) {
            feedbackText = '不錯！繼續練習！';
            feedbackColor = '#FFA500';
        } else {
            feedbackText = '需要改進角度和力度';
            feedbackColor = '#FF6347';
        }
        
        this.visualFeedback.currentFeedback = {
            text: feedbackText,
            color: feedbackColor,
            x: this.gameAreaX + this.gameAreaWidth / 2,
            y: this.gameAreaY + this.gameAreaHeight / 2
        };
        this.visualFeedback.feedbackTimer = 2.0;
    }

    /**
     * 顯示失敗反饋
     */
    showFailureFeedback() {
        this.visualFeedback.currentFeedback = {
            text: '未命中目標區域！',
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
        if (this.gameState.currentSlices >= this.gameState.targetSlices) {
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
            slicedWeight: this.gameState.currentSlices * 8, // 每片約8克
            wasteAmount: Math.max(0, (this.gameState.targetSlices - this.gameState.currentSlices) * 2)
        };
        
        console.log('片皮遊戲完成:', stats);
        
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
        const slicedTargets = this.sliceTargets.filter(t => t.sliced);
        if (slicedTargets.length === 0) return 0;
        
        const totalQuality = slicedTargets.reduce((sum, target) => sum + target.quality, 0);
        return Math.round(totalQuality / slicedTargets.length);
    }

    /**
     * 計算均勻度
     */
    calculateUniformity() {
        const slicedTargets = this.sliceTargets.filter(t => t.sliced);
        if (slicedTargets.length < 2) return 100;
        
        const qualities = slicedTargets.map(t => t.quality);
        const average = qualities.reduce((sum, q) => sum + q, 0) / qualities.length;
        const variance = qualities.reduce((sum, q) => sum + Math.pow(q - average, 2), 0) / qualities.length;
        const standardDeviation = Math.sqrt(variance);
        
        return Math.max(0, Math.round(100 - standardDeviation));
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
     * 更新遊戲邏輯
     */
    update(deltaTime) {
        super.update(deltaTime);
        
        // 更新時間
        if (this.gameState.phase === 'slicing') {
            this.gameState.timeRemaining = Math.max(0, this.gameState.timeRemaining - deltaTime);
        }
        
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
     * 更新UI顯示
     */
    updateUIDisplays() {
        if (this.progressLabel) {
            this.progressLabel.setText(this.getProgressText());
        }
        
        if (this.timeLabel) {
            this.timeLabel.setText(this.getTimeText());
        }
    }

    /**
     * 渲染遊戲
     */
    render(context) {
        super.render(context);
        
        // 渲染遊戲區域背景
        this.renderGameArea(context);
        
        // 渲染鴨子和切片目標
        this.renderDuckAndTargets(context);
        
        // 渲染控制面板
        this.renderControlPanel(context);
        
        // 渲染刀具軌跡
        this.renderKnifeTrail(context);
        
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
     * 渲染鴨子和切片目標
     */
    renderDuckAndTargets(context) {
        // 渲染鴨子
        context.fillStyle = '#DAA520';
        const duckX = this.workStation.duckX - this.workStation.duckWidth / 2;
        const duckY = this.workStation.duckY - this.workStation.duckHeight / 2;
        context.fillRect(duckX, duckY, this.workStation.duckWidth, this.workStation.duckHeight);
        
        // 渲染切片目標區域
        this.sliceTargets.forEach(target => {
            if (target.sliced) {
                // 已切片區域
                context.fillStyle = 'rgba(50, 205, 50, 0.3)';
                context.fillRect(
                    target.x - target.width/2,
                    target.y - target.height/2,
                    target.width,
                    target.height
                );
                
                // 顯示品質評分
                context.fillStyle = '#FFFFFF';
                context.font = '10px Arial';
                context.textAlign = 'center';
                context.fillText(
                    target.quality.toString(),
                    target.x,
                    target.y + 3
                );
            } else {
                // 未切片區域
                context.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                context.lineWidth = 1;
                context.strokeRect(
                    target.x - target.width/2,
                    target.y - target.height/2,
                    target.width,
                    target.height
                );
            }
        });
    }

    /**
     * 渲染控制面板
     */
    renderControlPanel(context) {
        // 渲染角度滑桿
        this.renderSlider(context, this.angleSlider);
        
        // 渲染壓力滑桿
        this.renderSlider(context, this.pressureSlider);
    }

    /**
     * 渲染滑桿
     */
    renderSlider(context, slider) {
        // 滑桿背景
        context.fillStyle = '#D3D3D3';
        context.fillRect(slider.x, slider.y, slider.width, slider.height);
        
        // 滑桿邊框
        context.strokeStyle = '#808080';
        context.lineWidth = 1;
        context.strokeRect(slider.x, slider.y, slider.width, slider.height);
        
        // 滑桿值指示器
        const ratio = (slider.currentValue - slider.minValue) / (slider.maxValue - slider.minValue);
        const indicatorX = slider.x + ratio * slider.width;
        
        context.fillStyle = '#4682B4';
        context.fillRect(indicatorX - 3, slider.y - 2, 6, slider.height + 4);
        
        // 滑桿標籤
        context.fillStyle = '#000000';
        context.font = '12px Arial';
        context.textAlign = 'left';
        context.fillText(
            `${slider.label}: ${Math.round(slider.currentValue)}`,
            slider.x,
            slider.y - 5
        );
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
     * 渲染視覺反饋
     */
    renderVisualFeedback(context) {
        if (this.visualFeedback.feedbackTimer > 0 && this.visualFeedback.currentFeedback) {
            const feedback = this.visualFeedback.currentFeedback;
            
            context.save();
            context.globalAlpha = Math.min(1, this.visualFeedback.feedbackTimer);
            context.fillStyle = feedback.color;
            context.font = '18px Arial';
            context.textAlign = 'center';
            context.fillText(feedback.text, feedback.x, feedback.y);
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
// 匯出到全域作用域
window.SkinSlicingGame = SkinSlicingGame;
