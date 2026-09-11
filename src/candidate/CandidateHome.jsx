import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./candidate.css";

const normalizeStatus = (value) => String(value || "pending").trim().toLowerCase();

const isCompletedStatus = (status) =>
  ["process", "passed", "completed", "submitted", "qualified"].includes(status);

const displayStatus = (status, completed) =>
  completed ? "COMPLETED" : status.toUpperCase();

function CandidateHome() {

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");


  const bitsStatus = normalizeStatus(user.bitsExamStatus);

  const codingStatus = normalizeStatus(user.codingExamStatus);

  const interviewStatus = normalizeStatus(user.interviewStatus);
  const mcqCompleted = isCompletedStatus(bitsStatus);
  const codingCompleted = isCompletedStatus(codingStatus);
  const interviewCompleted = isCompletedStatus(interviewStatus);
  const anyExamStarted = mcqCompleted || codingCompleted || interviewCompleted;
  const allExamsCompleted = mcqCompleted && codingCompleted && interviewCompleted;

  useEffect(() => {
    const exitAllowed = !anyExamStarted || allExamsCompleted;
    sessionStorage.setItem("exit_application_allowed", String(exitAllowed));
    window.electronAPI?.hideExitApp?.();

    if (!mcqCompleted) {
      localStorage.removeItem("mcq_result");
      localStorage.removeItem("exam_submitted");
      localStorage.removeItem("exam_running");
    }
    if (!codingCompleted) {
      localStorage.removeItem("assignment_submitted");
      localStorage.removeItem("assignment_running");
      localStorage.removeItem("assignment_end_time");
      localStorage.removeItem("assignment_resume_count");
      localStorage.removeItem("assignment_question");
      localStorage.removeItem("assignment_language");
      localStorage.removeItem("assignment_questions");
    }
    if (!mcqCompleted || !codingCompleted) {
      sessionStorage.removeItem("candidateProgress_v1");
    }
  }, [anyExamStarted, allExamsCompleted, mcqCompleted, codingCompleted]);


  // Round permissions
  const canStartMcq = !mcqCompleted;


  const canStartCoding =
    mcqCompleted && !codingCompleted;


  // const canStartInterview = interviewStatus === "scheduled";
  const canStartInterview = mcqCompleted && codingCompleted && !interviewCompleted;



  console.log("Candidate Status", {
    bitsStatus,
    codingStatus,
    interviewStatus,
    canStartMcq,
    canStartCoding,
    canStartInterview
  });



  return (

    <div
      className="candidate-home-shell"
      style={{ maxWidth: 1000 }}
    >

      <h2>
        Candidate Home
      </h2>


      <p
        style={{
          color: "var(--ink)",
          opacity: 0.75,
          marginBottom: 10
        }}
      >
        Complete each round in order.
      </p>



      <div className="home-cards">



        {/* ================= ROUND 1 ================= */}

        <div className="round-card">

          <div className="round-card-top">

            <span className="round-index">
              Round 1
            </span>


            <span className="round-status round-status--pending">
              {displayStatus(bitsStatus, mcqCompleted)}
            </span>


          </div>



          <h3 className="round-title">
            MCQ Assessment
          </h3>



          <p className="round-description">
            Objective questions on core fundamentals with proctoring.
          </p>



          <button

            className="btn btn--submit round-btn"

            disabled={!canStartMcq}

            onClick={() => navigate("/candidate/bitsassessment")}

          >

            {canStartMcq
              ? "Start Test"
              : "Completed"}

          </button>



        </div>







        {/* ================= ROUND 2 ================= */}


        <div

          className={`round-card ${
            codingCompleted || canStartCoding
              ? "round-card--unlocked"
              : "round-card--locked"
          }`}

        >


          <div className="round-card-top">


            <span className="round-index">
              Round 2
            </span>


            <span className="round-status">

              {displayStatus(codingStatus, codingCompleted)}

            </span>


          </div>




          <h3 className="round-title">

            {canStartCoding
              ? "🔓"
              : "🔒"
            } Coding Assignment

          </h3>




          <p className="round-description">

            Compiler-based coding round in Java, Python, or C.

          </p>

          {!canStartCoding && !codingCompleted && (

            <div className="round-requirements">

              Complete MCQ Assessment first.

            </div>

          )}
          
          <button

            className="btn btn--submit round-btn"

            disabled={!canStartCoding}

            onClick={() =>
              navigate("/candidate/assignment")
            }

          >

              {codingCompleted
              ? "Completed"
              : canStartCoding
              ? "Start Test"
              : "Locked"}

          </button>
        </div>

        {/* ================= ROUND 3 ================= */}

        <div

          className={`round-card ${
            interviewCompleted || canStartInterview
              ? "round-card--unlocked"
              : "round-card--locked"
          }`}

        >



          <div className="round-card-top">


            <span className="round-index">

              Round 3

            </span>



            <span className="round-status">

              {displayStatus(interviewStatus, interviewCompleted)}

            </span>



          </div>





          <h3 className="round-title">


            {canStartInterview
              ? "🔓"
              : "🔒"
            } AI Interview


          </h3>





          <p className="round-description">

            Live AI voice interview with recording and transcript.

          </p>





          {!canStartInterview && !interviewCompleted && (

            <div className="round-requirements">

              Complete Coding Assignment first.

            </div>

          )}

          <button

            className="btn btn--submit round-btn"

            disabled={!canStartInterview}

            onClick={() =>
              navigate("/candidate/interviewpanel")
            }

          >
            {interviewCompleted
              ? "Completed"
              : canStartInterview
              ? "Start Interview"
              : "Locked"}

          </button>
        </div>
      </div>


    </div>

  );

}


export default CandidateHome;