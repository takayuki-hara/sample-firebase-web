/**
 * Copyright 2018 XXX Inc. All Rights Reserved.
 *
 * このファイルは共通で使用する初期化用の処理をまとめています
 * 画面固有の処理がたくさんある場合は別途ファイルを作成して定義します
 *
 */
'use strict';

window.onload = function() {
    if (isIndexPage()) {
        location.href = "./views/login.html";
    } else {
        window.authenticater = new Authenticator();
    }
};
