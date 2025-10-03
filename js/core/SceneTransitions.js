/**
 * 場景切換效果系統
 * 提供各種場景間的過渡動畫效果
 */

/**
 * 淡入淡出切換效果
 */
class FadeTransition {
    constructor(config) {
        this.duration = config.duration || 1000;
        this.elapsed = 0;
        this.finished = false;
        this.phase = 'fadeOut'; // 'fadeOut' -> 'fadeIn'
        this.alpha = 0;
        this.onMidpoint = config.onMidpoint || null;
        this.midpointCalled = false;
    }

    update(deltaTime) {
        if (this.finished) return;

        this.elapsed += deltaTime;
        const halfDuration = this.duration / 2;
        
        if (this.phase === 'fadeOut') {
            const progress = Math.min(this.elapsed / halfDuration, 1);
            this.alpha = progress;
            
            if (progress >= 1) {
                this.phase = 'fadeIn';
                this.elapsed = 0;
                
                // 在中點調用回調（通常用於切換場景）
                if (this.onMidpoint && !this.midpointCalled) {
                    this.onMidpoint();
                    this.midpointCalled = true;
                }
            }
        } else if (this.phase === 'fadeIn') {
            const progress = Math.min(this.elapsed / halfDuration, 1);
            this.alpha = 1 - progress;
            
            if (progress >= 1) {
                this.finished = true;
            }
        }
    }

    render(context) {
        if (this.alpha <= 0) return;

        context.save();
        context.globalAlpha = this.alpha;
        context.fillStyle = '#000000';
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
        context.restore();
    }

    isFinished() {
        return this.finished;
    }

    setMidpointCallback(callback) {
        this.onMidpoint = callback;
    }
}

/**
 * 滑動切換效果
 */
class SlideTransition {
    constructor(config) {
        this.duration = config.duration || 1000;
        this.direction = config.direction || 'left'; // 'left', 'right', 'up', 'down'
        this.elapsed = 0;
        this.finished = false;
        this.phase = 'slideOut';
        this.offset = 0;
        this.onMidpoint = config.onMidpoint || null;
        this.midpointCalled = false;
        
        this.canvasWidth = 800;
        this.canvasHeight = 600;
    }

    update(deltaTime) {
        if (this.finished) return;

        this.elapsed += deltaTime;
        const halfDuration = this.duration / 2;
        
        if (this.phase === 'slideOut') {
            const progress = Math.min(this.elapsed / halfDuration, 1);
            this.offset = this.getOffsetForProgress(progress);
            
            if (progress >= 1) {
                this.phase = 'slideIn';
                this.elapsed = 0;
                
                if (this.onMidpoint && !this.midpointCalled) {
                    this.onMidpoint();
                    this.midpointCalled = true;
                }
            }
        } else if (this.phase === 'slideIn') {
            const progress = Math.min(this.elapsed / halfDuration, 1);
            this.offset = this.getOffsetForProgress(1 - progress);
            
            if (progress >= 1) {
                this.finished = true;
            }
        }
    }

    getOffsetForProgress(progress) {
        const easeProgress = this.easeInOutCubic(progress);
        
        switch (this.direction) {
            case 'left':
                return -this.canvasWidth * easeProgress;
            case 'right':
                return this.canvasWidth * easeProgress;
            case 'up':
                return -this.canvasHeight * easeProgress;
            case 'down':
                return this.canvasHeight * easeProgress;
            default:
                return 0;
        }
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    render(context) {
        if (this.offset === 0) return;

        context.save();
        
        // 創建滑動遮罩效果
        context.fillStyle = '#2C3E50';
        
        if (this.direction === 'left' || this.direction === 'right') {
            const x = this.direction === 'left' ? 
                this.canvasWidth + this.offset : 
                this.offset;
            context.fillRect(x, 0, this.canvasWidth, this.canvasHeight);
        } else {
            const y = this.direction === 'up' ? 
                this.canvasHeight + this.offset : 
                this.offset;
            context.fillRect(0, y, this.canvasWidth, this.canvasHeight);
        }
        
        context.restore();
    }

    isFinished() {
        return this.finished;
    }

    setMidpointCallback(callback) {
        this.onMidpoint = callback;
    }
}

/**
 * 擦拭切換效果
 */
class WipeTransition {
    constructor(config) {
        this.duration = config.duration || 1000;
        this.direction = config.direction || 'horizontal'; // 'horizontal', 'vertical', 'circular'
        this.elapsed = 0;
        this.finished = false;
        this.phase = 'wipeOut';
        this.progress = 0;
        this.onMidpoint = config.onMidpoint || null;
        this.midpointCalled = false;
        
        this.canvasWidth = 800;
        this.canvasHeight = 600;
    }

