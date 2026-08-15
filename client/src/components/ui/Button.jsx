export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 500,
    fontFamily: "'Inter', sans-serif",
    borderRadius: '6px',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'all 0.15s ease',
    outline: 'none',
  };

  const variantStyles = {
    primary: {
      backgroundColor: '#3B4A6B',
      color: '#FFFFFF',
    },
    secondary: {
      backgroundColor: '#FFFFFF',
      color: '#171717',
      border: '1px solid #E5E5E5',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#737373',
    },
    danger: {
      backgroundColor: '#FFFFFF',
      color: '#991B1B',
      border: '1px solid #E5E5E5',
    },
  };

  const sizeStyles = {
    xs: { fontSize: '12px', padding: '4px 8px', gap: '4px' },
    sm: { fontSize: '13px', padding: '6px 12px', gap: '6px' },
    md: { fontSize: '14px', padding: '8px 16px', gap: '8px' },
    lg: { fontSize: '14px', padding: '10px 20px', gap: '8px' },
  };

  const style = {
    ...baseStyle,
    ...variantStyles[variant],
    ...sizeStyles[size],
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={className}
      style={style}
      onMouseEnter={(e) => {
        if (disabled) return;
        if (variant === 'primary') e.target.style.backgroundColor = '#4A5B80';
        if (variant === 'secondary') e.target.style.backgroundColor = '#F9F9F9';
        if (variant === 'ghost') {
          e.target.style.backgroundColor = '#F5F5F5';
          e.target.style.color = '#171717';
        }
        if (variant === 'danger') e.target.style.backgroundColor = '#FEF2F2';
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        if (variant === 'primary') e.target.style.backgroundColor = '#3B4A6B';
        if (variant === 'secondary') e.target.style.backgroundColor = '#FFFFFF';
        if (variant === 'ghost') {
          e.target.style.backgroundColor = 'transparent';
          e.target.style.color = '#737373';
        }
        if (variant === 'danger') e.target.style.backgroundColor = '#FFFFFF';
      }}
      {...props}
    >
      {children}
    </button>
  );
}
