
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyArNCekk9yCL4gihfsVFbJQP781-swBrWM",
  authDomain: "studio-9797456116-e1010.firebaseapp.com",
  projectId: "studio-9797456116-e1010",
  storageBucket: "studio-9797456116-e1010.appspot.com",
  messagingSenderId: "126430681217",
  appId: "1:126430681217:web:6161791df6da3aee971580"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
