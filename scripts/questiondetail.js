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

// Initializes QuestionDetail.
function QuestionDetail() {

    // Shortcuts to DOM Elements.
    this.uploadImageButton = document.getElementById('uploadImage');
    this.imageForm = document.getElementById('tmpimage-form');
    this.mediaCapture = document.getElementById('mediaCapture');
    this.tmpImage = document.getElementById('tmpImage');

    this.inputForm = document.getElementById('input-form');
    this.qtitle = document.getElementById('qtitle');
    this.qtitleValue = document.getElementById('qtitleValue');
    this.qbody = document.getElementById('qbody');
    this.qbodyValue = document.getElementById('qbodyValue');
    this.category = document.getElementById('category');
    this.categoryValue = document.getElementById('categoryValue');
    this.period = document.getElementById('period');
    this.periodValue = document.getElementById('periodValue');
    this.area = document.getElementById('area');
    this.areaValue = document.getElementById('areaValue');

    this.submitButton = document.getElementById('submit');
    this.resolveButton = document.getElementById('resolve');
    this.answerButton = document.getElementById('answer');
    this.reportButton = document.getElementById('report');
    this.freezeButton = document.getElementById('freeze');
    this.deleteButton = document.getElementById('delete');

    this.createdAtValue = document.getElementById('createdAtValue');
    this.updatedAtValue = document.getElementById('updatedAtValue');
    this.userIdValue = document.getElementById('userIdValue');
    this.stateValue = document.getElementById('stateValue');
    this.commentsValue = document.getElementById('commentsValue');
    this.reportsValue = document.getElementById('reportsValue');

    // Button Events.
    this.submitButton.addEventListener('click', this.saveData.bind(this));
    this.resolveButton.addEventListener('click', this.resolve.bind(this));
    this.answerButton.addEventListener('click', this.answer.bind(this));
    this.reportButton.addEventListener('click', this.report.bind(this));
    this.freezeButton.addEventListener('click', this.freezeData.bind(this));
    this.deleteButton.addEventListener('click', this.deleteData.bind(this));

    // Events for image upload.
    this.uploadImageButton.addEventListener('click', function(e) {
        e.preventDefault();
        this.mediaCapture.click();
    }.bind(this));
    this.mediaCapture.addEventListener('change', this.saveImage.bind(this));

    // Initialize.
    this.initFirebase();
    this.initialize();
}

// Sets up shortcuts to Firebase features and initiate firebase auth.
QuestionDetail.prototype.initFirebase = function() {
    // Shortcuts to Firebase SDK features.
    this.auth = firebase.auth();
    this.database = firebase.database();
    this.storage = firebase.storage();
};

QuestionDetail.prototype.initialize = function() {
    this.parameters = getUrlParameters();
    if (this.parameters) {
        if (this.parameters["qid"]) {
            this.qid = this.parameters["qid"];
            this.fetchData();
        }
    }
};

QuestionDetail.prototype.setButtons = function() {
    if (this.stateValue.value != 0) {
        this.resolveButton.setAttribute('disabled', 'true');
        this.answerButton.setAttribute('disabled', 'true');
    }
    if (this.stateValue.value == 2) {
        this.freezeButton.textContent = '復帰';
    }
    if (this.auth.currentUser.uid == this.userIdValue.value) {
        this.answerButton.setAttribute('disabled', 'true');
        this.reportButton.setAttribute('disabled', 'true');
    }
};

QuestionDetail.prototype.fetchData = function() {
    this.ref = firebase.database().ref('/v1/question/' + this.qid);

    this.ref.once('value').then(function(snapshot) {
        var val = snapshot.val();
        this.qtitleValue.textContent = val.title;
        this.qbodyValue.textContent = val.body;
        this.categoryValue.textContent = getQuestionCategoryString(val.categories[0]);
        this.periodValue.textContent = unixtimeToString(val.limit);
        this.areaValue.textContent = getAreaString(val.area);

        this.createdAtValue.textContent = unixtimeToString(val._createdAt);
        this.updatedAtValue.textContent = unixtimeToString(val._updatedAt);
        this.stateValue.textContent = getQuestionStatusString(val.state);
        this.userIdValue.innerHTML = userIdStringToLinkHtml(val.userId);
        this.commentsValue.innerText = associativeArrayToString(val.comments);
        this.reportsValue.innerText = associativeArrayToString(val.reports);

        this.setImageUrl(val.imageUrl, this.tmpImage);

        this.stateValue.value = val.state;
        this.userIdValue.value = val.userId;
        this.setButtons();
    }.bind(this)).catch(function(error) {
        window.alert('質問が見つかりません！');
    });
};

// Sets the URL of the given img element with the URL of the image stored in Firebase Storage.
QuestionDetail.prototype.setImageUrl = function(imageUri, imgElement) {
    if (!imageUri) {
        return;
    }

    // If the image is a Firebase Storage URI we fetch the URL.
    if (imageUri.startsWith('gs://')) {             // Google Cloud Storage URI
        imgElement.src = 'https://www.google.com/images/spin-32.gif'; // Display a loading image first.
        this.storage.refFromURL(imageUri).getMetadata().then(function(metadata) {
            imgElement.src = metadata.downloadURLs[0];
        });
    } else if (imageUri.startsWith('/images/')) {   // Document path
        imgElement.src = imageUri;
    } else {    // initial file path and name
        imgElement.src = 'https://www.google.com/images/spin-32.gif'; // Display a loading image first.
        this.storage.ref(imageUri).getMetadata().then(function(metadata) {
            imgElement.src = metadata.downloadURLs[0];
        });
    }
};

