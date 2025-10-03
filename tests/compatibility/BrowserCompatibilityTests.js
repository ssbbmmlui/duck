/**
 * 瀏覽器相容性測試
 * 測試不同瀏覽器的功能相容性
 */

describe('瀏覽器相容性測試', function() {
    let compatibilityTester;

    beforeEach(function() {
        compatibilityTester = new BrowserCompatibilityTester();
    });

    it('應該能夠檢測Canvas支援', function() {
        const canvasSupport = compatibilityTester.testCanvasSupport();
        
        assert.isTrue(canvasSupport.supported, 'Canvas應該被支援');
        assert.isNotNull(canvasSupport.context2d, '2D上下文應該可用');
        
        if (canvasSupport.webgl) {
            console.log('WebGL支援已檢測到');
        } else {
            console.warn('WebGL不被支援，將使用2D渲染');
        }
    });

    it('應該能夠檢測HTML5 Audio支援', function() {
        const audioSupport = compatibilityTester.testAudioSupport();
        
        assert.isTrue(audioSupport.supported, 'HTML5 Audio應該被支援');
        
        if (audioSupport.formats.mp3) {
            console.log('MP3格式支援已檢測到');
        }
        if (audioSupport.formats.ogg) {
            console.log('OGG格式支援已檢測到');
        }
        if (audioSupport.formats.wav) {
            console.log('WAV格式支援已檢測到');
        }
    });

    it('應該能夠檢測LocalStorage支援', function() {
        const storageSupport = compatibilityTester.testLocalStorageSupport();
        
        assert.isTrue(storageSupport.supported, 'LocalStorage應該被支援');
        assert.isTrue(storageSupport.writable, 'LocalStorage應該可寫入');
        assert.isTrue(storageSupport.readable, 'LocalStorage應該可讀取');
    });

    it('應該能夠檢測JavaScript ES6功能', function() {
        const es6Support = compatibilityTester.testES6Support();
        
        assert.isTrue(es6Support.arrowFunctions, '箭頭函數應該被支援');
        assert.isTrue(es6Support.letConst, 'let/const應該被支援');
        assert.isTrue(es6Support.classes, 'ES6類別應該被支援');
        assert.isTrue(es6Support.promises, 'Promise應該被支援');
        
        if (es6Support.asyncAwait) {
            console.log('async/await支援已檢測到');
        } else {
            console.warn('async/await不被支援，將使用Promise');
        }
    });

    it('應該能夠檢測觸控事件支援', function() {
        const touchSupport = compatibilityTester.testTouchSupport();
        
        if (touchSupport.supported) {
            console.log('觸控事件支援已檢測到');
            assert.isTrue(touchSupport.touchstart, 'touchstart事件應該被支援');
            assert.isTrue(touchSupport.touchmove, 'touchmove事件應該被支援');
            assert.isTrue(touchSupport.touchend, 'touchend事件應該被支援');
        } else {
            console.log('觸控事件不被支援（桌面環境）');
        }
    });

    it('應該能夠檢測RequestAnimationFrame支援', function() {
        const rafSupport = compatibilityTester.testRequestAnimationFrameSupport();
        
        assert.isTrue(rafSupport.supported, 'RequestAnimationFrame應該被支援');
        
        if (rafSupport.prefixed) {
            console.warn('使用前綴版本的RequestAnimationFrame');
        }
    });

    it('應該能夠檢測CSS3功能支援', function() {
        const css3Support = compatibilityTester.testCSS3Support();
        
        assert.isTrue(css3Support.transitions, 'CSS Transitions應該被支援');
        assert.isTrue(css3Support.transforms, 'CSS Transforms應該被支援');
        
        if (css3Support.animations) {
            console.log('CSS Animations支援已檢測到');
        }
        if (css3Support.flexbox) {
            console.log('Flexbox支援已檢測到');
        }
    });

    it('應該能夠檢測字體支援', function() {
        const fontSupport = compatibilityTester.testFontSupport();
        
        assert.isTrue(fontSupport.microsoftJhengHei, 'Microsoft JhengHei字體應該被支援');
        
        if (!fontSupport.microsoftJhengHei) {
            console.warn('Microsoft JhengHei字體不可用，將使用備用字體');
        }
    });

    it('應該能夠檢測效能特性', function() {
        const performanceSupport = compatibilityTester.testPerformanceSupport();
        
        if (performanceSupport.performanceNow) {
            console.log('performance.now()支援已檢測到');
        } else {
            console.warn('performance.now()不被支援，將使用Date.now()');
        }
        
        if (performanceSupport.memoryInfo) {
            console.log('記憶體資訊支援已檢測到');
        }
        
        if (performanceSupport.hardwareConcurrency) {
            console.log(`CPU核心數: ${navigator.hardwareConcurrency}`);
        }
    });

    it('應該能夠生成相容性報告', function() {
        const report = compatibilityTester.generateCompatibilityReport();
        
        assert.isNotNull(report, '相容性報告應該被生成');
        assert.isTrue(report.overall.compatible, '整體相容性應該通過');
        assert.isTrue(report.overall.score >= 0.7, '相容性分數應該至少70%');
        
        console.log('相容性報告:', JSON.stringify(report, null, 2));
    });
});

