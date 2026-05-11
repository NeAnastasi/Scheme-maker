export const DEFAULT_ELEMENT_SIZE = {
  Table: { width: 100, height: 50 },
  PC: { width: 100, height: 70 },
  Screen: { width: 100, height: 12 },
  Speaker: { width: 50, height: 80 },
};

export const createElement = (type, x, y) => {
  const size = DEFAULT_ELEMENT_SIZE[type] || { width: 100, height: 50 };
  return {
    id: Date.now().toString(),
    type,
    x,
    y,
    width: size.width,
    height: size.height,
    rotation: 0,
    isBroken: false,
  };
};
