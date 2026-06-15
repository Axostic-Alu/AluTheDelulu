import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyATYJy0G2MCRrQVr7pg7EhN7VtUhPThYkI",
  authDomain: "alu-website-d3284.firebaseapp.com",
  projectId: "alu-website-d3284",
  storageBucket: "alu-website-d3284.firebasestorage.app",
  messagingSenderId: "649200204559",
  appId: "1:649200204559:web:cc33e2b5cd42f992309c7a"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
