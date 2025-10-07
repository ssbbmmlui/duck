/**
 * 進度管理器
 * 負責遊戲進度的追蹤、保存和載入
 */
class ProgressManager {
    constructor() {
        this.storageKey = 'beijing_duck_game_progress';
        this.currentProgress = this.getDefaultProgress();
        
        // 視覺反饋系統
        this.visualFeedback = null;
        this.onScoreChange = null;
        this.onStepComplete = null;
        this.onAchievementUnlock = null;
        
        // 載入已保存的進度
        this.loadProgress();
    }

    /**
     * 獲取預設進度
     */
    getDefaultProgress() {
        return {
            currentScene: 'welcome',
            progress: {
                selection: false,
                processing: false,
                preparation: false,
                drying: false,
                roasting: false,
                slicing: false
            },
            score: 0,
            completedSteps: [],
            settings: {
                soundEnabled: true,
                language: 'zh-TW'
            },
            statistics: {
                totalPlayTime: 0,
                gamesCompleted: 0,
                bestScore: 0,
                lastPlayDate: null
            },
            achievements: [],
            gameCompleted: false,
            completionDate: null
        };
    }

    /**
     * 保存進度到LocalStorage (已禁用)
     */
    saveProgress(gameState = null) {
        console.log('進度保存已禁用 - 每次重新整理將重新開始遊戲');
        return true;

        try {
            const progressToSave = gameState || this.currentProgress;
            progressToSave.statistics.lastPlayDate = new Date().toISOString();

            // 檢查LocalStorage可用性
            if (!this.isStorageAvailable()) {
                console.warn('LocalStorage不可用，進度無法保存');
                return false;
            }
            
            // 檢查存儲空間
            const dataString = JSON.stringify(progressToSave);
            if (dataString.length > 5000000) { // 5MB限制
                console.warn('進度資料過大，嘗試清理舊備份');
                this.cleanupOldBackups();
            }
            
            localStorage.setItem(this.storageKey, dataString);
            this.currentProgress = { ...progressToSave };
            
            console.log('遊戲進度已保存');
            return true;
        } catch (error) {
            console.error('保存進度失敗:', error);
            
            // 如果是存儲空間不足，嘗試清理
            if (error.name === 'QuotaExceededError') {
                console.log('存儲空間不足，嘗試清理舊資料');
                this.cleanupOldBackups();
                
                // 重試保存
                try {
                    const progressToSave = gameState || this.currentProgress;
                    localStorage.setItem(this.storageKey, JSON.stringify(progressToSave));
                    console.log('清理後重新保存成功');
                    return true;
                } catch (retryError) {
                    console.error('重試保存仍然失敗:', retryError);
                }
            }
            
            return false;
        }
    }

    /**
     * 從LocalStorage載入進度 (已禁用)
     */
    loadProgress() {
        console.log('進度載入已禁用 - 使用預設進度');
        this.currentProgress = this.getDefaultProgress();
        return;

        try {
            const savedProgress = localStorage.getItem(this.storageKey);

            if (savedProgress) {
                const parsedProgress = JSON.parse(savedProgress);

                // 合併預設值以確保新增的屬性存在
                this.currentProgress = {
                    ...this.getDefaultProgress(),
                    ...parsedProgress
                };
                
                console.log('遊戲進度已載入');
            } else {
                console.log('沒有找到已保存的進度，使用預設值');
            }
        } catch (error) {
            console.error('載入進度失敗:', error);
            this.currentProgress = this.getDefaultProgress();
        }
    }

    /**
     * 重置進度
     */
    resetProgress() {
        this.currentProgress = this.getDefaultProgress();
        this.saveProgress();
        console.log('遊戲進度已重置');
    }

    /**
     * 設置視覺反饋系統
     */
    setVisualFeedback(visualFeedback) {
        this.visualFeedback = visualFeedback;
    }

    /**
     * 設置事件回調
     */
    setEventCallbacks(callbacks) {
        this.onScoreChange = callbacks.onScoreChange || null;
        this.onStepComplete = callbacks.onStepComplete || null;
        this.onAchievementUnlock = callbacks.onAchievementUnlock || null;
    }

