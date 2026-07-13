import {
  FaEye,
  FaFilePdf,
  FaCalendarAlt,
  FaUserTag
} from "react-icons/fa";

import "./CandidateTable.css";

function CandidateTable({
  candidates,

  onView,
  onResume,
  onSchedule,

  showScores = false,
  showAssignRole = false,

  onAssignRole,

}) {

  return (

    <div className="candidate-table-card">

      <table className="candidate-table">

        <thead>

          <tr>

            <th>Candidate</th>

            <th>Applied Role</th>

            <th>Experience</th>

            {showScores && <th>Bot Score</th>}

            {showScores && <th>Technical</th>}

            <th>Status</th>

            {showAssignRole && <th>Assigned Role</th>}

            <th>Actions</th>

          </tr>

        </thead>

        <tbody>

          {candidates.map((candidate) => (

            <tr key={candidate.id}>

              <td>

                <div className="candidate-info">

                  <div className="candidate-avatar">

                    {candidate.name.charAt(0)}

                  </div>

                  <div>

                    <h4>{candidate.name}</h4>

                    <span>{candidate.email}</span>

                  </div>

                </div>

              </td>

              <td>

                {candidate.role}

              </td>

              <td>

                {candidate.experience}

              </td>

              {showScores && (

                <td>

                  <span className="score">

                    {candidate.botScore}

                  </span>

                </td>

              )}

              {showScores && (

                <td>

                  <span className="score">

                    {candidate.technicalScore}

                  </span>

                </td>

              )}

              <td>

                <span
                  className={`status ${candidate.status
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                >

                  {candidate.status}

                </span>

              </td>

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

                      Assign Role

                    </button>

                  )}

                </td>

              )}

              <td>

                <div className="action-buttons">

                  <button
                    className="view-btn"
                    onClick={() => onView(candidate)}
                    title="View Details"
                  >

                    <FaEye />

                  </button>

                  <button
                    className="resume-btn"
                    onClick={() => onResume(candidate)}
                    title="Resume"
                  >

                    <FaFilePdf />

                  </button>

                  <button
                    className="schedule-btn"
                    onClick={() => onSchedule(candidate)}
                    title="Schedule Interview"
                  >

                    <FaCalendarAlt />

                  </button>

                </div>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

}

export default CandidateTable;