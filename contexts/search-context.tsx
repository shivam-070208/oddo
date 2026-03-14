"use client";

import { createContext, useContext, useMemo, useState } from "react";

type SearchContextValue = {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  clearSearchQuery: () => void;
};

const SearchContext = createContext<SearchContextValue | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("");

  const value = useMemo(
    () => ({
      searchQuery,
      setSearchQuery,
      clearSearchQuery: () => setSearchQuery(""),
    }),
    [searchQuery],
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearchContext() {
  const ctx = useContext(SearchContext);
  if (!ctx) {
    throw new Error("useSearchContext must be used inside SearchProvider");
  }
  return ctx;
}
