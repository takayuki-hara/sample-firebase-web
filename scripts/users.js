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
function UserList() {

    // Shortcuts to DOM Elements.
    this.userForm = document.getElementById('user-form');
    this.beforeButton = document.getElementById('before');
    this.nextButton = document.getElementById('next');
    this.detailButtons = document.getElementsByName('detail');

    // Events.
    this.userForm.addEventListener('click', this.moveUserDetail.bind(this));
    this.beforeButton.addEventListener('click', this.moveBefore.bind(this));
    this.nextButton.addEventListener('click', this.moveNext.bind(this));

    // Initialize.
    this.getParameters();
    this.initFirebase();

    // Fetch User List.
    this.fetchUsers();
}

// Sets up shortcuts to Firebase features and initiate firebase auth.
UserList.prototype.initFirebase = function() {
    // Shortcuts to Firebase SDK features.
    this.auth = firebase.auth();
    this.database = firebase.database();
    this.storage = firebase.storage();
};

UserList.prototype.moveUserDetail = function(e) {
    e.preventDefault();
    if (this.selectedUserId) {
        location.href = "../views/userdetail.html?uid=" + this.selectedUserId;
    }
};

UserList.prototype.moveBefore = function(e) {
    e.preventDefault();
    location.href = "../views/users.html?endAt=" + this.firstCreatedAt;
};

UserList.prototype.moveNext = function(e) {
    e.preventDefault();
    location.href = "../views/users.html?startAt=" + this.lastCreatedAt;
};

UserList.prototype.getParameters = function() {
    if (window.location.search) {
        var query = window.location.search.substring(1,window.location.search.length);
        var pair = query.split("&");
        var params = new Array();
        for (var i=0; i < pair.length; i++) {
            var tmp = pair[i].split("=");
            var keyName = tmp[0];
            var keyValue = tmp[1];
            params[keyName] = keyValue;
        }
        this.parameters = params;
        this.setIndex();
    }
};

UserList.prototype.setButtons = function() {
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

UserList.prototype.setIndex = function() {
    if (this.parameters == null) {
        return;
    }
    if (this.parameters["startAt"]) {
        this.startAt = Number(this.parameters["startAt"]);
    } else if (this.parameters["endAt"]) {
        this.endAt = Number(this.parameters["endAt"]);
    }
};

UserList.prototype.fetchUsers = function() {
    var fetchNum = 21;
    var ref = firebase.database().ref('/v1/user/');
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
            console.log("The " + data.key + " score is " + val);
            this.lastCreatedAt = val._createdAtReverse;
            if (ctr == 0) {
                this.firstCreatedAt = val._createdAtReverse;
            } else if (ctr == fetchNum - 1) {
                this.hasNext = true;
                return;
            }
            this.displayUser(data.key, val.name, val.position, val.gender, val.ageRange, val.area, "/images/profile_placeholder.png");
            ctr++;
        }.bind(this));
        window.UserList.setButtons();
    }.bind(this));
};

UserList.prototype.displayUser = function(key, name, pos, gender, age, area, imageUrl) {
    var template =
    '<div class="mdl-shadow--2dp mdl-cell mdl-cell--12-col">' +
    '</div>';

    var div = document.getElementById(key);
    // If an element for that message does not exists yet we create it.
    if (!div) {
        var container = document.createElement('div');
        container.innerHTML = template;
        div = container.firstChild;
        div.setAttribute('id', key);
        this.userForm.appendChild(div);
    }
    if (imageUrl) {
        var image = document.createElement('img');
        image.setAttribute("class", "profile");
        this.setImageUrl(imageUrl, image);
        div.appendChild(image);
    }
    var text = document.createElement("span");
    text.innerHTML = "Name:" + name + ", Pos:" + pos + ", Gender:" + gender + ", Age:" + age + ", Area:" + area;
    div.appendChild(text);

    var button = document.createElement("button");
    button.setAttribute("class", "detail mdl-button mdl-js-button mdl-button--accent mdl-js-ripple-effect");
    button.setAttribute("onclick", "setValue('" + key + "')");
    button.setAttribute("name", "detail");
    button.setAttribute("type", "button");
    button.innerHTML = "Detail";
    div.appendChild(button);

};

// Sets the URL of the given img element with the URL of the image stored in Firebase Storage.
UserList.prototype.setImageUrl = function(imageUri, imgElement) {
    // If the image is a Firebase Storage URI we fetch the URL.
    if (imageUri.startsWith('gs://')) {
        imgElement.src = UserList.LOADING_IMAGE_URL; // Display a loading image first.
        this.storage.refFromURL(imageUri).getMetadata().then(function(metadata) {
            imgElement.src = metadata.downloadURLs[0];
        });
    } else {
        imgElement.src = imageUri;
    }
};

// どのユーザーを選択したのかを保持しておくための処理
function setValue(val)
{
    window.UserList.selectedUserId = val;
}

window.onload = function() {
    window.authenticater = new Authenticator();
    window.UserList = new UserList();
};
