import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import useUnreadCounts from "../../hooks/useUnreadCounts";
import "./Header.css";
const Header = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const { applications, roomRequests, layoutProposals } = useUnreadCounts(!!session);
  const totalUnread = applications + roomRequests + layoutProposals;
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">TSU</div>

        <nav className="navigation">
          <ul className="nav-list">
            <li>
              <Link to="/" className="nav-link">
                Кабинеты
              </Link>
            </li>
            {}
            {session ? (
              <>
                {}
                <li className="nav-user-wrapper">
                  <Link to="/admin/applications" className="nav-link nav-user">
                    {session.user.email}
                  </Link>
                  {totalUnread > 0 && (
                    <span className="nav-badge">{totalUnread}</span>
                  )}
                </li>
                <li>
                  <button
                    type="button"
                    className="nav-link nav-logout"
                    onClick={handleLogout}
                  >
                    Выйти
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link to="/auth" className="nav-link">
                  Авторизация
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
