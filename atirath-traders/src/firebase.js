// firebase.js - Complete Updated Version with Currency Functions
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  sendPasswordResetEmail
} from "firebase/auth";
import {
  getDatabase,
  ref,
  set,
  update,
  get,
  push,
  onValue,
  remove,
  query,
  orderByChild,
  equalTo
} from "firebase/database";

/* ==========================================================================
   FIREBASE CONFIG
========================================================================== */

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

/* ==========================================================================
   INITIALIZE FIREBASE
========================================================================== */

let app, analytics, auth, database;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  database = getDatabase(app);

  isSupported().then((supported) => {
    if (supported) analytics = getAnalytics(app);
  });
} else {
  app = getApps()[0];
  auth = getAuth(app);
  database = getDatabase(app);
}

/* ==========================================================================
   CURRENCY FUNCTIONS - Fetch only from existing database
========================================================================== */

/**
 * Get all currency rates from Firebase
 * @returns {Object} Currency rates object
 */
export const getCurrencyRates = async () => {
  try {
    const ratesRef = ref(database, 'currency/rates');
    const snapshot = await get(ratesRef);
    
    if (snapshot.exists()) {
      console.log('💰 Currency rates loaded from Firebase:', snapshot.val());
      return snapshot.val();
    } else {
      console.log('⚠️ No currency rates found in Firebase');
      return {};
    }
  } catch (error) {
    console.error('❌ Error fetching currency rates:', error);
    throw error;
  }
};

/**
 * Get all currency symbols from Firebase
 * @returns {Object} Currency symbols object
 */
export const getCurrencySymbols = async () => {
  try {
    const symbolsRef = ref(database, 'currency/symbols');
    const snapshot = await get(symbolsRef);
    
    if (snapshot.exists()) {
      console.log('💰 Currency symbols loaded from Firebase:', snapshot.val());
      return snapshot.val();
    } else {
      console.log('⚠️ No currency symbols found in Firebase');
      return {};
    }
  } catch (error) {
    console.error('❌ Error fetching currency symbols:', error);
    throw error;
  }
};

/**
 * Get all currency data in one call
 * @returns {Object} Object containing rates and symbols
 */
export const getCurrencyData = async () => {
  try {
    const [rates, symbols] = await Promise.all([
      getCurrencyRates(),
      getCurrencySymbols()
    ]);
    
    return { rates, symbols };
  } catch (error) {
    console.error('❌ Error fetching currency data:', error);
    throw error;
  }
};

/* ==========================================================================
   HELPER FUNCTIONS
========================================================================== */

const getNextUserNumber = async () => {
  try {
    const snap = await get(ref(database, "users"));
    if (!snap.exists()) return 1;

    const data = snap.val();
    const keys = Object.keys(data);
    const nums = keys
      .filter(k => k.startsWith("user-"))
      .map(k => {
        const num = parseInt(k.replace("user-", ""));
        return isNaN(num) ? 0 : num;
      })
      .filter(n => n > 0);

    return nums.length ? Math.max(...nums) + 1 : 1;
  } catch (error) {
    console.error("Error getting next user number:", error);
    return 1;
  }
};

const getNextVendorNumber = async () => {
  try {
    const snap = await get(ref(database, "vendors"));
    if (!snap.exists()) return 1;

    const data = snap.val();
    const keys = Object.keys(data);
    const nums = keys
      .filter(k => k.startsWith("vendor-"))
      .map(k => {
        const num = parseInt(k.replace("vendor-", ""));
        return isNaN(num) ? 0 : num;
      })
      .filter(n => n > 0);

    return nums.length ? Math.max(...nums) + 1 : 1;
  } catch (error) {
    console.error("Error getting next vendor number:", error);
    return 1;
  }
};

/* ==========================================================================
   HISTORY FUNCTIONS - Track all admin actions
========================================================================== */

/**
 * Log an action to Firebase history
 * @param {Object} actionData - Action data to log
 * @returns {Object} Result with success status
 */
export const logHistoryAction = async (actionData) => {
  try {
    console.log('📝 Logging history action:', actionData);
    
    const historyRef = push(ref(database, "history"));
    const timestamp = new Date().toISOString();
    
    const historyEntry = {
      ...actionData,
      id: historyRef.key,
      timestamp: timestamp,
      createdAt: timestamp
    };
    
    await set(historyRef, historyEntry);
    console.log('✅ History logged successfully with ID:', historyRef.key);
    
    return { 
      success: true, 
      id: historyRef.key 
    };
  } catch (err) {
    console.error("❌ logHistoryAction error:", err);
    return { 
      success: false, 
      error: err.message 
    };
  }
};

/**
 * Get all history entries
 * @param {Object} options - Filter options (limit, entity, action, user)
 * @returns {Array} Array of history entries
 */
