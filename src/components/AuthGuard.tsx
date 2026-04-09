// src/components/AuthGuard.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    const adminUser = localStorage.getItem("adminUser");

    if (!adminToken || !adminUser) {
      router.replace("/admin/login");
      return;
    }

    try {
      const user = JSON.parse(adminUser);
      if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(user.role)) {
          router.replace("/admin/login");
          return;
        }
      }
      setIsAuthorized(true);
    } catch (error) {
      router.replace("/admin/login");
    } finally {
      setIsLoading(false);
    }
  }, [router, pathname, allowedRoles]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
}
