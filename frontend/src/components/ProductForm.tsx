"use client";

import { useEffect, useState } from "react";
import { Category } from "@/src/types";
import { getCategories } from "@/src/services/categories.service";
import { isNonNegativeInt, isPositiveNumber } from "@/src/validations/number";

export type ProductFormValues = {
  name: string;
  sku: string;
  categoryId: string;
  description: string;
  quantity: string;
  unitPrice: string;
  supplierName: string;
};

const empty: ProductFormValues = {
  name: "",
  sku: "",
  categoryId: "",
  description: "",
  quantity: "0",
  unitPrice: "",
  supplierName: "",
};

export function ProductForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: Partial<ProductFormValues>;
  submitLabel: string;
  onSubmit: (values: ProductFormValues, image?: File | null) => Promise<void>;
}) {
  const [values, setValues] = useState<ProductFormValues>({
    ...empty,
    ...initial,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  function set(key: keyof ProductFormValues, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function validate() {
    const next: Record<string, string> = {};
    if (!values.name.trim()) next.name = "Product name is required";
    if (!values.sku.trim()) next.sku = "SKU is required";
    if (!values.categoryId) next.categoryId = "Select a category";
    if (values.quantity.trim() === "" || !isNonNegativeInt(values.quantity)) {
      next.quantity = "Quantity must be 0 or more";
    }
    if (!isPositiveNumber(values.unitPrice)) {
      next.unitPrice = "Price must be greater than 0";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await onSubmit(values, image);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card max-w-3xl">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="field">
          <label className="label">Product Name</label>
          <input
            className="input"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
          />
          {errors.name ? <div className="field-error">{errors.name}</div> : null}
        </div>
        <div className="field">
          <label className="label">SKU</label>
          <input
            className="input"
            value={values.sku}
            onChange={(e) => set("sku", e.target.value)}
          />
          {errors.sku ? <div className="field-error">{errors.sku}</div> : null}
        </div>
      </div>

      <div className="field">
        <label className="label">Category</label>
        <select
          className="select"
          value={values.categoryId}
          onChange={(e) => set("categoryId", e.target.value)}
        >
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {errors.categoryId ? (
          <div className="field-error">{errors.categoryId}</div>
        ) : null}
        {categories.length === 0 ? (
          <div className="field-error">
            No categories yet. Create one first from the Categories page.
          </div>
        ) : null}
      </div>

      <div className="field">
        <label className="label">Description</label>
        <textarea
          className="textarea"
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="field">
          <label className="label">Quantity</label>
          <input
            className="input"
            type="number"
            min={0}
            value={values.quantity}
            onChange={(e) => set("quantity", e.target.value)}
          />
          {errors.quantity ? (
            <div className="field-error">{errors.quantity}</div>
          ) : null}
        </div>
        <div className="field">
          <label className="label">Unit Price</label>
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={values.unitPrice}
            onChange={(e) => set("unitPrice", e.target.value)}
          />
          {errors.unitPrice ? (
            <div className="field-error">{errors.unitPrice}</div>
          ) : null}
        </div>
        <div className="field">
          <label className="label">Supplier Name</label>
          <input
            className="input"
            value={values.supplierName}
            onChange={(e) => set("supplierName", e.target.value)}
          />
        </div>
      </div>

      <div className="field">
        <label className="label">Product image</label>
        <input
          className="input"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
        />
        <div className="text-xs text-[var(--muted)] mt-1">
          Optional. JPG, PNG or WEBP. Max 2MB.
        </div>
      </div>

      <button className="btn" disabled={saving}>
        {saving ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
