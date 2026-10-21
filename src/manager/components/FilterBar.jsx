import "./FilterBar.css";
import GlassSelect from "./GlassSelect";

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

      <GlassSelect
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="">Roles</option>
        <option>Frontend Developer</option>
        <option>Backend Developer</option>
        <option>Full Stack Developer</option>
        <option>AI Engineer</option>
        <option>ML Engineer</option>
        <option>Cloud Engineer</option>
      </GlassSelect>

      <GlassSelect
        value={experience}
        onChange={(e) => setExperience(e.target.value)}
      >
        <option value="">Experience</option>
        <option value="0-2">0-2 Years</option>
        <option value="3-5">3-5 Years</option>
        <option value="6-10">6-10 Years</option>
        <option value="11-100">11+ Years</option>
      </GlassSelect>

      <GlassSelect
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="">Status</option>
        <option>Eligible</option>
        <option>Interview Scheduled</option>
        <option>Qualified</option>
        <option>Rejected</option>
      </GlassSelect>

    </div>
  );
}

export default FilterBar;