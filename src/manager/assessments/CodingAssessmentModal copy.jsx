import { useEffect, useState } from "react";
import axios from "axios";

function CodingAssessmentModal({ id, close }) {

const [assessments, setAssessments] = useState([]);
const [selectedIndex, setSelectedIndex] = useState(0);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    loadAssessment();

  }, []);

  const loadAssessment = async () => {

    try {

      const response = await axios.get(

        `http://localhost:5000/api/manager/getAssessmentsByUserId/${id}`

      );

      console.log(response.data.data)
      setAssessments(response.data.data || []);

    }

    catch (err) {

      console.log(err);

    }

    finally {

      setLoading(false);

    }

  };

  if (loading) {

    return (

      <div className="modal-overlay">

        <div className="question-modal">

          <h2>Loading Assessment...</h2>

        </div>

      </div>

    );

  }

if (assessments.length === 0) {
    return (

      <div className="modal-overlay">

        <div className="question-modal">

          <h2>No Assessment Found</h2>

          <div className="modal-footer">

            <button
              className="cancel-btn"
              onClick={close}
            >
              Close
            </button>

          </div>

        </div>

      </div>

    );

  }

  return (

    <div className="modal-overlay">

      <div
        className="question-modal"
        style={{ maxWidth: "950px" }}
      >

        <div className="modal-header">

          <h2>Coding Assessment Report</h2>

        </div>

        <div className="modal-body">
          <div
  style={{
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    flexWrap: "wrap",
  }}
>
  {assessments.map((item, index) => (
    <button
      key={item.id}
      onClick={() => setSelectedIndex(index)}
      style={{
        padding: "8px 18px",
        borderRadius: "6px",
        border: "none",
        cursor: "pointer",
        background:
          selectedIndex === index ? "#2563eb" : "#e5e7eb",
        color:
          selectedIndex === index ? "#fff" : "#000",
        fontWeight: 600,
      }}
    >
      Assessment {index + 1}
    </button>
  ))}
</div>

  {assessments.map((assessment, assessmentIndex) => (

    <div
      key={assessment.id}
      style={{
        border: "1px solid #ddd",
        borderRadius: "10px",
        padding: "20px",
        marginBottom: "25px"
      }}
    >

      <h2>Assessment {assessmentIndex + 1}</h2>

      <div className="view-grid">

        <div>
          <h4>Candidate</h4>
          <p>{assessment.candidateName}</p>
        </div>

        <div>
          <h4>Started</h4>
          <p>{new Date(assessment.assignmentStartTime).toLocaleString()}</p>
        </div>

        <div>
          <h4>Submitted</h4>
          <p>{new Date(assessment.submittedAt).toLocaleString()}</p>
        </div>

        <div>
          <h4>Total Time</h4>
          <p>{assessment.totalTime}</p>
        </div>

        <div>
          <h4>Submission</h4>
          <p>{assessment.submitReason}</p>
        </div>

        <div>
          <h4>Timer Expired</h4>
          <p>{assessment.timerExpired ? "Yes" : "No"}</p>
        </div>

        <div>
          <h4>IP Address</h4>
          <p>{assessment.ipAddress}</p>
        </div>

        <div>
          <h4>Video</h4>
          <p>{assessment.videoName || "N/A"}</p>
        </div>

      </div>

      <hr />

      <h3>System Information</h3>

      <pre>{JSON.stringify(assessment.systemInfo, null, 2)}</pre>

      <hr />

      <h3>Proctoring</h3>

      <pre>{JSON.stringify(assessment.proctoring, null, 2)}</pre>

      <hr />

      <h3>Candidate Answers</h3>

      {assessment.answers?.length > 0 ? (

        assessment.answers.map((answer, index) => (

          <div
            key={index}
            className="view-group"
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              marginBottom: "15px",
              borderRadius: "8px"
            }}
          >

            <h4>Question {index + 1}</h4>

            <p><strong>Question:</strong> {answer.title}</p>

            <p><strong>Language:</strong> {answer.language}</p>

            <p><strong>Status:</strong> {answer.status}</p>

            <p>
              <strong>Passed:</strong> {answer.passedTestCases}/{answer.totalTestCases}
            </p>

            <h5>Source Code</h5>
            <pre>{answer.code}</pre>

            <h5>Output</h5>
            <pre>{answer.output}</pre>

            <h5>Error</h5>
            <pre>{answer.error}</pre>

          </div>

        ))

      ) : (

        <p>No Answers Available</p>

      )}

    </div>

  ))}

</div>

        <div className="modal-footer">

          <button

            className="cancel-btn"

            onClick={close}

          >

            Close

          </button>

        </div>

      </div>

    </div>

  );

}

export default CodingAssessmentModal;