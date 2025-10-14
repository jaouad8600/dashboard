export const metadata = { title: 'Back-up' };

export default function BackupPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Back-up</h1>
      </div>

      <p className="text-gray-600">
        Maak een export (JSON) van alle gegevens in <code>data/app-data.json</code>.
      </p>

      <div className="flex gap-3">
        <a
          href="/api/backup?download=1"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
        >
          Maak back-up (JSON)
        </a>
        <a
          href="/api/backup"
          className="inline-flex items-center px-4 py-2 rounded-lg border hover:bg-gray-50"
        >
          Bekijk JSON
        </a>
      </div>
    </div>
  );
}
