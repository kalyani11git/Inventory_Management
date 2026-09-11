"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDashboardStats } from "@/src/services/dashboard.service";
import { getProducts } from "@/src/services/products.service";
import { DashboardStats, Product, UserAnalytics } from "@/src/types";
import { EmptyState, Loader, StatusBadge } from "@/src/components/ui";
import { formatDate, formatMoney } from "@/src/lib/format";
import { useAuth } from "@/src/components/AuthProvider";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const isOwner = user?.role === "owner";
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [lowItems, setLowItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading || !user) return;

    const requests: Promise<unknown>[] = [getDashboardStats()];
    if (!isOwner) {
      requests.push(
        getProducts({
          status: "Low Stock",
          limit: 5,
          sortBy: "quantity",
          sortOrder: "ASC",
        }),
      );
    }

    setLoading(true);
    Promise.all(requests)
      .then((results) => {
        setStats(results[0] as DashboardStats);
        if (!isOwner && results[1]) {
          setLowItems((results[1] as { data: Product[] }).data);
        }
      })
      .catch((err) => setError(err.message || "Could not load dashboard"))
      .finally(() => setLoading(false));
  }, [authLoading, user, isOwner]);

  if (loading) return <Loader text="Loading dashboard..." />;
  if (error) return <div className="field-error">{error}</div>;
  if (!stats) return null;

  if (isOwner) {
    return (
      <OwnerDashboard
        analytics={
          stats.userAnalytics ?? {
            totalUsers: 0,
            owners: 0,
            members: 0,
            joinedThisWeek: 0,
            joinedThisMonth: 0,
            withInventory: 0,
            withoutInventory: 0,
            avgProductsPerUser: 0,
            accounts: [],
          }
        }
      />
    );
  }

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-sub">Quick view of your current inventory</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-7">
        <div className="stat-card">
          <h4>Total Products</h4>
          <p>{stats.totalProducts}</p>
        </div>
        <div className="stat-card">
          <h4>Total Categories</h4>
          <p>{stats.totalCategories}</p>
        </div>
        <div className="stat-card">
          <h4>Total Stock Qty</h4>
          <p>{stats.totalStockQuantity}</p>
        </div>
        <div className="stat-card warn">
          <h4>Low Stock</h4>
          <p style={{ color: "#9a6400" }}>{stats.lowStockItems}</p>
          <div className="hint">Qty 1 to 10</div>
        </div>
        <div className="stat-card danger">
          <h4>Out of Stock</h4>
          <p style={{ color: "#b42318" }}>{stats.outOfStockItems}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold m-0">Low stock items</h2>
        <Link href="/products" className="link text-sm">
          View all products
        </Link>
      </div>

      {lowItems.length === 0 ? (
        <EmptyState title="No low stock products right now." />
      ) : (
        <div className="table-wrap scroll">
          <table className="data wide">
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {lowItems.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link className="link" href={`/products/${p.id}`}>
                      {p.name}
                    </Link>
                  </td>
                  <td>{p.sku}</td>
                  <td>{p.quantity}</td>
                  <td>{formatMoney(p.unitPrice)}</td>
                  <td>
                    <StatusBadge status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function OwnerDashboard({ analytics }: { analytics: UserAnalytics }) {
  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-sub">User accounts and activity</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
        <div className="stat-card">
          <h4>Total Users</h4>
          <p>{analytics.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h4>Regular Users</h4>
          <p>{analytics.members}</p>
          <div className="hint">Role: user</div>
        </div>
        <div className="stat-card">
          <h4>Owners</h4>
          <p>{analytics.owners}</p>
        </div>
        <div className="stat-card">
          <h4>Avg Products / User</h4>
          <p>{analytics.avgProductsPerUser}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
        <div className="stat-card">
          <h4>Joined This Week</h4>
          <p>{analytics.joinedThisWeek}</p>
          <div className="hint">Last 7 days</div>
        </div>
        <div className="stat-card">
          <h4>Joined This Month</h4>
          <p>{analytics.joinedThisMonth}</p>
        </div>
        <div className="stat-card">
          <h4>With Inventory</h4>
          <p>{analytics.withInventory}</p>
          <div className="hint">Users who added products</div>
        </div>
        <div className="stat-card warn">
          <h4>No Inventory Yet</h4>
          <p style={{ color: "#9a6400" }}>{analytics.withoutInventory}</p>
          <div className="hint">No products added</div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold m-0">All users</h2>
        <Link href="/users" className="link text-sm">
          Manage users
        </Link>
      </div>

      {analytics.accounts.length === 0 ? (
        <EmptyState title="No users found." />
      ) : (
        <div className="table-wrap scroll">
          <table className="data wide">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Products</th>
                <th>Categories</th>
                <th>Stock qty</th>
              </tr>
            </thead>
            <tbody>
              {analytics.accounts.map((account) => (
                <tr key={account.id}>
                  <td className="font-medium">{account.name}</td>
                  <td>{account.email}</td>
                  <td>
                    <span className="badge badge-in">{account.role}</span>
                  </td>
                  <td>{formatDate(account.createdAt)}</td>
                  <td>{account.productCount}</td>
                  <td>{account.categoryCount}</td>
                  <td>{account.stockQuantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
