import { useState } from "react";
import "./RoomRequestModal.css";
const RoomRequestModal = ({ isOpen, onSubmit, onCancel }) => {
  const [name, setName] = useState("");
  const [floor, setFloor] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        floor: Number(floor),
        comment: comment.trim() || null,
      });
      setName("");
      setFloor("");
      setComment("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Не нашли кабинет?</h2>
        <p className="confirm-message">
          Опишите кабинет, которого нет в списке. Админ создаст его и добавит план.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Название кабинета *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Кабинет 305"
              required
            />
          </div>
          <div className="form-group">
            <label>Этаж *</label>
            <input
              type="number"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              placeholder="3"
              min="1"
              required
            />
          </div>
          <div className="form-group">
            <label>Комментарий</label>
            <textarea
              className="request-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Например: корпус 2, рядом с лестницей"
              rows={3}
            />
          </div>
          <div className="modal-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Отправка..." : "Отправить"}
            </button>
            <button
              type="button"
              className="btn btn-cancel"
              onClick={onCancel}
              disabled={submitting}
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomRequestModal;
