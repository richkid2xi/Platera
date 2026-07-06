import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { staffMembers, type StaffRole } from "@/mocks/staff";
import type { UserRole } from "@/config/permissions";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  staffRole: StaffRole;
  restaurantId: string;
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string, role: AuthUser["role"]) => Promise<void>;
  signOut: () => Promise<void>;
  isSettingUp: boolean;
  isLoggingOut: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const COOKIE_NAME = "platera_auth_session";

// Mock Cookie helpers
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
};

const getCookie = (name: string) => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) return decodeURIComponent(match[2]);
  return null;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

/** Maps granular staff roles → the three auth tiers */
function mapRole(staffRole: StaffRole): AuthUser["role"] {
  if (staffRole === "Owner") return "owner";
  if (staffRole === "Manager") return "manager";
  return "staff";
}

// Simulate network latency
function simulateDelay(ms = 900) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

const MOCK_PASSWORD = "platera123";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Initialize from storage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const stored = getCookie(COOKIE_NAME);
        if (stored) {
          const parsedUser = JSON.parse(stored) as AuthUser;
          
          // Simulate fetching fresh user data from API to check if role changed or session expired
          // Here we just check the mock database to keep the session in sync
          const member = staffMembers.find(s => s.email === parsedUser.email);
          if (member && member.status === 'active') {
             const freshUser = {
               ...parsedUser,
               role: mapRole(member.role),
               staffRole: member.role,
             };
             setUser(freshUser);
             // update cookie with fresh data
             setCookie(COOKIE_NAME, JSON.stringify(freshUser));
          } else if (parsedUser.id.startsWith("mock-id")) {
             // For newly signed up users not in the static mock list
             setUser(parsedUser);
          } else {
             // User disabled or removed
             deleteCookie(COOKIE_NAME);
             setUser(null);
          }
        }
      } catch {
        // ignore corrupt data
        deleteCookie(COOKIE_NAME);
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    await simulateDelay();
    const member = staffMembers.find(
      (s) => s.email.toLowerCase() === email.toLowerCase() && s.status === "active"
    );
    if (!member || password !== MOCK_PASSWORD) {
      throw new Error("Invalid credentials");
    }
    const authUser: AuthUser = {
      id: String(member.id),
      name: member.name,
      email: member.email,
      role: mapRole(member.role),
      staffRole: member.role,
      restaurantId: "rest-12345",
    };
    setCookie(COOKIE_NAME, JSON.stringify(authUser));
    setUser(authUser);
    setIsSettingUp(true);
    setTimeout(() => setIsSettingUp(false), 2000);
  };

  const signUp = async (name: string, email: string, _password: string, role: AuthUser["role"]) => {
    await simulateDelay();
    const newUser: AuthUser = {
      id: "mock-id-" + crypto.randomUUID(),
      name,
      email,
      role,
      staffRole: role === "owner" ? "Owner" : role === "manager" ? "Manager" : "Waiter",
      restaurantId: "rest-12345",
    };
    setCookie(COOKIE_NAME, JSON.stringify(newUser));
    setUser(newUser);
    setIsSettingUp(true);
    setTimeout(() => setIsSettingUp(false), 2000);
  };

  const signOut = async () => {
    setIsLoggingOut(true);
    await simulateDelay(1500);
    deleteCookie(COOKIE_NAME);
    setUser(null);
    setIsLoggingOut(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, signIn, signUp, signOut, isSettingUp, isLoggingOut }}
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

