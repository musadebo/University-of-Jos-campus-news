import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { listNotifications, markAllRead, markNotificationRead } from "@/services/campus";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { relativeTime } from "@/lib/campus-format";
import { PageShell } from "@/components/campus/PageShell";
import { GlassButton, SectionLabel, StatusChip } from "@/components/campus/primitives";
import { NotificationIcon } from "@/components/icons";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Campus Events" },
      { name: "description", content: "Real-time campus alerts about your events and registrations." },
      { property: "og:title", content: "Notifications — Campus Events" },
      {
        property: "og:description",
        content: "Real-time campus alerts about your events and registrations.",
      },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { user } = useAuth();
  const uid = user?.id;
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["notifications", uid],
    queryFn: () => listNotifications(uid!),
    enabled: !!uid,
  });

  useEffect(() => {
    if (!uid) return;
    const channel = supabase
      .channel(`notifications-page-${uid}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${uid}` },
        () => void queryClient.invalidateQueries({ queryKey: ["notifications", uid] }),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [uid, queryClient]);

  const readOne = useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["notifications", uid] }),
  });

  const readAll = useMutation({
    mutationFn: () => markAllRead(uid!),
    onSuccess: () => {
      toast.success("All notifications marked read");
      void queryClient.invalidateQueries({ queryKey: ["notifications", uid] });
    },
  });

  const unread = notes.filter((n) => !n.read).length;

  return (
    <PageShell
      label="ACCOUNT / NOTIFICATIONS"
      title={
        <>
          Campus
          <br />
          alerts.
        </>
      }
      intro="Registration confirmations, schedule changes and cancellations arrive here the moment they happen."
      aside={
        <div className="flex items-center gap-3">
          <StatusChip tone={unread ? "live" : "muted"}>{unread} UNREAD</StatusChip>
          {unread > 0 && (
            <GlassButton size="sm" variant="glass" onClick={() => readAll.mutate()} disabled={readAll.isPending}>
              MARK ALL READ
            </GlassButton>
          )}
        </div>
      }
    >
      {isLoading ? (
        <p className="label-sys mt-10 text-center">LOADING ALERTS…</p>
      ) : notes.length === 0 ? (
        <div className="glass rounded-lg p-10 text-center">
          <NotificationIcon size={30} className="mx-auto text-deep" />
          <SectionLabel className="mt-5">ALL CLEAR</SectionLabel>
          <p className="mt-3 text-sm text-muted-foreground">No notifications yet.</p>
        </div>
      ) : (
        <div className="glass divide-y divide-border rounded-lg">
          {notes.map((n) => (
            <div key={n.id} className="px-4 py-4 sm:px-5 sm:py-5">
              {/* Top row: dot + meta + mark-read button */}
              <div className="flex items-start gap-3">
                <i className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? "bg-border" : "bg-deep"}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <SectionLabel className="text-[0.5625rem] text-steel">{n.kind}</SectionLabel>
                    <span className="label-sys text-[0.5625rem] text-steel">{relativeTime(n.created_at)}</span>
                  </div>
                  <p className="font-display mt-1.5 text-sm font-bold uppercase tracking-[-0.02em] text-ink sm:text-base">
                    {n.title}
                  </p>
                  {n.body && (
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{n.body}</p>
                  )}
                  {n.link && (
                    <Link to={n.link} className="label-sys mt-2 inline-block text-[0.5625rem] text-deep underline-offset-2 hover:underline">
                      OPEN →
                    </Link>
                  )}
                </div>
              </div>
              {/* Mark read — full width button below content on mobile */}
              {!n.read && (
                <div className="mt-3 flex">
                  <GlassButton
                    size="sm"
                    variant="ghost"
                    className="w-full justify-center sm:w-auto sm:justify-start"
                    onClick={() => readOne.mutate(n.id)}
                  >
                    MARK AS READ
                  </GlassButton>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
