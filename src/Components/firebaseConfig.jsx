import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAEPyrpsUcNIIkhO90TZ5Wo0Shj8x7O1GY",
    authDomain: "grocery-shop-e05f5.firebaseapp.com",
    projectId: "grocery-shop-e05f5",
    storageBucket: "grocery-shop-e05f5.firebasestorage.app",
    messagingSenderId: "830625265478",
    appId: "1:830625265478:web:707f1a115f66f145b25747",
    measurementId: "G-3GBP0J419N"
  };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
