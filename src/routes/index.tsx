import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listAnnouncements, listEvents, listNews } from "@/services/campus";
import { HeroSection } from "@/components/landing/HeroSection";
import { DiscoverSection } from "@/components/landing/DiscoverSection";
import { EventsShowcase } from "@/components/landing/EventsShowcase";
import { NewsSection } from "@/components/landing/NewsSection";
import { LiveCampusSection } from "@/components/landing/LiveCampusSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { StudentExperienceSection } from "@/components/landing/StudentExperienceSection";
import { OrganizerSection } from "@/components/landing/OrganizerSection";
import { FinalCtaSection } from "@/components/landing/FinalCtaSection";
import { CampusFooter } from "@/components/campus/CampusFooter";

const TITLE = "UNIJOS Campus Events — Everything Happening at University of Jos";
const DESCRIPTION =
  "Discover events, news and announcements at the University of Jos. Register for academic activities, track your attendance, and stay connected with UNIJOS campus life.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: Index,
});

const SECTIONS = [
  "UNIJOS", "DISCOVER", "EVENTS", "NEWS", "LIVE CAMPUS",
  "HOW IT WORKS", "STUDENT LIFE", "ORGANIZERS", "JOIN UNIJOS",
];

function Index() {
  const { data: events = [] } = useQuery({ queryKey: ["events", "all"], queryFn: () => listEvents() });
  const { data: news = [] } = useQuery({ queryKey: ["news", "all"], queryFn: () => listNews() });
  const { data: announcements = [] } = useQuery({
    queryKey: ["announcements"],
    queryFn: listAnnouncements,
  });

  const heroEvent = events.length > 0
    ? [...events].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
    : undefined;

  const showcaseEvents = [...events].sort(
    (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
  );

  return (
    <>
      <HeroSection nextEvent={heroEvent} />
      <DiscoverSection />
      <EventsShowcase events={showcaseEvents} />
      <NewsSection articles={news} />
      <LiveCampusSection events={events} announcements={announcements} />
      <HowItWorksSection />
      <StudentExperienceSection events={events} announcements={announcements} />
      <OrganizerSection />
      <FinalCtaSection />
      <CampusFooter />
    </>
  );
}
