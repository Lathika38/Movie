import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import {
  registerWithFirebase,
  loginWithFirebase,
  logoutFromFirebase,
  auth,
  firestore,
  uploadFileToFirebaseStorage
} from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext(null);

export const DEMO_PROFILES = [
  {
    id: "USR-DIR-001",
    name: "Christopher Vance",
    email: "director@movieos.cinema",
    role: "DIRECTOR",
    title: "Feature Director",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    badge: "DIRECTOR"
  },
  {
    id: "USR-PROD-001",
    name: "Sarah Jenkins",
    email: "producer@movieos.cinema",
    role: "PRODUCER",
    title: "Executive Line Producer",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    badge: "PRODUCER"
  },
  {
    id: "USR-ACT-001",
    name: "Elena Rostova",
    email: "actor@movieos.cinema",
    role: "ACTOR",
    title: "Lead Dramatic Actress",
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
    badge: "ACTOR"
  },
  {
    id: "USR-MUS-001",
    name: "Kaelen Thorne",
    email: "music@movieos.cinema",
    role: "MUSIC_DIRECTOR",
    title: "Master Film Composer",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    badge: "MUSIC_DIRECTOR"
  },
  {
    id: "USR-ADM-001",
    name: "DEVIL (Studio Chief)",
    email: "admin@movieos.cinema",
    role: "ADMIN",
    title: "Studio Chief & Admin",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80",
    badge: "ADMIN"
  }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('movieos_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  
  const [loading, setLoading] = useState(false);

  // Sync profile state with localStorage
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem('movieos_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('movieos_user');
    }
  }, [user]);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(firestore, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser({ id: userDoc.id, ...userDoc.data() });
          }
        } catch (err) {
          console.error("Firestore user fetch error:", err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  /**
   * Login with Firebase Auth and sync with Firestore & backend
   */
  const login = async (email, password) => {
    setLoading(true);
    try {
      let profile;
      try {
        // Attempt live Firebase Auth & Firestore login
        profile = await loginWithFirebase(email, password);
      } catch (firebaseErr) {
        console.warn("Firebase Auth fallback to backend API:", firebaseErr.message);
        // Fallback to backend API
        profile = await authApi.login({ email, password });
      }

      setUser(profile);
      return profile;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register with Firebase Auth + Firestore collection 'users' + sync backend
   */
  const register = async (userData) => {
    setLoading(true);
    try {
      let profile;
      try {
        // 1. Live Firebase Auth & Firestore registration
        profile = await registerWithFirebase(userData);
        // Also mirror to backend API
        try {
          await authApi.register({ ...userData, id: profile.id });
        } catch (e) {
          console.warn("Backend mirror note:", e.message);
        }
      } catch (firebaseErr) {
        console.warn("Firebase Auth fallback to backend API:", firebaseErr.message);
        // Fallback to backend API
        profile = await authApi.register(userData);
      }

      setUser(profile);
      return profile;
    } finally {
      setLoading(false);
    }
  };

  const switchDemoRole = async (roleKey) => {
    try {
      // Fetch live user from Firestore by role
      const users = await authApi.getUsers(roleKey);
      if (users && users.length > 0) {
        setUser(users[0]);
        return users[0];
      }
      
      const demo = DEMO_PROFILES.find(p => p.role === roleKey);
      if (demo) {
        const fullProfile = await authApi.getProfile(demo.id).catch(() => null);
        setUser(fullProfile || demo);
        return fullProfile || demo;
      }
    } catch (e) {
      console.warn("Role switch note:", e.message);
      const demo = DEMO_PROFILES.find(p => p.role === roleKey);
      if (demo) setUser(demo);
    }
  };

  const logout = async () => {
    await logoutFromFirebase();
    setUser(null);
    localStorage.removeItem('movieos_user');
  };

  const getRolePath = (role) => {
    switch (role) {
      case 'DIRECTOR': return '/director';
      case 'PRODUCER': return '/producer';
      case 'ACTOR': return '/actor';
      case 'MUSIC_DIRECTOR': return '/music-director';
      case 'ADMIN': return '/admin';
      default: return '/director';
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      loading,
      login,
      register,
      switchDemoRole,
      logout,
      getRolePath,
      uploadAsset: uploadFileToFirebaseStorage,
      isAuthenticated: !!user,
      role: user?.role || 'DIRECTOR'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
