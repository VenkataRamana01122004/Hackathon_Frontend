import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../candidate/candidate.css";

function Login({ onLogin }) {
  const navigate = useNavigate();

  useEffect(() => {
    const exitAllowed = sessionStorage.getItem("exit_application_allowed") !== "false";
    if (exitAllowed) {
      window.electronAPI?.showExitApp?.();
    } else {
      window.electronAPI?.hideExitApp?.();
    }
  }, []);

  const [data, setData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setError("");
    setData({
      ...data,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!data.email.trim() || !data.password) {
      setError("Enter your email and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        data,
        { timeout: 10000 }
      );

      // store user
      localStorage.setItem("user", JSON.stringify(res.data.user));
      console.log(res.data.user);

      const role = res.data.role?.toLowerCase(); // ✅ normalize role

      if (role === "manager") {
        onLogin("manager");
        navigate("/manager", { replace: true });
      } 
      else if (role === "employee") {
        onLogin("employee");
        navigate("/employee", { replace: true });
      } 
      else if (role === "candidate") {
        onLogin("candidate");
        navigate("/candidate", { replace: true });
      } 
      else {
        setError("Your account does not have a supported role.");
      }

    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 404) {
        setError("Invalid email or password.");
      } else if (err.code === "ECONNABORTED") {
        setError("Login timed out. Make sure the backend and database are running.");
      } else {
        setError("Unable to connect to the login service. Please try again.");
      }
      console.log(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-shell">
      <form className="login-card login-form" onSubmit={handleSubmit} noValidate>
        <h1 className="login-title">Sign In</h1>
        <p className="login-subtitle">Access your assessment workspace</p>
        <label className="login-label" htmlFor="login-email">Email</label>
        <input
          id="login-email"
          name="email"
          type="email"
          value={data.email}
          onChange={handleChange}
          placeholder="Email"
          autoComplete="username"
          disabled={isSubmitting}
        />

        <label className="login-label" htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          name="password"
          value={data.password}
          onChange={handleChange}
          placeholder="Password"
          autoComplete="current-password"
          disabled={isSubmitting}
        />

        {error && <p className="login-error" role="alert">{error}</p>}

        <button className="btn btn--submit login-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default Login;