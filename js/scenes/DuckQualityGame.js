/**
 * 鴨子品質檢查迷你遊戲
 * 玩家需要點擊檢查鴨子的各個部位來評估品質
 */
class DuckQualityGame extends MiniGame {
    constructor(config = {}) {
        super({
            name: '鴨子品質檢查',
            timeLimit: 60000, // 60秒時間限制
            successThreshold: 1.0, // 需要檢查所有部位
            ...config
        });
        
        // 檢查點配置
        this.checkPoints = [
            {
                id: 'head',
                name: '頭部檢查',
                x: 230,
                y: 120,
                radius: 30,
                checked: false,
                quality: 'good',
                description: '頭部小巧，眼睛明亮有神',
                feedback: '✓ 頭部品質優良'
            },
            {
                id: 'chest',
                name: '胸部檢查',
                x: 290,
                y: 150,
                radius: 35,
                checked: false,
                quality: 'excellent',
                description: '胸部豐滿，肌肉結實',
                feedback: '✓ 胸部品質極佳'
            },
            {
                id: 'abdomen',
                name: '腹部檢查',
                x: 360,
                y: 170,
                radius: 40,
                checked: false,
                quality: 'good',
                description: '腹部適中，脂肪分佈均勻',
                feedback: '✓ 腹部品質良好'
            },
            {
                id: 'skin',
                name: '皮膚檢查',
                x: 320,
                y: 140,
                radius: 55,
                checked: false,
                quality: 'excellent',
                description: '皮膚淡黃色，光滑有彈性',
                feedback: '✓ 皮膚品質極佳'
            },
            {
                id: 'weight',
                name: '重量評估',
                x: 300,
                y: 180,
                radius: 32,
                checked: false,
                quality: 'good',
                description: '重量適中，約3公斤',
                feedback: '✓ 重量符合標準'
            }
        ];
        
        // 遊戲狀態
        this.currentCheckPoint = null;
        this.checkedCount = 0;
        this.totalPoints = this.checkPoints.length;
        
        // 視覺效果
        this.pulseAnimation = 0;
        this.feedbackMessages = [];
        
        // 鴨子圖片
        this.duckImage = null;
    }

    /**
     * 設置遊戲
     */
    setupGame() {
        // 重置檢查點狀態
        this.checkPoints.forEach(point => {
            point.checked = false;
        });
        
        this.checkedCount = 0;
        this.currentCheckPoint = null;
        this.feedbackMessages = [];
        
        // 載入鴨子圖片
        if (this.gameEngine && this.gameEngine.assetManager) {
            this.duckImage = this.gameEngine.assetManager.getAsset('raw_duck');
        }
    }

    /**
     * 獲取遊戲說明
     */
    getInstructions() {
        return `點擊鴨子的各個部位進行品質檢查 (${this.checkedCount}/${this.totalPoints})`;
    }

    /**
     * 更新遊戲邏輯
     */
    updateGame(deltaTime) {
        // 更新脈衝動畫
        this.pulseAnimation += deltaTime * 0.005;
        
        // 更新反饋消息
        this.feedbackMessages = this.feedbackMessages.filter(msg => {
            msg.life -= deltaTime;
            msg.y -= deltaTime * 0.02; // 向上飄動
            msg.alpha = Math.max(0, msg.life / msg.maxLife);
            return msg.life > 0;
        });
        
        // 更新進度
        this.updateProgress(this.checkedCount / this.totalPoints);
        
        // 更新說明文字
        if (this.instructions) {
            this.instructions.setText(this.getInstructions());
        }
    }

    /**
     * 渲染遊戲內容
     */
    renderGame(context) {
        const area = this.gameArea;
        
        // 渲染鴨子圖片
        if (this.duckImage) {
            const duckX = area.x + 200;
            const duckY = area.y + 50;
            const duckWidth = 200;
            const duckHeight = 150;
            
            context.drawImage(this.duckImage, duckX, duckY, duckWidth, duckHeight);
        } else {
            // 如果圖片未載入，繪製佔位符
            context.fillStyle = '#F0F0F0';
            context.fillRect(area.x + 200, area.y + 50, 200, 150);
            
            context.fillStyle = '#666666';
            context.font = '16px Microsoft JhengHei';
            context.textAlign = 'center';
            context.fillText('北京填鴨', area.x + 300, area.y + 125);
        }
        
        // 渲染檢查點
        this.renderCheckPoints(context);
        
        // 渲染反饋消息
        this.renderFeedbackMessages(context);
        
        // 渲染檢查清單
        this.renderCheckList(context);
    }

