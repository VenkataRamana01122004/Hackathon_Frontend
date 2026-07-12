import { Routes, Route, Navigate } from "react-router-dom";
import CandidateNavBar from "./CandidateNavBar";
import CandidateHome from './CandidateHome';
import InterviewPanel from "./InterviewPanel";
import AssignmentPanel from './AssignmentPanel';
import BitsAssessment from "./BitsAssessment";

const CandidateLayout = ({ logout }) => (
  <>
    <CandidateNavBar logout={logout} />

    <Routes>
      <Route path="/" element={<CandidateHome />} />
      <Route path="profile" element={<h2>Profile</h2>} />
      <Route path="interviewpanel" element={<InterviewPanel/>} />
      <Route path="assignment" element={<AssignmentPanel/>}/>
      <Route path="bitsassessment" element={<BitsAssessment/>}/>

      <Route path="*" element={<Navigate to="/candidate" replace />} />
    </Routes>
  </>
);

export default CandidateLayout;