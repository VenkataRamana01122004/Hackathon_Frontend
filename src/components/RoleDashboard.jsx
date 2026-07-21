import { Link } from 'react-router-dom';
import './RoleDashboard.css';

function RoleDashboard({ title, subtitle, actions, accent = 'candidate' }) {
  return (
    <div className={`role-dashboard ${accent}`}>
      <div className="role-dashboard__hero">
        <div>
          <p className="role-dashboard__eyebrow">Welcome back</p>
          <h1>{title}</h1>
          <p className="role-dashboard__subtitle">{subtitle}</p>
        </div>
      </div>

      <div className="role-dashboard__grid">
        {actions.map((action, index) => {
          const Icon = action.icon;

          return (
            <Link key={index} to={action.to} className="role-dashboard__card">
              <div className="role-dashboard__icon-wrap">
                <Icon size={22} />
              </div>
              <div>
                <h3>{action.title}</h3>
                <p>{action.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default RoleDashboard;
