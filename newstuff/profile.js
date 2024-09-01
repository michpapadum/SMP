import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { onAuthStateChanged, getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";


const firebaseConfig = {
    apiKey: "AIzaSyAbRnaxAm0jlT7XZLhD6-H6yu8K_DBMBXs",
    authDomain: "smp-24rgss08-32e9d.firebaseapp.com",
    projectId: "smp-24rgss08-32e9d",
    storageBucket: "smp-24rgss08-32e9d.appspot.com",
    messagingSenderId: "95759036563",
    appId: "1:95759036563:web:8303c21f7311e00c5a9d66",
    measurementId: "G-GYEMHP4RYZ"
  };

const app = initializeApp(firebaseConfig);

window.onload = function()
{
    const auth = getAuth();
    onAuthStateChanged(auth,(user)=>
    {
        document.getElementById('userid').innerHTML = user.uid;
        document.getElementById('username').innerHTML = user.email;
    })
}