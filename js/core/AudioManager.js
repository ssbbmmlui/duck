/**
 * 音效管理器
 * 負責遊戲音效和背景音樂的播放控制
 */
class AudioManager {
    constructor() {
        this.sounds = new Map();
        this.backgroundMusic = null;
        this.soundEnabled = true;
        this.musicVolume = 0.7;
        this.soundVolume = 0.8;
        this.isMuted = false;
    }

    /**
     * 載入音效
     */
    async loadSound(name, path) {
        try {
            const audio = new Audio(path);
            audio.preload = 'auto';
            
            return new Promise((resolve, reject) => {
                audio.oncanplaythrough = () => {
                    this.sounds.set(name, audio);
                    console.log(`音效載入成功: ${name}`);
                    resolve(audio);
                };
                
                audio.onerror = () => {
                    console.warn(`音效載入失敗: ${name} (${path})`);
                    resolve(null);
                };
            });
        } catch (error) {
            console.error(`載入音效時發生錯誤: ${name}`, error);
            return null;
        }
    }

    /**
     * 播放音效
     */
    playSound(name, volume = null) {
        if (!this.soundEnabled || this.isMuted) return;

        const sound = this.sounds.get(name);
        if (sound) {
            try {
                sound.currentTime = 0;
                sound.volume = volume !== null ? volume : this.soundVolume;
                sound.play().catch(error => {
                    console.warn(`播放音效失敗: ${name}`, error);
                });
            } catch (error) {
                console.warn(`播放音效時發生錯誤: ${name}`, error);
            }
        } else {
            console.warn(`找不到音效: ${name}`);
        }
    }

    /**
     * 播放背景音樂
     */
    playBackgroundMusic(name, loop = true) {
        if (!this.soundEnabled || this.isMuted) return;

        const music = this.sounds.get(name);
        if (music) {
            try {
                if (this.backgroundMusic && this.backgroundMusic !== music) {
                    this.stopBackgroundMusic();
                }
                
                this.backgroundMusic = music;
                music.loop = loop;
                music.volume = this.musicVolume;
                music.play().catch(error => {
                    console.warn(`播放背景音樂失敗: ${name}`, error);
                });
            } catch (error) {
                console.warn(`播放背景音樂時發生錯誤: ${name}`, error);
            }
        } else {
            console.warn(`找不到背景音樂: ${name}`);
        }
    }

    /**
     * 停止背景音樂
     */
    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            try {
                this.backgroundMusic.pause();
                this.backgroundMusic.currentTime = 0;
                this.backgroundMusic = null;
            } catch (error) {
                console.warn('停止背景音樂時發生錯誤', error);
            }
        }
    }

    /**
     * 暫停背景音樂
     */
    pauseBackgroundMusic() {
        if (this.backgroundMusic) {
            try {
                this.backgroundMusic.pause();
            } catch (error) {
                console.warn('暫停背景音樂時發生錯誤', error);
            }
        }
    }

    /**
     * 恢復背景音樂
     */
    resumeBackgroundMusic() {
        if (this.backgroundMusic && this.soundEnabled && !this.isMuted) {
            try {
                this.backgroundMusic.play().catch(error => {
                    console.warn('恢復背景音樂失敗', error);
                });
            } catch (error) {
                console.warn('恢復背景音樂時發生錯誤', error);
            }
        }
    }

    /**
     * 設置音效開關
     */
    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
        
        if (!enabled) {
            this.stopBackgroundMusic();
        }
        
        console.log(`音效${enabled ? '開啟' : '關閉'}`);
    }

    /**
     * 設置靜音
     */
    setMuted(muted) {
        this.isMuted = muted;
        
        if (muted) {
            this.pauseBackgroundMusic();
        } else if (this.soundEnabled) {
            this.resumeBackgroundMusic();
        }
        
        console.log(`遊戲${muted ? '靜音' : '取消靜音'}`);
    }

    /**
     * 設置音樂音量
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        
        if (this.backgroundMusic) {
            this.backgroundMusic.volume = this.musicVolume;
        }
    }

    /**
     * 設置音效音量
     */
    setSoundVolume(volume) {
        this.soundVolume = Math.max(0, Math.min(1, volume));
    }

    /**
     * 獲取音效狀態
     */
    getSoundEnabled() {
        return this.soundEnabled;
    }

    /**
     * 獲取靜音狀態
     */
    getMuted() {
        return this.isMuted;
    }

    /**
     * 預載入所有音效
     */
    async preloadSounds() {
        try {
            const soundPaths = AssetManager.getAssetPaths().sounds;
            const loadPromises = [];

            for (const [name, path] of Object.entries(soundPaths)) {
                loadPromises.push(this.loadSound(name, path));
            }

            // 使用 allSettled 而不是 all，這樣即使部分音效載入失敗也不會影響其他音效
            const results = await Promise.allSettled(loadPromises);
            
            let successCount = 0;
            let failCount = 0;
            
            results.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value) {
                    successCount++;
                } else {
                    failCount++;
                }
            });
            
            console.log(`音效預載入完成: ${successCount} 個成功, ${failCount} 個失敗`);
            
            if (failCount > 0) {
                console.warn('部分音效檔案載入失敗，遊戲將繼續運行但可能沒有音效');
            }
        } catch (error) {
            console.warn('音效預載入過程中發生錯誤，遊戲將以靜音模式運行:', error);
        }
    }

    /**
     * 清理音效資源
     */
    cleanup() {
        this.stopBackgroundMusic();
        this.sounds.clear();
        console.log('音效資源已清理');
    }

    /**
     * 清理未使用的音效
     */
    cleanupUnusedSounds() {
        const beforeCount = this.sounds.size;
        
        // 清理已結束的音效
        this.sounds.forEach((sound, name) => {
            if (sound && sound.ended) {
                this.sounds.delete(name);
                console.log(`清理已結束的音效: ${name}`);
            }
        });
        
        const afterCount = this.sounds.size;
        if (beforeCount > afterCount) {
            console.log(`音效清理完成，清理了 ${beforeCount - afterCount} 個音效`);
        }
    }

    /**
     * 獲取音效統計資訊
     */
    getAudioStats() {
        let playingSounds = 0;
        let loadedSounds = 0;
        
        this.sounds.forEach(sound => {
            if (sound) {
                loadedSounds++;
                if (!sound.paused && !sound.ended) {
                    playingSounds++;
                }
            }
        });
        
        return {
            totalSounds: this.sounds.size,
            loadedSounds,
            playingSounds,
            backgroundMusicPlaying: this.backgroundMusic && !this.backgroundMusic.paused,
            soundEnabled: this.soundEnabled,
            isMuted: this.isMuted
        };
    }
}