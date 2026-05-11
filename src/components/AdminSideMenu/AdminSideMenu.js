import { NavLink } from "react-router-dom";
import BaseSideMenu from "../BaseSideMenu/BaseSideMenu";
import useUnreadCounts from "../../hooks/useUnreadCounts";
import "./AdminSideMenu.css";

const AdminSideMenu = () => {
  const { applications, roomRequests, layoutProposals } = useUnreadCounts(true);
  const linkClass = ({ isActive }) =>
    isActive ? "admin-nav-link admin-nav-link--active" : "admin-nav-link";

  return (
    <BaseSideMenu
      title="Управление"
      mainContent={
        <div className="menu-container">
          <NavLink className={linkClass} to="/admin/rooms">
            Помещения
          </NavLink>
          <NavLink className={linkClass} to="/admin/applications">
            <span>Заявки</span>
            {applications > 0 && (
              <span className="admin-nav-badge">{applications}</span>
            )}
          </NavLink>
          <NavLink className={linkClass} to="/admin/room-requests">
            <span>Запросы кабинетов</span>
            {roomRequests > 0 && (
              <span className="admin-nav-badge">{roomRequests}</span>
            )}
          </NavLink>
          <NavLink className={linkClass} to="/admin/layout-proposals">
            <span>Изменения планировки</span>
            {layoutProposals > 0 && (
              <span className="admin-nav-badge">{layoutProposals}</span>
            )}
          </NavLink>
        </div>
      }
    />
  );
};

export default AdminSideMenu;
