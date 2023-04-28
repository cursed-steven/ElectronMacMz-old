/*=============================================================================
 main.js
----------------------------------------------------------------------------
 Version
 1.0.0 2022/02/20 triacontane   初版
 1.1.0 2023/04/28 cursed_steven reload実装
----------------------------------------------------------------------------
triacontane: 
 [Blog]   : https://triacontane.blogspot.jp/
 [Twitter]: https://twitter.com/triacontane/
 [GitHub] : https://github.com/triacontane/
cursed_steven: 
 [Twitter]: https://twitter.com/cursed_steven/
=============================================================================*/

let mainWindow = null;

(() => {
    'use strict';

    process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1';
    const { app, BrowserWindow, Menu, ipcMain } = require('electron');
    const processArgv = process.argv[2] || '';
    const packageName = process.env.npm_package_name;
    const packageVersion = process.env.npm_package_version;

    /**
     * createWindow
     * メインウィンドウを生成します。
     */
    function createWindow() {
        mainWindow = new BrowserWindow({
            width: 816,
            height: 624,
            useContentSize: true,
            webPreferences: {
                nodeIntegration: true,
                preload: __dirname + '/preload.js',
                contextIsolation: true
            },
            icon: 'project/icon/icon.png'
        });
        mainWindow.loadFile('project/index.html');
        mainWindow.on('closed', () => {
            mainWindow = null;
        });
        Menu.setApplicationMenu(null);
        if (processArgv.includes('debug')) {
            mainWindow.webContents.openDevTools();
        }
        console.log(`> processArgv: ${processArgv}`);
        console.log(`> package: ${packageName}-${packageVersion}`);
        console.log('');
    }
    app.on('ready', createWindow);

    ipcMain.handle('options', event => {
        return processArgv;
    });
    ipcMain.on('open-dev-tools', event => {
        mainWindow.webContents.openDevTools();
    });
    ipcMain.on('reload', event => {
        mainWindow.webContents.reload();
    });
})();
