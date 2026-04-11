import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import { ClipboardList } from "lucide-react";

export default function BriefBuilder() {
  return (
    <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
      <PageHeader title="Brief Builder" description="Generate SEO content briefs (coming soon)" />
      <EmptyState
        icon={ClipboardList}
        title="Coming in Phase 3"
        description="The Brief Builder will generate comprehensive SEO content briefs with structure, keywords, and competitive insights."
      />
    </div>
  );
}