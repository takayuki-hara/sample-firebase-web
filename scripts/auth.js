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

// Initializes Authenticator.
function Authenticator() {
    this.checkSetup();
    this.initFirebase();

    // Shortcuts to DOM Elements.
    this.userPic = document.getElementById('user-pic');
    this.userName = document.getElementById('user-name');
    this.signInButton = document.getElementById('sign-in');
    this.signOutButton = document.getElementById('sign-out');

    // Bind button events.
    this.signOutButton.addEventListener('click', this.signOut.bind(this));
    this.signInButton.addEventListener('click', this.signIn.bind(this));
}

// Sets up shortcuts to Firebase features and initiate firebase auth.
Authenticator.prototype.initFirebase = function() {
    // Shortcuts to Firebase SDK features.
    this.auth = firebase.auth();
    this.database = firebase.database();

    // Initiates Firebase auth and listen to auth state changes.
    this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
};


// Signs-in.
//Authenticator.prototype.signIn = function() {
//    // Sign in Firebase using popup auth and Google as the identity provider.
//    var provider = new firebase.auth.GoogleAuthProvider();
//    this.auth.signInWithPopup(provider);
//};

// Signs-out.
Authenticator.prototype.signOut = function() {
    // Sign out of Firebase.
    this.auth.signOut();
};

// Signs-in.
Authenticator.prototype.signIn = function(e) {
    e.preventDefault();
    this.email = document.getElementById('email');
    this.password = document.getElementById('password');

    this.auth.signInWithEmailAndPassword(this.email.value, this.password.value).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        window.alert('認証エラー');
    });
};

// Triggers when the auth state change for instance when the user signs-in or signs-out.
Authenticator.prototype.onAuthStateChanged = function(user) {
    if (user) { // User is signed in!
        // Get profile pic and user's name from the Firebase user object.
        var profilePicUrl = user.photoURL;
        var userName = user.displayName;

        // Set the user's profile pic and name.
        this.userPic.style.backgroundImage = 'url(' + (profilePicUrl || '/images/profile_placeholder.png') + ')';
        this.userName.textContent = userName;

        // Show user's profile and sign-out button.
        this.userName.removeAttribute('hidden');
        this.userPic.removeAttribute('hidden');
        this.signOutButton.removeAttribute('hidden');

        // Hide sign-in button.
        this.signInButton.setAttribute('hidden', 'true');

        // Check access rights.
        if (this.isLoginPage()) {
            this.checkUser();
        } else if (this.isUserRegistPage()) {
            // no proc
        } else {
            this.checkAdminUser();
        }
    } else { // User is signed out!

        this.toLogin();

        // Hide user's profile and sign-out button.
        this.userName.setAttribute('hidden', 'true');
        this.userPic.setAttribute('hidden', 'true');
        this.signOutButton.setAttribute('hidden', 'true');

        // Show sign-in button.
        this.signInButton.removeAttribute('hidden');
    }
};

// Redirect login page.
Authenticator.prototype.toLogin = function() {
    if (this.isLoginPage()) {
        return;
    }
    location.href = "../views/login.html";
};

// Check login page.
Authenticator.prototype.isLoginPage = function() {
    var path = location.pathname;
    var pathinfo = path.split('/');
    var filename = pathinfo.pop();
    if (filename == "login.html") {
        return true;
    }
    return false;
};

// Check regist page.
Authenticator.prototype.isUserRegistPage = function() {
    var path = location.pathname;
    var pathinfo = path.split('/');
    var filename = pathinfo.pop();
    if (filename == "userregist.html") {
        return true;
    }
    return false;
};

// Check admin user.
Authenticator.prototype.checkAdminUser = function() {
    var currentUser = this.auth.currentUser;
    return this.database.ref('/admin/managers/').once('value').then(function(snapshot) {
        return; // check ok
    }.bind(this)).catch(function(error) {
        window.alert('システム管理者ユーザーではありません。\nシステムにログインできません。');
        this.signOut();
    }.bind(this));
};

// Check login page.
Authenticator.prototype.checkUser = function() {
    var currentUser = this.auth.currentUser;
    return this.database.ref('/v1/user/' + currentUser.uid).once('value').then(function(snapshot) {
        var accessRights = snapshot.val() && snapshot.val().accessRights;
        if (accessRights == null) {
            window.alert('認証できましたがユーザー登録が完了していません。\nユーザー登録を行なってください。');
            location.href = "../views/userregist.html";
        } else if (accessRights == 1) {
            location.href = "../views/top.html";
        } else {
            window.alert('システム管理者ユーザーではありません。\nシステムにログインできません。');
            this.signOut();
        }
    }.bind(this));
};

// Checks that the Firebase SDK has been correctly setup and configured.
Authenticator.prototype.checkSetup = function() {
    if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
        window.alert('You have not configured and imported the Firebase SDK. ' +
            'Make sure you go through the codelab setup instructions and make ' +
            'sure you are running the codelab using `firebase serve`');
    }
};
