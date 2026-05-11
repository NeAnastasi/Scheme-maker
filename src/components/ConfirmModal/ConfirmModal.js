import "./ConfirmModal.css";
const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmText = "Да",
  cancelText = "Отмена",
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content confirm-modal">
        <h2>{title}</h2>
        {message && <p className="confirm-message">{message}</p>}
        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
          <button
            type="button"
            className="btn btn-cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
