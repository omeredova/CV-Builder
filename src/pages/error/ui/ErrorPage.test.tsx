import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ErrorPage } from "./ErrorPage";

describe("ErrorPage", () => {
  it("renders the recovery message and retries the failed content", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(<ErrorPage onRetry={onRetry} />);

    expect(screen.getByRole("heading", { name: "Oops!" })).toBeInTheDocument();
    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Retry" }));

    expect(onRetry).toHaveBeenCalledOnce();
  });
});
