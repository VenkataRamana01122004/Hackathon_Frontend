import {
  FaEye,
  FaFilePdf,
  FaCalendarAlt,
  FaUserTag,
} from "react-icons/fa";

import "./CandidateTable.css";
import CandidateQuestionModal from "./CandidateQuestionModal";
import { useEffect, useState } from "react";
import axios from "axios";


function CandidateScheduleTable({
  candidates,
  onView,
  onResume,
  onSchedule,
  showScores = false,
  showAssignRole = false,
  onAssignRole,
}) {
  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN");
  };

  const formatTime = (time) => {
    if (!time) return "-";

    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0, 0);

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const [showQuestionModal, setShowQuestionModal] = useState(false);
const [selectedCandidate, setSelectedCandidate] = useState(null);

const handleSchedule = (candidate) => {
  setSelectedCandidate(candidate);
  setShowQuestionModal(true);
};

  return (
    <div className="list-card candidate-table-card">
      <table className="candidate-table">
        <thead>
          <tr>
            <th>Candidate</th>
            <th>Applied Role</th>
            <th>Experience</th>
            <th>Schedule Type</th>
            <th>Exam Date</th>
            <th>Exam Time</th>

            {showScores && <th>Bot Score</th>}
            {showScores && <th>Technical</th>}

            {showAssignRole && <th>Assigned Role</th>}

            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {candidates.length > 0 ? (
            candidates.map((candidate) => (
              <tr key={candidate.id}>
                <td>
                  <div className="candidate-details">
                    <div className="candidate-name">
                      {candidate.fullName}
                    </div>
                    <div className="candidate-email">
                      {candidate.email}
                    </div>
                  </div>
                </td>

                <td>{candidate.appliedRole || "-"}</td>
                <td>{candidate.experience || "-"}</td>

                {/* <td>
                  <span
                    className={`status ${
                      candidate.isRandomSchedule
                        ? "scheduled":"random-schedule"
                    }`}
                  >
                    {candidate.isRandomSchedule
                      ? "Scheduled"
                      : "Random"}
                  </span>
                </td> */}


<td className="schedule-action-cell">
  {candidate.isRandomSchedule ? (
    <button
      type="button"
      className="schedule-questions-btn"
      onClick={() => handleSchedule(candidate)}
      title="Assign interview questions"
    >
      <FaCalendarAlt />
      <span>Assign Questions</span>
    </button>
  ) : (
    <span className="status random-schedule">
      <span className="random-dot"></span>
      Auto
    </span>
  )}
</td>

                <td>{formatDate(candidate.examDate)}</td>
                <td>{formatTime(candidate.examTime)}</td>

                {showScores && (
                  <td>
                    <span className="score">
                      {candidate.botScore ?? "-"}
                    </span>
                  </td>
                )}

                {showScores && (
                  <td>
                    <span className="score">
                      {candidate.technicalScore ?? "-"}
                    </span>
                  </td>
                )}

                {showAssignRole && (
                  <td>
                    {candidate.assignedRole ? (
                      <span className="assigned-role">
                        {candidate.assignedRole}
                      </span>
                    ) : (
                      <button
                        className="assign-role-btn"
                        onClick={() => onAssignRole(candidate)}
                      >
                        <FaUserTag />
                        Assign
                      </button>
                    )}
                  </td>
                )}

                <td>
                  <div className="action-buttons">
                    <button
                      className="view-btn"
                      onClick={() => onView(candidate)}
                      title="View"
                    >
                      <FaEye />
                    </button>

                    <button
                      className="schedule-btn"
                      onClick={() => onSchedule(candidate)}
                      title="Schedule"
                    >
                      <FaCalendarAlt />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={
                  7 +
                  (showScores ? 2 : 0) +
                  (showAssignRole ? 1 : 0)
                }
                className="no-data"
              >
                No candidates found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {showQuestionModal && selectedCandidate && (
  <CandidateQuestionModal
    candidate={selectedCandidate}
    onClose={() => {
      setShowQuestionModal(false);
      setSelectedCandidate(null);
    }}
    onSave={async (assignment) => {
      await axios.post(
        "http://localhost:5000/api/manager/assignCandidateQuestions",
        assignment
      );
    }}
  />
)}
    </div>
  );
}

export default CandidateScheduleTable;