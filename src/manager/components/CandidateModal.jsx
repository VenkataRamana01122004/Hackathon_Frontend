import {
  FaTimes,
  FaEnvelope,
  FaPhone,
  FaBriefcase,
  FaGraduationCap,
  FaCode,
  FaUserTie
} from "react-icons/fa";

import "./CandidateModal.css";

function CandidateModal({ candidate, onClose }) {

  if (!candidate) return null;

  return (

    <div className="modal-overlay">

      <div className="candidate-modal">

        <div className="modal-header">

          <h2>Candidate Details</h2>

          <button onClick={onClose}>
            <FaTimes />
          </button>

        </div>

        <div className="candidate-profile">

          <div className="candidate-photo">

            {candidate.name.charAt(0)}

          </div>

          <div>

            <h2>{candidate.name}</h2>

            <p>{candidate.role}</p>

          </div>

        </div>

        <div className="candidate-grid">

          <div className="detail-card">

            <FaEnvelope />

            <div>

              <span>Email</span>

              <p>{candidate.email}</p>

            </div>

          </div>

          <div className="detail-card">

            <FaPhone />

            <div>

              <span>Phone</span>

              <p>{candidate.phone}</p>

            </div>

          </div>

          <div className="detail-card">

            <FaBriefcase />

            <div>

              <span>Experience</span>

              <p>{candidate.experience}</p>

            </div>

          </div>

          <div className="detail-card">

            <FaGraduationCap />

            <div>

              <span>Education</span>

              <p>{candidate.education}</p>

            </div>

          </div>

          <div className="detail-card">

            <FaCode />

            <div>

              <span>Skills</span>

              <p>{candidate.skills}</p>

            </div>

          </div>

          <div className="detail-card">

            <FaUserTie />

            <div>

              <span>Applied Role</span>

              <p>{candidate.role}</p>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}

export default CandidateModal;