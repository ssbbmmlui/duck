/**
 * 視覺反饋系統
 * 負責分數顯示、獎勵動畫和場景切換效果
 */
class VisualFeedbackManager {
    constructor() {
        this.feedbackElements = [];
        this.transitionEffects = [];
        this.scoreAnimations = [];
        this.rewardEffects = [];
        this.lowPerformanceMode = false;
        
        // 配置
        this.config = {
            scorePopDuration: 1000,
            rewardDuration: 2000,
            transitionDuration: 1500,
            starAnimationDuration: 800
        };
        
        // 低效能模式配置
        this.lowPerformanceConfig = {
            scorePopDuration: 500,
            rewardDuration: 1000,
            transitionDuration: 750,
            starAnimationDuration: 400
        };
    }

    /**
     * 創建分數彈出效果
     */
    createScorePopup(x, y, points, type = 'normal') {
        const scorePopup = new ScorePopup({
            x: x,
            y: y,
            points: points,
            type: type,
            duration: this.config.scorePopDuration
        });
        
        this.scoreAnimations.push(scorePopup);
        return scorePopup;
    }

    /**
     * 創建星星獎勵效果
     */
    createStarReward(x, y, count = 3) {
        for (let i = 0; i < count; i++) {
            const star = new StarReward({
                x: x + (Math.random() - 0.5) * 100,
                y: y + (Math.random() - 0.5) * 50,
                delay: i * 200,
                duration: this.config.starAnimationDuration
            });
            
            this.rewardEffects.push(star);
        }
    }

    /**
     * 創建完成步驟的慶祝效果
     */
    createCompletionCelebration(centerX, centerY) {
        // 創建彩帶效果
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const confetti = new ConfettiEffect({
                x: centerX,
                y: centerY,
                angle: angle,
                speed: 150 + Math.random() * 100,
                duration: 2000
            });
            
            this.rewardEffects.push(confetti);
        }
        
        // 創建文字提示
        const completionText = new CompletionText({
            x: centerX,
            y: centerY - 50,
            text: '步驟完成！',
            duration: 1500
        });
        
        this.feedbackElements.push(completionText);
    }

    /**
     * 創建場景切換效果
     */
    createSceneTransition(type = 'fade', duration = null) {
        const transitionDuration = duration || this.config.transitionDuration;
        
        let transition;
        switch (type) {
            case 'slide':
                transition = new SlideTransition({ duration: transitionDuration });
                break;
            case 'wipe':
                transition = new WipeTransition({ duration: transitionDuration });
                break;
            case 'fade':
            default:
                transition = new FadeTransition({ duration: transitionDuration });
                break;
        }
        
        this.transitionEffects.push(transition);
        return transition;
    }

    /**
     * 創建進度條動畫
     */
    createProgressAnimation(progressBar, targetProgress, duration = 1000) {
        const animation = new ProgressAnimation({
            target: progressBar,
            startProgress: progressBar.progress,
            targetProgress: targetProgress,
            duration: duration
        });
        
        this.feedbackElements.push(animation);
        return animation;
    }

    /**
     * 更新所有視覺效果
     */
    update(deltaTime) {
        // 在低效能模式下限制效果數量
        if (this.lowPerformanceMode) {
            this.limitEffects();
        }
        
        // 更新分數動畫
        this.scoreAnimations = this.scoreAnimations.filter(animation => {
            animation.update(deltaTime);
            return !animation.isFinished();
        });
        
        // 更新獎勵效果
        this.rewardEffects = this.rewardEffects.filter(effect => {
            effect.update(deltaTime);
            return !effect.isFinished();
        });
        
        // 更新反饋元素
        this.feedbackElements = this.feedbackElements.filter(element => {
            element.update(deltaTime);
            return !element.isFinished();
        });
        
        // 更新場景切換效果
        this.transitionEffects = this.transitionEffects.filter(transition => {
            transition.update(deltaTime);
            return !transition.isFinished();
        });
    }

    /**
     * 渲染所有視覺效果
     */
    render(context) {
        // 渲染分數動畫
        this.scoreAnimations.forEach(animation => {
            animation.render(context);
        });
        
        // 渲染獎勵效果
        this.rewardEffects.forEach(effect => {
            effect.render(context);
        });
        
        // 渲染反饋元素
        this.feedbackElements.forEach(element => {
            element.render(context);
        });
        
        // 渲染場景切換效果（通常在最上層）
        this.transitionEffects.forEach(transition => {
            transition.render(context);
        });
    }

    /**
     * 清除所有效果
     */
    clearAllEffects() {
        this.feedbackElements = [];
        this.transitionEffects = [];
        this.scoreAnimations = [];
        this.rewardEffects = [];
    }

    /**
     * 檢查是否有活動的場景切換
     */
    hasActiveTransition() {
        return this.transitionEffects.length > 0;
    }

    /**
     * 設置低效能模式
     */
    setLowPerformanceMode(enabled) {
        this.lowPerformanceMode = enabled;
        
        if (enabled) {
            // 使用低效能配置
            this.config = { ...this.lowPerformanceConfig };
            
            // 限制同時顯示的效果數量
            this.maxEffects = 5;
            
            console.log('視覺反饋系統：低效能模式已啟用');
        } else {
            // 恢復正常配置
            this.config = {
                scorePopDuration: 1000,
                rewardDuration: 2000,
                transitionDuration: 1500,
                starAnimationDuration: 800
            };
            
            this.maxEffects = 20;
            
            console.log('視覺反饋系統：正常模式已啟用');
        }
    }

    /**
     * 清理過多的效果（效能優化）
     */
    limitEffects() {
        if (!this.maxEffects) return;
        
        // 限制分數動畫數量
        if (this.scoreAnimations.length > this.maxEffects) {
            this.scoreAnimations = this.scoreAnimations.slice(-this.maxEffects);
        }
        
        // 限制獎勵效果數量
        if (this.rewardEffects.length > this.maxEffects) {
            this.rewardEffects = this.rewardEffects.slice(-this.maxEffects);
        }
        
        // 限制反饋元素數量
        if (this.feedbackElements.length > this.maxEffects) {
            this.feedbackElements = this.feedbackElements.slice(-this.maxEffects);
        }
    }

    /**
     * 獲取效能統計
     */
    getPerformanceStats() {
        return {
            lowPerformanceMode: this.lowPerformanceMode,
            activeEffects: {
                scoreAnimations: this.scoreAnimations.length,
                rewardEffects: this.rewardEffects.length,
                feedbackElements: this.feedbackElements.length,
                transitionEffects: this.transitionEffects.length
            },
            totalActiveEffects: this.scoreAnimations.length + 
                               this.rewardEffects.length + 
                               this.feedbackElements.length + 
                               this.transitionEffects.length
        };
    }
}

