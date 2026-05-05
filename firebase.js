// =============================================
// Firebase Configuration & Initialization
// =============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCn5yUFI3uDl58j6AqzI265nMkj59r4bMw",
    authDomain: "project-restwing.firebaseapp.com",
    projectId: "project-restwing",
    storageBucket: "project-restwing.firebasestorage.app",
    messagingSenderId: "747897648287",
    appId: "1:747897648287:web:e128af3c0641e5498b5eaa",
    measurementId: "G-NFPPZ0M2N2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
