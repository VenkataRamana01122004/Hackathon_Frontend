import { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch } from "react-icons/fa";
import "./Employees.css";

function Employees() {
  const [employees, setEmployees] = useState([]);

  const [search, setSearch] = useState("");
  const [designation, setDesignation] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/manager/viewemployee"
      );

      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.employeeId?.toLowerCase().includes(search.toLowerCase()) ||
      employee.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      employee.email?.toLowerCase().includes(search.toLowerCase());

    const matchesDesignation =
      designation === "" || employee.designation === designation;

    // If API doesn't return status, this filter won't affect results
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

            {[...new Set(employees.map((e) => e.designation))]
              .filter(Boolean)
              .map((designation) => (
                <option key={designation} value={designation}>
                  {designation}
                </option>
              ))}
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

                  {/* Remove the extra 0 that was previously appended */}
                  <td>{employee.interviews}</td>

                  <td>
                    {employee.status ? (
                      <span
                        className={`status-badge ${
                          employee.status === "Available"
                            ? "available"
                            : "busy"
                        }`}
                      >
                        {employee.status}
                      </span>
                    ) : (
                      "-"
                    )}
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