// Import and configure the Firebase SDK
// These scripts are made available when the app is served or deployed on Firebase Hosting
// If you do not want to serve/host your project using Firebase Hosting see https://firebase.google.com/docs/web/setup
importScripts('/__/firebase/4.1.3/firebase-app.js');
importScripts('/__/firebase/4.1.3/firebase-messaging.js');
importScripts('/__/firebase/init.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
//firebase.initializeApp({
//  'messagingSenderId': '23514037853'
//});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
firebase.messaging();