export const getAllHistory = async (options = {}) => {
  try {
    console.log('🔄 getAllHistory called with options:', options);
    
    const historyRef = ref(database, "history");
    const snapshot = await get(historyRef);
    
    if (!snapshot.exists()) {
      console.log('❌ No history found');
      return [];
    }

    const data = snapshot.val();
    let historyArray = Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    }));

    // Apply filters
    if (options.entity) {
      historyArray = historyArray.filter(h => h.entity === options.entity);
    }
    
    if (options.action) {
      historyArray = historyArray.filter(h => h.action === options.action);
    }
    
    if (options.user) {
      const searchTerm = options.user.toLowerCase();
      historyArray = historyArray.filter(h => 
        (h.changedBy && h.changedBy.toLowerCase().includes(searchTerm)) ||
        (h.userEmail && h.userEmail.toLowerCase().includes(searchTerm))
      );
    }
    
    if (options.startDate) {
      historyArray = historyArray.filter(h => 
        new Date(h.timestamp) >= new Date(options.startDate)
      );
    }
    
    if (options.endDate) {
      const endDate = new Date(options.endDate);
      endDate.setHours(23, 59, 59);
      historyArray = historyArray.filter(h => 
        new Date(h.timestamp) <= endDate
      );
    }

    // Sort by timestamp (newest first)
    historyArray.sort((a, b) => 
      new Date(b.timestamp || 0) - new Date(a.timestamp || 0)
    );

    console.log('✅ Retrieved', historyArray.length, 'history entries');
    return historyArray;
  } catch (err) {
    console.error("❌ getAllHistory error:", err);
    throw err;
  }
};

/**
 * Get history for a specific entity (user, product, order)
 * @param {string} entityType - Entity type (user, product, order)
 * @param {string} entityId - Entity ID
 * @returns {Array} Array of history entries
 */
export const getEntityHistory = async (entityType, entityId) => {
  try {
    console.log('🔄 getEntityHistory called for:', entityType, entityId);
    
    const historyRef = ref(database, "history");
    const snapshot = await get(historyRef);
    
    if (!snapshot.exists()) {
      return [];
    }

    const data = snapshot.val();
    const historyArray = Object.keys(data)
      .map(key => ({
        id: key,
        ...data[key]
      }))
      .filter(h => h.entity === entityType && h.entityId === entityId)
      .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

    console.log('✅ Retrieved', historyArray.length, 'history entries for entity');
    return historyArray;
  } catch (err) {
    console.error("❌ getEntityHistory error:", err);
    throw err;
  }
};

/**
 * Clear old history entries (optional - for cleanup)
 * @param {number} daysToKeep - Number of days to keep history
 * @returns {Object} Result with count of deleted entries
 */
export const clearOldHistory = async (daysToKeep = 90) => {
  try {
    console.log('🔄 clearOldHistory called, keeping last', daysToKeep, 'days');
    
    const historyRef = ref(database, "history");
    const snapshot = await get(historyRef);
    
    if (!snapshot.exists()) {
      return { success: true, deletedCount: 0 };
    }

    const data = snapshot.val();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    let deletedCount = 0;
    
    for (const [key, value] of Object.entries(data)) {
      const entryDate = new Date(value.timestamp || value.createdAt || 0);
      if (entryDate < cutoffDate) {
        await remove(ref(database, `history/${key}`));
        deletedCount++;
      }
    }
    
    console.log('✅ Cleared', deletedCount, 'old history entries');
    return { success: true, deletedCount };
  } catch (err) {
    console.error("❌ clearOldHistory error:", err);
    return { success: false, error: err.message };
  }
};

/* ==========================================================================
   ADMIN FUNCTIONS
========================================================================== */

/**
 * Check if a user is an admin by UID or email
 * @param {string} uid - User UID
 * @param {string} email - User email (optional)
 * @returns {boolean} True if user is admin
 */
export const checkIsAdmin = async (uid, email = null) => {
  console.log('🔄 checkIsAdmin called for uid:', uid, 'email:', email);
  
  try {
    // First check if there's an admin node in the database
    const adminRef = ref(database, 'admin');
    const adminSnap = await get(adminRef);
    
    if (adminSnap.exists()) {
      const adminData = adminSnap.val();
      
      // Check all admin entries
      for (const key in adminData) {
        const admin = adminData[key];
        
        // Match by UID (most secure)
        if (admin.uid === uid) {
          console.log('✅ Admin found by UID:', uid);
          return true;
        }
        
        // Match by email as fallback
        if (email && admin.email === email) {
          console.log('✅ Admin found by email:', email);
          return true;
        }
      }
    }
    
    console.log('❌ User is not an admin:', uid);
    return false;
    
  } catch (err) {
    console.error("❌ checkIsAdmin error:", err);
    return false;
  }
};

/**
 * Get all admin users
 * @returns {Array} Array of admin objects
 */
export const getAllAdmins = async () => {
  try {
    console.log('🔄 getAllAdmins called');
    
    const adminRef = ref(database, 'admin');
    const adminSnap = await get(adminRef);
    
    if (!adminSnap.exists()) {
      console.log('❌ No admins found');
      return [];
    }

    const data = adminSnap.val();
    const adminsArray = Object.keys(data).map(key => ({
      adminKey: key,
      ...data[key],
      userType: 'admin'
    })).sort((a, b) =>
      new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );

    console.log('✅ Retrieved', adminsArray.length, 'admins');
    return adminsArray;
  } catch (err) {
    console.error("❌ getAllAdmins error:", err);
    throw err;
  }
};

/**
 * Add a new admin user
 * @param {Object} adminData - Admin data
 * @returns {Object} Result with success status
 */
