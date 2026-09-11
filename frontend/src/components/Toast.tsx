"use client";

import { createContext, useCallback, useContext, useState, ReactNode } from "react";

type ToastItem = { id: number; type: "success" | "error"; text: string };

const ToastContext = createContext<{
  notify: (type: "success" | "error", text: string) => void;
} | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const notify = useCallback((type: "success" | "error", text: string) => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="toast-wrap">
        {items.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
