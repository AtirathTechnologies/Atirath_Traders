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
import { getDatabase, ref, set, update, get, push, query, orderByChild, equalTo, remove } from "firebase/database";

// Your Firebase configuration
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

// Initialize Firebase
let app;
let analytics;
let auth;
let database;

try {
  const apps = getApps();
  if (!apps.length) {
    app = initializeApp(firebaseConfig);
    
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
        console.log('Analytics initialized');
      }
    }).catch(console.error);
    
    auth = getAuth(app);
    database = getDatabase(app);
    console.log('Firebase initialized successfully');
  } else {
    app = apps[0];
    auth = getAuth(app);
    database = getDatabase(app);
    console.log('Using existing Firebase app');
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// ==========================================================================
// ENHANCED USER PROFILE FUNCTIONS - COMPLETE DATA STORAGE
// ==========================================================================

/**
 * Get the next user number for line-wise storage
 */
const getNextUserNumber = async () => {
  try {
    const usersRef = ref(database, "users");
    const snapshot = await get(usersRef);
    
    if (!snapshot.exists()) {
      return 1; // Start with user-1 if no users exist
    }
    
    const users = snapshot.val();
    const userKeys = Object.keys(users);
    
    // Extract numbers from existing user keys (user-1, user-2, etc.)
    const userNumbers = userKeys
      .filter(key => key.startsWith('user-'))
      .map(key => {
        const num = parseInt(key.replace('user-', ''));
        return isNaN(num) ? 0 : num;
      });
    
    if (userNumbers.length === 0) {
      return 1;
    }
    
    // Find the next available number
    const maxNumber = Math.max(...userNumbers);
    return maxNumber + 1;
  } catch (error) {
    console.error('Error getting next user number:', error);
    return 1; // Default to 1 on error
  }
};

/**
 * Store user profile in line-wise format with ALL data
 */
export const storeUserProfile = async (userData) => {
  try {
    console.log('🔵 storeUserProfile called with:', userData);
    
    // Get the next user number
    const userNumber = await getNextUserNumber();
    const userKey = `user-${userNumber}`;
    
    // Create user reference with user- prefix and sequential number
    const userRef = ref(database, `users/${userKey}`);
    
    // Prepare complete user data
    const userProfile = {
      uid: userData.uid || '',
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      countryCode: userData.countryCode || '+91',
      country: userData.country || '',
      state: userData.state || '',
      city: userData.city || '',
      pincode: userData.pincode || '',
      location: userData.location || `${userData.city || ''}, ${userData.state || ''}, ${userData.country || ''}`.trim(),
      photoURL: userData.photoURL || '',
      createdAt: userData.createdAt || new Date().toISOString(),
      lastLogin: userData.lastLogin || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userNumber: userNumber,
      userKey: userKey,
      // Additional metadata
      accountStatus: 'active',
      emailVerified: false,
      phoneVerified: false,
      orderCount: 0,
      totalSpent: 0,
      lastOrderDate: null
    };
    
    // Clean up empty strings for location
    if (userProfile.location === ', , ' || userProfile.location === ', ') {
      userProfile.location = '';
    }
    
    console.log('💾 Storing user profile to Firebase:', userProfile);
    
    // Save to Firebase
    await set(userRef, userProfile);
    
    console.log(`✅ User profile stored successfully as ${userKey}`);
    return { 
      success: true, 
      userKey, 
      userNumber,
      data: userProfile 
    };
  } catch (error) {
    console.error('❌ Error storing user profile:', error);
    return { 
      success: false, 
      error: error.message,
      code: error.code 
    };
  }
};

/**
 * Get user profile by UID - Returns all user data
 */
export const getUserProfile = async (authUid) => {
  try {
    console.log('🔵 getUserProfile called for UID:', authUid);
    
    const usersRef = ref(database, "users");
    const snapshot = await get(usersRef);

    if (!snapshot.exists()) {
      console.log("No users found in database");
      return null;
    }

    const users = snapshot.val();
    let foundUser = null;
    let foundKey = null;
    
    // Find user by UID
    for (const key in users) {
      const user = users[key];
      if (user.uid === authUid) {
        foundUser = user;
        foundKey = key;
        break;
      }
    }

    if (!foundUser) {
      console.log(`No user found with uid: ${authUid}`);
      return null;
    }

    // Return complete user data
    const userData = {
      uid: authUid,
      name: foundUser.name || "",
      email: foundUser.email || "",
      phone: foundUser.phone || "",
      countryCode: foundUser.countryCode || "+91",
      country: foundUser.country || "",
      state: foundUser.state || "",
      city: foundUser.city || "",
      pincode: foundUser.pincode || "",
      location: foundUser.location || "",
      photoURL: foundUser.photoURL || "",
      createdAt: foundUser.createdAt || "",
      lastLogin: foundUser.lastLogin || "",
      updatedAt: foundUser.updatedAt || "",
      userKey: foundKey || "",
      userNumber: foundUser.userNumber || parseInt(foundKey.replace('user-', '')) || null,
      // Additional fields
      accountStatus: foundUser.accountStatus || 'active',
      emailVerified: foundUser.emailVerified || false,
      phoneVerified: foundUser.phoneVerified || false,
      orderCount: foundUser.orderCount || 0,
      totalSpent: foundUser.totalSpent || 0,
      lastOrderDate: foundUser.lastOrderDate || null
    };

    console.log('✅ Found user data:', userData);
    return userData;

  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
    return null;
  }
};

/**
 * Update user profile with all fields
 */
export const updateUserProfile = async (authUid, newData) => {
  try {
    console.log('🔵 updateUserProfile called for UID:', authUid, 'with data:', newData);
    
    const usersRef = ref(database, "users");
    const snapshot = await get(usersRef);

    if (!snapshot.exists()) {
      console.log("No users in database");
      return false;
    }

    const users = snapshot.val();
    let userKey = null;
    
    // Find user key by UID
    for (const key in users) {
      if (users[key].uid === authUid) {
        userKey = key;
        break;
      }
    }

    if (!userKey) {
      console.log(`No user found with uid: ${authUid}`);
      return false;
    }

    const userRef = ref(database, `users/${userKey}`);
    
    // Prepare update data
    const updateData = {
      name: newData.name || "",
      email: newData.email || "",
      phone: newData.phone || "",
      countryCode: newData.countryCode || "+91",
      country: newData.country || "",
      state: newData.state || "",
      city: newData.city || "",
      pincode: newData.pincode || "",
      location: newData.location || `${newData.city || ''}, ${newData.state || ''}, ${newData.country || ''}`.trim(),
      photoURL: newData.photoURL || "",
      updatedAt: new Date().toISOString()
    };
    
    // Clean up location if empty
    if (updateData.location === ', , ') {
      updateData.location = '';
    }
    
    console.log(`💾 Updating user ${userKey} with data:`, updateData);
    await update(userRef, updateData);
    
    console.log('✅ User profile updated successfully');
    return true;

  } catch (error) {
    console.error("❌ Error updating user:", error);
    return false;
  }
};

/**
 * Update last login timestamp
 */
export const updateLastLogin = async (uid) => {
  try {
    const usersRef = ref(database, "users");
    const snapshot = await get(usersRef);

    if (!snapshot.exists()) return;

    const users = snapshot.val();
    let userKey = null;
    
    for (const key in users) {
      if (users[key].uid === uid) {
        userKey = key;
        break;
      }
    }

    if (userKey) {
      const userRef = ref(database, `users/${userKey}`);
      await update(userRef, {
        lastLogin: new Date().toISOString()
      });
      console.log('✅ Last login updated for user:', uid);
    }
  } catch (error) {
    console.error('❌ Error updating last login:', error);
  }
};

/**
 * Get all users with their line-wise keys (for admin panel)
 */
export const getAllUsers = async () => {
  try {
    console.log('🔵 Getting all users from Firebase...');
    const usersRef = ref(database, "users");
    const snapshot = await get(usersRef);

    if (!snapshot.exists()) {
      console.log("No users found in database");
      return [];
    }

    const users = snapshot.val();
    const usersArray = Object.keys(users).map(key => ({
      userKey: key,
      userNumber: users[key].userNumber || parseInt(key.replace('user-', '')) || null,
      uid: users[key].uid || '',
      name: users[key].name || '',
      email: users[key].email || '',
      phone: users[key].phone || '',
      countryCode: users[key].countryCode || '+91',
      country: users[key].country || '',
      state: users[key].state || '',
      city: users[key].city || '',
      pincode: users[key].pincode || '',
      location: users[key].location || '',
      photoURL: users[key].photoURL || '',
      createdAt: users[key].createdAt || '',
      lastLogin: users[key].lastLogin || '',
      updatedAt: users[key].updatedAt || '',
      accountStatus: users[key].accountStatus || 'active',
      emailVerified: users[key].emailVerified || false,
      phoneVerified: users[key].phoneVerified || false,
      orderCount: users[key].orderCount || 0,
      totalSpent: users[key].totalSpent || 0,
      lastOrderDate: users[key].lastOrderDate || null
    }));

    // Sort by creation date (newest first)
    usersArray.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    console.log(`✅ Found ${usersArray.length} users`);
    return usersArray;
  } catch (error) {
    console.error('❌ Error getting all users:', error);
    return [];
  }
};

/**
 * Delete a user by UID (admin only)
 */
export const deleteUser = async (uid) => {
  try {
    const usersRef = ref(database, "users");
    const snapshot = await get(usersRef);

    if (!snapshot.exists()) return false;

    const users = snapshot.val();
    let userKey = null;
    
    for (const key in users) {
      if (users[key].uid === uid) {
        userKey = key;
        break;
      }
    }

    if (userKey) {
      const userRef = ref(database, `users/${userKey}`);
      await remove(userRef);
      console.log('✅ User deleted:', uid);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    return false;
  }
};

// ==========================================================================
// QUOTE/ORDER FUNCTIONS
// ==========================================================================

/**
 * Submit a new quote with pending status
 */
export const submitQuote = async (quoteData) => {
  try {
    const quotesRef = ref(database, 'quotes');
    const newQuoteRef = push(quotesRef);
    
    const quoteWithDefaults = {
      ...quoteData,
      timestamp: Date.now(),
      createdAt: new Date().toISOString(),
      id: newQuoteRef.key,
      status: 'pending',
      date: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('Submitting quote with data:', quoteWithDefaults);
    await set(newQuoteRef, quoteWithDefaults);
    
    console.log('✅ Quote submitted successfully with ID:', newQuoteRef.key);
    return newQuoteRef.key;
  } catch (error) {
    console.error('❌ Error submitting quote to Firebase:', error);
    throw error;
  }
};

// ==========================================================================
// EXPORT ALL SERVICES
// ==========================================================================

export { 
  app,
  analytics,
  auth, 
  database, 
  ref, 
  set, 
  update,
  get,
  remove,
  push,
  query,
  orderByChild,
  equalTo,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged
};

export default { app, auth, database };