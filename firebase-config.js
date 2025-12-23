// firebase-config.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBBIp6R-TLDKnqWx0zbb0Lj6VXko4Fqn9c",
  authDomain: "rebike-895fe.firebaseapp.com",
  projectId: "rebike-895fe",
  storageBucket: "rebike-895fe.firebasestorage.app",
  messagingSenderId: "1073184640528",
  appId: "1:1073184640528:web:1b56f8e615d5d74d5f4495",
  measurementId: "G-VVEYY9XJ7Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };