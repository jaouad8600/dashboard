import Link from "next/link";
export default function Home(){
  return (
    <div className="p-6 space-y-2">
      <h1 className="text-xl font-bold">Homepage</h1>
      <p className="space-x-4">
        <Link className="underline" href="/admin">Dashboard</Link>
        <Link className="underline" href="/calendar">Kalender</Link>
        <Link className="underline" href="/schedule">Schedule</Link>
        <Link className="underline" href="/overdrachten">Overdrachten</Link>
        <Link className="underline" href="/groepen">Groepen</Link>
        <Link className="underline" href="/debug/seed">Debug/Seed</Link>
        <Link className="underline" href="/health">Health</Link>
      </p>
    </div>
  );
}
