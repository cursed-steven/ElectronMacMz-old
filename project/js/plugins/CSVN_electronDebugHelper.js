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
 * @url https://note.com/cursed_steven/n/ncf1917f0c259
 * 
 * @help CSVN_electronDebugHelper.js
 * 
 * ツクールMZデフォルトの NW.js ではなく、 Electron で
 * 開発、テスト、デプロイ(=配布用パッケージ生成)を行うときの、
 * おもにテストの時に有用そうな機能を実装しています。
 * 
 * Electron 導入についての詳細はこちら。
 * https://note.com/cursed_steven/n/ncf1917f0c259
 * 
 * ◆ショートカット
 * F5: リロード
 * F8: 開発ツールを開く(テスト起動中のみ、デバッグ起動では自動で開きます)
 * 
 * ◆タイトル画面省略
 * プラグインパラメータでタイトル画面省略について設定できます。
 * 0: 無効
 * 1: ニューゲーム開始
 * 2: 最新セーブデータで開始(オートセーブをのぞく)
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

    // Electron の導入がうまく行っていないと思われる場合は以降の内容は機能しない
    if (typeof window.electron === 'undefined') {
        console.warn('>>>> Electron is not loaded properly.');
        return;
    }

    // 起動時のオプションの取得
    const ipcRenderer = window.electron.ipcRenderer;
    const options = await ipcRenderer.invoke('options').then(result => {
        return result;
    });

    /**
     * テスト、デバッグ起動、もしくは戦闘テストの場合 true
     * @returns boolean
     */
    function isDebugOrTest() {
        return Utils.isOptionValid('test')
            || Utils.isOptionValid('debug')
            || !DataManager.isBattleTest();
    }

    //-------------------------------------------------------------------------
    // Utils

    /**
     * Electron で起動している場合 true
     * @returns boolean
     */
    Utils.isElectron = function () {
        return typeof window.electron === 'object';
    };

    const _Utils_isOptionValid = Utils.isOptionValid;
    /**
     * 指定したオプションが起動時に入っていれば true
     * @param {string} name 
     * @returns boolean
     */
    Utils.isOptionValid = function (name) {
        return _Utils_isOptionValid.apply(this, arguments) || options.split(',').includes(name);
    };

    //-------------------------------------------------------------------------
    // SceneManager

    const _SceneManager_initialize = SceneManager.initialize;
    /**
     * Electron からデバッグ/テスト/戦闘テストで起動している場合にログ出力を追加
     */
    SceneManager.initialize = function () {
        _SceneManager_initialize.call(this);

        if (Utils.isElectron() && isDebugOrTest()) {
            this.outputStartupLog();
        }
    };

    /**
     * 本プラグインが動作している旨ログ出力
     */
    SceneManager.outputStartupLog = function () {
        console.log('>>>> This is CSVN_electronDebugHelper speaking...');
        console.log(`>>>> RPG Maker Core: ${Utils.RPGMAKER_NAME} ${Utils.RPGMAKER_VERSION}`);
    };

    const _SceneManager_reloadGame = SceneManager.reloadGame;
    /**
     * Electron による起動時のリロード
     */
    SceneManager.reloadGame = function () {
        _SceneManager_reloadGame.call(this);

        if (Utils.isElectron()) {
            ipcRenderer.send('reload');
        }
    };

    const _SceneManager_showDevTools = SceneManager.showDevTools;
    /**
     * Electron による起動時の開発ツール展開
     * ※ただしデバッグ/テスト/戦闘テスト時のみ
     */
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
    /**
     * タイトル画面省略処理の追加
     */
    Scene_Boot.prototype.start = function () {
        _Scene_Boot_start.apply(this, arguments);
        this.cutSceneTitle();
    };

    /**
     * タイトル画面省略
     * @returns void
     */
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

    /**
     * ニューゲーム開始に直行
     */
    Scene_Boot.prototype.goToNewGame = function () {
        DataManager.setupNewGame();
        SceneManager.goto(Scene_Map);
    };

    /**
     * 最新セーブデータによるゲーム開始に直行
     * @returns boolean
     */
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