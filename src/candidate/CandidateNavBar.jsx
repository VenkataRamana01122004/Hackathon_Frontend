import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./candidate.css";

function CandidateNavBar({ logout }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [isExamInProgress, setIsExamInProgress] = useState(false);

    useEffect(() => {
        const examRoutes = [
            "/candidate/bitsassessment",
            "/candidate/assignment",
            "/candidate/interviewpanel"
        ];
        const isExamRoute = examRoutes.some((route) => location.pathname.startsWith(route));
        const updateExamState = () => {
            setIsExamInProgress(isExamRoute && [
                "exam_running",
                "assignment_running",
                "interview_running"
            ].some((key) => localStorage.getItem(key) === "true"));
        };

        updateExamState();
        const intervalId = window.setInterval(updateExamState, 250);
        return () => window.clearInterval(intervalId);
    }, [location.pathname]);

    const handleLogout = async () => {
        let user = {};
        try {
            const parsed = JSON.parse(localStorage.getItem("user") || "{}");
            user = parsed && typeof parsed === "object" ? parsed : {};
        } catch (error) {
            console.error("Unable to read candidate session:", error);
        }
        const completedStatuses = ["process", "passed", "completed", "submitted", "qualified"];
        const examStarted = [user.bitsExamStatus, user.codingExamStatus, user.interviewStatus]
            .some((status) => completedStatuses.includes(String(status || "pending").trim().toLowerCase()));
        const allExamsCompleted = [user.bitsExamStatus, user.codingExamStatus, user.interviewStatus]
            .every((status) => completedStatuses.includes(String(status || "pending").trim().toLowerCase()));
        const examInProgress = ["exam_running", "assignment_running", "interview_running"]
            .some((key) => localStorage.getItem(key) === "true");
        const hasStartedExam = examStarted || examInProgress;

        sessionStorage.setItem(
            "exit_application_allowed",
            String(!hasStartedExam || allExamsCompleted)
        );
        if (!hasStartedExam || allExamsCompleted) {
                // Ensure Electron has ended any stale exam state before showing exit.
                await window.electronAPI?.stopExam?.();
                window.electronAPI?.showExitApp?.();
            } else {
                window.electronAPI?.hideExitApp?.();
            }
            logout();
            navigate("/login");
            if (!hasStartedExam || allExamsCompleted) {
                // The login page can mount before the exit window finishes updating.
                window.setTimeout(() => window.electronAPI?.showExitApp?.(), 100);
            }
    };

    return (

        <nav>

            <h2>Candidate Panel</h2>

            <Link to="/candidate">Home</Link>

            {" | "}

            <Link to="/candidate/profile">profile</Link>

            {" | "}

            {!isExamInProgress && (
                <button onClick={handleLogout}>
                    Logout
                </button>
            )}

            <hr />

        </nav>

    );
}

export default CandidateNavBar