import AdminApplicationField from "../../components/AdminApplicationField/AdminApplicationField";
import AdminSideMenu from "../../components/AdminSideMenu/AdminSideMenu";
import BasePage from "../BasePage/BasePage";
import "./AdminApplicationPage.css";

const AdminApplicationPage = () => {
  return <BasePage sidebar={<AdminSideMenu />} mainContent={<AdminApplicationField />} />;;
};

export default AdminApplicationPage;
