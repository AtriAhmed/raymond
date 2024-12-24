import { User } from "@/types";
import axios from "axios";
import React, { ReactNode, useContext, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

type AuthContextType = {
  user: User | undefined | null;
  setUser: React.Dispatch<React.SetStateAction<User | undefined | null>>;
  fingerprint: string;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

function generateRandomFingerprint(): string {
  return uuidv4().toString().replace(/-/g, "");
}

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | undefined | null>(undefined);
  const [fingerprint] = useState<string>(() => {
    const savedFingerprint = localStorage.getItem("user-fingerprint");
    if (savedFingerprint) {
      return savedFingerprint;
    }
    const newFingerprint = generateRandomFingerprint();
    localStorage.setItem("user-fingerprint", newFingerprint);
    return newFingerprint;
  });

  async function fetchUser(): Promise<void> {
    try {
      const res = await axios.get("/auth/status");
      setUser(res.data.user);
    } catch (err) {}
  }

  async function logout() {
    try {
      await axios.post("/auth/logout");
      setUser(null);
    } catch (err) {}
  }

  useEffect(() => {
    fetchUser();
  }, []);

  return <AuthContext.Provider value={{ user, setUser, fingerprint, fetchUser, logout }}>{children}</AuthContext.Provider>;
}

export default AuthProvider;

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
