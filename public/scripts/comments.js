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

// Initializes CommentList.
function CommentList() {

    // Shortcuts to DOM Elements.
    this.customForm = document.getElementById('custom-form');
    this.beforeButton = document.getElementById('before');
    this.nextButton = document.getElementById('next');
    this.detailButtons = document.getElementsByName('detail');

    // Events.
    this.customForm.addEventListener('click', this.moveDetail.bind(this));
    this.beforeButton.addEventListener('click', this.moveBefore.bind(this));
    this.nextButton.addEventListener('click', this.moveNext.bind(this));

    // Initialize.
    this.initFirebase();
    this.initialize();

    // Fetch User List.
    this.fetch();
}

// Sets up shortcuts to Firebase features and initiate firebase auth.
CommentList.prototype.initFirebase = function() {
    // Shortcuts to Firebase SDK features.
    this.auth = firebase.auth();
    this.database = firebase.database();
    this.storage = firebase.storage();
};

CommentList.prototype.moveDetail = function(e) {
    e.preventDefault();
    if (this.selectedCommentId) {
        location.href = "../views/commentdetail.html?cid=" + this.selectedCommentId;
    }
};

CommentList.prototype.moveBefore = function(e) {
    e.preventDefault();
    location.href = "../views/comments.html?endAt=" + this.firstCreatedAt;
};

CommentList.prototype.moveNext = function(e) {
    e.preventDefault();
    location.href = "../views/comments.html?startAt=" + this.lastCreatedAt;
};

CommentList.prototype.initialize = function() {
    this.parameters = getUrlParameters();
    if (this.parameters) {
        this.setIndex();
    }
};

CommentList.prototype.setButtons = function() {
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

CommentList.prototype.setIndex = function() {
    if (this.parameters == null) {
        return;
    }
    if (this.parameters["startAt"]) {
        this.startAt = Number(this.parameters["startAt"]);
    } else if (this.parameters["endAt"]) {
        this.endAt = Number(this.parameters["endAt"]);
    }
};

CommentList.prototype.fetch = function() {
    var fetchNum = 21;
    var ref = this.database.ref(dbRoot + '/comment/');
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
            this.display(data.key, val.userId, val.questionId, val.commentId, val.state, val.category, val.body);
            ctr++;
        }.bind(this));
        this.setButtons();
    }.bind(this));
};

CommentList.prototype.display = function(key, userId, questionId, commentId, state, category, body) {
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

    var button = document.createElement("button");
    button.setAttribute("class", "detail mdl-button mdl-js-button mdl-button--accent mdl-js-ripple-effect");
    button.setAttribute("onclick", "setValue('" + key + "')");
    button.setAttribute("name", "detail");
    button.setAttribute("type", "button");
    button.innerHTML = "Detail";
    div.appendChild(button);

    var text = document.createElement("span");
    text.innerHTML = "【投稿者】" + userIdStringToLinkHtml(userId) + "<br>" +
                     "【質問ID】" + questionIdStringToLinkHtml(questionId) + "<br>" +
                     "【コメントID】" + commentIdStringToLinkHtml(commentId) + "<br>" +
                     "【本文】" + escapeHtml(escapeHtml(body)) + "<br>" +
                     "<br><font color='#7f7f7f'>State：" + getCommentStatusString(state) + "／種別：" + getCommentCategoryString(category) + "</font>";
    div.appendChild(text);
};

// どのコメントを選択したのかを保持しておくための処理
function setValue(val)
{
    window.CommentList.selectedCommentId = val;
}

window.onload = function() {
    window.authenticater = new Authenticator();
    window.CommentList = new CommentList();
};
