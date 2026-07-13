import {
  FaUserCircle,
  FaFilePdf,
  FaClipboardCheck,
  FaCalendarAlt
} from "react-icons/fa";

import "./AssignedCandidateCard.css";

function AssignedCandidateCard({ candidate, onReview }) {

  return (

    <div className="assigned-card">

      <div className="assigned-header">

        <FaUserCircle className="avatar"/>

        <div>

          <h3>{candidate.name}</h3>

          <p>{candidate.role}</p>

        </div>

      </div>

      <div className="assigned-details">

        <p>

          <strong>Experience :</strong>

          {candidate.experience}

        </p>

        <p>

          <strong>Assigned By :</strong>

          {candidate.assignedBy}

        </p>

        <p>

          <FaCalendarAlt/>

          Deadline : {candidate.deadline}

        </p>

      </div>

      <div className="assigned-status">

        <span>

          {candidate.reviewStatus}

        </span>

      </div>

      <div className="assigned-actions">

        <button className="resume-btn">

          <FaFilePdf/>

          Resume

        </button>

        <button

          className="review-btn"

          onClick={onReview}

        >

          <FaClipboardCheck/>

          Start Review

        </button>

      </div>

    </div>

  );

}

export default AssignedCandidateCard;