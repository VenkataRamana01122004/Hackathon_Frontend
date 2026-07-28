import { useState } from "react";
import axios from "axios";
import "./AddCandidateModal.css";

function AddCandidateModal({ isOpen, onClose }) {
  const [candidate, setCandidate] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    gender: "",
    dob: "",
    qualification: "",
    experience: "",
    skills: "",
    appliedRole: "",
    status: "Registered",
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !candidate.fullName ||
      !candidate.email ||
      !candidate.password ||
      !candidate.phone
    ) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("fullName", candidate.fullName);
      formData.append("email", candidate.email);
      formData.append("password", candidate.password);
      formData.append("phone", candidate.phone);
      formData.append("gender", candidate.gender);
      formData.append("dob", candidate.dob);
      formData.append("qualification", candidate.qualification);
      formData.append("experience", candidate.experience);
      formData.append("skills", candidate.skills);
      formData.append("appliedRole", candidate.appliedRole);
      formData.append("status", candidate.status);

      if (candidate.resume) {
        formData.append("resume", candidate.resume);
      }

      const response = await axios.post(
        "http://localhost:5000/api/manager/addcandidate",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert(response.data.message || "Candidate added successfully!");

      setCandidate({
        fullName: "",
        email: "",
        password: "Candidate@ncr2026",
        phone: "",
        gender: "",
        dob: "",
        qualification: "",
        experience: "",
        skills: "",
        appliedRole: "",
        status: "Registered",
        resume: null,
      });

      onClose();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message || "Failed to add candidate."
      );
    }
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
                name="fullName"
                value={candidate.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={candidate.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                name="password"
                value={candidate.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone *</label>
              <input
                type="text"
                name="phone"
                value={candidate.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Gender</label>
              <select
                name="gender"
                value={candidate.gender}
                onChange={handleChange}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={candidate.dob}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Qualification</label>
              <input
                type="text"
                name="qualification"
                value={candidate.qualification}
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
                placeholder="e.g. 2 Years"
              />
            </div>

            <div className="form-group">
              <label>Applied Role</label>
              <input
                type="text"
                name="appliedRole"
                value={candidate.appliedRole}
                onChange={handleChange}
                placeholder="e.g. Frontend Developer"
              />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select
                name="status"
                value={candidate.status}
                onChange={handleChange}
              >
                <option value="Registered">Registered</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Interview Scheduled">
                  Interview Scheduled
                </option>
                <option value="Interviewing">Interviewing</option>
                <option value="Completed">Completed</option>
                <option value="Selected">Selected</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Skills</label>
            <textarea
              rows="3"
              name="skills"
              value={candidate.skills}
              onChange={handleChange}
              placeholder="React, Node.js, SQL..."
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