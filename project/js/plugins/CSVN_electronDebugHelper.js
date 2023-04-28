//=============================================================================
// RPG Maker MZ - CSVN_electronDebugHelper
// ----------------------------------------------------------------------------
// (C)2023 cursed_steven
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.0.0  2023/04/28 初版 (based on DevToolsManage.js)
// ----------------------------------------------------------------------------
// [Twitter]: https://twitter.com/cursed_steven
//=============================================================================

/*:ja
 * @target MZ
 * @plugindesc Electron で起動している場合のデバッグ支援
 * @author cursed_steven
 * @base PluginCommonBase
 * @orderAfter PluginCommonBase
 * 
 * @help CSVN_electronDebugHelper.js
 * 
 * @param CutTitle
 * @text タイトルカット
 * @desc タイトル画面をとばしてゲームを開始します。
 * @default 0
 * @type select
 * @option 無効
 * @value 0
 * @option ニューゲーム開始
 * @value 1
 * @option 最新データをロード
 * @value 2
 */

(async () => {

    'use strict';
    const script = document.currentScript;
    const param = PluginManagerEx.createParameter(script);

    // 
    if (typeof window.electron === 'undefined') {
        console.warn('>>>> electron is not loaded properly.');
        return;
    }

    const ipcRenderer = window.electron.ipcRenderer;
    const options = await ipcRenderer.invoke('options').then(result => {
        return result;
    });

    function isDebugOrTest() {
        return Utils.isOptionValid('test')
            || Utils.isOptionValid('debug')
            || !DataManager.isBattleTest();
    }

    //-------------------------------------------------------------------------
    // Utils

    Utils.isElectron = function () {
        return typeof window.electron === 'object';
    };

    const _Utils_isOptionValid = Utils.isOptionValid;
    Utils.isOptionValid = function (name) {
        return _Utils_isOptionValid.apply(this, arguments) || options.split(',').includes(name);
    };

    //-------------------------------------------------------------------------
    // SceneManager

    const _SceneManager_initialize = SceneManager.initialize;
    SceneManager.initialize = function () {
        _SceneManager_initialize.call(this);

        if (Utils.isElectron() && isDebugOrTest()) {
            this.outputStartupLog();
        }
    };

    SceneManager.outputStartupLog = function () {
        console.log('>>>> This is CSVN_electronDebugHelper speaking...');
        console.log(`>>>> RPG Maker Core: ${Utils.RPGMAKER_NAME} ${Utils.RPGMAKER_VERSION}`);
    };

    const _SceneManager_reloadGame = SceneManager.reloadGame;
    SceneManager.reloadGame = function () {
        _SceneManager_reloadGame.call(this);

        if (Utils.isElectron()) {
            ipcRenderer.send('reload');
        }
    };

    const _SceneManager_showDevTools = SceneManager.showDevTools;
    SceneManager.showDevTools = function () {
        if (isDebugOrTest()) {
            _SceneManager_showDevTools.call(this);

            if (Utils.isElectron()) {
                ipcRenderer.send('open-dev-tools');
            }
        }
    };

    //-------------------------------------------------------------------------
    // Scene_Boot

    const _Scene_Boot_start = Scene_Boot.prototype.start;
    Scene_Boot.prototype.start = function () {
        _Scene_Boot_start.apply(this, arguments);
        this.cutSceneTitle();
    };

    Scene_Boot.prototype.cutSceneTitle = function () {
        if (DataManager.isBattleTest() || DataManager.isEventTest()) {
            return;
        }
        switch (param.CutTitle) {
            case 1:
                this.goToNewGame();
                break;
            case 2:
                const result = this.goToLatestContinue();
                if (!result) {
                    this.goToNewGame();
                }
                break;
        }
    };


    Scene_Boot.prototype.goToNewGame = function () {
        DataManager.setupNewGame();
        SceneManager.goto(Scene_Map);
    };

    Scene_Boot.prototype.goToLatestContinue = function () {
        if (DataManager.isAnySavefileExists()) {
            DataManager.loadGame(DataManager.latestSavefileId()).then(() => {
                SceneManager.goto(Scene_Map);
                $gameSystem.onAfterLoad();
            });
            return true;
        } else {
            return false;
        }
    };
    Scene_Boot.prototype.reloadMapIfUpdated = Scene_Load.prototype.reloadMapIfUpdated;

    const _Scene_Load_reloadMapIfUpdated = Scene_Load.prototype.reloadMapIfUpdated;
    Scene_Load.prototype.reloadMapIfUpdated = function () {
        _Scene_Load_reloadMapIfUpdated.apply(this, arguments);
        if ($gameSystem.versionId() !== $dataSystem.versionId) {
            $gameMap.clearEventErase();
        }
    };
})();