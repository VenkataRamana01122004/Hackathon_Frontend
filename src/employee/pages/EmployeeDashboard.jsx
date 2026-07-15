import {
  FaInbox,
  FaCalendarAlt,
  FaClipboardList,
  FaCheckCircle,
  FaArrowRight,
  FaClock,
  FaUserTie,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import EmpStatCard from "../components/EmpStatCard";
import reviewsData from "../data/reviewsData.json";
import "./EmployeeDashboard.css";

function EmployeeDashboard() {
  const navigate = useNavigate();
  const { incomingReviews, nextCandidates, reviewHistory } = reviewsData;

  // Compute all stats from actual data — never use hardcoded numbers
  const pendingReviews = incomingReviews.filter((r) => r.status === "Pending");
  const scheduledReviews = incomingReviews.filter((r) => r.status === "Scheduled");
  const completedReviews = incomingReviews.filter((r) => r.status === "Completed");
  const totalReceived = incomingReviews.length;

  return (
    <div className="emp-dashboard">
      {/* Welcome Banner */}
      <div className="emp-welcome-banner">
        <div>
          <h1>Welcome back, Sreelakshmi! 👋</h1>
          <p>Here's an overview of your review activities today.</p>
        </div>
        <div className="emp-welcome-date">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Stat Cards — values computed from real data */}
      <div className="emp-dashboard-cards">
        <EmpStatCard
          title="Reviews Received"
          value={totalReceived}
          icon={<FaInbox />}
          color="#2563EB"
          subtitle="Total assigned to you"
          onClick={() => navigate("/employee/incoming-reviews", { state: { filter: "All" } })}
        />
        <EmpStatCard
          title="Pending Reviews"
          value={pendingReviews.length}
          icon={<FaClock />}
          color="#F59E0B"
          subtitle="Awaiting your action"
          onClick={() => navigate("/employee/incoming-reviews", { state: { filter: "Pending" } })}
        />
        <EmpStatCard
          title="Scheduled Reviews"
          value={scheduledReviews.length}
          icon={<FaCalendarAlt />}
          color="#EA580C"
          subtitle="Upcoming interviews"
          onClick={() => navigate("/employee/scheduled")}
        />
        <EmpStatCard
          title="Completed Reviews"
          value={reviewHistory.length}
          icon={<FaCheckCircle />}
          color="#16A34A"
          subtitle="Reviews submitted"
          onClick={() => navigate("/employee/history")}
        />
      </div>

      {/* Middle Row */}
      <div className="emp-dashboard-row">
        {/* Pending Reviews Quick View */}
        <div className="emp-dashboard-section emp-section-wide">
          <div className="emp-section-header">
            <h2>
              <FaInbox /> Pending Reviews
            </h2>
            <button
              className="emp-see-all-btn"
              onClick={() => navigate("/employee/incoming-reviews", { state: { filter: "Pending" } })}
            >
              See All <FaArrowRight />
            </button>
          </div>

          {pendingReviews.length === 0 ? (
            <div className="emp-empty-state">
              <p>🎉 No pending reviews! You're all caught up.</p>
            </div>
          ) : (
            <div className="emp-review-quick-list">
              {pendingReviews.map((review) => (
                <div key={review.id} className="emp-quick-card">
                  <div className="emp-quick-avatar">
                    {review.candidateName.charAt(0)}
                  </div>
                  <div className="emp-quick-info">
                    <h4>{review.candidateName}</h4>
                    <p>{review.candidateRole}</p>
                    <span className="emp-tag emp-tag-type">
                      {review.interviewType}
                    </span>
                  </div>
                  <div className="emp-quick-meta">
                    <span
                      className={`emp-priority emp-priority-${review.priority.toLowerCase()}`}
                    >
                      {review.priority}
                    </span>
                    <span className="emp-assigned-by">
                      Assigned by {review.assignedBy}
                    </span>
                  </div>
                  <button
                    className="emp-action-btn"
                    onClick={() => navigate("/employee/incoming-reviews", { state: { filter: "Pending" } })}
                  >
                    Review <FaArrowRight />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Next Candidates */}
        <div className="emp-dashboard-section emp-section-narrow">
          <div className="emp-section-header">
            <h2>
              <FaUserTie /> Next Candidates
            </h2>
          </div>
          <div className="emp-next-candidates">
            {nextCandidates.map((candidate, idx) => (
              <div key={candidate.id} className="emp-candidate-item">
                <div
                  className="emp-candidate-num"
                  style={{
                    background:
                      idx === 0 ? "#2563EB" : idx === 1 ? "#EA580C" : "#16A34A",
                  }}
                >
                  {idx + 1}
                </div>
                <div className="emp-candidate-details">
                  <h4>{candidate.name}</h4>
                  <p>{candidate.role}</p>
                  <div className="emp-candidate-time">
                    <FaCalendarAlt />
                    <span>
                      {new Date(candidate.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}{" "}
                      · {candidate.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Next Assigned Reviews */}
      <div className="emp-dashboard-section">
        <div className="emp-section-header">
          <h2>
            <FaCalendarAlt /> Next Assigned Reviews
          </h2>
          <button
            className="emp-see-all-btn"
            onClick={() => navigate("/employee/scheduled")}
          >
            See All <FaArrowRight />
          </button>
        </div>
        <div className="emp-scheduled-list">
          {incomingReviews.slice(0, 3).map((review) => (
            <div key={review.id} className="emp-scheduled-item">
              <div className="emp-sched-date">
                <span className="emp-sched-day">
                  {new Date(review.scheduledDate).getDate()}
                </span>
                <span className="emp-sched-month">
                  {new Date(review.scheduledDate).toLocaleDateString("en-IN", {
                    month: "short",
                  })}
                </span>
              </div>
              <div className="emp-sched-info">
                <h4>{review.candidateName}</h4>
                <p>
                  {review.candidateRole} · {review.scheduledTime}
                </p>
                <span className="emp-tag emp-tag-type">
                  {review.interviewType}
                </span>
              </div>
              <span
                className={`emp-status emp-status-${review.status.toLowerCase()}`}
              >
                {review.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent History */}
      <div className="emp-dashboard-section">
        <div className="emp-section-header">
          <h2>
            <FaClipboardList /> Recent Review History
          </h2>
          <button
            className="emp-see-all-btn"
            onClick={() => navigate("/employee/history")}
          >
            See All <FaArrowRight />
          </button>
        </div>
        <table className="emp-history-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Role</th>
              <th>Reviewed Date</th>
              <th>My Rating</th>
              <th>Decision</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {reviewHistory.slice(0, 3).map((item) => (
              <tr key={item.id}>
                <td>{item.candidateName}</td>
                <td>{item.candidateRole}</td>
                <td>
                  {new Date(item.reviewedDate).toLocaleDateString("en-IN")}
                </td>
                <td>
                  <div className="emp-stars">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={i < item.myRating ? "star filled" : "star"}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  <span className="emp-tag">{item.myApproval}</span>
                </td>
                <td>
                  <span
                    className={`emp-status emp-status-${item.status.toLowerCase()}`}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EmployeeDashboard;
