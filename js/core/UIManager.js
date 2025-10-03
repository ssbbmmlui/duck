/**
 * UI管理器
 * 負責遊戲UI元素的創建、管理和渲染
 */
class UIManager {
    constructor() {
        this.uiElements = [];
        this.overlayElement = null;
        this.canvas = null;
        this.context = null;
        
        // 互動反饋系統
        this.feedbackEffects = [];
        this.animations = [];
        
        // 繁體中文字體設定
        this.chineseFonts = [
            'Microsoft JhengHei',
            'PingFang TC',
            'Heiti TC',
            'LiHei Pro',
            'Microsoft YaHei',
            'SimHei',
            'Arial Unicode MS',
            'sans-serif'
        ];
        this.defaultFontFamily = this.chineseFonts.join(', ');
        
        this.initializeOverlay();
        this.setupFontPreloading();
    }

    /**
     * 初始化UI覆蓋層
     */
    initializeOverlay() {
        this.overlayElement = document.getElementById('uiOverlay');
        if (!this.overlayElement) {
            console.warn('找不到UI覆蓋層元素');
        }
    }

    /**
     * 設置字體預載入
     */
    setupFontPreloading() {
        // 創建隱藏的測試文字來預載入字體
        const testElement = document.createElement('div');
        testElement.style.position = 'absolute';
        testElement.style.left = '-9999px';
        testElement.style.fontFamily = this.defaultFontFamily;
        testElement.innerHTML = '測試繁體中文字體載入 Test Chinese Font Loading';
        document.body.appendChild(testElement);
        
        // 短暫延遲後移除測試元素
        setTimeout(() => {
            document.body.removeChild(testElement);
        }, 100);
    }

    /**
     * 設置Canvas上下文
     */
    setCanvas(canvas, context) {
        this.canvas = canvas;
        this.context = context;
    }

    /**
     * 創建按鈕
     */
    createButton(config) {
        const button = new UIButton({
            x: config.x || 0,
            y: config.y || 0,
            width: config.width || 120,
            height: config.height || 40,
            text: config.text || '按鈕',
            onClick: config.onClick || (() => {}),
            style: config.style || 'default'
        });
        
        this.addUIElement(button);
        return button;
    }

    /**
     * 創建文字標籤
     */
    createLabel(config) {
        const label = new UILabel({
            x: config.x || 0,
            y: config.y || 0,
            text: config.text || '',
            fontSize: config.fontSize || 16,
            color: config.color || '#000000',
            align: config.align || 'left'
        });
        
        this.addUIElement(label);
        return label;
    }

    /**
     * 創建進度條
     */
    createProgressBar(config) {
        const progressBar = new UIProgressBar({
            x: config.x || 0,
            y: config.y || 0,
            width: config.width || 200,
            height: config.height || 20,
            progress: config.progress || 0,
            color: config.color || '#32CD32'
        });
        
        this.addUIElement(progressBar);
        return progressBar;
    }

    /**
     * 添加UI元素
     */
    addUIElement(element) {
        this.uiElements.push(element);
    }

    /**
     * 移除UI元素
     */
    removeUIElement(element) {
        const index = this.uiElements.indexOf(element);
        if (index > -1) {
            this.uiElements.splice(index, 1);
        }
    }

    /**
     * 清除所有UI元素
     */
    clearUIElements() {
        this.uiElements = [];
    }

    /**
     * 創建互動反饋效果
     */
    createFeedbackEffect(x, y, type = 'click') {
        const effect = new UIFeedbackEffect({
            x: x,
            y: y,
            type: type,
            duration: 500
        });
        
        this.feedbackEffects.push(effect);
        return effect;
    }

    /**
     * 創建動畫
     */
    createAnimation(target, properties, duration, easing = 'easeOut') {
        const animation = new UIAnimation({
            target: target,
            properties: properties,
            duration: duration,
            easing: easing
        });
        
        this.animations.push(animation);
        return animation;
    }

