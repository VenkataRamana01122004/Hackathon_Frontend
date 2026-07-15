import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login({ onLogin }) {
  const navigate = useNavigate();

  const [data, setData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value
    });
  };

  // Demo bypass — no backend needed
  const demoLogin = (role) => {
    localStorage.setItem("role", role);
    localStorage.setItem("user", JSON.stringify({ name: role === "employee" ? "Sreelakshmi R" : "John Manager", role }));
    onLogin(role);
    navigate(`/${role}`, { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        data
      );
      localStorage.setItem("user", JSON.stringify(res.data.user));
      const role = res.data.role?.toLowerCase();
      if (role === "manager") { onLogin("manager"); navigate("/manager", { replace: true }); }
      else if (role === "employee") { onLogin("employee"); navigate("/employee", { replace: true }); }
      else if (role === "candidate") { onLogin("candidate"); navigate("/candidate", { replace: true }); }
      else { alert("Unknown role"); }
    } catch (err) {
      console.log("Backend not available, use Demo Login below.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>🏢 Interview Portal</h1>
          <p>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label>Email</label>
            <input
              name="email"
              type="email"
              onChange={handleChange}
              placeholder="Enter your email"
              id="login-email"
            />
          </div>
          <div className="login-field">
            <label>Password</label>
            <input
              type="password"
              name="password"
              onChange={handleChange}
              placeholder="Enter your password"
              id="login-password"
            />
          </div>
          <button type="submit" className="login-btn" id="login-submit">
            Sign In
          </button>
        </form>

        <div className="login-divider">
          <span>— Demo Login (No Backend Required) —</span>
        </div>

        <div className="demo-btns">
          <button
            className="demo-btn demo-employee"
            onClick={() => demoLogin("employee")}
            id="demo-employee-btn"
          >
            👤 Login as Employee
          </button>
          <button
            className="demo-btn demo-manager"
            onClick={() => demoLogin("manager")}
            id="demo-manager-btn"
          >
            🏢 Login as Manager
          </button>
        </div>
      </div>
    </div>
  );
}
export default Login;