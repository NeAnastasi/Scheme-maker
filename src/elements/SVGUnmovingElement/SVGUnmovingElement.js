import { useState } from "react";
import SmallMenu from "../../components/SmallMenu/SmallMenu";
import { SVGIcon } from "../../types/SVGIconsConst";
import "./SVGUnmovingElement.css";

const SVGUnmovingElement = ({ element, onContextMenu }) => {
  const IconComponent = SVGIcon[element.type];

  const handleContextMenu = (e) => {
    if (onContextMenu) {
      onContextMenu(e, element);
    }
  };

  return (
    <g
      className={"svg-element"}
      transform={`translate(${element.x}, ${element.y}) rotate(${
        element.rotation || 0
      }, ${element.width / 2}, ${element.height / 2})`}
      onClick={handleContextMenu}
      style={{ cursor: "context-menu" }}
    >
      {}
      <rect
        width={element.width}
        height={element.height}
        fill="transparent"
      />
      <g>
        <IconComponent
          width={element.width}
          height={element.height}
          color={element.isBroken ? "red" : "black"}
        />
      </g>
    </g>
  );
};

export default SVGUnmovingElement;