    /**
     * 測量繁體中文文字尺寸
     */
    measureChineseText(text, fontSize = 16) {
        if (!this.context) return { width: 0, height: fontSize };
        
        const oldFont = this.context.font;
        this.context.font = `${fontSize}px ${this.defaultFontFamily}`;
        
        const metrics = this.context.measureText(text);
        const width = metrics.width;
        const height = fontSize * 1.2; // 中文字體通常需要更多垂直空間
        
        this.context.font = oldFont;
        
        return { width, height };
    }

    /**
     * 渲染繁體中文文字（支援多行）
     */
    renderChineseText(context, text, x, y, maxWidth, fontSize = 16, color = '#000000', align = 'left') {
        context.save();
        
        context.fillStyle = color;
        context.font = `${fontSize}px ${this.defaultFontFamily}`;
        context.textAlign = align;
        context.textBaseline = 'top';
        
        // 處理多行文字
        const lines = this.wrapChineseText(text, maxWidth, fontSize);
        const lineHeight = fontSize * 1.4;
        
        lines.forEach((line, index) => {
            context.fillText(line, x, y + (index * lineHeight));
        });
        
        context.restore();
        
        return lines.length * lineHeight;
    }

    /**
     * 中文文字換行處理
     */
    wrapChineseText(text, maxWidth, fontSize) {
        if (!this.context || !maxWidth) return [text];
        
        const oldFont = this.context.font;
        this.context.font = `${fontSize}px ${this.defaultFontFamily}`;
        
        const lines = [];
        const characters = text.split('');
        let currentLine = '';
        
        for (let i = 0; i < characters.length; i++) {
            const testLine = currentLine + characters[i];
            const metrics = this.context.measureText(testLine);
            
            if (metrics.width > maxWidth && currentLine !== '') {
                lines.push(currentLine);
                currentLine = characters[i];
            } else {
                currentLine = testLine;
            }
        }
        
        if (currentLine) {
            lines.push(currentLine);
        }
        
        this.context.font = oldFont;
        return lines;
    }

    /**
     * 更新UI元素
     */
    update(deltaTime) {
        // 更新UI元素
        this.uiElements.forEach(element => {
            if (element.update) {
                element.update(deltaTime);
            }
        });
        
        // 更新反饋效果
        this.feedbackEffects = this.feedbackEffects.filter(effect => {
            effect.update(deltaTime);
            return !effect.isFinished();
        });
        
        // 更新動畫
        this.animations = this.animations.filter(animation => {
            animation.update(deltaTime);
            return !animation.isFinished();
        });
    }

    /**
     * 渲染UI元素
     */
    render(context) {
        // 渲染UI元素
        this.uiElements.forEach(element => {
            if (element.render && element.visible !== false) {
                element.render(context);
            }
        });
        
        // 渲染反饋效果
        this.feedbackEffects.forEach(effect => {
            effect.render(context);
        });
    }

    /**
     * 處理輸入事件
     */
    handleInput(event) {
        // 創建點擊反饋效果
        if (event.type === 'click') {
            this.createFeedbackEffect(event.x, event.y, 'click');
        }
        
        // 從後往前檢查（後添加的元素在上層）
        for (let i = this.uiElements.length - 1; i >= 0; i--) {
            const element = this.uiElements[i];
            if (element.handleInput && element.handleInput(event)) {
                // 為成功互動的元素創建特殊反饋
                if (event.type === 'click' && element.x !== undefined && element.y !== undefined) {
                    this.createFeedbackEffect(
                        element.x + element.width / 2, 
                        element.y + element.height / 2, 
                        'success'
                    );
                }
                return true; // 事件被處理
            }
        }
        return false;
    }
}

/**
 * UI按鈕類別
 */
