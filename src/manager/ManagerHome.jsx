import React from "react";
import ManagerNavbar from "./ManagerNavbar";

const ManagerHome = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div>
      <h2>Manager Dashboard</h2>

      <p>Welcome {user?.fullName}</p>

      <p>Email: {user?.email}</p>

      <p>Designation: {user?.designation}</p>

      <p>Project: {user?.project}</p>
    </div>
  );
};

export default ManagerHome;