    /**
     * 渲染檢查點
     */
    renderCheckPoints(context) {
        this.checkPoints.forEach(point => {
            const x = this.gameArea.x + point.x - 200;
            const y = this.gameArea.y + point.y - 50;
            
            if (point.checked) {
                // 已檢查的點 - 綠色勾選
                context.fillStyle = 'rgba(50, 205, 50, 0.8)';
                context.beginPath();
                context.arc(x, y, point.radius, 0, Math.PI * 2);
                context.fill();
                
                // 繪製勾選標記
                context.strokeStyle = '#FFFFFF';
                context.lineWidth = 3;
                context.beginPath();
                context.moveTo(x - 8, y);
                context.lineTo(x - 2, y + 6);
                context.lineTo(x + 8, y - 6);
                context.stroke();
            } else {
                // 未檢查的點 - 脈衝動畫
                const pulseScale = 1 + Math.sin(this.pulseAnimation) * 0.1;
                const alpha = 0.6 + Math.sin(this.pulseAnimation) * 0.2;
                
                context.fillStyle = `rgba(255, 215, 0, ${alpha})`;
                context.beginPath();
                context.arc(x, y, point.radius * pulseScale, 0, Math.PI * 2);
                context.fill();
                
                // 繪製邊框
                context.strokeStyle = '#FF8C00';
                context.lineWidth = 2;
                context.stroke();
                
                // 繪製問號
                context.fillStyle = '#8B4513';
                context.font = 'bold 16px Microsoft JhengHei';
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.fillText('?', x, y);
            }
        });
    }

    /**
     * 渲染反饋消息
     */
    renderFeedbackMessages(context) {
        this.feedbackMessages.forEach(msg => {
            context.save();
            context.globalAlpha = msg.alpha;
            
            context.fillStyle = msg.color;
            context.font = `${msg.fontSize}px Microsoft JhengHei`;
            context.textAlign = 'center';
            context.fillText(msg.text, msg.x, msg.y);
            
            context.restore();
        });
    }

    /**
     * 渲染檢查清單
     */
    renderCheckList(context) {
        const listX = this.gameArea.x + 450;
        const listY = this.gameArea.y + 50;
        
        // 繪製清單背景
        context.fillStyle = 'rgba(255, 255, 255, 0.9)';
        context.fillRect(listX, listY, 140, 200);
        
        context.strokeStyle = '#8B4513';
        context.lineWidth = 1;
        context.strokeRect(listX, listY, 140, 200);
        
        // 繪製標題
        context.fillStyle = '#8B4513';
        context.font = 'bold 14px Microsoft JhengHei';
        context.textAlign = 'center';
        context.fillText('檢查清單', listX + 70, listY + 20);
        
        // 繪製檢查項目
        context.font = '12px Microsoft JhengHei';
        context.textAlign = 'left';
        
        this.checkPoints.forEach((point, index) => {
            const itemY = listY + 40 + (index * 25);
            
            // 繪製勾選框
            const checkboxX = listX + 10;
            const checkboxY = itemY - 8;
            
            context.strokeStyle = '#8B4513';
            context.lineWidth = 1;
            context.strokeRect(checkboxX, checkboxY, 12, 12);
            
            if (point.checked) {
                context.fillStyle = '#32CD32';
                context.fillRect(checkboxX + 1, checkboxY + 1, 10, 10);
                
                // 繪製勾選標記
                context.strokeStyle = '#FFFFFF';
                context.lineWidth = 2;
                context.beginPath();
                context.moveTo(checkboxX + 3, checkboxY + 6);
                context.lineTo(checkboxX + 6, checkboxY + 9);
                context.lineTo(checkboxX + 10, checkboxY + 4);
                context.stroke();
            }
            
            // 繪製項目名稱
            context.fillStyle = point.checked ? '#32CD32' : '#654321';
            context.fillText(point.name, checkboxX + 18, itemY);
        });
    }