export const addAdmin = async (adminData) => {
  try {
    console.log('🔄 addAdmin called for email:', adminData.email);
    
    // Get next admin number
    const adminRef = ref(database, 'admin');
    const adminSnap = await get(adminRef);
    
    let adminNumber = 1;
    if (adminSnap.exists()) {
      const admins = adminSnap.val();
      const keys = Object.keys(admins);
      const nums = keys
        .filter(k => k.startsWith('admin-'))
        .map(k => {
          const num = parseInt(k.replace('admin-', ''));
          return isNaN(num) ? 0 : num;
        })
        .filter(n => n > 0);
      
      adminNumber = nums.length ? Math.max(...nums) + 1 : 1;
    }
    
    const adminKey = `admin-${adminNumber}`;
    
    const adminProfile = {
      uid: adminData.uid || '',
      email: adminData.email || '',
      name: adminData.name || 'Admin',
      role: adminData.role || 'admin',
      createdBy: adminData.createdBy || 'system',
      createdAt: Date.now(),
      permissions: adminData.permissions || ['all'],
      lastLogin: adminData.lastLogin || null,
      status: adminData.status || 'active',
      originalUserType: adminData.originalUserType || 'user'
    };
    
    await set(ref(database, `admin/${adminKey}`), adminProfile);
    console.log('✅ Admin added successfully:', adminKey);
    
    return { 
      success: true, 
      adminKey, 
      adminNumber 
    };
    
  } catch (err) {
    console.error("❌ addAdmin error:", err);
    return { 
      success: false, 
      error: err.message 
    };
  }
};

/**
 * Remove an admin user
 * @param {string} adminKey - Admin key (admin-1, admin-2, etc.)
 * @returns {boolean} Success status
 */
export const removeAdmin = async (adminKey) => {
  try {
    console.log('🔄 removeAdmin called for adminKey:', adminKey);
    
    await remove(ref(database, `admin/${adminKey}`));
    console.log('✅ Admin removed successfully:', adminKey);
    
    return true;
  } catch (err) {
    console.error("❌ removeAdmin error:", err);
    return false;
  }
};

/* ==========================================================================
   USER FUNCTIONS (Regular Users - users collection)
========================================================================== */

/**
 * Store regular user profile (not vendor)
 * @param {Object} userData - User data object
 * @returns {Object} Result with success status and user details
 */
export const storeUserProfile = async (userData) => {
  console.log('🚀 START storeUserProfile (Regular User):', new Date().toISOString());
  
  try {
    // Get next user number
    const userNumber = await getNextUserNumber();
    const userKey = `user-${userNumber}`;
    
    console.log('📊 Generated userKey:', userKey, 'userNumber:', userNumber);

    const profile = {
      uid: userData.uid || '',
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      countryCode: userData.countryCode || '+91',
      country: userData.country || 'India',
      state: userData.state || '',
      city: userData.city || '',
      pincode: userData.pincode || '',
      location: userData.location || `${userData.city || ''}, ${userData.state || ''}, ${userData.country || ''}`.replace(/^, /, '').replace(/, $/, ''),
      photoURL: userData.photoURL || '',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userNumber: userNumber,
      userKey: userKey,
      accountStatus: "active",
      emailVerified: false,
      phoneVerified: false,
      orderCount: userData.orderCount || 0,
      totalSpent: userData.totalSpent || 0,
      lastOrderDate: null,
      userType: 'user' // Regular user
    };

    // Store ONLY in users collection
    await set(ref(database, `users/${userKey}`), profile);
    console.log('✅ Successfully wrote to users/' + userKey);

    return { 
      success: true, 
      userKey, 
      userNumber,
      userType: 'user'
    };

  } catch (err) {
    console.error("❌ storeUserProfile error:", err);
    return { 
      success: false, 
      error: err.message
    };
  }
};

/**
 * Get a single user profile by UID
 * @param {string} uid - User UID
 * @returns {Object|null} User data or null if not found
 */
export const getUserProfile = async (uid) => {
  console.log('🔄 getUserProfile called for uid:', uid);
  
  try {
    // First check in users collection
    console.log('🔍 Searching in users collection...');
    const usersRef = ref(database, 'users');
    const usersSnap = await get(usersRef);
    
    if (usersSnap.exists()) {
      const users = usersSnap.val();
      for (const key in users) {
        if (users[key].uid === uid) {
          console.log('✅ Found regular user with key:', key);
          return {
            ...users[key],
            userKey: key,
            userType: 'user'
          };
        }
      }
    }
    
    // If not found in users, check in vendors collection
    console.log('🔍 Searching in vendors collection...');
    const vendorsRef = ref(database, 'vendors');
    const vendorsSnap = await get(vendorsRef);
    
    if (vendorsSnap.exists()) {
      const vendors = vendorsSnap.val();
      for (const key in vendors) {
        if (vendors[key].uid === uid) {
          console.log('✅ Found vendor with key:', key);
          return {
            ...vendors[key],
            userKey: key,
            vendorKey: key,
            userType: 'vendor'
          };
        }
      }
    }
    
    console.log('❌ No user found with uid:', uid);
    return null;
    
  } catch (err) {
    console.error("❌ getUserProfile error:", err);
    return null;
  }
};

/**
 * Get all regular users (not vendors)
 * @returns {Array} Array of user objects
 */
