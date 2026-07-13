import { useState } from "react";
import "./Assessment.css";

import CodingAssessmentModal from "./CodingAssessmentModal";
import MCQAssessmentModal from "./MCQAssessmentModal";

function Assessments() {

    // Dummy data until backend API is connected
    const [candidates] = useState([
        {
            userId: "1",
            candidateName: "John Doe",
            date: "2026-07-08"
        },
        {
            userId: "2",
            candidateName: "Alice Johnson",
            date: "2026-07-09"
        }
    ]);

    const [selectedUser, setSelectedUser] = useState(null);

    const [codingOpen, setCodingOpen] = useState(false);

    const [mcqOpen, setMcqOpen] = useState(false);

    return (

        <div className="assessment-page">

            <div className="assessment-header">

                <h1>Assessment Reports</h1>

            </div>

            <table>

                <thead>

                    <tr>

                        <th>Candidate</th>

                        <th>Date</th>

                        <th>Coding</th>

                        <th>MCQ</th>

                    </tr>

                </thead>

                <tbody>

                    {candidates.map((candidate)=>(

                        <tr key={candidate.userId}>

                            <td>{candidate.candidateName}</td>

                            <td>{candidate.date}</td>

                            <td>

                                <button

                                    className="view-btn"

                                    onClick={()=>{

                                        setSelectedUser(candidate.userId);

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

                                        setSelectedUser(candidate.userId);

                                        setMcqOpen(true);

                                    }}

                                >

                                    View

                                </button>

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

            {

                codingOpen &&

                <CodingAssessmentModal

                    userId={selectedUser}

                    close={()=>setCodingOpen(false)}

                />

            }

            {

                mcqOpen &&

                <MCQAssessmentModal

                    userId={selectedUser}

                    close={()=>setMcqOpen(false)}

                />

            }

        </div>

    );

}

export default Assessments;