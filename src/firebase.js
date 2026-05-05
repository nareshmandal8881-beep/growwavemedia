// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAfs2ax3iOCKef1T9ZHBVSsgOpC7mdYeXc",
  authDomain: "growwavemedia-7ff8a.firebaseapp.com",
  projectId: "growwavemedia-7ff8a",
  storageBucket: "growwavemedia-7ff8a.firebasestorage.app",
  messagingSenderId: "616781873762",
  appId: "1:616781873762:web:d80a16df717ff649a7073b",
  measurementId: "G-8RCBX12RWQ"
};

// Initialize Firebase
console.log("Initializing Firebase with Project ID:", firebaseConfig.projectId);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// For debugging in browser console
if (typeof window !== 'undefined') {
  window.firebase_app = app;
  window.firestore_db = db;
}

export { db, auth };
export default app;
