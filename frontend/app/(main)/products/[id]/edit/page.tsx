"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ProductForm, ProductFormValues } from "@/src/components/ProductForm";
import { getProduct, updateProduct, uploadImage } from "@/src/services/products.service";
import { useToast } from "@/src/components/Toast";
import { Loader } from "@/src/components/ui";

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { notify } = useToast();
  const [initial, setInitial] = useState<ProductFormValues | null>(null);

  useEffect(() => {
    getProduct(params.id)
      .then((p) =>
        setInitial({
          name: p.name,
          sku: p.sku,
          categoryId: p.categoryId,
          description: p.description || "",
          quantity: String(p.quantity),
          unitPrice: String(p.unitPrice),
          supplierName: p.supplierName || "",
        }),
      )
      .catch((err) => notify("error", err.message));
  }, [params.id, notify]);

  async function onSubmit(values: ProductFormValues, image?: File | null) {
    try {
      await updateProduct(params.id, {
        name: values.name.trim(),
        sku: values.sku.trim(),
        categoryId: values.categoryId,
        description: values.description.trim(),
        quantity: Number(values.quantity),
        unitPrice: Number(values.unitPrice),
        supplierName: values.supplierName.trim(),
      });
      if (image) {
        await uploadImage(params.id, image);
      }
      notify("success", "Product updated");
      router.push(`/products/${params.id}`);
    } catch (err: any) {
      notify("error", err.message);
    }
  }

  return (
    <div>
      <p className="mb-2">
        <Link className="link" href={`/products/${params.id}`}>
          ← Back to details
        </Link>
      </p>
      <h1 className="page-title">Edit Product</h1>
      <p className="page-sub">Update product information</p>
      {initial ? (
        <ProductForm
          initial={initial}
          submitLabel="Update Product"
          onSubmit={onSubmit}
        />
      ) : (
        <Loader />
      )}
    </div>
  );
}
