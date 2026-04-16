import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-black text-primary-foreground">11</span>
          </div>
          <span className="text-sm font-bold">Plugin 11</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Get Started &mdash; Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto flex max-w-4xl flex-col items-center px-6 pb-20 pt-24 text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="text-xs font-medium text-primary">Now in public beta</span>
        </div>

        <h1 className="text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl">
          The IDE that thinks
          <br />
          <span className="text-primary">with you.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
          Write your ideas. We&apos;ll build the software. Plugin 11 is a
          collaborative notebook where your notes become working code &mdash;
          powered by AI that reads along as you think.
        </p>

        {/* CTA */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-primary/40"
          >
            Get Started &mdash; Free
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-border px-8 py-3.5 text-sm font-medium transition-colors hover:bg-accent"
          >
            Watch demo
          </Link>
        </div>

        {/* Preview mockup */}
        <div className="relative mt-16 w-full overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
          <div className="flex h-8 items-center gap-1.5 border-b border-border bg-secondary px-3">
            <div className="h-2.5 w-2.5 rounded-full bg-destructive/40" />
            <div className="h-2.5 w-2.5 rounded-full bg-warning/40" />
            <div className="h-2.5 w-2.5 rounded-full bg-success/40" />
            <span className="ml-2 text-[10px] text-muted-foreground">Plugin 11 &mdash; My Project</span>
          </div>
          <div className="flex h-80">
            {/* Sidebar mock */}
            <div className="w-48 border-r border-border bg-card p-3">
              <div className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Notebooks</div>
              {["Auth", "Payment", "UI/UX"].map((nb) => (
                <div key={nb} className="mb-1 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-accent">
                  {nb}
                </div>
              ))}
            </div>
            {/* Editor mock */}
            <div className="flex-1 p-4">
              <div className="mb-3 text-sm font-bold">Login Flow</div>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>The login page should support email + password and OAuth (Google, GitHub).</p>
                <p>Session tokens expire after 7 days of inactivity.</p>
                <div className="bot-text-suggestion">
                  <div className="mb-1 flex items-center gap-1.5">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                    <span className="text-[10px] font-semibold text-primary">AI Suggestion</span>
                  </div>
                  <p className="text-xs">Consider adding rate limiting to the login endpoint — 5 failed attempts should trigger a 15-minute lockout.</p>
                  <div className="mt-1.5 flex gap-1.5">
                    <span className="rounded bg-success/10 px-2 py-0.5 text-[10px] text-success">Accept</span>
                    <span className="rounded bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground">Dismiss</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Chat mock */}
            <div className="w-52 border-l border-border p-3">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Chat</div>
              <div className="space-y-2">
                <div className="rounded bg-secondary px-2 py-1.5 text-[10px]">
                  <span className="font-semibold text-primary">AI</span>
                  <p className="mt-0.5 text-muted-foreground">Reading your Auth notes...</p>
                </div>
                <div className="rounded bg-primary/10 px-2 py-1.5 text-[10px]">
                  Implement the login page
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="mx-auto max-w-4xl px-6 pb-24">
        <div className="grid gap-6 sm:grid-cols-3">
          <FeatureCard
            title="Write in plain language"
            description="No code required. Write your ideas in notebooks and the AI understands your intent, suggests improvements, and catches contradictions."
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            }
          />
          <FeatureCard
            title="Real-time collaboration"
            description="Google Docs-level multiplayer. See cursors, share notebooks, collaborate with your team. The AI is just another collaborator in the room."
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          />
          <FeatureCard
            title="AI builds the code"
            description="Working software emerges from your notes. The AI generates, tests, and deploys real code — you never have to see a line of it unless you want to."
            icon={
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            }
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-primary text-[8px] font-black text-primary-foreground">
              11
            </div>
            Plugin 11 &mdash; The Vibe Coder IDE
          </div>
          <div className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Plugin 11
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/30 hover:bg-primary/5">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
        {icon}
      </div>
      <h3 className="mb-2 text-sm font-bold">{title}</h3>
      <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}
