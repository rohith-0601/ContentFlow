const DOT_COLORS = {
  // Content statuses
  Draft: '#737373',
  'In Review': '#B8860B',
  Approved: '#3B4A6B',
  Published: '#2F4F3E',

  // Priority levels
  Low: '#737373',
  Medium: '#B8860B',
  High: '#DC2626',

  // Sprint columns
  Backlog: '#737373',
  'In Progress': '#B8860B',
  QA: '#3B4A6B',
  Done: '#2F4F3E',
};

export default function StatusBadge({ status, size = 'sm' }) {
  const dotColor = DOT_COLORS[status] || '#737373';
  const dotSize = size === 'xs' ? '5px' : '6px';
  const fontSize = size === 'xs' ? '10px' : '11px';

  return (
    <span
      className="inline-flex items-center"
      style={{
        gap: '6px',
        fontSize,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.03em',
        color: '#171717',
      }}
    >
      <span
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: '50%',
          backgroundColor: dotColor,
          flexShrink: 0,
        }}
      />
      {status}
    </span>
  );
}
