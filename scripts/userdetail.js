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

// Initializes UserRegister.
function UserDetail() {

    // Shortcuts to DOM Elements.
    this.uploadImageButton = document.getElementById('uploadImage');
    this.imageForm = document.getElementById('profimage-form');
    this.mediaCapture = document.getElementById('mediaCapture');
    this.profImage = document.getElementById('profImage');

    this.userForm = document.getElementById('user-form');
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
    this.freezeButton = document.getElementById('userFreeze');
    this.deleteButton = document.getElementById('userDelete');

    // Button Events.
    this.submitButton.addEventListener('click', this.saveUser.bind(this));
    this.freezeButton.addEventListener('click', this.freezeUser.bind(this));
    this.deleteButton.addEventListener('click', this.deleteUser.bind(this));

    // Events for image upload.
    this.uploadImageButton.addEventListener('click', function(e) {
        e.preventDefault();
        this.mediaCapture.click();
    }.bind(this));
    this.mediaCapture.addEventListener('change', this.saveProfileImage.bind(this));

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
            this.fetchUser();
        }
    }
};

UserDetail.prototype.fetchUser = function() {
    this.userRef = firebase.database().ref('/v1/user/' + this.uid);
    //var query = this.userRef; //ref.orderByChild("_createdAtReverse").equalTo(this.uid);

    this.userRef.once('value').then(function(snapshot) {
        var val = snapshot.val();
        this.userIdValue.textContent = val.name;
        this.languageValue.textContent = getLanguageString(val.languages[0]);
        this.positionValue.textContent = getPositionString(val.position);
        this.genderValue.textContent = getGenderString(val.gender);
        this.ageValue.textContent = getAgeString(val.ageRange);
        this.areaValue.textContent = getAreaString(val.area);
        this.introductionValue.textContent = val.profileText;
        this.setImageUrl(val.imageUrl, this.profImage);
    }.bind(this));
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
    } else if (imageUri.startsWith('/')) {          // initial file path and name
        imgElement.src = 'https://www.google.com/images/spin-32.gif'; // Display a loading image first.
        this.storage.ref(imageUri).getMetadata().then(function(metadata) {
            imgElement.src = metadata.downloadURLs[0];
        });
    } else {
        imgElement.src = imageUri;
    }
};

// Saves a user info on the Firebase DB.
UserDetail.prototype.saveUser = function(e) {
    e.preventDefault();

    if (!this.userId.value) {
        window.alert('ユーザーIDが入力されていません！');
        return;
    }

    var date = new Date();
    var unixTimestamp = Math.round( date.getTime() / 1000 );
    this.userRef.update({
        _updatedAt: unixTimestamp,
        name: this.userId.value,
        position: getPositionCode(this.positions),
        languages: [getLanguageCode(this.language.value)],
        gender: getGenderCode(this.genders),
        ageRange: getAgeCode(this.age.value),
        area: getAreaCode(this.area.value),
        profileText: this.introduction.value,
    });
    window.alert('ユーザー情報を更新しました！');
};

UserDetail.prototype.freezeUser = function(e) {
    e.preventDefault();

    var date = new Date();
    var unixTimestamp = Math.round( date.getTime() / 1000 );
    this.userRef.update({
        _updatedAt: unixTimestamp,
        state: 2
    });
    window.alert('ユーザーを凍結しました！');
    this.freezeButton.setAttribute('disabled', 'true');
};

UserDetail.prototype.deleteUser = function(e) {
    e.preventDefault();

    this.userRef.remove();
    window.alert('ユーザー削除完了しました！');
    location.href = "../views/users.html";
};

UserDetail.prototype.saveProfileImage = function(event) {
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
    var filePath = this.uid + '/profile/' + file.name;
    this.storage.ref(filePath).put(file).then(function(snapshot) {
        // Get the file's Storage URI and update the chat message placeholder.
        var fullPath = snapshot.metadata.fullPath;
        this.updateProfileImage(fullPath);
        this.updateAuthPhotoURL(snapshot.metadata.downloadURLs[0]);
        this.setImageUrl(url, this.profImage);
    }.bind(this)).catch(function(error) {
         console.error('There was an error uploading a file to Firebase Storage:', error);
    });
};

UserDetail.prototype.updateProfileImage = function(url) {
    var date = new Date();
    var unixTimestamp = Math.round( date.getTime() / 1000 );
    this.userRef.update({
        _updatedAt: unixTimestamp,
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
