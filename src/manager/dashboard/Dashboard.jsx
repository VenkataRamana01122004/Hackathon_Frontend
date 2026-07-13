import {
  FaUsers,
  FaCalendarAlt,
  FaClipboardList,
  FaUserCheck,
  FaPlus
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import StatCard from "../components/StatCard";

import "./Dashboard.css";

function Dashboard() {

  const navigate = useNavigate();

  return (

    <>

      <div className="dashboard-cards">

        <StatCard
          title="Employees"
          value="18"
          icon={<FaUsers />}
          color="#2563EB"
        />

        <StatCard
          title="Mapped Interviews"
          value="46"
          icon={<FaClipboardList />}
          color="#16A34A"
        />

        <StatCard
          title="Today's Interviews"
          value="9"
          icon={<FaCalendarAlt />}
          color="#EA580C"
        />

        <StatCard
          title="Pending Reviews"
          value="6"
          icon={<FaUserCheck />}
          color="#9333EA"
        />

      </div>

      <div className="dashboard-actions">

        <button
          onClick={() => navigate("/manager/schedule")}
        >
          <FaPlus />

          Schedule Interview

        </button>

      </div>

      <div className="dashboard-section">

        <h2>Today's Interviews</h2>

        <table>

          <thead>

          <tr>

            <th>Candidate</th>

            <th>Role</th>

            <th>Time</th>

            <th>Interviewer</th>

            <th>Status</th>

          </tr>

          </thead>

          <tbody>

          <tr>

            <td>Rahul Sharma</td>

            <td>Frontend Developer</td>

            <td>10:00 AM</td>

            <td>John</td>

            <td>Scheduled</td>

          </tr>

          <tr>

            <td>Anjali</td>

            <td>Backend Developer</td>

            <td>11:30 AM</td>

            <td>Peter</td>

            <td>Scheduled</td>

          </tr>

          <tr>

            <td>Arun</td>

            <td>AI Engineer</td>

            <td>2:00 PM</td>

            <td>Sophia</td>

            <td>Scheduled</td>

          </tr>

          </tbody>

        </table>

      </div>

    </>

  );

}

export default Dashboard;