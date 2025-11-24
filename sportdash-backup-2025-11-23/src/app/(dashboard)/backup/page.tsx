'use client';

import { useState } from 'react';
import { Download, Database, AlertTriangle } from 'lucide-react';

export default function BackupPage() {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch('/api/backup');
      if (!res.ok) throw new Error('Backup failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sportdash_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed', error);
      alert('Backup downloaden mislukt');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Database className="text-blue-600" size={32} />
          Backup & Export
        </h1>
        <p className="text-gray-500 text-lg mt-1">
          Download een kopie van de database
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-start gap-6">
          <div className="p-4 bg-blue-50 rounded-full text-blue-600">
            <Download size={32} />
          </div>
          <div className="space-y-4 flex-1">
            <h2 className="text-xl font-bold text-gray-800">Volledige Database Export</h2>
            <p className="text-gray-600">
              Download alle data (groepen, jongeren, rapportages, materialen) als een JSON-bestand.
              Dit bestand kan gebruikt worden voor archivering of analyse.
            </p>

            <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-lg flex items-start gap-3">
              <AlertTriangle className="text-yellow-600 shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-yellow-800">
                Let op: Dit bestand bevat gevoelige persoonsgegevens. Bewaar het veilig en deel het niet onversleuteld.
              </p>
            </div>

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Bezig met genereren...
                </>
              ) : (
                <>
                  <Download size={20} />
                  Download Backup (.json)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
