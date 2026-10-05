import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import CandidateNavBar from "./CandidateNavBar";
import CandidateHome from './CandidateHome';
import InterviewPanel from "./InterviewPanel";
import AssignmentPanel from './AssignmentPanel';
import BitsAssessment from "./BitsAssessment";
// import SubmissionForm from "./SubmissionForm";

const CandidateLayout = ({ logout }) => {
  useEffect(() => {
    const examInProgress = [
      "exam_running",
      "assignment_running",
      "interview_running"
    ].some((key) => localStorage.getItem(key) === "true");
    const exitAllowed = sessionStorage.getItem("exit_application_allowed") !== "false";

    if (examInProgress || !exitAllowed) {
      window.electronAPI?.hideExitApp?.();
    } else {
      window.electronAPI?.showExitApp?.();
    }
  }, []);

  return <>
    <CandidateNavBar logout={logout} />

    <Routes>
      <Route path="/" element={<CandidateHome />} />
      <Route path="profile" element={<h2>Profile</h2>} />
      {/* <Route path="submission" element={<SubmissionForm />} /> */}
      <Route path="interviewpanel" element={<InterviewPanel/>} />
      <Route path="assignment" element={<AssignmentPanel/>}/>
      <Route path="bitsassessment" element={<BitsAssessment/>}/>

      <Route path="*" element={<Navigate to="/candidate" replace />} />
    </Routes>
  </>;
};

export default CandidateLayout;