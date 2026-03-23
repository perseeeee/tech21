// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBo86iU2gHHXVmd5nrFnNInjLXOH_wqWLM",
  authDomain: "gadget-fe1ac.firebaseapp.com",
  projectId: "gadget-fe1ac",
  storageBucket: "gadget-fe1ac.firebasestorage.app",
  messagingSenderId: "886449691829",
  appId: "1:886449691829:web:d3694b739aea923e2cb2fc"
};

// Check if all required config values are present
const requiredConfig = ['apiKey', 'authDomain', 'projectId'];
const missingConfig = requiredConfig.filter(key => !firebaseConfig[key]);

if (missingConfig.length > 0) {
  console.error('❌ Missing Firebase configuration:', missingConfig);
  throw new Error('Firebase configuration is incomplete');
}

// Initialize Firebase
console.log('🚀 Initializing Firebase...');
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth and get a reference to the service
const auth = getAuth(app);

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Optional: Add scopes if needed
googleProvider.addScope('email');
googleProvider.addScope('profile');

console.log('✅ Firebase initialized successfully');

export { auth, googleProvider };
export default app;