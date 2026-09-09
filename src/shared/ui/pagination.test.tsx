import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "./pagination";

describe("Pagination", () => {
  it("composes the shadcn pagination primitives", () => {
    render(
      <Pagination>
        <PaginationContent>
          <PaginationItem><PaginationPrevious href="#previous" /></PaginationItem>
          <PaginationItem><PaginationLink href="#page-1" isActive>1</PaginationLink></PaginationItem>
          <PaginationItem><PaginationNext href="#next" /></PaginationItem>
        </PaginationContent>
      </Pagination>,
    );

    expect(screen.getByRole("navigation", { name: "pagination" })).toBeInTheDocument();
    const pageLink = screen.getByRole("link", { name: "1" });

    expect(pageLink).toHaveAttribute("aria-current", "page");
    expect(pageLink).toHaveClass(
      "size-compact-control",
      "rounded-full",
      "border-pagination-border",
      "font-normal",
      "normal-case",
    );
    expect(pageLink).not.toHaveClass("h-control-height", "w-button-width");
    expect(screen.getByRole("link", { name: "Go to previous page" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go to next page" })).toBeInTheDocument();
  });
});