    /**
     * 完成步驟
     */
    completeStep(stepName, x = 400, y = 300) {
        if (!this.currentProgress.completedSteps.includes(stepName)) {
            this.currentProgress.completedSteps.push(stepName);
            
            // 更新場景進度
            if (this.currentProgress.progress.hasOwnProperty(stepName)) {
                this.currentProgress.progress[stepName] = true;
            }
            
            // 增加分數並創建視覺反饋
            this.addScore(100, x, y, 'bonus');
            
            // 創建完成慶祝效果
            if (this.visualFeedback) {
                this.visualFeedback.createCompletionCelebration(x, y);
                this.visualFeedback.createStarReward(x, y, 3);
            }
            
            // 觸發步驟完成回調
            if (this.onStepComplete) {
                this.onStepComplete(stepName, this.getCompletionPercentage());
            }
            
            this.saveProgress();
            console.log(`步驟完成: ${stepName}`);
        }
    }

    /**
     * 增加分數
     */
    addScore(points, x = 400, y = 300, type = 'normal') {
        const oldScore = this.currentProgress.score;
        this.currentProgress.score += points;
        
        // 更新最佳分數
        if (this.currentProgress.score > this.currentProgress.statistics.bestScore) {
            this.currentProgress.statistics.bestScore = this.currentProgress.score;
        }
        
        // 創建分數彈出效果
        if (this.visualFeedback) {
            this.visualFeedback.createScorePopup(x, y, points, type);
        }
        
        // 觸發分數變化回調
        if (this.onScoreChange) {
            this.onScoreChange(oldScore, this.currentProgress.score, points);
        }
        
        console.log(`分數增加: +${points}, 總分: ${this.currentProgress.score}`);
    }

    /**
     * 設置當前場景
     */
    setCurrentScene(sceneName) {
        this.currentProgress.currentScene = sceneName;
        this.saveProgress();
    }

    /**
     * 獲取當前進度
     */
    getCurrentProgress() {
        return { ...this.currentProgress };
    }

    /**
     * 獲取完成百分比
     */
    getCompletionPercentage() {
        const totalSteps = Object.keys(this.currentProgress.progress).length;
        const completedSteps = Object.values(this.currentProgress.progress).filter(Boolean).length;
        
        return totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
    }

    /**
     * 檢查步驟是否完成
     */
    isStepCompleted(stepName) {
        return this.currentProgress.completedSteps.includes(stepName) ||
               this.currentProgress.progress[stepName] === true;
    }

    /**
     * 檢查是否可以進入場景
     */
    canEnterScene(sceneName) {
        const sceneOrder = ['welcome', 'selection', 'processing', 'preparation', 'drying', 'roasting', 'slicing', 'completion'];
        const currentIndex = sceneOrder.indexOf(this.currentProgress.currentScene);
        const targetIndex = sceneOrder.indexOf(sceneName);
        
        // 可以進入當前場景或下一個場景
        return targetIndex <= currentIndex + 1;
    }

    /**
     * 完成遊戲
     */
    completeGame() {
        this.currentProgress.statistics.gamesCompleted++;
        this.currentProgress.currentScene = 'completion';
        
        // 標記遊戲為已完成狀態
        this.currentProgress.gameCompleted = true;
        this.currentProgress.completionDate = new Date().toISOString();
        
        // 檢查是否達成成就
        this.checkAchievements();
        
        this.saveProgress();
        console.log('遊戲完成！');
        
        return {
            finalScore: this.currentProgress.score,
            completionPercentage: this.getCompletionPercentage(),
            newAchievements: this.getLatestAchievements(),
            statistics: this.getStatistics()
        };
    }

    /**
     * 獲取最新解鎖的成就
     */
    getLatestAchievements() {
        // 返回在當前遊戲會話中解鎖的成就
        // 這裡簡化處理，實際應該追蹤會話內的新成就
        return this.currentProgress.achievements.slice(-3); // 返回最近3個成就
    }

    /**
     * 檢查遊戲是否已完成
     */
    isGameCompleted() {
        return this.currentProgress.gameCompleted === true;
    }

    /**
     * 開始新遊戲
     */
    startNewGame() {
        // 保存統計資料和成就
        const currentStats = { ...this.currentProgress.statistics };
        const currentAchievements = [...this.currentProgress.achievements];
        const currentSettings = { ...this.currentProgress.settings };
        
        // 重置遊戲進度
        this.currentProgress = this.getDefaultProgress();
        
        // 恢復統計資料、成就和設定
        this.currentProgress.statistics = currentStats;
        this.currentProgress.achievements = currentAchievements;
        this.currentProgress.settings = currentSettings;
        
        // 重置遊戲完成狀態
        this.currentProgress.gameCompleted = false;
        this.currentProgress.completionDate = null;
        
        this.saveProgress();
        console.log('開始新遊戲');
        
        return this.currentProgress;
    }

