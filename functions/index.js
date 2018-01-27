/**
 * Copyright 2017 Google Inc. All Rights Reserved.
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

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const dbRoot = "v1";
admin.initializeApp(functions.config().firebase);



// Sends a notifications to all users when a new message is posted.
exports.sendNewMessageNotifications = functions.database.ref('/admin/messages/{messageId}').onCreate(event => {
    const snapshot = event.data;

    // Notification details.
    const text = snapshot.val().text;
    const payload = {
        notification: {
            title: `${snapshot.val().name} posted ${text ? 'a message' : 'an image'}`,
            body: text ? (text.length <= 100 ? text : text.substring(0, 97) + '...') : '',
            icon: snapshot.val().photoUrl || '/images/profile_placeholder.png',
            click_action: `https://${functions.config().firebase.authDomain}`
        }
    };

    // Get the list of device tokens.
    return admin.database().ref('admin/fcmTokens').once('value').then(allTokens => {
        if (allTokens.val()) {
            // Listing all tokens.
            const tokens = Object.keys(allTokens.val());

            // Send notifications to all tokens.
            return admin.messaging().sendToDevice(tokens, payload).then(response => {
                // For each message check if there was an error.
                const tokensToRemove = [];
                response.results.forEach((result, index) => {
                    const error = result.error;
                    if (error) {
                        console.error('Failure sending notification to', tokens[index], error);
                        // Cleanup the tokens who are not registered anymore.
                        if (error.code === 'messaging/invalid-registration-token' ||
                            error.code === 'messaging/registration-token-not-registered') {
                            tokensToRemove.push(allTokens.ref.child(tokens[index]).remove());
                        }
                    }
                });
                return Promise.all(tokensToRemove);
            });
        }
    });
});

// Sends a notifications to all users when a new comment is posted.
exports.sendNewCommentNotifications = functions.database.ref(dbRoot + '/comment/{commentId}').onCreate(event => {
    const snapshot = event.data;
    const text = snapshot.val().body;

    if (snapshot.val().category == 0) {
        return admin.database().ref(dbRoot + '/question/' + snapshot.val().questionId).once('value').then(data => {
            const question = data.val();
            if (question.userId != snapshot.val().userId) {
                sendNotification(text, question.userId); // Send to questioner
            }
        });
    } else {
        return admin.database().ref(dbRoot + '/comment/' + snapshot.val().commentId).once('value').then(data => {
            const comment = data.val();
            if (comment.userId != snapshot.val().userId) {
                sendNotification(text, comment.userId); // Send to respondents
            }
        });
    }
});

function sendNotification(text, userId) {
    // payload
    const payload = {
        notification: {
            title: 'New Message',
            body: text ? (text.length <= 100 ? text : text.substring(0, 97) + '...') : 'There was a new message for you.'
        }
    };

    return admin.database().ref(dbRoot + '/user/' + userId).once('value').then(info => {
        const user = info.val();
        const token = user.fcmToken;
        if (!token) {
            return; // no token
        }
        //console.log(userId);
        //console.log(token);
        return admin.messaging().sendToDevice(token, payload).then(response => {
            console.log("Successfully sent message:", response);
        }).catch(function(error) {
            console.log("Error sending message:", error);
        });
    });
}
