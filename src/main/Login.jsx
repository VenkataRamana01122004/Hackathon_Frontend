import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        data
      );

      // store user
      localStorage.setItem("user", JSON.stringify(res.data.user));

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
        alert("Unknown role");
      }

    } catch (err) {
      alert("Invalid Login");
      console.log(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="email"
        onChange={handleChange}
        placeholder="Email"
      />

      <input
        type="password"
        name="password"
        onChange={handleChange}
        placeholder="Password"
      />

      <button type="submit">Login</button>
    </form>
  );
}

export default Login;