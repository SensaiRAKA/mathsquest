/* =====================================================================
   Diksha's Study Hub — Firebase config for cross-device progress sync.

   This file ships with empty values on purpose. Until it's filled in,
   every quest works exactly as before (localStorage only, single device) —
   nothing breaks, nothing changes.

   To turn sync ON (~5 minutes, see README.md "Cross-device sync"):
     1. Create a free project at https://console.firebase.google.com
     2. Add a Web App to it (</> icon) and copy the firebaseConfig object
     3. Paste the six values below
     4. Enable Firestore Database (Native mode) in the Firebase console
     5. Set the security rules given in the README

   These values are NOT secret keys — Firebase's web config is designed to
   be public in client-side code like this. Access control is enforced by
   the Firestore security rules, not by hiding this file.
   ===================================================================== */
window.DIKSHA_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCj8YX2cT7ZzXy9ZOghRn4Zr8DKxwUvbNw",
  authDomain: "sync-project-ffd96.firebaseapp.com",
  projectId: "sync-project-ffd96",
  storageBucket: "sync-project-ffd96.firebasestorage.app",
  messagingSenderId: "1009105227988",
  appId: "1:1009105227988:web:95293fede121bf86bcab41",
  measurementId: "G-RQKNJKXZZ9"
};
