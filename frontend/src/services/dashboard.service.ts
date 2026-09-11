import { api } from "@/src/lib/api";
import { DashboardStats } from "@/src/types";

export function getDashboardStats() {
  return api<DashboardStats>("/dashboard/stats");
}
