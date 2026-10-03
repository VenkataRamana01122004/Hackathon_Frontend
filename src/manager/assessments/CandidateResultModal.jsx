import { useEffect, useState } from "react";
import axios from "axios";

function CandidateResultModal({ id, close }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCoding, setSelectedCoding] = useState(0);

  useEffect(() => {
    loadCandidateResult();
  }, [id]);

  const loadCandidateResult = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/manager/candidateresult/${id}`
      );

      // console.log("Candidate Result:", response.data);

      setResult(response.data.result || null);
    } catch (err) {
      console.error("Failed to load candidate result:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="question-modal">
          <h2>Loading Candidate Result...</h2>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="modal-overlay">
        <div className="question-modal">
          <h2>No Candidate Result Found</h2>

          <div className="modal-footer">
            <button className="cancel-btn" onClick={close}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const coding = result.coding || [];
  const mcq = result.mcq || {};
  const interview = result.interview || {};
  const security = result.security || {};

  const selectedCodingQuestion =
    coding[selectedCoding];

  return (
    <div className="modal-overlay">
      <div
        className="question-modal"
        style={{
          maxWidth: "1100px",
          width: "95%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* ================= HEADER ================= */}

        <div className="modal-header">
          <div>
            <h2>Candidate Result Report</h2>

            <p
              style={{
                margin: "5px 0 0",
                color: "#666",
              }}
            >
              {result.candidateName}
            </p>
          </div>
        </div>

        <div className="modal-body">

          {/* ================= CANDIDATE SUMMARY ================= */}

          <div
           style={{
            border: "1px solid rgba(241, 0, 0, 0.35)",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "20px",
            background: "rgba(255, 255, 255, 0.10)",
            backdropFilter: "blur(15px)",
            WebkitBackdropFilter: "blur(15px)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
            color: "#000",
            }}
          >
            <h3>Candidate Information</h3>

            <div className="view-grid">
              <div>
                <h4>Candidate</h4>
                <p>{result.candidateName}</p>
              </div>

              <div>
                <h4>User ID</h4>
                <p>{result.userId}</p>
              </div>

              <div>
                <h4>Result Status</h4>
                <p>{result.resultStatus}</p>
              </div>

              <div>
                <h4>Evaluated At</h4>
                <p>
                  {result.evaluatedAt
                    ? new Date(
                        result.evaluatedAt
                      ).toLocaleString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* ================= OVERALL SCORE ================= */}

          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "20px",
              marginBottom: "20px",
            }}
          >
            <h3>Overall Result</h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "15px",
                marginTop: "15px",
              }}
            >
              <div
                style={{
                  padding: "20px",
                  borderRadius: "10px",
                  background: "#eff6ff",
                  textAlign: "center",
                  color: "#000",
                }}
              >
                <h4 style={{ color: "#000" }} >Overall Percentage</h4>

                <div
                  style={{
                    fontSize: "30px",
                    fontWeight: "bold",
                    color: "#000",
                  }}
                >
                  {Number(result.overallPercentage).toFixed(2)}%
                </div>
              </div>


              <div
                style={{
                  padding: "20px",
                  borderRadius: "10px",
                  background: "#f5f3ff",
                  textAlign: "center",
                  color: "#000",
                }}
              >
                <h4 style={{ color: "#000" }}  >Overall Score</h4>

                <div
                  style={{
                    fontSize: "30px",
                    fontWeight: "bold",
                    color: "#000",
                  }}
                >
                  {result.overallScore}
                </div>
              </div>

              <div
                style={{
                  padding: "20px",
                  borderRadius: "10px",
                  background: "#f0fdf4",
                  textAlign: "center",
                   color: "#000",
                }}
              >
                <h4 style={{ color: "#000" }} >Status</h4>

                <div
                  style={{
                    fontSize: "22px",
                    fontWeight: "bold",
                    color: "#000",
                  }}
                >
                  {result.resultStatus}
                </div>
              </div>
            </div>
          </div>

          {/* ================= CODING ================= */}

          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "20px",
              marginBottom: "20px",
            }}
          >
            <h3>Coding Assessment</h3>

            {coding.length === 0 ? (
              <p>No coding assessment result available.</p>
            ) : (
              <>
                {/* Coding summary */}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: "12px",
                    margin: "15px 0",
                  }}
                >
                  <div
                    style={{
                      padding: "15px",
                      background: "#f3f4f6",
                      borderRadius: "8px",
                    }}
                  >
                    <strong style={{ color: "#000" }} >Problems</strong>
                    <div style={{ color: "#000" }} >{coding.length}</div>
                  </div>

                  <div
                    style={{
                      padding: "15px",
                      background: "#f0fdf4",
                      borderRadius: "8px",
                    }}
                  >
                    <strong style={{ color: "#000" }} >Total Tests</strong>

                    <div style={{ color: "#000" }} >
                      {coding.reduce(
                        (sum, item) =>
                          sum + Number(item.totalTests || 0),
                        0
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "15px",
                      background: "#eff6ff",
                      borderRadius: "8px",
                    }}
                  >
                    <strong style={{ color: "#000" }} >Passed Tests</strong>

                    <div style={{ color: "#000" }} >
                      {coding.reduce(
                        (sum, item) =>
                          sum + Number(item.passedTests || 0),
                        0
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "15px",
                      background: "#fef2f2",
                      borderRadius: "8px",
                    }}
                  >
                    <strong style={{ color: "#000" }} >Failed Tests</strong>

                    <div style={{ color: "#000" }} >
                      {coding.reduce(
                        (sum, item) =>
                          sum + Number(item.failedTests || 0),
                        0
                      )}
                    </div>
                  </div>
                </div>

                {/* Coding question buttons */}

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    marginBottom: "20px",
                  }}
                >
                  {coding.map((item, index) => (
                    <button
                      key={item.questionId}
                      onClick={() =>
                        setSelectedCoding(index)
                      }
                      style={{
                        padding: "9px 16px",
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 600,
                        background:
                          selectedCoding === index
                            ? "#2563eb"
                            : "#e5e7eb",
                        color:
                          selectedCoding === index
                            ? "#fff"
                            : "#000",
                      }}
                    >
                      Problem {index + 1}
                    </button>
                  ))}
                </div>

                {/* Selected coding question */}

                {selectedCodingQuestion && (
                  <div
                    style={{
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      padding: "18px",
                    }}
                  >
                    <h4>
                      Problem {selectedCoding + 1}
                    </h4>

                    <p>
                      <strong>Question ID:</strong>{" "}
                      {selectedCodingQuestion.questionId}
                    </p>

                    <p>
                      <strong>Title:</strong>{" "}
                      {selectedCodingQuestion.title}
                    </p>

                    <p>
                      <strong>Total Tests:</strong>{" "}
                      {selectedCodingQuestion.totalTests}
                    </p>

                    <p>
                      <strong>Passed Tests:</strong>{" "}
                      {selectedCodingQuestion.passedTests}
                    </p>

                    <p>
                      <strong>Failed Tests:</strong>{" "}
                      {selectedCodingQuestion.failedTests}
                    </p>

                    <p>
                      <strong>Percentage:</strong>{" "}
                      {selectedCodingQuestion.percentage}%
                    </p>

                    <div
                      style={{
                        marginTop: "15px",
                        height: "10px",
                        background: "#e5e7eb",
                        borderRadius: "10px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${selectedCodingQuestion.percentage}%`,
                          height: "100%",
                          background: "#2563eb",
                        }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ================= MCQ ================= */}

          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "20px",
              marginBottom: "20px",
            }}
          >
            <h3>BITS / MCQ Assessment</h3>

            <div className="view-grid">
              <div>
                <h4>Total Questions</h4>
                <p>{mcq.totalQuestions || 0}</p>
              </div>

              <div>
                <h4>Attempted</h4>
                <p>{mcq.attempted || 0}</p>
              </div>

              <div>
                <h4>Correct Answers</h4>
                <p>{mcq.correctAnswers || 0}</p>
              </div>

              <div>
                <h4>Wrong Answers</h4>
                <p>{mcq.wrongAnswers || 0}</p>
              </div>

              <div>
                <h4>Unanswered</h4>
                <p>{mcq.unanswered || 0}</p>
              </div>

              <div>
                <h4>Percentage</h4>
                <p>{mcq.percentage || 0}%</p>
              </div>
            </div>
          </div>

          {/* ================= INTERVIEW ================= */}

          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "20px",
              marginBottom: "20px",
            }}
          >
            <h3>Interview Assessment</h3>

            {Object.keys(interview).length === 0 ? (
              <p>No interview result available.</p>
            ) : (
              <pre>
                {JSON.stringify(
                  interview,
                  null,
                  2
                )}
              </pre>
            )}
          </div>

          {/* ================= SECURITY ================= */}

          <div
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "20px",
              marginBottom: "20px",
            }}
          >
            <h3>Security / Proctoring</h3>

            <div className="view-grid">
              <div>
                <h4>Tab Switches</h4>
                <p>{security.tabSwitches || 0}</p>
              </div>

              <div>
                <h4>Fullscreen Exits</h4>
                <p>{security.fullscreenExits || 0}</p>
              </div>

              <div>
                <h4>Blurred</h4>
                <p>
                  {security.isBlurred ? "Yes" : "No"}
                </p>
              </div>

              <div>
                <h4>Offline</h4>
                <p>
                  {security.isOffline ? "Yes" : "No"}
                </p>
              </div>
            </div>
          </div>

          {/* ================= RAW SNAPSHOT ================= */}

          {result.resultSnapshot && (
            <div
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "20px",
                marginBottom: "20px",
              }}
            >
              <h3>Result Snapshot</h3>

              <pre>
                {JSON.stringify(
                  result.resultSnapshot,
                  null,
                  2
                )}
              </pre>
            </div>
          )}
        </div>

        {/* ================= FOOTER ================= */}

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

export default CandidateResultModal;