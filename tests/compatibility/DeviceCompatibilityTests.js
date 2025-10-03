/**
 * 裝置相容性測試
 * 測試桌面和行動裝置的操作體驗
 */

describe('裝置相容性測試', function() {
    let deviceTester;
    let mockGameEngine;

    beforeEach(function() {
        deviceTester = new DeviceCompatibilityTester()