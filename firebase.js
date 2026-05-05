// =============================================
// Firebase Configuration & Initialization
// =============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyArh4t6jn7TVKQ5ajZVW5D08rRNJgmGCrc",
    authDomain: "restwing-final-1ce25.firebaseapp.com",
    projectId: "restwing-final-1ce25",
    storageBucket: "restwing-final-1ce25.firebasestorage.app",
    messagingSenderId: "790461939676",
    appId: "1:790461939676:web:a0932cf3e1d4895d17d919"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
