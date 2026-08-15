const STATUS_CONFIG = {
  // Content statuses
  Draft: { bg: 'bg-[#F5F5F5]', text: 'text-[#525252]', border: 'border-[#D4D4D4]' },
  'In Review': { bg: 'bg-[#DBEAFE]', text: 'text-[#1E40AF]', border: 'border-[#93C5FD]' },
  Approved: { bg: 'bg-[#EDF2EF]', text: 'text-[#2F4F3E]', border: 'border-[#A7C4B5]' },
  Published: { bg: 'bg-[#E8EBF0]', text: 'text-[#3B4A6B]', border: 'border-[#9AA5BD]' },

  // Priority levels
  Low: { bg: 'bg-[#F5F5F5]', text: 'text-[#525252]', border: 'border-[#D4D4D4]' },
  Medium: { bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]', border: 'border-[#FCD34D]' },
  High: { bg: 'bg-[#FEE2E2]', text: 'text-[#991B1B]', border: 'border-[#FCA5A5]' },

  // Columns
  Backlog: { bg: 'bg-[#F5F5F5]', text: 'text-[#525252]', border: 'border-[#D4D4D4]' },
  'In Progress': { bg: 'bg-[#DBEAFE]', text: 'text-[#1E40AF]', border: 'border-[#93C5FD]' },
  QA: { bg: 'bg-[#FEF3C7]', text: 'text-[#92400E]', border: 'border-[#FCD34D]' },
  Done: { bg: 'bg-[#EDF2EF]', text: 'text-[#2F4F3E]', border: 'border-[#A7C4B5]' },
};

export default function StatusBadge({ status, size = 'sm' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.Draft;
  const sizeClasses = size === 'xs'
    ? 'text-[11px] px-1.5 py-0.5'
    : 'text-xs px-2 py-0.5';

  return (
    <span
      className={`inline-flex items-center font-medium rounded ${config.bg} ${config.text} border ${config.border} ${sizeClasses}`}
    >
      {status}
    </span>
  );
}
