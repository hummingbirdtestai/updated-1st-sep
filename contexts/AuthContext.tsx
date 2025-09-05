// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Session, User } from "@supabase/supabase-js";

// ✅ Create a wrapper so both web + native storage behave the same (async)
let storage: {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

try {
  if (typeof window !== "undefined" && window.localStorage) {
    // Web: wrap localStorage in Promise to look like AsyncStorage
    storage = {
      getItem: async (key) => window.localStorage.getItem(key),
      setItem: async (key, value) => window.localStorage.setItem(key, value),
      removeItem: async (key) => window.localStorage.removeItem(key),
    };
  } else {
    // React Native: use AsyncStorage
    const AsyncStorage = require("@react-native-async-storage/async-storage").default;
    storage = AsyncStorage;
  }
} catch {
  // Fallback: no storage
  storage = {
    getItem: async () => null,
    setItem: async () => {},
    removeItem: async () => {},
  };
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Normalize helper
  const normalizeProfile = (profile: any) => {
    if (!profile) return null;
    return {
      id: profile.id || profile.user_id || null, // always guarantee id
      email: profile.email ?? null,
      name: profile.name ?? profile.full_name ?? null,
      ...profile, // keep other properties
    };
  };

  // 🔹 Load session from storage on mount
useEffect(() => {
  const getInitialSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
    setLoading(false);
  };

  getInitialSession();

  const { data: listener } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setSession(session);
    }
  );

  return () => {
    listener.subscription.unsubscribe();
  };
}, []);


  // 🔹 Save login state
  const login = async (token: string, profile?: any) => {
    try {
      const normalizedProfile = normalizeProfile(profile);

      await storage.setItem("auth_token", token);
      await storage.setItem("auth_profile", JSON.stringify(normalizedProfile));

      setSession({ token, profile: normalizedProfile });
    } catch (err) {
      console.error("❌ Error saving session:", err);
    }
  };

  // 🔹 Clear session on logout
 const logout = async () => {
  await supabase.auth.signOut();
  setSession(null);
};


  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.profile ?? null, // ✅ now guaranteed to have id
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// 🔹 Custom hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}