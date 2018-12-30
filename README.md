# sample-firebase-web

## Overview
FirebaseのWebアプリのサンプル

## Output Url
https://qaboard-1229.firebaseapp.com

## Required

- Node.js 6.3.1+
- nmp 6.5.0+
- firebase-tools 6.2.2+

## Reference

- [Firebase CLI][1]
- [Firebase Web][2]
- [Firebase Cloud Function][3]
- [Web App Manifest][4]
- [脱ネイティブ！Googleが推進する「PWA」にたった数時間で対応する方法][5]

## Initialize

※最初に行った作業（済み）

1. ログインする
    ```
    firebase login
    ```

1. firebaseを初期化する
    ```
    firebase init
    ```
    ※デフォルトとしてステージング用のプロジェクトを選択する

1. 本番のプロジェクトもエイリアスに追加する
    ```
    firebase use --add
    production
    ```

1. firebase.json を編集する

1. ログアウトする
    ```
    firebase logout
    ```

## Developent / Deploy

### Hosting

1. Webアプリを開発する開発

1. 動作確認
    ```
    firebase serve
    ```

1. デプロイする
    ```
    firebase deploy --only hosting
    ```

### Functions

1. functions フォルダに移動する

1. npm install する

1. 実装する

1. デプロイする
    ```
    firebase deploy --only functions
    ```


[1]:https://firebase.google.com/docs/cli/?hl=ja
[2]:https://codelabs.developers.google.com/codelabs/firebase-web/index.html?#0
[3]:https://codelabs.developers.google.com/codelabs/firebase-cloud-functions/index.html?#0
[4]:https://developers.google.com/web/fundamentals/web-app-manifest/?hl=ja
[5]:https://www.webprofessional.jp/retrofit-your-website-as-a-progressive-web-app/