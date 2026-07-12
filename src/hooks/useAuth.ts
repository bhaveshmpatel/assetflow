"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface AuthUser {
  userId: string;
  role: string;
  departmentId?: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchSession() {
      try {
        const response = await fetch("/api/auth/session");
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSession();
  }, []);

  const logout = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      setUser(null);
      router.push("/sign-in");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return { user, isLoading, logout, refresh: () => setIsLoading(true) };
}
