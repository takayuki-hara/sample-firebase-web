/**
 * Copyright 2018 XXX Inc. All Rights Reserved.
 *
 * このファイルには共通で使用するユーティリティ関数を定義します
 * 状態を保持せず外部の変数を更新したりもしないものだけここに置きます
 *
 */
 'use strict';

// インデックスページかどうかを返す
function isIndexPage() {
    var path = location.pathname;
    var pathinfo = path.split('/');
    var filename = pathinfo.pop();
    if ((filename == "index.html") || (filename == "")) {
        return true;
    }
    return false;
}

// URLのクエリストリングを連想配列にして返す
function　getUrlParameters() {
    if (window.location.search) {
        var query = window.location.search.substring(1,window.location.search.length);
        var pair = query.split("&");
        var params = new Array();
        for (var i=0; i < pair.length; i++) {
            var tmp = pair[i].split("=");
            var keyName = tmp[0];
            var keyValue = tmp[1];
            params[keyName] = keyValue;
        }
        return params;
    }
    return null;
};


/**
 * データベース関連の変換関数
 */

function getPositionCode(array) {
    if (array[0].checked) {
        return 0;
    } else if (array[1].checked) {
        return 1;
    } else {
        return 2;
    }
};

function getGenderCode(array) {
    if (array[0].checked) {
        return 0;
    } else if (array[1].checked) {
        return 1;
    } else {
        return 2;
    }
};

function getLangageCode(value) {
    if (value == "日本語") {
        return 0;
    } else if (value == "英語") {
        return 1;
    } else if (value == "中国語（簡体字）") {
        return 2;
    } else {
        return 3;
    }
};

function getAgeCode(value) {
    if (value == "10代") {
        return 0;
    } else if (value == "20代") {
        return 1;
    } else if (value == "30代") {
        return 2;
    } else {
        return 3;
    }
};

function getAreaCode(value) {
    if (value == "関東") {
        return 0;
    } else if (value == "関西") {
        return 1;
    } else if (value == "北海道") {
        return 2;
    } else {
        return 3;
    }
};



