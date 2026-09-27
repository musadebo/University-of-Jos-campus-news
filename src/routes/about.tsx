import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/campus/PageShell";
import { GlassLink, ScrollReveal, SectionLabel } from "@/components/campus/primitives";
import {
  AttendanceIcon,
  CampusEventsIcon,
  CampusNewsIcon,
  NotificationIcon,
  OrganizerIcon,
  SecurityIcon,
} from "@/components/icons";

const TITLE = "About Campus Events — A campus operating system";
const DESCRIPTION =
  "Campus Events unifies events, reporting, announcements, registration and attendance into one intelligent university platform.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: AboutPage,
});

const PILLARS = [
  { title: "ONE PROGRAMME", text: "Every faculty event in a single published programme.", Icon: CampusEventsIcon },
  { title: "EDITORIAL RECORD", text: "Campus reporting with a proper archive, not a noticeboard.", Icon: CampusNewsIcon },
  { title: "REAL-TIME ALERTS", text: "Time changes and cancellations reach registrants instantly.", Icon: NotificationIcon },
  { title: "ATTENDANCE THAT COUNTS", text: "Check-ins are recorded against the registration itself.", Icon: AttendanceIcon },
  { title: "ORGANIZER TOOLING", text: "Create, publish, cancel and manage rosters from one console.", Icon: OrganizerIcon },
  { title: "SAFE BY DEFAULT", text: "Row-level security and server-enforced capacity limits.", Icon: SecurityIcon },
];

function AboutPage() {
  return (
    <PageShell
      label="SECTION / ABOUT"
      title={
        <>
          A campus
          <br />
          operating system.
        </>
      }
      intro="Campus Events unifies UNIJOS events, news, announcements, registration and attendance across all faculties and campuses into one intelligent platform."
    >
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {PILLARS.map(({ title, text, Icon }, i) => (
          <ScrollReveal key={title} delay={i * 60}>
            <div className="glass h-full rounded-lg p-6">
              <span className="text-deep">
                <Icon size={32} />
              </span>
              <h2 className="font-display mt-6 text-xl font-bold uppercase tracking-[-0.03em] text-ink">
                {title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>

      <div className="glass-strong mt-14 rounded-xl p-8 sm:p-12">
        <SectionLabel>GET STARTED</SectionLabel>
        <h2 className="display-section mt-4 text-ink">Join the platform.</h2>
        <div className="mt-8 flex flex-wrap gap-3">
          <GlassLink to="/register" variant="solid" withArrow>
            CREATE ACCOUNT
          </GlassLink>
          <GlassLink to="/events" variant="glass" withArrow>
            BROWSE EVENTS
          </GlassLink>
        </div>
      </div>
    </PageShell>
  );
}
