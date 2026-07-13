import { useEffect, useState } from "react";
import axios from "axios";

function CodingAssessmentModal({ userId, close }) {

  const [assessment, setAssessment] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    loadAssessment();

  }, []);

  const loadAssessment = async () => {

    try {

      const response = await axios.get(

        `http://localhost:5000/manager/getAssessmentsByUserId/${userId}`

      );

      setAssessment(response.data);

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
        style={{ maxWidth: "950px" }}
      >

        <div className="modal-header">

          <h2>Coding Assessment Report</h2>

        </div>

        <div className="modal-body">

          <div className="view-grid">

            <div>

              <h4>Candidate</h4>

              <p>{assessment.candidateName}</p>

            </div>

            <div>

              <h4>Started</h4>

              <p>

                {new Date(

                  assessment.assignmentStartTime

                ).toLocaleString()}

              </p>

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

              <h4>Total Time</h4>

              <p>

                {assessment.totalTime} Minutes

              </p>

            </div>

            <div>

              <h4>Submission</h4>

              <p>

                {assessment.submitReason}

              </p>

            </div>

            <div>

              <h4>Timer Expired</h4>

              <p>

                {assessment.timerExpired
                  ? "Yes"
                  : "No"}

              </p>

            </div>

            <div>

              <h4>IP Address</h4>

              <p>

                {assessment.ipAddress}

              </p>

            </div>

            <div>

              <h4>Video</h4>

              <p>

                {assessment.videoName || "N/A"}

              </p>

            </div>

          </div>

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

          <h3>Proctoring</h3>

          <pre>

            {JSON.stringify(

              assessment.proctoring,

              null,

              2

            )}

          </pre>

          <hr />

          <h3>Candidate Answers</h3>

          {

            assessment.answers?.length === 0 ?

            (

              <p>No Answers Available</p>

            )

            :

            (

              assessment.answers.map(

                (answer,index)=>(

                  <div

                    key={index}

                    className="view-group"

                  >

                    <h4>

                      Question {index+1}

                    </h4>

                    <pre>

                      {JSON.stringify(

                        answer,

                        null,

                        2

                      )}

                    </pre>

                  </div>

                )

              )

            )

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

export default CodingAssessmentModal;