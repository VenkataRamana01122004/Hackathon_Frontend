import { useState } from "react";

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
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [status, setStatus] = useState("");

  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const [showDetails, setShowDetails] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [showAssignRole, setShowAssignRole] = useState(false);
  const [showFinalInterview, setShowFinalInterview] = useState(false);

  const [candidates, setCandidates] = useState([
    {
      id: 1,
      name: "Rahul Sharma",
      email: "rahul@gmail.com",
      phone: "+91 9876543210",
      role: "Software Engineer",
      experience: "2 Years",
      education: "B.Tech CSE",
      skills: "React, Java, Spring Boot",
      botScore: 92,
      technicalScore: 89,
      assignedRole: "",
      status: "Qualified",
    },
    {
      id: 2,
      name: "Anjali Singh",
      email: "anjali@gmail.com",
      phone: "+91 9876543211",
      role: "Frontend Developer",
      experience: "3 Years",
      education: "B.Tech IT",
      skills: "React, JavaScript, HTML, CSS",
      botScore: 95,
      technicalScore: 91,
      assignedRole: "",
      status: "Qualified",
    },
    {
      id: 3,
      name: "Arjun Kumar",
      email: "arjun@gmail.com",
      phone: "+91 9876543212",
      role: "Backend Developer",
      experience: "2 Years",
      education: "B.Tech CSE",
      skills: "Java, Spring Boot, MySQL",
      botScore: 90,
      technicalScore: 88,
      assignedRole: "",
      status: "Qualified",
    },
  ]);

  const filteredCandidates = candidates.filter((candidate) => {

    const matchesSearch =
      candidate.name.toLowerCase().includes(search.toLowerCase()) ||
      candidate.email.toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      role === "" || candidate.role === role;

    const matchesExperience =
      experience === "" ||
      candidate.experience.includes(experience.split("-")[0]);

    const matchesStatus =
      status === "" || candidate.status === status;

    return (
      matchesSearch &&
      matchesRole &&
      matchesExperience &&
      matchesStatus
    );
  });

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

          <h1>2nd Round Qualifiers</h1>

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
          role={role}
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
            `Final Interview Scheduled for ${candidate.name}`
          );

          setShowFinalInterview(false);

        }}

      />

    </div>

  );

}

export default Qualifiers;