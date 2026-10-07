import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ConfirmModal from "@/components/ui/ConfirmModal";

describe("ConfirmModal", () => {
  it("renders title and message", () => {
    render(
      <ConfirmModal
        title="Delete Project"
        message="Are you sure you want to delete this project?"
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByText("Delete Project")).toBeInTheDocument();
    expect(
      screen.getByText("Are you sure you want to delete this project?"),
    ).toBeInTheDocument();
  });

  it("renders custom confirm label", () => {
    render(
      <ConfirmModal
        title="Empty Trash"
        message="This will permanently delete all items."
        confirmLabel="Empty"
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /empty/i })).toBeInTheDocument();
  });

  it("calls onConfirm when confirm button is clicked", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(
      <ConfirmModal
        title="Delete"
        message="Are you sure?"
        onClose={vi.fn()}
        onConfirm={onConfirm}
      />,
    );

    await user.click(screen.getByRole("button", { name: /delete/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when cancel button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <ConfirmModal
        title="Delete"
        message="Are you sure?"
        onClose={onClose}
        onConfirm={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("aligns header text to the left", () => {
    render(
      <ConfirmModal
        title="Delete Item"
        message="Are you sure?"
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    const titleEl = screen.getByText("Delete Item");
    const descriptionEl = screen.getByText("Are you sure?");
    const headerEl = titleEl.closest('[data-slot="alert-dialog-header"]');

    expect(headerEl).toHaveClass("text-left");
    expect(headerEl).toHaveClass("place-items-start");
    expect(titleEl).toHaveClass("text-left");
    expect(descriptionEl).toHaveClass("text-left");
  });
});
