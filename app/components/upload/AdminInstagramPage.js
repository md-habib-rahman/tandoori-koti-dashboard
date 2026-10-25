"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useApi } from "@/hook/useApi";
import { alert } from "@/lib/alert";
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  ImageIcon,
  PenLine,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import InstagramPhotoFormModal, { PHOTO_SPEC } from "./InstagramPhotoFormModal";

// Save as: src/components/admin/instagram/AdminInstagramPage.js
// Mount it on an admin page, for example src/app/admin/dashboard/instagram/page.js:  <AdminInstagramPage />

const MAX_PHOTOS = 6;

export default function AdminInstagramPage() {
  const { request } = useApi();

  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [editing, setEditing] = useState(null); // { photo } where photo is null for a new one

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await request({ method: "GET", url: "/instagram/admin" });
      setPhotos(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load Instagram photos:", err);
      setError("Could not load the photos. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    load();
  }, [load]);

  const move = async (photo, direction) => {
    try {
      setBusyId(photo.id);
      setError("");
      await request({
        method: "PATCH",
        url: `/instagram/admin/${photo.id}/move`,
        data: { direction },
      });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not change the order.");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (photo) => {
    const result = await alert.confirm({
      title: "Delete this photo?",
      text: "It will be removed from the home page.",
      confirmText: "Yes, Delete",
      cancelText: "Cancel",
    });
    if (!result.isConfirmed) return;

    try {
      setBusyId(photo.id);
      setError("");
      await request({ method: "DELETE", url: `/instagram/admin/${photo.id}` });
      alert.success("Photo deleted.");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete the photo.");
    } finally {
      setBusyId(null);
    }
  };

  const full = photos.length >= MAX_PHOTOS;

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-3 py-4 sm:px-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Instagram Photos
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            The photos shown in the Instagram section of the home page.{" "}
            {photos.length} of {MAX_PHOTOS} used.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={load}
            disabled={loading}
            aria-label="Refresh"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
              aria-hidden="true"
            />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setEditing({ photo: null })}
            disabled={full}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-sm font-bold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={16} aria-hidden="true" />
            Add photo
          </button>
        </div>
      </div>

      {/* Guidelines */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        <p className="font-semibold">Photo guidelines</p>
        <ul className="mt-1.5 list-disc space-y-0.5 pl-5">
          <li>
            Best size: {PHOTO_SPEC.width} × {PHOTO_SPEC.height} px (square).
            Smaller than {PHOTO_SPEC.minWidth} × {PHOTO_SPEC.minHeight} px is
            refused.
          </li>
          <li>
            JPG, PNG or WebP, up to {Math.round(PHOTO_SPEC.maxBytes / 1024)} KB
            each.
          </li>
          <li>
            The first photo is shown large, so put the strongest one first. With
            all six photos the grid is complete; with fewer, all tiles are the
            same size.
          </li>
          <li>Changes can take up to a minute to appear on the website.</li>
        </ul>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm font-medium text-rose-800"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss"
            className="shrink-0 text-rose-600 hover:text-rose-800"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Photos */}
      {loading && photos.length === 0 ? (
        <div
          className="grid grid-cols-2 gap-4 md:grid-cols-3"
          aria-hidden="true"
        >
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white py-16 text-center">
          <ImageIcon
            size={28}
            className="mx-auto text-slate-300"
            aria-hidden="true"
          />
          <p className="mt-3 text-sm font-semibold text-slate-700">
            No photos yet
          </p>
          <p className="text-xs text-slate-500">
            The Instagram section stays hidden on the website until you add one.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {photos.map((photo, index) => {
            const busy = busyId === photo.id;
            return (
              <li
                key={photo.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs"
              >
                <div className="relative aspect-square bg-slate-100">
                  <Image
                    src={photo.imageUrl}
                    alt={photo.altEn || photo.altFi || ""}
                    fill
                    unoptimized
                    sizes="320px"
                    className="object-cover"
                  />
                  <span className="absolute top-2 left-2 rounded-md bg-slate-900/80 px-2 py-0.5 text-xs font-bold text-white">
                    {index === 0 && photos.length === MAX_PHOTOS
                      ? "1 · Large"
                      : index + 1}
                  </span>
                </div>

                <div className="space-y-3 p-3">
                  <div className="min-h-[2.5rem] text-xs text-slate-600">
                    <p className="line-clamp-1">
                      {photo.altEn || photo.altFi || (
                        <span className="text-slate-300 italic">
                          No description
                        </span>
                      )}
                    </p>
                    {photo.postUrl && (
                      <a
                        href={photo.postUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-0.5 inline-flex items-center gap-1 font-semibold text-amber-700 hover:underline"
                      >
                        Post link <ExternalLink size={11} aria-hidden="true" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditing({ photo })}
                      disabled={busy}
                      aria-label="Edit photo"
                      title="Edit"
                      className="grid h-8 w-8 place-items-center rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 disabled:opacity-50"
                    >
                      <PenLine size={15} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(photo, "up")}
                      disabled={busy || index === 0}
                      aria-label="Move earlier"
                      title="Move earlier"
                      className="grid h-8 w-8 place-items-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ArrowUp size={15} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(photo, "down")}
                      disabled={busy || index === photos.length - 1}
                      aria-label="Move later"
                      title="Move later"
                      className="grid h-8 w-8 place-items-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ArrowDown size={15} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(photo)}
                      disabled={busy}
                      aria-label="Delete photo"
                      title="Delete"
                      className="ml-auto grid h-8 w-8 place-items-center rounded-lg border border-rose-200 bg-white text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                    >
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {editing && (
        <InstagramPhotoFormModal
          key={editing.photo?.id || "new"}
          photo={editing.photo}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            alert.success("Photo saved.");
            load();
          }}
        />
      )}
    </div>
  );
}
