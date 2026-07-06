import { Routes, Route, Navigate } from "react-router-dom";
import EmployeeNavBar from "./EmployeeNavBar";
import EmployeeHome from './EmployeeHome';

const EmployeeLayout = ({ logout }) => (
  <>
    <EmployeeNavBar logout={logout} />

    <Routes>
      <Route path="/" element={<EmployeeHome />} />
      <Route path="profile" element={<h2>Profile</h2>} />

      <Route path="*" element={<Navigate to="/employee" replace />} />
    </Routes>
  </>
);

export default EmployeeLayout;