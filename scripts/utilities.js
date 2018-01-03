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
}

// 現在時刻をUnixtimeで取得する
function getNowUnixtime() {
    var date = new Date();
    var unixTimestamp = Math.round( date.getTime() / 1000 );
    return unixTimestamp;
}

// Unixtimeを文字列にして返す
function unixtimeToString(time) {
    var d = new Date( time * 1000 );
    var year  = d.getFullYear();
    var month = d.getMonth() + 1;
    var day  = d.getDate();
    var hour = ( d.getHours()   < 10 ) ? '0' + d.getHours()   : d.getHours();
    var min  = ( d.getMinutes() < 10 ) ? '0' + d.getMinutes() : d.getMinutes();
    var sec   = ( d.getSeconds() < 10 ) ? '0' + d.getSeconds() : d.getSeconds();
    return (year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + sec );
}

// 連想配列を文字列にして返す（複数は改行で分ける）
function associativeArrayToString(array) {
    if (!array) {
        return "";
    }

    var ret = "";
    Object.keys(array).forEach(function(key) {
        ret += (key + '\n');
    }, array);
    return ret;
}

// userIdをユーザー情報のリンク文字列にして返す
function userIdStringToLinkHtml(value) {
    if (!value) {
        return "";
    }
    return ("<a href='../views/userdetail.html?uid=" + value + "' target='_blank'>" + value + "</a>");
}

// questionIdを質問情報のリンク文字列にして返す
function questionIdStringToLinkHtml(value) {
    if (!value) {
        return "";
    }
    return ("<a href='../views/questiondetail.html?qid=" + value + "' target='_blank'>" + value + "</a>");
}

// commentIdをコメント情報のリンク文字列にして返す
function commentIdStringToLinkHtml(value) {
    if (!value) {
        return "";
    }
    return ("<a href='../views/commentdetail.html?cid=" + value + "' target='_blank'>" + value + "</a>");
}


/**
 * データベース関連の変換関数
 */

// ユーザー情報：ユーザーの状態
function getUserStatusString(value) {
    switch (parseInt(value, 10)) {
        case 0:     return "仮登録";
        case 1:     return "有効";
        case 2:     return "停止";
        case 3:     return "退会";
        default:    return "仮登録";
    }
}

// ユーザー情報：立場
function getPositionCode(array) {
    if (array[0].checked) {
        return 0;
    } else if (array[1].checked) {
        return 1;
    } else if (array[2].checked) {
        return 2;
    }
    // いずれもチェックされていない場合は返さない
}
function getPositionString(value) {
    switch (parseInt(value, 10)) {
        case 0:     return "Tourist";
        case 1:     return "Guide";
        default:    return "Others";
    }
}

// ユーザー情報：性別
function getGenderCode(array) {
    if (array[0].checked) {
        return 0;
    } else if (array[1].checked) {
        return 1;
    } else if (array[2].checked) {
        return 2;
    }
    // いずれもチェックされていない場合は返さない
}
function getGenderString(value) {
    switch (parseInt(value, 10)) {
        case 0:     return "男性";
        case 1:     return "女性";
        default:    return "その他";
    }
}

// ユーザー情報：対応可能言語
function getLanguageCode(value) {
    switch (value) {
        case "日本語":        return 0;
        case "英語":          return 1;
        case "中国語（簡）":   return 2;
        case "中国語（繁）":   return 3;
        case "韓国語":        return 4;
        case "タイ語":        return 5;
        case "スペイン語":     return 6;
        case "フランス語":     return 7;
        case "ドイツ語":       return 8;
        case "イタリア語":     return 9;
        case "マレー語":       return 10;
        case "インドネシア語":  return 11;
        case "ベトナム語":     return 12;
        case "ロシア語":       return 13;
        case "ポルトガル語":    return 14;
        case "トルコ語":       return 15;
        case "アラビア語":      return 16;
        case "ポーランド語":    return 17;
        case "モンゴル語":      return 18;
        case "ビルマ語":       return 19;
        case "ペルシア語":      return 20;
        default:              return 0;
    }
}
function getLanguageString(value) {
    switch (parseInt(value, 10)) {
        case 0:     return "日本語";
        case 1:     return "英語";
        case 2:     return "中国語（簡）";
        case 3:     return "中国語（繁）";
        case 4:     return "韓国語";
        case 5:     return "タイ語";
        case 6:     return "スペイン語";
        case 7:     return "フランス語";
        case 8:     return "ドイツ語";
        case 9:     return "イタリア語";
        case 10:    return "マレー語";
        case 11:    return "インドネシア語";
        case 12:    return "ベトナム語";
        case 13:    return "ロシア語";
        case 14:    return "ポルトガル語";
        case 15:    return "トルコ語";
        case 16:    return "アラビア語";
        case 17:    return "ポーランド語";
        case 18:    return "モンゴル語";
        case 19:    return "ビルマ語";
        case 20:    return "ペルシア語";
        default:    return "日本語";
    }
}

