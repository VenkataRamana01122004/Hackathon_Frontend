import { FaTimes, FaDownload, FaFilePdf } from "react-icons/fa";
import "./ResumeModal.css";

function ResumeModal({ candidate, onClose }) {

  if (!candidate) return null;

  const resumeUrl = `http://localhost:5000/resumes/${candidate.resume}`;

  const downloadResume = () => {
    window.open(resumeUrl, "_blank");
  };

  return (
    <div className="resume-overlay">

      <div className="resume-modal">

        <div className="resume-header">

          <div>
            <h2>{candidate.fullName}'s Resume</h2>
            <p>{candidate.appliedRole}</p>
          </div>

          <button onClick={onClose}>
            <FaTimes />
          </button>

        </div>


        <div className="resume-preview">

          {candidate.resume ? (
            <>
              <FaFilePdf className="pdf-icon" />

              <h3>Resume Available</h3>

              <p>
                {candidate.resume}
              </p>
            </>
          ) : (
            <>
              <FaFilePdf className="pdf-icon" />

              <h3>No Resume Uploaded</h3>

              <p>
                Candidate has not uploaded a resume.
              </p>
            </>
          )}

        </div>


        <div className="resume-footer">

          {candidate.resume && (
            <button
              className="download-btn"
              onClick={downloadResume}
            >
              <FaDownload />

              Download Resume
            </button>
          )}

        </div>


      </div>

    </div>
  );
}

export default ResumeModal;