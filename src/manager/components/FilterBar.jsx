import "./FilterBar.css";

function FilterBar({
  role,
  setRole,
  experience,
  setExperience,
  status,
  setStatus,
}) {
  return (
    <div className="filter-bar">

      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="">All Roles</option>
        <option>Frontend Developer</option>
        <option>Backend Developer</option>
        <option>Full Stack Developer</option>
        <option>AI Engineer</option>
        <option>ML Engineer</option>
        <option>Cloud Engineer</option>
      </select>

      <select
        value={experience}
        onChange={(e) => setExperience(e.target.value)}
      >
        <option value="">Experience</option>
        <option>0-1 Years</option>
        <option>1-3 Years</option>
        <option>3-5 Years</option>
        <option>5+ Years</option>
      </select>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="">Status</option>
        <option>Eligible</option>
        <option>Interview Scheduled</option>
        <option>Qualified</option>
        <option>Rejected</option>
      </select>

    </div>
  );
}

export default FilterBar;