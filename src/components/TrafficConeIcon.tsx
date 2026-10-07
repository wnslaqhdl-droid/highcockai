import React from 'react';

export const TrafficConeIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2L4 19H2V21H22V19H20L12 2ZM12 6.5L15.3 14H8.7L12 6.5ZM7.8 16H16.2L17.5 19H6.5L7.8 16Z" />
    </svg>
  );
};
