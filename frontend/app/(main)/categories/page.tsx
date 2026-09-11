"use client";

import { useEffect, useState } from "react";
import { Category } from "@/src/types";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "@/src/services/categories.service";
import { EmptyState, Loader } from "@/src/components/ui";
import { useToast } from "@/src/components/Toast";
import { formatDate } from "@/src/lib/format";

export default function CategoriesPage() {
  const { notify } = useToast();
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const data = await getCategories();
    setItems(data);
  }

  useEffect(() => {
    load()
      .catch((err) => notify("error", err.message))
      .finally(() => setLoading(false));
  }, [notify]);

  function resetForm() {
    setName("");
    setDescription("");
    setEditId(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      notify("error", "Category name is required");
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await updateCategory(editId, {
          name: name.trim(),
          description: description.trim(),
        });
        notify("success", "Category updated");
      } else {
        await createCategory({
          name: name.trim(),
          description: description.trim() || undefined,
        });
        notify("success", "Category added");
      }
      resetForm();
      await load();
    } catch (err: any) {
      notify("error", err.message);
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(cat: Category) {
    if (!confirm(`Delete category "${cat.name}"?`)) return;
    try {
      await deleteCategory(cat.id);
      notify("success", "Category deleted");
      if (editId === cat.id) resetForm();
      await load();
    } catch (err: any) {
      notify("error", err.message);
    }
  }

  function startEdit(cat: Category) {
    setEditId(cat.id);
    setName(cat.name);
    setDescription(cat.description || "");
  }

  return (
    <div>
      <h1 className="page-title">Categories</h1>
      <p className="page-sub">
        Create categories first, then assign them to products.
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        <form className="card" onSubmit={onSubmit}>
          <h3 className="mt-0 mb-4 text-lg font-semibold">
            {editId ? "Edit category" : "Add category"}
          </h3>
          <div className="field">
            <label className="label">Name</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="field">
            <label className="label">Description</label>
            <textarea
              className="textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button className="btn" disabled={saving}>
              {saving ? "Saving..." : editId ? "Update" : "Add"}
            </button>
            {editId ? (
              <button type="button" className="btn btn-outline" onClick={resetForm}>
                Cancel
              </button>
            ) : null}
          </div>
        </form>

        <div>
          {loading ? (
            <Loader />
          ) : items.length === 0 ? (
            <EmptyState title="No categories yet" text="Add one using the form." />
          ) : (
            <div className="table-wrap">
              <table className="data">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div className="font-bold">{c.name}</div>
                        <div className="text-xs text-[#666]">
                          {c.description || "-"}
                        </div>
                      </td>
                      <td>{formatDate(c.createdAt)}</td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => startEdit(c)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => onDelete(c)}
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
          )}
        </div>
      </div>
    </div>
  );
}
