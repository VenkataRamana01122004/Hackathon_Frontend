import { useState, useEffect } from "react";
import axios from "axios";

import SearchBar from "../components/SearchBar";
import FilterBar from "../components/FilterBar";
import CandidateScheduleTable from "../components/CandidateScheduleTable";
import CandidateModal from "../components/CandidateModal";
import ScheduleModal from "../components/ScheduleModal";
import { FaPlus } from "react-icons/fa";
import "./ExamSchedule.css";

function ExamSchedule() {

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


const handleSchedule = async (updatedCandidate) => {
  const response = await axios.put(
    `http://localhost:5000/api/manager/updateCandidateSchedule/${updatedCandidate.id}`,
    {
      examDate: updatedCandidate.examDate,
      examTime: updatedCandidate.examTime,
      isRandomSchedule: updatedCandidate.isRandomSchedule,
    }
  );

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to update schedule");
  }

  setCandidates((prev) =>
    prev.map((candidate) =>
      candidate.id === updatedCandidate.id
        ? { ...candidate, ...response.data.candidate }
        : candidate
    )
  );
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

      <CandidateScheduleTable
        candidates={filteredCandidates}
        onView={openCandidate}
        onResume={openResume}
        onSchedule={scheduleInterview}
      />
      <CandidateModal
        candidate={showDetails ? selectedCandidate : null}
        onClose={() => setShowDetails(false)}
      />
      
<ScheduleModal
  candidate={showSchedule ? selectedCandidate : null}
  onClose={() => setShowSchedule(false)}
  onSchedule={handleSchedule}
/>


    </div>

  );

}

export default ExamSchedule;