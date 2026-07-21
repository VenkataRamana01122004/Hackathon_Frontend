import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import "./Employees.css";

function Employees() {
  const [employees] = useState([
    {
      employeeId: "EMP0001",
      fullName: "Rahul Sharma",
      email: "rahul@gmail.com",
      designation: "Frontend Developer",
      project: "Interview Portal",
      interviews: 5,
      status: "Available",
    },
    {
      employeeId: "EMP0002",
      fullName: "Priya Singh",
      email: "priya@gmail.com",
      designation: "Backend Developer",
      project: "Interview Portal",
      interviews: 3,
      status: "Busy",
    },
    {
      employeeId: "EMP0003",
      fullName: "Arjun Kumar",
      email: "arjun@gmail.com",
      designation: "QA Engineer",
      project: "Interview Portal",
      interviews: 2,
      status: "Available",
    },
  ]);

  return (
    <div className="employees-page">
      <h1 className="employees-title">Employees</h1>

      <div className="employees-toolbar">
        <div className="search-box">
          <FaSearch />
          <input type="text" placeholder="Search Employee..." />
        </div>

        <div className="filter-group">
          <select>
            <option>All Designations</option>
            <option>Frontend Developer</option>
            <option>Backend Developer</option>
            <option>QA Engineer</option>
          </select>

          <select>
            <option>All Status</option>
            <option>Available</option>
            <option>Busy</option>
          </select>
        </div>
      </div>

      <div className="table-card">
        <table className="employee-table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Employee</th>
              <th>Designation</th>
              <th>Project</th>
              <th>Interviews</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((employee) => (
              <tr key={employee.employeeId}>
                <td>{employee.employeeId}</td>

                <td>
                  <div className="employee-info">
                    <h4>{employee.fullName}</h4>
                    <span>{employee.email}</span>
                  </div>
                </td>

                <td>{employee.designation}</td>

                <td>{employee.project}</td>

                <td>{employee.interviews}</td>

                <td>
                  <span
                    className={`status-badge ${
                      employee.status === "Available"
                        ? "available"
                        : "busy"
                    }`}
                  >
                    {employee.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Employees;