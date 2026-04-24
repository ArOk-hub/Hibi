// Firebase config — shared by main app and service worker.
// These values are safe to expose in a public repo (Firestore rules
// are what actually protect your data).
// Use globalThis so this file works in both window (main page) and self (service worker) contexts.
globalThis.HIBI_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDaal6zwxmFTAeF_qHftTsR9GH_IRJpZEo",
  authDomain: "hibi-todo.firebaseapp.com",
  projectId: "hibi-todo",
  storageBucket: "hibi-todo.firebasestorage.app",
  messagingSenderId: "1012911311669",
  appId: "1:1012911311669:web:c00a666cb2a0a8efe81a7c"
};
globalThis.HIBI_VAPID_KEY = "BOfnA51xqNW6VvFB0rOWXvdI9CfT2YnSMwEg9tdB7ESXNvbqIhcpvvNkuQQDYaW1Tx5DpZKz-lUdy--l_yFhoq8";
