"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MAX_REFERENCE_PHOTOS, MAX_REFERENCE_BYTES } from "@/lib/custom-request";

const MAX_EDGE = 1600;

type Item = { id: string; file: File; url: string };

async function shrink(file: File): Promise<File> {
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_EDGE / Math.max(bmp.width, bmp.height));
    const w = Math.round(bmp.width * scale);
    const h = Math.round(bmp.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no canvas");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(bmp, 0, 0, w, h);
    bmp.close();
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
    if (!blob) throw new Error("encode failed");
    return new File([blob], `${file.name.replace(/\.[^.]+$/, "") || "photo"}.jpg`, { type: "image/jpeg" });
  } catch {
    if (/^image\/(jpeg|png|webp|avif)$/.test(file.type) && file.size <= MAX_REFERENCE_BYTES) return file;
    throw new Error("unsupported");
  }
}

function ImageIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <circle cx="9" cy="10" r="1.8" />
      <path d="m21 16-4.5-4.5L8 20" />
    </svg>
  );
}

export function ReferencePhotos({
  name = "photos",
  resyncKey,
  whatsappUrl,
}: {
  name?: string;
  resyncKey?: unknown;
  whatsappUrl?: string;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const pickerRef = useRef<HTMLInputElement>(null);
  const fieldRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef<Item[]>([]);

  const room = MAX_REFERENCE_PHOTOS - items.length;

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const sync = useCallback(() => {
    const input = fieldRef.current;
    if (!input) return;
    const dt = new DataTransfer();
    for (const it of itemsRef.current) dt.items.add(it.file);
    input.files = dt.files;
  }, []);

  useEffect(sync, [items, resyncKey, sync]);

  useEffect(() => {
    const form = fieldRef.current?.form;
    if (!form) return;
    const onReset = () => setTimeout(sync, 0);
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, [sync]);

  useEffect(() => () => itemsRef.current.forEach((i) => URL.revokeObjectURL(i.url)), []);

  async function addFiles(list: FileList | File[]) {
    setError(null);
    const picked = Array.from(list).filter((f) => f.type.startsWith("image/") || f.type === "");
    if (picked.length === 0) {
      setError("Escolha uma foto (JPG, PNG ou WEBP).");
      return;
    }
    if (picked.length > room) {
      setError(
        room === 0
          ? `Você pode adicionar até ${MAX_REFERENCE_PHOTOS} fotos.`
          : `Só é possível adicionar mais ${room} foto${room === 1 ? "" : "s"}.`
      );
    }
    setBusy(true);
    const added: Item[] = [];
    for (const f of picked.slice(0, Math.max(room, 0))) {
      try {
        const file = await shrink(f);
        added.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, file, url: URL.createObjectURL(file) });
      } catch {
        setError("Não foi possível ler uma das fotos — use uma imagem JPG, PNG ou WEBP.");
      }
    }
    setItems((prev) => [...prev, ...added].slice(0, MAX_REFERENCE_PHOTOS));
    setBusy(false);
  }

  function remove(id: string) {
    setItems((prev) => {
      const gone = prev.find((i) => i.id === id);
      if (gone) URL.revokeObjectURL(gone.url);
      return prev.filter((i) => i.id !== id);
    });
    setError(null);
  }

  const open = () => pickerRef.current?.click();

  const dropProps = {
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(true);
    },
    onDragLeave: () => setDragging(false),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer.files.length) void addFiles(e.dataTransfer.files);
    },
  };

  return (
    <div>
      <p className="mb-1.5 flex items-baseline gap-2 text-xs font-medium uppercase tracking-[0.1em] text-muted">
        Fotos de referência
        <span className="text-[0.65rem] normal-case tracking-normal text-muted/80">(opcional)</span>
      </p>

      <input
        ref={pickerRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) void addFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <input ref={fieldRef} type="file" name={name} multiple className="hidden" tabIndex={-1} aria-hidden="true" />

      {items.length === 0 ? (
        <button
          type="button"
          onClick={open}
          disabled={busy}
          {...dropProps}
          className={`group relative flex w-full flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed px-6 py-9 text-center transition ${
            dragging
              ? "border-accent bg-accent/10"
              : "border-accent/45 bg-gradient-to-br from-cream-soft via-surface to-panel/60 hover:border-accent hover:bg-accent/5"
          }`}
        >
          <span className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-accent/15 blur-2xl" aria-hidden="true" />
          <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-accent-soft via-accent to-accent-strong text-brand shadow-[0_10px_24px_-10px_rgba(15,23,42,0.4)] transition group-hover:scale-105">
            {busy ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand/30 border-t-brand" />
            ) : (
              <ImageIcon className="h-6 w-6" />
            )}
          </span>
          <span className="relative mt-4 font-display text-xl font-semibold text-ink">
            {busy ? "Preparando suas fotos…" : "Adicionar fotos de referência"}
          </span>
          <span className="relative mt-1 text-sm text-muted">
            <span className="sm:hidden">Toque para escolher da sua galeria</span>
            <span className="hidden sm:inline">Clique para selecionar arquivos ou arraste-os até aqui</span>
          </span>
          <span className="relative mt-4 inline-flex items-center gap-2 rounded-full border border-brand/80 px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-brand transition group-hover:bg-brand group-hover:text-accent-soft dark:border-accent-strong dark:text-accent-soft">
            Escolher fotos
          </span>
          <span className="relative mt-3 text-[0.7rem] uppercase tracking-[0.14em] text-muted/90">
            Até {MAX_REFERENCE_PHOTOS} fotos · JPG, PNG ou WEBP
          </span>
        </button>
      ) : (
        <div {...dropProps} className={`rounded-2xl border p-3 transition sm:p-4 ${dragging ? "border-accent bg-accent/10" : "border-[var(--line-strong)] bg-surface/60"}`}>
          <ul className="grid grid-cols-3 gap-3">
            {items.map((it, i) => (
              <li key={it.id} className="group relative aspect-square overflow-hidden rounded-xl border border-accent/40 bg-sand shadow-[0_10px_24px_-18px_rgba(15,23,42,0.45)]">
                {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
                <img src={it.url} alt={`Foto de referência ${i + 1}`} className="h-full w-full object-cover" />
                <span className="absolute left-2 top-2 rounded-full bg-brand/90 px-2 py-0.5 text-[0.6rem] font-semibold text-accent-soft">
                  {i + 1}
                </span>
                <button
                  type="button"
                  onClick={() => remove(it.id)}
                  aria-label={`Remover foto ${i + 1}`}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-base leading-none text-white backdrop-blur transition hover:bg-brand"
                >
                  ×
                </button>
              </li>
            ))}
            {room > 0 && (
              <li>
                <button
                  type="button"
                  onClick={open}
                  disabled={busy}
                  className="flex aspect-square w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-accent/50 text-accent-strong transition hover:border-accent hover:bg-accent/5"
                >
                  {busy ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-accent/30 border-t-accent-strong" />
                  ) : (
                    <span className="text-2xl leading-none">+</span>
                  )}
                  <span className="text-[0.65rem] font-semibold uppercase tracking-[0.12em]">Adicionar mais</span>
                </button>
              </li>
            )}
          </ul>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
            <span className="text-accent-strong" aria-hidden="true">✓</span>
            {items.length} de {MAX_REFERENCE_PHOTOS} fotos adicionadas — serão enviadas com sua solicitação.
          </p>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-red-700 dark:text-red-400">{error}</p>}

      {whatsappUrl && (
        <p className="mt-2 text-xs text-muted">
          Prefere WhatsApp?{" "}
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-accent-strong underline underline-offset-2">
            Enviar fotos por lá
          </a>
          .
        </p>
      )}
    </div>
  );
}
