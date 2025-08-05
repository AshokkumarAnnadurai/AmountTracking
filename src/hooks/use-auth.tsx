
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_UIDS_STRING = ["eXLsuSXlWXU9F9y3UogABV6mNnn2","ORO64BxWlRberWDiDBkE9KuP2Se2"]

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkIsAdmin = (currentUser: User | null) => {
    if (!currentUser || !ADMIN_UIDS_STRING) {
      return false;
    }
    // const adminUids = ADMIN_UIDS_STRING.split(',').map(uid => uid.trim());
    return ADMIN_UIDS_STRING.includes(currentUser.uid);
  };

  useEffect(() => {
    if (!ADMIN_UIDS_STRING) {
      console.error("NEXT_PUBLIC_ADMIN_UID is not set in the environment variables.");
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAdmin(checkIsAdmin(currentUser));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const loggedInUser = userCredential.user;
    setUser(loggedInUser);
    setIsAdmin(checkIsAdmin(loggedInUser));
  };

  const performSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setIsAdmin(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signInWithEmail, signOut: performSignOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
