import { useState } from "react";
import {
  FaClipboardList,
  FaEye,
  FaTimes,
  FaStar,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import reviewsData from "../data/reviewsData.json";
import "./MyReviews.css";

function MyReviewDetailModal({ review, onClose }) {
  return (
    <div className="mr-overlay" onClick={onClose}>
      <div
        className="mr-modal"
        onClick={(e) => e.stopPropagation()}
        id={`mr-modal-${review.id}`}
      >
        <div className="mr-modal-header">
          <div>
            <h2>{review.candidateName}</h2>
            <p>{review.candidateRole}</p>
          </div>
          <button className="mr-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="mr-modal-body">
          {/* Decision badge */}
          <div className="mr-decision-banner">
            <div
              className={`mr-decision-badge ${
                review.myApproval === "Strongly Recommend"
                  ? "mr-strong"
                  : review.myApproval === "Recommend"
                  ? "mr-recommend"
                  : review.myApproval === "Hold"
                  ? "mr-hold"
                  : "mr-reject"
              }`}
            >
              {review.status === "Approved" ? (
                <FaCheckCircle />
              ) : (
                <FaTimesCircle />
              )}
              {review.myApproval}
            </div>
          </div>

          {/* Ratings */}
          <div className="mr-ratings-section">
            <h3>Ratings Breakdown</h3>
            <div className="mr-rating-bars">
              {[
                { label: "Technical", val: review.technical },
                { label: "Communication", val: review.communication },
                { label: "Problem Solving", val: review.problemSolving },
                { label: "Team Fit", val: review.teamFit },
              ].map((item) => (
                <div key={item.label} className="mr-rating-bar-row">
                  <span className="mr-bar-label">{item.label}</span>
                  <div className="mr-bar-track">
                    <div
                      className="mr-bar-fill"
                      style={{ width: `${(item.val / 5) * 100}%` }}
                    />
                  </div>
                  <span className="mr-bar-val">{item.val}/5</span>
                </div>
              ))}
            </div>
          </div>

          {/* Overall */}
          <div className="mr-overall-section">
            <span>Overall Rating: </span>
            <div className="mr-stars">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={i < review.myRating ? "star-filled" : "star-empty"}
                />
              ))}
            </div>
            <strong>{review.myRating}/5</strong>
          </div>

          {/* Text sections */}
          <div className="mr-text-sections">
            <div className="mr-text-block">
              <h4>💪 Strengths</h4>
              <p>{review.strengths}</p>
            </div>
            <div className="mr-text-block">
              <h4>📈 Areas for Improvement</h4>
              <p>{review.improvements}</p>
            </div>
            <div className="mr-text-block">
              <h4>💬 My Comments</h4>
              <p>{review.myComments}</p>
            </div>
          </div>

          <div className="mr-meta">
            <span>Reviewed on {new Date(review.reviewedDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
            <span>Assigned by {review.assignedBy}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MyReviews() {
  const myReviews = reviewsData.reviewHistory.filter((r) => r.type === "given");
  const [selected, setSelected] = useState(null);

  return (
    <div className="mr-page">
      <div className="mr-page-header">
        <div>
          <h1>
            <FaClipboardList /> My Reviews
          </h1>
          <p>Reviews you've written and submitted for candidates.</p>
        </div>
        <div className="mr-count-badge">{myReviews.length} Reviews Given</div>
      </div>

      <div className="mr-cards-grid">
        {myReviews.map((review) => (
          <div key={review.id} className="mr-card" id={`mr-card-${review.id}`}>
            <div className="mr-card-header">
              <div className="mr-card-avatar">
                {review.candidateName.charAt(0)}
              </div>
              <div className="mr-card-title">
                <h3>{review.candidateName}</h3>
                <p>{review.candidateRole}</p>
              </div>
              <span
                className={`mr-status mr-status-${review.status.toLowerCase()}`}
              >
                {review.status}
              </span>
            </div>

            <div className="mr-card-stars">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={
                    i < review.myRating ? "star-filled" : "star-empty"
                  }
                />
              ))}
              <span>{review.myRating}/5</span>
            </div>

            <div
              className={`mr-approval-tag mr-approval-${review.myApproval
                .toLowerCase()
                .replace(/\s+/g, "-")}`}
            >
              {review.myApproval}
            </div>

            <p className="mr-card-comment">"{review.myComments}"</p>

            <div className="mr-card-footer">
              <span className="mr-reviewed-date">
                {new Date(review.reviewedDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <button
                className="mr-view-btn"
                onClick={() => setSelected(review)}
                id={`mr-view-${review.id}`}
              >
                <FaEye /> View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <MyReviewDetailModal
          review={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

export default MyReviews;
