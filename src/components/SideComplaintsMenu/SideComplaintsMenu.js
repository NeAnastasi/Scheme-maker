import { useEffect } from "react";
import Button from "../Button/Button";
import MenuItem from "../MenuItem/MenuItem";
import "./SideComplaintsMenu.css";
import BaseSideMenu from "../BaseSideMenu/BaseSideMenu";
const SideComplaintsMenu = ({
  mode,
  roomName,
  roomFloor,
  roomDescription,
  brokenElements,
  onStartEditing,
  onCancel,
  onDeleteAll,
  onRemoveProblem,
  onChangeComment,
  onSubmit,
  onDragStart,
  onDragCancel,
  isDragging,
  canShowGrid,
  gridOn,
  gridOpacity,
  onGridToggle,
  onGridOpacityChange,
  canShowZoom,
  scale,
  onZoomIn,
  onZoomOut,
  onZoomReset,
}) => {
  const menuItems = [
    { iconType: "Table", label: "Стол" },
    { iconType: "PC", label: "Компьютер" },
    { iconType: "Screen", label: "Экран" },
    { iconType: "Speaker", label: "Колонка" },
  ];

  const translateProblem = (problem) => {
    switch (problem) {
      case "keyboard":
        return "Клавиатура";
      case "mouse":
        return "Мышка";
      case "monitor":
        return "Монитор";
      case "system":
        return "Системный блок";
      case "speaker":
        return "Колонка";
      case "table":
        return "Стол";
      default:
        return problem;
    }
  };
  const translateElementType = (type) => {
    switch (type) {
      case "Table":
        return "Стол";
      case "PC":
        return "Компьютер";
      case "Screen":
        return "Экран";
      case "Speaker":
        return "Колонка";
      default:
        return type;
    }
  };
  useEffect(() => {
    if (mode !== "edit") return;
    const handleGlobalMouseUp = () => {
      if (isDragging && onDragCancel) {
        onDragCancel();
      }
    };
    document.addEventListener("mouseup", handleGlobalMouseUp);
    return () => document.removeEventListener("mouseup", handleGlobalMouseUp);
  }, [isDragging, onDragCancel, mode]);

  const handlePaletteMouseDown = (e, iconType) => {
    e.preventDefault();
    if (onDragStart) onDragStart(iconType);
  };

  const renderViewContent = () => (
    <div className="view-hint">
      <p>
        Чтобы пометить поломку или предложить изменение планировки, нажмите
        «Редактировать».
      </p>
    </div>
  );

  const renderEditContent = () => (
    <>
      {}
      <h4 className="side-section-title">Элементы</h4>
      <div className="menu-grid">
        {menuItems.map((item, index) => (
          <div
            key={index}
            className="menu-item-wrapper"
            onMouseDown={(e) => handlePaletteMouseDown(e, item.iconType)}
            style={{
              cursor: isDragging ? "grabbing" : "grab",
              opacity: isDragging ? 0.7 : 1,
            }}
          >
            <MenuItem iconType={item.iconType} />
            <span className="item-label">{item.label}</span>
          </div>
        ))}
      </div>

      {}
      <h4 className="side-section-title">Отметки поломок</h4>
      {brokenElements.length === 0 ? (
        <div className="view-hint">
          <p>Кликните по элементу на схеме, чтобы пометить поломку.</p>
        </div>
      ) : (
        <div className="problem-list">
          {brokenElements.map((element) => {
            const elementLabel = translateElementType(element.elementType);
            const problemLabel = translateProblem(element.problem);
            const label =
              elementLabel === problemLabel
                ? elementLabel
                : `${elementLabel} — ${problemLabel}`;
            return (
            <div className="problem-card" key={element.id}>
              <div className="problem-header">
                <span className="problem-type">{label}</span>
                <button
                  type="button"
                  className="close-btn"
                  onClick={() => onRemoveProblem(element.id)}
                >
                  ×
                </button>
              </div>
              <textarea
                className="problem-textarea"
                value={element.comment}
                onChange={(e) => onChangeComment(element.id, e.target.value)}
                placeholder="Комментарий (необязательно)"
                rows="2"
              />
            </div>
            );
          })}
        </div>
      )}

      {}
      {canShowGrid && (
        <div className="grid-controls">
          <label className="grid-checkbox">
            <input
              type="checkbox"
              checked={gridOn}
              onChange={(e) => onGridToggle(e.target.checked)}
            />
            <span>Сетка</span>
          </label>
          <div className="grid-opacity">
            <span>Контраст</span>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={gridOpacity}
              onChange={(e) => onGridOpacityChange(parseFloat(e.target.value))}
              disabled={!gridOn}
            />
          </div>
        </div>
      )}

      {}
      {canShowZoom && (
        <div className="zoom-controls">
          <button type="button" onClick={onZoomOut} title="Уменьшить">
            −
          </button>
          <button
            type="button"
            className="zoom-reset"
            onClick={onZoomReset}
            title="По размеру окна"
          >
            {Math.round((scale || 1) * 100)}%
          </button>
          <button type="button" onClick={onZoomIn} title="Увеличить">
            +
          </button>
        </div>
      )}
    </>
  );
  const title =
    mode === "edit"
      ? "Редактор"
      : roomName
      ? `${roomName}, ${roomFloor} этаж`
      : "Кабинет";

  return (
    <BaseSideMenu
      title={title}
      mainContent={
        <>
          {}
          {mode !== "edit" && roomDescription && (
            <p className="room-description">{roomDescription}</p>
          )}
          {mode === "edit" ? renderEditContent() : renderViewContent()}
        </>
      }
      buttons={
        <div className="button-container">
          {mode === "view" ? (
            <Button text="Редактировать" onClick={onStartEditing} />
          ) : (
            <>
              <Button text="Отправить" onClick={onSubmit} />
              <Button text="Удалить все отметки" onClick={onDeleteAll} />
              <Button text="Отмена" onClick={onCancel} />
            </>
          )}
        </div>
      }
    />
  );
};

export default SideComplaintsMenu;
