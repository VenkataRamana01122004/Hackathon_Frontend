import { useState } from "react";
import {
  FaTimes,
  FaCalendarAlt,
  FaClock,
} from "react-icons/fa";
import axios from "axios";
import "./ScheduleModal.css";

function ScheduleModal({ candidate, onClose, onSchedule }) {
  const [date, setDate] = useState(candidate?.examDate || "");
  const [time, setTime] = useState(candidate?.examTime || "");
  const [loading, setLoading] = useState(false);
  const [isRandomSchedule, setIsRandomSchedule] = useState(
  candidate?.isRandomSchedule ?? false
);

  if (!candidate) return null;

  const scheduleInterview = async () => {
    if (!isRandomSchedule && (!date || !time)) {
  alert("Please select both date and time.");
  return;
}

    try {
      setLoading(true);

      await onSchedule({
  ...candidate,
  examDate: date,
  examTime: time,
  isRandomSchedule,
});

setDate("");
setTime("");
setIsRandomSchedule(false);

      alert(`Interview scheduled successfully for ${candidate.fullName}`);
      onClose();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to schedule interview."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="schedule-overlay">
      <div className="schedule-modal">
        <div className="schedule-header">
          <h2>Schedule Interview</h2>
          <button onClick={onClose} disabled={loading}>
            <FaTimes />
          </button>
        </div>

        <div className="candidate-box">
          <h3>{candidate.fullName}</h3>
          <p>
            {candidate.isRandomSchedule
              ? "Random Schedule"
              : "Manual Schedule"}
          </p>
        </div>

        <div className="form-grid">
          <div className="input-group">
            <label>
              <FaCalendarAlt /> Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>
              <FaClock /> Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
          <div className="input-group random-checkbox">
  <label>
    <input
      type="checkbox"
      checked={isRandomSchedule}
      onChange={(e) => setIsRandomSchedule(e.target.checked)}
      disabled={loading}
    />
    Schedule Questions
  </label>
</div>
        </div>

        <div className="schedule-footer">
          <button
            className="schedule-save"
            onClick={scheduleInterview}
            disabled={loading}
          >
            {loading ? "Saving..." : "Schedule Interview"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ScheduleModal;