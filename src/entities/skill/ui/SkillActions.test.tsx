import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SkillActions } from "./SkillActions";

describe("SkillActions", () => {
  it("delegates keyboard actions to the supplied handlers and respects disabled states", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    const onRemove = vi.fn();
    const { rerender } = render(<SkillActions onAdd={onAdd} onRemove={onRemove} />);
    await user.tab();
    await user.keyboard("{Enter}");
    expect(onAdd).toHaveBeenCalledTimes(1);
    await user.tab();
    await user.keyboard("{Enter}");
    expect(onRemove).toHaveBeenCalledTimes(1);

    rerender(<SkillActions onAdd={onAdd} onRemove={onRemove} addDisabled removeDisabled />);
    for (const name of ["ADD SKILL", "REMOVE SKILLS"]) {
      const button = screen.getByRole("button", { name });
      expect(button).toBeDisabled();
      await user.click(button);
    }
    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});
