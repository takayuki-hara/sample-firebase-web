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

// Initializes CommentDetail.
function CommentDetail() {

    // Shortcuts to DOM Elements.
    this.uploadImageButton = document.getElementById('uploadImage');
    this.imageForm = document.getElementById('tmpimage-form');
    this.mediaCapture = document.getElementById('mediaCapture');
    this.tmpImage = document.getElementById('tmpImage');

    this.inputForm = document.getElementById('input-form');
    this.cbody = document.getElementById('cbody');
    this.cbodyValue = document.getElementById('cbodyValue');

    this.submitButton = document.getElementById('submit');
    this.replyButton = document.getElementById('reply');
    this.reportButton = document.getElementById('report');
    this.freezeButton = document.getElementById('freeze');
    this.deleteButton = document.getElementById('delete');

    this.userIdValue = document.getElementById('userIdValue');
    this.questionIdValue = document.getElementById('questionIdValue');
    this.commentIdValue = document.getElementById('commentIdValue');
    this.stateValue = document.getElementById('stateValue');
    this.categoryValue = document.getElementById('categoryValue');
    this.reportsValue = document.getElementById('reportsValue');
    this.createdAtValue = document.getElementById('createdAtValue');
    this.updatedAtValue = document.getElementById('updatedAtValue');

    // Button Events.
    this.submitButton.addEventListener('click', this.saveData.bind(this));
    this.replyButton.addEventListener('click', this.reply.bind(this));
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
CommentDetail.prototype.initFirebase = function() {
    // Shortcuts to Firebase SDK features.
    this.auth = firebase.auth();
    this.database = firebase.database();
    this.storage = firebase.storage();
};

CommentDetail.prototype.initialize = function() {
    this.parameters = getUrlParameters();
    if (this.parameters) {
        if (this.parameters["cid"]) {
            this.cid = this.parameters["cid"];
            this.fetchData();
        }
    }
};

CommentDetail.prototype.setButtons = function() {
    if (this.stateValue.value == 1) {
        this.freezeButton.textContent = '復帰';
    }
    if (this.auth.currentUser.uid == this.userIdValue.value) {
        this.reportButton.setAttribute('disabled', 'true');
        this.replyButton.setAttribute('disabled', 'true');
    }
};

CommentDetail.prototype.fetchData = function() {
    this.ref = firebase.database().ref('/v1/comment/' + this.cid);

    this.ref.once('value').then(function(snapshot) {
        var val = snapshot.val();
        this.cbodyValue.textContent = val.body;

        this.userIdValue.innerHTML = userIdStringToLinkHtml(val.userId);
        this.questionIdValue.innerHTML = questionIdStringToLinkHtml(val.questionId);
        this.commentIdValue.innerHTML = commentIdStringToLinkHtml(val.commentId);
        this.stateValue.textContent = getCommentStatusString(val.state);
        this.categoryValue.textContent = getCommentCategoryString(val.category);
        this.reportsValue.innerText = associativeArrayToString(val.reports);
        this.createdAtValue.textContent = unixtimeToString(val._createdAt);
        this.updatedAtValue.textContent = unixtimeToString(val._updatedAt);

        this.setImageUrl(val.imageUrl, this.tmpImage);

        this.stateValue.value = val.state;
        this.userIdValue.value = val.userId;
        this.questionIdValue.value = val.questionId;
        this.setButtons();
    }.bind(this)).catch(function(error) {
        console.error('Error writing fetch comment to Firebase Database', error);
        window.alert('コメントが見つかりません！');
    });
};

// Sets the URL of the given img element with the URL of the image stored in Firebase Storage.
CommentDetail.prototype.setImageUrl = function(imageUri, imgElement) {
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
CommentDetail.prototype.saveData = function(e) {
    e.preventDefault();

    this.ref.update({
        _updatedAt: getNowUnixtime(),
        body: this.cbody.value,
    });
    window.alert('コメント情報を更新しました！');
    window.location.reload();
};

CommentDetail.prototype.reply = function(e) {
    e.preventDefault();

    var currentUser = this.auth.currentUser;
    if (currentUser.uid == this.userIdValue.value) {
        window.alert('自身のコメントには返信できません！');
        return;
    }

    var comment = window.prompt("返信内容を入力してください。※ログインユーザーでの返信になります", "");
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
        questionId: this.questionIdValue.value,
        state: 0,
        category: 1,
        body: comment,
        imageUrl: '',
    }).then(function(data) {
        // 質問・ユーザーをまとめて更新する
        var updates = {};
        updates['/v1/question/' + this.questionIdValue.value + '/comments/' + data.key] = true;
        updates['/v1/user/' + currentUser.uid + '/replies/' + data.key] = true;
        this.database.ref().update(updates);
        window.alert('返信を投稿しました！');
        window.location.reload();
    }.bind(this)).catch(function(error) {
        console.error('Error writing new comment to Firebase Database', error);
    });
};

CommentDetail.prototype.report = function(e) {
    e.preventDefault();

    var currentUser = this.auth.currentUser;
    if (currentUser.uid == this.userIdValue.value) {
        window.alert('自身のコメントは通報できません！');
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
        questionId: this.questionIdValue.value,
        state: 0,
        category: 0,
        target: 1,
        body: report,
    }).then(function(data) {
        // 質問・ユーザーをまとめて更新する
        var updates = {};
        updates['/v1/question/' + this.questionIdValue.value + '/reports/' + data.key] = true;
        updates['/v1/user/' + currentUser.uid + '/reports/' + data.key] = true;
        this.database.ref().update(updates);
        window.alert('通報しました！');
        window.location.reload();
    }.bind(this)).catch(function(error) {
        console.error('Error writing new report to Firebase Database', error);
    });
};

CommentDetail.prototype.freezeData = function(e) {
    e.preventDefault();

    if (this.stateValue.value == 0) {
        this.ref.update({
            _updatedAt: getNowUnixtime(),
            state: 1
        });
        window.alert('コメントを凍結しました！');
    } else if (this.stateValue.value == 1) {
        this.ref.update({
            _updatedAt: getNowUnixtime(),
            state: 0
        });
        window.alert('コメントを復帰させました！');
    }
    window.location.reload();
};

CommentDetail.prototype.deleteData = function(e) {
    e.preventDefault();

    if (window.confirm('コメントを削除します。よろしいですね？？\n※この作業は戻せません')) {
        this.ref.remove();
        window.alert('コメント削除完了しました！');
        location.href = "../views/comments.html";
    };

    // TODO: 画像の削除
};

CommentDetail.prototype.saveImage = function(event) {
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
    var filePath = 'qa/' + this.questionIdValue.value + '/' + this.userIdValue.value + '/' + file.name;
    this.storage.ref(filePath).put(file).then(function(snapshot) {
        var fullPath = snapshot.metadata.fullPath;
        this.updateImageUrl(fullPath);
        this.setImageUrl(fullPath, this.tmpImage);
    }.bind(this)).catch(function(error) {
         console.error('There was an error uploading a file to Firebase Storage:', error);
    });

    // TODO: 古い画像の削除
};

CommentDetail.prototype.updateImageUrl = function(url) {
    this.ref.update({
        _updatedAt: getNowUnixtime(),
        imageUrl: url
    });
};

window.onload = function() {
    window.authenticater = new Authenticator();
    window.CommentDetail = new CommentDetail();
};
