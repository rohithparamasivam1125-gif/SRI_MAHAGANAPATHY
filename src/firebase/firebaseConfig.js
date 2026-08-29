import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  enableIndexedDbPersistence, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from "firebase/firestore";

// User's Firebase Configuration
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCtmNU3Dn_4aJPmktNoOSvJsAnmATNU-nM",
  authDomain: "srimahaganapathy-billing.firebaseapp.com",
  projectId: "srimahaganapathy-billing",
  storageBucket: "srimahaganapathy-billing.firebasestorage.app",
  messagingSenderId: "805404396338",
  appId: "1:805404396338:web:cb3e18647f30bdeb6b652b",
  measurementId: "G-D0DLSS8J4W"
};

// Retrieve stored custom config or use default
export const getActiveFirebaseConfig = () => {
  try {
    const custom = localStorage.getItem('mahaganapathy_firebase_config') || localStorage.getItem('rajaganapathy_firebase_config');
    if (custom) {
      const parsed = JSON.parse(custom);
      if (parsed.projectId && parsed.apiKey) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Could not parse custom Firebase config, using default:", e);
  }
  return DEFAULT_FIREBASE_CONFIG;
};

// Save updated config
export const saveFirebaseConfig = (config) => {
  localStorage.setItem('mahaganapathy_firebase_config', JSON.stringify(config));
};

// Initialize Firebase App
const config = getActiveFirebaseConfig();
export const app = !getApps().length ? initializeApp(config) : getApp();

// Initialize Cloud Firestore with offline cache enabled
let dbInstance;
try {
  dbInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
} catch (e) {
  // Fallback if already initialized or browser constraint
  dbInstance = getFirestore(app);
}

export const db = dbInstance;
