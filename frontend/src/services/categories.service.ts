import { api } from "@/src/lib/api";
import { Category } from "@/src/types";

export function getCategories() {
  return api<Category[]>("/categories");
}

export function createCategory(payload: { name: string; description?: string }) {
  return api<Category>("/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateCategory(
  id: string,
  payload: { name?: string; description?: string },
) {
  return api<Category>(`/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteCategory(id: string) {
  return api<{ message: string }>(`/categories/${id}`, { method: "DELETE" });
}
