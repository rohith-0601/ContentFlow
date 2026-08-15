export default function Card({ children, className = '', padding = true, elevated = false }) {
  const baseStyles = {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E5E5E5',
    borderRadius: '6px',
    ...(padding ? { padding: '20px' } : {}),
    ...(elevated
      ? { boxShadow: '2px 2px 6px rgba(0,0,0,0.04), -1px -1px 3px rgba(255,255,255,0.6)', border: 'none' }
      : {}),
  };

  return (
    <div className={className} style={baseStyles}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div
      className={className}
      style={{ paddingBottom: '12px', marginBottom: '12px', borderBottom: '1px solid #F0F0F0' }}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3
      className={`section-label ${className}`}
    >
      {children}
    </h3>
  );
}
