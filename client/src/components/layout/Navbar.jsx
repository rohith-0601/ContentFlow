import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Columns3,
  Users,
  MessageSquare,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/content', label: 'Content', icon: FileText },
  { to: '/sprint', label: 'Sprint Board', icon: Columns3 },
  { to: '/standup', label: 'Standup', icon: Users },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E5E5E5]"
      style={{ height: '64px' }}
    >
      <div className="flex items-center justify-between h-full"
        style={{ padding: '0 40px' }}
      >
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-10 h-full">
          {/* Wordmark */}
          <div className="flex items-center gap-2 shrink-0">
            <div
              className="rounded-sm bg-[#3B4A6B]"
              style={{ width: '6px', height: '6px' }}
            />
            <span className="text-base font-semibold text-[#171717] tracking-tight">
              ContentFlow
            </span>
          </div>

          {/* Nav Links */}
          <div className="flex items-center gap-1 h-full">
            {navItems.map((item) => {
              const isActive =
                item.to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.to);

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="relative flex items-center gap-1.5 h-full px-3 text-sm transition-colors duration-150"
                  style={{
                    fontWeight: 500,
                    fontSize: '14px',
                    color: isActive ? '#171717' : '#737373',
                  }}
                >
                  <item.icon
                    size={16}
                    strokeWidth={1.75}
                    style={{ color: isActive ? '#3B4A6B' : '#737373' }}
                  />
                  <span>{item.label}</span>

                  {/* Active indicator — 2px bottom border */}
                  {isActive && (
                    <div
                      className="absolute bottom-0 left-3 right-3"
                      style={{
                        height: '2px',
                        backgroundColor: '#3B4A6B',
                        borderRadius: '2px 2px 0 0',
                      }}
                    />
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Right: version */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#A3A3A3]">v1.0.0</span>
        </div>
      </div>
    </nav>
  );
}
