import { getStatusBadgeInfo } from '../../utils/helpers';

export default function StatusBadge({ status, className = '' }) {
  const info = getStatusBadgeInfo(status);
  
  return (
    <span className={`status-badge ${info.class} ${className}`}>
      {info.text}
    </span>
  );
}
