import Link from "next/link";

const items = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Groepen", href: "/groepen" },
  { label: "Mutaties", href: "/mutaties" },
  { label: "Overdrachten", href: "/overdrachten" },
  { label: "Kalender", href: "/kalender" },
  { label: "Materialen", href: "/materialen" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 border-r bg-white p-4 hidden md:block">
      <div className="text-xl font-bold mb-6">SportDash</div>
      <nav className="space-y-1">
        {items.map(i => (
          <Link key={i.href} href={i.href} className="block px-3 py-2 rounded-lg hover:bg-gray-100">
            {i.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
