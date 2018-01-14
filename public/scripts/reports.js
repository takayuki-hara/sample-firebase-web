/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

// Initializes ReportList.
function ReportList() {

    // Shortcuts to DOM Elements.
    this.customForm = document.getElementById('custom-form');
    this.beforeButton = document.getElementById('before');
    this.nextButton = document.getElementById('next');
    this.detailButtons = document.getElementsByName('detail');

    // Events.
    this.customForm.addEventListener('click', this.changeState.bind(this));
    this.beforeButton.addEventListener('click', this.moveBefore.bind(this));
    this.nextButton.addEventListener('click', this.moveNext.bind(this));

    // Initialize.
    this.initFirebase();
    this.initialize();

    // Fetch User List.
    this.fetch();
}

// Sets up shortcuts to Firebase features and initiate firebase auth.
ReportList.prototype.initFirebase = function() {
    // Shortcuts to Firebase SDK features.
    this.auth = firebase.auth();
    this.database = firebase.database();
    this.storage = firebase.storage();
};

ReportList.prototype.changeState = function(state) {
    var ref = this.database.ref('/v1/report/' + this.selectedReportId);
    ref.update({
        _updatedAt: getNowUnixtime(),
        state: this.toState
    });
    window.alert('通報の状態を更新しました！');
    window.location.reload();
};

ReportList.prototype.moveBefore = function(e) {
    e.preventDefault();
    location.href = "../views/reports.html?endAt=" + this.firstCreatedAt;
};

ReportList.prototype.moveNext = function(e) {
    e.preventDefault();
    location.href = "../views/reports.html?startAt=" + this.lastCreatedAt;
};

ReportList.prototype.initialize = function() {
    this.parameters = getUrlParameters();
    if (this.parameters) {
        this.setIndex();
    }
};

ReportList.prototype.setButtons = function() {
    if (this.startAt < 0) {
        this.beforeButton.removeAttribute('disabled');
        if (!this.hasNext) {
            this.nextButton.setAttribute('disabled', 'true');
        }
    } else if (this.endAt < 0) {
        if (this.hasNext) {
            this.beforeButton.removeAttribute('disabled');
        }
    } else {
        if (!this.hasNext) {
            this.nextButton.setAttribute('disabled', 'true');
        }
    }
};

ReportList.prototype.setIndex = function() {
    if (this.parameters == null) {
        return;
    }
    if (this.parameters["startAt"]) {
        this.startAt = Number(this.parameters["startAt"]);
    } else if (this.parameters["endAt"]) {
        this.endAt = Number(this.parameters["endAt"]);
    }
};

ReportList.prototype.fetch = function() {
    var fetchNum = 21;
    var ref = this.database.ref('/v1/report/');
    var query = ref.orderByChild("_createdAtReverse").limitToFirst(fetchNum);

    if (this.startAt < 0) {
        query = ref.orderByChild("_createdAtReverse").startAt(this.startAt).limitToFirst(fetchNum);
    } else if (this.endAt < 0) {
        query = ref.orderByChild("_createdAtReverse").endAt(this.endAt).limitToLast(fetchNum);
    }

    query.once('value').then(function(snapshot) {
        var ctr = 0;
        snapshot.forEach(function(data) {
            var val = data.val();
            this.lastCreatedAt = val._createdAtReverse;
            if (ctr == 0) {
                this.firstCreatedAt = val._createdAtReverse;
            } else if (ctr == fetchNum - 1) {
                this.hasNext = true;
                return;
            }
            this.display(data.key, val.userId, val.questionId, val.commentId, val.state, val.category, val.target, val.body);
            ctr++;
        }.bind(this));
        this.setButtons();
    }.bind(this));
};

ReportList.prototype.display = function(key, userId, questionId, commentId, state, category, target, body) {
    var template =
    '<div class="mdl-shadow--2dp mdl-cell mdl-cell--12-col">' +
    '</div>';

    var div = document.getElementById(key);
    if (!div) {
        var container = document.createElement('div');
        container.innerHTML = template;
        div = container.firstChild;
        div.setAttribute('id', key);
        this.customForm.appendChild(div);
    }

    if (state != 2) {
        var button2 = document.createElement("button");
        button2.setAttribute("class", "detail mdl-button mdl-js-button mdl-button--colored mdl-js-ripple-effect");
        button2.setAttribute("onclick", "setValue('" + key + "', 2)");
        button2.setAttribute("name", "detail");
        button2.setAttribute("type", "button");
        button2.innerHTML = "保留にする";
        div.appendChild(button2);
    }

    if (state != 1) {
        var button = document.createElement("button");
        button.setAttribute("class", "detail mdl-button mdl-js-button mdl-button--accent mdl-js-ripple-effect");
        button.setAttribute("onclick", "setValue('" + key + "', 1)");
        button.setAttribute("name", "detail");
        button.setAttribute("type", "button");
        button.innerHTML = "処理済みにする";
        div.appendChild(button);
    }

    if (state != 0) {
        var button = document.createElement("button");
        button.setAttribute("class", "detail mdl-button mdl-js-button mdl-button--accent mdl-js-ripple-effect");
        button.setAttribute("onclick", "setValue('" + key + "', 0)");
        button.setAttribute("name", "detail");
        button.setAttribute("type", "button");
        button.innerHTML = "未処理にする";
        div.appendChild(button);
    }

    var text = document.createElement("span");
    text.innerHTML = "【通報者】" + userIdStringToLinkHtml(userId) + "<br>" +
                     "【質問ID】" + questionIdStringToLinkHtml(questionId) + "<br>" +
                     "【コメントID】" + commentIdStringToLinkHtml(commentId) + "<br>" +
                     "【本文】" + escapeHtml(escapeHtml(body)) + "<br>" +
                     "<br><font color='#7f7f7f'>State：" + getReportStatusString(state) + "／対象：" + getReportTargetString(target) + "／通報理由：" + getReportCategoryString(category) + "</font>";
    div.appendChild(text);

};

// リストのタップ時の処理
function setValue(val, state)
{
    window.ReportList.selectedReportId = val;
    window.ReportList.toState = state;
}

window.onload = function() {
    window.authenticater = new Authenticator();
    window.ReportList = new ReportList();
};
