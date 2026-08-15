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
  const base = 'inline-flex items-center justify-center font-medium transition-colors duration-150 ease-in-out rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#3B4A6B] disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-[#3B4A6B] text-white hover:bg-[#4A5B80] active:bg-[#2E3B55]',
    secondary: 'bg-white text-[#171717] border border-[#E5E5E5] hover:bg-[#F5F5F5] active:bg-[#EBEBEB]',
    ghost: 'bg-transparent text-[#737373] hover:bg-[#F5F5F5] hover:text-[#171717]',
    danger: 'bg-white text-[#991B1B] border border-[#E5E5E5] hover:bg-[#FEE2E2] hover:border-[#FCA5A5]',
  };

  const sizes = {
    xs: 'text-xs px-2 py-1 gap-1',
    sm: 'text-sm px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
