import BasePage from "../BasePage/BasePage";
import AdminSideMenu from "../../components/AdminSideMenu/AdminSideMenu";
import AdminLayoutProposalsField from "../../components/AdminLayoutProposalsField/AdminLayoutProposalsField";

const AdminLayoutProposalsPage = () => {
  return (
    <BasePage
      sidebar={<AdminSideMenu />}
      mainContent={<AdminLayoutProposalsField />}
    />
  );
};

export default AdminLayoutProposalsPage;
