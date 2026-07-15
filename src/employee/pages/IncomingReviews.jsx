import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  FaEye,
  FaCheckCircle,
  FaTimes,
  FaUser,
  FaBriefcase,
  FaCalendarAlt,
  FaUserTie,
  FaExclamationCircle,
  FaInbox,
} from "react-icons/fa";

import reviewsData from "../data/reviewsData.json";
import "./IncomingReviews.css";

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star-btn ${star <= (hover || value) ? "active" : ""}`}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function ReviewDetailModal({ review, onClose, onSubmitReview }) {
  const [tab, setTab] = useState("details");
  const [form, setForm] = useState({
    technical: 0,
    communication: 0,
    problemSolving: 0,
    teamFit: 0,
    strengths: "",
    improvements: "",
    comments: "",
    approval: "",
    overallRating: 0,
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!form.approval || form.overallRating === 0) {
      alert("Please provide an overall rating and decision before submitting.");
      return;
    }
    onSubmitReview(review.id, form);
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="ir-modal-overlay" onClick={onClose}>
      <div
        className="ir-modal"
        onClick={(e) => e.stopPropagation()}
        id={`review-modal-${review.id}`}
      >
        {/* Modal Header */}
        <div className="ir-modal-header">
          <div className="ir-modal-title-group">
            <div className="ir-modal-avatar">
              {review.candidateName.charAt(0)}
            </div>
            <div>
              <h2>{review.candidateName}</h2>
              <p>
                {review.candidateRole} ·{" "}
                <span className="ir-type-badge">{review.interviewType}</span>
              </p>
            </div>
          </div>
          <button className="ir-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Tabs */}
        <div className="ir-modal-tabs">
          <button
            className={tab === "details" ? "ir-tab active" : "ir-tab"}
            onClick={() => setTab("details")}
          >
            Candidate Info
          </button>
          <button
            className={tab === "review" ? "ir-tab active" : "ir-tab"}
            onClick={() => setTab("review")}
          >
            Write Review
          </button>
        </div>

        <div className="ir-modal-body">
          {/* Details Tab */}
          {tab === "details" && (
            <div className="ir-details">
              <div className="ir-info-grid">
                <div className="ir-info-item">
                  <FaUser className="ir-info-icon" />
                  <div>
                    <span>Assigned By</span>
                    <strong>{review.assignedBy}</strong>
                  </div>
                </div>
                <div className="ir-info-item">
                  <FaCalendarAlt className="ir-info-icon" />
                  <div>
                    <span>Scheduled Date</span>
                    <strong>
                      {new Date(review.scheduledDate).toLocaleDateString(
                        "en-IN",
                        { day: "numeric", month: "long", year: "numeric" }
                      )}{" "}
                      · {review.scheduledTime}
                    </strong>
                  </div>
                </div>
                <div className="ir-info-item">
                  <FaBriefcase className="ir-info-icon" />
                  <div>
                    <span>Priority</span>
                    <strong>
                      <span
                        className={`ir-priority ir-priority-${review.priority.toLowerCase()}`}
                      >
                        {review.priority}
                      </span>
                    </strong>
                  </div>
                </div>
                <div className="ir-info-item">
                  <FaUserTie className="ir-info-icon" />
                  <div>
                    <span>Email</span>
                    <strong>{review.candidateEmail}</strong>
                  </div>
                </div>
              </div>

              <div className="ir-skills">
                <h4>Skills</h4>
                <div className="ir-skill-tags">
                  {review.skills.map((skill, i) => (
                    <span key={i} className="ir-skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="ir-previous-scores">
                <h4>Previous Round Scores</h4>
                <div className="ir-scores-row">
                  <div className="ir-score-box">
                    <div
                      className="ir-score-ring"
                      style={{
                        background: `conic-gradient(#2563eb ${review.previousScores.round1}%, #e2e8f0 0)`,
                      }}
                    >
                      <span>{review.previousScores.round1}%</span>
                    </div>
                    <p>Round 1</p>
                  </div>
                  <div className="ir-score-box">
                    <div
                      className="ir-score-ring"
                      style={{
                        background: `conic-gradient(#16a34a ${review.previousScores.round2}%, #e2e8f0 0)`,
                      }}
                    >
                      <span>{review.previousScores.round2}%</span>
                    </div>
                    <p>Round 2</p>
                  </div>
                </div>
              </div>

              <div className="ir-modal-actions">
                <button
                  className="ir-btn ir-btn-primary"
                  onClick={() => setTab("review")}
                >
                  Proceed to Review →
                </button>
              </div>
            </div>
          )}

          {/* Review Tab */}
          {tab === "review" && (
            <div className="ir-review-form">
              {submitted ? (
                <div className="ir-success">
                  <FaCheckCircle />
                  <h3>Review Submitted!</h3>
                  <p>Your review has been recorded successfully.</p>
                </div>
              ) : (
                <>
                  <h3 className="ir-form-section-title">Rate the Candidate</h3>
                  <div className="ir-rating-grid">
                    <div className="ir-rating-item">
                      <label>Technical Skills</label>
                      <StarRating
                        value={form.technical}
                        onChange={(v) => setForm({ ...form, technical: v })}
                      />
                    </div>
                    <div className="ir-rating-item">
                      <label>Communication</label>
                      <StarRating
                        value={form.communication}
                        onChange={(v) => setForm({ ...form, communication: v })}
                      />
                    </div>
                    <div className="ir-rating-item">
                      <label>Problem Solving</label>
                      <StarRating
                        value={form.problemSolving}
                        onChange={(v) =>
                          setForm({ ...form, problemSolving: v })
                        }
                      />
                    </div>
                    <div className="ir-rating-item">
                      <label>Team Fit</label>
                      <StarRating
                        value={form.teamFit}
                        onChange={(v) => setForm({ ...form, teamFit: v })}
                      />
                    </div>
                  </div>

                  <div className="ir-form-group">
                    <label>Overall Rating</label>
                    <StarRating
                      value={form.overallRating}
                      onChange={(v) => setForm({ ...form, overallRating: v })}
                    />
                  </div>

                  <div className="ir-form-group">
                    <label>Strengths</label>
                    <textarea
                      placeholder="What are the candidate's key strengths?"
                      value={form.strengths}
                      onChange={(e) =>
                        setForm({ ...form, strengths: e.target.value })
                      }
                      rows={3}
                    />
                  </div>

                  <div className="ir-form-group">
                    <label>Areas for Improvement</label>
                    <textarea
                      placeholder="What can the candidate improve on?"
                      value={form.improvements}
                      onChange={(e) =>
                        setForm({ ...form, improvements: e.target.value })
                      }
                      rows={3}
                    />
                  </div>

                  <div className="ir-form-group">
                    <label>Additional Comments</label>
                    <textarea
                      placeholder="Any additional notes or comments..."
                      value={form.comments}
                      onChange={(e) =>
                        setForm({ ...form, comments: e.target.value })
                      }
                      rows={3}
                    />
                  </div>

                  <div className="ir-form-group">
                    <label>Your Decision</label>
                    <div className="ir-decision-btns">
                      {[
                        "Strongly Recommend",
                        "Recommend",
                        "Hold",
                        "Do Not Recommend",
                      ].map((opt) => (
                        <button
                          key={opt}
                          className={`ir-decision-btn ${
                            form.approval === opt ? "selected" : ""
                          } ir-decision-${opt
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                          onClick={() => setForm({ ...form, approval: opt })}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="ir-modal-actions">
                    <button className="ir-btn ir-btn-cancel" onClick={onClose}>
                      Cancel
                    </button>
                    <button
                      className="ir-btn ir-btn-submit"
                      onClick={handleSubmit}
                    >
                      <FaCheckCircle /> Submit Review
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function IncomingReviews() {
  const location = useLocation();
  // Read filter passed from dashboard navigation state (e.g. { state: { filter: "Pending" } })
  const initialFilter = location.state?.filter || "All";

  const [reviews, setReviews] = useState(reviewsData.incomingReviews);
  const [selectedReview, setSelectedReview] = useState(null);
  const [filterStatus, setFilterStatus] = useState(initialFilter);

  const handleSubmitReview = (id, formData) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "Completed",
              myRating: formData.overallRating,
              myComments: formData.comments,
              myApproval: formData.approval,
            }
          : r
      )
    );
  };

  const handleApprove = (id) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Approved" } : r))
    );
  };

  const filtered =
    filterStatus === "All"
      ? reviews
      : reviews.filter((r) => r.status === filterStatus);

  return (
    <div className="ir-page">
      {/* Page Header */}
      <div className="ir-page-header">
        <div>
          <h1>
            <FaInbox /> Incoming Reviews
          </h1>
          <p>
            Reviews assigned to you for evaluation. Click "Write Review" to
            submit your assessment.
          </p>
        </div>
        <div className="ir-header-stats">
          <span className="ir-hstat ir-hstat-blue">
            {reviews.filter((r) => r.status === "Pending").length} Pending
          </span>
          <span className="ir-hstat ir-hstat-orange">
            {reviews.filter((r) => r.status === "Scheduled").length} Scheduled
          </span>
          <span className="ir-hstat ir-hstat-green">
            {reviews.filter((r) => r.status === "Completed").length} Completed
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="ir-filter-row">
        {["All", "Pending", "Scheduled", "Completed"].map((status) => (
          <button
            key={status}
            className={`ir-filter-btn ${
              filterStatus === status ? "active" : ""
            }`}
            onClick={() => setFilterStatus(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Review Cards */}
      <div className="ir-cards-grid">
        {filtered.length === 0 ? (
          <div className="ir-empty">
            <FaExclamationCircle />
            <p>No reviews found for selected filter.</p>
          </div>
        ) : (
          filtered.map((review) => (
            <div key={review.id} className="ir-card" id={`ir-card-${review.id}`}>
              <div className="ir-card-top">
                <div className="ir-card-avatar">
                  {review.candidateName.charAt(0)}
                </div>
                <div className="ir-card-info">
                  <h3>{review.candidateName}</h3>
                  <p>{review.candidateRole}</p>
                  <div className="ir-card-tags">
                    <span className="ir-tag-type">{review.interviewType}</span>
                    <span
                      className={`ir-priority ir-priority-${review.priority.toLowerCase()}`}
                    >
                      {review.priority}
                    </span>
                  </div>
                </div>
                <span
                  className={`ir-status ir-status-${review.status.toLowerCase()}`}
                >
                  {review.status}
                </span>
              </div>

              <div className="ir-card-meta">
                <div className="ir-meta-item">
                  <FaCalendarAlt />
                  <span>
                    {new Date(review.scheduledDate).toLocaleDateString(
                      "en-IN",
                      { day: "numeric", month: "short" }
                    )}{" "}
                    · {review.scheduledTime}
                  </span>
                </div>
                <div className="ir-meta-item">
                  <FaUser />
                  <span>Assigned by {review.assignedBy}</span>
                </div>
              </div>

              <div className="ir-card-skills">
                {review.skills.slice(0, 3).map((skill, i) => (
                  <span key={i} className="ir-skill-chip">
                    {skill}
                  </span>
                ))}
                {review.skills.length > 3 && (
                  <span className="ir-skill-chip ir-skill-more">
                    +{review.skills.length - 3}
                  </span>
                )}
              </div>

              <div className="ir-card-actions">
                <button
                  className="ir-card-btn ir-view-btn"
                  onClick={() => setSelectedReview(review)}
                  id={`view-btn-${review.id}`}
                >
                  <FaEye /> View & Review
                </button>
                {review.status === "Pending" && (
                  <button
                    className="ir-card-btn ir-approve-btn"
                    onClick={() => handleApprove(review.id)}
                    id={`approve-btn-${review.id}`}
                  >
                    <FaCheckCircle /> Quick Approve
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Review Modal */}
      {selectedReview && (
        <ReviewDetailModal
          review={selectedReview}
          onClose={() => setSelectedReview(null)}
          onSubmitReview={handleSubmitReview}
        />
      )}
    </div>
  );
}

export default IncomingReviews;
