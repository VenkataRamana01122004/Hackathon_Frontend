import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import bgImage from "../assets/login-bg.jpeg";
import "./Login.css";

export default function Login({ onLogin }) {
  const navigate = useNavigate();

  const [role, setRole] = useState("manager");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
  e.preventDefault();

  console.log("Submit clicked");

  if (!email || !password) {
    console.log("Validation failed");
    alert("Please enter email and password.");
    return;
  }

  console.log("Validation passed");

  localStorage.setItem("role", role);
  onLogin(role);

  console.log("Navigating to:", `/${role}`);

  navigate(`/${role}`);
};

  return (
    <div className="login-page" 
    style={{
    backgroundImage: `url(${bgImage})`,
  }}>
      <div className="login-left">

      </div>

      <div className="login-right">

        <form className="login-card" onSubmit={handleSubmit}>

          <h2>Welcome Back</h2>

          <p>Sign in to continue</p>

          

          <label>Email</label>

          <div className="input-box">
            <Mail size={18} />

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <label>Password</label>

          <div className="input-box">
            <Lock size={18} />

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit">
            Login
          </button>

        </form>

      </div>
    </div>
  );
}