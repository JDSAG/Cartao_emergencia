import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDnuI87_xrjnwNwdBUNtVO1QGDhSiE4UZw",
    authDomain: "cartao-emergencia.firebaseapp.com",
    projectId: "cartao-emergencia",
    storageBucket: "cartao-emergencia.firebasestorage.app",
    messagingSenderId: "305015590809",
    appId: "1:305015590809:web:b2f60a6a2469cc89a34d08",
    measurementId: "G-QQN0JEH0J9"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