    update(deltaTime) {
        if (this.finished) return;

        this.elapsed += deltaTime;
        const halfDuration = this.duration / 2;
        
        if (this.phase === 'wipeOut') {
            this.progress = Math.min(this.elapsed / halfDuration, 1);
            
            if (this.progress >= 1) {
                this.phase = 'wipeIn';
                this.elapsed = 0;
                
                if (this.onMidpoint && !this.midpointCalled) {
                    this.onMidpoint();
                    this.midpointCalled = true;
                }
            }
        } else if (this.phase === 'wipeIn') {
            const rawProgress = Math.min(this.elapsed / halfDuration, 1);
            this.progress = 1 - rawProgress;
            
            if (rawProgress >= 1) {
                this.finished = true;
            }
        }
    }

    render(context) {
        if (this.progress <= 0) return;

        context.save();
        context.fillStyle = '#34495E';
        
        switch (this.direction) {
            case 'horizontal':
                const width = this.canvasWidth * this.progress;
                context.fillRect(0, 0, width, this.canvasHeight);
                break;
                
            case 'vertical':
                const height = this.canvasHeight * this.progress;
                context.fillRect(0, 0, this.canvasWidth, height);
                break;
                
            case 'circular':
                const centerX = this.canvasWidth / 2;
                const centerY = this.canvasHeight / 2;
                const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);
                const radius = maxRadius * this.progress;
                
                context.beginPath();
                context.arc(centerX, centerY, radius, 0, Math.PI * 2);
                context.fill();
                break;
        }
        
        context.restore();
    }

    isFinished() {
        return this.finished;
    }

    setMidpointCallback(callback) {
        this.onMidpoint = callback;
    }
}

/**
 * 百葉窗切換效果
 */
class BlindsTransition {
    constructor(config) {
        this.duration = config.duration || 1000;
        this.blindCount = config.blindCount || 8;
        this.direction = config.direction || 'horizontal'; // 'horizontal', 'vertical'
        this.elapsed = 0;
        this.finished = false;
        this.phase = 'close';
        this.progress = 0;
        this.onMidpoint = config.onMidpoint || null;
        this.midpointCalled = false;
        
        this.canvasWidth = 800;
        this.canvasHeight = 600;
    }

    update(deltaTime) {
        if (this.finished) return;

        this.elapsed += deltaTime;
        const halfDuration = this.duration / 2;
        
        if (this.phase === 'close') {
            this.progress = Math.min(this.elapsed / halfDuration, 1);
            
            if (this.progress >= 1) {
                this.phase = 'open';
                this.elapsed = 0;
                
                if (this.onMidpoint && !this.midpointCalled) {
                    this.onMidpoint();
                    this.midpointCalled = true;
                }
            }
        } else if (this.phase === 'open') {
            const rawProgress = Math.min(this.elapsed / halfDuration, 1);
            this.progress = 1 - rawProgress;
            
            if (rawProgress >= 1) {
                this.finished = true;
            }
        }
    }

