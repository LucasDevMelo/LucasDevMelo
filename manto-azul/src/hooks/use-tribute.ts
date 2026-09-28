"use client";

import { useEffect, useState } from "react";
import { tributeRepository } from "@/lib/repositories";
import type { Tribute } from "@/types/tribute";

export type TributeState =
  | { status: "loading" }
  | { status: "ready"; tribute: Tribute }
  | { status: "not_found" };

/** Loads a tribute by slug through the repository (localStorage today, Supabase tomorrow). */
export function useTribute(slug: string): TributeState {
  const [state, setState] = useState<TributeState>({ status: "loading" });

  useEffect(() => {
    let active = true;
    tributeRepository
      .getBySlug(slug)
      .then((tribute) => {
        if (active) setState(tribute ? { status: "ready", tribute } : { status: "not_found" });
      })
      .catch(() => {
        if (active) setState({ status: "not_found" });
      });
    return () => {
      active = false;
    };
  }, [slug]);

  return state;
}
