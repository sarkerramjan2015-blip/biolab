import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { FirebaseError } from "firebase/app";
import { User, getIdTokenResult, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, signInWithGoogle, logOut, db } from "./firebase";

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  loginError: string | null;
  login: () => Promise<boolean>;
  loginAsAdmin: () => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultAdminEmails = [
  'biolabjahid@gmail.com',
  'sarkerramjan2015@gmail.com',
];

const approvedAdminEmails = new Set(
  [
    ...defaultAdminEmails,
    ...(import.meta.env.VITE_ADMIN_EMAILS || '').split(','),
  ]
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
);

export async function hasAdminAccess(user: User) {
  const email = user.email?.trim().toLowerCase();

  if (user.emailVerified && email && approvedAdminEmails.has(email)) {
    return true;
  }

  try {
    const tokenResult = await getIdTokenResult(user);
    if (tokenResult.claims.admin === true) {
      return true;
    }
  } catch (error) {
    console.error('Failed to read admin claim', error);
  }

  try {
    const adminDoc = await getDoc(doc(db, 'admins', user.uid));
    return adminDoc.exists();
  } catch (error) {
    console.error('Failed to check admin document', error);
    return false;
  }
}

function getLoginErrorMessage(error: unknown) {
  if (error instanceof FirebaseError) {
    if (error.code === 'auth/unauthorized-domain') {
      return 'This website domain is not authorized in Firebase Auth yet.';
    }

    if (error.code === 'auth/popup-closed-by-user') {
      return 'Google sign-in was closed before it finished.';
    }
  }

  return 'Google sign-in failed. Please try again.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        setIsAdmin(await hasAdminAccess(user));
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
      setLoginError(getLoginErrorMessage(error));
      return false;
    }
  };

  const loginAsAdmin = async () => {
    try {
      const signedInUser = await signInWithGoogle();
      const allowed = await hasAdminAccess(signedInUser);

      if (!allowed) {
        await logOut();
        setIsAdmin(false);
        setLoginError('এই Google account-টি BIO LAB Admin হিসেবে অনুমোদিত নয়।');
        return false;
      }

      setUser(signedInUser);
      setIsAdmin(true);
      setLoginError(null);
      return true;
    } catch (error) {
      console.error('Admin login failed', error);
      setLoginError(getLoginErrorMessage(error));
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
    <AuthContext.Provider value={{ user, isAdmin, loading, loginError, login, loginAsAdmin, logout }}>
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
