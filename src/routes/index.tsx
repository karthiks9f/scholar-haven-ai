import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpenCheck, CalendarDays, NotebookPen, Sparkles, Timer, Zap } from "lucide-react";

const SITE_URL = "https://scholar-haven-ai.lovable.app";

const FEATURES = [
  {
    icon: CalendarDays,
    title: "Six-period class schedule",
    body: "2nd Language (Kannada, Sanskrit or Hindi), Mathematics, Science, Social Science, Computer Science and English — each period with its teacher and study topics in one card.",
  },
  {
    icon: Sparkles,
    title: "AI Study Buddy that actually teaches",
    body: "Tap any topic and StudentVault explains it from scratch, works through an example, then gives practice questions with solutions. No links to other websites.",
  },
  {
    icon: NotebookPen,
    title: "Instant revision snap notes",
    body: "Type any topic and get a scannable revision sheet — definition, must-know points, formulas and a self-check — saved to your revision shelf.",
  },
  {
    icon: Timer,
    title: "Focus timer for study sessions",
    body: "A 25-minute Pomodoro timer with calm ambient sound so revision sessions stay on track.",
  },
];

const FAQ = [
  {
    q: "What is StudentVault?",
    a: "StudentVault is a free study dashboard for high school students. It keeps your six class periods, teacher contacts and study topics in one place, teaches each topic with an AI tutor, generates revision snap notes and runs a focus timer for study sessions.",
  },
  {
    q: "Is StudyVault the same app?",
    a: "Yes — StudentVault is often spelled or searched as StudyVault or Study Vault. They refer to this same study dashboard.",
  },
  {
    q: "Do I need an account?",
    a: "Creating a free account saves your grade, second language, schedule and revision sheets across devices. If someone shared an access key with you, you can enter it on the sign-in screen and go straight in.",
  },
  {
    q: "Is StudentVault free to use?",
    a: "Yes. Lessons, revision sheets, the class schedule and the focus timer are all included at no cost.",
  },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StudentVault — Free Study Dashboard & AI Lessons for Students" },
      {
        name: "description",
        content:
          "StudentVault (also searched as StudyVault) is a free study dashboard: six-period class schedule, AI lessons that teach any topic, instant revision snap notes and a focus timer.",
      },
      { property: "og:title", content: "StudentVault — Free Study Dashboard & AI Lessons" },
      {
        property: "og:description",
        content:
          "Learn every school subject in one place: AI lessons, revision snap notes, class schedule and a focus timer.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "StudentVault",
          alternateName: ["StudyVault", "Study Vault", "Student Vault"],
          url: `${SITE_URL}/`,
          description:
            "Free study dashboard for high school students with AI lessons, revision snap notes, a six-period class schedule and a focus timer.",
          publisher: {
            "@type": "Organization",
            name: "StudentVault",
            alternateName: "StudyVault",
            url: `${SITE_URL}/`,
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }),
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="relative z-10 min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <span className="flex min-w-0 items-center gap-3">
            <span className="period-pill grid h-10 w-10 shrink-0 place-items-center rounded-2xl">
              <Zap className="h-5 w-5" />
            </span>
            <span className="font-display truncate text-lg font-extrabold tracking-tight sm:text-xl">
              StudentVault <span className="gradient-text">⚡</span>
            </span>
          </span>
          <Link
            to="/signin"
            className="inline-flex h-11 shrink-0 items-center rounded-xl bg-primary px-4 font-bold text-primary-foreground shadow-[var(--shadow-glow)] transition-colors hover:bg-primary-glow"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <section className="pt-14 sm:pt-20">
          <p className="text-xs font-semibold tracking-[0.18em] text-primary-glow uppercase">
            Study dashboard · AI lessons · revision notes
          </p>
          <h1 className="font-display mt-3 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
            StudentVault — your <span className="gradient-text">study dashboard</span> with in-app
            lessons
          </h1>
          <p className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
            StudentVault (many students search for it as <strong>StudyVault</strong>) puts your six
            school periods, an AI tutor that teaches each topic step by step, instant revision snap
            notes and a focus timer into one dark, distraction-free dashboard. Everything happens
            inside the app — you never get sent off to another website.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/signin"
              className="inline-flex h-12 items-center gap-2 rounded-2xl bg-primary px-6 font-bold text-primary-foreground shadow-[var(--shadow-glow)] transition-colors hover:bg-primary-glow"
            >
              <BookOpenCheck className="h-4 w-4" />
              Create your free vault
            </Link>
            <Link
              to="/revision"
              className="inline-flex h-12 items-center gap-2 rounded-2xl border border-border-bright bg-surface-raised px-6 font-bold transition-colors hover:bg-accent"
            >
              <NotebookPen className="h-4 w-4" />
              See revision sheets
            </Link>
          </div>
        </section>

        <section aria-labelledby="features" className="mt-20">
          <h2 id="features" className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
            What you get inside StudentVault
          </h2>
          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <article key={feature.title} className="glass rounded-3xl p-6">
                <span className="period-pill grid h-11 w-11 place-items-center rounded-2xl">
                  <feature.icon className="h-5 w-5" />
                </span>
                <h3 className="font-display mt-4 text-lg font-bold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="how" className="mt-20">
          <h2 id="how" className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
            How students use it
          </h2>
          <ol className="mt-7 grid gap-4 sm:grid-cols-3">
            {[
              "Pick your grade and second language, and your six periods are set up instantly.",
              "Tap a topic on any class card — the AI Study Buddy teaches it with a worked example and practice questions.",
              "Generate a revision snap note before a test and re-read it from your revision shelf.",
            ].map((step, index) => (
              <li key={step} className="glass rounded-3xl p-6">
                <span className="font-display text-3xl font-extrabold text-primary-glow">
                  {index + 1}
                </span>
                <p className="mt-3 text-sm text-muted-foreground">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="faq" className="mt-20">
          <h2 id="faq" className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
            Frequently asked questions
          </h2>
          <div className="mt-7 space-y-4">
            {FAQ.map((item) => (
              <article key={item.q} className="glass rounded-3xl p-6">
                <h3 className="font-display text-base font-bold">{item.q}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <p className="mx-auto max-w-6xl px-4 text-xs text-muted-foreground sm:px-6">
          StudentVault — a free study dashboard for high school students, also known as StudyVault.
        </p>
      </footer>
    </div>
  );
}
