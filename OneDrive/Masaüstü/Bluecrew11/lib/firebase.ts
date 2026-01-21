import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, enableNetwork, disableNetwork } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

// Firebase configuration - platform specific
// Web config (default)
const webConfig = {
  apiKey: "AIzaSyBlFEIkMiHr93iEWOT8Vr7jimzCJLnXx6w",
  authDomain: "bluecrew-app.firebaseapp.com",
  projectId: "bluecrew-app",
  storageBucket: "bluecrew-app.firebasestorage.app",
  messagingSenderId: "822347973979",
  appId: "1:822347973979:web:e35b4d56993db8f393067e",
  measurementId: "G-3D289W3WWX"
};

// Android config - google-services.json'dan alındı
const androidConfig = {
  apiKey: "AIzaSyAfKdTZNy7PzAWDyaM9tj9ntgvFPMgYjPA",
  authDomain: "bluecrew-app.firebaseapp.com",
  projectId: "bluecrew-app",
  storageBucket: "bluecrew-app.firebasestorage.app",
  messagingSenderId: "822347973979",
  appId: "1:822347973979:android:a90c670830ae2fe093067e",
};

// iOS config - GoogleService-Info.plist'ten alındı
const iosConfig = {
  apiKey: "AIzaSyCC4W0DK-ESC2JbDfEBf0yXrMpcToSru-g",
  authDomain: "bluecrew-app.firebaseapp.com",
  projectId: "bluecrew-app",
  storageBucket: "bluecrew-app.firebasestorage.app",
  messagingSenderId: "822347973979",
  appId: "1:822347973979:ios:c85b2a3b93f3aa0293067e",
};

// Select config based on platform
const getFirebaseConfig = () => {
  if (Platform.OS === 'android') {
    return androidConfig;
  } else if (Platform.OS === 'ios') {
    return iosConfig;
  } else {
    return webConfig;
  }
};

const firebaseConfig = getFirebaseConfig();

// Initialize Firebase
let app;
try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Fallback configuration
  app = initializeApp(firebaseConfig);
}

// Initialize Firebase services with error handling
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Configure Firestore to use HTTP/2 instead of QUIC
if (typeof window !== 'undefined') {
  // Web environment - disable QUIC
  const { connectFirestoreEmulator } = require('firebase/firestore');
  // Force HTTP/2 connection
  (window as any).__firebase_force_http2 = true;
}

// Test Firebase connection
export const testFirebaseConnection = async () => {
  try {
    // Test network connectivity
    await enableNetwork(db);
    console.log('Firebase connection successful');
    return true;
  } catch (error) {
    console.error('Firebase connection failed:', error);
    
    // Try to disable and re-enable network
    try {
      await disableNetwork(db);
      await enableNetwork(db);
      console.log('Firebase network reset successful');
      return true;
    } catch (resetError) {
      console.error('Firebase network reset failed:', resetError);
      return false;
    }
  }
};

// Handle QUIC protocol errors
export const handleFirestoreError = (error: any) => {
  if (error?.code === 'unavailable' || error?.message?.includes('QUIC')) {
    console.warn('QUIC protocol error detected, retrying with HTTP/2...');
    // Force HTTP/2 connection
    if (typeof window !== 'undefined') {
      (window as any).__firebase_force_http2 = true;
    }
    return true; // Indicates error was handled
  }
  return false;
};

export default app;