/**
 * 瀏覽器相容性測試器
 */
class BrowserCompatibilityTester {
    constructor() {
        this.testResults = {};
    }

    /**
     * 測試Canvas支援
     */
    testCanvasSupport() {
        const result = {
            supported: false,
            context2d: false,
            webgl: false,
            imageData: false
        };

        try {
            const canvas = document.createElement('canvas');
            result.supported = !!(canvas.getContext);
            
            if (result.supported) {
                const ctx2d = canvas.getContext('2d');
                result.context2d = !!ctx2d;
                
                if (ctx2d) {
                    // 測試ImageData支援
                    try {
                        const imageData = ctx2d.createImageData(1, 1);
                        result.imageData = !!imageData;
                    } catch (e) {
                        result.imageData = false;
                    }
                }
                
                // 測試WebGL支援
                try {
                    const webglCtx = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                    result.webgl = !!webglCtx;
                } catch (e) {
                    result.webgl = false;
                }
            }
        } catch (e) {
            result.supported = false;
        }

        this.testResults.canvas = result;
        return result;
    }

    /**
     * 測試Audio支援
     */
    testAudioSupport() {
        const result = {
            supported: false,
            formats: {
                mp3: false,
                ogg: false,
                wav: false,
                aac: false
            },
            webAudio: false
        };

        try {
            const audio = new Audio();
            result.supported = !!(audio.canPlayType);
            
            if (result.supported) {
                result.formats.mp3 = !!(audio.canPlayType('audio/mpeg'));
                result.formats.ogg = !!(audio.canPlayType('audio/ogg'));
                result.formats.wav = !!(audio.canPlayType('audio/wav'));
                result.formats.aac = !!(audio.canPlayType('audio/aac'));
            }
            
            // 測試Web Audio API
            result.webAudio = !!(window.AudioContext || window.webkitAudioContext);
        } catch (e) {
            result.supported = false;
        }

        this.testResults.audio = result;
        return result;
    }

    /**
     * 測試LocalStorage支援
     */
    testLocalStorageSupport() {
        const result = {
            supported: false,
            writable: false,
            readable: false,
            quota: 0
        };

        try {
            result.supported = !!(window.localStorage);
            
            if (result.supported) {
                // 測試寫入
                const testKey = 'compatibilityTest';
                const testValue = 'test';
                
                localStorage.setItem(testKey, testValue);
                result.writable = true;
                
                // 測試讀取
                const retrievedValue = localStorage.getItem(testKey);
                result.readable = (retrievedValue === testValue);
                
                // 清理測試資料
                localStorage.removeItem(testKey);
                
                // 估算配額
                try {
                    let quota = 0;
                    const testData = '0123456789';
                    let testString = '';
                    
                    while (quota < 10 * 1024 * 1024) { // 最多測試10MB
                        try {
                            testString += testData;
                            localStorage.setItem('quotaTest', testString);
                            quota = testString.length;
                        } catch (e) {
                            break;
                        }
                    }
                    
                    localStorage.removeItem('quotaTest');
                    result.quota = quota;
                } catch (e) {
                    result.quota = 0;
                }
            }
        } catch (e) {
            result.supported = false;
        }

        this.testResults.localStorage = result;
        return result;
    }

