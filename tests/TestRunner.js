/**
 * 測試執行器
 * 負責執行測試並顯示結果
 */

class TestRunner {
    constructor() {
        this.testFramework = window.testFramework;
        this.resultsContainer = document.getElementById('testResults');
        this.summaryContainer = document.getElementById('testSummary');
        this.progressBar = document.getElementById('progressBar');
        this.summaryStats = document.getElementById('summaryStats');
        this.consoleOutput = document.getElementById('consoleOutput');
        this.consoleContent = document.getElementById('consoleContent');
        
        this.setupConsoleCapture();
        this.setupTestFrameworkCallbacks();
    }

    /**
     * 設置控制台輸出捕獲
     */
    setupConsoleCapture() {
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        
        console.log = (...args) => {
            this.addConsoleOutput('log', args.join(' '));
            originalLog.apply(console, args);
        };
        
        console.error = (...args) => {
            this.addConsoleOutput('error', args.join(' '));
            originalError.apply(console, args);
        };
        
        console.warn = (...args) => {
            this.addConsoleOutput('warn', args.join(' '));
            originalWarn.apply(console, args);
        };
    }

    /**
     * 添加控制台輸出
     */
    addConsoleOutput(type, message) {
        const timestamp = new Date().toLocaleTimeString();
        const colorClass = type === 'error' ? 'color: #ff6b6b' : 
                          type === 'warn' ? 'color: #ffd93d' : 'color: #00ff00';
        
        this.consoleContent.innerHTML += `<div style="${colorClass}">[${timestamp}] ${type.toUpperCase()}: ${message}</div>`;
        this.consoleContent.scrollTop = this.consoleContent.scrollHeight;
    }

    /**
     * 設置測試框架回調
     */
    setupTestFrameworkCallbacks() {
        this.testFramework.onProgress = (results) => {
            this.updateProgress(results);
        };
        
        this.testFramework.onComplete = (results) => {
            this.displayFinalResults(results);
        };
    }

