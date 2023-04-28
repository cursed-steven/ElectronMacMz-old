# Electron Mz Mac
Windows のみに対応していたトリアコンタンさんの Electron For Mz (<https://qiita.com/triacontane/items/a8610bff9778ca2aaa3e>) をオリジナルとして、Mac でも同様にRPGツクールMZをElectron上で開発、テスト、デプロイメントしようということでいろいろアレンジしたものです。この README.md もオリジナルを一部改訂したものです。

## Electronとは
Electronとは、NW.jsと同様にクロスプラットフォームで動作するデスクトップアプリケーションのフレームワークです。
NW.jsと比べて以下のメリットがあります。

- 将来的に見て安心(NW.jsには今後OSのアップデートに付いていけるか不安。特にMac)
- パッケージングやインストーラを使ったデプロイメントが可能(electron-builderを使用)
- 本体v1.6.1時点で時点でまだ発生しているNW.jsのプロセスが終了後も残り続けてしまう問題を回避できる
- macOS上ではそもそも NW.js が高頻度で起動に失敗する問題を回避できる

## 対象読者
- macOS/Steam版RPGツクールMZを使用していて Nw.js の挙動に不安や不満があるひと
- Node.jsのインストールとnpmコマンドが実行できるひと
- フロント開発用のエディタ（VSCode等）を使ったことがあるひと

## 動作確認バージョン
- macOS Ventura 13.2.1 on MacBook Air (M1, 2020)
- Node.js v18.16.0
- npm v9.5.1
- Electron v24.1.3
- electron-builder v24.3.0

## 準備
### リポジトリのチェックアウト  
<https://github.com/cursed-steven/ElectronMacMz.git>

以後のコマンドはすべてチェックアウトしたディレクトリで行います。

### Node.jsのダウンロードとインストール
下記のサイトに従って推奨版(=LTS:Long Time Support)をダウンロード、インストールします。  
<https://nodejs.org/ja/download/>

### Electronのインストール
package.jsonに記載されたバージョンでよければ `npm install` でもOKです(※)。  
`npm install -D electron`

### electron-builderのインストール
package.jsonに記載されたバージョンでよければ `npm install` でもOKです(※)。  
`npm install -D electron-builder`

※オリジナルよりだいぶバージョン上げてます。

### RPGツクールMZのプロジェクトをコピー
チェックアウトしてできたフォルダの下の`project`フォルダの配下に、RPGツクールMZのプロジェクト(=game.rmmzprojectファイルが入っているフォルダの中身全部)をコピーします。

### プラグインの有効化
RPGツクールMZ本体に本プロジェクトに同梱のプラグイン`CSVN_electronDebugHelper.js`を入れて有効化します。  
<https://github.com/cursed-steven/ElectronMacMz/blob/main/project/js/plugins/CSVN_electronDebugHelper.js>

## 実行
### 通常起動
`npm run start`

### テストプレー
`npm run test`

### テストプレー(開発ツール起動)
`npm run debug`

### デプロイメント
デプロイメントします。出力先はデフォルトでは ./dist です。build.js の outputPath で設定可能です。  
`npm run deploy`

### ウィンドウサイズ
main.js の 以下の場所の width/height を修正してください。ツクール本体側に書いた内容は反映されません。
```main.js
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
```

## 本プロジェクトの詳細解説
こちらは、 build.js 以外はオリジナル (https://qiita.com/triacontane/items/a8610bff9778ca2aaa3e) にゆずります。

### build.js
macOS向けにビルドするためのファイルです。
<https://github.com/cursed-steven/ElectronMacMz/blob/main/build.js>

```build.js
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
```
`appId` に含まれる `${name}` は、 `productName` の値が反映されます。
`copyright` はひとまず MZ の著作権表示を入れておきました。
`icon`はアプリケーションやインストーラのアイコンに使われる画像です。512*512で用意します。とりえあずicoファイルでもOKです。  
`target`はデプロイメント方法です。`zip`は文字通りzipファイルを作成します。プラットフォームごとに様々な設定があり、macOS でも pkg とか dmg とかできるようですがまだ試してません。試したら追記します。
`category`は Apple 側で決められているゲームアプリ用の固定値です。

詳細設定はドキュメントをご参照ください。  
<https://www.electron.build/configuration/configuration>

### 最終的なフォルダ構成
```
xxxxxxxx@MacBook-Air ElectronMzMac % ls -l
total 464
-rw-r--r--    1 xxxxxxxx  staff    1070  4 28 13:07 LICENSE
-rw-r--r--    1 xxxxxxxx  staff    1078  4 28 12:37 LICENSE(ElectronForMz)
-rw-r--r--    1 xxxxxxxx  staff    8058  4 28 12:37 README(ElectronForMz).md
-rw-r--r--@   1 xxxxxxxx  staff    5515  4 29 00:07 README.md
-rw-r--r--    1 xxxxxxxx  staff      50  4 28 12:37 ReleaseNote(ElectronForMz).md
-rw-r--r--    1 xxxxxxxx  staff      50  4 28 13:10 ReleaseNote.md
-rw-r--r--    1 xxxxxxxx  staff    1161  4 28 13:18 build.js
drwxr-xr-x   13 xxxxxxxx  staff     416  4 28 22:03 dist
-rwxr-xr-x    1 xxxxxxxx  staff   22646  4 28 12:52 icon.png
-rw-r--r--@   1 xxxxxxxx  staff    2178  4 29 00:06 main.js
drwxr-xr-x  262 xxxxxxxx  staff    8384  4 28 22:03 node_modules
-rw-r--r--    1 xxxxxxxx  staff  162059  4 28 13:40 package-lock.json
-rw-r--r--    1 xxxxxxxx  staff     426  4 28 13:08 package.json
-rw-r--r--    1 xxxxxxxx  staff     847  4 28 20:51 preload.js
drwxr-xr-x   15 xxxxxxxx  staff     480  4 28 22:03 project
```
※distは build 後にできます

## 参考資料
<https://qiita.com/triacontane/items/a8610bff9778ca2aaa3e>