export const getAllUsers = async () => {
  try {
    console.log('🔄 getAllUsers called');
    
    const snap = await get(ref(database, "users"));
    if (!snap.exists()) {
      console.log('❌ No users found');
      return [];
    }

    const data = snap.val();
    const usersArray = Object.keys(data).map(key => ({
      userKey: key,
      ...data[key],
      userType: 'user'
    })).sort((a, b) =>
      new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );

    console.log('✅ Retrieved', usersArray.length, 'users from users collection');
    return usersArray;
  } catch (err) {
    console.error("❌ getAllUsers error:", err);
    throw err;
  }
};

/**
 * Update user profile by UID
 * @param {string} authUid - User UID
 * @param {Object} newData - Updated user data
 * @returns {boolean} Success status
 */
export const updateUserProfile = async (authUid, newData) => {
  console.log('🔄 updateUserProfile called for uid:', authUid);
  
  try {
    const updateData = {
      name: newData.name || "",
      email: newData.email || "",
      phone: newData.phone || "",
      countryCode: newData.countryCode || "+91",
      country: newData.country || "",
      state: newData.state || "",
      city: newData.city || "",
      pincode: newData.pincode || "",
      location: newData.location || `${newData.city || ''}, ${newData.state || ''}, ${newData.country || ''}`,
      photoURL: newData.photoURL || "",
      updatedAt: new Date().toISOString()
    };
    
    // Find user in users collection
    const usersRef = ref(database, "users");
    const usersSnap = await get(usersRef);
    
    let userKey = null;
    let isVendor = false;
    
    if (usersSnap.exists()) {
      const users = usersSnap.val();
      for (const key in users) {
        if (users[key].uid === authUid) {
          userKey = key;
          isVendor = false;
          break;
        }
      }
    }
    
    // If not found in users, check vendors
    if (!userKey) {
      const vendorsRef = ref(database, "vendors");
      const vendorsSnap = await get(vendorsRef);
      
      if (vendorsSnap.exists()) {
        const vendors = vendorsSnap.val();
        for (const key in vendors) {
          if (vendors[key].uid === authUid) {
            userKey = key;
            isVendor = true;
            break;
          }
        }
      }
    }
    
    if (!userKey) {
      console.error('❌ No user found with uid:', authUid);
      return false;
    }
    
    console.log('✅ Found user with key:', userKey, 'isVendor:', isVendor);
    
    // Update appropriate collection
    const collectionPath = isVendor ? 'vendors' : 'users';
    await update(ref(database, `${collectionPath}/${userKey}`), updateData);
    
    console.log('✅ Profile updated successfully');
    return true;
    
  } catch (err) {
    console.error("❌ updateUserProfile error:", err);
    return false;
  }
};

/**
 * Update last login timestamp for user
 * @param {string} uid - User UID
 */
export const updateLastLogin = async (uid) => {
  try {
    console.log('🕒 Updating lastLogin for uid:', uid);
    
    const lastLoginTime = new Date().toISOString();
    const updateData = {
      lastLogin: lastLoginTime,
      updatedAt: lastLoginTime
    };
    
    // Find user in users collection
    const usersRef = ref(database, "users");
    const usersSnap = await get(usersRef);
    
    let userKey = null;
    let isVendor = false;
    
    if (usersSnap.exists()) {
      const users = usersSnap.val();
      for (const key in users) {
        if (users[key].uid === uid) {
          userKey = key;
          isVendor = false;
          break;
        }
      }
    }
    
    // If not found in users, check vendors
    if (!userKey) {
      const vendorsRef = ref(database, "vendors");
      const vendorsSnap = await get(vendorsRef);
      
      if (vendorsSnap.exists()) {
        const vendors = vendorsSnap.val();
        for (const key in vendors) {
          if (vendors[key].uid === uid) {
            userKey = key;
            isVendor = true;
            break;
          }
        }
      }
    }
    
    if (userKey) {
      const collectionPath = isVendor ? 'vendors' : 'users';
      await update(ref(database, `${collectionPath}/${userKey}`), updateData);
      console.log('✅ lastLogin updated successfully');
    } else {
      console.log('⚠️ No user found to update lastLogin');
    }
    
  } catch (err) {
    console.error("❌ updateLastLogin error:", err);
  }
};

/**
 * Delete user by UID
 * @param {string} uid - User UID
 * @returns {boolean} Success status
 */
export const deleteUser = async (uid) => {
  try {
    console.log('🔄 deleteUser called for uid:', uid);
    
    // Find user in users collection
    const usersRef = ref(database, "users");
    const usersSnap = await get(usersRef);
    
    let userKey = null;
    let isVendor = false;
    
    if (usersSnap.exists()) {
      const users = usersSnap.val();
      for (const key in users) {
        if (users[key].uid === uid) {
          userKey = key;
          isVendor = false;
          break;
        }
      }
    }
    
    // If not found in users, check vendors
    if (!userKey) {
      const vendorsRef = ref(database, "vendors");
      const vendorsSnap = await get(vendorsRef);
      
      if (vendorsSnap.exists()) {
        const vendors = vendorsSnap.val();
        for (const key in vendors) {
          if (vendors[key].uid === uid) {
            userKey = key;
            isVendor = true;
            break;
          }
        }
      }
    }
    
    if (!userKey) {
      console.log('❌ No user found with uid:', uid);
      return false;
    }
    
    console.log('✅ Found user to delete with key:', userKey, 'isVendor:', isVendor);
    
    // Delete from appropriate collection
    const collectionPath = isVendor ? 'vendors' : 'users';
    await remove(ref(database, `${collectionPath}/${userKey}`));
    
    console.log('✅ User deleted successfully');
    return true;
  } catch (err) {
    console.error("❌ deleteUser error:", err);
    return false;
  }
};

