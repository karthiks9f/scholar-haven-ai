# Make StudentVault findable on Google

Right now the homepage renders only the login box and is client-only rendered, so Google sees a nearly empty page. Nothing describes what StudentVault is, so there's no content to match a search. The fix is a real, crawlable public homepage.

## What changes

**1. Public landing page at `/`**
- A server-rendered marketing page (no login required) with:
  - One H1: "StudentVault — study dashboard with in-app lessons"
  - Short intro paragraph mentioning StudentVault and the alternate spelling "StudyVault" naturally in the copy
  - Feature sections: six-subject class schedule, in-app AI lessons, revision snap notes, Pomodoro focus timer
  - A short FAQ ("What is StudentVault?", "Is StudyVault the same app?", "Is it free?")
  - Primary "Sign in / Create your vault" button
- Same dark glass visual style as the rest of the app.

**2. Dashboard moves to `/dashboard`**
- The current logged-in experience (schedule, timer, Study Buddy) moves there, unchanged.
- Signed-in visitors landing on `/` are sent to the dashboard automatically, so the flow feels the same for you.
- Login/access-key screen lives at `/signin`.

**3. Metadata and structured data**
- Homepage: brand-led title ("StudentVault — Free Study Dashboard & AI Lessons for Students"), meta description, self-referencing canonical and `og:url`.
- Add WebSite + Organization JSON-LD with `name: "StudentVault"` and `alternateName: "StudyVault"`, plus FAQPage JSON-LD for the FAQ block.
- `/revision` and `/dashboard`: `/dashboard` marked noindex (private); `/revision` keeps its own metadata.

**4. Sitemap and robots**
- Sitemap entries updated to the new public routes (`/`, `/signin`, `/revision`); robots.txt already allows crawling.

## Technical notes
- New `src/routes/dashboard.tsx` (moved from `index.tsx`), new `src/routes/signin.tsx`, rewritten `src/routes/index.tsx` with `ssr: true` and static content only — no Supabase calls at module or render level so prerender stays clean.
- `TopNav` links updated (Classes → `/dashboard`).
- Sitemap route `entries` array updated.

## Expectation to set
Publishing plus these changes makes the site indexable, but Google decides when to index and how it ranks a brand-new domain. Expect days to a few weeks before "studentvault" / "studyvault" searches surface it, and a generic term like "studyvault" already has competing sites — the brand match plus real page content is the strongest lever available.

## After approval
Publish the app so Google can crawl the new homepage; then request indexing for `/` in Search Console.
