// context/ContentContext.tsx
//
// Wraps the component tree with the ContentAdapter instance. Every hook in
// hooks/useContent.ts reads from this context — no component ever imports
// the adapter singleton (or, worse, raw JSON) directly. This is what makes
// Section 6's adapter-swap guarantee real in practice, not just on paper.

import React, { createContext, useContext, type ReactNode } from "react";
import type { ContentAdapter } from "@/types";
import { contentAdapter } from "@/adapters/jsonAdapter";

interface ContentProviderProps {
  children: ReactNode;
  // Allows a different adapter to be injected — primarily for testing
  // (e.g. a mock adapter with fixture data) or for a future environment
  // that swaps JSONAdapter for FirebaseAdapter without touching this file.
  adapter?: ContentAdapter;
}

// Default value is the real adapter, so anything rendered outside a
// <ContentProvider> (unlikely, but possible in tests) still resolves to
// working data rather than `undefined`.
const ContentContext = createContext<ContentAdapter>(contentAdapter);

export const ContentProvider: React.FC<ContentProviderProps> = ({
  children,
  adapter = contentAdapter,
}) => {
  return (
    <ContentContext.Provider value={adapter}>{children}</ContentContext.Provider>
  );
};

// Internal accessor — components should generally prefer the sugar hooks in
// hooks/useContent.ts (useProfile, useExperiences, etc.) over calling this
// directly, but it's exported for cases that need the raw adapter.
export const useContentAdapter = (): ContentAdapter => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error("useContentAdapter must be used within a ContentProvider");
  }
  return context;
};
