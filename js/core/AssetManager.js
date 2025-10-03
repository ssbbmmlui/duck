/**
 * 資源管理器
 * 負責遊戲資源的載入、管理和佔位符系統
 */
class AssetManager {
    constructor() {
        this.assets = new Map();
        this.loadingPromises = new Map();
        this.placeholders = new Map();
        
        // 初始化佔位符
        this.initializePlaceholders();
    }

    /**
     * 初始化佔位符系統
     */
    initializePlaceholders() {
        // 創建基本的佔位符圖片
        this.createPlaceholderImage('default', 100, 100, '#CCCCCC', '載入中...');
        this.createPlaceholderImage('background', 800, 600, '#F5DEB3', '背景圖片');
        this.createPlaceholderImage('character', 200, 200, '#FFE4B5', '角色圖片');
        this.createPlaceholderImage('ui_button', 120, 40, '#FFD700', '按鈕');
        this.createPlaceholderImage('food_item', 150, 150, '#DEB887', '食材');
    }

    /**
     * 創建佔位符圖片
     */
    createPlaceholderImage(name, width, height, color, text) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        
        // 填充背景色
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, width, height);
        
        // 添加邊框
        ctx.strokeStyle = '#999999';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, width - 2, height - 2);
        
        // 添加文字
        ctx.fillStyle = '#666666';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, width / 2, height / 2);
        
        // 添加尺寸資訊
        ctx.font = '10px Arial';
        ctx.fillText(`${width}x${height}`, width / 2, height / 2 + 20);
        
        this.placeholders.set(name, canvas);
    }

    /**
     * 載入圖片資源（帶重試機制）
     */
    async loadImage(path, name, retryCount = 3) {
        // 如果已經在載入中，返回現有的Promise
        if (this.loadingPromises.has(name)) {
            return this.loadingPromises.get(name);
        }

        // 如果已經載入，直接返回
        if (this.assets.has(name)) {
            return this.assets.get(name);
        }

        const loadPromise = this.attemptImageLoad(path, name, retryCount);
        this.loadingPromises.set(name, loadPromise);
        return loadPromise;
    }

    /**
     * 嘗試載入圖片（帶重試機制）
     */
    async attemptImageLoad(path, name, retryCount) {
        for (let attempt = 0; attempt <= retryCount; attempt++) {
            try {
                const img = await this.loadSingleImage(path, name, attempt);
                this.assets.set(name, img);
                this.loadingPromises.delete(name);
                console.log(`圖片載入成功: ${name} (${path})${attempt > 0 ? ` (重試 ${attempt} 次)` : ''}`);
                return img;
            } catch (error) {
                if (attempt === retryCount) {
                    console.warn(`圖片載入失敗: ${name} (${path})，已重試 ${retryCount} 次，使用佔位符`);
                    
                    // 根據名稱選擇合適的佔位符
                    let placeholderType = 'default';
                    if (name.includes('background') || name.includes('bg')) {
                        placeholderType = 'background';
                    } else if (name.includes('character') || name.includes('duck')) {
                        placeholderType = 'character';
                    } else if (name.includes('button')) {
                        placeholderType = 'ui_button';
                    } else if (name.includes('food') || name.includes('ingredient')) {
                        placeholderType = 'food_item';
                    }
                    
                    const placeholder = this.placeholders.get(placeholderType) || this.placeholders.get('default');
                    this.assets.set(name, placeholder);
                    this.loadingPromises.delete(name);
                    return placeholder;
                } else {
                    console.warn(`圖片載入失敗: ${name} (${path})，準備重試 (${attempt + 1}/${retryCount + 1})`);
                    // 等待一段時間後重試
                    await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                }
            }
        }
    }

    /**
     * 載入單個圖片
     */
    loadSingleImage(path, name, attempt) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            // 設置超時
            const timeout = setTimeout(() => {
                reject(new Error(`圖片載入超時: ${name}`));
            }, 10000); // 10秒超時
            
            img.onload = () => {
                clearTimeout(timeout);
                resolve(img);
            };
            
            img.onerror = () => {
                clearTimeout(timeout);
                reject(new Error(`圖片載入錯誤: ${name}`));
            };
            
            // 添加緩存破壞參數以避免緩存問題
            const cacheBuster = attempt > 0 ? `?retry=${attempt}&t=${Date.now()}` : '';
            img.src = path + cacheBuster;
        });
    }

    /**
     * 載入音效資源（帶重試機制）
     */
    async loadAudio(path, name, retryCount = 2) {
        if (this.loadingPromises.has(name)) {
            return this.loadingPromises.get(name);
        }

        if (this.assets.has(name)) {
            return this.assets.get(name);
        }

        const loadPromise = this.attemptAudioLoad(path, name, retryCount);
        this.loadingPromises.set(name, loadPromise);
        return loadPromise;
    }

    /**
     * 嘗試載入音效（帶重試機制）
     */
    async attemptAudioLoad(path, name, retryCount) {
        for (let attempt = 0; attempt <= retryCount; attempt++) {
            try {
                const audio = await this.loadSingleAudio(path, name, attempt);
                this.assets.set(name, audio);
                this.loadingPromises.delete(name);
                console.log(`音效載入成功: ${name} (${path})${attempt > 0 ? ` (重試 ${attempt} 次)` : ''}`);
                return audio;
            } catch (error) {
                if (attempt === retryCount) {
                    console.warn(`音效載入失敗: ${name} (${path})，已重試 ${retryCount} 次`);
                    this.loadingPromises.delete(name);
                    return null; // 音效載入失敗時返回null
                } else {
                    console.warn(`音效載入失敗: ${name} (${path})，準備重試 (${attempt + 1}/${retryCount + 1})`);
                    // 等待一段時間後重試
                    await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
                }
            }
        }
    }

    /**
     * 載入單個音效
     */
    loadSingleAudio(path, name, attempt) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            
            // 設置超時
            const timeout = setTimeout(() => {
                reject(new Error(`音效載入超時: ${name}`));
            }, 5000); // 5秒超時
            
            audio.oncanplaythrough = () => {
                clearTimeout(timeout);
                resolve(audio);
            };
            
            audio.onerror = () => {
                clearTimeout(timeout);
                reject(new Error(`音效載入錯誤: ${name}`));
            };
            
            // 添加緩存破壞參數以避免緩存問題
            const cacheBuster = attempt > 0 ? `?retry=${attempt}&t=${Date.now()}` : '';
            audio.src = path + cacheBuster;
        });
    }

    /**
     * 獲取資源
     */
    getAsset(name) {
        return this.assets.get(name) || this.placeholders.get('default');
    }

    /**
     * 檢查資源是否存在
     */
    hasAsset(name) {
        return this.assets.has(name);
    }

    /**
     * 預載入資源列表
     */
    async preloadAssets(assetList) {
        console.log(`開始預載入 ${assetList.length} 個資源...`);
        
        const loadPromises = assetList.map(asset => {
            switch (asset.type) {
                case 'image':
                    return this.loadImage(asset.path, asset.name);
                case 'audio':
                    return this.loadAudio(asset.path, asset.name);
                default:
                    console.warn(`未知的資源類型: ${asset.type}`);
                    return Promise.resolve(null);
            }
        });

        try {
            await Promise.all(loadPromises);
            console.log('所有資源預載入完成');
        } catch (error) {
            console.error('資源預載入過程中發生錯誤:', error);
        }
    }

    /**
     * 清理資源
     */
    clearAssets() {
        this.assets.clear();
        this.loadingPromises.clear();
        console.log('資源已清理');
    }

    /**
     * 獲取資源載入進度
     */
    getLoadingProgress() {
        const totalAssets = this.assets.size + this.loadingPromises.size;
        const loadedAssets = this.assets.size;
        
        if (totalAssets === 0) return 1;
        return loadedAssets / totalAssets;
    }

    /**
     * 清理未使用的資源
     */
    cleanupUnusedAssets() {
        // 記錄清理前的資源數量
        const beforeCount = this.assets.size;
        
        // 這裡可以實作更複雜的邏輯來判斷哪些資源未使用
        // 目前只是清理載入失敗的Promise
        this.loadingPromises.clear();
        
        console.log(`資源清理完成，清理前: ${beforeCount} 個資源`);
    }

    /**
     * 獲取記憶體使用統計
     */
    getMemoryStats() {
        let totalSize = 0;
        let imageCount = 0;
        let audioCount = 0;
        
        this.assets.forEach((asset, name) => {
            if (asset instanceof HTMLImageElement) {
                imageCount++;
                // 估算圖片記憶體使用（寬 × 高 × 4 bytes per pixel）
                totalSize += (asset.width || 100) * (asset.height || 100) * 4;
            } else if (asset instanceof HTMLAudioElement) {
                audioCount++;
                // 音效檔案大小較難估算，使用固定值
                totalSize += 1024 * 1024; // 假設每個音效1MB
            }
        });
        
        return {
            totalAssets: this.assets.size,
            imageCount,
            audioCount,
            estimatedMemoryUsage: totalSize,
            loadingPromises: this.loadingPromises.size
        };
    }

    /**
     * 創建資源路徑映射
     * 根據遊戲需求定義標準的資源路徑結構
     */
    static getAssetPaths() {
        return {
            // 背景圖片 (建議尺寸: 800x600)
            backgrounds: {
                welcome: 'assets/images/backgrounds/welcome_bg.png',
                selection: 'assets/images/backgrounds/selection_bg.png',
                processing: 'assets/images/backgrounds/processing_bg.png',
                preparation: 'assets/images/backgrounds/preparation_bg.png',
                drying: 'assets/images/backgrounds/drying_bg.png',
                roasting: 'assets/images/backgrounds/roasting_bg.png',
                slicing: 'assets/images/backgrounds/slicing_bg.png',
                completion: 'assets/images/backgrounds/completion_bg.png'
            },
            
            // UI元素 (建議尺寸: 按鈕120x40, 圖標32x32)
            ui: {
                logo: 'assets/images/ui/game_logo.png',
                button_start: 'assets/images/ui/button_start.png',
                button_next: 'assets/images/ui/button_next.png',
                button_retry: 'assets/images/ui/button_retry.png',
                button_settings: 'assets/images/ui/button_settings.png',
                progress_bar: 'assets/images/ui/progress_bar.png',
                star_icon: 'assets/images/ui/star_icon.png'
            },
            
            // 鴨子相關圖片 (建議尺寸: 200x200)
            duck: {
                raw_duck: 'assets/images/duck/raw_duck.png',
                processed_duck: 'assets/images/duck/processed_duck.png',
                prepared_duck: 'assets/images/duck/prepared_duck.png',
                dried_duck: 'assets/images/duck/dried_duck.png',
                roasted_duck: 'assets/images/duck/roasted_duck.png',
                sliced_duck: 'assets/images/duck/sliced_duck.png'
            },
            
            // 工具和器具 (建議尺寸: 100x100)
            tools: {
                knife: 'assets/images/tools/knife.png',
                scale: 'assets/images/tools/scale.png',
                oven: 'assets/images/tools/oven.png',
                hook: 'assets/images/tools/hook.png',
                brush: 'assets/images/tools/brush.png'
            },
            
            // 音效檔案
            sounds: {
                background_music: 'assets/sounds/background_music.mp3',
                button_click: 'assets/sounds/button_click.wav',
                success_sound: 'assets/sounds/success.wav',
                cooking_sound: 'assets/sounds/cooking.wav',
                completion_sound: 'assets/sounds/completion.wav'
            }
        };
    }
}
// 匯出到全域作用域
window.AssetManager = AssetManager;
