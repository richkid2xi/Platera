import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { staffMembers, type StaffRole } from "@/mocks/staff";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "owner" | "manager" | "staff";
  staffRole: StaffRole;
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string, role: AuthUser["role"]) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "platera-auth-user";

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

// Mock password — same for everyone during dev: "platera123"
const MOCK_PASSWORD = "platera123";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate from storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {
      /* ignore corrupt data */
    } finally {
      setIsLoading(false);
    }
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
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    setUser(authUser);
  };

  const signUp = async (name: string, email: string, _password: string, role: AuthUser["role"]) => {
    await simulateDelay();
    const newUser: AuthUser = {
      id: crypto.randomUUID(),
      name,
      email,
      role,
      staffRole: role === "owner" ? "Owner" : role === "manager" ? "Manager" : "Waiter",
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    setUser(newUser);
  };

  const signOut = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, signIn, signUp, signOut }}
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

