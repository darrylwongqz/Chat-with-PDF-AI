import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyDliSPqjBEwep0ztOAYITFcjjdYJ61rOq4',
  authDomain: 'chat-with-pdf-ai-c0d86.firebaseapp.com',
  projectId: 'chat-with-pdf-ai-c0d86',
  storageBucket: 'chat-with-pdf-ai-c0d86.firebasestorage.app',
  messagingSenderId: '1074960022013',
  appId: '1:1074960022013:web:d0a45e8de369e4d55d8194',
};
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore
const db = getFirestore(app);

// Note: For client-side Firebase SDK, the database ID is handled by the server-side code
// The client will automatically connect to the database specified in the server configuration

const storage = getStorage(app);

export { db, storage };
