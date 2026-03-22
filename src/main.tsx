import "./index.css";

import { AppLoadingFallback } from "@components/app-loading-fallback";
import { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";

const App = lazy(() => import("@/app"));

createRoot(document.getElementById("root")!).render(
  <Suspense fallback={<AppLoadingFallback />}>
    <App />
  </Suspense>,
);
