import { useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { createEvent, uploadEventCover } from "@/services/campus";
import { useAuth } from "@/hooks/useAuth";
import { PageShell } from "@/components/campus/PageShell";
import { AuthField } from "@/components/campus/AuthShell";
import { GlassButton, GlassLink, SectionLabel } from "@/components/campus/primitives";

const CATEGORIES = ["ACADEMIC", "RESEARCH", "CAREER", "SPORTS", "WORKSHOP", "CULTURAL"];

const PRESET_IMAGES = [
  "/images/campus-hero.jpg",
  "/images/campus-auditorium.jpg",
  "/images/campus-lab.jpg",
  "/images/campus-library.jpg",
  "/images/campus-arena.jpg",
];

const schema = z.object({
  title: z.string().trim().min(4, { message: "Give the event a title" }).max(160),
  description: z
    .string()
    .trim()
    .min(20, { message: "Describe the event (20+ characters)" })
    .max(4000),
  venue: z.string().trim().min(2, { message: "Where is it happening?" }).max(160),
  date: z.string().min(1, { message: "Pick a date" }),
  time: z.string().min(1, { message: "Pick a start time" }),
  capacity: z
    .coerce.number()
    .int()
    .min(1, { message: "Capacity must be at least 1" })
    .max(100000),
});

export const Route = createFileRoute("/_authenticated/organizer/events/create")({
  head: () => ({
    meta: [
      { title: "Create an event — Campus Events" },
      { name: "description", content: "Publish a new campus event with venue, timing and capacity." },
      { property: "og:title", content: "Create an event — Campus Events" },
      {
        property: "og:description",
        content: "Publish a new campus event with venue, timing and capacity.",
      },
    ],
  }),
  component: CreateEvent,
});

function CreateEvent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    venue: "",
    date: "",
    time: "10:00",
    capacity: "100",
  });
  const [category, setCategory] = useState(CATEGORIES[0]!);
  // Can be a preset path string OR a File object for upload
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>(PRESET_IMAGES[0]!);
  const [selectedPreset, setSelectedPreset] = useState<string>(PRESET_IMAGES[0]!);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: keyof typeof form) => (v: string) =>
    setForm((f) => ({ ...f, [key]: v }));

  /** Handle user picking a file */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large", { description: "Maximum size is 5 MB." });
      return;
    }
    setCoverFile(file);
    setSelectedPreset(""); // deselect preset
    const url = URL.createObjectURL(file);
    setCoverPreview(url);
  };

  const selectPreset = (src: string) => {
    setSelectedPreset(src);
    setCoverFile(null);
    setCoverPreview(src);
    // Clear the file input so re-selecting the same file still triggers onChange
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const create = useMutation({
    mutationFn: async () => {
      const parsed = schema.safeParse(form);
      if (!parsed.success) {
        setErrors(
          Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])),
        );
        throw new Error("Please fix the highlighted fields");
      }
      setErrors({});

      // Upload cover if the user picked a file, otherwise use preset
      let imageUrl: string = selectedPreset || PRESET_IMAGES[0]!;
      if (coverFile) {
        imageUrl = await uploadEventCover(coverFile);
      }

      const starts = new Date(`${parsed.data.date}T${parsed.data.time}`);
      return createEvent({
        title: parsed.data.title,
        description: parsed.data.description,
        venue: parsed.data.venue,
        capacity: parsed.data.capacity,
        category,
        image_url: imageUrl,
        starts_at: starts.toISOString(),
        status: "published",
        organizer_id: user!.id,
      });
    },
    onSuccess: (event) => {
      toast.success("Event published");
      void navigate({ to: "/organizer/events/$id", params: { id: event.id } });
    },
    onError: (e: Error) => toast.error("Could not publish", { description: e.message }),
  });

  return (
    <PageShell
      label="ORGANIZER / NEW EVENT"
      title={
        <>
          Create an
          <br />
          event.
        </>
      }
      intro="Capacity is enforced on the server — a full event can never be over-registered."
      aside={
        <GlassLink to="/organizer" variant="ghost" size="sm">
          BACK TO CONSOLE
        </GlassLink>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate();
        }}
        className="grid gap-8 lg:grid-cols-[1.4fr_1fr]"
        noValidate
      >
        {/* ── Left: event details ── */}
        <div className="glass rounded-lg p-6">
          <SectionLabel>EVENT DETAILS</SectionLabel>
          <div className="mt-6 grid gap-4">
            <AuthField
              label="TITLE"
              value={form.title}
              onChange={set("title")}
              error={errors["title"]}
            />
            <label className="block">
              <SectionLabel className="text-steel">DESCRIPTION</SectionLabel>
              <textarea
                value={form.description}
                onChange={(e) => set("description")(e.target.value)}
                rows={6}
                className="mt-2 w-full rounded-md border border-border bg-white/70 px-4 py-3 text-sm text-ink outline-none focus:border-deep"
              />
              {errors["description"] && (
                <span className="label-sys mt-1.5 block text-[0.5625rem] text-urgent">
                  {errors["description"]}
                </span>
              )}
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <AuthField
                label="DATE"
                type="date"
                value={form.date}
                onChange={set("date")}
                error={errors["date"]}
              />
              <AuthField
                label="START TIME"
                type="time"
                value={form.time}
                onChange={set("time")}
                error={errors["time"]}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <AuthField
                label="VENUE"
                value={form.venue}
                onChange={set("venue")}
                error={errors["venue"]}
              />
              <AuthField
                label="CAPACITY"
                type="number"
                value={form.capacity}
                onChange={set("capacity")}
                error={errors["capacity"]}
              />
            </div>
          </div>
        </div>

        {/* ── Right: category + cover ── */}
        <aside className="glass h-fit rounded-lg p-6">
          {/* Category */}
          <SectionLabel>CATEGORY</SectionLabel>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`label-sys rounded-sm border px-3 py-2 text-[0.5625rem] transition-all ${
                  category === c
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-white/50 text-deep hover:bg-white"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Cover image */}
          <SectionLabel className="mt-7">COVER IMAGE</SectionLabel>

          {/* Live preview */}
          <div className="relative mt-3 h-36 w-full overflow-hidden rounded-md border border-border bg-mist">
            {coverPreview ? (
              <img
                src={coverPreview}
                alt="Cover preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="label-sys absolute inset-0 flex items-center justify-center text-[0.5625rem] text-steel">
                NO COVER SELECTED
              </span>
            )}
          </div>

          {/* Upload button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="label-sys mt-3 w-full rounded-md border border-dashed border-border bg-white/50 py-3 text-[0.5625rem] text-deep transition-all hover:border-deep hover:bg-white"
          >
            {coverFile ? `✓ ${coverFile.name.slice(0, 30)}` : "UPLOAD COVER PHOTO"}
          </button>
          {coverFile && (
            <p className="label-sys mt-1 text-center text-[0.5rem] text-steel">
              {(coverFile.size / 1024).toFixed(0)} KB · click above to change
            </p>
          )}

          {/* OR choose a preset */}
          <p className="label-sys mt-4 text-[0.5rem] text-steel">OR CHOOSE A PRESET</p>
          <div className="mt-2 grid grid-cols-5 gap-1.5">
            {PRESET_IMAGES.map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => selectPreset(src)}
                className="block"
              >
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  className={`h-10 w-full rounded-sm object-cover transition-all ${
                    selectedPreset === src && !coverFile
                      ? "ring-2 ring-deep"
                      : "opacity-60 hover:opacity-100"
                  }`}
                />
              </button>
            ))}
          </div>

          <GlassButton
            type="submit"
            variant="solid"
            withArrow
            disabled={create.isPending}
            className="mt-7 w-full"
          >
            {create.isPending ? "PUBLISHING…" : "PUBLISH EVENT"}
          </GlassButton>
        </aside>
      </form>
    </PageShell>
  );
}
