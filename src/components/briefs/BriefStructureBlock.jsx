export default function BriefStructureBlock({ sections }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h3 className="text-xs font-semibold mb-3">Content Structure (H2 Outline)</h3>
      <div className="space-y-3">
        {sections.map((section, i) => (
          <div key={i}>
            <div className="flex items-baseline gap-2">
              <span className="text-[10px] font-bold text-primary/60 w-6">H2</span>
              <p className="text-xs font-semibold text-foreground">{section.h2}</p>
            </div>
            {section.purpose && (
              <p className="text-[10px] text-muted-foreground ml-8 mt-0.5">{section.purpose}</p>
            )}
            {section.h3s?.length > 0 && (
              <div className="ml-8 mt-1.5 space-y-1">
                {section.h3s.map((h3, j) => (
                  <div key={j} className="flex items-baseline gap-2">
                    <span className="text-[9px] font-bold text-muted-foreground/60 w-5">H3</span>
                    <p className="text-[11px] text-muted-foreground">{h3}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}