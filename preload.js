/*=============================================================================
 preload.js
----------------------------------------------------------------------------
 Version
 1.0.0 2022/02/20 triacontane   初版
 2.0.0 2023/04/28 cursed_steven 全面改訂
----------------------------------------------------------------------------
triacontane: 
 [Blog]   : https://triacontane.blogspot.jp/
 [Twitter]: https://twitter.com/triacontane/
 [GitHub] : https://github.com/triacontane/
cursed_steven: 
 [Twitter]: https://twitter.com/cursed_steven/
=============================================================================*/

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld(
    'electron',
    {
        ipcRenderer: ipcRenderer,
        fs: require('fs'),
        path: require('path')
    }
);
