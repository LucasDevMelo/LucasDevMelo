/* eslint-disable @next/next/no-img-element -- local data URLs */
"use client";

import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useId, useRef, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { FieldError } from "@/components/ui/input";
import { productConfig } from "@/config/product";
import { compressImage, ImageProcessingError } from "@/lib/images/compress-image";
import { cn, createId } from "@/lib/utils";
import type { TributeFormValues } from "@/lib/validation/tribute-schema";
import type { TributePhoto } from "@/types/tribute";

interface PhotosStepProps {
  /** Persists the draft right away; returns an error message if storage is full. */
  persistNow: () => string | null;
}

export function PhotosStep({ persistNow }: PhotosStepProps) {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<TributeFormValues>();
  const photos = useWatch({ control, name: "photos" }) ?? [];
  const [processing, setProcessing] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const max = productConfig.maxPhotos;
  const remaining = max - photos.length;

  const commit = (next: TributePhoto[]) =>
    setValue("photos", next, { shouldDirty: true, shouldValidate: true });

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    setMessage(null);
    const files = Array.from(fileList);
    const accepted = files.slice(0, Math.max(0, remaining));
    if (files.length > accepted.length) {
      setMessage(
        remaining > 0
          ? `Você pode adicionar no máximo ${max} fotos. Adicionamos apenas as ${accepted.length} primeiras.`
          : `Você já adicionou ${max} fotos, que é o limite. Remova uma para trocar.`,
      );
    }
    if (!accepted.length) return;

    setProcessing(accepted.length);
    let current = [...photos];
    for (const file of accepted) {
      try {
        const result = await compressImage(file);
        const candidate = [...current, { id: createId(), src: result.dataUrl, width: result.width, height: result.height, size: result.size }];
        commit(candidate);
        const storageError = persistNow();
        if (storageError) {
          commit(current);
          persistNow();
          setMessage(storageError);
          break;
        }
        current = candidate;
      } catch (error) {
        setMessage(
          error instanceof ImageProcessingError
            ? error.message
            : "Não conseguimos processar uma das fotos. Tente outra imagem.",
        );
      } finally {
        setProcessing((n) => Math.max(0, n - 1));
      }
    }
    setProcessing(0);
    if (inputRef.current) inputRef.current.value = "";
  }

  function remove(id: string) {
    commit(photos.filter((p) => p.id !== id));
    setMessage(null);
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= photos.length) return;
    const next = [...photos];
    [next[index], next[target]] = [next[target], next[index]];
    commit(next);
  }

  const totalKb = Math.round(photos.reduce((sum, p) => sum + p.size, 0) / 1024);

  return (
    <div className="space-y-6">
      <label
        htmlFor={inputId}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-marian-500/35 bg-marian-50/60 px-6 py-10 text-center transition hover:border-marian-500 hover:bg-marian-50",
          remaining <= 0 && "pointer-events-none opacity-50",
        )}
      >
        <span className="flex size-14 items-center justify-center rounded-full bg-white text-marian-600 shadow-soft">
          {processing > 0 ? <Loader2 className="size-6 animate-spin" /> : <ImagePlus className="size-6" />}
        </span>
        <span className="mt-4 text-lg font-medium text-navy-900">
          {processing > 0 ? "Otimizando suas fotos…" : remaining > 0 ? "Toque para escolher fotos" : "Limite de fotos atingido"}
        </span>
        <span className="mt-1 text-sm text-ink-600">
          {photos.length} de {max} fotos · JPG, PNG ou WEBP
        </span>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          disabled={remaining <= 0 || processing > 0}
          onChange={(e) => handleFiles(e.target.files)}
          aria-label="Escolher fotos"
        />
      </label>

      <div aria-live="polite">
        {message && (
          <p role="alert" className="rounded-2xl bg-gold-100 px-4 py-3 text-sm text-navy-900">
            {message}
          </p>
        )}
        <FieldError id="photos-error" message={errors.photos?.message} />
      </div>

      {photos.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((photo, index) => (
            <li key={photo.id} className="group relative overflow-hidden rounded-2xl bg-white shadow-soft">
              <img src={photo.src} alt={`Foto ${index + 1}`} className="aspect-square w-full object-cover" />
              <span className="absolute left-2 top-2 rounded-full bg-navy-950/70 px-2 py-0.5 text-xs font-medium text-white">
                {index + 1}
              </span>
              <div className="flex items-center justify-between gap-1 p-1.5">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label={`Mover foto ${index + 1} para a esquerda`}
                    className="flex size-10 items-center justify-center rounded-xl text-navy-900 hover:bg-navy-900/5 disabled:opacity-30"
                  >
                    <ArrowLeft className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === photos.length - 1}
                    aria-label={`Mover foto ${index + 1} para a direita`}
                    className="flex size-10 items-center justify-center rounded-xl text-navy-900 hover:bg-navy-900/5 disabled:opacity-30"
                  >
                    <ArrowRight className="size-4" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => remove(photo.id)}
                  aria-label={`Excluir foto ${index + 1}`}
                  className="flex size-10 items-center justify-center rounded-xl text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="text-sm text-ink-600">
        As fotos são opcionais e ficam salvas somente neste navegador. Reduzimos o tamanho automaticamente para a
        homenagem abrir rápido no celular{photos.length > 0 ? ` (total atual: ${totalKb} KB)` : ""}.
      </p>
    </div>
  );
}
