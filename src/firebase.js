// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const db = getFirestore(app);

export { db, analytics };
export default app;
