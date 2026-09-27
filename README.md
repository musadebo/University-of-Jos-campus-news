# Campus Nexs

BUILD CAMPUS NEWS — PREMIUM FUTURISTIC CAMPUS PLATFORM

You are an award-winning creative frontend engineer, product designer,

interaction designer, and full-stack engineer.

Build a complete production-ready web application called:

CAMPUS NEWS

Campus News is a university-focused platform for discovering campus

events, campus news, announcements, registrations, notifications,

attendance, and event management.

THIS MUST BE A REAL, FULLY FUNCTIONAL APPLICATION.

Do not create a static concept.

Do not create a Dribbble-style mockup.

Do not create fake buttons.

Every major interaction must actually work.

========================================================

DESIGN DIRECTION

========================================================

The uploaded reference image is the visual foundation.

However, combine that visual identity with the futuristic,

cinematic interaction quality of a high-end experimental developer

portfolio.

The result should feel like:

PREMIUM EDITORIAL DESIGN

+

FUTURISTIC DIGITAL INTERFACE

+

GLASSMORPHISM

+

UNIVERSITY TECHNOLOGY

+

CINEMATIC SCROLL EXPERIENCE

The first impression should be:

"THIS DOES NOT LOOK LIKE A NORMAL SCHOOL WEBSITE."

It should feel like a modern digital operating system for a campus.

========================================================

IMPORTANT DESIGN RULE

========================================================

DO NOT use huge rounded SaaS cards.

Border radius must be SMALL and controlled.

Preferred:

4px

6px

8px

10px

12px maximum for most components.

Use sharper geometry.

Cards should feel architectural and sophisticated.

Avoid:

20px+

rounded cards

pill-shaped everything

giant bubbly interfaces

generic SaaS dashboards

Buttons can have slightly larger radius when appropriate,

but still remain refined.

========================================================

COLOR SYSTEM

========================================================

Primary background:

#EAF4F8

Deep blue:

#35556E

Dark blue:

#19384C

Blue:

#5F8CA8

Light blue:

#DCECF3

White:

#FFFFFF

Text:

#173247

Muted:

#6D7F89

Glass:

rgba(255,255,255,0.42)

Glass border:

rgba(255,255,255,0.55)

Use very subtle blue shadows.

No excessive gradients.

No purple.

No neon rainbow effects.

========================================================

GLASSMORPHISM

========================================================

Use glass as a visual layer rather than making every element glass.

Glass should appear on:

• navbar

• hero interface

• event previews

• floating information panels

• notification interfaces

• dashboard widgets

• modal windows

• filters

• selected states

Use:

backdrop-filter: blur(18px-30px)

thin borders

subtle transparency

soft highlights

very subtle shadows

The glass should look like premium frosted architectural glass.

========================================================

TYPOGRAPHY

========================================================

Use:

Display:

Space Grotesk

Body:

Inter

Optional secondary display:

Manrope

Typography must be a major part of the design.

Use enormous editorial headlines.

Example:

CAMPUS

NEWS

or:

EVERYTHING

HAPPENING

ON CAMPUS.

Use tight typography.

Use uppercase labels for system information.

Examples:

EVENTS / 024

CAMPUS UPDATE

LIVE

REGISTRATION OPEN

08:30 AM

MAIN AUDITORIUM

========================================================

CUSTOM ICON SYSTEM

========================================================

DO NOT simply use Lucide icons everywhere.

Create a CUSTOM SVG ICON SYSTEM specifically for Campus News.

The icons should have a consistent visual language:

• thin geometric strokes

• architectural shapes

• minimal details

• slightly futuristic

• rounded line caps where appropriate

• small technical cutouts

• consistent stroke width

• monochromatic blue/white

• subtle animated strokes

Create custom icons for:

01 — CAMPUS EVENTS

Icon concept:

A futuristic calendar combined with a campus building.

The calendar outline contains three small architectural windows.

A small timeline indicator runs along the bottom.

02 — CAMPUS NEWS

Icon concept:

An abstract newspaper made from three geometric horizontal

panels with one larger headline block.

03 — ANNOUNCEMENTS

Icon concept:

A minimal campus broadcast tower emitting three curved signal

lines.

04 — NOTIFICATIONS

Icon concept:

A geometric notification bell surrounded by a subtle circular

signal indicator.

05 — REGISTRATION

Icon concept:

A ticket/document combined with a small check mark.

06 — ATTENDANCE

Icon concept:

A person silhouette inside a scanning frame with a check indicator.

