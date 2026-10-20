import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { DeleteConfirmModal } from "@/ui/components/expense/delete-confirm-modal";

describe("Delete Confirm Modal (US2)", () => {
  it("renders when isOpen is true and triggers confirm callback", () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();

    render(
      <DeleteConfirmModal
        isOpen={true}
        expenseDescription="Coffee"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    expect(screen.getByText(/Confirm Deletion/i)).toBeInTheDocument();
    expect(screen.getByText(/Coffee/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Confirm Delete/i }));
    expect(handleConfirm).toHaveBeenCalledTimes(1);
    expect(handleCancel).not.toHaveBeenCalled();
  });

  it("triggers cancel callback when Cancel button is clicked", () => {
    const handleConfirm = vi.fn();
    const handleCancel = vi.fn();

    render(
      <DeleteConfirmModal
        isOpen={true}
        expenseDescription="Dinner"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Cancel/i }));
    expect(handleCancel).toHaveBeenCalledTimes(1);
    expect(handleConfirm).not.toHaveBeenCalled();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <DeleteConfirmModal
        isOpen={false}
        expenseDescription="Dinner"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });
});
