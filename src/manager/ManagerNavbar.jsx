import { Link, useNavigate } from "react-router-dom";

function ManagerNavBar({ logout }) {

    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (

        <nav>

            <h2>Manager Panel</h2>

            <Link to="/manager">Home</Link>

            {" | "}

            <Link to="/manager/employees">Employees</Link>

            {" | "}

            <button onClick={handleLogout}>
                Logout
            </button>

            <hr />

        </nav>

    );

}

export default ManagerNavBar;