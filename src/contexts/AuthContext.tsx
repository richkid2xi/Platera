import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { apiClient } from "@/api/client";

export type UserRole = "OWNER" | "MANAGER" | "STAFF";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  restaurantId: string;
}

export interface Restaurant {
  id: string;
  name: string;
  subscriptionStatus: string;
  trialEndsAt?: string | null;
  currentPeriodEndsAt?: string | null;
  gracePeriodEndsAt?: string | null;
  logoUrl?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  restaurant: Restaurant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (payload: any) => Promise<void>;
  signOut: () => Promise<void>;
  isSettingUp: boolean;
  isLoggingOut: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Initialize session by fetching from /api/v1/auth/me
  const fetchSession = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get("/auth/me");
      setUser(res.data.user);
      setRestaurant(res.data.restaurant);
    } catch (err) {
      setUser(null);
      setRestaurant(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();

    // Listen for unauthorized events to clear session locally
    const handleUnauthorized = () => {
      setUser(null);
      setRestaurant(null);
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsSettingUp(true);
    try {
      const res = await apiClient.post("/auth/login", { email, password });
      setUser(res.data.user);
      setRestaurant(res.data.restaurant);
    } finally {
      // Small artificial delay just for the UI shutter animation
      setTimeout(() => setIsSettingUp(false), 1500);
    }
  };

  const signUp = async (payload: any) => {
    setIsSettingUp(true);
    try {
      const res = await apiClient.post("/auth/register", {
        restaurantName: payload.restaurantName,
        address: payload.restaurantAddress,
        contactPhone: payload.phone,
        contactEmail: payload.email,
        userName: payload.name,
        userEmail: payload.email,
        userPhone: payload.phone,
        password: payload.password,
        numberOfTables: payload.tablesCount,
      });
      setUser(res.data.user);
      setRestaurant(res.data.restaurant);
    } finally {
      setTimeout(() => setIsSettingUp(false), 1500);
    }
  };

  const signOut = async () => {
    setIsLoggingOut(true);
    try {
      await apiClient.post("/auth/logout");
      setUser(null);
      setRestaurant(null);
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        restaurant,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        signUp,
        signOut,
        isSettingUp,
        isLoggingOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
