import React from "react";
import { useNavigate } from "react-router-dom";
import "./candidate.css";
import { getProgress } from "./utils/progress.js";

const normalizeStatus = (value) => String(value || "pending").trim().toLowerCase();

const isCompletedStatus = (status) =>
  ["process", "passed", "completed", "submitted", "qualified"].includes(status);

const displayStatus = (status, completed) =>
  completed ? "COMPLETED" : status.toUpperCase();

function CandidateHome() {

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");


  // Normalize status values
  const progress = getProgress();
  const bitsStatus = normalizeStatus(user.bitsExamStatus);

  const codingStatus = normalizeStatus(user.codingExamStatus);

  const interviewStatus = normalizeStatus(user.interviewStatus);



  // Round permissions

  const mcqCompleted = isCompletedStatus(bitsStatus) || progress.mcq.completed;
  const codingCompleted = isCompletedStatus(codingStatus) || progress.coding.completed;
  const interviewCompleted = isCompletedStatus(interviewStatus);

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

            onClick={() =>
              navigate("/candidate/bitsassessment")
            }

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