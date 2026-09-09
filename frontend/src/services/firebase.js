import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDOEP8-bpTzHket03OMRoT3HduK_aL1rDQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "hack1-2ee5e.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "hack1-2ee5e",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "hack1-2ee5e.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "979364356975",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:979364356975:web:58540951526970be167e9a",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-ZZRXQX45MD"
};

// Initialize Firebase App instance safely
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);

/**
 * Register a user with Firebase Authentication and save their filmmaker profile in Firestore.
 */
export const registerWithFirebase = async ({ email, password, name, role, ...extraProfile }) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Update Firebase Auth Display Name
    await updateProfile(firebaseUser, {
      displayName: name
    });

    // Enforce default non-admin role security rule
    const safeRole = (role && role.toUpperCase() !== 'ADMIN') ? role : 'DIRECTOR';

    const userProfile = {
      id: firebaseUser.uid,
      email: firebaseUser.email,
      name: name || firebaseUser.email.split('@')[0],
      role: safeRole,
      avatarUrl: extraProfile.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || email)}`,
      bio: extraProfile.bio || `Cinema professional (${safeRole})`,
      skills: extraProfile.skills || [],
      languages: extraProfile.languages || ['English'],
      genres: extraProfile.genres || [],
      showreelUrl: extraProfile.showreelUrl || '',
      productionCompany: extraProfile.productionCompany || '',
      actorType: extraProfile.actorType || (safeRole === 'ACTOR' ? 'Actor' : ''),
      filmography: [],
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    // Store in Firestore collection 'users'
    const userDocRef = doc(firestore, 'users', firebaseUser.uid);
    await setDoc(userDocRef, userProfile);

    return userProfile;
  } catch (error) {
    console.error("[Firebase Auth Register Error]:", error);
    throw error;
  }
};

/**
 * Sign In with Firebase Authentication and retrieve profile from Firestore.
 */
export const loginWithFirebase = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Fetch from Firestore
    const userDocRef = doc(firestore, 'users', firebaseUser.uid);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }

    // Fallback profile if Firestore doc hasn't been created yet
    const fallbackProfile = {
      id: firebaseUser.uid,
      email: firebaseUser.email,
      name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
      role: 'DIRECTOR',
      createdAt: new Date().toISOString()
    };
    await setDoc(userDocRef, fallbackProfile);
    return fallbackProfile;
  } catch (error) {
    console.error("[Firebase Auth Login Error]:", error);
    throw error;
  }
};

/**
 * Sign Out of Firebase Auth
 */
export const logoutFromFirebase = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("[Firebase Logout Error]:", error);
  }
};

/**
 * Upload any asset (screenplay PDF, video clip, character artwork, audio track) to Firebase Storage.
 */
export const uploadFileToFirebaseStorage = async (file, folderPath = 'cinema_assets') => {
  if (!file) return null;
  try {
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storageRef = ref(storage, `${folderPath}/${fileName}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("[Firebase Storage Upload Error]:", error);
    throw error;
  }
};

export default app;
