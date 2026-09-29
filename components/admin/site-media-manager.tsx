"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { getPublicStorageUrl } from "@/lib/storage";
import { uploadSiteMediaAction, toggleSiteMediaActiveAction, deleteSiteMediaAction } from "@/app/admin/site-media/actions";
import type { AdminSiteMediaItem } from "@/lib/services/admin/site-media";

const PLACEMENTS = ["homepage_hero", "homepage_banner", "store_photo", "rental_promo", "corporate_promo", "other"];

export function SiteMediaManager({ items }: { items: AdminSiteMediaItem[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [placement, setPlacement] = useState<(typeof PLACEMENTS)[number]>(PLACEMENTS[0] ?? "homepage_hero");
  const [altText, setAltText] = useState("");
  const [title, setTitle] = useState("");

  function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setError(null);

    const formData = new FormData();
    formData.set("placement", placement);
    formData.set("altText", altText);
    formData.set("title", title);
    formData.set("file", file);

    startTransition(async () => {
      const result = await uploadSiteMediaAction(formData);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setAltText("");
      setTitle("");
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    });
  }

  function handleToggle(id: string, next: boolean) {
    startTransition(async () => {
      await toggleSiteMediaActiveAction(id, next);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteSiteMediaAction(id);
      router.refresh();
    });
  }

  const byPlacement = PLACEMENTS.map((p) => ({ placement: p, items: items.filter((i) => i.placement === p) }));

  return (
    <div className="space-y-6">
      {error ? <Alert variant="danger">{error}</Alert> : null}

      <form onSubmit={handleUpload} className="max-w-lg space-y-2 rounded-card border border-dashed border-surface-border p-4">
        <p className="text-sm font-medium text-gray-900">Upload new media</p>
        <select value={placement} onChange={(e) => setPlacement(e.target.value)} className="w-full rounded-card border border-surface-border px-2 py-1.5 text-sm">
          {PLACEMENTS.map((p) => (
            <option key={p} value={p}>
              {p.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" required className="text-sm" />
        <input
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          placeholder="Alt text (required)"
          required
          className="w-full rounded-card border border-surface-border px-2 py-1.5 text-sm"
        />
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Internal title (optional)"
          className="w-full rounded-card border border-surface-border px-2 py-1.5 text-sm"
        />
        <Button type="submit" size="sm" isLoading={isPending}>
          Upload
        </Button>
      </form>

      {byPlacement.map(({ placement: p, items: placementItems }) => (
        <div key={p}>
          <h3 className="mb-2 text-sm font-semibold text-gray-900">{p.replace(/_/g, " ")}</h3>
          {placementItems.length === 0 ? (
            <p className="text-sm text-gray-400">No media for this placement yet.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {placementItems.map((item) => (
                <div key={item.id} className="rounded-card border border-surface-border p-2">
                  <div className="relative aspect-video w-full overflow-hidden rounded bg-surface-muted">
                    <Image src={getPublicStorageUrl("site-media", item.storage_path)} alt={item.alt_text} fill sizes="200px" className="object-cover" />
                  </div>
                  <p className="mt-1 truncate text-xs text-gray-600">{item.title ?? item.alt_text}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleToggle(item.id, !item.is_active)}
                      className="text-xs"
                    >
                      <Badge variant={item.is_active ? "success" : "neutral"}>{item.is_active ? "Active" : "Inactive"}</Badge>
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleDelete(item.id)}
                      className="text-xs text-status-danger hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
