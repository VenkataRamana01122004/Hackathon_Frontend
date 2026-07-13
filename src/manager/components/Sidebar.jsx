import {
  FaHome,
  FaUsers,
  FaUserTie,
  FaUserCheck,
  FaClipboardCheck,
  FaSignOutAlt,
  FaCode,
  FaQuestionCircle,
  FaFileAlt
} from "react-icons/fa";

import { NavLink } from "react-router-dom";
import "./Sidebar.css";

function Sidebar({ isOpen }) {

  const menuItems = [
    {
      title: "Dashboard",
      path: "/manager",
      icon: <FaHome />,
    },
    {
      title: "Candidates",
      path: "/manager/candidates",
      icon: <FaUsers />,
    },
    {
      title: "2nd Round Qualifiers",
      path: "/manager/qualifiers",
      icon: <FaUserCheck />,
    },
    {
      title: "Referral Candidates",
      path: "/manager/referrals",
      icon: <FaUserTie />,
    },
    {
      title: "Employees",
      path: "/manager/employees",
      icon: <FaUsers />,
    },

    // NEW
    {
      title: "Coding Questions",
      path: "/manager/coding",
      icon: <FaCode />,
    },

    // NEW
    {
      title: "MCQ Questions",
      path: "/manager/mcq",
      icon: <FaQuestionCircle />,
    },

    // NEW
    {
      title: "Assessment Reports",
      path: "/manager/assessments",
      icon: <FaFileAlt />,
    },

    {
      title: "Employee Reviews",
      path: "/manager/reviews",
      icon: <FaClipboardCheck />,
    },
  ];

  return (
    <div className={`sidebar ${isOpen ? "open" : "close"}`}>
      <div className="sidebar-logo">
        {isOpen ? "Interview Portal" : "IP"}
      </div>

      <ul className="sidebar-menu">
        {menuItems.map((item, index) => (
          <li key={index}>
            <NavLink
              to={item.path}
              end={item.path === "/manager"}
              className={({ isActive }) =>
                isActive ? "menu-link active" : "menu-link"
              }
            >
              <span className="menu-icon">
                {item.icon}
              </span>

              {isOpen && (
                <span className="menu-title">
                  {item.title}
                </span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="sidebar-footer">
        <NavLink to="/" className="menu-link logout">
          <span className="menu-icon">
            <FaSignOutAlt />
          </span>

          {isOpen && (
            <span className="menu-title">
              Logout
            </span>
          )}
        </NavLink>
      </div>
    </div>
  );
}

export default Sidebar;