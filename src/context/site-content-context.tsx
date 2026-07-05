"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { SITE_CONFIG, type SiteConfig } from "@/data/site-config";
import { validateContentDocument, type ContentDocument } from "@/lib/content-schema";

interface SiteContentContextValue {
  site: SiteConfig;
  document: ContentDocument | null;
  isLoaded: boolean;
  error: string | null;
  reloadContent: () => Promise<void>;
}

const SiteContentContext = createContext<SiteContentContextValue | null>(null);

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [document, setDocument] = useState<ContentDocument | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reloadContent = useCallback(async () => {
    try {
      const response = await fetch("/api/content", {
        cache: "no-store",
        headers: { accept: "application/json" }
      });

      if (response.status === 404) {
        setDocument(null);
        setError(null);
        return;
      }

      if (!response.ok) {
        throw new Error(`Content request failed with ${response.status}.`);
      }

      const payload: unknown = await response.json();
      const result = validateContentDocument(payload);
      if (!result.ok || !result.value) {
        throw new Error(result.errors[0] ?? "Saved content is invalid.");
      }

      setDocument(result.value);
      setError(null);
    } catch (nextError) {
      setDocument(null);
      setError(nextError instanceof Error ? nextError.message : "Could not load saved content.");
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    void reloadContent();
  }, [reloadContent]);

  const value = useMemo<SiteContentContextValue>(
    () => ({
      site: document?.site ?? SITE_CONFIG,
      document,
      isLoaded,
      error,
      reloadContent
    }),
    [document, error, isLoaded, reloadContent]
  );

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent() {
  const context = useContext(SiteContentContext);
  if (!context) {
    throw new Error("useSiteContent must be used within SiteContentProvider.");
  }

  return context;
}
