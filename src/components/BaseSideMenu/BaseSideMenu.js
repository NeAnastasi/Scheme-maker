import "./BaseSideMenu.css";

const BaseSideMenu = ({title, mainContent, buttons}) => {
  return (
    <div className="side-menu">
      <div>
        <h3 className="menu-title">{title}</h3>
            {mainContent}
      </div>
      {buttons}
    </div>
  );
};

export default BaseSideMenu;