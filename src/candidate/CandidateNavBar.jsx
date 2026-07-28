import { Link, useNavigate } from "react-router-dom";
import "./candidate.css";


function CandidateNavBar({ logout }) {
   const navigate = useNavigate();

    const handleLogout = () => {
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