import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listAnnouncements } from "@/services/campus";
import { PageShell } from "@/components/campus/PageShell";
import { AnnouncementItem } from "@/components/campus/cards";
import { ScrollReveal, SectionLabel, StatusChip } from "@/components/campus/primitives";

const TITLE = "Campus Announcements — Campus Events";
const DESCRIPTION =
  "Faculty broadcasts and campus notices ranked by priority, from routine updates to urgent alerts.";

const PRIORITIES = ["ALL", "URGENT", "IMPORTANT", "NORMAL"];

export const Route = createFileRoute("/announcements")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: AnnouncementsPage,
});

function AnnouncementsPage() {
  const [priority, setPriority] = useState("ALL");
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: listAnnouncements,
  });

  const filtered = priority === "ALL" ? items : items.filter((i) => i.priority === priority);

  return (
    <PageShell
      label="SECTION / ANNOUNCEMENTS"
      title={
        <>
          Campus
          <br />
          broadcast.
        </>
      }
      intro="Notices from the faculties and the campus administration, ordered by priority so urgent items never sit below the fold."
      aside={<StatusChip tone="live">{items.length} ACTIVE</StatusChip>}
    >
      <div className="flex flex-wrap gap-1.5">
        {PRIORITIES.map((p) => (
          <button
            key={p}
            onClick={() => setPriority(p)}
            className={`label-sys rounded-sm border px-3 py-2 text-[0.5625rem] transition-colors ${
              priority === p
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-white/50 text-deep hover:bg-white"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="label-sys mt-16 text-center">LOADING NOTICES…</p>
      ) : filtered.length === 0 ? (
        <div className="glass mt-8 rounded-lg p-10 text-center">
          <SectionLabel>NOTHING HERE</SectionLabel>
          <p className="mt-3 text-sm text-muted-foreground">No announcements at this priority.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-2.5">
          {filtered.map((item, i) => (
            <ScrollReveal key={item.id} delay={i * 50} y={16}>
              <AnnouncementItem item={item} />
            </ScrollReveal>
          ))}
        </div>
      )}
    </PageShell>
  );
}