class UIButton {
    constructor(config) {
        this.x = config.x;
        this.y = config.y;
        this.width = config.width;
        this.height = config.height;
        this.text = config.text;
        this.onClick = config.onClick;
        this.style = config.style || 'default';
        
        this.isHovered = false;
        this.isPressed = false;
        this.visible = true;
        this.enabled = true;
        
        // 動畫屬性
        this.scale = 1;
        this.targetScale = 1;
        this.animationSpeed = 0.1;
        
        // 音效回調
        this.onHover = config.onHover || null;
        this.onPress = config.onPress || null;
    }

    /**
     * 更新按鈕動畫
     */
    update(deltaTime) {
        // 平滑縮放動畫
        if (Math.abs(this.scale - this.targetScale) > 0.01) {
            this.scale += (this.targetScale - this.scale) * this.animationSpeed;
        } else {
            this.scale = this.targetScale;
        }
    }

    /**
     * 渲染按鈕
     */
    render(context) {
        if (!this.visible) return;

        context.save();
        
        // 應用縮放變換
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        context.translate(centerX, centerY);
        context.scale(this.scale, this.scale);
        context.translate(-centerX, -centerY);

        // Modern button colors - professional blue/teal scheme
        let bgColor = '#3b82f6'; // Blue
        let textColor = '#ffffff';
        let shadowBlur = 8;
        let shadowColor = 'rgba(59, 130, 246, 0.3)';

        if (!this.enabled) {
            bgColor = '#cbd5e0';
            textColor = '#718096';
            shadowColor = 'rgba(0, 0, 0, 0.1)';
            shadowBlur = 4;
        } else if (this.isPressed) {
            bgColor = '#2563eb';
            shadowBlur = 4;
        } else if (this.isHovered) {
            bgColor = '#60a5fa';
            shadowBlur = 12;
            shadowColor = 'rgba(59, 130, 246, 0.5)';
        }

        // Modern shadow effect
        if (this.enabled && !this.isPressed) {
            context.shadowColor = shadowColor;
            context.shadowBlur = shadowBlur;
            context.shadowOffsetX = 0;
            context.shadowOffsetY = 4;
        }

        // Draw rounded button background
        const radius = 10;
        context.fillStyle = bgColor;
        context.beginPath();
        context.roundRect(this.x, this.y, this.width, this.height, radius);
        context.fill();

        // Reset shadow
        context.shadowColor = 'transparent';
        context.shadowBlur = 0;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;

        // Draw text
        context.fillStyle = textColor;
        context.font = `bold 16px Microsoft JhengHei, PingFang TC, Heiti TC, sans-serif`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // 支援多行文字
        const lines = this.text.split('\n');
        const lineHeight = 18;
        const totalHeight = lines.length * lineHeight;
        const startY = this.y + this.height / 2 - totalHeight / 2 + lineHeight / 2;
        
        lines.forEach((line, index) => {
            context.fillText(
                line,
                this.x + this.width / 2,
                startY + (index * lineHeight)
            );
        });
        
        context.restore();
    }

    /**
     * 處理輸入事件
     */
    handleInput(event) {
        if (!this.visible || !this.enabled) return false;

        const isInBounds = event.x >= this.x && event.x <= this.x + this.width &&
                          event.y >= this.y && event.y <= this.y + this.height;

        if (event.type === 'click' && isInBounds) {
            // 按下動畫效果
            this.isPressed = true;
            this.targetScale = 0.95;
            
            // 觸發音效回調
            if (this.onPress) {
                this.onPress();
            }
            
            // 延遲執行點擊事件，讓動畫效果可見
            setTimeout(() => {
                this.isPressed = false;
                this.targetScale = 1;
                this.onClick();
            }, 100);
            
            return true;
        }

        if (event.type === 'mousemove' || event.type === 'hover') {
            const wasHovered = this.isHovered;
            this.isHovered = isInBounds;
            
            if (this.isHovered && !wasHovered) {
                this.targetScale = 1.05;
                if (this.onHover) {
                    this.onHover();
                }
            } else if (!this.isHovered && wasHovered) {
                this.targetScale = 1;
            }
        }

        return false;
    }

