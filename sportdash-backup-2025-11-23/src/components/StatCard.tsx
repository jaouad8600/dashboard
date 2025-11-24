import Link from "next/link";

export default function StatCard({
  title,
  value,
  subtitle,
  href,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  href?: string;
}) {
  const inner = (
    <div className="rounded-2xl border bg-white p-4 shadow-sm hover:bg-zinc-50 transition">
      <div className="text-sm text-zinc-500">{title}</div>
      <div className="mt-1 text-3xl font-bold">{value}</div>
      {subtitle ? (
        <div className="mt-1 text-xs text-zinc-500">{subtitle}</div>
      ) : null}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}
