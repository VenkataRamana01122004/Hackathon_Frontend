import {
  FaCalendarAlt,
  FaClock,
  FaUserTie,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaVideo,
} from "react-icons/fa";
import reviewsData from "../data/reviewsData.json";
import "./ScheduledReviews.css";

function ScheduledReviews() {
  const reviews = reviewsData.incomingReviews;

  // Group by date
  const grouped = reviews.reduce((acc, review) => {
    const date = review.scheduledDate;
    if (!acc[date]) acc[date] = [];
    acc[date].push(review);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="sr-page">
      <div className="sr-page-header">
        <div>
          <h1>
            <FaCalendarAlt /> Scheduled Reviews
          </h1>
          <p>Your upcoming interview schedule and review calendar.</p>
        </div>
        <div className="sr-total-badge">
          {reviews.length} Total Scheduled
        </div>
      </div>

      {/* Calendar-like grouped view */}
      <div className="sr-timeline">
        {sortedDates.map((date) => {
          const dateObj = new Date(date);
          const isToday =
            new Date().toDateString() === dateObj.toDateString();
          const isPast = dateObj < new Date();

          return (
            <div key={date} className="sr-date-group">
              <div className={`sr-date-label ${isToday ? "today" : isPast ? "past" : ""}`}>
                <div className="sr-date-day">
                  {dateObj.getDate()}
                </div>
                <div className="sr-date-info">
                  <span className="sr-date-month">
                    {dateObj.toLocaleDateString("en-IN", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <span className="sr-date-weekday">
                    {dateObj.toLocaleDateString("en-IN", { weekday: "long" })}
                    {isToday && <span className="sr-today-tag">Today</span>}
                  </span>
                </div>
              </div>

              <div className="sr-day-cards">
                {grouped[date].map((review) => (
                  <div key={review.id} className="sr-card" id={`sr-card-${review.id}`}>
                    <div className="sr-card-time">
                      <FaClock />
                      <span>{review.scheduledTime}</span>
                    </div>

                    <div className="sr-card-divider" />

                    <div className="sr-card-content">
                      <div className="sr-card-avatar">
                        {review.candidateName.charAt(0)}
                      </div>
                      <div className="sr-card-info">
                        <h3>{review.candidateName}</h3>
                        <p>{review.candidateRole}</p>
                        <div className="sr-card-tags">
                          <span className="sr-tag-interview">
                            {review.interviewType}
                          </span>
                          <span
                            className={`sr-priority sr-priority-${review.priority.toLowerCase()}`}
                          >
                            {review.priority} Priority
                          </span>
                        </div>
                      </div>
                      <div className="sr-card-right">
                        <div className="sr-meta-row">
                          <FaUserTie />
                          <span>Assigned by {review.assignedBy}</span>
                        </div>
                        <div className="sr-meta-row">
                          <FaVideo />
                          <span>Online Interview</span>
                        </div>
                        <span
                          className={`sr-status sr-status-${review.status.toLowerCase()}`}
                        >
                          {review.status}
                        </span>
                      </div>
                    </div>

                    <div className="sr-skills-row">
                      {review.skills.map((skill, i) => (
                        <span key={i} className="sr-skill-tag">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ScheduledReviews;
