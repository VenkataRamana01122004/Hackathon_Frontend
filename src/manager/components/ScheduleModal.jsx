import { useState } from "react";
import { FaTimes, FaCalendarAlt, FaClock, FaUserTie } from "react-icons/fa";
import "./ScheduleModal.css";

function ScheduleModal({ candidate, onClose }) {

  const [interviewer, setInterviewer] = useState("");
  const [round, setRound] = useState("Technical Round");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [mode, setMode] = useState("Google Meet");
  const [remarks, setRemarks] = useState("");

  if (!candidate) return null;

  const scheduleInterview = () => {

    alert(`Interview scheduled successfully for ${candidate.name}`);

    onClose();

  };

  return (

    <div className="schedule-overlay">

      <div className="schedule-modal">

        <div className="schedule-header">

          <h2>Schedule Interview</h2>

          <button onClick={onClose}>
            <FaTimes />
          </button>

        </div>

        <div className="candidate-box">

          <h3>{candidate.name}</h3>

          <p>{candidate.role}</p>

        </div>

        <div className="form-grid">

          <div className="input-group">

            <label>

              <FaUserTie />

              Interviewer

            </label>

            <select
              value={interviewer}
              onChange={(e)=>setInterviewer(e.target.value)}
            >
              <option value="">Select Interviewer</option>
              <option>Rahul Verma</option>
              <option>Anjali Reddy</option>
              <option>Suresh Kumar</option>
              <option>Monisha</option>
            </select>

          </div>

          <div className="input-group">

            <label>Interview Round</label>

            <select
              value={round}
              onChange={(e)=>setRound(e.target.value)}
            >
              <option>Technical Round</option>
              <option>HR Round</option>
              <option>Manager Round</option>
            </select>

          </div>

          <div className="input-group">

            <label>

              <FaCalendarAlt />

              Date

            </label>

            <input
              type="date"
              value={date}
              onChange={(e)=>setDate(e.target.value)}
            />

          </div>

          <div className="input-group">

            <label>

              <FaClock />

              Time

            </label>

            <input
              type="time"
              value={time}
              onChange={(e)=>setTime(e.target.value)}
            />

          </div>

          <div className="input-group">

            <label>Meeting Type</label>

            <select
              value={mode}
              onChange={(e)=>setMode(e.target.value)}
            >
              <option>Google Meet</option>
              <option>Microsoft Teams</option>
              <option>Zoom</option>
              <option>Offline</option>
            </select>

          </div>

          <div className="input-group full-width">

            <label>Remarks</label>

            <textarea
              rows="4"
              value={remarks}
              onChange={(e)=>setRemarks(e.target.value)}
            />

          </div>

        </div>

        <div className="schedule-footer">

          <button
            className="schedule-save"
            onClick={scheduleInterview}
          >

            Schedule Interview

          </button>

        </div>

      </div>

    </div>

  );

}

export default ScheduleModal;