import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyC7uqdn3jb1X5Fr_2gj3MtmEx_yTu1N47s",
    authDomain: "fraudevenezuela.firebaseapp.com",
    projectId: "fraudevenezuela",
    storageBucket: "fraudevenezuela.firebasestorage.app",
    messagingSenderId: "29074609436",
    appId: "1:29074609436:web:c4cf4bd63d4c3f1e3a96d9",
    measurementId: "G-V3C1641PWN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
