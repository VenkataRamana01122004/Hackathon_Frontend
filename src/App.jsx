import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainNavBar from "./main/MainNavBar";
import Home from "./main/Home";
import Login from "./main/Login";

import ProtectedRoute from "./ProtectedRoute";

// Layouts
import ManagerLayout from "./manager/ManagerLayout";
import EmployeeLayout from "./employee/EmployeeLayout";
import CandidateLayout from "./candidate/CandidateLayout";

// Manager Pages
import Dashboard from "./manager/dashboard/Dashboard";
import Candidates from "./manager/candidates/Candidates";
import Qualifiers from "./manager/qualifiers/Qualifiers";
import Referrals from "./manager/candidates/Referrals";
import Employees from "./manager/employees/Employees";
import ScheduleInterview from "./manager/interview/ScheduleInterview";
import EmployeeReviews from "./manager/reviews/EmployeeReviews";

function App() {
  const onLogin = (role) => {
    localStorage.setItem("role", role);
  };

  const logout = () => {
    localStorage.clear();
  };

  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}

        <Route
          path="/"
          element={
            <>
              <MainNavBar />
              <Home />
            </>
          }
        />

        <Route
          path="/login"
          element={
            <>
              <MainNavBar />
              <Login onLogin={onLogin} />
            </>
          }
        />

        {/* Manager Routes */}

        <Route
          path="/manager"
          element={
            <ProtectedRoute allowedRole="manager">
              <ManagerLayout logout={logout} />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />

          <Route path="candidates" element={<Candidates />} />

          <Route path="qualifiers" element={<Qualifiers />} />

          <Route path="referrals" element={<Referrals />} />

          <Route path="employees" element={<Employees />} />

          <Route path="schedule" element={<ScheduleInterview />} />

          <Route path="reviews" element={<EmployeeReviews />} />
        </Route>

        {/* Employee Routes */}

        <Route
          path="/employee/*"
          element={
            <ProtectedRoute allowedRole="employee">
              <EmployeeLayout logout={logout} />
            </ProtectedRoute>
          }
        />

        {/* Candidate Routes */}

        <Route
          path="/candidate/*"
          element={
            <ProtectedRoute allowedRole="candidate">
              <CandidateLayout logout={logout} />
            </ProtectedRoute>
          }
        />

        {/* Default */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;