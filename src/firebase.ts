import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  setLogLevel,
  persistentLocalCache,
  persistentMultipleTabManager,
  memoryLocalCache
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBEO_8f8zChSBVmyHGu2ylzcCZRfv4sj1U",
  authDomain: "vanjarijodi.firebaseapp.com",
  projectId: "vanjarijodi",
  storageBucket: "vanjarijodi.firebasestorage.app",
  messagingSenderId: "84450936891",
  appId: "1:84450936891:web:edc059bfed03069bbfb41e",
  measurementId: "G-RJ345W44XS"
};

// Suppress non-fatal connection warning notices & offline logs
try {
  setLogLevel('silent');
} catch {
  // ignore
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Initialize Firestore with robust fallback & local offline persistence
let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
} catch {
  try {
    firestoreDb = initializeFirestore(app, {
      experimentalForceLongPolling: true,
      localCache: memoryLocalCache()
    });
  } catch {
    firestoreDb = getFirestore(app);
  }
}

export const db = firestoreDb;
export default app;


