import { useRef } from "react";
import { SVGIcon } from "../../types/SVGIconsConst";
import "./SVGElement.css";

const SVGElement = ({
  element,
  isSelected,
  onSelect,
  onElementPointerDown,
  onElementClick,
  onResizeStart,
  onRotateStart,
  scale = 1,
}) => {
  const pointerDownRef = useRef({ x: 0, y: 0 });
  const CLICK_THRESHOLD_PX = 5;

  const handleElementPointerDown = (e) => {
    e.stopPropagation();
    pointerDownRef.current = { x: e.clientX, y: e.clientY };
    const canvas = e.currentTarget.closest(".SVGCanvas");
    let offsetX = 0;
    let offsetY = 0;
    let startX = 0;
    let startY = 0;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      startX =
        (e.clientX - rect.left + canvas.scrollLeft) / scale;
      startY =
        (e.clientY - rect.top + canvas.scrollTop) / scale;
      offsetX = startX - element.x;
      offsetY = startY - element.y;
    }
    onElementPointerDown(element.id, offsetX, offsetY, startX, startY);
  };
  const handleElementClick = (e) => {
    e.stopPropagation();
    const dx = e.clientX - pointerDownRef.current.x;
    const dy = e.clientY - pointerDownRef.current.y;
    if (Math.sqrt(dx * dx + dy * dy) > CLICK_THRESHOLD_PX) {
      return;
    }
    onSelect(element.id);
    if (onElementClick) {
      onElementClick(element.id, e.clientX, e.clientY);
    }
  };

  const handleResizePointerDown = (e, direction) => {
    e.stopPropagation();
    onSelect(element.id);
    onResizeStart(element.id, direction);
  };

  const handleRotatePointerDown = (e) => {
    e.stopPropagation();
    onSelect(element.id);
    onRotateStart(element.id);
  };

  const IconComponent = SVGIcon[element.type];

  return (
    <g
      className={`svg-element ${isSelected ? "selected" : ""}`}
      transform={`translate(${element.x}, ${element.y}) rotate(${
        element.rotation || 0
      }, ${element.width / 2}, ${element.height / 2})`}
    >
      <g
        onPointerDown={handleElementPointerDown}
        onClick={handleElementClick}
        style={{ cursor: "grab" }}
      >
        {}
        <rect
          width={element.width}
          height={element.height}
          fill="transparent"
        />
        <IconComponent
          width={element.width}
          height={element.height}
          color={element.isBroken ? "red" : "black"}
        />
      </g>
      {isSelected && (
        <>
          <rect
            x={-6}
            y={-6}
            width={12}
            height={12}
            fill="blue"
            className="resize-handle"
            style={{ cursor: "nw-resize" }}
            onPointerDown={(e) => handleResizePointerDown(e, "top-left")}
          />
          <rect
            x={element.width - 6}
            y={-6}
            width={12}
            height={12}
            fill="blue"
            className="resize-handle"
            style={{ cursor: "ne-resize" }}
            onPointerDown={(e) => handleResizePointerDown(e, "top-right")}
          />
          <rect
            x={-6}
            y={element.height - 6}
            width={12}
            height={12}
            fill="blue"
            className="resize-handle"
            style={{ cursor: "sw-resize" }}
            onPointerDown={(e) => handleResizePointerDown(e, "bottom-left")}
          />
          <rect
            x={element.width - 6}
            y={element.height - 6}
            width={12}
            height={12}
            fill="blue"
            className="resize-handle"
            style={{ cursor: "se-resize" }}
            onPointerDown={(e) => handleResizePointerDown(e, "bottom-right")}
          />
          <circle
            cx={element.width / 2}
            cy={-20}
            r={6}
            fill="green"
            style={{ cursor: "grab" }}
            onPointerDown={handleRotatePointerDown}
          />
        </>
      )}
    </g>
  );
};

export default SVGElement;