/* ==========================================================================
   VENDOR FUNCTIONS (Vendors - vendors collection)
========================================================================== */

/**
 * Store vendor profile
 * @param {Object} vendorData - Vendor data object
 * @returns {Object} Result with success status and vendor details
 */
export const storeVendorProfile = async (vendorData) => {
  console.log('🚀 START storeVendorProfile:', new Date().toISOString());
  
  try {
    // Get next vendor number
    const vendorNumber = await getNextVendorNumber();
    const vendorKey = `vendor-${vendorNumber}`;
    
    console.log('📊 Generated vendorKey:', vendorKey, 'vendorNumber:', vendorNumber);

    const profile = {
      uid: vendorData.uid || '',
      name: vendorData.name || '',
      email: vendorData.email || '',
      phone: vendorData.phone || '',
      countryCode: vendorData.countryCode || '+91',
      country: vendorData.country || 'India',
      state: vendorData.state || '',
      city: vendorData.city || '',
      pincode: vendorData.pincode || '',
      location: vendorData.location || `${vendorData.city || ''}, ${vendorData.state || ''}, ${vendorData.country || ''}`,
      photoURL: vendorData.photoURL || '',
      gstNo: vendorData.gstNo || '',
      registeredBy: vendorData.registeredBy || '',
      vendorStatus: vendorData.vendorStatus || 'pending',
      vendorApproved: vendorData.vendorApproved || false,
      vendorApprovedAt: vendorData.vendorApprovedAt || null,
      vendorApprovedBy: vendorData.vendorApprovedBy || null,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      vendorNumber: vendorNumber,
      vendorKey: vendorKey,
      accountStatus: "active",
      emailVerified: false,
      phoneVerified: false,
      orderCount: vendorData.orderCount || 0,
      totalSpent: vendorData.totalSpent || 0,
      lastOrderDate: null,
      userType: 'vendor',
      documents: vendorData.documents || [],
      registeredAt: new Date().toISOString()
    };

    // Store ONLY in vendors collection
    await set(ref(database, `vendors/${vendorKey}`), profile);
    console.log('✅ Successfully wrote to vendors/' + vendorKey);

    return { 
      success: true, 
      vendorKey, 
      vendorNumber
    };

  } catch (err) {
    console.error("❌ storeVendorProfile error:", err);
    return { 
      success: false, 
      error: err.message
    };
  }
};

/**
 * Get all vendors
 * @returns {Array} Array of vendor objects
 */
export const getAllVendors = async () => {
  try {
    console.log('🔄 getAllVendors called');
    
    const snap = await get(ref(database, "vendors"));
    if (!snap.exists()) {
      console.log('❌ No vendors found');
      return [];
    }

    const data = snap.val();
    const vendorsArray = Object.keys(data).map(key => ({
      vendorKey: key,
      ...data[key],
      userType: 'vendor'
    })).sort((a, b) =>
      new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );

    console.log('✅ Retrieved', vendorsArray.length, 'vendors from vendors collection');
    return vendorsArray;
  } catch (err) {
    console.error("❌ getAllVendors error:", err);
    throw err;
  }
};

/**
 * Get vendor profile by vendorKey or UID
 * @param {string} vendorId - Vendor key or UID
 * @returns {Object|null} Vendor data or null if not found
 */
export const getVendorProfile = async (vendorId) => {
  console.log('🔄 getVendorProfile called for vendorId:', vendorId);
  
  try {
    // First try direct lookup by vendorKey
    if (vendorId.startsWith('vendor-')) {
      const vendorRef = ref(database, `vendors/${vendorId}`);
      const vendorSnap = await get(vendorRef);
      
      if (vendorSnap.exists()) {
        console.log('✅ Found vendor by key:', vendorId);
        return {
          ...vendorSnap.val(),
          userType: 'vendor'
        };
      }
    }
    
    // Search by UID
    const vendorsRef = ref(database, "vendors");
    const vendorsSnap = await get(vendorsRef);
    
    if (vendorsSnap.exists()) {
      const vendors = vendorsSnap.val();
      for (const key in vendors) {
        if (vendors[key].uid === vendorId) {
          console.log('✅ Found vendor with key:', key);
          return {
            ...vendors[key],
            vendorKey: key,
            userType: 'vendor'
          };
        }
      }
    }
    
    console.log('❌ No vendor found with vendorId:', vendorId);
    return null;
    
  } catch (err) {
    console.error("❌ getVendorProfile error:", err);
    return null;
  }
};

/**
 * Update vendor status (approve/reject/pending)
 * @param {string} vendorKey - Vendor key (vendor-1, vendor-2, etc.)
 * @param {Object} statusData - Status update data
 * @returns {boolean} Success status
 */
