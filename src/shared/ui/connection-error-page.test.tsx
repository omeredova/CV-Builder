import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ConnectionErrorPage } from "./connection-error-page";

describe("ConnectionErrorPage", () => {
  it("runs the retry action", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(<ConnectionErrorPage onRetry={onRetry} />);
    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(onRetry).toHaveBeenCalledOnce();
  });
});
