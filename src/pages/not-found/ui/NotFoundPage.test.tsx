import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { NotFoundPage } from "./NotFoundPage";

const back = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back }),
}));

describe("NotFoundPage", () => {
  beforeEach(() => {
    back.mockClear();
  });

  it("renders the missing-page message and returns to the previous page", async () => {
    const user = userEvent.setup();

    render(<NotFoundPage />);

    expect(screen.getByRole("heading", { name: "Hmm..." })).toBeInTheDocument();
    expect(screen.getByText(/This doesn't seem to be the page/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Go back" }));

    expect(back).toHaveBeenCalledOnce();
  });
});
