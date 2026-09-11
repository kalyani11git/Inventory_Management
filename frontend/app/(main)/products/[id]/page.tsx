"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Product } from "@/src/types";
import {
  adjustStock,
  deleteProduct,
  getProduct,
} from "@/src/services/products.service";
import { Loader, StatusBadge } from "@/src/components/ui";
import { useToast } from "@/src/components/Toast";
import { formatDateTime, formatMoney } from "@/src/lib/format";
import { fileUrl } from "@/src/lib/api";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { notify } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState("1");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getProduct(params.id)
      .then(setProduct)
      .catch((err) => notify("error", err.message))
      .finally(() => setLoading(false));
  }, [params.id, notify]);

  async function changeStock(type: "increase" | "decrease") {
    const amount = parseInt(qty, 10);
    if (!amount || amount < 1) {
      notify("error", "Enter a valid quantity");
      return;
    }
    setBusy(true);
    try {
      const updated = await adjustStock(params.id, { type, quantity: amount });
      setProduct(updated);
      notify("success", "Stock updated");
    } catch (err: any) {
      notify("error", err.message);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete() {
    if (!product) return;
    if (!confirm(`Delete product "${product.name}"?`)) return;
    try {
      await deleteProduct(product.id);
      notify("success", "Product deleted");
      router.push("/products");
    } catch (err: any) {
      notify("error", err.message);
    }
  }

  if (loading) return <Loader />;
  if (!product) return <p>Product not found.</p>;

  return (
    <div>
      <p className="mb-2">
        <Link className="link" href="/products">
          ← Back to products
        </Link>
      </p>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div>
          <h1 className="page-title">{product.name}</h1>
          <p className="page-sub mb-0">SKU: {product.sku}</p>
        </div>
        <div className="flex gap-2">
          <Link className="btn btn-outline" href={`/products/${product.id}/edit`}>
            Edit
          </Link>
          <button className="btn btn-danger" onClick={onDelete}>
            Delete
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="mt-0 mb-1 text-lg font-semibold">Details</h3>
          {fileUrl(product.imageUrl) ? (
            <img
              className="product-photo"
              src={fileUrl(product.imageUrl) || ""}
              alt={product.name}
            />
          ) : null}
          <div className="detail-row">
            <span>Category</span>
            <b>{product.category?.name || "-"}</b>
          </div>
          <div className="detail-row">
            <span>Supplier</span>
            <b>{product.supplierName || "-"}</b>
          </div>
          <div className="detail-row">
            <span>Unit Price</span>
            <b>{formatMoney(product.unitPrice)}</b>
          </div>
          <div className="detail-row">
            <span>Quantity</span>
            <b>{product.quantity}</b>
          </div>
          <div className="detail-row">
            <span>Status</span>
            <StatusBadge status={product.status} />
          </div>
          <div className="detail-row">
            <span>Date Added</span>
            <b>{formatDateTime(product.createdAt)}</b>
          </div>
          <div className="detail-row">
            <span>Last Updated</span>
            <b>{formatDateTime(product.updatedAt)}</b>
          </div>
          <div className="pt-3">
            <span className="text-[#6b7280] text-sm">Description</span>
            <p className="mt-1 mb-0">{product.description || "No description"}</p>
          </div>
        </div>

        <div className="card">
          <h3 className="mt-0 mb-1 text-lg font-semibold">Adjust stock</h3>
          <p className="text-[#666]">
            Increase or reduce quantity. Stock cannot go below 0.
          </p>
          <label className="label">Quantity</label>
          <input
            className="input mb-3"
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              className="btn"
              disabled={busy}
              onClick={() => changeStock("increase")}
            >
              Increase
            </button>
            <button
              className="btn btn-black"
              disabled={busy}
              onClick={() => changeStock("decrease")}
            >
              Reduce
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
