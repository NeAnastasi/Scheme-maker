import "./AdminPage.css";
import BasePage from "../BasePage/BasePage";
import AdminSideMenu from "../../components/AdminSideMenu/AdminSideMenu";
import AdminField from "../../components/AdminField/AdminField";

const AdminPage = () => {
  return <BasePage sidebar={<AdminSideMenu />} mainContent={<AdminField></AdminField>} />;
};

export default AdminPage;
