import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  deleteEvent,
  eventRegistrations,
  getEvent,
  setAttendance,
  updateEvent,
} from "@/services/campus";
import { formatEventTime, formatLongDate, relativeTime } from "@/lib/campus-format";
import { PageShell } from "@/components/campus/PageShell";
import { GlassButton, GlassLink, SectionLabel, StatusChip } from "@/components/campus/primitives";
import { StudentIcon, AttendanceIcon, RegistrationIcon } from "@/components/icons";

export const Route = createFileRoute("/_authenticated/organizer/events/$id")({
  head: () => ({
    meta: [
      { title: "Manage event — Campus Events" },
      { name: "description", content: "Manage the roster, attendance and status of your campus event." },
      { property: "og:title", content: "Manage event — Campus Events" },
      { property: "og:description", content: "Manage the roster, attendance and status of your campus event." },
    ],
  }),
  component: ManageEvent,
});

function ManageEvent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: event } = useQuery({ queryKey: ["event", id], queryFn: () => getEvent(id) });
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["event-registrations", id],
    queryFn: () => eventRegistrations(id),
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["event-registrations", id] });
    void queryClient.invalidateQueries({ queryKey: ["event", id] });
    void queryClient.invalidateQueries({ queryKey: ["organizer-events"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-registrations"] });
  };

  const attendance = useMutation({
    mutationFn: ({ regId, checkedIn }: { regId: string; checkedIn: boolean }) =>
      setAttendance(regId, checkedIn),
    onSuccess: () => { toast.success("Attendance updated"); refresh(); },
    onError: (e: Error) => toast.error("Could not update attendance", { description: e.message }),
  });

  const statusMut = useMutation({
    mutationFn: (next: "published" | "cancelled") => updateEvent(id, { status: next }),
    onSuccess: (e) => {
      toast.success(e.status === "cancelled" ? "Event cancelled" : "Event republished");
      refresh();
    },
    onError: (e: Error) => toast.error("Could not update event", { description: e.message }),
  });

  const remove = useMutation({
    mutationFn: () => deleteEvent(id),
    onSuccess: () => { toast.success("Event deleted"); void navigate({ to: "/organizer" }); },
    onError: (e: Error) => toast.error("Could not delete", { description: e.message }),
  });

  const active     = rows.filter((r) => r.status === "registered");
  const checkedIn  = active.filter((r) => r.checked_in_at).length;
  const attendanceRate = active.length ? Math.round((checkedIn / active.length) * 100) : 0;

  return (
    <PageShell
      label="ORGANIZER / MANAGE EVENT"
      title={event?.title ?? "Event"}
      intro={
        event
          ? `${formatLongDate(event.starts_at)} · ${formatEventTime(event.starts_at)} · ${event.venue}`
          : undefined
      }
      aside={
        <GlassLink to="/organizer" variant="ghost" size="sm">
          BACK TO CONSOLE
        </GlassLink>
      }
    >
      {/* ── Stats: 2-col on mobile, 4-col on desktop ── */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Stat label="REGISTERED"     value={`${active.length}/${event?.capacity ?? 0}`} accent />
        <Stat label="CANCELLED"      value={String(rows.filter(r => r.status === "cancelled").length).padStart(2, "0")} />
        <Stat label="CHECKED IN"     value={String(checkedIn).padStart(2, "0")} />
        <Stat label="ATTENDANCE"     value={`${attendanceRate}%`} />
      </div>

      {/* ── Event cover ── */}
      {event?.image_url && (
        <div className="relative mt-5 h-40 overflow-hidden rounded-lg border border-border sm:h-52">
          <img src={event.image_url} alt={event.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/40 to-transparent" />
          <div className="absolute bottom-3 left-4">
            <StatusChip
              tone={event.status === "published" ? "open" : event.status === "cancelled" ? "urgent" : "muted"}
            >
              {event.status.toUpperCase()}
            </StatusChip>
          </div>
        </div>
      )}

      {/* ── Actions ── */}
      <div className="mt-5 flex flex-wrap gap-2.5">
        {event?.status === "cancelled" ? (
          <GlassButton variant="solid" onClick={() => statusMut.mutate("published")} disabled={statusMut.isPending}>
            REPUBLISH EVENT
          </GlassButton>
        ) : (
          <GlassButton variant="danger" onClick={() => statusMut.mutate("cancelled")} disabled={statusMut.isPending}>
            CANCEL EVENT
          </GlassButton>
        )}
        <GlassButton
          variant="ghost"
          disabled={remove.isPending}
          onClick={() => {
            if (window.confirm("Delete this event and all its registrations permanently?"))
              remove.mutate();
          }}
        >
          DELETE EVENT
        </GlassButton>
        <GlassLink to="/events/$id" params={{ id }} variant="glass" size="sm" withArrow>
          VIEW PUBLIC PAGE
        </GlassLink>
      </div>

      {/* ── Registration roster ── */}
      <div className="mt-10">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <SectionLabel className="flex items-center gap-2">
            <RegistrationIcon size={13} /> REGISTRATION ROSTER
          </SectionLabel>
          <span className="label-sys rounded-sm border border-border bg-white/60 px-2 py-1 text-[0.5rem] text-steel">
            {active.length} REGISTERED
          </span>
        </div>

        {isLoading ? (
          <p className="label-sys mt-8 text-center">LOADING ROSTER…</p>
        ) : rows.length === 0 ? (
          <div className="glass mt-4 rounded-lg p-10 text-center">
            <RegistrationIcon size={28} className="mx-auto text-steel opacity-40" />
            <p className="mt-3 text-sm text-muted-foreground">No registrations yet.</p>
          </div>
        ) : (
          <div className="glass divide-y divide-border rounded-lg">
            {rows.map((r) => {
              const avatar = r.profiles?.avatar_url;
              const isCancelled = r.status === "cancelled";
              return (
                <div key={r.id} className="px-4 py-4 sm:px-5">
                  {/* ── Row: avatar + info (fills width) ── */}
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-mist">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt=""
                          className="h-full w-full object-cover"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                        />
                      ) : (
                        <StudentIcon size={18} className="text-steel" />
                      )}
                    </div>

                    {/* Name + meta */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">
                        {r.profiles?.full_name ?? "Student"}
                      </p>
                      <p className="label-sys mt-0.5 truncate text-[0.5625rem] text-steel">
                        {[r.profiles?.matric_no, r.profiles?.faculty].filter(Boolean).join(" · ") || "—"}
                      </p>
                      <p className="label-sys mt-0.5 text-[0.5rem] text-steel/60">
                        {relativeTime(r.created_at)}
                      </p>
                    </div>

                    {/* Status chip — always top-right */}
                    <StatusChip
                      tone={isCancelled ? "urgent" : r.checked_in_at ? "live" : "open"}
                      className="shrink-0"
                    >
                      {isCancelled ? "CANCELLED" : r.checked_in_at ? "CHECKED IN" : "REGISTERED"}
                    </StatusChip>
                  </div>

                  {/* ── Check-in button — full width on its own line on mobile ── */}
                  {r.status === "registered" && (
                    <div className="mt-3 flex">
                      <GlassButton
                        size="sm"
                        variant={r.checked_in_at ? "ghost" : "solid"}
                        disabled={attendance.isPending}
                        className="w-full justify-center sm:w-auto"
                        onClick={() => attendance.mutate({ regId: r.id, checkedIn: !r.checked_in_at })}
                      >
                        <AttendanceIcon size={13} className="mr-2 shrink-0" />
                        {r.checked_in_at ? "UNDO CHECK-IN" : "MARK AS CHECKED IN"}
                      </GlassButton>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageShell>
  );
}

function Stat({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`glass rounded-lg p-4 sm:p-5 ${accent ? "border-deep/30" : ""}`}>
      <SectionLabel className="text-[0.5rem] sm:text-[0.5625rem]">{label}</SectionLabel>
      <p className={`font-display mt-2 text-3xl font-bold tabular-nums leading-none sm:text-4xl ${accent ? "text-deep" : "text-ink"}`}>
        {value}
      </p>
    </div>
  );
}
