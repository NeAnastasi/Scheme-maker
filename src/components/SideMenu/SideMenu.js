import { useEffect } from "react";
import Button from "../Button/Button";
import MenuItem from "../MenuItem/MenuItem";
import "./SideMenu.css";
import BaseSideMenu from "../BaseSideMenu/BaseSideMenu";

const SideMenu = ({
  onDragStart,
  onDragCancel,
  isDragging,
  onSave,
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

  const handleMouseDown = (e, iconType) => {
    e.preventDefault();
    onDragStart(iconType);
  };

  useEffect(() => {
    const handleGlobalMouseUp = (e) => {
      if (isDragging) {
        onDragCancel();
      }
    };

    document.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDragging, onDragCancel]);

  return (
    <BaseSideMenu
      title={"Элементы"}
      mainContent={
        <>
          <div className="menu-grid">
            {menuItems.map((item, index) => (
              <div
                key={index}
                className="menu-item-wrapper"
                onMouseDown={(e) => handleMouseDown(e, item.iconType)}
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
                  onChange={(e) =>
                    onGridOpacityChange(parseFloat(e.target.value))
                  }
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
      }
      buttons={<Button text="Сохранить" onClick={onSave} />}
    />
  );
};

export default SideMenu;
