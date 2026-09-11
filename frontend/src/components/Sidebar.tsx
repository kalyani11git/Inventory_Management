"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/src/components/AuthProvider";

const dashboardLink = {
  href: "/dashboard",
  label: "Dashboard",
  icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="5" rx="1.5" />
      <rect x="13" y="10" width="8" height="11" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
    </svg>
  ),
};

const inventoryLinks = [
  {
    href: "/products",
    label: "Products",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 8l-9-5-9 5 9 5 9-5z" />
        <path d="M3 8v8l9 5 9-5V8" />
      </svg>
    ),
  },
  {
    href: "/categories",
    label: "Categories",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 7h16M4 12h10M4 17h7" />
      </svg>
    ),
  },
];

const usersLink = {
  href: "/users",
  label: "Users",
  icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="8" r="3" />
      <path d="M4 19c0-2.8 2.2-5 5-5s5 2.2 5 5" />
      <circle cx="17" cy="9" r="2.2" />
      <path d="M16 19c0-1.7 1-3.2 2.5-4" />
    </svg>
  ),
};

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const links =
    user?.role === "owner"
      ? [dashboardLink, usersLink]
      : [dashboardLink, ...inventoryLinks];

  return (
    <>
      {open ? (
        <div
          className="fixed inset-0 bg-black/45 z-30 md:hidden"
          onClick={onClose}
        />
      ) : null}
      <aside
        className={`fixed md:sticky md:top-0 z-40 top-0 left-0 h-full md:h-screen w-[248px] bg-[#111] text-white flex flex-col transition-transform ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="px-5 py-5 flex items-center gap-3 border-b border-[#242424]">
          <span className="logo-mark">IM</span>
          <div>
            <div className="text-[11px] tracking-[0.16em] text-[#00B7CD] font-bold">
              STOCK
            </div>
            <div className="text-[15px] font-semibold leading-tight">
              Inventory Manager
            </div>
          </div>
        </div>
        <nav className="py-4 flex-1">
          {links.map((l) => {
            const active =
              pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`sidebar-link ${active ? "active" : ""}`}
                onClick={onClose}
              >
                {l.icon}
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-5 text-xs text-[#8a8a8a] border-t border-[#242424]">
          {user?.role === "owner"
            ? "Owner: users and overview"
            : "Low stock warning at 10 units"}
        </div>
      </aside>
    </>
  );
}
