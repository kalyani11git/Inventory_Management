const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export function apiOrigin() {
  return API_URL.replace(/\/api\/?$/, "");
}

export function fileUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${apiOrigin()}${path}`;
}

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
  } catch (err: any) {
    clearTimeout(timer);
    if (err?.name === "AbortError") {
      throw new Error("Server is not responding. Is the API running?");
    }
    throw new Error("Cannot reach API. Check if backend is running.");
  }
  clearTimeout(timer);

  let body: any = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    throw new Error(readError(body) || "Please login again");
  }

  if (!res.ok) {
    throw new Error(readError(body));
  }

  return body as T;
}

export function uploadProductImage(id: string, file: File) {
  const form = new FormData();
  form.append("file", file);
  return api(`/products/${id}/image`, { method: "POST", body: form });
}

function readError(body: any) {
  if (!body) return "Request failed";
  if (typeof body.message === "string") return body.message;
  if (Array.isArray(body.message)) return body.message.join(", ");
  return "Request failed";
}
