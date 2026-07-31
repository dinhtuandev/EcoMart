import React from 'react';
import { ORDER_STATUS_BADGES, ORDER_STATUS_LABELS } from '../../utils/constants';

const Badge = ({ status, children, className = '' }) => {
  const badgeStyle = ORDER_STATUS_BADGES[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  const label = children || ORDER_STATUS_LABELS[status] || status;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeStyle} ${className}`}>
      {label}
    </span>
  );
};

export default Badge;
