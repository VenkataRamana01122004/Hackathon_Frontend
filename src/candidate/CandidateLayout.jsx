import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import CandidateNavBar from "./CandidateNavBar";
import CandidateHome from './CandidateHome';
import CandidateProfile from './CandidateProfile';
import AssignmentPanel from './AssignmentPanel';
import BitsAssessment from "./BitsAssessment";
// import SubmissionForm from "./SubmissionForm";

const CandidateLayout = ({ logout }) => {
  useEffect(() => {
    // The exit control belongs on the logged-out login screen only.
    window.electronAPI?.hideExitApp?.();
  }, []);

  return <>
    <CandidateNavBar logout={logout} />

    <Routes>
      <Route path="/" element={<CandidateHome />} />
      <Route path="profile" element={<CandidateProfile />} />
      <Route path="assignment" element={<AssignmentPanel/>}/>
      <Route path="bitsassessment" element={<BitsAssessment/>}/>

      <Route path="*" element={<Navigate to="/candidate" replace />} />
    </Routes>
  </>;
};

export default CandidateLayout;