import { render, screen } from "@test-utils";
import { describe, expect, it } from "vitest";

import { AppLoadingFallback } from "./app-loading-fallback";

describe("AppLoadingFallback", () => {
  it("renders an accessible loading status", () => {
    render(<AppLoadingFallback />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-busy", "true");
    expect(status).toHaveTextContent(/loading/i);
  });
});
