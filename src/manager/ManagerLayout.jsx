import { Routes, Route, Navigate } from "react-router-dom";
import ManagerNavBar from "./ManagerNavBar";
import ManagerHome from "./ManagerHome";
import Employees from "./Employees";

const ManagerLayout = ({ logout }) => (
  <>
    <ManagerNavBar logout={logout} />

    <Routes>
      <Route path="/" element={<ManagerHome />} />
      <Route path="employees" element={<Employees />} />

      <Route path="*" element={<Navigate to="/manager" replace />} />
    </Routes>
  </>
);

export default ManagerLayout;