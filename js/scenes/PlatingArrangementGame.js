/**
 * 擺盤藝術迷你遊戲
 * 玩家需要將切好的鴨皮鴨肉進行藝術擺盤，並準備傳統配菜
 */
class PlatingArrangementGame extends MiniGame {
    constructor(config) {
        super(config);
        
        this.name = '擺盤藝術遊戲';
        this.gameAreaX = config.gameAreaX;
        this.gameAreaY = config.gameAreaY;
        this.gameAreaWidth = config.gameAreaWidth;
        this.gameAreaHeight = config.gameAreaHeight;
        this.slicingSystem = config.slicingSystem;
        this.workStation = config.workStation;
        this.traditionalServing = config.traditionalServing;
        
        // 遊戲狀態
        this.gameState = {
            phase: 'instruction',  // instruction, plating, accompaniments, complete
            currentTask: 'skin_arrangement', // skin_arrangement, meat_arrangement, accompaniment_prep
            timeLimit: 180,        // 時間限制（秒）
            timeRemaining: 180,
            score: 0,
            creativity: 0,
            symmetry: 0,
            colorBalance: 0
        };
        
        // 擺盤區域
        this.platingAreas = {
            mainPlate: {
                x: this.workStation.plateX,
                y: this.workStation.plateY,
                radius: 60,
                items: [],
                style: 'traditional'
            },
            sidePlates: [
                { x: this.workStation.plateX - 100, y: this.workStation.plateY + 80, radius: 30, items: [], type: 'pancakes' },
                { x: this.workStation.plateX + 100, y: this.workStation.plateY + 80, radius: 25, items: [], type: 'vegetables' },
                { x: this.workStation.plateX, y: this.workStation.plateY + 120, radius: 20, items: [], type: 'sauce' }
            ]
        };
        
        // 可拖拽物品
        this.draggableItems = [];
        this.generateDraggableItems();
        
        // 擺盤模板
        this.platingTemplates = {
            traditional: {
                name: '傳統擺盤',
                description: '皮片呈扇形排列，肉片圍繞中心',
                skinPattern: 'fan',
                meatPattern: 'circle',
                symmetry: 90,
                bonus: 100
            },
            modern: {
                name: '現代風格',
                description: '幾何圖形排列，注重視覺衝擊',
                skinPattern: 'geometric',
                meatPattern: 'linear',
                symmetry: 85,
                bonus: 120
            },
            artistic: {
                name: '藝術創意',
                description: '自由發揮，展現個人風格',
                skinPattern: 'free',
                meatPattern: 'free',
                symmetry: 70,
                bonus: 150
            }
        };
        
        // 當前選擇的模板
        this.selectedTemplate = this.platingTemplates.traditional;
        
        // 拖拽狀態
        this.dragState = {
            isDragging: false,
            draggedItem: null,
            dragOffsetX: 0,
            dragOffsetY: 0,
            originalX: 0,
            originalY: 0
        };
        
        // 視覺反饋
        this.visualFeedback = {
            showGrid: true,
            showTemplateGuide: true,
            showSymmetryLines: true,
            currentFeedback: null,
            feedbackTimer: 0,
            highlightedArea: null
        };
        
        // 評分系統
        this.scoringSystem = {
            symmetryWeight: 0.3,
            colorBalanceWeight: 0.25,
            creativityWeight: 0.25,
            completenessWeight: 0.2,
            bonusMultiplier: 1.0
        };
        
        // 輸入處理
        this.inputHandler = {
            mouseDown: false,
            mouseX: 0,
            mouseY: 0,
            lastMouseX: 0,
            lastMouseY: 0
        };
        
        // 音效
        this.sounds = {
            pickupSound: 'item_pickup',
            placeSound: 'item_place',
            successSound: 'arrangement_success',
            completeSound: 'plating_complete'
        };
    }

    /**
     * 生成可拖拽物品
     */
    generateDraggableItems() {
        this.draggableItems = [];
        
        // 鴨皮片
        const skinCount = this.slicingSystem.slices.skin.count || 24;
        for (let i = 0; i < skinCount; i++) {
            this.draggableItems.push({
                id: `skin_${i}`,
                type: 'skin',
                x: 50 + (i % 6) * 25,
                y: 150 + Math.floor(i / 6) * 15,
                width: 20,
                height: 8,
                color: '#DAA520',
                placed: false,
                quality: 85 + Math.random() * 15
            });
        }
        
        // 鴨肉片
        const meatCount = this.slicingSystem.slices.meat.count || 36;
        for (let i = 0; i < meatCount; i++) {
            this.draggableItems.push({
                id: `meat_${i}`,
                type: 'meat',
                x: 50 + (i % 8) * 20,
                y: 250 + Math.floor(i / 8) * 12,
                width: 16,
                height: 6,
                color: '#CD853F',
                placed: false,
                quality: 80 + Math.random() * 20
            });
        }
        
        // 配菜物品
        this.generateAccompanimentItems();
    }

