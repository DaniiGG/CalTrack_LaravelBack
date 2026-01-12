import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = { 
    apiKey: "AIzaSyB7pXAQrQK3ngZNHt-Us3mDvnM7FyieAiE",
  authDomain: "caltrack-37bd0.firebaseapp.com",
  projectId: "caltrack-37bd0",
  storageBucket: "caltrack-37bd0.firebasestorage.app",
  messagingSenderId: "47749169922",
  appId: "1:47749169922:web:4a2f46014104f711c5781b"
 };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);