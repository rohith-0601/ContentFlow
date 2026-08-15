export default function Card({ children, className = '', padding = true }) {
  return (
    <div
      className={`bg-white border border-[#E5E5E5] rounded ${padding ? 'p-5' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`pb-3 mb-3 border-b border-[#E5E5E5] ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-sm font-semibold text-[#171717] ${className}`}>
      {children}
    </h3>
  );
}
