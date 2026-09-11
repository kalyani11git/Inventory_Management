"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Category, ProductListResponse } from "@/src/types";
import { getCategories } from "@/src/services/categories.service";
import { deleteProduct, getProducts } from "@/src/services/products.service";
import { EmptyState, Loader, StatusBadge } from "@/src/components/ui";
import { Pagination } from "@/src/components/Pagination";
import { useToast } from "@/src/components/Toast";
import { formatMoney } from "@/src/lib/format";
import { fileUrl } from "@/src/lib/api";

export default function ProductsPage() {
  const { notify } = useToast();
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [data, setData] = useState<ProductListResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    getProducts({
      search,
      categoryId,
      status,
      sortBy,
      sortOrder,
      page,
      limit: 10,
    })
      .then(setData)
      .catch((err) => notify("error", err.message))
      .finally(() => setLoading(false));
  }, [search, categoryId, status, sortBy, sortOrder, page, notify]);

  async function onDelete(id: string, name: string) {
    if (!confirm(`Delete product "${name}"?`)) return;
    try {
      await deleteProduct(id);
      notify("success", "Product deleted");
      const next = await getProducts({
        search,
        categoryId,
        status,
        sortBy,
        sortOrder,
        page,
        limit: 10,
      });
      setData(next);
    } catch (err: any) {
      notify("error", err.message);
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-sub mb-0">Search, filter and manage stock items</p>
        </div>
        <Link href="/products/new" className="btn">
          + Add Product
        </Link>
      </div>

      <div className="card mb-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
        <input
          className="input"
          placeholder="Search name or SKU"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
        <select
          className="select"
          value={categoryId}
          onChange={(e) => {
            setPage(1);
            setCategoryId(e.target.value);
          }}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          className="select"
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
        >
          <option value="">All status</option>
          <option value="In Stock">In Stock</option>
          <option value="Low Stock">Low Stock</option>
          <option value="Out of Stock">Out of Stock</option>
        </select>
        <select
          className="select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="name">Sort by name</option>
          <option value="quantity">Sort by quantity</option>
          <option value="unitPrice">Sort by price</option>
          <option value="createdAt">Sort by date added</option>
        </select>
        <select
          className="select"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="ASC">Ascending</option>
          <option value="DESC">Descending</option>
        </select>
      </div>

      {loading ? (
        <Loader text="Loading products..." />
      ) : !data || data.data.length === 0 ? (
        <EmptyState
          title="No products found"
          text="Try a different search or add a new product."
        />
      ) : (
        <>
          <div className="table-wrap scroll">
            <table className="data wide">
              <thead>
                <tr>
                  <th></th>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.data.map((p) => (
                  <tr key={p.id}>
                    <td>
                      {fileUrl(p.imageUrl) ? (
                        <img
                          className="thumb"
                          src={fileUrl(p.imageUrl) || ""}
                          alt=""
                        />
                      ) : (
                        <div className="thumb" />
                      )}
                    </td>
                    <td>
                      <div className="font-medium">{p.name}</div>
                    </td>
                    <td>{p.sku}</td>
                    <td>{p.category?.name || "-"}</td>
                    <td>{p.quantity}</td>
                    <td>{formatMoney(p.unitPrice)}</td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                    <td>
                      <div className="flex gap-2 items-center">
                        <Link
                          className="link text-sm"
                          href={`/products/${p.id}`}
                        >
                          View
                        </Link>
                        <Link
                          className="btn btn-outline btn-sm"
                          href={`/products/${p.id}/edit`}
                        >
                          Edit
                        </Link>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => onDelete(p.id, p.name)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-1 mt-3 text-sm text-[#6b7280]">
            <span>
              {data.total} product{data.total === 1 ? "" : "s"}
            </span>
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              onChange={setPage}
            />
          </div>
        </>
      )}
    </div>
  );
}
