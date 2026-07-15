import { useState } from "react";
import {
  FaHistory,
  FaSearch,
  FaEye,
  FaTimes,
  FaCheckCircle,
  FaTimesCircle,
  FaStar,
  FaFilter,
} from "react-icons/fa";
import reviewsData from "../data/reviewsData.json";
import "./ReviewHistory.css";

function HistoryModal({ review, onClose }) {
  return (
    <div className="rh-overlay" onClick={onClose}>
      <div
        className="rh-modal"
        onClick={(e) => e.stopPropagation()}
        id={`rh-modal-${review.id}`}
      >
        <div className="rh-modal-top">
          <div className="rh-modal-title">
            <div className="rh-modal-avatar">
              {review.candidateName.charAt(0)}
            </div>
            <div>
              <h2>{review.candidateName}</h2>
              <p>
                {review.candidateRole} ·{" "}
                <span className="rh-modal-type">{review.type === "given" ? "Review Given" : "Approved by me"}</span>
              </p>
            </div>
          </div>
          <button className="rh-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="rh-modal-body">
          <div className="rh-info-row">
            <div className="rh-info-chip">
              <span>Assigned By</span>
              <strong>{review.assignedBy}</strong>
            </div>
            <div className="rh-info-chip">
              <span>Reviewed On</span>
              <strong>
                {new Date(review.reviewedDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </strong>
            </div>
            <div className="rh-info-chip">
              <span>Final Status</span>
              <strong
                className={`rh-status rh-status-${review.status.toLowerCase()}`}
              >
                {review.status === "Approved" ? <FaCheckCircle /> : <FaTimesCircle />}
                {review.status}
              </strong>
            </div>
          </div>

          <div className="rh-ratings">
            <h4>Ratings</h4>
            <div className="rh-rating-grid">
              {[
                { label: "Technical", val: review.technical },
                { label: "Communication", val: review.communication },
                { label: "Problem Solving", val: review.problemSolving },
                { label: "Team Fit", val: review.teamFit },
              ].map((item) => (
                <div key={item.label} className="rh-rating-cell">
                  <div
                    className="rh-rating-circle"
                    style={{
                      background: `conic-gradient(#2563eb ${(item.val / 5) * 100}%, #e2e8f0 0)`,
                    }}
                  >
                    <span>{item.val}</span>
                  </div>
                  <p>{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rh-overall">
            <span>My Overall Rating:</span>
            <div className="rh-stars">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={i < review.myRating ? "rh-star-on" : "rh-star-off"}
                />
              ))}
            </div>
            <strong>{review.myRating}/5</strong>
          </div>

          <div className="rh-texts">
            <div className="rh-text-box">
              <h4>💪 Strengths</h4>
              <p>{review.strengths}</p>
            </div>
            <div className="rh-text-box">
              <h4>📈 Improvements</h4>
              <p>{review.improvements}</p>
            </div>
            <div className="rh-text-box">
              <h4>💬 Comments</h4>
              <p>{review.myComments}</p>
            </div>
          </div>

          <div
            className={`rh-decision-badge rh-decision-${review.myApproval
              .toLowerCase()
              .replace(/\s+/g, "-")}`}
          >
            My Decision: {review.myApproval}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewHistory() {
  const allHistory = reviewsData.reviewHistory;
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [selected, setSelected] = useState(null);

  const filtered = allHistory.filter((item) => {
    const matchSearch =
      item.candidateName.toLowerCase().includes(search.toLowerCase()) ||
      item.candidateRole.toLowerCase().includes(search.toLowerCase());
    const matchType =
      filterType === "All" ||
      (filterType === "Given" && item.type === "given") ||
      (filterType === "Approved" && item.type === "approved");
    const matchStatus =
      filterStatus === "All" || item.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  return (
    <div className="rh-page">
      <div className="rh-page-header">
        <div>
          <h1>
            <FaHistory /> Review History
          </h1>
          <p>
            Complete history of all reviews — given, approved, and past
            evaluations.
          </p>
        </div>
        <div className="rh-stats-row">
          <div className="rh-stat">
            <span>{allHistory.length}</span>
            <p>Total</p>
          </div>
          <div className="rh-stat rh-stat-green">
            <span>{allHistory.filter((r) => r.status === "Approved").length}</span>
            <p>Approved</p>
          </div>
          <div className="rh-stat rh-stat-red">
            <span>{allHistory.filter((r) => r.status === "Rejected").length}</span>
            <p>Rejected</p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="rh-controls">
        <div className="rh-search-box">
          <FaSearch className="rh-search-icon" />
          <input
            type="text"
            placeholder="Search by candidate name or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="rh-search-input"
          />
        </div>
        <div className="rh-filters">
          <div className="rh-filter-group">
            <FaFilter />
            {["All", "Given", "Approved"].map((t) => (
              <button
                key={t}
                className={`rh-filter-btn ${filterType === t ? "active" : ""}`}
                onClick={() => setFilterType(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="rh-filter-group">
            {["All", "Approved", "Rejected"].map((s) => (
              <button
                key={s}
                className={`rh-filter-btn ${filterStatus === s ? "active" : ""} rh-filter-${s.toLowerCase()}`}
                onClick={() => setFilterStatus(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rh-table-wrapper">
        <table className="rh-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Candidate</th>
              <th>Role</th>
              <th>Type</th>
              <th>Reviewed On</th>
              <th>My Rating</th>
              <th>My Decision</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="rh-empty-row">
                  No records found.
                </td>
              </tr>
            ) : (
              filtered.map((item, idx) => (
                <tr key={item.id} id={`rh-row-${item.id}`}>
                  <td className="rh-idx">{idx + 1}</td>
                  <td>
                    <div className="rh-candidate-cell">
                      <div className="rh-mini-avatar">
                        {item.candidateName.charAt(0)}
                      </div>
                      {item.candidateName}
                    </div>
                  </td>
                  <td>{item.candidateRole}</td>
                  <td>
                    <span
                      className={`rh-type-badge ${
                        item.type === "given" ? "rh-type-given" : "rh-type-approved"
                      }`}
                    >
                      {item.type === "given" ? "Given" : "Approved"}
                    </span>
                  </td>
                  <td>
                    {new Date(item.reviewedDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td>
                    <div className="rh-table-stars">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className={
                            i < item.myRating ? "rh-star-on" : "rh-star-off"
                          }
                        />
                      ))}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`rh-approval rh-approval-${item.myApproval
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {item.myApproval}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`rh-status rh-status-${item.status.toLowerCase()}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="rh-view-btn"
                      onClick={() => setSelected(item)}
                      id={`rh-view-${item.id}`}
                    >
                      <FaEye />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <HistoryModal review={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

export default ReviewHistory;
