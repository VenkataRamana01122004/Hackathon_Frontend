import { useState } from "react";
import {
  FaTimes,
  FaUsers,
  FaCalendarAlt,
  FaClock,
  FaVideo,
  FaStickyNote
} from "react-icons/fa";

import "./FinalInterviewModal.css";

function FinalInterviewModal({ candidate, onClose, onSchedule }) {

  if (!candidate) return null;

  const [panel, setPanel] = useState([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [mode, setMode] = useState("Google Meet");
  const [remarks, setRemarks] = useState("");

  const employees = [
    "Rahul Verma",
    "Anjali Singh",
    "Suresh Kumar",
    "Monisha",
    "Rakesh"
  ];

  const toggleEmployee = (employee) => {
    if (panel.includes(employee)) {
      setPanel(panel.filter((e) => e !== employee));
    } else {
      setPanel([...panel, employee]);
    }
  };

  const handleSubmit = () => {

    if(panel.length===0){

      alert("Please select interview panel.");

      return;

    }

    if(!date || !time){

      alert("Please select date and time.");

      return;

    }

    onSchedule({
      ...candidate,
      panel,
      date,
      time,
      mode,
      remarks
    });

    onClose();

  };

  return (

    <div className="final-overlay">

      <div className="final-modal">

        <div className="final-header">

          <h2>Final Interview</h2>

          <button onClick={onClose}>
            <FaTimes/>
          </button>

        </div>

        <div className="candidate-banner">

          <h3>{candidate.name}</h3>

          <span>{candidate.assignedRole || candidate.role}</span>

        </div>

        <div className="final-body">

          <div className="field">

            <label>

              <FaUsers/>

              Interview Panel

            </label>

            <div className="employee-list">

              {employees.map(emp => (

                <label key={emp}>

                  <input
                    type="checkbox"
                    checked={panel.includes(emp)}
                    onChange={() => toggleEmployee(emp)}
                  />

                  {emp}

                </label>

              ))}

            </div>

          </div>

          <div className="two-column">

            <div className="field">

              <label>

                <FaCalendarAlt/>

                Interview Date

              </label>

              <input
                type="date"
                value={date}
                onChange={(e)=>setDate(e.target.value)}
              />

            </div>

            <div className="field">

              <label>

                <FaClock/>

                Interview Time

              </label>

              <input
                type="time"
                value={time}
                onChange={(e)=>setTime(e.target.value)}
              />

            </div>

          </div>

          <div className="field">

            <label>

              <FaVideo/>

              Interview Mode

            </label>

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

          <div className="field">

            <label>

              <FaStickyNote/>

              Remarks

            </label>

            <textarea

              rows="4"

              value={remarks}

              onChange={(e)=>setRemarks(e.target.value)}

            />

          </div>

        </div>

        <div className="final-footer">

          <button
            className="schedule-final-btn"
            onClick={handleSubmit}
          >

            Schedule Final Interview

          </button>

        </div>

      </div>

    </div>

  );

}

export default FinalInterviewModal;