    /**
     * 設置文字
     */
    setText(text) {
        this.text = text;
    }

    /**
     * 設置啟用狀態
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    /**
     * 設置可見性
     */
    setVisible(visible) {
        this.visible = visible;
    }
}

/**
 * UI文字標籤類別
 */
class UILabel {
    constructor(config) {
        this.x = config.x;
        this.y = config.y;
        this.text = config.text;
        this.fontSize = config.fontSize || 16;
        this.color = config.color || '#000000';
        this.align = config.align || 'left';
        this.visible = true;
    }

    /**
     * 渲染標籤
     */
    render(context) {
        if (!this.visible) return;

        context.fillStyle = this.color;
        context.font = `${this.fontSize}px Microsoft JhengHei, PingFang TC, Heiti TC, sans-serif`;
        context.textAlign = this.align;
        context.textBaseline = 'top';
        
        // 支援多行文字渲染
        const lines = this.text.split('\n');
        const lineHeight = this.fontSize * 1.4;
        
        lines.forEach((line, index) => {
            context.fillText(line, this.x, this.y + (index * lineHeight));
        });
    }

    /**
     * 設置文字
     */
    setText(text) {
        this.text = text;
    }

    /**
     * 設置顏色
     */
    setColor(color) {
        this.color = color;
    }

    /**
     * 設置可見性
     */
    setVisible(visible) {
        this.visible = visible;
    }
}

/**
 * UI進度條類別
 */
class UIProgressBar {
    constructor(config) {
        this.x = config.x;
        this.y = config.y;
        this.width = config.width;
        this.height = config.height;
        this.progress = config.progress || 0; // 0-1之間
        this.color = config.color || '#32CD32';
        this.backgroundColor = config.backgroundColor || '#CCCCCC';
        this.borderColor = config.borderColor || '#999999';
        this.visible = true;
    }

    /**
     * 渲染進度條
     */
    render(context) {
        if (!this.visible) return;

        // 繪製背景
        context.fillStyle = this.backgroundColor;
        context.fillRect(this.x, this.y, this.width, this.height);
        
        // 繪製進度
        const progressWidth = this.width * Math.max(0, Math.min(1, this.progress));
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, progressWidth, this.height);
        
        // 繪製邊框
        context.strokeStyle = this.borderColor;
        context.lineWidth = 1;
        context.strokeRect(this.x, this.y, this.width, this.height);
    }

    /**
     * 設置進度
     */
    setProgress(progress) {
        this.progress = Math.max(0, Math.min(1, progress));
    }

    /**
     * 設置可見性
     */
    setVisible(visible) {
        this.visible = visible;
    }
}

/**
 * UI反饋效果類別
 */
class UIFeedbackEffect {
    constructor(config) {
        this.x = config.x;
        this.y = config.y;
        this.type = config.type || 'click';
        this.duration = config.duration || 500;
        this.elapsed = 0;
        this.finished = false;
        
        // 效果屬性
        this.radius = 0;
        this.maxRadius = 30;
        this.alpha = 1;
        this.color = this.getEffectColor();
    }

    /**
     * 獲取效果顏色
     */
    getEffectColor() {
        switch (this.type) {
            case 'click':
                return '#FFD700';
            case 'success':
                return '#32CD32';
            case 'error':
                return '#FF6B6B';
            default:
                return '#87CEEB';
        }
    }

    /**
     * 更新效果
     */
    update(deltaTime) {
        if (this.finished) return;

        this.elapsed += deltaTime;
        const progress = this.elapsed / this.duration;

        if (progress >= 1) {
            this.finished = true;
            return;
        }

        // 動畫效果
        this.radius = this.maxRadius * progress;
        this.alpha = 1 - progress;
    }

