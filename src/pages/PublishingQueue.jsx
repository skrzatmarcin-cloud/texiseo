import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import { CalendarClock } from "lucide-react";

export default function PublishingQueue() {
  return (
    <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
      <PageHeader title="Publishing Queue" description="Content production and scheduling pipeline (coming soon)" />
      <EmptyState
        icon={CalendarClock}
        title="Coming in Phase 4"
        description="The Publishing Queue will manage content production workflow from brief to published, with scheduling and approval stages."
      />
    </div>
  );
}