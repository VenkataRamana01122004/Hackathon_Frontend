import "./EmpStatCard.css";

function EmpStatCard({ title, value, icon, color, onClick, subtitle }) {
  return (
    <div
      className="emp-stat-card"
      style={{ borderLeft: `6px solid ${color}` }}
      onClick={onClick}
    >
      <div className="emp-stat-left">
        <h4>{title}</h4>
        <h2>{value}</h2>
        {subtitle && <span className="emp-stat-subtitle">{subtitle}</span>}
      </div>
      <div className="emp-stat-icon" style={{ background: color }}>
        {icon}
      </div>
    </div>
  );
}

export default EmpStatCard;
