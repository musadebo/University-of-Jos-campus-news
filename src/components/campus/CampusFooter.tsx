import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { SectionLabel } from "./primitives";

export function CampusFooter() {
  const { user, hasRole } = useAuth();
  const isOrganizer = hasRole("organizer") || hasRole("admin");

  return (
    <footer className="relative mt-24 overflow-hidden border-t border-border bg-primary text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, white 0px, white 1px, transparent 1px, transparent 68px)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1500px] px-5 py-16 sm:px-8">
        <h2 className="display-section max-w-3xl text-white">
          Campus
          <br />
          Events.
        </h2>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Platform */}
          <div>
            <SectionLabel className="text-white/50">PLATFORM</SectionLabel>
            <ul className="mt-4 space-y-2">
              {[
                { to: "/events",        label: "EVENTS" },
                { to: "/news",          label: "NEWS" },
                { to: "/announcements", label: "ANNOUNCEMENTS" },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="label-sys text-[0.6875rem] text-white/85 hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account — only when logged in */}
          <div>
            <SectionLabel className="text-white/50">ACCOUNT</SectionLabel>
            <ul className="mt-4 space-y-2">
              {user ? (
                <>
                  {[
                    { to: "/dashboard",     label: "DASHBOARD" },
                    { to: "/notifications", label: "NOTIFICATIONS" },
                    { to: "/profile",       label: "PROFILE" },
                  ].map((l) => (
                    <li key={l.to}>
                      <Link to={l.to} className="label-sys text-[0.6875rem] text-white/85 hover:text-white">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </>
              ) : (
                <>
                  {[
                    { to: "/login",    label: "SIGN IN" },
                    { to: "/register", label: "CREATE ACCOUNT" },
                  ].map((l) => (
                    <li key={l.to}>
                      <Link to={l.to} className="label-sys text-[0.6875rem] text-white/85 hover:text-white">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </>
              )}
            </ul>
          </div>

          {/* Organizer section — only visible to organizers/admins */}
          <div>
            <SectionLabel className="text-white/50">
              {isOrganizer ? "ORGANIZERS" : "ABOUT"}
            </SectionLabel>
            <ul className="mt-4 space-y-2">
              {isOrganizer ? (
                <>
                  {[
                    { to: "/organizer",               label: "CONTROL ROOM" },
                    { to: "/organizer/events",         label: "MANAGE EVENTS" },
                    { to: "/organizer/events/create",  label: "CREATE EVENT" },
                  ].map((l) => (
                    <li key={l.to}>
                      <Link to={l.to} className="label-sys text-[0.6875rem] text-white/85 hover:text-white">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </>
              ) : (
                <>
                  {[
                    { to: "/about",  label: "ABOUT" },
                    { to: "/events", label: "BROWSE EVENTS" },
                  ].map((l) => (
                    <li key={l.to}>
                      <Link to={l.to} className="label-sys text-[0.6875rem] text-white/85 hover:text-white">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </>
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <SectionLabel className="text-white/50">CONTACT</SectionLabel>
            <p className="mt-4 text-sm leading-relaxed text-white/80">
              University of Jos
              <br />
              Jos, Plateau State, Nigeria
              <br />
              P.M.B 2084 Jos
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-6">
          <SectionLabel className="text-white/50">CAMPUS EVENTS / 2026</SectionLabel>
          <SectionLabel className="text-white/50">POWERED FOR UNIVERSITY OF JOS</SectionLabel>
        </div>
      </div>
    </footer>
  );
}
