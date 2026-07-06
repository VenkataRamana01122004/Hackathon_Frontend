import React, { useState } from "react";
import ManagerNavbar from "./ManagerNavbar";

const Employees = () => {
  const [employees] = useState([
    {
      employeeId: "EMP0001",
      fullName: "Rahul Sharma",
      email: "rahul@gmail.com",
      designation: "Frontend Developer",
      project: "Interview Portal",
      managerId: "MGR0001",
    },
    {
      employeeId: "EMP0002",
      fullName: "Priya Singh",
      email: "priya@gmail.com",
      designation: "Backend Developer",
      project: "Interview Portal",
      managerId: "MGR0001",
    },
    {
      employeeId: "EMP0003",
      fullName: "Arjun Kumar",
      email: "arjun@gmail.com",
      designation: "QA Engineer",
      project: "Interview Portal",
      managerId: "MGR0002",
    },
  ]);

  return (
    <div>
      <h2>Employees</h2>

      <table border="1" cellPadding="8" cellSpacing="0">
        <thead>
          <tr>
            <th>Employee ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Designation</th>
            <th>Project</th>
            <th>Manager ID</th>
          </tr>
        </thead>

        <tbody>
          {employees.map((employee) => (
            <tr key={employee.employeeId}>
              <td>{employee.employeeId}</td>
              <td>{employee.fullName}</td>
              <td>{employee.email}</td>
              <td>{employee.designation}</td>
              <td>{employee.project}</td>
              <td>{employee.managerId}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Employees;