07 — SCHEDULE

Icon concept:

A circular clock combined with horizontal timeline markers.

08 — STUDENT

Icon concept:

A minimal geometric student profile inside a square frame.

09 — ORGANIZER

Icon concept:

A structured dashboard/control icon representing event management.

10 — CAMPUS

Icon concept:

Minimal architectural building formed from vertical geometric lines.

11 — SEARCH

Create a custom geometric search icon.

12 — ARROW

Create a sharp directional arrow that can animate during hover.

13 — NEWS ARTICLE

Create an editorial document icon.

14 — LOCATION

Create a geometric campus-location marker.

15 — CALENDAR

Create a simplified technical calendar icon.

16 — SECURITY

Create a shield formed from architectural linework.

All icons should belong to ONE coherent icon family.

Store them as reusable SVG/React components.

Example:

components/icons/

    CampusEventsIcon.tsx

    CampusNewsIcon.tsx

    AnnouncementIcon.tsx

    NotificationIcon.tsx

    RegistrationIcon.tsx

    AttendanceIcon.tsx

    ScheduleIcon.tsx

    StudentIcon.tsx

    OrganizerIcon.tsx

    CampusIcon.tsx

Do not use random icons from different icon libraries.

========================================================

LANDING PAGE

========================================================

The landing page must feel like a premium digital product launch.

Do NOT make it a boring:

Hero

Cards

Features

Footer

Instead, create a cinematic narrative.

--------------------------------------------------------

SECTION 01 — HERO

--------------------------------------------------------

Full viewport.

Large campus architectural image/video atmosphere.

Use a blue-toned campus environment.

Layer translucent glass interface elements over the scene.

Navigation floats at the top.

Navigation:

CAMPUS NEWS

EVENTS

NEWS

ANNOUNCEMENTS

ABOUT

Right:

SEARCH

NOTIFICATIONS

LOGIN

Hero headline:

EVERYTHING

HAPPENING

ON CAMPUS.

Small supporting text:

Discover events, news, announcements and campus activities

in one intelligent platform.

CTA:

EXPLORE CAMPUS →

Secondary:

VIEW EVENTS

Add a floating glass system panel showing:

UPCOMING EVENT

TECH & INNOVATION DAY

10:00 AM

MAIN AUDITORIUM

REGISTER →

========================================================

HERO ANIMATION

========================================================

The hero must NOT simply fade in.

When the user begins scrolling:

The hero behaves like a 3D interface.

The large headline moves forward in perspective.

The background moves slower.

The glass panel moves at a different depth.

The campus image scales slightly.

Navigation becomes smaller.

Floating UI panels move independently.

The headline can split into individual words and move

through different depth layers.

Use:

GSAP

ScrollTrigger

Lenis

CSS perspective

Create a cinematic transition into the next section.

========================================================

SECTION 02 — DISCOVER

========================================================

Create:

DISCOVER CAMPUS.

Large editorial statement:

ONE PLACE.

EVERYTHING HAPPENING.

Then reveal four systems:

EVENTS

NEWS

ANNOUNCEMENTS

ACTIVITIES

Each has one of the custom icons.

Do NOT make them giant cards.

Use a horizontal architectural layout.

Each item should have:

number

custom icon

title

description

arrow

On hover:

icon animates

border draws itself

arrow moves

background image shifts slightly

text moves a few pixels

========================================================

SCROLL ANIMATION

========================================================

As this section enters:

The four systems should appear sequentially.

Do not use simple opacity fade.

Use:

translateY

scale

clip-path

perspective

small rotation

Each element should feel like it is entering from another

layer of the interface.

========================================================

SECTION 03 — EVENTS

========================================================

Create a cinematic events showcase.

Title:

WHAT'S ON.

Large event preview.

Use real event data.

Event card contains:

image

date

time

venue

category

title

description

registration state

Example:

TECH TALK

SEP 18

10:00 AM

INNOVATION HALL

REGISTRATION OPEN

REGISTER →

Cards should use subtle glass.

Small radius.

Thin border.

No giant rounded rectangles.

========================================================

EVENT SCROLL EXPERIENCE

========================================================

Pin this section.

While the user scrolls vertically:

events move horizontally.

Create a horizontal cinematic gallery.

Cards move through a 3D perspective.

Current card:

scale 1

translateZ(0)

Previous:

scale .82

translateZ(-200px)

Next:

scale .90

translateZ(-100px)

Use subtle rotation.

The cards should feel like they are travelling through space.

