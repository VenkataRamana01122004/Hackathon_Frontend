import { getProfile } from "./utils/profile.js";
import "./candidate.css";

const normalizeStatus = (value) => String(value || "pending").trim().toLowerCase();

const isCompletedStatus = (status) =>
  ["process", "passed", "completed", "submitted", "qualified"].includes(status);

const displayStatus = (status, completed) =>
  completed ? "COMPLETED" : status.toUpperCase();

function initialsOf(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] || "").concat(parts.length > 1 ? parts[parts.length - 1][0] || "" : "").toUpperCase();
}

function CandidateProfile() {
  const user = (() => {
    try {
      const parsed = JSON.parse(localStorage.getItem("user") || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  })();

  const submission = getProfile();

  const rounds = [
    { label: "MCQ Assessment", status: normalizeStatus(user.bitsExamStatus) },
    { label: "Coding Assignment", status: normalizeStatus(user.codingExamStatus) },
    
  ];

  return (
    <div className="profile-shell">
      <div className="profile-card glass-panel glass-panel--elevated">
        <div className="profile-avatar">{initialsOf(user.fullName)}</div>
        <div>
          <h2 className="profile-name">{user.fullName || "Candidate"}</h2>
          <p className="profile-id">
            Candidate ID: <strong>{user.candidateId || "N/A"}</strong>
          </p>
          {user.email && <p className="profile-id">Email: <strong>{user.email}</strong></p>}
          {user.phone && <p className="profile-id">Phone: <strong>{user.phone}</strong></p>}
          {user.grade && <p className="profile-id">Grade: <strong>{user.grade}</strong></p>}
          {user.qualification && <p className="profile-id">Qualification: <strong>{user.qualification}</strong></p>}
        </div>
      </div>

      <div className="profile-section glass-panel">
        <h3 className="profile-section-title">Round Status</h3>
        <div className="profile-rounds">
          {rounds.map((round) => {
            const completed = isCompletedStatus(round.status);
            return (
              <div key={round.label} className="profile-round-row">
                <span>{round.label}</span>
                <span
                  className={`round-status ${
                    completed ? "round-status--done" : "round-status--pending"
                  }`}
                >
                  {displayStatus(round.status, completed)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

export default CandidateProfile;