export const updateVendorStatus = async (vendorKey, statusData) => {
  try {
    console.log('🔄 updateVendorStatus called for vendorKey:', vendorKey);
    
    const updates = {};
    const timestamp = new Date().toISOString();
    
    // Update vendor status in vendors collection
    updates[`vendors/${vendorKey}/vendorStatus`] = statusData.status;
    updates[`vendors/${vendorKey}/vendorApproved`] = statusData.status === 'approved';
    updates[`vendors/${vendorKey}/vendorApprovedAt`] = statusData.status === 'approved' ? timestamp : null;
    updates[`vendors/${vendorKey}/vendorApprovedBy`] = statusData.approvedBy || null;
    updates[`vendors/${vendorKey}/lastUpdated`] = timestamp;
    updates[`vendors/${vendorKey}/statusReason`] = statusData.reason || '';
    updates[`vendors/${vendorKey}/lastLogin`] = timestamp;
    
    await update(ref(database), updates);
    
    console.log('✅ Vendor status updated successfully:', vendorKey, 'to', statusData.status);
    return true;
    
  } catch (err) {
    console.error("❌ updateVendorStatus error:", err);
    return false;
  }
};

/**
 * Search vendors by status (pending, approved, rejected)
 * @param {string} status - Vendor status
 * @returns {Array} Array of vendors with specified status
 */
export const getVendorsByStatus = async (status) => {
  try {
    console.log('🔄 getVendorsByStatus called for status:', status);
    
    const vendors = await getAllVendors();
    const filteredVendors = vendors.filter(vendor => vendor.vendorStatus === status);
    
    console.log('✅ Found', filteredVendors.length, 'vendors with status:', status);
    return filteredVendors;
  } catch (err) {
    console.error("❌ getVendorsByStatus error:", err);
    throw err;
  }
};

/* ==========================================================================
   COMBINED FUNCTIONS (Users + Vendors)
========================================================================== */

/**
 * Store user or vendor profile based on userType
 * @param {Object} userData - User/vendor data
 * @returns {Object} Result with success status
 */
export const storeUserOrVendorProfile = async (userData) => {
  const isVendor = userData.userType === 'vendor';
  
  if (isVendor) {
    return await storeVendorProfile(userData);
  } else {
    return await storeUserProfile(userData);
  }
};

/**
 * Get all accounts (users + vendors combined)
 * @returns {Array} Array of all account objects
 */
