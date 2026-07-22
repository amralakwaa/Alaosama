"use client";

import { useAuth } from "@/lib/auth/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * يوجّه المستخدم غير المسجّل إلى صفحة الدخول.
 * استخدامه: ضعه في أي صفحة محمية.
 */
export function useRequireAuth(redirectTo = "/login") {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(redirectTo);
    }
  }, [user, isLoading, router, redirectTo]);

  return { user, isLoading };
}

/**
 * يوجّه المستخدم المسجّل بعيداً عن صفحة Login/Register.
 * التوجيه يعتمد على دور المستخدم.
 */
export function useRedirectIfAuth(defaultRedirect = "/") {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      // Role-based redirect
      if (user.role === "admin") {
        router.push("/admin");
      } else if (user.role === "author") {
        router.push("/author");
      } else {
        router.push(defaultRedirect);
      }
    }
  }, [user, isLoading, router, defaultRedirect]);

  return { user, isLoading };
}