/**
 * 分數彈出動畫
 */
class ScorePopup {
    constructor(config) {
        this.x = config.x;
        this.y = config.y;
        this.startY = config.y;
        this.points = config.points;
        this.type = config.type || 'normal';
        this.duration = config.duration;
        this.elapsed = 0;
        this.finished = false;
        
        // 動畫屬性
        this.alpha = 1;
        this.scale = 1;
        this.color = this.getTypeColor();
    }

    getTypeColor() {
        switch (this.type) {
            case 'bonus':
                return '#FFD700';
            case 'perfect':
                return '#FF69B4';
            case 'combo':
                return '#32CD32';
            default:
                return '#FFA500';
        }
    }

    update(deltaTime) {
        if (this.finished) return;

        this.elapsed += deltaTime;
        const progress = this.elapsed / this.duration;

        if (progress >= 1) {
            this.finished = true;
            return;
        }

        // 向上飄動
        this.y = this.startY - (progress * 80);
        
        // 淡出效果
        this.alpha = 1 - progress;
        
        // 縮放效果
        if (progress < 0.2) {
            this.scale = 1 + (progress * 2);
        } else {
            this.scale = 1.4 - ((progress - 0.2) * 0.5);
        }
    }

    render(context) {
        if (this.finished || this.alpha <= 0) return;

        context.save();
        context.globalAlpha = this.alpha;
        context.translate(this.x, this.y);
        context.scale(this.scale, this.scale);
        
        // 繪製分數文字
        context.fillStyle = this.color;
        context.strokeStyle = '#000000';
        context.lineWidth = 2;
        context.font = 'bold 24px Microsoft JhengHei, sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        const text = `+${this.points}`;
        context.strokeText(text, 0, 0);
        context.fillText(text, 0, 0);
        
        context.restore();
    }

    isFinished() {
        return this.finished;
    }
}

/**
 * 星星獎勵效果
 */
class StarReward {
    constructor(config) {
        this.x = config.x;
        this.y = config.y;
        this.startY = config.y;
        this.delay = config.delay || 0;
        this.duration = config.duration;
        this.elapsed = 0;
        this.finished = false;
        this.started = false;
        
        // 動畫屬性
        this.rotation = 0;
        this.scale = 0;
        this.alpha = 1;
    }