    /**
     * 檢查成就
     */
    checkAchievements() {
        const newAchievements = [];
        
        // 首次完成遊戲
        if (this.currentProgress.statistics.gamesCompleted === 1 && 
            !this.currentProgress.achievements.includes('first_completion')) {
            newAchievements.push({
                id: 'first_completion',
                name: '初次完成',
                description: '第一次完成北京烤鴨製作'
            });
        }
        
        // 高分成就
        if (this.currentProgress.score >= 1000 && 
            !this.currentProgress.achievements.includes('high_score')) {
            newAchievements.push({
                id: 'high_score',
                name: '高分達人',
                description: '獲得1000分以上'
            });
        }
        
        // 完美分數
        if (this.currentProgress.score >= 1500 && 
            !this.currentProgress.achievements.includes('perfect_score')) {
            newAchievements.push({
                id: 'perfect_score',
                name: '完美大師',
                description: '獲得1500分以上的完美分數'
            });
        }
        
        // 連續遊戲成就
        if (this.currentProgress.statistics.gamesCompleted >= 5 && 
            !this.currentProgress.achievements.includes('dedicated_player')) {
            newAchievements.push({
                id: 'dedicated_player',
                name: '專注玩家',
                description: '完成5次遊戲'
            });
        }
        
        // 添加新成就並創建視覺效果
        newAchievements.forEach(achievement => {
            this.currentProgress.achievements.push(achievement.id);
            
            // 創建成就解鎖視覺效果
            if (this.visualFeedback) {
                this.visualFeedback.createCompletionCelebration(400, 200);
                this.visualFeedback.createStarReward(400, 200, 5);
            }
            
            // 觸發成就解鎖回調
            if (this.onAchievementUnlock) {
                this.onAchievementUnlock(achievement);
            }
            
            console.log(`獲得成就: ${achievement.name} - ${achievement.description}`);
        });
        
        return newAchievements;
    }

    /**
     * 更新遊戲時間
     */
    updatePlayTime(deltaTime) {
        this.currentProgress.statistics.totalPlayTime += deltaTime;
    }

    /**
     * 更新設定
     */
    updateSettings(newSettings) {
        this.currentProgress.settings = {
            ...this.currentProgress.settings,
            ...newSettings
        };
        this.saveProgress();
    }

    /**
     * 獲取統計資料
     */
    getStatistics() {
        return { ...this.currentProgress.statistics };
    }

    /**
     * 獲取成就列表
     */
    getAchievements() {
        return [...this.currentProgress.achievements];
    }

    /**
     * 檢查LocalStorage是否可用
     */
    isStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * 匯出進度資料
     */
    exportProgress() {
        return JSON.stringify(this.currentProgress, null, 2);
    }

    /**
     * 匯入進度資料
     */
    importProgress(progressData) {
        try {
            const importedProgress = JSON.parse(progressData);
            
            // 驗證資料格式
            if (importedProgress && typeof importedProgress === 'object') {
                this.currentProgress = {
                    ...this.getDefaultProgress(),
                    ...importedProgress
                };
                this.saveProgress();
                console.log('進度資料匯入成功');
                return true;
            } else {
                throw new Error('無效的進度資料格式');
            }
        } catch (error) {
            console.error('匯入進度資料失敗:', error);
            return false;
        }
    }

    /**
     * 獲取最新解鎖的成就
     */
    getLatestAchievements() {
        // 返回在當前遊戲會話中解鎖的成就
        // 這裡簡化處理，實際應該追蹤會話內的新成就
        return this.currentProgress.achievements.slice(-3); // 返回最近3個成就
    }

    /**
     * 檢查遊戲是否已完成
     */
    isGameCompleted() {
        return this.currentProgress.gameCompleted === true;
    }

