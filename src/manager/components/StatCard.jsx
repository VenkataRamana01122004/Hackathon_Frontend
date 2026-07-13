import "./StatCard.css";

function StatCard({ title, value, icon, color, onClick }) {
  return (
    <div
      className="stat-card"
      style={{ borderLeft: `6px solid ${color}` }}
      onClick={onClick}
    >
      <div className="stat-left">
        <h4>{title}</h4>
        <h2>{value}</h2>
      </div>

      <div
        className="stat-icon"
        style={{ background: color }}
      >
        {icon}
      </div>
    </div>
  );
}

export default StatCard;