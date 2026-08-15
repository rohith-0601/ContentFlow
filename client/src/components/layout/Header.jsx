export default function Header({ title, description, actions }) {
  return (
    <div className="flex items-center justify-between pb-6">
      <div>
        <h1 className="text-xl font-semibold text-[#171717] tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-[#737373]">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