    /**
     * 處理遊戲特定輸入
     */
    handleGameInput(event) {
        if (event.type !== 'click') return false;
        
        // 檢查是否點擊了檢查點
        for (let point of this.checkPoints) {
            if (point.checked) continue; // 跳過已檢查的點
            
            const pointX = this.gameArea.x + point.x - 200;
            const pointY = this.gameArea.y + point.y - 50;
            const distance = Math.sqrt(
                Math.pow(event.x - pointX, 2) + Math.pow(event.y - pointY, 2)
            );
            
            if (distance <= point.radius) {
                this.checkPoint(point, event.x, event.y);
                return true;
            }
        }
        
        return false;
    }

    /**
     * 檢查指定點
     */
    checkPoint(point, clickX, clickY) {
        if (point.checked) return;
        
        point.checked = true;
        this.checkedCount++;
        this.currentCheckPoint = point;
        
        // 創建反饋消息
        this.createFeedbackMessage(point.feedback, clickX, clickY, this.getQualityColor(point.quality));
        
        // 播放音效
        if (this.gameEngine && this.gameEngine.gameState.settings.soundEnabled) {
            this.gameEngine.audioManager.playSound('check_success');
        }
        
        // 增加分數
        if (this.gameEngine) {
            const points = this.getQualityPoints(point.quality);
            this.gameEngine.addScore(points, clickX, clickY, 'quality_check');
        }
        
        console.log(`檢查完成: ${point.name} - ${point.quality}`);
    }

    /**
     * 創建反饋消息
     */
    createFeedbackMessage(text, x, y, color = '#32CD32') {
        this.feedbackMessages.push({
            text: text,
            x: x,
            y: y,
            color: color,
            fontSize: 14,
            life: 2000,
            maxLife: 2000,
            alpha: 1
        });
    }

    /**
     * 獲取品質顏色
     */
    getQualityColor(quality) {
        switch (quality) {
            case 'excellent':
                return '#32CD32'; // 綠色
            case 'good':
                return '#FFD700'; // 金色
            case 'fair':
                return '#FFA500'; // 橙色
            case 'poor':
                return '#FF6B6B'; // 紅色
            default:
                return '#87CEEB'; // 淺藍色
        }
    }

    /**
     * 獲取品質分數
     */
    getQualityPoints(quality) {
        switch (quality) {
            case 'excellent':
                return 20;
            case 'good':
                return 15;
            case 'fair':
                return 10;
            case 'poor':
                return 5;
            default:
                return 10;
        }
    }

    /**
     * 檢查完成條件
     */
    checkCompletion() {
        if (this.checkedCount >= this.totalPoints) {
            // 計算總體品質評分
            const excellentCount = this.checkPoints.filter(p => p.quality === 'excellent').length;
            const goodCount = this.checkPoints.filter(p => p.quality === 'good').length;
            
            let overallQuality = 'good';
            if (excellentCount >= 3) {
                overallQuality = 'excellent';
            } else if (excellentCount + goodCount >= 4) {
                overallQuality = 'good';
            } else {
                overallQuality = 'fair';
            }
            
            // 創建完成消息
            this.createFeedbackMessage(
                `品質檢查完成！總體評價: ${this.getQualityText(overallQuality)}`,
                this.gameArea.x + this.gameArea.width / 2,
                this.gameArea.y + this.gameArea.height / 2,
                this.getQualityColor(overallQuality)
            );
            
            this.complete(true);
        }
    }

    /**
     * 獲取品質文字
     */
    getQualityText(quality) {
        switch (quality) {
            case 'excellent':
                return '極佳';
            case 'good':
                return '良好';
            case 'fair':
                return '一般';
            case 'poor':
                return '較差';
            default:
                return '未知';
        }
    }

    /**
     * 計算準確度獎勵
     */
    calculateAccuracyBonus() {
        // 基於檢查的品質計算獎勵
        const excellentCount = this.checkPoints.filter(p => p.checked && p.quality === 'excellent').length;
        const goodCount = this.checkPoints.filter(p => p.checked && p.quality === 'good').length;
        
        return excellentCount * 10 + goodCount * 5;
    }
}
// 匯出到全域作用域
window.DuckQualityGame = DuckQualityGame;
