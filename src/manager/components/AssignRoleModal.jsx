import { useState, useEffect } from "react";
import { FaTimes, FaUserTie, FaBriefcase, FaCheckCircle } from "react-icons/fa";
import "./AssignRoleModal.css";

function AssignRoleModal({ candidate, onClose, onSave }) {

  const [selectedRole, setSelectedRole] = useState("");
  const [comments, setComments] = useState("");

  useEffect(() => {
    if (candidate) {
      setSelectedRole(candidate.assignedRole || "");
      setComments(candidate.comments || "");
    }
  }, [candidate]);

  if (!candidate) return null;

  const roles = [
    "Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "QA Engineer",
    "DevOps Engineer",
    "Cloud Engineer",
    "AI Engineer",
    "ML Engineer",
    "Data Engineer"
  ];

  const handleSave = () => {

    if (!selectedRole) {
      alert("Please select a role.");
      return;
    }

    onSave({
      ...candidate,
      assignedRole: selectedRole,
      comments
    });

    onClose();
  };

  return (
    <div className="role-overlay">

      <div className="role-modal">

        <div className="role-header">

          <h2>Assign Suitable Role</h2>

          <button onClick={onClose}>
            <FaTimes />
          </button>

        </div>

        <div className="candidate-summary">

          <div className="candidate-avatar">
            {candidate.name.charAt(0)}
          </div>

          <div>

            <h3>{candidate.name}</h3>

            <p>{candidate.email}</p>

          </div>

        </div>

        <div className="role-info">

          <div className="info-box">

            <FaBriefcase />

            <div>

              <span>Applied Role</span>

              <strong>{candidate.role}</strong>

            </div>

          </div>

          <div className="info-box">

            <FaUserTie />

            <div>

              <span>Experience</span>

              <strong>{candidate.experience}</strong>

            </div>

          </div>

        </div>

        <div className="form-group">

          <label>Assign Suitable Role</label>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="">Select Role</option>

            {roles.map((role) => (
              <option key={role}>
                {role}
              </option>
            ))}

          </select>

        </div>

        <div className="form-group">

          <label>Manager Comments</label>

          <textarea
            rows="4"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Enter remarks..."
          />

        </div>

        <div className="role-footer">

          <button
            className="save-role-btn"
            onClick={handleSave}
          >

            <FaCheckCircle />

            Save Role

          </button>

        </div>

      </div>

    </div>
  );
}

export default AssignRoleModal;