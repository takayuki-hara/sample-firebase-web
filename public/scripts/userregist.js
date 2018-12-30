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

    // Events.
    this.submitButton = document.getElementById('submit');

    // Saves user info on form submit.
    this.submitButton.addEventListener('click', this.saveUser.bind(this));

    // Initialize.
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
    var userRef = this.database.ref(dbRoot + '/user/' + currentUser.uid);

    var unixTimestamp = getNowUnixtime();
    userRef.set({
        _createdAt: unixTimestamp,
        _createdAtReverse: -unixTimestamp,
        _updatedAt: unixTimestamp,
        state: 1,
        name: this.userId.value,
        position: getPositionCode(this.positions),
        languages: [getLanguageCode(this.language.value)],
        gender: getGenderCode(this.genders),
        ageRange: getAgeCode(this.age.value),
        area: getAreaCode(this.area.value),
        imageUrl: '',
        profileText: this.introduction.value,
        accessRights: 0,
        authType: 3,
        deviceType: 2,
        fcmToken: '',
        lastLogin: unixTimestamp,
    }).then(function() {
        this.updateAuthName(this.userId.value);
        this.submitButton.setAttribute('disabled', 'true');
        window.alert('ユーザー登録完了しました！\nサインアウトし、ログイン画面に戻ってください。');
    }.bind(this)).catch(function(error) {
        console.error('Error writing new user to Firebase Database', error);
    });
};

UserRegister.prototype.updateAuthName = function(name) {
    var currentUser = this.auth.currentUser;
    currentUser.updateProfile({
        displayName: name
    }).then(function() {
        console.log("updateAuthName success!");
    }).catch(function(error) {
        console.error('Error updating user info to Firebase Authentication', error);
    });
};

window.onload = function() {
    window.authenticater = new Authenticator();
    window.UserRegister = new UserRegister();
};
