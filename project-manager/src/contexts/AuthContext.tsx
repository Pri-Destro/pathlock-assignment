import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { jwtDecode } from 'jwt-decode';


interface JwtPayload {
  sub: string;
  email: string;
  uid?: string;
  exp: number;
}

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string,name:string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // restore session from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decoded = jwtDecode<JwtPayload>(storedToken);
        if (decoded.exp * 1000 > Date.now()) {
          setUser({ id: decoded.uid || decoded.sub, email: decoded.email });
          setToken(storedToken);
        } else {
          localStorage.removeItem('token');
        }
      } catch {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string,name : string, password: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, password }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        return { error: error || 'Registration failed' };
      }

      const data = await res.json();
      const jwt = data.token;
      localStorage.setItem('token', jwt);
      const decoded = jwtDecode<JwtPayload>(jwt);
      setUser({ id: decoded.uid || decoded.sub, email: decoded.email });
      setToken(jwt);
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const { error } = await res.json();
        return { error: error || 'Login failed' };
      }

      const data = await res.json();
      const jwt = data.token;
      localStorage.setItem('token', jwt);
      const decoded = jwtDecode<JwtPayload>(jwt);
      setUser({ id: decoded.uid || decoded.sub, email: decoded.email });
      setToken(jwt);
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  const signOut = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signUp, signIn, signOut, token }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
