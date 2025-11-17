// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, set, update } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBNU_1tD7FlrLm2Qsx-wMJFqOENrtZMMzU",
  authDomain: "atirath-register.firebaseapp.com",
  databaseURL: "https://atirath-register-default-rtdb.firebaseio.com",
  projectId: "atirath-register",
  storageBucket: "atirath-register.firebasestorage.app",
  messagingSenderId: "845542640649",
  appId: "1:845542640649:web:15af37db0abf3d183abcd8",
  measurementId: "G-ZD5B1E4GM6"
};

// Initialize Firebase only if it hasn't been initialized already
let app;
let analytics;
let auth;
let database;

try {
  const apps = getApps();
  if (!apps.length) {
    // Initialize Firebase if no app exists
    app = initializeApp(firebaseConfig);
    analytics = getAnalytics(app);
    auth = getAuth(app);
    database = getDatabase(app);
    console.log('Firebase initialized successfully');
  } else {
    // Use the existing app
    app = apps[0];
    analytics = getAnalytics(app);
    auth = getAuth(app);
    database = getDatabase(app);
    console.log('Using existing Firebase app');
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Function to store user profile in Firebase
export const storeUserProfile = async (userData) => {
  try {
    const userRef = ref(database, 'users/' + userData.uid);
    await set(userRef, {
      name: userData.name,
      email: userData.email,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    });
    console.log('User profile stored successfully');
    return true;
  } catch (error) {
    console.error('Error storing user profile:', error);
    throw error;
  }
};

// Export all Firebase services
export { 
  app,
  analytics,
  auth, 
  database, 
  ref, 
  set, 
  update,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged
};

export default app;