import { lazy, Suspense, type ComponentType } from "react";

import { PageLoader } from "@/components/ui";

/**
 * Code-splits a page component behind React.lazy + Suspense so the initial
 * bundle doesn't pull in every feature (recharts, all tables/forms) up front.
 */
export function lazyPage(importer: () => Promise<{ default: ComponentType }>) {
  const LazyComponent = lazy(importer);
  return (
    <Suspense fallback={<PageLoader />}>
      <LazyComponent />
    </Suspense>
  );
}
