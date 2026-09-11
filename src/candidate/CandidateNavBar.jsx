import { Link, useNavigate } from "react-router-dom";
import "./candidate.css";


function CandidateNavBar({ logout }) {
   const navigate = useNavigate();

    const handleLogout = () => {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const completedStatuses = ["process", "passed", "completed", "submitted", "qualified"];
        const examStarted = [user.bitsExamStatus, user.codingExamStatus, user.interviewStatus]
            .some((status) => completedStatuses.includes(String(status || "pending").trim().toLowerCase()));
        const allExamsCompleted = [user.bitsExamStatus, user.codingExamStatus, user.interviewStatus]
            .every((status) => completedStatuses.includes(String(status || "pending").trim().toLowerCase()));

        sessionStorage.setItem(
            "exit_application_allowed",
            String(!examStarted || allExamsCompleted)
        );
        if (!examStarted || allExamsCompleted) {
            window.electronAPI?.showExitApp?.();
        } else {
            window.electronAPI?.hideExitApp?.();
        }
        logout();
        navigate("/login");
    };

    return (

        <nav>

            <h2>Candidate Panel</h2>

            <Link to="/candidate">Home</Link>

            {" | "}

            <Link to="/candidate/profile">profile</Link>

            {" | "}

            <button onClick={handleLogout}>
                Logout
            </button>

            <hr />

        </nav>

    );
}

export default CandidateNavBar