    /**
     * 測試ES6支援
     */
    testES6Support() {
        const result = {
            arrowFunctions: false,
            letConst: false,
            classes: false,
            promises: false,
            asyncAwait: false,
            destructuring: false,
            templateLiterals: false
        };

        try {
            // 測試箭頭函數
            eval('(() => {})');
            result.arrowFunctions = true;
        } catch (e) {
            result.arrowFunctions = false;
        }

        try {
            // 測試let/const
            eval('let x = 1; const y = 2;');
            result.letConst = true;
        } catch (e) {
            result.letConst = false;
        }

        try {
            // 測試類別
            eval('class TestClass {}');
            result.classes = true;
        } catch (e) {
            result.classes = false;
        }

        try {
            // 測試Promise
            result.promises = !!(window.Promise);
        } catch (e) {
            result.promises = false;
        }

        try {
            // 測試async/await
            eval('async function test() { await Promise.resolve(); }');
            result.asyncAwait = true;
        } catch (e) {
            result.asyncAwait = false;
        }

        try {
            // 測試解構賦值
            eval('const {a} = {a: 1}; const [b] = [2];');
            result.destructuring = true;
        } catch (e) {
            result.destructuring = false;
        }

        try {
            // 測試模板字面量
            eval('`template ${1} literal`');
            result.templateLiterals = true;
        } catch (e) {
            result.templateLiterals = false;
        }

        this.testResults.es6 = result;
        return result;
    }

