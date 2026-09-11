"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/src/components/AuthProvider";
import { Sidebar } from "@/src/components/Sidebar";
import { Header } from "@/src/components/Header";
import { Loader } from "@/src/components/ui";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
      return;
    }
    if (!user) return;

    const onInventory =
      pathname.startsWith("/products") || pathname.startsWith("/categories");
    if (user.role === "owner" && onInventory) {
      router.replace("/dashboard");
    }
    if (user.role === "user" && pathname.startsWith("/users")) {
      router.replace("/dashboard");
    }
  }, [loading, user, pathname, router]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader text="Checking session..." />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen md:flex">
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="flex-1 min-w-0">
        <Header onMenu={() => setMenuOpen(true)} />
        <main className="p-4 md:p-7 max-w-[1180px]">{children}</main>
      </div>
    </div>
  );
}