    /**
     * 更新進度顯示
     */
    updateProgress(results) {
        const percentage = results.total > 0 ? (results.passed + results.failed) / results.total * 100 : 0;
        this.progressBar.style.width = `${percentage}%`;
        
        this.summaryStats.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>總計: ${results.total}</span>
                <span>已執行: ${results.passed + results.failed}</span>
                <span>剩餘: ${results.total - results.passed - results.failed}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span style="color: #28a745;">通過: ${results.passed}</span>
                <span style="color: #dc3545;">失敗: ${results.failed}</span>
                <span style="color: #ffc107;">待定: ${results.pending}</span>
            </div>
        `;
        
        this.summaryContainer.style.display = 'block';
    }

    /**
     * 顯示最終結果
     */
    displayFinalResults(results) {
        const testResults = this.testFramework.getResults();
        this.resultsContainer.innerHTML = '';
        
        testResults.suites.forEach(suite => {
            const suiteElement = this.createSuiteElement(suite);
            this.resultsContainer.appendChild(suiteElement);
        });
        
        // 更新進度條顏色
        const successRate = results.total > 0 ? results.passed / results.total : 0;
        if (successRate >= 0.9) {
            this.progressBar.style.backgroundColor = '#28a745';
        } else if (successRate >= 0.7) {
            this.progressBar.style.backgroundColor = '#ffc107';
        } else {
            this.progressBar.style.backgroundColor = '#dc3545';
        }
        
        // 顯示控制台輸出
        this.consoleOutput.style.display = 'block';
    }

    /**
     * 創建測試套件元素
     */
    createSuiteElement(suite) {
        const suiteDiv = document.createElement('div');
        suiteDiv.className = 'test-suite';
        
        const headerDiv = document.createElement('div');
        headerDiv.className = 'test-suite-header';
        headerDiv.onclick = () => {
            suiteDiv.classList.toggle('expanded');
        };
        
        const passedCount = suite.tests.filter(test => test.status === 'passed').length;
        const failedCount = suite.tests.filter(test => test.status === 'failed').length;
        const totalCount = suite.tests.length;
        
        headerDiv.innerHTML = `
            <span>${suite.name} (${suite.type})</span>
            <span>
                <span style="color: #28a745;">${passedCount}</span> / 
                <span style="color: #dc3545;">${failedCount}</span> / 
                <span>${totalCount}</span>
            </span>
        `;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'test-suite-content';
        
        suite.tests.forEach(test => {
            const testElement = this.createTestElement(test);
            contentDiv.appendChild(testElement);
        });
        
        suiteDiv.appendChild(headerDiv);
        suiteDiv.appendChild(contentDiv);
        
        return suiteDiv;
    }

    /**
     * 創建測試案例元素
     */
    createTestElement(test) {
        const testDiv = document.createElement('div');
        testDiv.className = `test-case ${test.status}`;
        
        const statusSpan = document.createElement('span');
        statusSpan.className = `test-status ${test.status}`;
        statusSpan.textContent = test.status === 'passed' ? '通過' : 
                                test.status === 'failed' ? '失敗' : '待定';
        
        const nameSpan = document.createElement('span');
        nameSpan.textContent = test.name;
        
        testDiv.appendChild(nameSpan);
        testDiv.appendChild(statusSpan);
        
        if (test.status === 'failed' && test.error) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-details';
            errorDiv.textContent = test.error;
            testDiv.appendChild(errorDiv);
        }
        
        return testDiv;
    }

    /**
     * 清除測試結果
     */
    clearResults() {
        this.resultsContainer.innerHTML = '';
        this.summaryContainer.style.display = 'none';
        this.consoleOutput.style.display = 'none';
        this.consoleContent.innerHTML = '';
        this.progressBar.style.width = '0%';
        this.progressBar.style.backgroundColor = '#28a745';
    }
}

// 全域函數
async function runAllTests() {
    const testRunner = new TestRunner();
    testRunner.clearResults();
    
    console.log('開始執行所有測試...');
    await testFramework.runAllTests();
}

async function runUnitTests() {
    const testRunner = new TestRunner();
    testRunner.clearResults();
    
    console.log('開始執行單元測試...');
    await testFramework.runTestsByType('unit');
}

async function runIntegrationTests() {
    const testRunner = new TestRunner();
    testRunner.clearResults();
    
    console.log('開始執行整合測試...');
    await testFramework.runTestsByType('integration');
}

async function runMiniGameTests() {
    const testRunner = new TestRunner();
    testRunner.clearResults();
    
    console.log('開始執行迷你遊戲測試...');
    await testFramework.runTestsByType('minigame');
}

function clearResults() {
    const testRunner = new TestRunner();
    testRunner.clearResults();
    console.log('測試結果已清除');
}

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('北京烤鴨遊戲測試執行器已載入');
    console.log('可用測試套件:', Array.from(testFramework.testSuites.keys()));
    
    // 設置測試套件類型
    const suites = testFramework.testSuites;
    
    // 設置單元測試類型
    if (suites.has('GameEngine 核心功能測試')) {
        suites.get('GameEngine 核心功能測試').type = 'unit';
    }
    if (suites.has('Scene 場景系統測試')) {
        suites.get('Scene 場景系統測試').type = 'unit';
    }
    if (suites.has('SceneManager 場景管理器測試')) {
        suites.get('SceneManager 場景管理器測試').type = 'unit';
    }
    if (suites.has('MiniGame 迷你遊戲基類測試')) {
        suites.get('MiniGame 迷你遊戲基類測試').type = 'unit';
    }
    
    // 設置整合測試類型
    if (suites.has('場景切換整合測試')) {
        suites.get('場景切換整合測試').type = 'integration';
    }
    if (suites.has('進度管理整合測試')) {
        suites.get('進度管理整合測試').type = 'integration';
    }
    
    // 設置迷你遊戲測試類型
    if (suites.has('迷你遊戲完成條件驗證測試')) {
        suites.get('迷你遊戲完成條件驗證測試').type = 'minigame';
    }
    
    console.log('測試框架初始化完成，準備執行測試');
});