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

  const [search, setSearch] = useState("");
  const [designation, setDesignation] = useState("");
  const [status, setStatus] = useState("");

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      employee.fullName.toLowerCase().includes(search.toLowerCase()) ||
      employee.email.toLowerCase().includes(search.toLowerCase());

    const matchesDesignation =
      designation === "" || employee.designation === designation;

    const matchesStatus =
      status === "" || employee.status === status;

    return (
      matchesSearch &&
      matchesDesignation &&
      matchesStatus
    );
  });

  return (
    <div className="employees-page">
      <h1 className="employees-title">Employees</h1>

      <div className="employees-toolbar">
        <div className="search-box">
          <FaSearch />

          <input
            type="text"
            placeholder="Search Employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-group">

          <select
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
          >
            <option value="">All Designations</option>
            <option value="Frontend Developer">
              Frontend Developer
            </option>
            <option value="Backend Developer">
              Backend Developer
            </option>
            <option value="QA Engineer">
              QA Engineer
            </option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Available">Available</option>
            <option value="Busy">Busy</option>
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

            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => (
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
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#6b7280",
                  }}
                >
                  No employees found.
                </td>
              </tr>
            )}

          </tbody>

        </table>

      </div>
    </div>
  );
}

export default Employees;