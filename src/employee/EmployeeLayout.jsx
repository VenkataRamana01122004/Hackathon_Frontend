import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import EmployeeSidebar from "./components/EmployeeSidebar";
import EmployeeTopbar from "./components/EmployeeTopbar";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import IncomingReviews from "./pages/IncomingReviews";
import ScheduledReviews from "./pages/ScheduledReviews";
import ReviewHistory from "./pages/ReviewHistory";
import MyReviews from "./pages/MyReviews";

import "./EmployeeLayout.css";

function EmployeeLayout({ logout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="employee-layout">
      <EmployeeSidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        logout={logout}
      />

      <div className={`employee-main ${sidebarOpen ? "expanded" : "collapsed"}`}>
        <EmployeeTopbar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

        <main className="employee-content">
          <Routes>
            <Route index element={<EmployeeDashboard />} />
            <Route path="incoming-reviews" element={<IncomingReviews />} />
            <Route path="scheduled" element={<ScheduledReviews />} />
            <Route path="my-reviews" element={<MyReviews />} />
            <Route path="history" element={<ReviewHistory />} />
            <Route path="*" element={<Navigate to="/employee" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default EmployeeLayout;