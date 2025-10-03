/**
 * 簡單的測試框架
 * 用於北京烤鴨遊戲的自動化測試
 */
class TestFramework {
    constructor() {
        this.testSuites = new Map();
        this.currentSuite = null;
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            pending: 0
        };
        this.isRunning = false;
        this.onProgress = null;
        this.onComplete = null;
    }

    /**
     * 創建測試套件
     */
    describe(suiteName, setupFunction) {
        const suite = new TestSuite(suiteName);
        this.testSuites.set(suiteName, suite);
        this.currentSuite = suite;
        
        if (setupFunction) {
            setupFunction();
        }
        
        this.currentSuite = null;
        return suite;
    }

    /**
     * 創建測試案例
     */
    it(testName, testFunction) {
        if (!this.currentSuite) {
            throw new Error('測試案例必須在測試套件內定義');
        }
        
        const testCase = new TestCase(testName, testFunction);
        this.currentSuite.addTest(testCase);
        return testCase;
    }

    /**
     * 設置測試前置條件
     */
    beforeEach(setupFunction) {
        if (!this.currentSuite) {
            throw new Error('beforeEach必須在測試套件內定義');
        }
        
        this.currentSuite.beforeEach = setupFunction;
    }

    /**
     * 設置測試後置清理
     */
    afterEach(cleanupFunction) {
        if (!this.currentSuite) {
            throw new Error('afterEach必須在測試套件內定義');
        }
        
        this.currentSuite.afterEach = cleanupFunction;
    }

    /**
     * 執行所有測試
     */
    async runAllTests() {
        if (this.isRunning) {
            console.warn('測試已在執行中');
            return;
        }

        this.isRunning = true;
        this.resetResults();
        
        console.log('開始執行所有測試...');
        
        for (const [suiteName, suite] of this.testSuites) {
            console.log(`\n執行測試套件: ${suiteName}`);
            await this.runTestSuite(suite);
        }
        
        this.isRunning = false;
        
        console.log('\n測試執行完成');
        console.log(`總計: ${this.results.total}, 通過: ${this.results.passed}, 失敗: ${this.results.failed}, 待定: ${this.results.pending}`);
        
        if (this.onComplete) {
            this.onComplete(this.results);
        }
        
        return this.results;
    }

    /**
     * 執行特定測試套件
     */
    async runTestSuite(suite) {
        console.log(`開始執行測試套件: ${suite.name}`);
        
        for (const testCase of suite.tests) {
            await this.runTestCase(testCase, suite);
        }
        
        console.log(`測試套件完成: ${suite.name}`);
    }

    /**
     * 執行單個測試案例
     */
    async runTestCase(testCase, suite) {
        this.results.total++;
        
        try {
            // 執行前置設置
            if (suite.beforeEach) {
                await suite.beforeEach();
            }
            
            // 執行測試
            console.log(`  執行測試: ${testCase.name}`);
            await testCase.run();
            
            // 測試通過
            testCase.status = 'passed';
            this.results.passed++;
            console.log(`  ✓ ${testCase.name}`);
            
        } catch (error) {
            // 測試失敗
            testCase.status = 'failed';
            testCase.error = error;
            this.results.failed++;
            console.error(`  ✗ ${testCase.name}: ${error.message}`);
            
        } finally {
            // 執行後置清理
            try {
                if (suite.afterEach) {
                    await suite.afterEach();
                }
            } catch (cleanupError) {
                console.error(`清理錯誤: ${cleanupError.message}`);
            }
        }
        
        // 更新進度
        if (this.onProgress) {
            this.onProgress(this.results);
        }
    }

    /**
     * 執行特定類型的測試
     */
    async runTestsByType(type) {
        const filteredSuites = Array.from(this.testSuites.values())
            .filter(suite => suite.type === type);
        
        if (filteredSuites.length === 0) {
            console.warn(`找不到類型為 ${type} 的測試套件`);
            return;
        }
        
        this.isRunning = true;
        this.resetResults();
        
        for (const suite of filteredSuites) {
            await this.runTestSuite(suite);
        }
        
        this.isRunning = false;
        
        if (this.onComplete) {
            this.onComplete(this.results);
        }
        
        return this.results;
    }

    /**
     * 重置測試結果
     */
    resetResults() {
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            pending: 0
        };
        
        // 重置所有測試案例狀態
        for (const suite of this.testSuites.values()) {
            for (const testCase of suite.tests) {
                testCase.status = 'pending';
                testCase.error = null;
            }
        }
    }

    /**
     * 獲取測試結果
     */
    getResults() {
        return {
            ...this.results,
            suites: Array.from(this.testSuites.values()).map(suite => ({
                name: suite.name,
                type: suite.type,
                tests: suite.tests.map(test => ({
                    name: test.name,
                    status: test.status,
                    error: test.error ? test.error.message : null
                }))
            }))
        };
    }
}

/**
 * 測試套件類別
 */
