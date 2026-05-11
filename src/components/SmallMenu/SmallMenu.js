import { useState, useEffect } from "react";
import "./SmallMenu.css";
import { SVGIconType } from "../../types/SVGIconsConst";

const SmallMenu = ({ x, y, elementType, handleIsBroken, onClose }) => {
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const handleClickOutside = (e) => {
      const menu = document.querySelector(".small-menu");
      if (menu && !menu.contains(e.target)) {
        onClose();
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        if (selectedProblem) {
          setSelectedProblem(null);
          setComment("");
        } else {
          onClose();
        }
      }
    };

    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, selectedProblem]);

  const problemsDefinitionLabels = () => {
    switch (elementType) {
      case SVGIconType.PC:
        return {
          mouse: "Мышка",
          keyboard: "Клавиатура",
          monitor: "Монитор",
          system: "Системный блок",
        };
      case SVGIconType.Speaker:
        return { speaker: "Колонка" };
      case SVGIconType.Screen:
        return { speaker: "Колонка", monitor: "Монитор" };
      case SVGIconType.Table:
        return {table: "Стол"};
    }
    return;
  };

  const problemsDefinition = () => {
    console.log(elementType);
    switch (elementType) {
      case SVGIconType.PC:
        return ["mouse", "keyboard", "monitor", "system"];
      case SVGIconType.Speaker:
        return ["speaker"];
      case SVGIconType.Screen:
        return ["speaker", "monitor"];
      case SVGIconType.Table:
        return ["table"];
    }
    return 0;
  };

  const handleSubmit = (problemType, commentText = "") => {
    handleIsBroken(problemType, commentText);
    onClose();
  };

  if (selectedProblem) {
    const problemLabels = problemsDefinitionLabels();

    return (
      <div
        className="small-menu small-menu-comment"
        style={{
          left: x,
          top: y,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="menu-header">{problemLabels[selectedProblem]}</div>

        <textarea
          className="menu-textarea"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Описание проблемы..."
          rows="3"
        />

        <div className="menu-buttons">
          <button
            className="menu-button menu-button-back"
            onClick={() => setSelectedProblem(null)}
          >
            Назад
          </button>
          <button
            className="menu-button menu-button-submit"
            onClick={() => handleSubmit(selectedProblem, comment)}
          >
            Подтвердить
          </button>
        </div>
      </div>
    );
  }

  const problems = problemsDefinition();
  return (
    <div
      className="small-menu"
      style={{
        left: x,
        top: y,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {problems.map((type) => (
        <div
          key={type}
          className="menu-item"
          onClick={() => setSelectedProblem(type)}
        >
          {type === "mouse" && "Мышка"}
          {type === "keyboard" && "Клавиатура"}
          {type === "monitor" && "Монитор"}
          {type === "system" && "Системный блок"}
          {type === "speaker" && "Колонки"}
          {type === "table" && "Стол"}
        </div>
      ))}
    </div>
  );
};

export default SmallMenu;