// ユーザー情報：年齢層
function getAgeCode(value) {
    switch (value) {
        case "10代":  return 0;
        case "20代":  return 1;
        case "30代":  return 2;
        case "40代":  return 3;
        case "50代":  return 4;
        case "60歳〜": return 5;
        default:      return 0;
    }
}
function getAgeString(value) {
    switch (parseInt(value, 10)) {
        case 0:     return "10代";
        case 1:     return "20代";
        case 2:     return "30代";
        case 3:     return "40代";
        case 4:     return "50代";
        case 5:     return "60歳〜";
        default:    return "20代";
    }
}

// ユーザー情報：エリア
function getAreaCode(value) {
    switch (value) {
        case "関東":   return 0;
        case "関西":   return 1;
        case "北海道": return 2;
        case "沖縄":   return 3;
        case "富士山": return 4;
        case "九州":   return 5;
        case "中国":   return 6;
        case "四国":   return 7;
        case "東北":   return 8;
        case "中部":   return 9;
        case "その他": return 10;
        default:      return 10;
    }
}
function getAreaString(value) {
    switch (parseInt(value, 10)) {
        case 0:     return "関東";
        case 1:     return "関西";
        case 2:     return "北海道";
        case 3:     return "沖縄";
        case 4:     return "富士山";
        case 5:     return "九州";
        case 6:     return "中国";
        case 7:     return "四国";
        case 8:     return "東北";
        case 9:     return "中部";
        case 10:    return "その他";
        default:    return "その他";
    }
}

// ユーザー情報：アクセス権限
function getAccessRightsString(value) {
    switch (parseInt(value, 10)) {
        case 0:     return "Member";
        case 1:     return "Admin";
        default:    return "Member";
    }
}
// ユーザー情報：認証方法
function getAuthTypeString(value) {
    switch (parseInt(value, 10)) {
        case 0:     return "Facebook";
        case 1:     return "Twitter";
        case 2:     return "Mail";
        case 3:     return "Others";
        default:    return "Others";
    }
}
// ユーザー情報：デバイス種別
function getDeviceTypeString(value) {
    switch (parseInt(value, 10)) {
        case 0:     return "Android";
        case 1:     return "iOS";
        case 2:     return "Others";
        default:    return "Others";
    }
}

// 質問情報：質問の状態
function getQuestionStatusString(value) {
    switch (parseInt(value, 10)) {
        case 0:     return "オープン";
        case 1:     return "クローズ";
        case 2:     return "論理削除";
        default:    return "オープン";
    }
}

// 質問情報：質問の種類
function getQuestionCategoryCode(value) {
    switch (value) {
        case "アクセス":    return 0;
        case "両替":        return 1;
        case "グルメ":      return 2;
        case "緊急":        return 3;
        case "温泉":        return 4;
        case "観光名所":    return 5;
        case "アニメ":      return 6;
        case "翻訳":        return 7;
        case "Wi-Fi":      return 8;
        case "その他":      return 9;
        default:           return 9;
    }
}
function getQuestionCategoryString(value) {
    switch (parseInt(value, 10)) {
        case 0:     return "アクセス";
        case 1:     return "両替";
        case 2:     return "グルメ";
        case 3:     return "緊急";
        case 4:     return "温泉";
        case 5:     return "観光名所";
        case 6:     return "アニメ";
        case 7:     return "翻訳";
        case 8:     return "Wi-Fi";
        case 9:     return "その他";
        default:    return "その他";
    }
}

// 質問情報：質問の期限
function getPeriodSecond(value) {
    switch (value) {
        case "0.5h":    return 1800;
        case "1h":      return 3600;
        case "2h":      return 7200;
        case "3h":      return 10800;
        case "6h":      return 21600;
        case "12h":     return 53200;
        case "24h":     return 106400;
        case "48h":     return 212800;
        case "72h":     return 319200;
        default:        return 1800;
    }
}

// コメント情報：コメントの状態
function getCommentStatusString(value) {
    switch (parseInt(value, 10)) {
        case 0:     return "有効";
        case 1:     return "論理削除";
        default:    return "有効";
    }
}

// コメント情報：コメントの種別
function getCommentCategoryString(value) {
    switch (parseInt(value, 10)) {
        case 0:     return "Answer";
        case 1:     return "Relpy";
        default:    return "Answer";
    }
}

// 通報情報：通報の処理状態
function getReportStatusString(value) {
    switch (parseInt(value, 10)) {
        case 0:     return "未処理";
        case 1:     return "処理済み";
        case 2:     return "保留";
        default:    return "未処理";
    }
}

// 通報情報：通報理由
function getReportCategoryString(value) {
    switch (parseInt(value, 10)) {
        case 0:     return "個人情報開示";
        case 1:     return "著作権侵害";
        case 2:     return "違法行為";
        case 3:     return "不正情報の投稿";
        case 4:     return "マナー違反";
        case 5:     return "悪質サイトリンク";
        case 6:     return "添付データが違反";
        case 7:     return "猥褻なID Name";
        case 8:     return "問い合わせ";
        case 9:     return "その他";
        default:    return "その他";
    }
}

// 通報情報：通報の対象
function getReportTargetString(value) {
    switch (parseInt(value, 10)) {
        case 0:     return "質問";
        case 1:     return "回答";
        case 2:     return "リプライ";
        default:    return "質問";
    }
}
