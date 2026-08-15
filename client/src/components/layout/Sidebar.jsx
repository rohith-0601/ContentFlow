import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Columns3,
  Users,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/content', label: 'Content', icon: FileText },
  { to: '/sprint', label: 'Sprint Board', icon: Columns3 },
  { to: '/standup', label: 'Standup', icon: Users },
];

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-56 bg-white border-r border-[#E5E5E5] flex flex-col z-40">
      <div className="px-5 py-5 border-b border-[#E5E5E5]">
        <h1 className="text-base font-semibold text-[#171717] tracking-tight">
          ContentFlow
        </h1>
      </div>

      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-0.5">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 text-sm rounded transition-colors duration-150 ${
                    isActive
                      ? 'bg-[#E8EBF0] text-[#3B4A6B] font-medium'
                      : 'text-[#737373] hover:bg-[#F5F5F5] hover:text-[#171717]'
                  }`
                }
              >
                <item.icon size={16} strokeWidth={1.75} />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="px-5 py-4 border-t border-[#E5E5E5]">
        <p className="text-xs text-[#A3A3A3]">v1.0.0</p>
      </div>
    </aside>
  );
}
