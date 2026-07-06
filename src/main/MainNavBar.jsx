import { Link } from "react-router-dom";

function MainNavBar() {

    return (

        <nav>

            <h2>Interview Portal</h2>

            <Link to="/">Home</Link>

            {" | "}

            <Link to="/login">Login</Link>

            <hr />

        </nav>

    );

}

export default MainNavBar;