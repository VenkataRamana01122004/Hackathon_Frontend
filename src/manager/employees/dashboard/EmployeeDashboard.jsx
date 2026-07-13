import { useState } from "react";
import AssignedCandidateCard from "../components/AssignedCandidateCard";
import ReviewModal from "../components/ReviewModal";
import "./EmployeeDashboard.css";

function EmployeeDashboard() {

  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const candidates = [
    {
      id: 1,
      name: "Rahul Sharma",
      role: "Backend Developer",
      experience: "2 Years",
      assignedBy: "Manager",
      deadline: "2026-07-15",
      reviewStatus: "Pending"
    },
    {
      id: 2,
      name: "Priya Reddy",
      role: "Frontend Developer",
      experience: "3 Years",
      assignedBy: "Manager",
      deadline: "2026-07-18",
      reviewStatus: "Pending"
    }
  ];

  return (
    <div className="employee-dashboard">

      <div className="dashboard-header">
        <h1>Assigned Candidate Reviews</h1>
        <p>Review candidates assigned by your manager.</p>
      </div>

      <div className="candidate-grid">

        {candidates.map((candidate) => (

          <AssignedCandidateCard
            key={candidate.id}
            candidate={candidate}
            onReview={() => setSelectedCandidate(candidate)}
          />

        ))}

      </div>

      <ReviewModal
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
      />

    </div>
  );
}

export default EmployeeDashboard;