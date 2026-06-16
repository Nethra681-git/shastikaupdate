import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDTaiY6yTBzotYSZM1SjReOjwSsbITZg_8",
  authDomain: "shastika-exports.firebaseapp.com",
  projectId: "shastika-exports",
  storageBucket: "shastika-exports.firebasestorage.app",
  messagingSenderId: "584894894933",
  appId: "1:584894894933:web:7f280700241ad4db4315dc",
  measurementId: "G-PQ4CCLSYD0"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;