// config/firebaseConfig.js
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// TODO: Replace with your actual Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyCjW6x6MH0X9Xb-FhY0B18945Ddu8KC4SM",
  authDomain: "soulscri.firebaseapp.com",
  projectId: "soulscri",
  storageBucket: "soulscri.firebasestorage.app",
  messagingSenderId: "621669607026",
  appId: "1:621669607026:web:d26c9511e96cca4d2184eb",
  measurementId: "G-0EXC77SB2E"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const firestore = firebase.firestore();

export default firebase;
