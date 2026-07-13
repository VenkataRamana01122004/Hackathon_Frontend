import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

import "./ManagerLayout.css";

function ManagerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="manager-layout">

      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <div
        className={`manager-main ${
          sidebarOpen ? "expanded" : "collapsed"
        }`}
      >
        <Topbar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />

        <main className="manager-content">
          <Outlet />
        </main>
      </div>

    </div>
  );
}

export default ManagerLayout;