// firebase.js - Consolidated Firebase configuration
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile, 
  onAuthStateChanged 
} from "firebase/auth";
import { getDatabase, ref, set, update, get, push } from "firebase/database";

// Your Firebase configuration (at-getquote project only)
const firebaseConfig = {
  apiKey: "AIzaSyD8m9qOEXrQi_Ni6oQACyds4e04Q5TN7Ak",
  authDomain: "at-getquote.firebaseapp.com",
  databaseURL: "https://at-getquote-default-rtdb.firebaseio.com",
  projectId: "at-getquote",
  storageBucket: "at-getquote.firebasestorage.app",
  messagingSenderId: "1040885819303",
  appId: "1:1040885819303:web:7da87bda72470a6f047882",
  measurementId: "G-TR3X4D09X6"
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
    
    // Initialize Analytics (if supported)
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
        console.log('Analytics initialized');
      }
    }).catch(console.error);
    
    auth = getAuth(app);
    database = getDatabase(app);
    console.log('Firebase initialized successfully with at-getquote project');
  } else {
    // Use the existing app
    app = apps[0];
    auth = getAuth(app);
    database = getDatabase(app);
    console.log('Using existing Firebase app (at-getquote project)');
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Function to store user profile in Firebase - INCLUDES PHONE NUMBER AND PHOTO
export const storeUserProfile = async (userData) => {
  try {
    const userRef = ref(database, 'users/' + userData.uid);
    await set(userRef, {
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '',
      location: userData.location || '',
      photoURL: userData.photoURL || '',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    });
    console.log('User profile stored successfully with phone number:', userData.phone);
    return true;
  } catch (error) {
    console.error('Error storing user profile:', error);
    throw error;
  }
};

// Function to get user profile from Firebase - IMPROVED VERSION
export const getUserProfile = async (uid) => {
  try {
    const userRef = ref(database, 'users/' + uid);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      console.log('Raw user data from Firebase:', data);
      // Ensure all fields exist with proper fallbacks
      return {
        uid: uid,
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        location: data.location || '',
        photoURL: data.photoURL || '',
        createdAt: data.createdAt || new Date().toISOString(),
        lastLogin: data.lastLogin || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString()
      };
    } else {
      console.log('No user data found for UID:', uid);
      return null;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Function to update user profile with photo - IMPROVED VERSION
export const updateUserProfile = async (uid, userData) => {
  try {
    const userRef = ref(database, 'users/' + uid);
    
    // First get existing data to preserve what's not being updated
    const snapshot = await get(userRef);
    let existingData = {};
    if (snapshot.exists()) {
      existingData = snapshot.val();
    }
    
    // Prepare update data
    const updateData = {
      name: userData.name || existingData.name || '',
      email: userData.email || existingData.email || '',
      phone: userData.phone || existingData.phone || '',
      location: userData.location || existingData.location || '',
      photoURL: userData.photoURL || existingData.photoURL || '',
      updatedAt: new Date().toISOString(),
      lastLogin: existingData.lastLogin || new Date().toISOString(),
      createdAt: existingData.createdAt || new Date().toISOString()
    };
    
    await update(userRef, updateData);
    console.log('User profile updated successfully:', {
      uid,
      name: updateData.name,
      phone: updateData.phone,
      hasPhoto: !!updateData.photoURL
    });
    return updateData;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Function to update user last login
export const updateLastLogin = async (uid) => {
  try {
    const userRef = ref(database, 'users/' + uid);
    await update(userRef, {
      lastLogin: new Date().toISOString()
    });
    console.log('Last login updated for user:', uid);
  } catch (error) {
    console.error('Error updating last login:', error);
  }
};

// Function to check if user exists in database
export const checkUserExists = async (uid) => {
  try {
    const userRef = ref(database, 'users/' + uid);
    const snapshot = await get(userRef);
    return snapshot.exists();
  } catch (error) {
    console.error('Error checking user existence:', error);
    return false;
  }
};

// Function to submit quote to Firebase
export const submitQuote = async (quoteData) => {
  try {
    // Create a reference to the 'quotes' node in Realtime Database
    const quotesRef = ref(database, 'quotes');
    
    // Push new quote data
    const newQuoteRef = push(quotesRef);
    
    // Set the data with additional timestamp
    await set(newQuoteRef, {
      ...quoteData,
      timestamp: Date.now(),
      id: newQuoteRef.key,
      status: 'new'
    });
    
    console.log('Quote submitted successfully with ID:', newQuoteRef.key);
    return newQuoteRef.key;
  } catch (error) {
    console.error('Error submitting quote to Firebase:', error);
    throw error;
  }
};

// Function to get quotes (optional - for admin purposes)
export const getQuotes = async () => {
  // This would require proper security rules and authentication
  // For now, we'll just focus on submitting quotes
  console.log('Get quotes function - requires authentication implementation');
  return [];
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
  get,
  push,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged
};

// Default export
export default { app, auth, database };