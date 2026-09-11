import { api } from "@/src/lib/api";
import { User, UserRole } from "@/src/types";

export function getUsers() {
  return api<User[]>("/users");
}

export function updateUserRole(id: string, role: UserRole) {
  return api<User>(`/users/${id}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}