    render(context) {
        if (this.progress <= 0) return;

        context.save();
        context.fillStyle = '#2C3E50';
        
        if (this.direction === 'horizontal') {
            const blindHeight = this.canvasHeight / this.blindCount;
            const maxBlindWidth = this.canvasWidth * this.progress;
            
            for (let i = 0; i < this.blindCount; i++) {
                const y = i * blindHeight;
                const staggerOffset = (i % 2) * 0.1; // 交錯效果
                const adjustedProgress = Math.max(0, Math.min(1, this.progress + staggerOffset));
                const blindWidth = this.canvasWidth * adjustedProgress;
                
                context.fillRect(0, y, blindWidth, blindHeight);
            }
        } else {
            const blindWidth = this.canvasWidth / this.blindCount;
            
            for (let i = 0; i < this.blindCount; i++) {
                const x = i * blindWidth;
                const staggerOffset = (i % 2) * 0.1;
                const adjustedProgress = Math.max(0, Math.min(1, this.progress + staggerOffset));
                const blindHeight = this.canvasHeight * adjustedProgress;
                
                context.fillRect(x, 0, blindWidth, blindHeight);
            }
        }
        
        context.restore();
    }

    isFinished() {
        return this.finished;
    }

    setMidpointCallback(callback) {
        this.onMidpoint = callback;
    }
}

/**
 * 場景切換管理器
 */
class SceneTransitionManager {
    constructor() {
        this.currentTransition = null;
        this.transitionQueue = [];
        this.lowPerformanceMode = false;
    }

    /**
     * 開始場景切換
     */
    startTransition(type, config = {}) {
        // 如果已有進行中的切換，加入佇列
        if (this.currentTransition && !this.currentTransition.isFinished()) {
            this.transitionQueue.push({ type, config });
            return null;
        }

        // 根據效能模式優化配置
        const optimizedConfig = this.getOptimizedConfig(config);

        let transition;
        // 在低效能模式下只使用簡單的淡入淡出效果
        if (this.lowPerformanceMode) {
            transition = new FadeTransition(optimizedConfig);
        } else {
            switch (type) {
                case 'fade':
                    transition = new FadeTransition(optimizedConfig);
                    break;
                case 'slide':
                    transition = new SlideTransition(optimizedConfig);
                    break;
                case 'wipe':
                    transition = new WipeTransition(optimizedConfig);
                    break;
                case 'blinds':
                    transition = new BlindsTransition(optimizedConfig);
                    break;
                default:
                    transition = new FadeTransition(optimizedConfig);
            }
        }

        this.currentTransition = transition;
        return transition;
    }

    /**
     * 更新切換效果
     */
    update(deltaTime) {
        if (this.currentTransition) {
            this.currentTransition.update(deltaTime);
            
            // 如果當前切換完成，處理佇列中的下一個
            if (this.currentTransition.isFinished()) {
                this.currentTransition = null;
                
                if (this.transitionQueue.length > 0) {
                    const next = this.transitionQueue.shift();
                    this.startTransition(next.type, next.config);
                }
            }
        }
    }

    /**
     * 渲染切換效果
     */
    render(context) {
        if (this.currentTransition) {
            this.currentTransition.render(context);
        }
    }

    /**
     * 檢查是否有活動的切換
     */
    hasActiveTransition() {
        return this.currentTransition && !this.currentTransition.isFinished();
    }

    /**
     * 清除所有切換效果
     */
    clearTransitions() {
        this.currentTransition = null;
        this.transitionQueue = [];
    }

    /**
     * 設置低效能模式
     */
    setLowPerformanceMode(enabled) {
        this.lowPerformanceMode = enabled;
        
        if (enabled) {
            console.log('場景切換系統：低效能模式已啟用');
            // 在低效能模式下使用更簡單的切換效果
        } else {
            console.log('場景切換系統：正常模式已啟用');
        }
    }

    /**
     * 根據效能模式調整切換配置
     */
    getOptimizedConfig(config) {
        if (!this.lowPerformanceMode) {
            return config;
        }

        // 在低效能模式下縮短動畫時間
        const optimizedConfig = { ...config };
        if (optimizedConfig.duration) {
            optimizedConfig.duration = Math.min(optimizedConfig.duration, 500);
        }

        return optimizedConfig;
    }
}
// 匯出到全域作用域
window.SceneTransitionManager = SceneTransitionManager;
window.FadeTransition = FadeTransition;
window.SlideTransition = SlideTransition;
window.WipeTransition = WipeTransition;
window.BlindsTransition = BlindsTransition;