    /**
     * 測試觸控支援
     */
    testTouchSupport() {
        const result = {
            supported: false,
            touchstart: false,
            touchmove: false,
            touchend: false,
            multiTouch: false
        };

        try {
            result.supported = !!(('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
            
            if (result.supported) {
                result.touchstart = !!('ontouchstart' in window);
                result.touchmove = !!('ontouchmove' in window);
                result.touchend = !!('ontouchend' in window);
                result.multiTouch = navigator.maxTouchPoints > 1;
            }
        } catch (e) {
            result.supported = false;
        }

        this.testResults.touch = result;
        return result;
    }

    /**
     * 測試RequestAnimationFrame支援
     */
    testRequestAnimationFrameSupport() {
        const result = {
            supported: false,
            prefixed: false,
            method: null
        };

        try {
            if (window.requestAnimationFrame) {
                result.supported = true;
                result.method = 'requestAnimationFrame';
            } else if (window.webkitRequestAnimationFrame) {
                result.supported = true;
                result.prefixed = true;
                result.method = 'webkitRequestAnimationFrame';
            } else if (window.mozRequestAnimationFrame) {
                result.supported = true;
                result.prefixed = true;
                result.method = 'mozRequestAnimationFrame';
            } else if (window.msRequestAnimationFrame) {
                result.supported = true;
                result.prefixed = true;
                result.method = 'msRequestAnimationFrame';
            }
        } catch (e) {
            result.supported = false;
        }

        this.testResults.requestAnimationFrame = result;
        return result;
    }

    /**
     * 測試CSS3支援
     */
    testCSS3Support() {
        const result = {
            transitions: false,
            transforms: false,
            animations: false,
            flexbox: false,
            grid: false
        };

        try {
            const testElement = document.createElement('div');
            const style = testElement.style;

            // 測試CSS Transitions
            result.transitions = !!(style.transition !== undefined || 
                                   style.webkitTransition !== undefined ||
                                   style.mozTransition !== undefined);

            // 測試CSS Transforms
            result.transforms = !!(style.transform !== undefined ||
                                  style.webkitTransform !== undefined ||
                                  style.mozTransform !== undefined);

            // 測試CSS Animations
            result.animations = !!(style.animation !== undefined ||
                                  style.webkitAnimation !== undefined ||
                                  style.mozAnimation !== undefined);

            // 測試Flexbox
            result.flexbox = !!(style.flexWrap !== undefined ||
                               style.webkitFlexWrap !== undefined);

            // 測試Grid
            result.grid = !!(style.gridTemplateColumns !== undefined);
        } catch (e) {
            // 所有測試失敗
        }

        this.testResults.css3 = result;
        return result;
    }

    /**
     * 測試字體支援
     */
    testFontSupport() {
        const result = {
            microsoftJhengHei: false,
            arial: false,
            helvetica: false,
            sansSerif: false
        };

        try {
            const testString = '繁體中文測試';
            const testSize = '72px';
            
            // 創建測試元素
            const testElement = document.createElement('div');
            testElement.style.position = 'absolute';
            testElement.style.left = '-9999px';
            testElement.style.top = '-9999px';
            testElement.style.fontSize = testSize;
            testElement.style.fontFamily = 'monospace';
            testElement.textContent = testString;
            
            document.body.appendChild(testElement);
            const baselineWidth = testElement.offsetWidth;
            const baselineHeight = testElement.offsetHeight;
            
            // 測試Microsoft JhengHei
            testElement.style.fontFamily = 'Microsoft JhengHei, monospace';
            result.microsoftJhengHei = (testElement.offsetWidth !== baselineWidth || 
                                       testElement.offsetHeight !== baselineHeight);
            
            // 測試Arial
            testElement.style.fontFamily = 'Arial, monospace';
            result.arial = (testElement.offsetWidth !== baselineWidth || 
                           testElement.offsetHeight !== baselineHeight);
            
            // 測試Helvetica
            testElement.style.fontFamily = 'Helvetica, monospace';
            result.helvetica = (testElement.offsetWidth !== baselineWidth || 
                               testElement.offsetHeight !== baselineHeight);
            
            // 測試sans-serif
            testElement.style.fontFamily = 'sans-serif';
            result.sansSerif = true; // sans-serif應該總是可用
            
            document.body.removeChild(testElement);
        } catch (e) {
            // 測試失敗，假設基本字體可用
            result.sansSerif = true;
        }

        this.testResults.fonts = result;
        return result;
    }

    /**
     * 測試效能支援
     */
    testPerformanceSupport() {
        const result = {
            performanceNow: false,
            memoryInfo: false,
            hardwareConcurrency: false,
            timing: false
        };

        try {
            result.performanceNow = !!(window.performance && window.performance.now);
            result.memoryInfo = !!(window.performance && window.performance.memory);
            result.hardwareConcurrency = !!(navigator.hardwareConcurrency);
            result.timing = !!(window.performance && window.performance.timing);
        } catch (e) {
            // 測試失敗
        }

        this.testResults.performance = result;
        return result;
    }

    /**
     * 生成相容性報告
     */
    generateCompatibilityReport() {
        // 執行所有測試
        this.testCanvasSupport();
        this.testAudioSupport();
        this.testLocalStorageSupport();
        this.testES6Support();
        this.testTouchSupport();
        this.testRequestAnimationFrameSupport();
        this.testCSS3Support();
        this.testFontSupport();
        this.testPerformanceSupport();

        const report = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            results: this.testResults,
            overall: {
                compatible: true,
                score: 0,
                criticalIssues: [],
                warnings: [],
                recommendations: []
            }
        };

        // 計算相容性分數
        let totalTests = 0;
        let passedTests = 0;

        // 必要功能檢查
        const criticalFeatures = [
            { test: 'canvas.supported', weight: 3, name: 'Canvas支援' },
            { test: 'localStorage.supported', weight: 2, name: 'LocalStorage支援' },
            { test: 'requestAnimationFrame.supported', weight: 2, name: 'RequestAnimationFrame支援' },
            { test: 'es6.classes', weight: 2, name: 'ES6類別支援' }
        ];

        criticalFeatures.forEach(feature => {
            totalTests += feature.weight;
            const value = this.getNestedValue(this.testResults, feature.test);
            if (value) {
                passedTests += feature.weight;
            } else {
                report.overall.criticalIssues.push(`缺少必要功能: ${feature.name}`);
                report.overall.compatible = false;
            }
        });

        // 可選功能檢查
        const optionalFeatures = [
            { test: 'audio.supported', weight: 1, name: 'Audio支援' },
            { test: 'touch.supported', weight: 1, name: '觸控支援' },
            { test: 'css3.transitions', weight: 1, name: 'CSS Transitions' },
            { test: 'fonts.microsoftJhengHei', weight: 1, name: 'Microsoft JhengHei字體' }
        ];

        optionalFeatures.forEach(feature => {
            totalTests += feature.weight;
            const value = this.getNestedValue(this.testResults, feature.test);
            if (value) {
                passedTests += feature.weight;
            } else {
                report.overall.warnings.push(`缺少可選功能: ${feature.name}`);
            }
        });

        report.overall.score = passedTests / totalTests;

        // 生成建議
        if (!this.testResults.audio.supported) {
            report.overall.recommendations.push('考慮提供靜音模式或音效替代方案');
        }
        if (!this.testResults.touch.supported) {
            report.overall.recommendations.push('確保滑鼠操作在桌面環境下正常工作');
        }
        if (!this.testResults.fonts.microsoftJhengHei) {
            report.overall.recommendations.push('提供備用中文字體或使用Web字體');
        }

        return report;
    }

    /**
     * 獲取嵌套物件值
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current && current[key], obj);
    }
}