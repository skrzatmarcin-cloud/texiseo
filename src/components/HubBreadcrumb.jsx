import { useHub, HUBS_CONFIG } from "@/lib/HubContext";
import { useNavigate } from "react-router-dom";
import { Home, ChevronRight } from "lucide-react";

/**
 * Small breadcrumb bar shown at top of every content page.
 * Shows: TexiSEO Home > Current Hub > Current Page
 * Clicking "Home" resets hub to welcome and navigates to "/"
 */
export default function HubBreadcrumb({ pageName }) {
  const { activeHub, setActiveHub } = useHub();
  const navigate = useNavigate();

  const hubConfig = HUBS_CONFIG[activeHub];
  if (!hubConfig || activeHub === "welcome") return null;

  const handleHome = () => {
    setActiveHub("welcome");
    navigate("/");
  };

  return (
    <div className="flex items-center gap-1.5 px-4 py-2 border-b border-border bg-card/30 text-xs text-muted-foreground">
      <button
        onClick={handleHome}
        className="flex items-center gap-1 hover:text-primary transition-colors font-medium"
      >
        <Home className="h-3 w-3" />
        TexiSEO
      </button>
      <ChevronRight className="h-3 w-3 opacity-40" />
      <button
        onClick={handleHome}
        className="hover:text-primary transition-colors font-medium text-foreground/70"
      >
        Menu główne
      </button>
      <ChevronRight className="h-3 w-3 opacity-40" />
      <span className="text-foreground font-semibold">{hubConfig.label}</span>
      {pageName && (
        <>
          <ChevronRight className="h-3 w-3 opacity-40" />
          <span className="text-foreground/60">{pageName}</span>
        </>
      )}
    </div>
  );
}