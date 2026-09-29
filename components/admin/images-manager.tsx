"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { getPublicStorageUrl } from "@/lib/storage";
import {
  uploadProductImageAction,
  updateImageMetaAction,
  deleteProductImageAction,
  reorderProductImagesAction,
} from "@/app/admin/products/actions";
import type { AdminProductDetail } from "@/lib/data/admin/products";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function ImagesManager({ product }: { product: AdminProductDetail }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState("");
  const [altDrafts, setAltDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(product.images.map((image) => [image.id, image.alt_text ?? ""])),
  );
  const [uploadAltText, setUploadAltText] = useState("");
  const [variantId, setVariantId] = useState("");

  useEffect(() => {
    setAltDrafts(Object.fromEntries(product.images.map((image) => [image.id, image.alt_text ?? ""])));
  }, [product.images]);

  const variantsById = new Map(product.variants.map((variant) => [variant.id, variant]));
  const groupedImages = new Map<string, typeof product.images>();
  for (const image of product.images) {
    const key = image.variant_id ?? "product";
    groupedImages.set(key, [...(groupedImages.get(key) ?? []), image]);
  }
  const imageGroups = Array.from(groupedImages.entries())
    .map(([key, images]) => ({
      key,
      variantId: key === "product" ? null : key,
      title: key === "product"
        ? "Product-level images"
        : variantsById.get(key)
          ? `Variant: ${variantsById.get(key)!.name}`
          : "Variant images",
      images: [...images].sort((a, b) => a.display_order - b.display_order),
    }))
    .sort((a, b) => (a.variantId === null ? -1 : b.variantId === null ? 1 : a.title.localeCompare(b.title)));

  function runWhilePending(action: () => Promise<void>) {
    setIsPending(true);
    void (async () => {
      try {
        await action();
      } catch {
        setError("The image operation failed. Please try again.");
      } finally {
        setUploadProgress("");
        setIsPending(false);
      }
    })();
  }

  function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const files = Array.from(fileInputRef.current?.files ?? []);
    if (files.length === 0) {
      setError("Select at least one image.");
      return;
    }

    const invalidFiles = files.flatMap((file) => {
      if (!ALLOWED_IMAGE_TYPES.has(file.type)) return [`${file.name}: choose a JPEG, PNG, or WebP image.`];
      if (file.size > MAX_IMAGE_BYTES) return [`${file.name}: image must be 5MB or smaller.`];
      return [];
    });
    if (invalidFiles.length > 0) {
      setError(invalidFiles.join(" "));
      setNotice(null);
      return;
    }

    setError(null);
    setNotice(null);
    runWhilePending(async () => {
      let uploadedCount = 0;
      const failedFiles: string[] = [];

      for (const [index, file] of files.entries()) {
        setUploadProgress(`Uploading image ${index + 1} of ${files.length}…`);
        const formData = new FormData();
        formData.set("productId", product.id);
        formData.set("variantId", variantId);
        formData.set("altText", uploadAltText);
        formData.set("file", file);

        const result = await uploadProductImageAction(formData);
        if (result.success) uploadedCount += 1;
        else failedFiles.push(`${file.name}: ${result.error}`);
      }

      setUploadProgress("");
      if (uploadedCount > 0) setNotice(`Uploaded ${uploadedCount} image${uploadedCount === 1 ? "" : "s"}.`);
      if (failedFiles.length > 0) setError(failedFiles.join(" "));
      setUploadAltText("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (uploadedCount > 0) router.refresh();
    });
  }

  function handleSetPrimary(id: string) {
    setError(null);
    setNotice(null);
    runWhilePending(async () => {
      const result = await updateImageMetaAction({ id, isPrimary: true }, product.id);
      if (!result.success) setError(result.error);
      else {
        setNotice("Primary image updated.");
        router.refresh();
      }
    });
  }

  function handleSaveAltText(id: string) {
    setError(null);
    setNotice(null);
    runWhilePending(async () => {
      const result = await updateImageMetaAction({ id, altText: altDrafts[id] ?? "" }, product.id);
      if (!result.success) setError(result.error);
      else {
        setNotice("Alt text saved.");
        router.refresh();
      }
    });
  }

  function handleMove(images: typeof product.images, index: number, direction: -1 | 1, groupVariantId: string | null) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const reordered = [...images];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex]!, reordered[index]!];
    setError(null);
    setNotice(null);
    runWhilePending(async () => {
      const result = await reorderProductImagesAction(product.id, groupVariantId, reordered.map((image) => image.id));
      if (!result.success) setError(result.error);
      else {
        setNotice("Image order updated.");
        router.refresh();
      }
    });
  }

  function handleDelete(id: string) {
    setError(null);
    setNotice(null);
    runWhilePending(async () => {
      const result = await deleteProductImageAction(id, product.id);
      if (!result.success) {
        setError(result.error);
        if (result.error.startsWith("Image record was deleted") || result.error.startsWith("Image was deleted")) {
          router.refresh();
        }
      } else {
        setNotice("Image deleted.");
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-4">
      {error ? <Alert variant="danger">{error}</Alert> : null}
      {notice ? <Alert variant="success">{notice}</Alert> : null}

      {imageGroups.length === 0 ? (
        <p className="text-sm text-gray-500">No images yet.</p>
      ) : (
        <div className="space-y-6">
          {imageGroups.map((group) => (
            <section key={group.key} aria-label={group.title} className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-800">{group.title}</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {group.images.map((image, index) => (
                  <article key={image.id} className="min-w-0 rounded-card border border-surface-border p-3">
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded bg-surface-muted">
                      <Image
                        src={getPublicStorageUrl("product-images", image.storage_path)}
                        alt={image.alt_text ?? ""}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-contain p-2"
                      />
                      {image.is_primary ? (
                        <span className="absolute left-2 top-2 rounded bg-brand-600 px-2 py-1 text-xs font-medium text-white">
                          Primary
                        </span>
                      ) : null}
                    </div>

                    <label className="mt-3 block space-y-1 text-xs font-medium text-gray-700">
                      <span>Alt text</span>
                      <input
                        value={altDrafts[image.id] ?? ""}
                        onChange={(event) => setAltDrafts((drafts) => ({ ...drafts, [image.id]: event.target.value }))}
                        maxLength={200}
                        disabled={isPending}
                        className="h-9 w-full rounded-card border border-surface-border px-2 text-sm font-normal focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-60"
                      />
                    </label>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {!image.is_primary ? (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleSetPrimary(image.id)}
                          className="min-h-9 rounded px-2 text-xs font-medium text-brand-700 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-50"
                        >
                          Set primary
                        </button>
                      ) : null}
                      <button
                        type="button"
                        disabled={isPending || index === 0}
                        onClick={() => handleMove(group.images, index, -1, group.variantId)}
                        aria-label={`Move image ${index + 1} earlier`}
                        className="min-h-9 rounded px-2 text-xs text-gray-700 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-40"
                      >
                        Move earlier
                      </button>
                      <button
                        type="button"
                        disabled={isPending || index === group.images.length - 1}
                        onClick={() => handleMove(group.images, index, 1, group.variantId)}
                        aria-label={`Move image ${index + 1} later`}
                        className="min-h-9 rounded px-2 text-xs text-gray-700 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-40"
                      >
                        Move later
                      </button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={isPending || (altDrafts[image.id] ?? "") === (image.alt_text ?? "")}
                        onClick={() => handleSaveAltText(image.id)}
                      >
                        Save alt text
                      </Button>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleDelete(image.id)}
                        className="ml-auto min-h-9 rounded px-2 text-xs font-medium text-status-danger hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-danger disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <form onSubmit={handleUpload} className="max-w-xl space-y-3 rounded-card border border-dashed border-surface-border p-4">
        <h3 className="text-sm font-semibold text-gray-900">Upload images</h3>
        {product.variants.length > 0 ? (
          <label className="block space-y-1 text-xs font-medium text-gray-700">
            <span>Image group</span>
            <select
              value={variantId}
              onChange={(event) => setVariantId(event.target.value)}
              disabled={isPending}
              className="h-10 w-full rounded-card border border-surface-border bg-white px-3 text-sm font-normal focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-60"
            >
              <option value="">Product-level (not tied to a variant)</option>
              {product.variants.map((variant) => (
                <option key={variant.id} value={variant.id}>{variant.name} ({variant.sku})</option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="block space-y-1 text-xs font-medium text-gray-700">
          <span>Image files</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            required
            disabled={isPending}
            className="block min-h-10 w-full text-sm file:mr-3 file:rounded-card file:border-0 file:bg-surface-muted file:px-3 file:py-2 file:text-sm file:font-medium disabled:opacity-60"
          />
        </label>
        <label className="block space-y-1 text-xs font-medium text-gray-700">
          <span>Alt text for these uploads (optional)</span>
          <input
            value={uploadAltText}
            onChange={(event) => setUploadAltText(event.target.value)}
            maxLength={200}
            disabled={isPending}
            className="h-10 w-full rounded-card border border-surface-border px-3 text-sm font-normal focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-60"
          />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" size="sm" isLoading={isPending}>
            {isPending ? "Uploading…" : "Upload selected images"}
          </Button>
          {uploadProgress ? <p role="status" className="text-xs text-gray-600">{uploadProgress}</p> : null}
          <p className="text-xs text-gray-500">JPEG, PNG, or WebP. Maximum 5MB per image.</p>
        </div>
      </form>
    </div>
  );
}
