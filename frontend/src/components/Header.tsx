"use client";

import { useAuth } from "@/src/components/AuthProvider";
import { ThemeToggle } from "@/src/components/ThemeToggle";

export function Header({ onMenu }: { onMenu: () => void }) {
  const { user, logout } = useAuth();
  const initial = (user?.name || "U").charAt(0).toUpperCase();

  return (
    <header className="topbar">
      <div className="flex items-center gap-3">
        <button className="btn btn-outline btn-sm md:hidden" onClick={onMenu}>
          Menu
        </button>
        <span className="text-sm text-[var(--muted)] hidden sm:inline">
          Inventory overview
        </span>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <span className="avatar">{initial}</span>
        <div className="hidden sm:block leading-tight">
          <div className="text-sm font-medium max-w-[140px] truncate">
            {user?.name}
          </div>
          <div className="text-[11px] uppercase tracking-wide text-[var(--muted)]">
            {user?.role || "user"}
          </div>
        </div>
        <button className="btn btn-black btn-sm" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
}
