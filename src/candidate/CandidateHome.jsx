import React from "react";
import { useNavigate } from "react-router-dom";
import "./candidate.css";

function CandidateHome() {

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");


  // Normalize status values
  const bitsStatus =
    (user.bitsExamStatus || "Pending").trim().toLowerCase();

  const codingStatus =
    (user.codingExamStatus || "Pending").trim().toLowerCase();

  const interviewStatus =
    (user.interviewStatus || "Pending").trim().toLowerCase();



  // Round permissions

  const canStartMcq =
    bitsStatus === "pending";


  const canStartCoding =
    bitsStatus === "process" &&
    codingStatus === "pending";


  const canStartInterview = interviewStatus === "scheduled";



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
              {bitsStatus.toUpperCase()}
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
            canStartCoding
              ? "round-card--unlocked"
              : "round-card--locked"
          }`}

        >


          <div className="round-card-top">


            <span className="round-index">
              Round 2
            </span>


            <span className="round-status">

              {codingStatus.toUpperCase()}

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

          {!canStartCoding && (

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

            {canStartCoding
              ? "Start Test"
              : "Locked"}

          </button>
        </div>

        {/* ================= ROUND 3 ================= */}

        <div

          className={`round-card ${
            canStartInterview
              ? "round-card--unlocked"
              : "round-card--locked"
          }`}

        >



          <div className="round-card-top">


            <span className="round-index">

              Round 3

            </span>



            <span className="round-status">

              {interviewStatus.toUpperCase()}

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





          {!canStartInterview && (

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
            {canStartInterview
              ? "Start Interview"
              : "Locked"}

          </button>
        </div>
      </div>


    </div>

  );

}


export default CandidateHome;