class TestSuite {
    constructor(name, type = 'unit') {
        this.name = name;
        this.type = type;
        this.tests = [];
        this.beforeEach = null;
        this.afterEach = null;
    }

    addTest(testCase) {
        this.tests.push(testCase);
    }
}

/**
 * 測試案例類別
 */
class TestCase {
    constructor(name, testFunction) {
        this.name = name;
        this.testFunction = testFunction;
        this.status = 'pending';
        this.error = null;
    }

    async run() {
        if (this.testFunction) {
            await this.testFunction();
        }
    }
}

/**
 * 斷言函數
 */
class Assert {
    static isTrue(condition, message = '條件應該為真') {
        if (!condition) {
            throw new Error(message);
        }
    }

    static isFalse(condition, message = '條件應該為假') {
        if (condition) {
            throw new Error(message);
        }
    }

    static equals(actual, expected, message = '值應該相等') {
        if (actual !== expected) {
            throw new Error(`${message}. 期望: ${expected}, 實際: ${actual}`);
        }
    }

    static notEquals(actual, expected, message = '值應該不相等') {
        if (actual === expected) {
            throw new Error(`${message}. 值不應該等於: ${expected}`);
        }
    }

    static isNull(value, message = '值應該為null') {
        if (value !== null) {
            throw new Error(`${message}. 實際值: ${value}`);
        }
    }

    static isNotNull(value, message = '值不應該為null') {
        if (value === null) {
            throw new Error(message);
        }
    }

    static isUndefined(value, message = '值應該為undefined') {
        if (value !== undefined) {
            throw new Error(`${message}. 實際值: ${value}`);
        }
    }

    static isNotUndefined(value, message = '值不應該為undefined') {
        if (value === undefined) {
            throw new Error(message);
        }
    }

    static isInstanceOf(object, constructor, message = '物件應該是指定類型的實例') {
        if (!(object instanceof constructor)) {
            throw new Error(`${message}. 期望類型: ${constructor.name}, 實際類型: ${typeof object}`);
        }
    }

    static throws(func, expectedError, message = '函數應該拋出錯誤') {
        let threwError = false;
        let actualError = null;
        
        try {
            func();
        } catch (error) {
            threwError = true;
            actualError = error;
        }
        
        if (!threwError) {
            throw new Error(`${message}. 函數沒有拋出錯誤`);
        }
        
        if (expectedError && !(actualError instanceof expectedError)) {
            throw new Error(`${message}. 期望錯誤類型: ${expectedError.name}, 實際錯誤類型: ${actualError.constructor.name}`);
        }
    }

    static async throwsAsync(asyncFunc, expectedError, message = '異步函數應該拋出錯誤') {
        let threwError = false;
        let actualError = null;
        
        try {
            await asyncFunc();
        } catch (error) {
            threwError = true;
            actualError = error;
        }
        
        if (!threwError) {
            throw new Error(`${message}. 異步函數沒有拋出錯誤`);
        }
        
        if (expectedError && !(actualError instanceof expectedError)) {
            throw new Error(`${message}. 期望錯誤類型: ${expectedError.name}, 實際錯誤類型: ${actualError.constructor.name}`);
        }
    }

    static arrayEquals(actual, expected, message = '陣列應該相等') {
        if (!Array.isArray(actual) || !Array.isArray(expected)) {
            throw new Error(`${message}. 兩個值都必須是陣列`);
        }
        
        if (actual.length !== expected.length) {
            throw new Error(`${message}. 陣列長度不同. 期望: ${expected.length}, 實際: ${actual.length}`);
        }
        
        for (let i = 0; i < actual.length; i++) {
            if (actual[i] !== expected[i]) {
                throw new Error(`${message}. 索引 ${i} 處的值不同. 期望: ${expected[i]}, 實際: ${actual[i]}`);
            }
        }
    }

    static objectEquals(actual, expected, message = '物件應該相等') {
        const actualKeys = Object.keys(actual).sort();
        const expectedKeys = Object.keys(expected).sort();
        
        if (actualKeys.length !== expectedKeys.length) {
            throw new Error(`${message}. 物件屬性數量不同`);
        }
        
        for (let i = 0; i < actualKeys.length; i++) {
            if (actualKeys[i] !== expectedKeys[i]) {
                throw new Error(`${message}. 物件屬性不同`);
            }
            
            if (actual[actualKeys[i]] !== expected[expectedKeys[i]]) {
                throw new Error(`${message}. 屬性 ${actualKeys[i]} 的值不同`);
            }
        }
    }
}

// 創建全域測試框架實例
const testFramework = new TestFramework();

// 導出全域函數
window.describe = (name, func) => testFramework.describe(name, func);
window.it = (name, func) => testFramework.it(name, func);
window.beforeEach = (func) => testFramework.beforeEach(func);
window.afterEach = (func) => testFramework.afterEach(func);
window.assert = Assert;
window.testFramework = testFramework;