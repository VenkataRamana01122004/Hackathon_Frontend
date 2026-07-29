import { useState, useEffect } from "react";
import axios from "axios";


import SearchBar from "../components/SearchBar";
import FilterBar from "../components/FilterBar";
import CandidateTable from "../components/CandidateTable";
import CandidateModal from "../components/CandidateModal";
import ResumeModal from "../components/ResumeModal";
import AssignRoleModal from "../components/AssignRoleModal";
import FinalInterviewModal from "../components/FinalInterviewModal";

import "./Qualifiers.css";

function Qualifiers() {

  const [search, setSearch] = useState("");
  const [appliedRole, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [status, setStatus] = useState("");

  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const [showDetails, setShowDetails] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [showAssignRole, setShowAssignRole] = useState(false);
  const [showFinalInterview, setShowFinalInterview] = useState(false);

  const [candidates, setCandidates] = useState([]);

  const filteredCandidates = candidates.filter((candidate) => {

    const matchesSearch =
      candidate.fullName.toLowerCase().includes(search.toLowerCase()) ||
      candidate.email.toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      appliedRole === "" || candidate.appliedRole === appliedRole;

    const matchesExperience =
  experience === "" ||
  (() => {
    const [min, max] = experience.split("-").map(Number);
    return candidate.experience >= min && candidate.experience <= max;
  })();

    const matchesStatus =
      status === "" || candidate.status === status;

    return (
      matchesSearch &&
      matchesRole &&
      matchesExperience &&
      matchesStatus
    );

  });

  useEffect(() => {
  fetchCandidates();
}, []);

const fetchCandidates = async () => {
  try {
    const response = await axios.get(
      "http://localhost:5000/api/manager/viewintervieweligiblecandidates"
    );
    
    setCandidates(Array.isArray(response.data) ? response.data : []);
  } catch (error) {
    console.error("Error fetching candidates:", error);
  }
};

  const saveAssignedRole = (updatedCandidate) => {

    setCandidates((prev) =>
      prev.map((candidate) =>
        candidate.id === updatedCandidate.id
          ? updatedCandidate
          : candidate
      )
    );
  };

  const scheduleFinalInterview = (candidate) => {

    setSelectedCandidate(candidate);

    setShowFinalInterview(true);

  };

  return (

    <div className="qualifiers-page">

      <div className="page-header">

        <div>

          <h1>Qualifiers</h1>

          <p>
            Candidates qualified for the final interview
          </p>

        </div>

      </div>

      <div className="qualifiers-toolbar">

        <SearchBar
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <FilterBar
          appliedRole={appliedRole}
          setRole={setRole}
          experience={experience}
          setExperience={setExperience}
          status={status}
          setStatus={setStatus}
        />

      </div>

      <CandidateTable

        candidates={filteredCandidates}

        showScores={true}

        showAssignRole={true}

        onAssignRole={(candidate) => {

          setSelectedCandidate(candidate);

          setShowAssignRole(true);

        }}

        onView={(candidate) => {

          setSelectedCandidate(candidate);

          setShowDetails(true);

        }}

        onResume={(candidate) => {

          setSelectedCandidate(candidate);

          setShowResume(true);

        }}

        onSchedule={scheduleFinalInterview}

      />

      <CandidateModal

        candidate={showDetails ? selectedCandidate : null}

        onClose={() => setShowDetails(false)}

      />

      <ResumeModal

        candidate={showResume ? selectedCandidate : null}

        onClose={() => setShowResume(false)}

      />

      <AssignRoleModal

        candidate={showAssignRole ? selectedCandidate : null}

        onClose={() => setShowAssignRole(false)}

        onSave={saveAssignedRole}

      />

      <FinalInterviewModal

        candidate={showFinalInterview ? selectedCandidate : null}

        onClose={() => setShowFinalInterview(false)}

        onSchedule={(candidate) => {

          alert(
            `Final Interview Scheduled for ${candidate.fullName}`
          );

          setShowFinalInterview(false);

        }}

      />

    </div>

  );

}

export default Qualifiers;