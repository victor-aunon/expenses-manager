import React from "react";

export interface DeleteConfirmModalProps {
  isOpen: boolean;
  expenseDescription: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({
  isOpen,
  expenseDescription,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div style={modalStyle}>
        <h3 id="modal-title" style={modalHeadingStyle}>
          Confirm Deletion
        </h3>
        <p style={modalBodyStyle}>
          Are you sure you want to permanently delete <strong>{expenseDescription}</strong>? This action cannot be undone.
        </p>
        <div style={actionsStyle}>
          <button onClick={onCancel} style={cancelButtonStyle}>
            Cancel
          </button>
          <button onClick={onConfirm} style={confirmButtonStyle}>
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(25, 23, 21, 0.65)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  backgroundColor: "var(--color-bg-surface)",
  border: "var(--border-width-bold) solid var(--color-border)",
  padding: "1.75rem",
  maxWidth: "480px",
  width: "90%",
};

const modalHeadingStyle: React.CSSProperties = {
  fontSize: "1.15rem",
  fontWeight: 700,
  textTransform: "uppercase",
  marginBottom: "1rem",
  color: "var(--color-text-primary)",
};

const modalBodyStyle: React.CSSProperties = {
  fontSize: "0.95rem",
  lineHeight: 1.5,
  marginBottom: "1.5rem",
  color: "var(--color-text-primary)",
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "0.75rem",
};

const cancelButtonStyle: React.CSSProperties = {
  backgroundColor: "transparent",
  color: "var(--color-text-primary)",
  border: "var(--border-width) solid var(--color-border)",
  padding: "0.5rem 1rem",
};

const confirmButtonStyle: React.CSSProperties = {
  backgroundColor: "var(--color-debt)",
  color: "#ffffff",
  border: "var(--border-width) solid var(--color-debt)",
  padding: "0.5rem 1rem",
  fontWeight: 700,
};
