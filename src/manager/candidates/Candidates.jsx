import { useState } from "react";

import SearchBar from "../components/SearchBar";
import FilterBar from "../components/FilterBar";
import CandidateTable from "../components/CandidateTable";
import CandidateModal from "../components/CandidateModal";
import ResumeModal from "../components/ResumeModal";
import ScheduleModal from "../components/ScheduleModal";

import "./Candidate.css";

function Candidates() {

  const [search, setSearch] = useState("");

  const [role, setRole] = useState("");

  const [experience, setExperience] = useState("");

  const [status, setStatus] = useState("");

  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const [showDetails, setShowDetails] = useState(false);

  const [showResume, setShowResume] = useState(false);

  const candidates = [

    {
      id: 1,
      name: "Rahul Sharma",
      email: "rahul@gmail.com",
      phone: "+91 9876543210",
      role: "Frontend Developer",
      experience: "2 Years",
      education: "B.Tech CSE",
      skills: "React, JavaScript, HTML, CSS",
      status: "Eligible",
    },

    {
      id: 2,
      name: "Anjali Singh",
      email: "anjali@gmail.com",
      phone: "+91 9876543211",
      role: "Backend Developer",
      experience: "3 Years",
      education: "B.Tech IT",
      skills: "Java, Spring Boot, MySQL",
      status: "Interview Scheduled",
    },

    {
      id: 3,
      name: "Arun Kumar",
      email: "arun@gmail.com",
      phone: "+91 9876543212",
      role: "AI Engineer",
      experience: "1 Year",
      education: "M.Tech AI",
      skills: "Python, TensorFlow, PyTorch",
      status: "Qualified",
    },

    {
      id: 4,
      name: "Priya Reddy",
      email: "priya@gmail.com",
      phone: "+91 9876543213",
      role: "Cloud Engineer",
      experience: "5 Years",
      education: "B.Tech CSE",
      skills: "AWS, Docker, Kubernetes",
      status: "Eligible",
    }

  ];

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

    </div>

  );

}

export default Candidates;