    /**
     * 生成配菜物品
     */
    generateAccompanimentItems() {
        // 荷葉餅
        for (let i = 0; i < 12; i++) {
            this.draggableItems.push({
                id: `pancake_${i}`,
                type: 'pancake',
                x: 550 + (i % 4) * 30,
                y: 150 + Math.floor(i / 4) * 25,
                width: 25,
                height: 25,
                color: '#F5DEB3',
                placed: false,
                quality: 90
            });
        }
        
        // 蔥絲
        for (let i = 0; i < 8; i++) {
            this.draggableItems.push({
                id: `scallion_${i}`,
                type: 'scallion',
                x: 550 + (i % 4) * 15,
                y: 250 + Math.floor(i / 4) * 10,
                width: 12,
                height: 3,
                color: '#228B22',
                placed: false,
                quality: 95
            });
        }
        
        // 黃瓜條
        for (let i = 0; i < 8; i++) {
            this.draggableItems.push({
                id: `cucumber_${i}`,
                type: 'cucumber',
                x: 550 + (i % 4) * 15,
                y: 290 + Math.floor(i / 4) * 10,
                width: 12,
                height: 3,
                color: '#32CD32',
                placed: false,
                quality: 92
            });
        }
        
        // 甜麵醬
        this.draggableItems.push({
            id: 'sauce_bowl',
            type: 'sauce',
            x: 580,
            y: 330,
            width: 30,
            height: 20,
            color: '#8B4513',
            placed: false,
            quality: 88
        });
    }

