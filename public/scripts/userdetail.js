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

// Initializes UserDetail.
function UserDetail() {

    // Shortcuts to DOM Elements.
    this.uploadImageButton = document.getElementById('uploadImage');
    this.imageForm = document.getElementById('tmpimage-form');
    this.mediaCapture = document.getElementById('mediaCapture');
    this.tmpImage = document.getElementById('tmpImage');

    this.userForm = document.getElementById('input-form');
    this.userId = document.getElementById('userId');
    this.userIdValue = document.getElementById('userIdValue');
    this.language = document.getElementById('language');
    this.languageValue = document.getElementById('languageValue');
    this.positions = document.getElementsByName('positions');
    this.positionValue = document.getElementById('positionValue');
    this.genders = document.getElementsByName('genders');
    this.genderValue = document.getElementById('genderValue');
    this.age = document.getElementById('age');
    this.ageValue = document.getElementById('ageValue');
    this.area = document.getElementById('area');
    this.areaValue = document.getElementById('areaValue');
    this.introduction = document.getElementById('introduction');
    this.introductionValue = document.getElementById('introductionValue');

    this.submitButton = document.getElementById('submit');
    this.freezeButton = document.getElementById('freeze');
    this.leaveButton = document.getElementById('leave');
//    this.deleteButton = document.getElementById('delete');

    this.stateValue = document.getElementById('stateValue');
    this.accessRightsValue = document.getElementById('accessRightsValue');
    this.authTypeValue = document.getElementById('authTypeValue');
    this.deviceTypeValue = document.getElementById('deviceTypeValue');
    this.questionsValue = document.getElementById('questionsValue');
    this.repliesValue = document.getElementById('repliesValue');
    this.answersValue = document.getElementById('answersValue');
    this.reportsValue = document.getElementById('reportsValue');
    this.lastLoginValue = document.getElementById('lastLoginValue');
    this.createdAtValue = document.getElementById('createdAtValue');
    this.updatedAtValue = document.getElementById('updatedAtValue');

    // Button Events.
    this.submitButton.addEventListener('click', this.saveData.bind(this));
    this.freezeButton.addEventListener('click', this.freezeData.bind(this));
    this.leaveButton.addEventListener('click', this.leaveData.bind(this));
//    this.deleteButton.addEventListener('click', this.deleteData.bind(this));

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
UserDetail.prototype.initFirebase = function() {
    // Shortcuts to Firebase SDK features.
    this.auth = firebase.auth();
    this.database = firebase.database();
    this.storage = firebase.storage();
};

UserDetail.prototype.initialize = function() {
    this.parameters = getUrlParameters();
    if (this.parameters) {
        if (this.parameters["uid"]) {
            this.uid = this.parameters["uid"];
            this.fetchData();
        }
    }
};

UserDetail.prototype.setButtons = function() {
    if (this.stateValue.value == 2) {
        this.freezeButton.textContent = '復帰';
    } else if (this.stateValue.value == 3) {
        this.freezeButton.setAttribute('disabled', 'true');
        this.leaveButton.setAttribute('disabled', 'true');
    }
};

UserDetail.prototype.fetchData = function() {
    this.ref = this.database.ref(dbRoot + '/user/' + this.uid);

    this.ref.once('value').then(function(snapshot) {
        var val = snapshot.val();
        this.userIdValue.textContent = escapeHtml(val.name);
        this.languageValue.innerText = languageArrayToString(val.languages);
        this.positionValue.textContent = getPositionString(val.position);
        this.genderValue.textContent = getGenderString(val.gender);
        this.ageValue.textContent = getAgeString(val.ageRange);
        this.areaValue.textContent = getAreaString(val.area);
        this.introductionValue.textContent = escapeHtml(val.profileText);

        this.stateValue.textContent = getUserStatusString(val.state);
        this.accessRightsValue.textContent = getAccessRightsString(val.accessRights);
        this.authTypeValue.textContent = getAuthTypeString(val.authType);
        this.deviceTypeValue.textContent = getDeviceTypeString(val.deviceType);
        this.questionsValue.innerHTML = questionArrayToLinkHtml(val.questions);
        this.repliesValue.innerHTML = commentArrayToLinkHtml(val.replies);
        this.answersValue.innerHTML = commentArrayToLinkHtml(val.answers);
        this.reportsValue.innerText = associativeArrayToString(val.reports);
        this.lastLoginValue.textContent = unixtimeToString(val.lastLogin);
        this.createdAtValue.textContent = unixtimeToString(val._createdAt);
        this.updatedAtValue.textContent = unixtimeToString(val._updatedAt);

        this.setImageUrl(val.imageUrl, this.tmpImage);

        this.stateValue.value = val.state;
        this.setButtons();
    }.bind(this)).catch(function(error) {
        console.error('Error writing fetch user to Firebase Database', error);
        window.alert('ユーザーが見つかりません！');
    });
};

// Sets the URL of the given img element with the URL of the image stored in Firebase Storage.
UserDetail.prototype.setImageUrl = function(imageUri, imgElement) {
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

// Saves a user info on the Firebase DB.
UserDetail.prototype.saveData = function(e) {
    e.preventDefault();

    if (!this.userId.value) {
        window.alert('ユーザーIDが入力されていません！');
        return;
    }

    this.ref.update({
        _updatedAt: getNowUnixtime(),
        name: this.userId.value,
        position: getPositionCode(this.positions),
        languages: [getLanguageCode(this.language.value)],
        gender: getGenderCode(this.genders),
        ageRange: getAgeCode(this.age.value),
        area: getAreaCode(this.area.value),
        profileText: this.introduction.value,
    });
    window.alert('ユーザー情報を更新しました！');
    window.location.reload();
};

UserDetail.prototype.freezeData = function(e) {
    e.preventDefault();

    if (this.stateValue.value == 1) {
        this.ref.update({
            _updatedAt: getNowUnixtime(),
            state: 2
        });
        window.alert('ユーザーを凍結しました！');
        window.location.reload();
    } else if (this.stateValue.value == 2) {
        this.ref.update({
            _updatedAt: getNowUnixtime(),
            state: 1
        });
        window.alert('ユーザーを復帰させました！');
        window.location.reload();
    }
};

UserDetail.prototype.leaveData = function(e) {
    e.preventDefault();

    if (window.confirm('ユーザーを退会状態にします。よろしいですね？？\n※この作業はアプリからは戻せません')) {
        this.ref.update({
            _updatedAt: getNowUnixtime(),
            state: 3
        });
        window.alert('ユーザーを退会状態にしました！');
        window.location.reload();
    }
};

//UserDetail.prototype.deleteData = function(e) {
//    e.preventDefault();
//
//    if (window.confirm('ユーザーを削除します。よろしいですね？？\n※この作業は戻せません')) {
//        this.ref.remove();
//        window.alert('ユーザー削除完了しました！');
//        location.href = "../views/users.html";
//    };
//};

UserDetail.prototype.saveImage = function(event) {
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
    var filePath = 'user/' + this.uid + '/' + file.name;
    this.storage.ref(filePath).put(file).then(function(snapshot) {
        var fullPath = snapshot.metadata.fullPath;
        this.updateImageUrl(fullPath);
        this.updateAuthPhotoURL(snapshot.metadata.downloadURLs[0]);
        this.setImageUrl(fullPath, this.tmpImage);
    }.bind(this)).catch(function(error) {
         console.error('There was an error uploading a file to Firebase Storage:', error);
    });

    // TODO: 古い画像の削除
};

UserDetail.prototype.updateImageUrl = function(url) {
    this.ref.update({
        _updatedAt: getNowUnixtime(),
        imageUrl: url
    });
};

UserDetail.prototype.updateAuthName = function(name) {
    // ログイン中のユーザーの情報を更新したらFirebase Authenticationの情報も更新する
    var currentUser = this.auth.currentUser;
    if (currentUser.uid != this.uid) {
        return;
    }
    currentUser.updateProfile({
        displayName: name
    }).then(function() {
        console.log("updateAuthName success!");
    }).catch(function(error) {
        console.error('Error updating user info to Firebase Authentication', error);
    });
};

UserDetail.prototype.updateAuthPhotoURL = function(url) {
    // ログイン中のユーザーの情報を更新したらFirebase Authenticationの情報も更新する
    var currentUser = this.auth.currentUser;
    if (currentUser.uid != this.uid) {
        return;
    }
    currentUser.updateProfile({
        photoURL: url
    }).then(function() {
        console.log("updateAuthPhotoURL success!");
    }).catch(function(error) {
        console.error('Error updating user info to Firebase Authentication', error);
    });
};

window.onload = function() {
    window.authenticater = new Authenticator();
    window.UserDetail = new UserDetail();
};
