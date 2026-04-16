// firebase.js - Complete Updated Version with All Fixes
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

export const getCurrencyRates = async () => {
  try {
    const ratesRef = ref(database, 'currency/rates');
    const snapshot = await get(ratesRef);
    
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      return {};
    }
  } catch (error) {
    console.error('❌ Error fetching currency rates:', error);
    throw error;
  }
};

export const getCurrencySymbols = async () => {
  try {
    const symbolsRef = ref(database, 'currency/symbols');
    const snapshot = await get(symbolsRef);
    
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      return {};
    }
  } catch (error) {
    console.error('❌ Error fetching currency symbols:', error);
    throw error;
  }
};

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
   HISTORY FUNCTIONS
========================================================================== */

export const logHistoryAction = async (actionData) => {
  try {
    const historyRef = push(ref(database, "history"));
    const timestamp = new Date().toISOString();
    
    const historyEntry = {
      ...actionData,
      id: historyRef.key,
      timestamp: timestamp,
      createdAt: timestamp
    };
    
    await set(historyRef, historyEntry);
    return { success: true, id: historyRef.key };
  } catch (err) {
    console.error("❌ logHistoryAction error:", err);
    return { success: false, error: err.message };
  }
};

export const getAllHistory = async (options = {}) => {
  try {
    const historyRef = ref(database, "history");
    const snapshot = await get(historyRef);
    
    if (!snapshot.exists()) {
      return [];
    }

    const data = snapshot.val();
    let historyArray = Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    }));

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

    historyArray.sort((a, b) => 
      new Date(b.timestamp || 0) - new Date(a.timestamp || 0)
    );

    return historyArray;
  } catch (err) {
    console.error("❌ getAllHistory error:", err);
    throw err;
  }
};

export const getEntityHistory = async (entityType, entityId) => {
  try {
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

    return historyArray;
  } catch (err) {
    console.error("❌ getEntityHistory error:", err);
    throw err;
  }
};

export const clearOldHistory = async (daysToKeep = 90) => {
  try {
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
    
    return { success: true, deletedCount };
  } catch (err) {
    console.error("❌ clearOldHistory error:", err);
    return { success: false, error: err.message };
  }
};

/* ==========================================================================
   ADMIN FUNCTIONS
========================================================================== */

