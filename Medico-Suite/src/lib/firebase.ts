
'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyArNCekk9yCL4gihfsVFbJQP781-swBrWM",
  authDomain: "studio-9797456116-e1010.firebaseapp.com",
  projectId: "studio-9797456116-e1010",
  storageBucket: "studio-9797456116-e1010.firebasestorage.app",
  messagingSenderId: "126430681217",
  appId: "1:126430681217:web:6161791df6da3aee971580"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
