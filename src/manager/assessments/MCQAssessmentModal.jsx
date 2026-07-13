import { useEffect, useState } from "react";
import axios from "axios";

function MCQAssessmentModal({ userId, close }) {

  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssessment();
  }, []);

  const loadAssessment = async () => {

    try {

      const response = await axios.get(
        `http://localhost:5000/manager/getBitsAssessmentsByUserId/${userId}`
      );

      setAssessment(response.data);

    } catch (err) {

      console.log(err);

    } finally {

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

  if (!assessment) {

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
        style={{ maxWidth: "1000px" }}
      >

        <div className="modal-header">

          <h2>MCQ Assessment Report</h2>

        </div>

        <div className="modal-body">

          <div className="view-grid">

            <div>

              <h4>Candidate</h4>

              <p>{assessment.candidateName}</p>

            </div>

            <div>

              <h4>Submitted</h4>

              <p>
                {new Date(
                  assessment.submittedAt
                ).toLocaleString()}
              </p>

            </div>

            <div>

              <h4>Time Left</h4>

              <p>{assessment.timeLeft} sec</p>

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

          <h3>Violation Summary</h3>

          <table>

            <tbody>

              <tr>

                <td>Fullscreen Exits</td>

                <td>
                  {assessment.violations?.fullscreenExits ?? 0}
                </td>

              </tr>

              <tr>

                <td>Tab Switches</td>

                <td>
                  {assessment.violations?.tabSwitches ?? 0}
                </td>

              </tr>

              <tr>

                <td>Window Blurred</td>

                <td>
                  {assessment.violations?.isBlurred
                    ? "Yes"
                    : "No"}
                </td>

              </tr>

              <tr>

                <td>Offline</td>

                <td>
                  {assessment.violations?.isOffline
                    ? "Yes"
                    : "No"}
                </td>

              </tr>

            </tbody>

          </table>

          <hr />

          <h3>System Information</h3>

          <pre>

            {JSON.stringify(
              assessment.systemInfo,
              null,
              2
            )}

          </pre>

          <hr />

          <h3>Question Status</h3>

          <table>

            <thead>

              <tr>

                <th>Question</th>

                <th>Status</th>

                <th>Answer</th>

              </tr>

            </thead>

            <tbody>

              {assessment.questions?.map((q, index) => (

                <tr key={index}>

                  <td>
                    Question {index + 1}
                  </td>

                  <td>

                    {assessment.statuses?.[index] || "-"}

                  </td>

                  <td>

                    {JSON.stringify(
                      assessment.answers?.[index]
                    )}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

          <hr />

          <h3>Activity Logs</h3>

          {

            assessment.logs?.length === 0 ?

            <p>No Logs Available</p>

            :

            assessment.logs.map((log,index)=>(

              <div
                key={index}
                className="view-group"
              >

                <pre>

                  {JSON.stringify(
                    log,
                    null,
                    2
                  )}

                </pre>

              </div>

            ))

          }

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

export default MCQAssessmentModal;