    update(deltaTime) {
        if (this.finished) return;

        this.elapsed += deltaTime;
        
        if (this.elapsed < this.delay) {
            return; // 等待延遲
        }
        
        if (!this.started) {
            this.started = true;
            this.elapsed = 0;
        }

        const progress = this.elapsed / this.duration;

        if (progress >= 1) {
            this.finished = true;
            return;
        }

        // 旋轉動畫
        this.rotation += deltaTime * 0.01;
        
        // 縮放動畫
        if (progress < 0.3) {
            this.scale = progress / 0.3;
        } else if (progress > 0.7) {
            this.scale = 1 - ((progress - 0.7) / 0.3);
        } else {
            this.scale = 1;
        }
        
        // 向上飄動
        this.y = this.startY - (progress * 60);
        
        // 淡出
        this.alpha = 1 - Math.max(0, (progress - 0.5) * 2);
    }

    render(context) {
        if (this.finished || !this.started || this.alpha <= 0) return;

        context.save();
        context.globalAlpha = this.alpha;
        context.translate(this.x, this.y);
        context.rotate(this.rotation);
        context.scale(this.scale, this.scale);
        
        // 繪製星星
        this.drawStar(context, 0, 0, 15, 5);
        
        context.restore();
    }

    drawStar(context, x, y, outerRadius, innerRadius) {
        const spikes = 5;
        const step = Math.PI / spikes;
        
        context.beginPath();
        context.moveTo(x, y - outerRadius);
        
        for (let i = 0; i < spikes; i++) {
            const angle = i * step * 2;
            context.lineTo(
                x + Math.cos(angle - Math.PI / 2) * outerRadius,
                y + Math.sin(angle - Math.PI / 2) * outerRadius
            );
            context.lineTo(
                x + Math.cos(angle - Math.PI / 2 + step) * innerRadius,
                y + Math.sin(angle - Math.PI / 2 + step) * innerRadius
            );
        }
        
        context.closePath();
        context.fillStyle = '#FFD700';
        context.strokeStyle = '#FFA500';
        context.lineWidth = 2;
        context.fill();
        context.stroke();
    }

    isFinished() {
        return this.finished;
    }
}

/**
 * 彩帶效果
 */
class ConfettiEffect {
    constructor(config) {
        this.x = config.x;
        this.y = config.y;
        this.angle = config.angle;
        this.speed = config.speed;
        this.duration = config.duration;
        this.elapsed = 0;
        this.finished = false;
        
        // 物理屬性
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
        this.gravity = 300;
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        
        // 視覺屬性
        this.color = this.getRandomColor();
        this.width = 8;
        this.height = 4;
        this.alpha = 1;
    }

    getRandomColor() {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update(deltaTime) {
        if (this.finished) return;

        this.elapsed += deltaTime;
        const progress = this.elapsed / this.duration;

        if (progress >= 1) {
            this.finished = true;
            return;
        }

        const dt = deltaTime / 1000;
        
        // 更新位置
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        
        // 應用重力
        this.vy += this.gravity * dt;
        
        // 更新旋轉
        this.rotation += this.rotationSpeed * deltaTime;
        
        // 淡出效果
        this.alpha = 1 - Math.max(0, (progress - 0.5) * 2);
    }

    render(context) {
        if (this.finished || this.alpha <= 0) return;

        context.save();
        context.globalAlpha = this.alpha;
        context.translate(this.x, this.y);
        context.rotate(this.rotation);
        
        context.fillStyle = this.color;
        context.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        context.restore();
    }

    isFinished() {
        return this.finished;
    }
}

/**
 * 完成文字效果
 */
class CompletionText {
    constructor(config) {
        this.x = config.x;
        this.y = config.y;
        this.text = config.text;
        this.duration = config.duration;
        this.elapsed = 0;
        this.finished = false;
        
        // 動畫屬性
        this.scale = 0;
        this.alpha = 1;
    }

    update(deltaTime) {
        if (this.finished) return;

        this.elapsed += deltaTime;
        const progress = this.elapsed / this.duration;

        if (progress >= 1) {
            this.finished = true;
            return;
        }

        // 縮放動畫
        if (progress < 0.3) {
            this.scale = progress / 0.3;
        } else if (progress > 0.7) {
            this.scale = 1 - ((progress - 0.7) / 0.3) * 0.5;
        } else {
            this.scale = 1;
        }
        
        // 淡出效果
        if (progress > 0.6) {
            this.alpha = 1 - ((progress - 0.6) / 0.4);
        }
    }