At the end of the section, transition naturally into NEWS.

========================================================

SECTION 04 — CAMPUS NEWS

========================================================

Make this feel like a premium digital magazine.

Large heading:

CAMPUS

NEWS.

Featured article dominates the screen.

Large editorial image.

Small metadata:

CAMPUS / 04

SEP 2026

5 MIN READ

Headline.

Then smaller articles appear around it.

Use asymmetric layouts.

Do NOT make a normal three-column card grid.

Use editorial composition.

========================================================

NEWS ANIMATION

========================================================

As the user scrolls:

Featured image slowly reveals through a mask.

Headline moves upward.

Metadata appears first.

Image moves at a slower speed.

Secondary stories enter from opposite directions.

Use clip-path and transform animations.

========================================================

SECTION 05 — LIVE CAMPUS

========================================================

Create:

LIVE CAMPUS.

This section represents real-time campus activity.

Display:

UPCOMING

LIVE

UPDATED

RECENT

Examples:

EVENT TIME CHANGED

TECH TALK

10:00 AM → 11:00 AM

NEW ANNOUNCEMENT

FACULTY OF COMPUTING

REGISTRATION OPEN

CAREER FAIR 2026

Use compact glass notification strips.

Not huge cards.

Create subtle live indicators.

========================================================

SECTION 06 — HOW IT WORKS

========================================================

Create a futuristic three-step system.

01

DISCOVER

Find events and campus news.

02

REGISTER

Reserve your place instantly.

03

ATTEND

Check in and track attendance.

Display each step as a horizontal timeline.

A thin animated line connects the steps.

As the user scrolls, the line progressively draws itself.

The icons animate when their step becomes active.

========================================================

SECTION 07 — STUDENT EXPERIENCE

========================================================

Show a realistic preview of the student dashboard.

Do not just show a screenshot.

Build the interface as part of the page.

Show:

Welcome back

Upcoming Events

My Registrations

Notifications

Attendance

Campus News

Use glass panels.

As the user scrolls:

dashboard moves from a tilted perspective into a

straight-on interface.

This should feel like the dashboard is physically

entering the website.

========================================================

SECTION 08 — ORGANIZER SYSTEM

========================================================

Introduce:

BUILT FOR CAMPUS ORGANIZERS.

Show:

CREATE EVENTS

MANAGE REGISTRATIONS

TRACK ATTENDANCE

SEND UPDATES

Use an interactive organizer dashboard preview.

Show event creation interface.

Use custom icons.

Scroll animation should transition from the public

platform into the management interface.

========================================================

SECTION 09 — FINAL CTA

========================================================

Large full-screen section.

Background:

beautiful blue campus architecture.

Large glass panel.

Headline:

YOUR CAMPUS.

ONE PLACE.

Supporting text:

Stay connected to everything happening around you.

Buttons:

EXPLORE CAMPUS →

GET STARTED →

The panel should slowly float as the user scrolls.

========================================================

FOOTER

========================================================

Minimal.

CAMPUS NEWS

EVENTS

NEWS

ANNOUNCEMENTS

CONTACT

Small system information:

CAMPUS NEWS / 2026

Add subtle animated linework.

========================================================

CRAZY SCROLL SYSTEM

========================================================

THIS IS ONE OF THE MOST IMPORTANT PARTS.

The website must have a sophisticated scroll choreography.

Use GSAP ScrollTrigger + Lenis.

Implement:

1. Smooth inertial scrolling.

2. Hero depth transition.

3. Text entering from perspective.

4. Horizontal event gallery.

5. Pinned sections.

6. 3D card transitions.

7. Parallax images.

8. Clip-path image reveals.

9. Text masking.

10. Scroll-linked progress line.

11. Section numbers changing dynamically.

12. Elements moving at different depth speeds.

13. Image scale transitions.

14. Perspective rotations.

15. Dashboard entering from 3D perspective.

16. Timeline drawing based on scroll progress.

17. Sticky navigation transformation.

18. Micro-interactions.

19. Magnetic buttons.

20. Subtle cursor interaction.

The animations must feel connected.

DO NOT randomly animate elements.

Every animation must support the storytelling.

========================================================

3D PERSPECTIVE

========================================================

Use CSS 3D transforms heavily before reaching for WebGL.

Use:

perspective

transform-style: preserve-3d

translateZ

rotateX

rotateY

scale

Use React Three Fiber only where actual 3D provides value.

The website should still work beautifully if WebGL is disabled.

========================================================

