import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight">
          Plugin 11
        </h1>
        <p className="mt-4 text-xl text-muted-foreground">
          The Vibe Coder IDE — where notebooks are the source of truth
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Write your thoughts. The AI thinks with you. Working software emerges from your notes.
        </p>
      </div>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Get Started
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-border px-6 py-3 font-medium transition-colors hover:bg-accent"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
