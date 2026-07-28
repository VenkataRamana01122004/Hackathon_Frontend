import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

import Dashboard from "./dashboard/Dashboard";
import Candidates from "./candidates/Candidates";
import Qualifiers from "./qualifiers/Qualifiers";
import Employees from "./employees/Employees";
import ScheduleInterview from "./interview/ScheduleInterview";
import EmployeeReviews from "./reviews/EmployeeReviews";
import CodingQuestions from "./coding/CodingQuestions";
import MCQQuestions from "./mcq/MCQQuestions";
import Assessments from "./assessments/Assessments";

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
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="candidates" element={<Candidates />} />
            <Route path="qualifiers" element={<Qualifiers />} />
            <Route path="employees" element={<Employees />} />
            <Route path="schedule" element={<ScheduleInterview />} />
            <Route path="reviews" element={<EmployeeReviews />} />
            <Route path="coding" element={<CodingQuestions />} />
            <Route path="mcq" element={<MCQQuestions />} />
            <Route path="assessments" element={<Assessments />} />
            <Route path="*" element={<Navigate to="/manager" replace />} />
          </Routes>
        </main>
      </div>

    </div>
  );
}

export default ManagerLayout;