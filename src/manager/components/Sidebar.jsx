import {
  FaHome,
  FaUserTie,
  FaUserCheck,
  FaUsers,
  FaCode,
  FaListAlt,
  FaClipboardList,
  FaChartBar,
  FaStar,
  FaSignOutAlt
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
    icon: <FaUserTie />,
  },
  {
    title: "Employees",
    path: "/manager/employees",
    icon: <FaUsers />,
  },
  {
    title: "Coding Questions",
    path: "/manager/coding",
    icon: <FaCode />,
  },
  {
    title: "MCQ Questions",
    path: "/manager/mcq",
    icon: <FaListAlt />,
  },
  {
    title: "Interview Questions",
    path: "/manager/interviewquestions",
    icon: <FaClipboardList />,
  },
  {
    title: "Assessment Reports",
    path: "/manager/assessments",
    icon: <FaChartBar />,
  },
  {
    title: "Qualifiers",
    path: "/manager/qualifiers",
    icon: <FaUserCheck />,
  },
  {
    title: "Employee Reviews",
    path: "/manager/reviews",
    icon: <FaStar />,
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