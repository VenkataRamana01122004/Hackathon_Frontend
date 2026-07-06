import { Link, useNavigate } from "react-router-dom";

function EmployeeNavBar({ logout }) {
   const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (

        <nav>

            <h2>Employee Panel</h2>

            <Link to="/employee">Home</Link>

            {" | "}

            <Link to="/employee/profile">profile</Link>

            {" | "}

            <button onClick={handleLogout}>
                Logout
            </button>

            <hr />

        </nav>

    );
}

export default EmployeeNavBar