import { useState } from "react";
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

      <div className="employees-header">
        <h2>Employees</h2>

        <input
          type="text"
          placeholder="Search Employee..."
        />
      </div>

      <table className="employee-table">

        <thead>

          <tr>

            <th>Employee ID</th>

            <th>Name</th>

            <th>Email</th>

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

              <td>{employee.fullName}</td>

              <td>{employee.email}</td>

              <td>{employee.designation}</td>

              <td>{employee.project}</td>

              <td>{employee.interviews}</td>

              <td>
                <span
                  className={
                    employee.status === "Available"
                      ? "status available"
                      : "status busy"
                  }
                >
                  {employee.status}
                </span>
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default Employees;