export const checkIsAdmin = async (uid, email = null) => {
  console.log('🔄 checkIsAdmin called for uid:', uid, 'email:', email);
  
  try {
    const adminRef = ref(database, 'admin');
    const adminSnap = await get(adminRef);
    
    if (adminSnap.exists()) {
      const adminData = adminSnap.val();
      
      for (const key in adminData) {
        const admin = adminData[key];
        
        if (admin.uid === uid) {
          console.log('✅ Admin found by UID:', uid);
          return true;
        }
        
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

export const getAllAdmins = async () => {
  try {
    const adminRef = ref(database, 'admin');
    const adminSnap = await get(adminRef);
    
    if (!adminSnap.exists()) {
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

    return adminsArray;
  } catch (err) {
    console.error("❌ getAllAdmins error:", err);
    throw err;
  }
};

export const addAdmin = async (adminData) => {
  try {
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
    
    return { success: true, adminKey, adminNumber };
    
  } catch (err) {
    console.error("❌ addAdmin error:", err);
    return { success: false, error: err.message };
  }
};

export const removeAdmin = async (adminKey) => {
  try {
    await remove(ref(database, `admin/${adminKey}`));
    return true;
  } catch (err) {
    console.error("❌ removeAdmin error:", err);
    return false;
  }
};

/* ==========================================================================
   USER FUNCTIONS (Regular Users - users collection)
========================================================================== */

export const storeUserProfile = async (userData) => {
  console.log('🚀 START storeUserProfile (Regular User):', new Date().toISOString());
  
  try {
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
      userType: 'user'
    };

    await set(ref(database, `users/${userKey}`), profile);
    console.log('✅ Successfully wrote to users/' + userKey);

    return { success: true, userKey, userNumber, userType: 'user' };

  } catch (err) {
    console.error("❌ storeUserProfile error:", err);
    return { success: false, error: err.message };
  }
};

export const getUserProfile = async (uid) => {
  console.log('🔄 getUserProfile called for uid:', uid);
  
  try {
    // First check in users collection
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
    const vendorsRef = ref(database, 'vendors');
    const vendorsSnap = await get(vendorsRef);
    
    if (vendorsSnap.exists()) {
      const vendors = vendorsSnap.val();
      for (const key in vendors) {
        if (vendors[key].uid === uid) {
          console.log('✅ Found vendor with key:', key);
          return {
            ...vendors[key],
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

export const getUserProfileByEmail = async (email) => {
  console.log('🔄 getUserProfileByEmail called for email:', email);
  
  try {
    // First check in users collection
    const usersRef = ref(database, 'users');
    const usersSnap = await get(usersRef);
    
    if (usersSnap.exists()) {
      const users = usersSnap.val();
      for (const key in users) {
        if (users[key].email === email) {
          console.log('✅ Found user by email with key:', key);
          return {
            ...users[key],
            userKey: key,
            userType: 'user'
          };
        }
      }
    }
    
    // If not found in users, check in vendors collection
    const vendorsRef = ref(database, 'vendors');
    const vendorsSnap = await get(vendorsRef);
    
    if (vendorsSnap.exists()) {
      const vendors = vendorsSnap.val();
      for (const key in vendors) {
        if (vendors[key].email === email) {
          console.log('✅ Found vendor by email with key:', key);
          return {
            ...vendors[key],
            vendorKey: key,
            userType: 'vendor'
          };
        }
      }
    }
    
    console.log('❌ No user found with email:', email);
    return null;
    
  } catch (err) {
    console.error("❌ getUserProfileByEmail error:", err);
    return null;
  }
};

export const getAllUsers = async () => {
  try {
    const snap = await get(ref(database, "users"));
    if (!snap.exists()) {
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

    return usersArray;
  } catch (err) {
    console.error("❌ getAllUsers error:", err);
    throw err;
  }
};

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
    
    const collectionPath = isVendor ? 'vendors' : 'users';
    await update(ref(database, `${collectionPath}/${userKey}`), updateData);
    
    console.log('✅ Profile updated successfully');
    return true;
    
  } catch (err) {
    console.error("❌ updateUserProfile error:", err);
    return false;
  }
};

export const updateLastLogin = async (uid) => {
  try {
    const lastLoginTime = new Date().toISOString();
    const updateData = {
      lastLogin: lastLoginTime,
      updatedAt: lastLoginTime
    };
    
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
      console.log('✅ lastLogin updated for:', userKey);
    }
    
  } catch (err) {
    console.error("❌ updateLastLogin error:", err);
  }
};

export const deleteUser = async (uid) => {
  try {
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
      return false;
    }
    
    const collectionPath = isVendor ? 'vendors' : 'users';
    await remove(ref(database, `${collectionPath}/${userKey}`));
    
    return true;
  } catch (err) {
    console.error("❌ deleteUser error:", err);
    return false;
  }
};

/* ==========================================================================
   VENDOR FUNCTIONS
========================================================================== */

export const storeVendorProfile = async (vendorData) => {
  console.log('🚀 START storeVendorProfile:', new Date().toISOString());
  
  try {
    const vendorNumber = await getNextVendorNumber();
    const vendorKey = `vendor-${vendorNumber}`;
    
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

    await set(ref(database, `vendors/${vendorKey}`), profile);
    console.log('✅ Successfully wrote to vendors/' + vendorKey);

    return { success: true, vendorKey, vendorNumber };

  } catch (err) {
    console.error("❌ storeVendorProfile error:", err);
    return { success: false, error: err.message };
  }
};

export const getAllVendors = async () => {
  try {
    const snap = await get(ref(database, "vendors"));
    if (!snap.exists()) {
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

    return vendorsArray;
  } catch (err) {
    console.error("❌ getAllVendors error:", err);
    throw err;
  }
};

export const getVendorProfile = async (vendorId) => {
  try {
    if (vendorId.startsWith('vendor-')) {
      const vendorRef = ref(database, `vendors/${vendorId}`);
      const vendorSnap = await get(vendorRef);
      
      if (vendorSnap.exists()) {
        return {
          ...vendorSnap.val(),
          userType: 'vendor'
        };
      }
    }
    
    const vendorsRef = ref(database, "vendors");
    const vendorsSnap = await get(vendorsRef);
    
    if (vendorsSnap.exists()) {
      const vendors = vendorsSnap.val();
      for (const key in vendors) {
        if (vendors[key].uid === vendorId) {
          return {
            ...vendors[key],
            vendorKey: key,
            userType: 'vendor'
          };
        }
      }
    }
    
    return null;
  } catch (err) {
    console.error("❌ getVendorProfile error:", err);
    return null;
  }
};

export const updateVendorStatus = async (vendorKey, statusData) => {
  try {
    const updates = {};
    const timestamp = new Date().toISOString();
    
    updates[`vendors/${vendorKey}/vendorStatus`] = statusData.status;
    updates[`vendors/${vendorKey}/vendorApproved`] = statusData.status === 'approved';
    updates[`vendors/${vendorKey}/vendorApprovedAt`] = statusData.status === 'approved' ? timestamp : null;
    updates[`vendors/${vendorKey}/vendorApprovedBy`] = statusData.approvedBy || null;
    updates[`vendors/${vendorKey}/lastUpdated`] = timestamp;
    updates[`vendors/${vendorKey}/statusReason`] = statusData.reason || '';
    updates[`vendors/${vendorKey}/lastLogin`] = timestamp;
    
    await update(ref(database), updates);
    
    return true;
  } catch (err) {
    console.error("❌ updateVendorStatus error:", err);
    return false;
  }
};

export const getVendorsByStatus = async (status) => {
  try {
    const vendors = await getAllVendors();
    return vendors.filter(vendor => vendor.vendorStatus === status);
  } catch (err) {
    console.error("❌ getVendorsByStatus error:", err);
    throw err;
  }
};

/* ==========================================================================
   COMBINED FUNCTIONS (Users + Vendors)
========================================================================== */

export const storeUserOrVendorProfile = async (userData) => {
  const isVendor = userData.userType === 'vendor';
  
  if (isVendor) {
    return await storeVendorProfile(userData);
  } else {
    return await storeUserProfile(userData);
  }
};

export const getAllAccounts = async () => {
  try {
    const [users, vendors] = await Promise.all([
      getAllUsers(),
      getAllVendors()
    ]);
    
    const allAccounts = [...users, ...vendors].sort((a, b) =>
      new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
    
    return allAccounts;
  } catch (err) {
    console.error("❌ getAllAccounts error:", err);
    throw err;
  }
};

export const getUserCounts = async () => {
  try {
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
    
    return counts;
  } catch (err) {
    console.error("❌ getUserCounts error:", err);
    throw err;
  }
};

export const searchAccounts = async (searchTerm) => {
  try {
    const allAccounts = await getAllAccounts();
    const searchLower = searchTerm.toLowerCase();
    
    const results = allAccounts.filter(account => {
      return (
        (account.email && account.email.toLowerCase().includes(searchLower)) ||
        (account.name && account.name.toLowerCase().includes(searchLower)) ||
        (account.phone && account.phone.includes(searchTerm))
      );
    });
    
    return results;
  } catch (err) {
    console.error("❌ searchAccounts error:", err);
    throw err;
  }
};

/* ==========================================================================
   CART FUNCTIONS
========================================================================== */

export const getGuestCartId = () => {
  let guestCartId = localStorage.getItem('guestCartId');
  
  if (!guestCartId) {
    guestCartId = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('guestCartId', guestCartId);
    
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

export const getUserCartId = (userId) => {
  return `user_${userId}`;
};

export const getCurrentCartId = (user = null) => {
  if (user && user.uid) {
    return getUserCartId(user.uid);
  }
  return getGuestCartId();
};

export const loadCartFromFirebase = async (user = null) => {
  try {
    const cartId = getCurrentCartId(user);
    const cartRef = ref(database, `carts/${cartId}`);
    
    const snapshot = await get(cartRef);
    if (snapshot.exists()) {
      const cartData = snapshot.val();
      
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
    const localCart = localStorage.getItem('cart_backup');
    if (localCart) {
      return { items: JSON.parse(localCart), cartId: null, isGuest: true };
    }
    return { items: [], cartId: null, isGuest: true };
  }
};

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
    
    const snapshot = await get(cartRef);
    if (!snapshot.exists()) {
      cartData.createdAt = new Date().toISOString();
    }
    
    await set(cartRef, cartData);
    
    localStorage.setItem('cart_backup', JSON.stringify(items));
    localStorage.setItem('last_cart_sync', new Date().toISOString());
    
    return { success: true, cartId, updatedAt: cartData.updatedAt };
  } catch (error) {
    console.error('Error saving cart to Firebase:', error);
    localStorage.setItem('cart_backup', JSON.stringify(items));
    return { success: false, error: error.message, usedLocalStorage: true };
  }
};

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
    
    if (guestSnap.exists()) {
      const guestCart = guestSnap.val();
      mergedItems = guestCart.items || [];
    }
    
    if (userSnap.exists()) {
      const userCart = userSnap.val();
      const userItems = userCart.items || [];
      
      const itemMap = new Map();
      
      userItems.forEach(item => {
        itemMap.set(item.id, { ...item });
      });
      
      mergedItems.forEach(guestItem => {
        const existingItem = itemMap.get(guestItem.id);
        if (existingItem) {
          existingItem.quantity = (existingItem.quantity || 1) + (guestItem.quantity || 1);
        } else {
          itemMap.set(guestItem.id, { ...guestItem });
        }
      });
      
      mergedItems = Array.from(itemMap.values());
    }
    
    const mergedCartData = {
      items: mergedItems,
      updatedAt: new Date().toISOString(),
      userId: userId,
      isGuest: false,
      mergedFrom: [guestCartId, userCartId],
      mergedAt: new Date().toISOString()
    };
    
    if (userSnap.exists()) {
      const userCart = userSnap.val();
      mergedCartData.createdAt = userCart.createdAt || new Date().toISOString();
    } else {
      mergedCartData.createdAt = new Date().toISOString();
    }
    
    await set(userCartRef, mergedCartData);
    await set(guestCartRef, null);
    localStorage.removeItem('guestCartId');
    
    return { success: true, mergedItems, cartId: userCartId };
  } catch (error) {
    console.error('Error merging carts:', error);
    return { success: false, error: error.message };
  }
};

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
    return () => {};
  }
};

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

export const submitQuote = async (data) => {
  try {
    const quoteRef = push(ref(database, "quotes"));
    const quoteData = {
      ...data,
      id: quoteRef.key,
      status: "pending",
      createdAt: new Date().toISOString()
    };
    
    await set(quoteRef, quoteData);
    return quoteRef.key;
  } catch (err) {
    console.error("❌ submitQuote error:", err);
    throw err;
  }
};

/* ==========================================================================
   AUTH FUNCTIONS
========================================================================== */

export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: 'Password reset email sent successfully' };
  } catch (error) {
    return { success: false, error: error.message, code: error.code };
  }
};

/* ==========================================================================
   EXPORTS
========================================================================== */

export {
  app,
  auth,
  database,
  ref,
  get,
  set,
  update,
  remove,
  push,
  onValue,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  sendPasswordResetEmail
};

export default { 
  app, 
  auth, 
  database,
  getCurrencyRates,
  getCurrencySymbols,
  getCurrencyData,
  logHistoryAction,
  getAllHistory,
  getEntityHistory,
  clearOldHistory,
  checkIsAdmin,
  getAllAdmins,
  addAdmin,
  removeAdmin,
  storeUserProfile,
  getUserProfile,
  getUserProfileByEmail,
  getAllUsers,
  updateUserProfile,
  updateLastLogin,
  deleteUser,
  storeVendorProfile,
  getVendorProfile,
  getAllVendors,
  updateVendorStatus,
  getVendorsByStatus,
  storeUserOrVendorProfile,
  getAllAccounts,
  getUserCounts,
  searchAccounts,
  getGuestCartId,
  getUserCartId,
  getCurrentCartId,
  loadCartFromFirebase,
  saveCartToFirebase,
  mergeGuestCartWithUser,
  listenToCart,
  clearCartFromFirebase,
  submitQuote,
  resetPassword
};