    render(context) {
        if (this.finished || this.alpha <= 0) return;

        context.save();
        context.globalAlpha = this.alpha;
        context.translate(this.x, this.y);
        context.scale(this.scale, this.scale);
        
        // 繪製文字
        context.fillStyle = '#32CD32';
        context.strokeStyle = '#228B22';
        context.lineWidth = 3;
        context.font = 'bold 32px Microsoft JhengHei, sans-serif';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        context.strokeText(this.text, 0, 0);
        context.fillText(this.text, 0, 0);
        
        context.restore();
    }

    isFinished() {
        return this.finished;
    }
}

/**
 * 進度條動畫
 */
class ProgressAnimation {
    constructor(config) {
        this.target = config.target;
        this.startProgress = config.startProgress;
        this.targetProgress = config.targetProgress;
        this.duration = config.duration;
        this.elapsed = 0;
        this.finished = false;
        
        this.currentProgress = this.startProgress;
    }

    update(deltaTime) {
        if (this.finished) return;

        this.elapsed += deltaTime;
        const progress = Math.min(this.elapsed / this.duration, 1);

        if (progress >= 1) {
            this.finished = true;
            this.currentProgress = this.targetProgress;
        } else {
            // 使用緩動函數
            const easedProgress = this.easeOutCubic(progress);
            this.currentProgress = this.startProgress + 
                (this.targetProgress - this.startProgress) * easedProgress;
        }

        // 更新目標進度條
        if (this.target && this.target.setProgress) {
            this.target.setProgress(this.currentProgress);
        }
    }

    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    render(context) {
        // 進度條動畫不需要額外渲染，由目標進度條自己渲染
    }

    isFinished() {
        return this.finished;
    }
}

/**
 * 成就通知
 */
class AchievementNotification {
    constructor(config) {
        this.achievement = config.achievement;
        this.x = config.x || 400;
        this.y = config.y || 100;
        this.duration = config.duration || 3000;
        this.elapsed = 0;
        this.finished = false;
        
        // 動畫屬性
        this.scale = 0;
        this.alpha = 1;
        this.offsetY = 0;
    }

    update(deltaTime) {
        if (this.finished) return;

        this.elapsed += deltaTime;
        const progress = this.elapsed / this.duration;

        if (progress >= 1) {
            this.finished = true;
            return;
        }

        // 縮放動畫
        if (progress < 0.2) {
            this.scale = progress / 0.2;
        } else if (progress > 0.8) {
            this.scale = 1 - ((progress - 0.8) / 0.2) * 0.3;
        } else {
            this.scale = 1;
        }

        // 向上飄動
        this.offsetY = -progress * 30;

        // 淡出效果
        if (progress > 0.7) {
            this.alpha = 1 - ((progress - 0.7) / 0.3);
        }
    }

    render(context) {
        if (this.finished || this.alpha <= 0) return;

        context.save();
        context.globalAlpha = this.alpha;
        context.translate(this.x, this.y + this.offsetY);
        context.scale(this.scale, this.scale);

        // 繪製背景
        const bgWidth = 300;
        const bgHeight = 80;
        context.fillStyle = 'rgba(255, 215, 0, 0.9)';
        context.strokeStyle = '#FF8C00';
        context.lineWidth = 3;
        context.fillRect(-bgWidth/2, -bgHeight/2, bgWidth, bgHeight);
        context.strokeRect(-bgWidth/2, -bgHeight/2, bgWidth, bgHeight);

        // 繪製成就圖標
        context.fillStyle = '#FFD700';
        context.beginPath();
        context.arc(-bgWidth/2 + 30, 0, 20, 0, Math.PI * 2);
        context.fill();
        context.strokeStyle = '#FFA500';
        context.stroke();

        // 繪製成就文字
        context.fillStyle = '#8B4513';
        context.font = 'bold 16px Microsoft JhengHei, sans-serif';
        context.textAlign = 'left';
        context.textBaseline = 'top';
        context.fillText('成就解鎖！', -bgWidth/2 + 60, -25);
        
        context.font = '14px Microsoft JhengHei, sans-serif';
        context.fillText(this.achievement.name, -bgWidth/2 + 60, -5);
        context.fillText(this.achievement.description, -bgWidth/2 + 60, 15);

        context.restore();
    }

    isFinished() {
        return this.finished;
    }
}
// 匯出到全域作用域
window.VisualFeedback = VisualFeedback;