CUSTOM CURSOR

========================================================

Desktop only.

Create a tiny custom cursor.

Normal:

small circle.

Hover link:

expand.

Hover project:

show:

VIEW →

Hover image:

show:

EXPLORE

Use subtle magnetic interaction.

Disable on touch devices.

========================================================

NAVIGATION

========================================================

Floating glass navigation.

Initially:

transparent / floating.

When scrolling:

slightly reduce height.

Increase blur.

Become more opaque.

Add small active section indicator.

Navigation should feel like a floating piece of glass.

========================================================

GLASS DETAILS

========================================================

Use subtle highlights on glass panels.

Create a small animated reflection that occasionally moves

across the surface.

Keep this extremely subtle.

Do NOT use excessive glow.

========================================================

MOBILE

========================================================

Mobile must be intentionally designed.

Do NOT simply shrink desktop.

Disable expensive 3D effects when necessary.

Keep:

editorial typography

glass surfaces

small borders

blue atmosphere

custom icons

smooth transitions

Convert horizontal sections into vertical experiences.

Keep animations lightweight.

Support:

prefers-reduced-motion.

========================================================

FULL APPLICATION

========================================================

After the landing page, implement the actual application.

Pages:

/

 /events

 /events/[id]

 /news

 /news/[id]

 /announcements

 /login

 /register

 /dashboard

 /dashboard/events

 /notifications

 /profile

 /organizer

 /organizer/events

 /organizer/events/create

 /organizer/events/[id]

 /admin

Everything must connect to the real backend.

========================================================

BACKEND

========================================================

Use Supabase.

Supabase Auth.

PostgreSQL.

Supabase Storage.

Supabase Realtime.

Implement:

authentication

profiles

events

registrations

attendance

news

announcements

notifications

Use Row Level Security.

Do not expose service keys.

========================================================

EVENT FUNCTIONALITY

========================================================

Students:

browse events

search

filter

view details

register

cancel registration

view registered events

Organizers:

create

edit

publish

cancel

delete

manage registrations

track attendance

Capacity must be enforced server-side.

Duplicate registration must be impossible.

========================================================

REAL-TIME NOTIFICATIONS

========================================================

Use Supabase Realtime.

Notify users when:

event registration succeeds

event changes

event is cancelled

event time changes

new announcement is published

important campus update occurs

Notification count must update in real time.

========================================================

ATTENDANCE

========================================================

Organizers can check students in.

Show:

REGISTERED

CHECKED IN

NOT CHECKED IN

ATTENDANCE RATE

Persist attendance.

========================================================

NEWS

========================================================

Admins can:

create

edit

publish

delete

Students can:

read

search

filter

open article

========================================================

ANNOUNCEMENTS

========================================================

Admins/authorized organizers can:

create

publish

schedule

edit

delete

Priority:

NORMAL

IMPORTANT

URGENT

========================================================

DATA ARCHITECTURE

========================================================

Keep all database types strongly typed.

Create:

types/

lib/

services/

hooks/

components/

Use reusable services.

Do not put database logic everywhere.

========================================================

COMPONENT SYSTEM

========================================================

Create reusable components:

GlassPanel

GlassButton

SectionLabel

SectionNumber

AnimatedHeading

ScrollReveal

ParallaxImage

EventCard

NewsCard

AnnouncementItem

NotificationPanel

CustomIcon

MagneticButton

PageTransition

SectionProgress

CampusCursor

========================================================

QUALITY BAR

========================================================

The finished product should look like an award-winning

futuristic university platform.

Think:

Awwwards-quality interaction design

+

premium editorial website

+

Apple-level polish

+

modern glassmorphism

+

futuristic campus interface.

DO NOT make it look like:

a Bootstrap website

a school portal from 2015

a generic SaaS dashboard

a generic Tailwind template

a Dribbble concept that does not work.

========================================================

FINAL REQUIREMENT

========================================================

Before declaring the project finished:

Test every button.

Test every form.

Test authentication.

Test event registration.

Test event capacity.

Test organizer functionality.

Test attendance.

Test news.

Test announcements.

Test notifications.

Test realtime updates.

Test responsive layouts.

Test mobile navigation.

Test all animations.

Test reduced motion.

Fix overflow.

Fix ScrollTrigger refresh issues.

Fix hydration errors.

Fix console errors.

Run production build.

Do not stop until the application is functional,

responsive, visually polished, and production-ready.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/edfe0aae-455b-4976-a5b9-cfc79c58e3b2).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
