import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import { Link2 } from "lucide-react";

export default function InternalLinks() {
  return (
    <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
      <PageHeader title="Internal Links" description="Internal linking strategy and audits (coming soon)" />
      <EmptyState
        icon={Link2}
        title="Coming in Phase 3"
        description="The Internal Links module will map internal link architecture, find orphan pages, and suggest strategic linking opportunities."
      />
    </div>
  );
}