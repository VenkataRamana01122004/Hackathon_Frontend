import {
  FaUsers,
  FaCalendarAlt,
  FaClipboardList,
  FaUserCheck
} from "react-icons/fa";

import { useState, useEffect } from "react";
import axios from "axios";

import StatCard from "../components/StatCard";
import CandidateModal from "../components/CandidateModal";

import "./Dashboard.css";
import "../components/CandidateTable.css";

const API_URL = "http://localhost:5000/api";

function Dashboard() {
  const [candidates, setCandidates] = useState([]);

  const [dashboardStats, setDashboardStats] = useState({
  employeeCount: 0,
  totalCandidates: 0,
  mappedInterviews: 0,
  todayInterviewCount: 0,
  passedPassedPendingCount: 0,
});

  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all dashboard data with one API request
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `${API_URL}/manager/dashboard`
        );

        const data = response.data;

        if (!data.success) {
          throw new Error(
            data.message || "Failed to fetch dashboard data."
          );
        }

        setCandidates(data.candidates || []);

        // Read the statistics returned by the backend
        setDashboardStats({
          employeeCount:
            data.stats?.employeeCount ??
            data.employeeCount ??
            0,

          totalCandidates:
            data.stats?.totalCandidates ??
            data.totalCandidates ??
            data.candidates?.length ??
            0,

          mappedInterviews:
            data.stats?.mappedInterviews ??
            data.mappedInterviews ??
            0,

          todayInterviewCount:
            data.stats?.todayInterviewCount ??
            data.todayInterviewCount ??
            0,

            passedPassedPendingCount:
  data.stats?.passedPassedPendingCount ??
  data.passedPassedPendingCount ??
  0,
        });
      } catch (err) {
        console.error("Dashboard API error:", err);

        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Get today's date in local YYYY-MM-DD format
  const now = new Date();

  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");

  // Filter today's scheduled candidates and sort by time
  const todaysCandidates = candidates
    .filter((candidate) => {
      if (!candidate.examDate) return false;

      // Handles DATEONLY values returned as YYYY-MM-DD
      const examDate = String(candidate.examDate).slice(0, 10);

      return examDate === today;
    })
    .sort((a, b) =>
      String(a.examTime || "").localeCompare(
        String(b.examTime || "")
      )
    );

  // Format SQL TIME, e.g. 22:08:00 -> 10:08 PM
  const formatTime = (time) => {
    if (!time) return "Not provided";

    const match = String(time).match(/^(\d{2}):(\d{2})/);

    if (!match) return String(time);

    const date = new Date();

    date.setHours(
      Number(match[1]),
      Number(match[2]),
      0,
      0
    );

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatStatus = (candidate) => {
    const status = candidate.interviewStatus;

    if (!status) return "Pending";

    switch (status) {
      case "Scheduled":
        return "Scheduled";
      case "Completed":
        return "Completed";
      case "Cancelled":
        return "Cancelled";
      case "Passed":
        return "Passed";
      case "Failed":
        return "Failed";
      case "Pending":
        return "Pending";
      default:
        return status;
    }
  };

  return (
    <>
      {/* Dashboard statistics */}
      <div className="dashboard-cards">
        <StatCard
          title="Total Candidates"
          value={
            loading ? "..." : dashboardStats.totalCandidates
          }
          icon={<FaUsers />}
          color="#2563EB"
        />

        {/* <StatCard
          title="Mapped Interviews"
          value={
            loading ? "..." : dashboardStats.mappedInterviews
          }
          icon={<FaClipboardList />}
          color="#16A34A"
        /> */}

        <StatCard
          title="Interview Pending"
          value={
            loading ? "..." : dashboardStats.passedPassedPendingCount
          }
          icon={<FaUserCheck />}
          color="#9333EA"
        />

        <StatCard
          title="Today's Assignments"
          value={
            loading ? "..." : dashboardStats.todayInterviewCount
          }
          icon={<FaCalendarAlt />}
          color="#EA580C"
        />

        <StatCard
          title="Employees"
          value={
            loading ? "..." : dashboardStats.employeeCount
          }
          icon={<FaUsers />}
          color="#7C3AED"
        />
      </div>

      {/* Today's interviews */}
      <h2>Today's Interviews</h2>

      <div className="dashboard-section">
        {loading && <p>Loading dashboard data...</p>}

        {!loading && error && (
          <p style={{ color: "red" }}>{error}</p>
        )}

        {!loading && !error && (
          <table className="candidate-table">
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
              {todaysCandidates.map((candidate) => (
                <tr
                  key={candidate.id}
                  className="dashboard-candidate-row"
                  onClick={() => setSelectedCandidate(candidate)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{candidate.fullName || "Not provided"}</td>

                  <td>
                    {candidate.appliedRole || "Not provided"}
                  </td>

                  <td>{formatTime(candidate.examTime)}</td>

                  <td>
                    {candidate.assignedEmployeeId || "Not assigned"}
                  </td>

                  <td>{formatStatus(candidate)}</td>
                </tr>
              ))}

              {todaysCandidates.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No candidates scheduled for today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Candidate details modal */}
      <CandidateModal
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
      />
    </>
  );
}

export default Dashboard;