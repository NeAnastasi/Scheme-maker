import "./SchemePage.css";
import SideMenu from "../../components/SideMenu/SideMenu";
import SVGCanvas from "../../components/SVGCanvas/SVGCanvas.js";
import { useEffect, useRef, useState } from "react";
import { createElement, DEFAULT_ELEMENT_SIZE } from "../../types/element.js";
import { OperationType } from "../../types/operationType.js";
import BasePage from "../BasePage/BasePage.js";
function SchemePage({
  initialElements,
  onSave,
  room,
  sidebar,
  brokenIds,
  onElementClick,
  onDragStartReal,
  onElementsChange,
}) {
  const [elements, setElements] = useState(initialElements || []);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [ghostElement, setGhostElement] = useState(null);
  const [isGlobalDragging, setIsGlobalDragging] = useState(false);
  const [isOverCanvas, setIsOverCanvas] = useState(false);
  const [draggingItemType, setDraggingItemType] = useState(null);
  const [resizingElementId, setResizingElementId] = useState(null);
  const [resizeDirection, setResizeDirection] = useState(null);
  const [operationType, setOperationType] = useState(null);
  const [rotatingElementId, setRotatingElementId] = useState(null);
  const [rotationStartAngle, setRotationStartAngle] = useState(0);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const pendingDragRef = useRef(null);
  const DRAG_THRESHOLD = 5;
  const PIXELS_PER_METER = 50;
  const RULER_SIZE = 30;
  const clampBox = (x, y, w, h) => {
    let minX = 0;
    let minY = 0;
    let maxX = null;
    let maxY = null;
    if (room && room.width_m && room.height_m) {
      minX = RULER_SIZE;
      minY = RULER_SIZE;
      maxX = RULER_SIZE + room.width_m * PIXELS_PER_METER;
      maxY = RULER_SIZE + room.height_m * PIXELS_PER_METER;
    }

    let newW = w;
    let newH = h;
    let newX = Math.max(minX, x);
    let newY = Math.max(minY, y);

    if (maxX !== null) {
      newW = Math.min(newW, maxX - minX);
      if (newX + newW > maxX) newX = maxX - newW;
    }
    if (maxY !== null) {
      newH = Math.min(newH, maxY - minY);
      if (newY + newH > maxY) newY = maxY - newH;
    }

    return { x: newX, y: newY, width: newW, height: newH };
  };
  const [gridOn, setGridOn] = useState(false);
  const [gridOpacity, setGridOpacity] = useState(0.4);
  const canShowGrid = !!(room && room.width_m && room.height_m);
  const [scale, setScale] = useState(1);
  const canvasRef = useRef(null);
  const naturalSvgSize = canShowGrid
    ? {
        width: RULER_SIZE * 2 + room.width_m * PIXELS_PER_METER,
        height: RULER_SIZE * 2 + room.height_m * PIXELS_PER_METER,
      }
    : null;
  const computeFitScale = () => {
    if (!naturalSvgSize || !canvasRef.current) return 1;
    const rect = canvasRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return 1;
    const sx = (rect.width * 0.95) / naturalSvgSize.width;
    const sy = (rect.height * 0.95) / naturalSvgSize.height;
    const fit = Math.min(sx, sy);
    return Math.min(fit, 1);
  };
  useEffect(() => {
    if (!canShowGrid) return;
    setScale(computeFitScale());
  }, [room && room.width_m, room && room.height_m, canShowGrid]);

  const handleZoomIn = () => setScale((prev) => Math.min(prev * 1.2, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev / 1.2, 0.2));
  const handleZoomReset = () => setScale(computeFitScale());

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Delete" && selectedElementId) {
        e.preventDefault();
        setElements((prev) => prev.filter((el) => el.id !== selectedElementId));
        setSelectedElementId(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedElementId]);
  useEffect(() => {
    if (onElementsChange) {
      onElementsChange(elements);
    }
  }, [elements]);

  const handleSave = () => {
    if (onSave) {
      onSave(elements);
    }
  };

  const handleClearSelection = () => {
    setSelectedElementId(null);
  };

  const clearDragStates = () => {
    setGhostElement(null);
    setIsGlobalDragging(false);
    setIsOverCanvas(false);
    setDraggingItemType(null);
    setResizingElementId(null);
    setResizeDirection(null);
    setOperationType(null);
    setRotatingElementId(null);
    setRotationStartAngle(0);
    pendingDragRef.current = null;
  };

  const clearAllStates = () => {
    clearDragStates();
    handleClearSelection();
  };

  const handleDragStart = (itemType) => {
    setIsGlobalDragging(true);
    setDraggingItemType(itemType);
    setOperationType(OperationType.NewElement);
  };
  const handleElementPointerDown = (
    elementId,
    offsetX,
    offsetY,
    startX,
    startY
  ) => {
    pendingDragRef.current = {
      elementId,
      offsetX: offsetX || 0,
      offsetY: offsetY || 0,
      startX,
      startY,
    };
  };

  const handleResizeStart = (elementId, direction) => {
    setResizingElementId(elementId);
    setResizeDirection(direction);
    setIsGlobalDragging(true);
    setOperationType(OperationType.Resize);
  };

  const handleCanvasEnter = (e) => {
    if (isGlobalDragging && draggingItemType && !ghostElement) {
      const size =
        DEFAULT_ELEMENT_SIZE[draggingItemType] || { width: 100, height: 50 };
      const ghost = {
        id: "ghost",
        type: draggingItemType,
        x: 0,
        y: 0,
        width: size.width,
        height: size.height,
        isGhost: true,
      };

      setGhostElement(ghost);
    }
    setIsOverCanvas(true);
  };

  const handleCanvasLeave = () => {
    setIsOverCanvas(false);
    if (ghostElement) {
      setGhostElement(null);
    }
  };

  const handleDragMove = (x, y) => {
    const pd = pendingDragRef.current;
    if (pd && operationType !== OperationType.Drag) {
      const dx = x - pd.startX;
      const dy = y - pd.startY;
      if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
        setSelectedElementId(pd.elementId);
        setOperationType(OperationType.Drag);
        setDragOffset({ x: pd.offsetX, y: pd.offsetY });
        setIsGlobalDragging(true);
        if (onDragStartReal) onDragStartReal();
      }
      return;
    }

    if (operationType === OperationType.Rotate && rotatingElementId) {
      const element = elements.find((el) => el.id === rotatingElementId);
      if (!element) return;

      const centerX = element.x + element.width / 2;
      const centerY = element.y + element.height / 2;

      const deltaX = x - centerX;
      const deltaY = y - centerY;
      const mouseAngle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

      const startDeltaX = centerX - centerX;
      const startDeltaY = element.y - 20 - centerY;
      const startAngle = Math.atan2(startDeltaY, startDeltaX) * (180 / Math.PI);
      const angleDiff = mouseAngle - startAngle;
      const newAngle = (rotationStartAngle + angleDiff) % 360;

      setElements((prev) =>
        prev.map((el) =>
          el.id === rotatingElementId ? { ...el, rotation: newAngle } : el
        )
      );
      return;
    }

    if (
      operationType === OperationType.Resize &&
      resizingElementId &&
      resizeDirection
    ) {
      setElements((prev) =>
        prev.map((el) => {
          if (el.id !== resizingElementId) return el;

          const newWidth = calculateNewWidth(el, x, resizeDirection);
          const newHeight = calculateNewHeight(el, y, resizeDirection);
          const newX = calculateNewX(el, x, resizeDirection, newWidth);
          const newY = calculateNewY(el, y, resizeDirection, newHeight);

          const c = clampBox(
            newX,
            newY,
            Math.max(newWidth, 20),
            Math.max(newHeight, 20)
          );

          return {
            ...el,
            x: c.x,
            y: c.y,
            width: c.width,
            height: c.height,
          };
        })
      );
      return;
    }

    if (operationType === OperationType.NewElement && ghostElement) {
      setGhostElement((prev) => ({
        ...prev,
        x: x - prev.width / 2,
        y: y - prev.height / 2,
      }));
    }

    if (operationType === OperationType.Drag && selectedElementId) {
      setElements((prev) =>
        prev.map((el) => {
          if (el.id !== selectedElementId) return el;
          const desiredX = x - dragOffset.x;
          const desiredY = y - dragOffset.y;
          const c = clampBox(desiredX, desiredY, el.width, el.height);
          return { ...el, x: c.x, y: c.y };
        })
      );
    }
  };

  const handleDrop = (x, y) => {
    if (ghostElement) {
      const c = clampBox(
        ghostElement.x,
        ghostElement.y,
        ghostElement.width,
        ghostElement.height
      );
      const newElement = createElement(ghostElement.type, c.x, c.y);
      setElements((prev) => [...prev, newElement]);
    }
    clearDragStates();
  };

  const handleDragCancel = () => {
    clearAllStates();
  };

  const calculateNewWidth = (element, mouseX, direction) => {
    switch (direction) {
      case "right":
      case "top-right":
      case "bottom-right":
        return mouseX - element.x;
      case "left":
      case "top-left":
      case "bottom-left":
        return element.width + (element.x - mouseX);
      default:
        return element.width;
    }
  };

  const calculateNewHeight = (element, mouseY, direction) => {
    switch (direction) {
      case "bottom":
      case "bottom-right":
      case "bottom-left":
        return mouseY - element.y;
      case "top":
      case "top-right":
      case "top-left":
        return element.height + (element.y - mouseY);
      default:
        return element.height;
    }
  };

  const calculateNewX = (element, mouseX, direction, newWidth) => {
    if (direction.includes("left")) {
      return mouseX;
    }
    return element.x;
  };

  const calculateNewY = (element, mouseY, direction, newHeight) => {
    if (direction.includes("top")) {
      return mouseY;
    }
    return element.y;
  };

  const handleRotateStart = (elementId) => {
    const element = elements.find((el) => el.id === elementId);
    if (!element) return;

    setRotatingElementId(elementId);
    setIsGlobalDragging(true);
    setOperationType(OperationType.Rotate);

    setRotationStartAngle(element.rotation || 0);
  };
  const elementsForRender = brokenIds
    ? elements.map((el) =>
        brokenIds.has(el.id) ? { ...el, isBroken: true } : el
      )
    : elements;

  return (
    <BasePage
      sidebar={(() => {
        const sidebarApi = {
          onDragStart: handleDragStart,
          onDragCancel: handleDragCancel,
          isDragging: isGlobalDragging,
          onSave: handleSave,
          canShowGrid,
          gridOn,
          gridOpacity,
          onGridToggle: setGridOn,
          onGridOpacityChange: setGridOpacity,
          canShowZoom: canShowGrid,
          scale,
          onZoomIn: handleZoomIn,
          onZoomOut: handleZoomOut,
          onZoomReset: handleZoomReset,
        };
        if (sidebar === undefined) {
          return <SideMenu {...sidebarApi} />;
        }
        return typeof sidebar === "function" ? sidebar(sidebarApi) : sidebar;
      })()}
      mainContent={
        <>
          {}
          {room && (
            <div className="scheme-room-info">
              <span className="scheme-room-info__name">{room.name}</span>
              <span className="scheme-room-info__floor">
                {room.floor} этаж
              </span>
              {room.description && (
                <span className="scheme-room-info__desc">
                  {room.description}
                </span>
              )}
            </div>
          )}
          <SVGCanvas
            elements={elementsForRender}
            selectedElementId={selectedElementId}
            onSelectElement={setSelectedElementId}
            onDrop={handleDrop}
            ghostElement={ghostElement}
            onDragMove={handleDragMove}
            isDragging={isGlobalDragging}
            onCanvasEnter={handleCanvasEnter}
            onCanvasLeave={handleCanvasLeave}
            isOverCanvas={isOverCanvas}
            onElementPointerDown={handleElementPointerDown}
            onElementClick={onElementClick}
            onResizeStart={handleResizeStart}
            onClearSelection={handleClearSelection}
            onRotateStart={handleRotateStart}
            room={room}
            gridOn={gridOn}
            gridOpacity={gridOpacity}
            scale={scale}
            naturalSvgSize={naturalSvgSize}
            canvasRef={canvasRef}
          />
        </>
      }
    />
  );
}

export default SchemePage;
