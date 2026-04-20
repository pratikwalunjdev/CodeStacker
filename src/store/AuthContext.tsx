import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, getRedirectResult, signInWithPopup, signInWithRedirect, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../services/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  authError: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  authError: null,
  login: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    getRedirectResult(auth).catch((error) => {
      console.error('Firebase redirect result failed:', error);
      setAuthError('Google redirect sign-in failed. Please try again.');
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    const provider = new GoogleAuthProvider();
    setAuthError(null);

    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Firebase auth popup failed:', error);

      try {
        await signInWithRedirect(auth, provider);
      } catch (redirectError) {
        console.error('Firebase auth redirect failed:', redirectError);
        setAuthError(
          'Google sign-in failed. Please allow popups or try again in a standard browser tab.'
        );
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const isAdmin = user?.email === 'walunjpratik2001@gmail.com';

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, authError, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
