import {
  FaHome,
  FaInbox,
  FaCalendarAlt,
  FaClipboardList,
  FaHistory,
  FaSignOutAlt,
} from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import "./EmployeeSidebar.css";

function EmployeeSidebar({ isOpen, logout }) {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: "Home",
      path: "/employee",
      icon: <FaHome />,
      end: true,
    },
    {
      title: "Incoming Reviews",
      path: "/employee/incoming-reviews",
      icon: <FaInbox />,
    },
    {
      title: "Scheduled Reviews",
      path: "/employee/scheduled",
      icon: <FaCalendarAlt />,
    },
    {
      title: "My Reviews",
      path: "/employee/my-reviews",
      icon: <FaClipboardList />,
    },
    {
      title: "History",
      path: "/employee/history",
      icon: <FaHistory />,
    },
  ];

  const handleLogout = () => {
    if (logout) logout();
    navigate("/");
  };

  return (
    <div className={`emp-sidebar ${isOpen ? "open" : "close"}`}>
      <div className="emp-sidebar-logo">
        {isOpen ? (
          <span className="logo-full">
            <span className="logo-icon">🏢</span> ReviewPortal
          </span>
        ) : (
          <span className="logo-short">RP</span>
        )}
      </div>

      <ul className="emp-sidebar-menu">
        {menuItems.map((item, index) => (
          <li key={index}>
            <NavLink
              to={item.path}
              end={item.end || false}
              className={({ isActive }) =>
                isActive ? "emp-menu-link active" : "emp-menu-link"
              }
            >
              <span className="emp-menu-icon">{item.icon}</span>
              {isOpen && (
                <span className="emp-menu-title">{item.title}</span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="emp-sidebar-footer">
        <button className="emp-menu-link logout-btn" onClick={handleLogout}>
          <span className="emp-menu-icon">
            <FaSignOutAlt />
          </span>
          {isOpen && <span className="emp-menu-title">Logout</span>}
        </button>
      </div>
    </div>
  );
}

export default EmployeeSidebar;
