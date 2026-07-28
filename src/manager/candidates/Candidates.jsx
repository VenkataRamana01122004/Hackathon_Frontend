import { useState, useEffect } from "react";
import axios from "axios";

import SearchBar from "../components/SearchBar";
import FilterBar from "../components/FilterBar";
import CandidateTable from "../components/CandidateTable";
import CandidateModal from "../components/CandidateModal";
import ResumeModal from "../components/ResumeModal";
import ScheduleModal from "../components/ScheduleModal";
import AddCandidateModal from "../components/AddCandidateModal";
import { FaPlus } from "react-icons/fa";
import "./Candidate.css";

function Candidates() {

  const [search, setSearch] = useState("");
  const [appliedRole, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [status, setStatus] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [candidates, setCandidates] = useState([]);

  const [showAddCandidate, setShowAddCandidate] = useState(false);

  useEffect(() => {
  fetchCandidates();
}, []);

const fetchCandidates = async () => {
  try {
    const response = await axios.get(
      "http://localhost:5000/api/manager/viewcandidate"
    );

    if (Array.isArray(response.data)) {
      setCandidates(response.data);
    }
    else {
      setCandidates([]);
    }

  } catch (error) {
    console.error("Error fetching candidates:", error);
    setCandidates([]);
  }
};

const filteredCandidates = (Array.isArray(candidates) ? candidates : []).filter((candidate) => {

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

  const openCandidate = (candidate) => {

    setSelectedCandidate(candidate);

    setShowDetails(true);

  };

  const openResume = (candidate) => {

    setSelectedCandidate(candidate);

    setShowResume(true);

  };

const [showSchedule, setShowSchedule] = useState(false);

const scheduleInterview = (candidate) => {

    setSelectedCandidate(candidate);

    setShowSchedule(true);

};



  return (

    <div className="candidate-page">

      <div className="candidate-top">

        <h1>Candidates</h1>

          <button
          className="add-candidate-btn"
          onClick={() => setShowAddCandidate(true)}
        >
          <FaPlus />
          <span>Add Candidate</span>

        </button>

      </div>

      <div className="candidate-toolbar">

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
        onView={openCandidate}
        onResume={openResume}
        onSchedule={scheduleInterview}
      />
      <CandidateModal
        candidate={showDetails ? selectedCandidate : null}
        onClose={() => setShowDetails(false)}
      />

      <ResumeModal

        candidate={showResume ? selectedCandidate : null}

        onClose={() => setShowResume(false)}

      />
      <ScheduleModal
        candidate={showSchedule ? selectedCandidate : null}
        onClose={() => setShowSchedule(false)}

      />

      <AddCandidateModal
        isOpen={showAddCandidate}
        onClose={() => setShowAddCandidate(false)}
      />

    </div>

  );

}

export default Candidates;