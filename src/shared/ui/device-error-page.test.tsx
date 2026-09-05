import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DeviceErrorPage } from "./device-error-page";

describe("DeviceErrorPage", () => {
  it("explains that mobile devices are unsupported", () => {
    render(<DeviceErrorPage />);

    expect(screen.getByRole("heading", { name: "Oops" })).toBeInTheDocument();
    expect(screen.getByText(/This app isn't supported on mobile devices/)).toBeInTheDocument();
    expect(screen.getByText(/Please open it on a desktop or tablet to continue/)).toBeInTheDocument();
  });
});
