revoke execute on function public.has_role(uuid, public.app_role) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.notify_event_change() from public, anon, authenticated;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;
revoke execute on function public.register_for_event(uuid) from public, anon;
revoke execute on function public.set_attendance(uuid, boolean) from public, anon;
grant execute on function public.register_for_event(uuid) to authenticated;
grant execute on function public.set_attendance(uuid, boolean) to authenticated;