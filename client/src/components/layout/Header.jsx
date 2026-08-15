export default function Header({ title, description, actions }) {
  return (
    <div className="flex items-end justify-between animate-fade-in" style={{ paddingBottom: '32px' }}>
      <div>
        <h1
          className="text-[#171717] tracking-tight"
          style={{ fontSize: '28px', fontWeight: 600, lineHeight: 1.2 }}
        >
          {title}
        </h1>
        {description && (
          <p
            className="text-[#737373]"
            style={{ fontSize: '14px', marginTop: '6px' }}
          >
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
