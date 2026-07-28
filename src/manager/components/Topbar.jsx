import { useState } from "react";
import {
  FaBars,
  FaBell,
  FaUserCircle,
  FaSignOutAlt,
  FaUser
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import "./Topbar.css";

function Topbar({ isOpen, setIsOpen }) {

  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  const user = JSON.parse(localStorage.getItem("user")) || {};

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <header className="topbar">

      <div className="topbar-left">

        <button
          className="toggle-btn"
          onClick={() => setIsOpen(!isOpen)}
        >
          <FaBars />
        </button>

        <h2>Manager Dashboard</h2>

      </div>


      <div className="topbar-right">

        <div className="notification">
          <FaBell />

          <span className="notification-count">
            3
          </span>
        </div>


        <div
          className="profile-section"
          onClick={() => setShowProfile(!showProfile)}
        >

          <FaUserCircle className="profile-icon"/>

          <div className="profile-info">

            <span className="manager-name">
              {user.fullName || "User"}
            </span>

            <span className="manager-role">
              {user.role || "anager"}
            </span>

          </div>

        </div>


        {
          showProfile && (

            <div className="profile-dropdown">

              <div className="dropdown-header">

                <FaUserCircle className="dropdown-avatar"/>

                <div>

                  <h4>{user.fullName || "User"}</h4>

                  <p>{user.role || "Manager"}</p>

                </div>

              </div>

              <hr />


              {/* <button>
                <FaUser />
                Profile
              </button> */}


              <button
                className="logout-btn"
                onClick={logout}
              >
                <FaSignOutAlt />
                Logout
              </button>

            </div>

          )
        }

      </div>

    </header>
  );
}

export default Topbar;