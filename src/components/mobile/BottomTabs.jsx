import { useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Briefcase, Globe, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'teachers', label: 'Teachers', icon: BookOpen, path: '/teachers' },
  { id: 'business', label: 'Business', icon: Briefcase, path: '/business' },
  { id: 'website', label: 'Website', icon: Globe, path: '/website' },
  { id: 'security', label: 'Security', icon: Shield, path: '/security' },
];

export default function BottomTabs() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-sidebar border-t border-sidebar-border flex items-center justify-around" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
      {TABS.map(tab => {
        const isActive = location.pathname.startsWith(tab.path);
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={cn(
              'flex-1 flex flex-col items-center justify-center py-3 px-2 text-[11px] font-medium transition-colors user-select-none active:scale-95 min-h-[44px]',
              isActive
                ? 'text-sidebar-primary'
                : 'text-sidebar-foreground/60 hover:text-sidebar-foreground'
            )}
          >
            <Icon className="h-5 w-5 mb-1" />
            <span className="truncate">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}