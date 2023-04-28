/*=============================================================================
 build.js
----------------------------------------------------------------------------
 Doc : https://www.electron.build/configuration/configuration
----------------------------------------------------------------------------
 Version
 1.0.0 2023/04/27 based on build-win.js (by triacontane)
----------------------------------------------------------------------------
 [Twitter]: https://twitter.com/cursed_steven/
=============================================================================*/

const builder = require('electron-builder');
const outputPath = process.argv[2] || __dirname + '/dist';

builder.build({
    config: {
        productName: 'electron-mz-mac',
        appId: 'com.electron.${name}',
        copyright: 'Copyright (c) 2020 Gotcha Gotcha Games Inc., 2020 YOJI OJIMA',
        mac: {
            icon: 'icon.png',
            target: {
                target: 'zip',
                arch: ['x64', 'arm64']
            },
            category: 'public.app-category.games'
        },
        directories: {
            output: outputPath
        }
    }
});
