// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCBch9rUSIYZauQuYU3sbjPP7YdGj_21Oo",
  authDomain: "yene-guzo-attendance.firebaseapp.com",
  projectId: "yene-guzo-attendance",
  storageBucket: "yene-guzo-attendance.firebasestorage.app",
  messagingSenderId: "570403365235",
  appId: "1:570403365235:web:9647063d22b99f866a6506",
  measurementId: "G-85PL5W7GK7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
// export const auth = getAuth(app);
export const db = getFirestore(app); // ← This line must exist!

export default app;
