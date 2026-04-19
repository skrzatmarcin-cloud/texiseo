import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { BookOpen, Briefcase, Globe, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'teachers', label: 'Teachers', icon: BookOpen, path: '/teachers' },
  { id: 'business', label: 'Business', icon: Briefcase, path: '/business' },
  { id: 'website', label: 'Website', icon: Globe, path: '/website' },
  { id: 'security', label: 'Security', icon: Shield, path: '/security' },
];

const STORAGE_PREFIX = 'tab_stack_';

export default function BottomTabs() {
  const navigate = useNavigate();
  const location = useLocation();
  const [tabPaths, setTabPaths] = useState({});

  // Initialize tab paths from localStorage on mount
  useEffect(() => {
    const stored = {};
    TABS.forEach(tab => {
      const key = STORAGE_PREFIX + tab.id;
      const savedPath = localStorage.getItem(key);
      stored[tab.id] = savedPath || tab.path;
    });
    setTabPaths(stored);
  }, []);

  // Update current tab's path whenever location changes
  useEffect(() => {
    const activeTab = TABS.find(tab => location.pathname.startsWith(tab.path));
    if (activeTab) {
      const newPaths = { ...tabPaths, [activeTab.id]: location.pathname };
      setTabPaths(newPaths);
      localStorage.setItem(STORAGE_PREFIX + activeTab.id, location.pathname);
    }
  }, [location.pathname, tabPaths]);

  const handleTabClick = (tabId) => {
    const savedPath = tabPaths[tabId];
    navigate(savedPath || TABS.find(t => t.id === tabId)?.path);
  };

  return (
    <nav 
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-sidebar border-t border-sidebar-border flex items-center justify-around overscroll-none" 
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      {TABS.map(tab => {
        const isActive = location.pathname.startsWith(tab.path);
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={cn(
              'flex-1 flex flex-col items-center justify-center py-3 px-2 text-[11px] font-medium transition-colors select-none active:scale-95 min-h-[44px]',
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