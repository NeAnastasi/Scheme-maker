import { SVGIcon } from "../../types/SVGIconsConst";
import { DEFAULT_ELEMENT_SIZE } from "../../types/element";
import "./MenuItem.css";
const PREVIEW_MAX = 70;

const MenuItem = ({ iconType }) => {
  const IconComponent = SVGIcon[iconType];
  const size = DEFAULT_ELEMENT_SIZE[iconType] || { width: 100, height: 50 };
  const scale = PREVIEW_MAX / Math.max(size.width, size.height);
  const w = Math.round(size.width * scale);
  const h = Math.round(size.height * scale);

  return (
    <div className="custom-card">
      <IconComponent width={w} height={h} />
    </div>
  );
};

export default MenuItem;
