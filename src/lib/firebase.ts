import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Euro Express Travels Production Firebase Config
export const firebaseConfig = {
  apiKey: "AIzaSyCyjU41Gc7SOiCFo4U1WEd0fppasNm6ocY",
  authDomain: "euro-express-500dc.firebaseapp.com",
  projectId: "euro-express-500dc",
  storageBucket: "euro-express-500dc.firebasestorage.app",
  messagingSenderId: "395293259920",
  appId: "1:395293259920:web:c586075ecf088c5a860015",
  measurementId: "G-Y726PNPJ5P"
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore & Auth for primary app
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Lazy secondary auth for admin creation (only instantiated when an admin creates a sub-admin)
let _secondaryAuth: ReturnType<typeof getAuth> | null = null;
export const getSecondaryAuth = () => {
  if (!_secondaryAuth) {
    const secondaryApp = getApps().find(a => a.name === "AdminCreationApp") 
      ? getApp("AdminCreationApp") 
      : initializeApp(firebaseConfig, "AdminCreationApp");
    _secondaryAuth = getAuth(secondaryApp);
  }
  return _secondaryAuth;
};

export const secondaryAuth = new Proxy({} as any, {
  get: (_target, prop) => {
    return (getSecondaryAuth() as any)[prop];
  }
});
