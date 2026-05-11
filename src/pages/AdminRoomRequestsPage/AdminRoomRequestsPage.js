import BasePage from "../BasePage/BasePage";
import AdminSideMenu from "../../components/AdminSideMenu/AdminSideMenu";
import AdminRoomRequestsField from "../../components/AdminRoomRequestsField/AdminRoomRequestsField";

const AdminRoomRequestsPage = () => {
  return (
    <BasePage
      sidebar={<AdminSideMenu />}
      mainContent={<AdminRoomRequestsField />}
    />
  );
};

export default AdminRoomRequestsPage;
