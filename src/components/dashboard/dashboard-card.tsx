import Link from "next/link";

export function DashboardCard({
  href,
  eyebrow,
  title,
  description,
  tone = "default",
}: {
  href: string;
  eyebrow: string;
  title: string;
  description: string;
  tone?: "default" | "admin";
}) {
  return (
    <Link
      href={href}
      className={`feature-card flex min-h-40 flex-col rounded-xl border p-6 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
        tone === "admin" ? "border-accent/40 bg-accent-soft" : "border-border bg-card"
      }`}
    >
      <span className="text-xs font-extrabold tracking-[0.16em] text-accent">{eyebrow}</span>
      <span className="mt-4 font-display text-xl">{title}</span>
      <span className="mt-2 text-sm leading-6 text-muted">{description}</span>
      <span className="mt-auto pt-5 text-sm font-bold text-foreground" aria-hidden="true">
        열기 →
      </span>
    </Link>
  );
}

