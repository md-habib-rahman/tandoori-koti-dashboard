"use client";

import { useEffect, useId, useState } from "react";
import Image from "next/image";
import { ImagePlus, TriangleAlert } from "lucide-react";

// Save as: src/components/admin/ImageUploadField.js
//
// Lets staff pick an image, checks it BEFORE it is uploaded, and shows a preview.
//   spec = { label, width, height, minWidth, minHeight, maxBytes, hint }
//   value: the address of the image already saved (shown until a new file is chosen)
//   file / onFile: the newly chosen File (the parent uploads it when the form is saved)
//
// Wrong type, too big or too small: the file is refused with a clear message.
// Wrong shape (not the recommended ratio): the file is accepted with a warning, because the website crops it.

export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const formatBytes = (bytes) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`);

function readImageSize(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      reject(new Error("unreadable"));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

export default function ImageUploadField({ spec, value, file, onFile, error }) {
  const inputId = useId();
  const [preview, setPreview] = useState(null);
  const [problem, setProblem] = useState("");
  const [warning, setWarning] = useState("");

  // Preview of the newly chosen file
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleChange = async (e) => {
    const chosen = e.target.files?.[0];
    e.target.value = ""; // so the same file can be chosen again later
    if (!chosen) return;

    setProblem("");
    setWarning("");

    if (!ACCEPTED_TYPES.includes(chosen.type)) {
      setProblem("Use a JPG, PNG or WebP image.");
      return;
    }
    if (chosen.size > spec.maxBytes) {
      setProblem(`The file is ${formatBytes(chosen.size)}. The limit is ${formatBytes(spec.maxBytes)}: compress it or export it smaller.`);
      return;
    }

    try {
      const { width, height } = await readImageSize(chosen);

      if (width < spec.minWidth || height < spec.minHeight) {
        setProblem(`The image is ${width} × ${height} px. It must be at least ${spec.minWidth} × ${spec.minHeight} px, or it looks blurry.`);
        return;
      }

      const wanted = spec.width / spec.height;
      const actual = width / height;
      if (Math.abs(actual - wanted) / wanted > 0.15) {
        setWarning(`The image is ${width} × ${height} px, not close to ${spec.width} × ${spec.height}. The website will crop the edges.`);
      }
    } catch {
      setProblem("This file could not be read as an image.");
      return;
    }

    onFile(chosen);
  };

  const shown = preview || value;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <label htmlFor={inputId} className="text-xs font-semibold tracking-wide text-slate-600 uppercase">
          {spec.label}
        </label>
        <span className="text-xs text-slate-500">
          {spec.width} × {spec.height} px · JPG, PNG or WebP · up to {formatBytes(spec.maxBytes)}
        </span>
      </div>

      <label
        htmlFor={inputId}
        className="group relative flex cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition-colors hover:border-amber-500"
        style={{ aspectRatio: `${spec.width} / ${spec.height}`, maxHeight: "16rem" }}
      >
        {shown ? (
          <>
            <Image src={shown} alt="" fill unoptimized sizes="400px" className="object-cover" />
            <span className="absolute inset-x-0 bottom-0 bg-slate-900/70 px-3 py-1.5 text-center text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
              Click to replace
            </span>
          </>
        ) : (
          <span className="flex flex-col items-center gap-1 text-sm text-slate-500">
            <ImagePlus size={22} aria-hidden="true" />
            Click to choose an image
          </span>
        )}
        <input id={inputId} type="file" accept={ACCEPTED_TYPES.join(",")} onChange={handleChange} className="sr-only" />
      </label>

      {spec.hint && <p className="text-xs text-slate-500">{spec.hint}</p>}
      {file && !problem && <p className="text-xs font-semibold text-emerald-700">New image chosen: it uploads when you save.</p>}

      {warning && (
        <p className="flex items-start gap-1.5 text-xs font-medium text-amber-800">
          <TriangleAlert size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
          {warning}
        </p>
      )}
      {(problem || error) && (
        <p role="alert" className="text-xs font-semibold text-rose-700">
          {problem || error}
        </p>
      )}
    </div>
  );
}