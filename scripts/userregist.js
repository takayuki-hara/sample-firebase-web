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
function UserRegister() {

    // Shortcuts to DOM Elements.
    this.userForm = document.getElementById('user-form');
    this.userId = document.getElementById('userId');
    this.language = document.getElementById('language');
    this.positions = document.getElementsByName('positions');
    this.genders = document.getElementsByName('genders');
    this.age = document.getElementById('age');
    this.area = document.getElementById('area');
    this.introduction = document.getElementById('introduction');

    this.submitButton = document.getElementById('submit');

    // Saves user info on form submit.
    this.submitButton.addEventListener('click', this.saveUser.bind(this));

    this.initFirebase();
}

// Sets up shortcuts to Firebase features and initiate firebase auth.
UserRegister.prototype.initFirebase = function() {
    // Shortcuts to Firebase SDK features.
    this.auth = firebase.auth();
    this.database = firebase.database();
    this.storage = firebase.storage();
};

// Saves a user info on the Firebase DB.
UserRegister.prototype.saveUser = function(e) {
    e.preventDefault();

    if (!this.userId.value) {
        window.alert('ユーザーIDが入力されていません！');
        return;
    }

    var currentUser = this.auth.currentUser;
    this.messagesRef = this.database.ref('v1/user/' + currentUser.uid);

    // Add a new message entry to the Firebase Database.
    var date = new Date();
    var unixTimestamp = Math.round( date.getTime() / 1000 );
    this.messagesRef.set({
        _createdAt: unixTimestamp,
        _createdAtReverse: -unixTimestamp,
        _updatedAt: unixTimestamp,
        state: 1,
        name: this.userId.value,
        position: this.getPositionCode(),
        languages: [this.getLangageCode()],
        gender: this.getGenderCode(),
        ageRange: this.getAgeCode(),
        area: this.getAreaCode(),
        imageUrl: '',
        profileText: this.introduction.value,
        accessRights: 0,
        authType: 3,
        deviceType: 2,
        fcmToken: '',
        lastLogin: unixTimestamp,
    }).then(function() {
        this.updateName(this.userId.value);
        this.submitButton.setAttribute('disabled', 'true');
        window.alert('ユーザー登録完了しました！\nサインアウトし、ログイン画面に戻ってください。');
    }.bind(this)).catch(function(error) {
        console.error('Error writing new message to Firebase Database', error);
    });
};

UserRegister.prototype.updateName = function(name) {
    var currentUser = this.auth.currentUser;
    currentUser.updateProfile({
        displayName: name
    }).then(function() {
        console.log("updatename success!");
    }).catch(function(error) {
        console.error('Error updating user info to Firebase Database', error);
    });
};

UserRegister.prototype.getPositionCode = function() {
    if (this.positions[0].checked) {
        return 0;
    } else if (this.positions[1].checked) {
        return 1;
    } else {
        return 2;
    }
};

UserRegister.prototype.getGenderCode = function() {
    if (this.genders[0].checked) {
        return 0;
    } else if (this.genders[1].checked) {
        return 1;
    } else {
        return 2;
    }
};

UserRegister.prototype.getLangageCode = function() {
    if (this.language.value == "日本語") {
        return 0;
    } else if (this.language.value == "英語") {
        return 1;
    } else if (this.language.value == "中国語（簡体字）") {
        return 2;
    } else {
        return 3;
    }
};

UserRegister.prototype.getAgeCode = function() {
    if (this.age.value == "10代") {
        return 0;
    } else if (this.age.value == "20代") {
        return 1;
    } else if (this.age.value == "30代") {
        return 2;
    } else {
        return 3;
    }
};

UserRegister.prototype.getAreaCode = function() {
    if (this.area.value == "関東") {
        return 0;
    } else if (this.area.value == "関西") {
        return 1;
    } else if (this.area.value == "北海道") {
        return 2;
    } else {
        return 3;
    }
};

window.onload = function() {
    window.authenticater = new Authenticator();
    window.UserRegister = new UserRegister();
};
