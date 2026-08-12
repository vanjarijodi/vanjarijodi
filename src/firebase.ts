import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBEO_8f8zChSBVmyHGu2ylzcCZRfv4sj1U",
  authDomain: "vanjarijodi.firebaseapp.com",
  projectId: "vanjarijodi",
  storageBucket: "vanjarijodi.firebasestorage.app",
  messagingSenderId: "84450936891",
  appId: "1:84450936891:web:edc059bfed03069bbfb41e",
  measurementId: "G-RJ345W44XS"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Initialize Firestore with long-polling fallback for iframe/sandbox compatibility
let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  });
} catch {
  firestoreDb = getFirestore(app);
}

export const db = firestoreDb;
export default app;

