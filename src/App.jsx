import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainNavBar from "./main/MainNavBar";
import Home from "./main/Home";
import Login from "./main/Login";

import ManagerLayout from "./manager/ManagerLayout";
import EmployeeLayout from "./employee/EmployeeLayout";
import ProtectedRoute from "./ProtectedRoute";
import CandidateLayout from "./candidate/CandidateLayout";

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

        <Route path="/" element={<><MainNavBar /><Home /></>} />
        <Route path="/login" element={<><MainNavBar /><Login onLogin={onLogin} /></>} />

        <Route
          path="/manager/*"
          element={
            <ProtectedRoute allowedRole="manager">
              <ManagerLayout logout={logout} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee/*"
          element={
            <ProtectedRoute allowedRole="employee">
              <EmployeeLayout logout={logout} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/candidate/*"
          element={
            <ProtectedRoute allowedRole="candidate">
              <CandidateLayout logout={logout} />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;