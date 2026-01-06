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
import {
  getDatabase,
  ref,
  set,
  update,
  get,
  push,
  onValue,
  remove
} from "firebase/database";

/* ==========================================================================
   FIREBASE CONFIG
========================================================================== */

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
   HELPERS
========================================================================== */

const getNextUserNumber = async () => {
  const snap = await get(ref(database, "adminUsersView"));
  if (!snap.exists()) return 1;

  const keys = Object.keys(snap.val());
  const nums = keys
    .filter(k => k.startsWith("user-"))
    .map(k => parseInt(k.replace("user-", "")))
    .filter(n => !isNaN(n));

  return nums.length ? Math.max(...nums) + 1 : 1;
};

/* ==========================================================================
   USER PROFILE (SIGNUP / USER SIDE)
========================================================================== */

export const storeUserProfile = async (userData) => {
  try {
    const userNumber = await getNextUserNumber();
    const userKey = `user-${userNumber}`;

    // Store ALL user data including phone, state, city, pincode
    const profile = {
      uid: userData.uid,
      name: userData.name,
      email: userData.email,
      phone: userData.phone || "",
      countryCode: userData.countryCode || "+91",
      country: userData.country || "India",
      state: userData.state || "",
      city: userData.city || "",
      pincode: userData.pincode || "",
      location: userData.location || "",
      photoURL: userData.photoURL || "",
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userNumber,
      userKey,
      accountStatus: "active",
      emailVerified: false,
      phoneVerified: false,
      orderCount: 0,
      totalSpent: 0,
      lastOrderDate: null
    };

    console.log('💾 Storing full user profile:', profile);

    // 🔐 Private user data
    await set(ref(database, `users/${userKey}`), profile);

    // 👑 Admin read-only mirror
    await set(ref(database, `adminUsersView/${userKey}`), profile);

    return { success: true, userKey, userNumber };
  } catch (err) {
    console.error("storeUserProfile error:", err);
    return { success: false, error: err.message };
  }
};

/* ==========================================================================
   USER SIDE READ / UPDATE (AUTH REQUIRED)
========================================================================== */

export const getUserProfile = async (uid) => {
  try {
    const snap = await get(ref(database, "users"));
    if (!snap.exists()) {
      console.log('No users found in database');
      return null;
    }

    const users = snap.val();
    console.log('All users in database:', users);

    for (const key in users) {
      if (users[key].uid === uid) {
        const userData = { ...users[key], userKey: key };
        console.log('✅ Found user data:', userData);
        return userData;
      }
    }
    
    console.log('❌ No user found with uid:', uid);
    return null;
  } catch (err) {
    console.error("getUserProfile error:", err);
    return null;
  }
};

export const updateLastLogin = async (uid) => {
  const snap = await get(ref(database, "users"));
  if (!snap.exists()) return;

  const users = snap.val();
  for (const key in users) {
    if (users[key].uid === uid) {
      const time = new Date().toISOString();
      await update(ref(database, `users/${key}`), { lastLogin: time });
      await update(ref(database, `adminUsersView/${key}`), { lastLogin: time });
      return;
    }
  }
};

export const updateUserProfile = async (authUid, newData) => {
  try {
    const snap = await get(ref(database, "users"));
    if (!snap.exists()) return false;

    const users = snap.val();
    let userKey = null;

    for (const key in users) {
      if (users[key].uid === authUid) {
        userKey = key;
        break;
      }
    }

    if (!userKey) return false;

    const updateData = {
      name: newData.name || "",
      email: newData.email || "",
      phone: newData.phone || "",
      countryCode: newData.countryCode || "+91",
      country: newData.country || "",
      state: newData.state || "",
      city: newData.city || "",
      pincode: newData.pincode || "",
      location: newData.location || "",
      photoURL: newData.photoURL || "",
      updatedAt: new Date().toISOString()
    };

    console.log('📝 Updating user profile with:', updateData);

    // 🔐 update private user data
    await update(ref(database, `users/${userKey}`), updateData);

    // 👑 sync admin view
    await update(ref(database, `adminUsersView/${userKey}`), updateData);

    return true;
  } catch (err) {
    console.error("updateUserProfile error:", err);
    return false;
  }
};

/* ==========================================================================
   ADMIN PANEL (NO AUTH – HARD CODED ADMIN)
========================================================================== */

export const getAllUsers = async () => {
  try {
    const snap = await get(ref(database, "adminUsersView"));
    if (!snap.exists()) return [];

    const data = snap.val();
    return Object.keys(data).map(key => ({
      userKey: key,
      ...data[key]
    })).sort((a, b) =>
      new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
  } catch (err) {
    console.error("getAllUsers error:", err);
    throw err;
  }
};

export const deleteUser = async (uid) => {
  const snap = await get(ref(database, "users"));
  if (!snap.exists()) return false;

  const users = snap.val();
  for (const key in users) {
    if (users[key].uid === uid) {
      await remove(ref(database, `users/${key}`));
      await remove(ref(database, `adminUsersView/${key}`));
      return true;
    }
  }
  return false;
};

/* ==========================================================================
   QUOTES / ORDERS
========================================================================== */

export const submitQuote = async (data) => {
  const quoteRef = push(ref(database, "quotes"));
  await set(quoteRef, {
    ...data,
    id: quoteRef.key,
    status: "pending",
    createdAt: new Date().toISOString()
  });
  return quoteRef.key;
};

export const migrateUsersToAdminView = async () => {
  const snap = await get(ref(database, "users"));
  if (!snap.exists()) {
    console.log("No users to migrate");
    return;
  }

  const users = snap.val();
  const updates = {};

  Object.keys(users).forEach(key => {
    updates[`adminUsersView/${key}`] = users[key];
  });

  await update(ref(database), updates);
  console.log("✅ Users migrated to adminUsersView");
};

/* ==========================================================================
   EXPORTS
========================================================================== */

export {
  // Core
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
};

export default { app, auth, database };