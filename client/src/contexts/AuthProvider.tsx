import React, { useState, useContext, useEffect, ReactNode } from "react";
import axios from "axios";
import { User } from "@/types";

type AuthContextType = {
  user: User | undefined | null;
  setUser: React.Dispatch<React.SetStateAction<User | undefined | null>>;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | undefined | null>(undefined);

  async function fetchUser(): Promise<void> {
    try {
      const res = await axios.get("/auth/status");
      setUser(res.data.user);
    } catch (err) {
      console.log(err);
    }
  }

  async function logout() {
    await axios.post("/auth/logout");
    setUser(null);
  }

  useEffect(() => {
    fetchUser();
  }, []);

  return <AuthContext.Provider value={{ user, setUser, fetchUser, logout }}>{children}</AuthContext.Provider>;
}

export default AuthProvider;

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
