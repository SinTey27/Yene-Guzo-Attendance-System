"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, getUser, logout as authLogout } from "@/utils/auth";

export const useAuth = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const auth = isAuthenticated();
    setAuthenticated(auth);

    if (auth) {
      setUser(getUser());
    }

    setLoading(false);
  };

  const requireAuth = () => {
    if (!loading && !authenticated) {
      router.push("/admin/login");
    }
  };

  const logout = () => {
    authLogout();
    setAuthenticated(false);
    setUser(null);
    router.push("/admin/login");
  };

  return {
    loading,
    authenticated,
    user,
    requireAuth,
    logout,
    checkAuth,
  };
};
