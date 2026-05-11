import SVGElement from "../../elements/SVGElement/SVGElement";
import "./SVGCanvas.css";
const PIXELS_PER_METER = 50;
const RULER_SIZE = 30;

const SVGCanvas = ({
  elements,
  selectedElementId,
  onSelectElement,
  onDrop,
  ghostElement,
  onDragMove,
  isDragging,
  onCanvasEnter,
  onCanvasLeave,
  isOverCanvas,
  onElementPointerDown,
  onElementClick,
  onResizeStart,
  onClearSelection,
  onRotateStart,
  room,
  gridOn,
  gridOpacity,
  scale = 1,
  naturalSvgSize,
  canvasRef,
}) => {
  const handleMouseEnter = () => {
    onCanvasEnter();
  };

  const handleMouseLeave = () => {
    onCanvasLeave();
  };

  const xyFinding = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x =
      (e.clientX - rect.left + e.currentTarget.scrollLeft) / scale;
    const y =
      (e.clientY - rect.top + e.currentTarget.scrollTop) / scale;
    return { x, y };
  };

  const handleMouseMove = (e) => {
    const { x, y } = xyFinding(e);
    onDragMove(x, y);
  };

  const handleMouseUp = (e) => {
    const { x, y } = xyFinding(e);
    onDrop(x, y);
  };

  const handleClick = (e) => {
    if ((e.target === e.currentTarget && !isDragging) || (e.target === e.currentTarget || e.target.tagName === "svg")) {
      onClearSelection();
    }
  };
  const hasSize = !!(room && room.width_m && room.height_m);
  const roomWidthPx = hasSize ? room.width_m * PIXELS_PER_METER : 0;
  const roomHeightPx = hasSize ? room.height_m * PIXELS_PER_METER : 0;
  const renderGrid = () => {
    const lines = [];
    const stepPx = 0.5 * PIXELS_PER_METER;
    const verticalCount = Math.floor(room.width_m / 0.5);
    const horizontalCount = Math.floor(room.height_m / 0.5);

    for (let i = 1; i < verticalCount; i++) {
      const x = RULER_SIZE + i * stepPx;
      lines.push(
        <line
          key={`gv-${i}`}
          x1={x}
          y1={RULER_SIZE}
          x2={x}
          y2={RULER_SIZE + roomHeightPx}
          stroke="#666"
          strokeWidth="0.5"
        />
      );
    }
    for (let i = 1; i < horizontalCount; i++) {
      const y = RULER_SIZE + i * stepPx;
      lines.push(
        <line
          key={`gh-${i}`}
          x1={RULER_SIZE}
          y1={y}
          x2={RULER_SIZE + roomWidthPx}
          y2={y}
          stroke="#666"
          strokeWidth="0.5"
        />
      );
    }
    return lines;
  };
  const renderRulerTop = () => {
    const ticks = [];
    const halfSteps = Math.floor(room.width_m / 0.5);
    for (let i = 0; i <= halfSteps; i++) {
      const meters = i * 0.5;
      const x = RULER_SIZE + meters * PIXELS_PER_METER;
      const isMajor = Number.isInteger(meters);
      const tickHeight = isMajor ? 12 : 6;
      ticks.push(
        <line
          key={`rt-${i}`}
          x1={x}
          y1={RULER_SIZE - tickHeight}
          x2={x}
          y2={RULER_SIZE}
          stroke="#555"
          strokeWidth="1"
        />
      );
      if (isMajor) {
        ticks.push(
          <text
            key={`rt-l-${i}`}
            x={x}
            y={RULER_SIZE - 15}
            fill="#555"
            fontSize="10"
            textAnchor="middle"
          >
            {meters}
          </text>
        );
      }
    }
    return ticks;
  };

  const renderRulerLeft = () => {
    const ticks = [];
    const halfSteps = Math.floor(room.height_m / 0.5);
    for (let i = 0; i <= halfSteps; i++) {
      const meters = i * 0.5;
      const y = RULER_SIZE + meters * PIXELS_PER_METER;
      const isMajor = Number.isInteger(meters);
      const tickWidth = isMajor ? 12 : 6;
      ticks.push(
        <line
          key={`rl-${i}`}
          x1={RULER_SIZE - tickWidth}
          y1={y}
          x2={RULER_SIZE}
          y2={y}
          stroke="#555"
          strokeWidth="1"
        />
      );
      if (isMajor) {
        ticks.push(
          <text
            key={`rl-l-${i}`}
            x={RULER_SIZE - 15}
            y={y + 3}
            fill="#555"
            fontSize="10"
            textAnchor="end"
          >
            {meters}
          </text>
        );
      }
    }
    return ticks;
  };
  const svgProps = naturalSvgSize
    ? {
        width: naturalSvgSize.width * scale,
        height: naturalSvgSize.height * scale,
        viewBox: `0 0 ${naturalSvgSize.width} ${naturalSvgSize.height}`,
      }
    : { width: "100%", height: "100%" };

  return (
    <div
      className="SVGCanvas"
      ref={canvasRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      style={{
        cursor: isDragging ? "crosshair" : "default",
        border: isDragging ? "2px solid #007bff" : "2px dashed #ccc",
        backgroundColor: isDragging && !isOverCanvas ? "#f8f9fa" : "white",
      }}
    >
      <svg {...svgProps}>
        {}
        {hasSize && (
          <rect
            x={RULER_SIZE}
            y={RULER_SIZE}
            width={roomWidthPx}
            height={roomHeightPx}
            fill="#fafafa"
            stroke="#666"
            strokeWidth="1"
          />
        )}

        {}
        {hasSize && gridOn && (
          <g style={{ opacity: gridOpacity }}>{renderGrid()}</g>
        )}

        {}
        {elements.map((element) => (
          <SVGElement
            key={element.id}
            element={element}
            isSelected={element.id === selectedElementId}
            onSelect={onSelectElement}
            onElementPointerDown={onElementPointerDown}
            onElementClick={onElementClick}
            onResizeStart={onResizeStart}
            onRotateStart={onRotateStart}
            scale={scale}
          />
        ))}
        {ghostElement && isOverCanvas && (
          <SVGElement
            element={ghostElement}
            isSelected={false}
            style={{ opacity: 0.6 }}
          />
        )}

        {}
        {hasSize && (
          <>
            <rect
              x={0}
              y={0}
              width="100%"
              height={RULER_SIZE}
              fill="#f0f0f0"
              stroke="#ccc"
              strokeWidth="0.5"
            />
            <rect
              x={0}
              y={0}
              width={RULER_SIZE}
              height="100%"
              fill="#f0f0f0"
              stroke="#ccc"
              strokeWidth="0.5"
            />
            {renderRulerTop()}
            {renderRulerLeft()}
          </>
        )}
      </svg>
    </div>
  );
};

export default SVGCanvas;
