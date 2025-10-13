import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="p-4 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <Link href="/kalender" className="p-6 border rounded-xl hover:shadow">
        <div className="text-lg font-semibold">Indicaties", href:"/indicaties"},
    { label:"Inventaris", href:"/inventaris"},
    { label:"{ label:"Indicaties", href:"/indicaties"},
    { label:"Inventaris", href:"/inventaris"},
    Kalender"</div>
        <div className="text-sm text-gray-500">Plan sportmomenten</div>
      </Link>
    </div>
  );
}
