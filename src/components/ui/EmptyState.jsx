import { Link } from 'react-router-dom';

export default function EmptyState({ icon = '📭', title, description, actionLabel, actionTo, onAction }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon" aria-hidden="true">{icon}</div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn btn-primary">{actionLabel}</Link>
      )}
      {actionLabel && onAction && !actionTo && (
        <button type="button" className="btn btn-primary" onClick={onAction}>{actionLabel}</button>
      )}
    </div>
  );
}
