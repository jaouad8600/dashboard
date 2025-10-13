'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Item = {
  label: string;
  href?: string;
  children?: Item[];
};

const NAV: Item[] = [
  { label: 'Dashboard', href: '/dashboard' },

  { label: 'Weekkalender', children: [
      { label: 'Schedule', href: '/kalender' },   // voorlopig zelfde pagina
    ]
  },

  { label: 'Sportmomenten', href: '/sportmomenten' },
  { label: 'Groepen', href: '/groepen' },
  { label: 'Middelen', href: '/middelen' },
  { label: 'Aanwezigheid', href: '/aanwezigheid' },
  { label: 'Overdrachten', href: '/overdrachten' },
  { label: 'Dag-sheet', href: '/dag-sheet' },
  { label: 'Instellingen', href: '/instellingen' },
  { label: 'Back-up', href: '/back-up' },

  // ook terug zoals gevraagd
  { label: 'Indicaties', href: '/indicaties' },
  { label: 'Inventaris', href: '/inventaris' },
];

function Row({
  item, depth, activePath
}: { item: Item; depth: number; activePath: string }) {
  const isActive = item.href ? activePath.startsWith(item.href) : false;
  const base =
    "block rounded-xl px-3 py-2 transition-colors";
  const normal =
    depth === 0 ? "hover:bg-gray-100" : "hover:bg-gray-100 ml-5";
  const active =
    "bg-gray-900 text-white " + (depth>0 ? "ml-5" : "");

  if (item.href) {
    return (
      <Link href={item.href} className={`${base} ${isActive ? active : normal}`}>
        {item.label}
      </Link>
    );
  }
  // sectiekop
  return (
    <div className={"px-3 pt-4 pb-1 text-xs uppercase tracking-wide text-gray-500 " + (depth>0?"ml-5":"")}>
      {item.label}
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname() || '/';
  return (
    <aside className="w-64 border-r bg-white h-full">
      <div className="p-4 text-lg font-semibold">Teylingereind</div>
      <nav className="px-2 pb-6">
        {NAV.map((it, i) => (
          <div key={i} className="mb-1">
            <Row item={it} depth={0} activePath={pathname} />
            {it.children?.map((c, j) => (
              <Row key={j} item={c} depth={1} activePath={pathname} />
            ))}
          </div>
        ))}
      </nav>
      <div className="px-4 pb-4 text-xs text-gray-400">v0.1 demo</div>
    </aside>
  );
}
