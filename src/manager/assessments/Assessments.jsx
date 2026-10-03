import { useState,useEffect } from "react";
import axios from "axios";

import "./Assessment.css";

import CodingAssessmentModal from "./CodingAssessmentModal";
import MCQAssessmentModal from "./MCQAssessmentModal";
import CandidateResultModal from "./CandidateResultModal";

function Assessments() {

    // Dummy data until backend API is connected
    // const [candidates] = useState([
    //     {
    //         id: "1",
    //         fullName: "John Doe",
    //         date: "2026-07-08"
    //     },
    //     {
    //         id: "2",
    //         fullName: "Alice Johnson",
    //         date: "2026-07-09"
    //     }
    // ]);
      const [candidates, setCandidates] = useState([]);

  useEffect(() => {
  fetchCandidates();
}, []);

const fetchCandidates = async () => {
  try {
    const response = await axios.get(
      "http://localhost:5000/api/manager/viewcandidate"
    );

    setCandidates(response.data);
  } catch (error) {
    console.error("Error fetching candidates:", error);
  }
};

const validateCandidates = async (userId) => {
  try {
    const response = await axios.post(
      `http://localhost:5000/api/manager/generate/${userId}`,
      {},
      { timeout: 180000 }
    );

    if (response.data.success) {
    //   console.log("Candidate result generated and saved:", response.data);

      alert(response.data.message);

      // Refresh candidates here if needed
      // await fetchCandidates();

      return response.data.result;
    }

    throw new Error(
      response.data.message || "Candidate validation failed."
    );
  } catch (error) {
    console.error("Candidate validation error:", error);

    const message =
      error.response?.data?.message ||
      (error.code === "ECONNABORTED"
        ? "Validation timed out. Please check the server."
        : error.message || "Failed to validate candidate.");

    alert(message);
    throw error;
  }
};

    const [selectedUser, setSelectedUser] = useState(null);

    const [codingOpen, setCodingOpen] = useState(false);
    const [resultOpen, setResultOpen] = useState(false);

    const [mcqOpen, setMcqOpen] = useState(false);
    const [validatingId, setValidatingId] = useState(null);

    return (

        <div className="assessment-page">

            <div className="manager-page-header assessment-header">
                <div>
                    <h1>Assessment Reports</h1>
                    <p>Review candidate coding and MCQ assessment results</p>
                </div>
            </div>

            <div className="list-card manager-table-card assessment-table-card">

            <table className="manager-table">
                <thead>
                    <tr>
                        <th>Candidate</th>
                        {/* <th>Date</th> */}
                        <th>Coding</th>
                        <th>MCQ</th>
                        <th>Result</th>
                        <th>Validate</th>
                    </tr>

                </thead>

                <tbody>

                    {candidates.map((candidate)=>(

                        <tr key={candidate.id}>

                            <td>{candidate.fullName}</td>

                            {/* <td>{candidate.date}</td> */}

                            <td>

                                <button

                                    className="view-btn"

                                    onClick={()=>{

                                        setSelectedUser(candidate.id);

                                        setCodingOpen(true);

                                    }}

                                >

                                    View

                                </button>

                            </td>

                            <td>

                                <button

                                    className="view-btn"

                                    onClick={()=>{

                                        setSelectedUser(candidate.id);

                                        setMcqOpen(true);

                                    }}

                                >

                                    View

                                </button>

                            </td>

                            <td>

                                <button

                                    className="view-btn"

                                    onClick={()=>{

                                        setSelectedUser(candidate.id);

                                        setResultOpen(true);

                                    }}

                                >

                                    View Result

                                </button>

                            </td>

                            {/* <td>
                                <button
                                    className="view-btn"
                                    onClick={()=>{
                                         validateCandidates(candidate.id);
                                    }}
                                >
                                    Validate
                                </button>
                            </td> */}
                            <td>
                            <button
                                className="view-btn"
                                disabled={validatingId !== null}
                                onClick={async () => {
                                if (validatingId !== null) return;

                                setValidatingId(candidate.id);

                                try {
                                    await validateCandidates(candidate.id);
                                } finally {
                                    setValidatingId(null);
                                }
                                }}
                                style={{
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "9px",
                                minWidth: "125px",
                                padding: "10px 16px",
                                border: "none",
                                borderRadius: "8px",
                                background: validatingId === candidate.id ? "#64748b" : "#2563eb",
                                color: "#fff",
                                fontWeight: 600,
                                fontSize: "13px",
                                cursor: validatingId !== null ? "not-allowed" : "pointer",
                                opacity: validatingId !== null ? 0.85 : 1,
                                transition: "all 0.2s ease",
                                }}
                            >
                                {validatingId === candidate.id && (
                                <span className="validation-spinner" />
                                )}

                                {validatingId === candidate.id ? "Validating..." : "Validate"}
                            </button>

                            <style>
                                {`
                                .validation-spinner {
                                    width: 15px;
                                    height: 15px;
                                    border: 2px solid rgba(255, 255, 255, 0.35);
                                    border-top-color: #ffffff;
                                    border-radius: 50%;
                                    animation: validation-spin 0.7s linear infinite;
                                    flex-shrink: 0;
                                }

                                @keyframes validation-spin {
                                    to {
                                    transform: rotate(360deg);
                                    }
                                }
                                `}
                            </style>
                            </td>


                        </tr>

                    ))}

                </tbody>

            </table>

            </div>

            {

                codingOpen &&

                <CodingAssessmentModal

                    id={selectedUser}

                    close={()=>setCodingOpen(false)}

                />

            }
            {

                resultOpen &&

                <CandidateResultModal

                    id={selectedUser}

                    close={()=>setResultOpen(false)}

                />

            }

            {

                mcqOpen &&

                <MCQAssessmentModal

                    id={selectedUser}

                    close={()=>setMcqOpen(false)}

                />

            }

        </div>

    );

}

export default Assessments;