"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/shared/lib";
import { ClientSpaceShell } from "@/widgets/client-space";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, checking } = useAuth();

  useEffect(() => {
    if (!checking && !user) router.replace("/connexion");
  }, [checking, user, router]);

  if (checking || !user) return null;

  return <ClientSpaceShell>{children}</ClientSpaceShell>;
}