    /**
     * 開始遊戲
     */
    start() {
        super.start();
        
        this.setupGameUI();
        this.setupInputHandlers();
        
        console.log('擺盤藝術遊戲開始');
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
            text: '擺盤藝術 - 展現千年飲食美學',
            fontSize: 18,
            color: '#DC143C',
            align: 'center'
        });
        
        // 任務顯示
        this.taskLabel = uiManager.createLabel({
            x: this.gameAreaX + 20,
            y: this.gameAreaY + 20,
            text: this.getTaskText(),
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
        
        // 評分顯示
        this.scoreLabel = uiManager.createLabel({
            x: this.gameAreaX + 20,
            y: this.gameAreaY + 50,
            text: this.getScoreText(),
            fontSize: 12,
            color: '#4682B4',
            align: 'left'
        });
        
        // 模板選擇按鈕
        this.createTemplateButtons();
        
        // 說明文字
        this.instructionLabel = uiManager.createLabel({
            x: this.gameAreaX + this.gameAreaWidth / 2,
            y: this.gameAreaY + this.gameAreaHeight - 20,
            text: '拖拽食材到盤子上進行擺盤，追求對稱美觀',
            fontSize: 14,
            color: '#4682B4',
            align: 'center'
        });
        
        this.addUIElement(this.gameTitle);
        this.addUIElement(this.taskLabel);
        this.addUIElement(this.timeLabel);
        this.addUIElement(this.scoreLabel);
        this.addUIElement(this.instructionLabel);
    }

    /**
     * 創建模板選擇按鈕
     */
    createTemplateButtons() {
        const uiManager = this.gameEngine.uiManager;
        const buttonY = this.gameAreaY + 80;
        
        Object.keys(this.platingTemplates).forEach((key, index) => {
            const template = this.platingTemplates[key];
            const button = uiManager.createButton({
                x: this.gameAreaX + 20 + index * 100,
                y: buttonY,
                width: 90,
                height: 30,
                text: template.name,
                onClick: () => this.selectTemplate(key)
            });
            
            this.addUIElement(button);
        });
    }

    /**
     * 選擇擺盤模板
     */
    selectTemplate(templateKey) {
        this.selectedTemplate = this.platingTemplates[templateKey];
        this.visualFeedback.showTemplateGuide = true;
        
        // 播放選擇音效
        if (this.gameEngine.gameState.settings.soundEnabled) {
            this.gameEngine.audioManager.playSound('button_click');
        }
        
        console.log(`選擇擺盤模板: ${this.selectedTemplate.name}`);
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
            
            // 檢查是否點擊物品
            this.checkItemClick(mouseX, mouseY);
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
            
            // 更新拖拽
            if (this.dragState.isDragging) {
                this.updateDrag(mouseX, mouseY);
            }
            
            // 更新高亮區域
            this.updateHighlight(mouseX, mouseY);
        };
        
        // 滑鼠釋放事件
        this.mouseUpHandler = (event) => {
            this.inputHandler.mouseDown = false;
            
            // 完成拖拽
            this.completeDrag();
        };
        
        canvas.addEventListener('mousedown', this.mouseDownHandler);
        canvas.addEventListener('mousemove', this.mouseMoveHandler);
        canvas.addEventListener('mouseup', this.mouseUpHandler);
    }

    /**
     * 檢查物品點擊
     */
    checkItemClick(mouseX, mouseY) {
        // 從後往前檢查（後渲染的在上層）
        for (let i = this.draggableItems.length - 1; i >= 0; i--) {
            const item = this.draggableItems[i];
            
            if (mouseX >= item.x && mouseX <= item.x + item.width &&
                mouseY >= item.y && mouseY <= item.y + item.height) {
                
                this.startDrag(item, mouseX, mouseY);
                break;
            }
        }
    }

    /**
     * 開始拖拽
     */
    startDrag(item, mouseX, mouseY) {
        this.dragState.isDragging = true;
        this.dragState.draggedItem = item;
        this.dragState.dragOffsetX = mouseX - item.x;
        this.dragState.dragOffsetY = mouseY - item.y;
        this.dragState.originalX = item.x;
        this.dragState.originalY = item.y;
        
        // 播放拾取音效
        if (this.gameEngine.gameState.settings.soundEnabled) {
            this.gameEngine.audioManager.playSound(this.sounds.pickupSound);
        }
    }

    /**
     * 更新拖拽
     */
    updateDrag(mouseX, mouseY) {
        if (!this.dragState.isDragging || !this.dragState.draggedItem) return;
        
        const item = this.dragState.draggedItem;
        item.x = mouseX - this.dragState.dragOffsetX;
        item.y = mouseY - this.dragState.dragOffsetY;
    }

    /**
     * 更新高亮區域
     */
    updateHighlight(mouseX, mouseY) {
        this.visualFeedback.highlightedArea = null;
        
        // 檢查主盤
        const mainPlate = this.platingAreas.mainPlate;
        const distToMain = Math.sqrt(
            Math.pow(mouseX - mainPlate.x, 2) + 
            Math.pow(mouseY - mainPlate.y, 2)
        );
        
        if (distToMain <= mainPlate.radius) {
            this.visualFeedback.highlightedArea = mainPlate;
            return;
        }
        
        // 檢查副盤
        for (let sidePlate of this.platingAreas.sidePlates) {
            const distToSide = Math.sqrt(
                Math.pow(mouseX - sidePlate.x, 2) + 
                Math.pow(mouseY - sidePlate.y, 2)
            );
            
            if (distToSide <= sidePlate.radius) {
                this.visualFeedback.highlightedArea = sidePlate;
                return;
            }
        }
    }

    /**
     * 完成拖拽
     */
    completeDrag() {
        if (!this.dragState.isDragging || !this.dragState.draggedItem) return;
        
        const item = this.dragState.draggedItem;
        const placed = this.tryPlaceItem(item);
        
        if (placed) {
            // 成功放置
            item.placed = true;
            
            // 播放放置音效
            if (this.gameEngine.gameState.settings.soundEnabled) {
                this.gameEngine.audioManager.playSound(this.sounds.placeSound);
            }
            
            // 更新評分
            this.updateScoring();
            
            // 檢查任務完成
            this.checkTaskCompletion();
        } else {
            // 放置失敗，回到原位
            item.x = this.dragState.originalX;
            item.y = this.dragState.originalY;
        }
        
        // 重置拖拽狀態
        this.dragState.isDragging = false;
        this.dragState.draggedItem = null;
    }

    /**
     * 嘗試放置物品
     */
    tryPlaceItem(item) {
        // 檢查主盤
        const mainPlate = this.platingAreas.mainPlate;
        const distToMain = Math.sqrt(
            Math.pow(item.x + item.width/2 - mainPlate.x, 2) + 
            Math.pow(item.y + item.height/2 - mainPlate.y, 2)
        );
        
        if (distToMain <= mainPlate.radius && (item.type === 'skin' || item.type === 'meat')) {
            mainPlate.items.push({
                item: item,
                relativeX: item.x + item.width/2 - mainPlate.x,
                relativeY: item.y + item.height/2 - mainPlate.y,
                angle: Math.atan2(item.y + item.height/2 - mainPlate.y, item.x + item.width/2 - mainPlate.x)
            });
            return true;
        }
        
        // 檢查副盤
        for (let sidePlate of this.platingAreas.sidePlates) {
            const distToSide = Math.sqrt(
                Math.pow(item.x + item.width/2 - sidePlate.x, 2) + 
                Math.pow(item.y + item.height/2 - sidePlate.y, 2)
            );
            
            if (distToSide <= sidePlate.radius && this.isItemCompatible(item, sidePlate)) {
                sidePlate.items.push({
                    item: item,
                    relativeX: item.x + item.width/2 - sidePlate.x,
                    relativeY: item.y + item.height/2 - sidePlate.y
                });
                return true;
            }
        }
        
        return false;
    }

    /**
     * 檢查物品是否與盤子兼容
     */
    isItemCompatible(item, plate) {
        switch (plate.type) {
            case 'pancakes':
                return item.type === 'pancake';
            case 'vegetables':
                return item.type === 'scallion' || item.type === 'cucumber';
            case 'sauce':
                return item.type === 'sauce';
            default:
                return false;
        }
    }

    /**
     * 更新評分
     */
    updateScoring() {
        this.gameState.symmetry = this.calculateSymmetry();
        this.gameState.colorBalance = this.calculateColorBalance();
        this.gameState.creativity = this.calculateCreativity();
        
        const completeness = this.calculateCompleteness();
        
        // 計算總分
        const scoring = this.scoringSystem;
        this.gameState.score = Math.round(
            (this.gameState.symmetry * scoring.symmetryWeight +
             this.gameState.colorBalance * scoring.colorBalanceWeight +
             this.gameState.creativity * scoring.creativityWeight +
             completeness * scoring.completenessWeight) * 
            scoring.bonusMultiplier
        );
    }

    /**
     * 計算對稱度
     */
    calculateSymmetry() {
        const mainPlate = this.platingAreas.mainPlate;
        const items = mainPlate.items;
        
        if (items.length < 4) return 0;
        
        // 根據選擇的模板計算對稱度
        switch (this.selectedTemplate.skinPattern) {
            case 'fan':
                return this.calculateFanSymmetry(items);
            case 'circle':
                return this.calculateCircleSymmetry(items);
            case 'geometric':
                return this.calculateGeometricSymmetry(items);
            default:
                return this.calculateGeneralSymmetry(items);
        }
    }

    /**
     * 計算扇形對稱度
     */
    calculateFanSymmetry(items) {
        const skinItems = items.filter(i => i.item.type === 'skin');
        if (skinItems.length < 6) return 0;
        
        // 檢查是否按扇形排列
        let symmetryScore = 0;
        const expectedAngleStep = Math.PI / 6; // 30度間隔
        
        skinItems.forEach((item, index) => {
            const expectedAngle = index * expectedAngleStep - Math.PI/2;
            const actualAngle = item.angle;
            const angleDiff = Math.abs(actualAngle - expectedAngle);
            
            symmetryScore += Math.max(0, 100 - angleDiff * 180 / Math.PI * 5);
        });
        
        return Math.round(symmetryScore / skinItems.length);
    }

    /**
     * 計算圓形對稱度
     */
    calculateCircleSymmetry(items) {
        const meatItems = items.filter(i => i.item.type === 'meat');
        if (meatItems.length < 8) return 0;
        
        // 檢查是否均勻分布在圓周上
        let symmetryScore = 0;
        const expectedAngleStep = (2 * Math.PI) / meatItems.length;
        
        meatItems.forEach((item, index) => {
            const expectedAngle = index * expectedAngleStep;
            const actualAngle = item.angle + Math.PI; // 調整角度範圍
            const angleDiff = Math.abs(actualAngle - expectedAngle);
            
            symmetryScore += Math.max(0, 100 - angleDiff * 180 / Math.PI * 3);
        });
        
        return Math.round(symmetryScore / meatItems.length);
    }

    /**
     * 計算幾何對稱度
     */
    calculateGeometricSymmetry(items) {
        // 檢查是否形成幾何圖形
        let symmetryScore = 70; // 基礎分
        
        // 檢查軸對稱
        const centerX = 0, centerY = 0;
        let axisSymmetryScore = 0;
        
        items.forEach(item => {
            // 尋找對稱點
            const mirrorX = -item.relativeX;
            const mirrorY = -item.relativeY;
            
            const hasMirror = items.some(other => 
                Math.abs(other.relativeX - mirrorX) < 10 &&
                Math.abs(other.relativeY - mirrorY) < 10 &&
                other.item.type === item.item.type
            );
            
            if (hasMirror) axisSymmetryScore += 10;
        });
        
        return Math.min(100, symmetryScore + axisSymmetryScore);
    }

    /**
     * 計算一般對稱度
     */
    calculateGeneralSymmetry(items) {
        if (items.length < 2) return 0;
        
        // 計算重心
        let centerX = 0, centerY = 0;
        items.forEach(item => {
            centerX += item.relativeX;
            centerY += item.relativeY;
        });
        centerX /= items.length;
        centerY /= items.length;
        
        // 計算分布均勻度
        let uniformityScore = 0;
        const avgDistance = items.reduce((sum, item) => {
            return sum + Math.sqrt(
                Math.pow(item.relativeX - centerX, 2) + 
                Math.pow(item.relativeY - centerY, 2)
            );
        }, 0) / items.length;
        
        items.forEach(item => {
            const distance = Math.sqrt(
                Math.pow(item.relativeX - centerX, 2) + 
                Math.pow(item.relativeY - centerY, 2)
            );
            const deviation = Math.abs(distance - avgDistance);
            uniformityScore += Math.max(0, 100 - deviation * 2);
        });
        
        return Math.round(uniformityScore / items.length);
    }

    /**
     * 計算色彩平衡
     */
    calculateColorBalance() {
        const mainPlate = this.platingAreas.mainPlate;
        const skinItems = mainPlate.items.filter(i => i.item.type === 'skin');
        const meatItems = mainPlate.items.filter(i => i.item.type === 'meat');
        
        // 理想比例是皮肉 1:1.5
        const idealRatio = 1.5;
        const actualRatio = meatItems.length > 0 ? skinItems.length / meatItems.length : 0;
        
        const ratioScore = Math.max(0, 100 - Math.abs(actualRatio - idealRatio) * 50);
        
        // 檢查分布均勻度
        let distributionScore = 0;
        if (skinItems.length > 0 && meatItems.length > 0) {
            // 計算皮肉交替程度
            const totalItems = [...skinItems, ...meatItems].sort((a, b) => a.angle - b.angle);
            let alternationScore = 0;
            
            for (let i = 0; i < totalItems.length - 1; i++) {
                if (totalItems[i].item.type !== totalItems[i + 1].item.type) {
                    alternationScore += 10;
                }
            }
            
            distributionScore = Math.min(100, alternationScore);
        }
        
        return Math.round((ratioScore + distributionScore) / 2);
    }

    /**
     * 計算創意度
     */
    calculateCreativity() {
        let creativityScore = 50; // 基礎分
        
        // 模板獎勵
        creativityScore += this.selectedTemplate.bonus * 0.2;
        
        // 完成度獎勵
        const completeness = this.calculateCompleteness();
        creativityScore += completeness * 0.3;
        
        // 配菜搭配獎勵
        const accompanimentScore = this.calculateAccompanimentScore();
        creativityScore += accompanimentScore * 0.2;
        
        return Math.min(100, Math.round(creativityScore));
    }

    /**
     * 計算完成度
     */
    calculateCompleteness() {
        const mainPlate = this.platingAreas.mainPlate;
        const skinCount = mainPlate.items.filter(i => i.item.type === 'skin').length;
        const meatCount = mainPlate.items.filter(i => i.item.type === 'meat').length;
        
        const expectedSkin = Math.min(24, this.slicingSystem.slices.skin.count || 0);
        const expectedMeat = Math.min(36, this.slicingSystem.slices.meat.count || 0);
        
        const skinCompleteness = expectedSkin > 0 ? (skinCount / expectedSkin) * 100 : 0;
        const meatCompleteness = expectedMeat > 0 ? (meatCount / expectedMeat) * 100 : 0;
        
        return Math.round((skinCompleteness + meatCompleteness) / 2);
    }

    /**
     * 計算配菜評分
     */
    calculateAccompanimentScore() {
        let score = 0;
        
        this.platingAreas.sidePlates.forEach(plate => {
            const itemCount = plate.items.length;
            let expectedCount = 0;
            
            switch (plate.type) {
                case 'pancakes':
                    expectedCount = 12;
                    break;
                case 'vegetables':
                    expectedCount = 16; // 8蔥絲 + 8黃瓜條
                    break;
                case 'sauce':
                    expectedCount = 1;
                    break;
            }
            
            if (expectedCount > 0) {
                score += Math.min(100, (itemCount / expectedCount) * 100);
            }
        });
        
        return Math.round(score / this.platingAreas.sidePlates.length);
    }

    /**
     * 檢查任務完成
     */
    checkTaskCompletion() {
        switch (this.gameState.currentTask) {
            case 'skin_arrangement':
                const skinCount = this.platingAreas.mainPlate.items.filter(i => i.item.type === 'skin').length;
                if (skinCount >= 12) {
                    this.gameState.currentTask = 'meat_arrangement';
                    this.showTaskFeedback('皮片擺盤完成！開始擺放肉片');
                }
                break;
                
            case 'meat_arrangement':
                const meatCount = this.platingAreas.mainPlate.items.filter(i => i.item.type === 'meat').length;
                if (meatCount >= 18) {
                    this.gameState.currentTask = 'accompaniment_prep';
                    this.showTaskFeedback('肉片擺盤完成！準備配菜');
                }
                break;
                
            case 'accompaniment_prep':
                const accompanimentComplete = this.checkAccompanimentCompletion();
                if (accompanimentComplete) {
                    this.completeGame(true);
                }
                break;
        }
    }

    /**
     * 檢查配菜完成度
     */
    checkAccompanimentCompletion() {
        const pancakeCount = this.platingAreas.sidePlates[0].items.length;
        const vegetableCount = this.platingAreas.sidePlates[1].items.length;
        const sauceCount = this.platingAreas.sidePlates[2].items.length;
        
        return pancakeCount >= 8 && vegetableCount >= 8 && sauceCount >= 1;
    }

    /**
     * 顯示任務反饋
     */
    showTaskFeedback(message) {
        this.visualFeedback.currentFeedback = {
            text: message,
            color: '#32CD32',
            x: this.gameAreaX + this.gameAreaWidth / 2,
            y: this.gameAreaY + this.gameAreaHeight / 2
        };
        this.visualFeedback.feedbackTimer = 3.0;
        
        // 播放成功音效
        if (this.gameEngine.gameState.settings.soundEnabled) {
            this.gameEngine.audioManager.playSound(this.sounds.successSound);
        }
    }

    /**
     * 完成遊戲
     */
    completeGame(success) {
        this.gameState.phase = 'complete';
        
        // 最終評分更新
        this.updateScoring();
        
        // 計算最終統計
        const stats = {
            success: success,
            score: this.gameState.score,
            style: this.selectedTemplate.name.toLowerCase(),
            symmetry: this.gameState.symmetry,
            colorBalance: this.gameState.colorBalance,
            creativity: this.gameState.creativity,
            overallScore: Math.round((this.gameState.symmetry + this.gameState.colorBalance + this.gameState.creativity) / 3),
            pancakeCount: this.platingAreas.sidePlates[0].items.length,
            vegetableCount: this.platingAreas.sidePlates[1].items.length,
            sauceCount: this.platingAreas.sidePlates[2].items.length
        };
        
        // 更新傳統吃法數據
        this.traditionalServing.pancakes.count = stats.pancakeCount;
        this.traditionalServing.pancakes.prepared = stats.pancakeCount > 0;
        this.traditionalServing.scallions.prepared = stats.vegetableCount > 0;
        this.traditionalServing.cucumber.prepared = stats.vegetableCount > 0;
        this.traditionalServing.sauce.prepared = stats.sauceCount > 0;
        
        console.log('擺盤藝術遊戲完成:', stats);
        
        // 播放完成音效
        if (this.gameEngine.gameState.settings.soundEnabled) {
            this.gameEngine.audioManager.playSound(this.sounds.completeSound);
        }
        
        // 清理輸入處理器
        this.cleanup();
        
        // 通知場景遊戲完成
        setTimeout(() => {
            this.scene.onMiniGameComplete(success, stats);
        }, 1000);
    }

    /**
     * 獲取任務文字
     */
    getTaskText() {
        const taskNames = {
            'skin_arrangement': '擺放鴨皮片',
            'meat_arrangement': '擺放鴨肉片',
            'accompaniment_prep': '準備傳統配菜'
        };
        return `當前任務: ${taskNames[this.gameState.currentTask] || '未知任務'}`;
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
     * 獲取評分文字
     */
    getScoreText() {
        return `評分 - 對稱:${this.gameState.symmetry}% 色彩:${this.gameState.colorBalance}% 創意:${this.gameState.creativity}%`;
    }

    /**
     * 更新遊戲邏輯
     */
    update(deltaTime) {
        super.update(deltaTime);
        
        // 更新時間
        if (this.gameState.phase === 'plating') {
            this.gameState.timeRemaining = Math.max(0, this.gameState.timeRemaining - deltaTime);
        }
        
        // 更新視覺反饋計時器
        if (this.visualFeedback.feedbackTimer > 0) {
            this.visualFeedback.feedbackTimer -= deltaTime;
        }
        
        // 更新UI顯示
        this.updateUIDisplays();
        
        // 檢查時間限制
        if (this.gameState.timeRemaining <= 0 && this.gameState.phase !== 'complete') {
            this.completeGame(false);
        }
    }

    /**
     * 更新UI顯示
     */
    updateUIDisplays() {
        if (this.taskLabel) {
            this.taskLabel.setText(this.getTaskText());
        }
        
        if (this.timeLabel) {
            this.timeLabel.setText(this.getTimeText());
        }
        
        if (this.scoreLabel) {
            this.scoreLabel.setText(this.getScoreText());
        }
    }

    /**
     * 渲染遊戲
     */
    render(context) {
        super.render(context);
        
        // 渲染遊戲區域背景
        this.renderGameArea(context);
        
        // 渲染擺盤區域
        this.renderPlatingAreas(context);
        
        // 渲染可拖拽物品
        this.renderDraggableItems(context);
        
        // 渲染模板指導
        this.renderTemplateGuide(context);
        
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
        
        // 渲染網格（如果啟用）
        if (this.visualFeedback.showGrid) {
            this.renderGrid(context);
        }
    }

    /**
     * 渲染網格
     */
    renderGrid(context) {
        context.strokeStyle = 'rgba(200, 200, 200, 0.3)';
        context.lineWidth = 1;
        
        const gridSize = 20;
        
        // 垂直線
        for (let x = this.gameAreaX; x <= this.gameAreaX + this.gameAreaWidth; x += gridSize) {
            context.beginPath();
            context.moveTo(x, this.gameAreaY);
            context.lineTo(x, this.gameAreaY + this.gameAreaHeight);
            context.stroke();
        }
        
        // 水平線
        for (let y = this.gameAreaY; y <= this.gameAreaY + this.gameAreaHeight; y += gridSize) {
            context.beginPath();
            context.moveTo(this.gameAreaX, y);
            context.lineTo(this.gameAreaX + this.gameAreaWidth, y);
            context.stroke();
        }
    }

    /**
     * 渲染擺盤區域
     */
    renderPlatingAreas(context) {
        // 渲染主盤
        const mainPlate = this.platingAreas.mainPlate;
        
        // 盤子背景
        context.fillStyle = this.visualFeedback.highlightedArea === mainPlate ? 
                           'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.7)';
        context.beginPath();
        context.arc(mainPlate.x, mainPlate.y, mainPlate.radius, 0, 2 * Math.PI);
        context.fill();
        
        // 盤子邊框
        context.strokeStyle = '#D3D3D3';
        context.lineWidth = 2;
        context.stroke();
        
        // 渲染副盤
        this.platingAreas.sidePlates.forEach(plate => {
            context.fillStyle = this.visualFeedback.highlightedArea === plate ? 
                               'rgba(245, 245, 245, 0.9)' : 'rgba(245, 245, 245, 0.7)';
            context.beginPath();
            context.arc(plate.x, plate.y, plate.radius, 0, 2 * Math.PI);
            context.fill();
            
            context.strokeStyle = '#C0C0C0';
            context.lineWidth = 1;
            context.stroke();
            
            // 標籤
            context.fillStyle = '#666666';
            context.font = '10px Arial';
            context.textAlign = 'center';
            const labels = { pancakes: '荷葉餅', vegetables: '蔥絲黃瓜', sauce: '甜麵醬' };
            context.fillText(labels[plate.type] || '', plate.x, plate.y + plate.radius + 15);
        });
    }

    /**
     * 渲染可拖拽物品
     */
    renderDraggableItems(context) {
        this.draggableItems.forEach(item => {
            if (item.placed) return; // 已放置的物品不在這裡渲染
            
            // 物品背景
            context.fillStyle = item.color;
            context.fillRect(item.x, item.y, item.width, item.height);
            
            // 物品邊框
            context.strokeStyle = item === this.dragState.draggedItem ? '#FF4500' : '#8B4513';
            context.lineWidth = item === this.dragState.draggedItem ? 2 : 1;
            context.strokeRect(item.x, item.y, item.width, item.height);
            
            // 品質指示
            if (item.quality) {
                const qualityColor = item.quality >= 90 ? '#32CD32' : 
                                   item.quality >= 75 ? '#FFD700' : '#FFA500';
                context.fillStyle = qualityColor;
                context.fillRect(item.x, item.y, item.width * (item.quality / 100), 2);
            }
        });
        
        // 渲染已放置的物品
        this.renderPlacedItems(context);
    }

    /**
     * 渲染已放置的物品
     */
    renderPlacedItems(context) {
        // 渲染主盤上的物品
        const mainPlate = this.platingAreas.mainPlate;
        mainPlate.items.forEach(placedItem => {
            const item = placedItem.item;
            const x = mainPlate.x + placedItem.relativeX - item.width/2;
            const y = mainPlate.y + placedItem.relativeY - item.height/2;
            
            context.fillStyle = item.color;
            context.fillRect(x, y, item.width, item.height);
            
            context.strokeStyle = '#654321';
            context.lineWidth = 1;
            context.strokeRect(x, y, item.width, item.height);
        });
        
        // 渲染副盤上的物品
        this.platingAreas.sidePlates.forEach(plate => {
            plate.items.forEach(placedItem => {
                const item = placedItem.item;
                const x = plate.x + placedItem.relativeX - item.width/2;
                const y = plate.y + placedItem.relativeY - item.height/2;
                
                context.fillStyle = item.color;
                context.fillRect(x, y, item.width, item.height);
                
                context.strokeStyle = '#654321';
                context.lineWidth = 1;
                context.strokeRect(x, y, item.width, item.height);
            });
        });
    }

    /**
     * 渲染模板指導
     */
    renderTemplateGuide(context) {
        if (!this.visualFeedback.showTemplateGuide) return;
        
        const mainPlate = this.platingAreas.mainPlate;
        
        // 根據選擇的模板顯示指導線
        context.strokeStyle = 'rgba(255, 215, 0, 0.5)';
        context.lineWidth = 1;
        context.setLineDash([5, 5]);
        
        switch (this.selectedTemplate.skinPattern) {
            case 'fan':
                // 扇形指導線
                for (let i = 0; i < 12; i++) {
                    const angle = (i * Math.PI / 6) - Math.PI/2;
                    const endX = mainPlate.x + Math.cos(angle) * (mainPlate.radius - 10);
                    const endY = mainPlate.y + Math.sin(angle) * (mainPlate.radius - 10);
                    
                    context.beginPath();
                    context.moveTo(mainPlate.x, mainPlate.y);
                    context.lineTo(endX, endY);
                    context.stroke();
                }
                break;
                
            case 'circle':
                // 圓形指導線
                context.beginPath();
                context.arc(mainPlate.x, mainPlate.y, mainPlate.radius - 15, 0, 2 * Math.PI);
                context.stroke();
                break;
                
            case 'geometric':
                // 幾何圖形指導線
                const size = mainPlate.radius - 20;
                context.strokeRect(
                    mainPlate.x - size/2, 
                    mainPlate.y - size/2, 
                    size, 
                    size
                );
                break;
        }
        
        context.setLineDash([]);
    }

    /**
     * 渲染視覺反饋
     */
    renderVisualFeedback(context) {
        // 渲染對稱線
        if (this.visualFeedback.showSymmetryLines) {
            const mainPlate = this.platingAreas.mainPlate;
            
            context.strokeStyle = 'rgba(0, 255, 0, 0.3)';
            context.lineWidth = 1;
            context.setLineDash([3, 3]);
            
            // 垂直對稱線
            context.beginPath();
            context.moveTo(mainPlate.x, mainPlate.y - mainPlate.radius);
            context.lineTo(mainPlate.x, mainPlate.y + mainPlate.radius);
            context.stroke();
            
            // 水平對稱線
            context.beginPath();
            context.moveTo(mainPlate.x - mainPlate.radius, mainPlate.y);
            context.lineTo(mainPlate.x + mainPlate.radius, mainPlate.y);
            context.stroke();
            
            context.setLineDash([]);
        }
        
        // 渲染反饋消息
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