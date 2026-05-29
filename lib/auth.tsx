import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { FirebaseError } from "firebase/app";
import { User, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, signInWithGoogle, logOut, db } from "./firebase";

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  loginError: string | null;
  login: () => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          const docRef = doc(db, 'admins', user.uid);
          const docSnap = await getDoc(docRef);
          setIsAdmin(docSnap.exists());
        } catch (e) {
          console.error("Failed to check admin status", e);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInWithGoogle();
      setLoginError(null);
      return true;
    } catch (error) {
      console.error("Login failed", error);

      if (error instanceof FirebaseError) {
        if (error.code === 'auth/unauthorized-domain') {
          setLoginError('This website domain is not authorized in Firebase Auth yet.');
          return false;
        }

        if (error.code === 'auth/popup-closed-by-user') {
          setLoginError('Google sign-in was closed before it finished.');
          return false;
        }
      }

      setLoginError('Google sign-in failed. Please try again.');
      return false;
    }
  };

  const logout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, loginError, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