export const getAllAccounts = async () => {
  try {
    console.log('🔄 getAllAccounts called');
    
    const [users, vendors] = await Promise.all([
      getAllUsers(),
      getAllVendors()
    ]);
    
    // Combine and sort by creation date (newest first)
    const allAccounts = [...users, ...vendors].sort((a, b) =>
      new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
    
    console.log('✅ Retrieved total accounts:', allAccounts.length);
    return allAccounts;
  } catch (err) {
    console.error("❌ getAllAccounts error:", err);
    throw err;
  }
};

/**
 * Get user counts by type
 * @returns {Object} Counts of users and vendors
 */
export const getUserCounts = async () => {
  try {
    console.log('🔄 getUserCounts called');
    
    const [users, vendors] = await Promise.all([
      getAllUsers(),
      getAllVendors()
    ]);
    
    const counts = {
      totalUsers: users.length,
      totalVendors: vendors.length,
      pendingVendors: vendors.filter(v => v.vendorStatus === 'pending').length,
      approvedVendors: vendors.filter(v => v.vendorStatus === 'approved' || v.vendorApproved).length,
      rejectedVendors: vendors.filter(v => v.vendorStatus === 'rejected').length,
      todayUsers: users.filter(u => {
        if (!u.createdAt) return false;
        const userDate = new Date(u.createdAt);
        const today = new Date();
        return userDate.toDateString() === today.toDateString();
      }).length,
      todayVendors: vendors.filter(v => {
        if (!v.createdAt) return false;
        const vendorDate = new Date(v.createdAt);
        const today = new Date();
        return vendorDate.toDateString() === today.toDateString();
      }).length
    };
    
    console.log('✅ User counts:', counts);
    return counts;
  } catch (err) {
    console.error("❌ getUserCounts error:", err);
    throw err;
  }
};

/**
 * Search users/vendors by email, name, or phone
 * @param {string} searchTerm - Search term
 * @returns {Array} Array of matching accounts
 */
export const searchAccounts = async (searchTerm) => {
  try {
    console.log('🔄 searchAccounts called for term:', searchTerm);
    
    const allAccounts = await getAllAccounts();
    const searchLower = searchTerm.toLowerCase();
    
    const results = allAccounts.filter(account => {
      return (
        (account.email && account.email.toLowerCase().includes(searchLower)) ||
        (account.name && account.name.toLowerCase().includes(searchLower)) ||
        (account.phone && account.phone.includes(searchTerm))
      );
    });
    
    console.log('✅ Found', results.length, 'matching accounts');
    return results;
  } catch (err) {
    console.error("❌ searchAccounts error:", err);
    throw err;
  }
};

/* ==========================================================================
   CART FUNCTIONS
========================================================================== */

/**
 * Generate or retrieve guest cart ID
 * @returns {string} Guest cart ID
 */
export const getGuestCartId = () => {
  let guestCartId = localStorage.getItem('guestCartId');
  
  if (!guestCartId) {
    guestCartId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('guestCartId', guestCartId);
    
    // Initialize empty cart in database
    const initializeGuestCart = async () => {
      try {
        const cartRef = ref(database, `carts/${guestCartId}`);
        const cartData = {
          items: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isGuest: true,
          sessionId: guestCartId
        };
        await set(cartRef, cartData);
      } catch (error) {
        console.error('Error initializing guest cart:', error);
      }
    };
    
    initializeGuestCart();
  }
  
  return guestCartId;
};

/**
 * Get user cart ID
 * @param {string} userId - User UID
 * @returns {string} User cart ID
 */
export const getUserCartId = (userId) => {
  return `user_${userId}`;
};

/**
 * Get current cart ID based on auth state
 * @param {Object|null} user - Firebase user object or null
 * @returns {string} Cart ID
 */
export const getCurrentCartId = (user = null) => {
  if (user && user.uid) {
    return getUserCartId(user.uid);
  }
  return getGuestCartId();
};

/**
 * Load cart from Firebase
 * @param {Object|null} user - Firebase user object or null
 * @returns {Object} Cart data
 */
export const loadCartFromFirebase = async (user = null) => {
  try {
    const cartId = getCurrentCartId(user);
    const cartRef = ref(database, `carts/${cartId}`);
    
    const snapshot = await get(cartRef);
    if (snapshot.exists()) {
      const cartData = snapshot.val();
      
      // Mark items as synced
      const itemsWithSync = (cartData.items || []).map(item => ({
        ...item,
        synced: true,
        lastSynced: cartData.updatedAt
      }));
      
      return {
        items: itemsWithSync,
        cartId,
        updatedAt: cartData.updatedAt,
        isGuest: cartData.isGuest || false
      };
    } else {
      // Create empty cart if it doesn't exist
      const cartData = {
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isGuest: !user,
        userId: user ? user.uid : null
      };
      
      await set(cartRef, cartData);
      return { items: [], cartId, updatedAt: cartData.updatedAt, isGuest: !user };
    }
  } catch (error) {
    console.error('Error loading cart from Firebase:', error);
    // Fallback to localStorage
    const localCart = localStorage.getItem('cart_backup');
    if (localCart) {
      return { items: JSON.parse(localCart), cartId: null, isGuest: true };
    }
    return { items: [], cartId: null, isGuest: true };
  }
};

/**
 * Save cart to Firebase
 * @param {Array} items - Cart items
 * @param {Object|null} user - Firebase user object or null
 * @returns {Object} Save result
 */
export const saveCartToFirebase = async (items, user = null) => {
  try {
    const cartId = getCurrentCartId(user);
    const cartRef = ref(database, `carts/${cartId}`);
    
    const cartData = {
      items: items.map(item => ({
        ...item,
        synced: undefined,
        lastSynced: undefined
      })),
      updatedAt: new Date().toISOString(),
      itemCount: items.length,
      totalQuantity: items.reduce((sum, item) => sum + (item.quantity || 1), 0),
      totalPrice: items.reduce((sum, item) => sum + ((parseFloat(item.price) || 0) * (item.quantity || 1)), 0),
      isGuest: !user,
      userId: user ? user.uid : null
    };
    
    // Only add createdAt for new carts
    const snapshot = await get(cartRef);
    if (!snapshot.exists()) {
      cartData.createdAt = new Date().toISOString();
    }
    
    await set(cartRef, cartData);
    
    // Save backup to localStorage
    localStorage.setItem('cart_backup', JSON.stringify(items));
    localStorage.setItem('last_cart_sync', new Date().toISOString());
    
    return {
      success: true,
      cartId,
      updatedAt: cartData.updatedAt
    };
  } catch (error) {
    console.error('Error saving cart to Firebase:', error);
    
    // Fallback to localStorage
    localStorage.setItem('cart_backup', JSON.stringify(items));
    
    return {
      success: false,
      error: error.message,
      usedLocalStorage: true
    };
  }
};

/**
 * Merge guest cart with user cart after login
 * @param {string} guestCartId - Guest cart ID
 * @param {string} userId - User UID
 * @returns {Object} Merge result
 */
export const mergeGuestCartWithUser = async (guestCartId, userId) => {
  try {
    const guestCartRef = ref(database, `carts/${guestCartId}`);
    const userCartId = getUserCartId(userId);
    const userCartRef = ref(database, `carts/${userCartId}`);
    
    const [guestSnap, userSnap] = await Promise.all([
      get(guestCartRef),
      get(userCartRef)
    ]);
    
    let mergedItems = [];
    
    // Get guest cart items
    if (guestSnap.exists()) {
      const guestCart = guestSnap.val();
      mergedItems = guestCart.items || [];
    }
    
    // Get user cart items and merge
    if (userSnap.exists()) {
      const userCart = userSnap.val();
      const userItems = userCart.items || [];
      
      // Merge items by product ID
      const itemMap = new Map();
      
      // Add user items to map
      userItems.forEach(item => {
        itemMap.set(item.id, { ...item });
      });
      
      // Merge guest items
      mergedItems.forEach(guestItem => {
        const existingItem = itemMap.get(guestItem.id);
        if (existingItem) {
          // Update quantity
          existingItem.quantity = (existingItem.quantity || 1) + (guestItem.quantity || 1);
        } else {
          // Add new item
          itemMap.set(guestItem.id, { ...guestItem });
        }
      });
      
      mergedItems = Array.from(itemMap.values());
    }
    
    // Save merged cart to user
    const mergedCartData = {
      items: mergedItems,
      updatedAt: new Date().toISOString(),
      userId: userId,
      isGuest: false,
      mergedFrom: [guestCartId, userCartId],
      mergedAt: new Date().toISOString()
    };
    
    // Check if user cart exists to preserve createdAt
    if (userSnap.exists()) {
      const userCart = userSnap.val();
      mergedCartData.createdAt = userCart.createdAt || new Date().toISOString();
    } else {
      mergedCartData.createdAt = new Date().toISOString();
    }
    
    await set(userCartRef, mergedCartData);
    
    // Clear guest cart
    await set(guestCartRef, null);
    
    // Clear guest cart ID from localStorage
    localStorage.removeItem('guestCartId');
    
    return {
      success: true,
      mergedItems,
      cartId: userCartId
    };
  } catch (error) {
    console.error('Error merging carts:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Listen to cart changes in real-time
 * @param {Object|null} user - Firebase user object or null
 * @param {Function} callback - Callback function
 * @returns {Function} Unsubscribe function
 */
export const listenToCart = (user, callback) => {
  try {
    const cartId = getCurrentCartId(user);
    const cartRef = ref(database, `carts/${cartId}`);
    
    return onValue(cartRef, (snapshot) => {
      if (snapshot.exists()) {
        const cartData = snapshot.val();
        callback({
          items: cartData.items || [],
          cartId,
          updatedAt: cartData.updatedAt,
          isGuest: cartData.isGuest || false
        });
      } else {
        callback({
          items: [],
          cartId,
          updatedAt: new Date().toISOString(),
          isGuest: true
        });
      }
    }, (error) => {
      console.error('Error listening to cart:', error);
      callback({
        items: [],
        cartId: null,
        error: error.message
      });
    });
  } catch (error) {
    console.error('Error setting up cart listener:', error);
    return () => {}; // Return empty unsubscribe function
  }
};

/**
 * Clear cart from Firebase
 * @param {Object|null} user - Firebase user object or null
 * @returns {Object} Clear result
 */
export const clearCartFromFirebase = async (user = null) => {
  try {
    const cartId = getCurrentCartId(user);
    const cartRef = ref(database, `carts/${cartId}`);
    
    await set(cartRef, {
      items: [],
      updatedAt: new Date().toISOString(),
      clearedAt: new Date().toISOString(),
      isGuest: !user,
      userId: user ? user.uid : null
    });
    
    // Clear localStorage backup
    localStorage.removeItem('cart_backup');
    
    return { success: true, cartId };
  } catch (error) {
    console.error('Error clearing cart from Firebase:', error);
    return { success: false, error: error.message };
  }
};

/* ==========================================================================
   QUOTE FUNCTIONS
========================================================================== */

/**
 * Submit a quote
 * @param {Object} data - Quote data
 * @returns {string} Quote ID
 */
export const submitQuote = async (data) => {
  try {
    console.log('🔄 submitQuote called with data:', data);
    
    const quoteRef = push(ref(database, "quotes"));
    const quoteData = {
      ...data,
      id: quoteRef.key,
      status: "pending",
      createdAt: new Date().toISOString()
    };
    
    console.log('📤 Storing quote data:', quoteData);
    await set(quoteRef, quoteData);
    
    console.log('✅ Quote submitted successfully with ID:', quoteRef.key);
    return quoteRef.key;
  } catch (err) {
    console.error("❌ submitQuote error:", err);
    throw err;
  }
};

/* ==========================================================================
   AUTH FUNCTIONS
========================================================================== */

/**
 * Reset password for email
 * @param {string} email - User email
 * @returns {Object} Result with success status
 */
export const resetPassword = async (email) => {
  try {
    console.log('🔄 resetPassword called for email:', email);
    await sendPasswordResetEmail(auth, email);
    console.log('✅ Password reset email sent successfully');
    return { success: true, message: 'Password reset email sent successfully' };
  } catch (error) {
    console.error('❌ resetPassword error:', error);
    return { 
      success: false, 
      error: error.message,
      code: error.code 
    };
  }
};

/* ==========================================================================
   EXPORTS
========================================================================== */

export {
  // Core Firebase instances
  app,
  auth,
  database,

  // Database helpers
  ref,
  get,
  set,
  update,
  remove,
  push,
  onValue,

  // Auth helpers
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  sendPasswordResetEmail
};

// Default export with all functions
export default { 
  app, 
  auth, 
  database,
  
  // Currency functions - ONLY FETCH from existing database
  getCurrencyRates,
  getCurrencySymbols,
  getCurrencyData,
  
  // History functions
  logHistoryAction,
  getAllHistory,
  getEntityHistory,
  clearOldHistory,
  
  // Admin functions
  checkIsAdmin,
  getAllAdmins,
  addAdmin,
  removeAdmin,
  
  // User functions
  storeUserProfile,
  getUserProfile,
  getAllUsers,
  updateUserProfile,
  updateLastLogin,
  deleteUser,
  
  // Vendor functions
  storeVendorProfile,
  getVendorProfile,
  getAllVendors,
  updateVendorStatus,
  getVendorsByStatus,
  
  // Combined functions
  storeUserOrVendorProfile,
  getAllAccounts,
  getUserCounts,
  searchAccounts,
  
  // Cart functions
  getGuestCartId,
  getUserCartId,
  getCurrentCartId,
  loadCartFromFirebase,
  saveCartToFirebase,
  mergeGuestCartWithUser,
  listenToCart,
  clearCartFromFirebase,
  
  // Other functions
  submitQuote,
  resetPassword
};