    /**
     * 渲染效果
     */
    render(context) {
        if (this.finished || this.alpha <= 0) return;

        context.save();
        context.globalAlpha = this.alpha;
        
        // 繪製圓形波紋效果
        context.strokeStyle = this.color;
        context.lineWidth = 3;
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.stroke();
        
        // 繪製中心點
        if (this.type === 'success') {
            context.fillStyle = this.color;
            context.beginPath();
            context.arc(this.x, this.y, 3, 0, Math.PI * 2);
            context.fill();
        }
        
        context.restore();
    }

    /**
     * 檢查是否完成
     */
    isFinished() {
        return this.finished;
    }
}

/**
 * UI動畫類別
 */
class UIAnimation {
    constructor(config) {
        this.target = config.target;
        this.properties = config.properties;
        this.duration = config.duration;
        this.easing = config.easing || 'easeOut';
        this.elapsed = 0;
        this.finished = false;
        
        // 保存初始值
        this.startValues = {};
        for (const prop in this.properties) {
            this.startValues[prop] = this.target[prop] || 0;
        }
    }

    /**
     * 緩動函數
     */
    applyEasing(t) {
        switch (this.easing) {
            case 'linear':
                return t;
            case 'easeIn':
                return t * t;
            case 'easeOut':
                return 1 - (1 - t) * (1 - t);
            case 'easeInOut':
                return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            default:
                return 1 - (1 - t) * (1 - t); // easeOut
        }
    }

    /**
     * 更新動畫
     */
    update(deltaTime) {
        if (this.finished) return;

        this.elapsed += deltaTime;
        let progress = this.elapsed / this.duration;

        if (progress >= 1) {
            progress = 1;
            this.finished = true;
        }

        const easedProgress = this.applyEasing(progress);

        // 更新目標屬性
        for (const prop in this.properties) {
            const startValue = this.startValues[prop];
            const endValue = this.properties[prop];
            this.target[prop] = startValue + (endValue - startValue) * easedProgress;
        }
    }

    /**
     * 檢查是否完成
     */
    isFinished() {
        return this.finished;
    }
}

/**
 * UI工具函數
 */
class UIUtils {
    /**
     * 檢查點是否在矩形內
     */
    static isPointInRect(x, y, rect) {
        return x >= rect.x && x <= rect.x + rect.width &&
               y >= rect.y && y <= rect.y + rect.height;
    }

    /**
     * 檢查點是否在圓形內
     */
    static isPointInCircle(x, y, circle) {
        const dx = x - circle.x;
        const dy = y - circle.y;
        return dx * dx + dy * dy <= circle.radius * circle.radius;
    }

    /**
     * 線性插值
     */
    static lerp(start, end, t) {
        return start + (end - start) * t;
    }

    /**
     * 限制數值範圍
     */
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    /**
     * 格式化繁體中文數字
     */
    static formatChineseNumber(num) {
        const chineseNums = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
        const units = ['', '十', '百', '千', '萬'];
        
        if (num === 0) return '零';
        if (num < 10) return chineseNums[num];
        if (num < 100) {
            const tens = Math.floor(num / 10);
            const ones = num % 10;
            if (tens === 1) {
                return '十' + (ones > 0 ? chineseNums[ones] : '');
            }
            return chineseNums[tens] + '十' + (ones > 0 ? chineseNums[ones] : '');
        }
        
        // 簡化處理，僅支援到999
        return num.toString();
    }

    /**
     * 繁體中文文字測量
     */
    static measureChineseText(context, text, fontSize) {
        const oldFont = context.font;
        context.font = `${fontSize}px Microsoft JhengHei, PingFang TC, sans-serif`;
        
        const metrics = context.measureText(text);
        const width = metrics.width;
        const height = fontSize * 1.2;
        
        context.font = oldFont;
        return { width, height };
    }
}
// 匯出到全域作用域
window.UIManager = UIManager;
window.UIButton = UIButton;
window.UILabel = UILabel;
window.UIProgressBar = UIProgressBar;
window.UIFeedbackEffect = UIFeedbackEffect;
window.UIAnimation = UIAnimation;
window.UIUtils = UIUtils;