// Saves a question info on the Firebase DB.
QuestionDetail.prototype.saveData = function(e) {
    e.preventDefault();

    if (!this.qtitle.value) {
        window.alert('タイトルが入力されていません！');
        return;
    }

    var unixTimestamp = getNowUnixtime();
    this.ref.update({
        _updatedAt: unixTimestamp,
        title: this.qtitle.value,
        body: this.qbody.value,
        categories: [getQuestionCategoryCode(this.category.value)],
        limit: unixTimestamp + getPeriodSecond(this.period),
        area: getAreaCode(this.area.value),
    });
    window.alert('質問情報を更新しました！');
    window.location.reload();
};

QuestionDetail.prototype.resolve = function(e) {
    e.preventDefault();

    if (this.stateValue.value == 0) {
        this.ref.update({
            _updatedAt: getNowUnixtime(),
            state: 1
        });
        window.alert('質問を解決しました！');
        window.location.reload();
    }
};

QuestionDetail.prototype.answer = function(e) {
    e.preventDefault();

    var currentUser = this.auth.currentUser;
    if (currentUser.uid == this.userIdValue.value) {
        window.alert('質問者は回答できません！');
        return;
    }

    var comment = window.prompt("回答を入力してください。※ログインユーザーでの回答になります", "");
    if (comment == null) {
        return;
    } else if (comment == "") {
        window.alert('コメントが入力されていません！');
        return;
    }

    // コメントを投稿する
    var unixTimestamp = getNowUnixtime();
    var currentUser = this.auth.currentUser;
    var commentRef = this.database.ref('v1/comment/');
    commentRef.push({
        _createdAt: unixTimestamp,
        _createdAtReverse: -unixTimestamp,
        _updatedAt: unixTimestamp,
        userId: currentUser.uid,
        questionId: this.qid,
        state: 0,
        category: 0,
        body: comment,
        imageUrl: '',
    }).then(function(data) {
        // 質問・ユーザーをまとめて更新する
        var updates = {};
        updates['/v1/question/' + this.qid + '/comments/' + data.key] = true;
        updates['/v1/user/' + currentUser.uid + '/answers/' + data.key] = true;
        this.database.ref().update(updates);
        window.alert('回答を投稿しました！');
        window.location.reload();
    }.bind(this)).catch(function(error) {
        console.error('Error writing new comment to Firebase Database', error);
    });
};

QuestionDetail.prototype.report = function(e) {
    e.preventDefault();

    var currentUser = this.auth.currentUser;
    if (currentUser.uid == this.userIdValue.value) {
        window.alert('質問者は通報できません！');
        return;
    }

    var report = window.prompt("通報内容を入力してください。※ログインユーザーでの通報になります", "");
    if (report == null) {
        return;
    } else if (report == "") {
        window.alert('コメントが入力されていません！');
        return;
    }

    // 通報を投稿する
    var unixTimestamp = getNowUnixtime();
    var currentUser = this.auth.currentUser;
    var reportRef = this.database.ref('v1/report/');
    reportRef.push({
        _createdAt: unixTimestamp,
        _createdAtReverse: -unixTimestamp,
        _updatedAt: unixTimestamp,
        userId: currentUser.uid,
        questionId: this.qid,
        state: 0,
        category: 0,
        target: 0,
        body: report,
    }).then(function(data) {
        // 質問・ユーザーをまとめて更新する
        var updates = {};
        updates['/v1/question/' + this.qid + '/reports/' + data.key] = true;
        updates['/v1/user/' + currentUser.uid + '/reports/' + data.key] = true;
        this.database.ref().update(updates);
        window.alert('通報しました！');
        window.location.reload();
    }.bind(this)).catch(function(error) {
        console.error('Error writing new report to Firebase Database', error);
    });
};

QuestionDetail.prototype.freezeData = function(e) {
    e.preventDefault();

    if (this.stateValue.value != 2) {
        this.ref.update({
            _updatedAt: getNowUnixtime(),
            state: 2
        });
        window.alert('質問を凍結しました！');
    } else if (this.stateValue.value == 2) {
        this.ref.update({
            _updatedAt: getNowUnixtime(),
            state: 1
        });
        window.alert('質問を復帰させました！\n※クローズになっています');
    }
    window.location.reload();
};

QuestionDetail.prototype.deleteData = function(e) {
    e.preventDefault();

    if (window.confirm('質問を削除します。よろしいですね？？\n※この作業は戻せません')) {
        this.ref.remove();
        window.alert('質問削除完了しました！');
        location.href = "../views/questions.html";
    };

    // TODO: 画像、関連コメントの削除
};

QuestionDetail.prototype.saveImage = function(event) {
    event.preventDefault();
    var file = event.target.files[0];

    // Clear the selection in the file picker input.
    this.imageForm.reset();

    // Check if the file is an image.
    if (!file.type.match('image.*')) {
        window.alert('不正なファイル形式です！');
        return;
    }

    var currentUser = this.auth.currentUser;
    var filePath = 'qa/' + this.qid + '/' + this.userIdValue.value + '/' + file.name;
    this.storage.ref(filePath).put(file).then(function(snapshot) {
        var fullPath = snapshot.metadata.fullPath;
        this.updateImageUrl(fullPath);
        this.setImageUrl(fullPath, this.tmpImage);
    }.bind(this)).catch(function(error) {
         console.error('There was an error uploading a file to Firebase Storage:', error);
    });

    // TODO: 古い画像の削除
};

QuestionDetail.prototype.updateImageUrl = function(url) {
    this.ref.update({
        _updatedAt: getNowUnixtime(),
        imageUrl: url
    });
};

window.onload = function() {
    window.authenticater = new Authenticator();
    window.QuestionDetail = new QuestionDetail();
};
