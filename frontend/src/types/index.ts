export type UserRole = "owner" | "user";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
};

export type Category = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProductStatus = "In Stock" | "Low Stock" | "Out of Stock";

export type Product = {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  quantity: number;
  unitPrice: number;
  supplierName: string | null;
  status: ProductStatus;
  imageUrl: string | null;
  categoryId: string;
  category?: Category;
  user?: { id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
};

export type ProductListResponse = {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type UserAccountStats = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  productCount: number;
  categoryCount: number;
  stockQuantity: number;
};

export type UserAnalytics = {
  totalUsers: number;
  owners: number;
  members: number;
  joinedThisWeek: number;
  joinedThisMonth: number;
  withInventory: number;
  withoutInventory: number;
  avgProductsPerUser: number;
  accounts: UserAccountStats[];
};

export type DashboardStats = {
  totalProducts: number;
  totalCategories: number;
  totalStockQuantity: number;
  lowStockItems: number;
  outOfStockItems: number;
  userAnalytics: UserAnalytics | null;
};

export type AuthResponse = {
  accessToken: string;
  user: User;
};
