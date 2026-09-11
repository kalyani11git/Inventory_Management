import { api } from "@/src/lib/api";
import { AuthResponse, User } from "@/src/types";

export function registerUser(payload: {
  name: string;
  email: string;
  password: string;
}) {
  return api<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload: { email: string; password: string }) {
  return api<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getMe() {
  return api<{ user: User }>("/auth/me");
}
