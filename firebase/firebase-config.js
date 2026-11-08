// Replace these placeholder values with your Firebase Web App configuration.
// Firebase Console > Project settings > Your apps > SDK setup and configuration.
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCCbRSySjszeaBZ4OfZb352WBRGFjC0zng",
  authDomain: "anihub-ef3e4.firebaseapp.com",
  databaseURL: "https://anihub-ef3e4-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "anihub-ef3e4",
  storageBucket: "anihub-ef3e4.firebasestorage.app",
  messagingSenderId: "426595472279",
  appId: "1:426595472279:web:9ea9ce2b61fa9dde5daad2",
  measurementId: "G-VN4XV1HT0Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
