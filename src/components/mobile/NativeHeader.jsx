import { ChevronLeft, Menu } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function NativeHeader({ onMenuOpen, hubLabel }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isRoot = location.pathname === '/';
  const canGoBack = !isRoot;

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-sidebar text-sidebar-foreground border-b border-sidebar-border flex items-center justify-between px-4" style={{ paddingTop: 'max(0.5rem, env(safe-area-inset-top))' }}>
      <div className="flex items-center gap-2">
        {canGoBack ? (
          <button
            onClick={() => navigate(-1)}
            className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-sidebar-accent/50 transition-colors active:bg-sidebar-accent active:scale-95 user-select-none"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        ) : (
          <div className="h-8 w-8 flex-shrink-0">
            <img
              src="https://media.base44.com/images/public/69da036b1797baa333fdb6c1/f24cb9015_ChatGPTImage11kwi202616_54_09.png"
              alt="TexiSEO"
              className="h-full w-full object-contain"
            />
          </div>
        )}
      </div>

      <div className="flex-1 text-center px-2">
        <h1 className="text-sm font-bold truncate">{hubLabel || 'TexiSEO'}</h1>
      </div>

      <button
        onClick={onMenuOpen}
        className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-sidebar-accent/50 transition-colors active:bg-sidebar-accent active:scale-95 user-select-none"
      >
        <Menu className="h-5 w-5" />
      </button>
    </header>
  );
}