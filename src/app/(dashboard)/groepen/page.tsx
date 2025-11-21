"use client";

import { useState, useEffect } from "react";
import { Users, Activity, AlertTriangle, Edit2, Save, X, Archive } from "lucide-react";

interface Group {
  id: string;
  name: string;
  color: string;
  youthCount: number;
  notes: string | null;
  _count: {
    mutations: number;
    indications: number;
  };
}

const COLORS: { label: string; value: string; bg: string }[] = [
  { label: "Groen", value: "GREEN", bg: "#22c55e" },
  { label: "Geel", value: "YELLOW", bg: "#eab308" },
  { label: "Oranje", value: "ORANGE", bg: "#f97316" },
  { label: "Rood", value: "RED", bg: "#ef4444" },
];

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/groups");
      const data = await res.json();
      setGroups(data);
    } catch (error) {
      console.error("Failed to fetch groups", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editingGroup) return;

    try {
      const res = await fetch("/api/groups", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingGroup.id,
          color: editingGroup.color,
          notes: editingGroup.notes,
        }),
      });

      if (res.ok) {
        setEditingGroup(null);
        fetchGroups();
      } else {
        alert("Opslaan mislukt");
      }
    } catch (error) {
      console.error("Error saving group", error);
    }
  };

  const getBgColor = (colorEnum: string) => {
    const c = COLORS.find(c => c.value === colorEnum);
    return c ? c.bg : "#6b7280";
  };

  if (loading) return <div className="p-8">Laden...</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Groepen Overzicht</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <div key={group.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            {/* Header with Color */}
            <div className="h-2" style={{ backgroundColor: getBgColor(group.color) }} />

            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-800">{group.name}</h2>
                <button
                  onClick={() => setEditingGroup(group)}
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Edit2 size={18} />
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <div className="flex justify-center text-blue-500 mb-1"><Users size={16} /></div>
                  <div className="text-lg font-bold text-gray-700">{group.youthCount}</div>
                  <div className="text-xs text-gray-500">Jongeren</div>
                </div>
                <div className="text-center p-2 bg-red-50 rounded-lg">
                  <div className="flex justify-center text-red-500 mb-1"><Activity size={16} /></div>
                  <div className="text-lg font-bold text-gray-700">{group._count.mutations}</div>
                  <div className="text-xs text-gray-500">Mutaties</div>
                </div>
                <div className="text-center p-2 bg-purple-50 rounded-lg">
                  <div className="flex justify-center text-purple-500 mb-1"><Activity size={16} /></div>
                  <div className="text-lg font-bold text-gray-700">{group._count.indications}</div>
                  <div className="text-xs text-gray-500">Indicaties</div>
                </div>
              </div>

              {/* Notes Preview */}
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 min-h-[80px]">
                <h3 className="text-xs font-bold text-yellow-800 mb-1 uppercase tracking-wide">Notities</h3>
                <p className="text-sm text-gray-700 line-clamp-3">
                  {group.notes || <span className="italic text-gray-400">Geen notities...</span>}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Bewerk {editingGroup.name}</h2>
              <button onClick={() => setEditingGroup(null)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Groepskleur</label>
                <div className="flex flex-wrap gap-3">
                  {COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setEditingGroup({ ...editingGroup, color: c.value })}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${editingGroup.color === c.value ? "border-gray-800 scale-110" : "border-transparent hover:scale-105"
                        }`}
                      style={{ backgroundColor: c.bg }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notities</label>
                <textarea
                  value={editingGroup.notes || ""}
                  onChange={(e) => setEditingGroup({ ...editingGroup, notes: e.target.value })}
                  className="w-full p-3 border border-gray-200 rounded-lg h-32 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Plaats hier belangrijke opmerkingen over de groep..."
                />
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
              <button
                onClick={() => setEditingGroup(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Annuleren
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Save size={18} className="mr-2" />
                Opslaan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
