"use client";

import { useRouter } from "next/navigation";
import { ProductForm, ProductFormValues } from "@/src/components/ProductForm";
import { createProduct, uploadImage } from "@/src/services/products.service";
import { useToast } from "@/src/components/Toast";
import Link from "next/link";

export default function NewProductPage() {
  const router = useRouter();
  const { notify } = useToast();

  async function onSubmit(values: ProductFormValues, image?: File | null) {
    try {
      const created = await createProduct({
        name: values.name.trim(),
        sku: values.sku.trim(),
        categoryId: values.categoryId,
        description: values.description.trim(),
        quantity: Number(values.quantity),
        unitPrice: Number(values.unitPrice),
        supplierName: values.supplierName.trim(),
      });
      if (image) {
        await uploadImage(created.id, image);
      }
      notify("success", "Product added");
      router.push("/products");
    } catch (err: any) {
      notify("error", err.message);
    }
  }

  return (
    <div>
      <p className="mb-2">
        <Link className="link" href="/products">
          ← Back to products
        </Link>
      </p>
      <h1 className="page-title">Add Product</h1>
      <p className="page-sub">Fill the details below. SKU must be unique.</p>
      <ProductForm submitLabel="Save Product" onSubmit={onSubmit} />
    </div>
  );
}
