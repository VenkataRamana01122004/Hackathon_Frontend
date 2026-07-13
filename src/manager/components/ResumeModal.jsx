import { FaTimes, FaDownload, FaFilePdf } from "react-icons/fa";
import "./ResumeModal.css";

function ResumeModal({ candidate, onClose }) {

  if (!candidate) return null;

  return (

    <div className="resume-overlay">

      <div className="resume-modal">

        <div className="resume-header">

          <div>

            <h2>{candidate.name}'s Resume</h2>
            <p>{candidate.role}</p>

          </div>

          <button onClick={onClose}>
            <FaTimes />
          </button>

        </div>

        <div className="resume-preview">

          {/* Later replace with PDF Viewer */}

          <FaFilePdf className="pdf-icon"/>

          <h3>Resume Preview</h3>

          <p>

            Resume preview will appear here once connected
            to the backend.

          </p>

        </div>

        <div className="resume-footer">

          <button className="download-btn">

            <FaDownload />

            Download Resume

          </button>

        </div>

      </div>

    </div>

  );

}

export default ResumeModal;