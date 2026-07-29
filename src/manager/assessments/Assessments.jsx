import { useState,useEffect } from "react";
import axios from "axios";

import "./Assessment.css";

import CodingAssessmentModal from "./CodingAssessmentModal";
import MCQAssessmentModal from "./MCQAssessmentModal";

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
    const response = await axios.get(
      `http://localhost:5000/api/manager/validatecandidate/${userId}`
    );
    console.log(response.data);
    // setCandidates(response.data);
  } catch (error) {
    console.error("Error fetching candidates:", error);
  }
};
    const [selectedUser, setSelectedUser] = useState(null);

    const [codingOpen, setCodingOpen] = useState(false);

    const [mcqOpen, setMcqOpen] = useState(false);

    return (

        <div className="assessment-page">

            <div className="manager-page-header assessment-header">
                <div>
                    <h1>Assessment Reports</h1>
                    <p>Review candidate coding and MCQ assessment results</p>
                </div>
            </div>

            <div className="manager-table-card assessment-table-card">

            <table className="manager-table">
                <thead>
                    <tr>
                        <th>Candidate</th>
                        <th>Date</th>
                        <th>Coding</th>
                        <th>MCQ</th>
                        <th>Validate</th>
                    </tr>

                </thead>

                <tbody>

                    {candidates.map((candidate)=>(

                        <tr key={candidate.id}>

                            <td>{candidate.fullName}</td>

                            <td>{candidate.date}</td>

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
                                         validateCandidates(candidate.id);
                                    }}
                                >
                                    Validate
                                </button>
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