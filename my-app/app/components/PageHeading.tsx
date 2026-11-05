"use client";

import { createContext, useContext, type ReactNode } from "react";

const NestedContext = createContext(false);

/**
 * Marks whole pages shown as sections of another page. The landing page is
 * built from the Services, Projects, About, Blog and Contact pages, and a page
 * should have one <h1>: each of those keeps its own when opened on its own URL.
 */
export function NestedPage({ children }: { children: ReactNode }) {
  return <NestedContext.Provider value={true}>{children}</NestedContext.Provider>;
}

export function PageHeading({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const Tag = useContext(NestedContext) ? "h2" : "h1";
  return <Tag className={className}>{children}</Tag>;
}
