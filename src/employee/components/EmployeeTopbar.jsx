import { useState } from "react";
import {
  FaBars,
  FaBell,
  FaUserCircle,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./EmployeeTopbar.css";

function EmployeeTopbar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <header className="emp-topbar">
      <div className="emp-topbar-left">
        <button
          className="emp-toggle-btn"
          onClick={() => setIsOpen(!isOpen)}
          id="emp-sidebar-toggle"
        >
          <FaBars />
        </button>
        <h2>Employee Review Portal</h2>
      </div>

      <div className="emp-topbar-right">
        <div className="emp-notification" id="emp-notification-bell">
          <FaBell />
          <span className="emp-notification-count">3</span>
        </div>

        <div
          className="emp-profile-section"
          onClick={() => setShowProfile(!showProfile)}
          id="emp-profile-toggle"
        >
          <FaUserCircle className="emp-profile-icon" />
          <div className="emp-profile-info">
            <span className="emp-name">Sreelakshmi R</span>
            <span className="emp-role">Senior Software Engineer</span>
          </div>
        </div>

        {showProfile && (
          <div className="emp-profile-dropdown" id="emp-profile-dropdown">
            <div className="emp-dropdown-header">
              <FaUserCircle className="emp-dropdown-avatar" />
              <div>
                <h4>Sreelakshmi R</h4>
                <p>Senior Software Engineer</p>
              </div>
            </div>
            <hr />
            <button id="emp-profile-btn">
              <FaUser />
              Profile
            </button>
            <button
              className="emp-logout-btn"
              onClick={logout}
              id="emp-logout-btn"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default EmployeeTopbar;