    /**
     * 開始新遊戲
     */
    startNewGame() {
        // 保存統計資料和成就
        const currentStats = { ...this.currentProgress.statistics };
        const currentAchievements = [...this.currentProgress.achievements];
        const currentSettings = { ...this.currentProgress.settings };
        
        // 重置遊戲進度
        this.currentProgress = this.getDefaultProgress();
        
        // 恢復統計資料、成就和設定
        this.currentProgress.statistics = currentStats;
        this.currentProgress.achievements = currentAchievements;
        this.currentProgress.settings = currentSettings;
        
        // 重置遊戲完成狀態
        this.currentProgress.gameCompleted = false;
        this.currentProgress.completionDate = null;
        
        this.saveProgress();
        console.log('開始新遊戲');
        
        return this.currentProgress;
    }

    /**
     * 清除所有進度資料（完全重置）
     */
    clearAllProgress() {
        try {
            localStorage.removeItem(this.storageKey);
            this.currentProgress = this.getDefaultProgress();
            console.log('所有進度資料已清除');
            return true;
        } catch (error) {
            console.error('清除進度資料失敗:', error);
            return false;
        }
    }

    /**
     * 備份當前進度
     */
    backupProgress() {
        const backupKey = `${this.storageKey}_backup_${Date.now()}`;
        try {
            localStorage.setItem(backupKey, JSON.stringify(this.currentProgress));
            console.log(`進度已備份到: ${backupKey}`);
            return backupKey;
        } catch (error) {
            console.error('備份進度失敗:', error);
            return null;
        }
    }

    /**
     * 恢復備份的進度
     */
    restoreBackup(backupKey) {
        try {
            const backupData = localStorage.getItem(backupKey);
            if (backupData) {
                const parsedData = JSON.parse(backupData);
                this.currentProgress = {
                    ...this.getDefaultProgress(),
                    ...parsedData
                };
                this.saveProgress();
                console.log('進度已從備份恢復');
                return true;
            } else {
                console.error('找不到指定的備份');
                return false;
            }
        } catch (error) {
            console.error('恢復備份失敗:', error);
            return false;
        }
    }

    /**
     * 獲取所有備份列表
     */
    getBackupList() {
        const backups = [];
        const prefix = `${this.storageKey}_backup_`;
        
        try {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(prefix)) {
                    const timestamp = key.replace(prefix, '');
                    const date = new Date(parseInt(timestamp));
                    backups.push({
                        key: key,
                        date: date.toLocaleString(),
                        timestamp: timestamp
                    });
                }
            }
            
            // 按時間排序（最新的在前）
            backups.sort((a, b) => parseInt(b.timestamp) - parseInt(a.timestamp));
            return backups;
        } catch (error) {
            console.error('獲取備份列表失敗:', error);
            return [];
        }
    }

    /**
     * 清理舊備份
     */
    cleanupOldBackups() {
        try {
            const backups = this.getBackupList();
            const maxBackups = 5; // 最多保留5個備份
            
            // 如果備份數量超過限制，刪除最舊的
            if (backups.length > maxBackups) {
                const backupsToDelete = backups.slice(maxBackups);
                backupsToDelete.forEach(backup => {
                    localStorage.removeItem(backup.key);
                    console.log(`已刪除舊備份: ${backup.key}`);
                });
            }
            
            // 清理超過30天的備份
            const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
            backups.forEach(backup => {
                if (parseInt(backup.timestamp) < thirtyDaysAgo) {
                    localStorage.removeItem(backup.key);
                    console.log(`已刪除過期備份: ${backup.key}`);
                }
            });
            
        } catch (error) {
            console.error('清理備份失敗:', error);
        }
    }

    /**
     * 獲取存儲使用情況
     */
    getStorageUsage() {
        try {
            let totalSize = 0;
            let gameDataSize = 0;
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key) {
                    const value = localStorage.getItem(key);
                    const size = new Blob([value]).size;
                    totalSize += size;
                    
                    if (key.startsWith(this.storageKey)) {
                        gameDataSize += size;
                    }
                }
            }
            
            return {
                totalSize: totalSize,
                gameDataSize: gameDataSize,
                totalSizeFormatted: this.formatBytes(totalSize),
                gameDataSizeFormatted: this.formatBytes(gameDataSize)
            };
        } catch (error) {
            console.error('獲取存儲使用情況失敗:', error);
            return null;
        }
    }

    /**
     * 格式化字節大小
     */
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}
// 匯出到全域作用域
window.ProgressManager = ProgressManager;
