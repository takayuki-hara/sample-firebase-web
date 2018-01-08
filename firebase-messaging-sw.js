// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('/__/firebase/3.9.0/firebase-app.js');
importScripts('/__/firebase/3.9.0/firebase-messaging.js');
importScripts('/__/firebase/init.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
//firebase.initializeApp({
//  'messagingSenderId': '23514037853'
//});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
//const messaging = firebase.messaging();

