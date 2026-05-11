import Header from "../../components/Header/Header";
import "./BasePage.css";

function BasePage({sidebar, mainContent}) {
  return (
    <>
      <Header />
      <div className="page">
        <div className="sidebar">
          {sidebar}
        </div>
        <div className="page-body">
          {mainContent}
        </div>
      </div>
    </>
  );
}

export default BasePage;