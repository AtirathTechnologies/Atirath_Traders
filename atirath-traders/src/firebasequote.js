// firebasequote.js
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, set } from "firebase/database";

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
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

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
      status: 'new' // You can track the status of quotes
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
};

export default database;