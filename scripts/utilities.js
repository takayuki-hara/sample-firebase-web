/**
 * Copyright 2018 XXX Inc. All Rights Reserved.
 *
 * このファイルには共通で使用するユーティリティ関数を定義します
 * 状態を保持せず外部の変数を更新したりもしないものだけここに置きます
 *
 */
 'use strict';

function isIndexPage() {
    var path = location.pathname;
    var pathinfo = path.split('/');
    var filename = pathinfo.pop();
    if ((filename == "index.html") || (filename == "")) {
        return true;
    }
    return false;
}
