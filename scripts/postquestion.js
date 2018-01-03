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

// Initializes PostQuestion.
function PostQuestion() {

    // Shortcuts to DOM Elements.
    this.questionForm = document.getElementById('question-form');
    this.qtitle = document.getElementById('qtitle');
    this.qbody = document.getElementById('qbody');
    this.category = document.getElementById('category');
    this.period = document.getElementById('period');
    this.area = document.getElementById('area');

    // Events.
    this.submitButton = document.getElementById('submit');

    // Saves user info on form submit.
    this.submitButton.addEventListener('click', this.saveQuestion.bind(this));

    // Initialize.
    this.initFirebase();
}

// Sets up shortcuts to Firebase features and initiate firebase auth.
PostQuestion.prototype.initFirebase = function() {
    // Shortcuts to Firebase SDK features.
    this.auth = firebase.auth();
    this.database = firebase.database();
    this.storage = firebase.storage();
};

// Saves a question info on the Firebase DB.
PostQuestion.prototype.saveQuestion = function(e) {
    e.preventDefault();

    if (!this.qtitle.value) {
        window.alert('タイトルが入力されていません！');
        return;
    }

    var currentUser = this.auth.currentUser;
    var questionRef = this.database.ref('v1/question/');

    var unixTimestamp = getNowUnixtime();
    questionRef.push({
        _createdAt: unixTimestamp,
        _createdAtReverse: -unixTimestamp,
        _updatedAt: unixTimestamp,
        userId: currentUser.uid,
        state: 0,
        title: this.qtitle.value,
        body: this.qbody.value,
        categories: [getQuestionCategoryCode(this.category.value)],
        limit: unixTimestamp + getPeriodSecond(this.period),
        area: getAreaCode(this.area.value),
        imageUrl: '',
    }).then(function(data) {
        this.updateUserData(data.key);
        this.moveDetail(data.key);
        window.alert('質問を投稿しました！');
    }.bind(this)).catch(function(error) {
        console.error('Error writing new message to Firebase Database', error);
    });
};

PostQuestion.prototype.updateUserData = function(qid) {
    var currentUser = this.auth.currentUser;
    var userRef = this.database.ref('v1/user/' + currentUser.uid);
    userRef.update({
        _updatedAt: getNowUnixtime()
    });
    userRef.child('questions/').child(qid).set(true);
};

PostQuestion.prototype.moveDetail = function(qid) {
    location.href = "../views/questionDetail.html?qid=" + qid;
};

window.onload = function() {
    window.authenticater = new Authenticator();
    window.PostQuestion = new PostQuestion();
};
