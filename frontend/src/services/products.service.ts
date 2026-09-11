import { api, uploadProductImage } from "@/src/lib/api";
import { Product, ProductListResponse } from "@/src/types";

export type ProductQuery = {
  search?: string;
  categoryId?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
};

export function getProducts(query: ProductQuery = {}) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });
  const qs = params.toString();
  return api<ProductListResponse>(`/products${qs ? `?${qs}` : ""}`);
}

export function getProduct(id: string) {
  return api<Product>(`/products/${id}`);
}

export function createProduct(payload: Record<string, unknown>) {
  return api<Product>("/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateProduct(id: string, payload: Record<string, unknown>) {
  return api<Product>(`/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteProduct(id: string) {
  return api<{ message: string }>(`/products/${id}`, { method: "DELETE" });
}

export function adjustStock(
  id: string,
  payload: { type: "increase" | "decrease"; quantity: number },
) {
  return api<Product>(`/products/${id}/stock`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function uploadImage(id: string, file: File) {
  return uploadProductImage(id, file);
}
