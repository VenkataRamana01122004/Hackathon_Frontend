import { useState } from "react";
import "./AddCandidateModal.css";

function AddCandidateModal({ isOpen, onClose, onAdd }) {
  const [candidate, setCandidate] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    experience: "",
    education: "",
    skills: "",
    status: "Eligible",
    resume: null,
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setCandidate((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleResume = (e) => {
    setCandidate((prev) => ({
      ...prev,
      resume: e.target.files[0],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !candidate.name ||
      !candidate.email ||
      !candidate.role
    ) {
      alert("Please fill all required fields.");
      return;
    }

    onAdd({
      id: Date.now(),
      ...candidate,
      resume: candidate.resume
        ? candidate.resume.name
        : "No Resume",
    });

    setCandidate({
      name: "",
      email: "",
      phone: "",
      role: "",
      experience: "",
      education: "",
      skills: "",
      status: "Eligible",
      resume: null,
    });

    onClose();
  };

  return (
    <div className="modal-overlay">

      <div className="add-candidate-modal">

        <h2>Add Candidate</h2>

        <form onSubmit={handleSubmit}>

          <div className="form-grid">

            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                value={candidate.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={candidate.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="text"
                name="phone"
                value={candidate.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Role *</label>
              <input
                type="text"
                name="role"
                value={candidate.role}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Experience</label>
              <input
                type="text"
                name="experience"
                value={candidate.experience}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Education</label>
              <input
                type="text"
                name="education"
                value={candidate.education}
                onChange={handleChange}
              />
            </div>

          </div>

          <div className="form-group">
            <label>Skills</label>
            <textarea
              rows="3"
              name="skills"
              value={candidate.skills}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Resume</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleResume}
            />
          </div>

          <div className="modal-buttons">

            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-btn"
            >
              Add Candidate
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default AddCandidateModal;