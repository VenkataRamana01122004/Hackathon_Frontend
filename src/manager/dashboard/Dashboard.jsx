import {
  FaUsers,
  FaCalendarAlt,
  FaClipboardList,
  FaUserCheck
} from "react-icons/fa";

import { useState } from "react";

import StatCard from "../components/StatCard";
import CandidateModal from "../components/CandidateModal";

import "./Dashboard.css";
import "../components/CandidateTable.css";

function Dashboard() {
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const interviews = [
    {
      id: 1,
      fullName: "Rahul Sharma",
      appliedRole: "Frontend Developer",
      time: "10:00 AM",
      interviewer: "John",
      status: "Scheduled",
      email: "rahul.sharma@example.com",
      phone: "Not provided",
      experience: "Not provided",
      qualification: "Not provided",
      skills: "Not provided",
      candidateId: "Not provided",
      gender: "Not provided",
    },
    {
      id: 2,
      fullName: "Anjali",
      appliedRole: "Backend Developer",
      time: "11:30 AM",
      interviewer: "Peter",
      status: "Scheduled",
      email: "Not provided",
      phone: "Not provided",
      experience: "Not provided",
      qualification: "Not provided",
      skills: "Not provided",
      candidateId: "Not provided",
      gender: "Not provided",
    },
    {
      id: 3,
      fullName: "Arun",
      appliedRole: "AI Engineer",
      time: "2:00 PM",
      interviewer: "Sophia",
      status: "Scheduled",
      email: "Not provided",
      phone: "Not provided",
      experience: "Not provided",
      qualification: "Not provided",
      skills: "Not provided",
      candidateId: "Not provided",
      gender: "Not provided",
    },
  ];

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

      <h2>Today's Interviews</h2>
      <div className="dashboard-section">

        

        <table className="candidate-table">

          <thead>

          <tr
            className="dashboard-candidate-row"
            onClick={() => setSelectedCandidate(interviews[0])}
          >

            <th>Candidate</th>

            <th>Role</th>

            <th>Time</th>

            <th>Interviewer</th>

            <th>Status</th>

          </tr>

          </thead>

          <tbody>

          <tr
            className="dashboard-candidate-row"
            onClick={() => setSelectedCandidate(interviews[1])}
          >

            <td>Rahul Sharma</td>

            <td>Frontend Developer</td>

            <td>10:00 AM</td>

            <td>John</td>

            <td>Scheduled</td>

          </tr>

          <tr
            className="dashboard-candidate-row"
            onClick={() => setSelectedCandidate(interviews[2])}
          >

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

      <CandidateModal
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
      />

    </>

  );

}

export default Dashboard;