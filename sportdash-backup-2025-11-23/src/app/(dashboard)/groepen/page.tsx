"use client";

import { useState, useEffect } from "react";
import { Users, Activity, AlertTriangle, MessageCircleWarning } from "lucide-react";
import ColorPicker from "@/components/ui/ColorPicker";
import NotesModal from "@/components/domain/NotesModal";
import RestorativeTalkModal from "@/components/domain/RestorativeTalkModal";

interface Group {
  id: string;
  name: string;
  color: string;

  notes: Array<{ id: string; content: string; createdAt: string }>;
  youths: Array<{ id: string; firstName: string; lastName: string }>;
  _count: {
    mutations: number;
    indications: number;
  };
  restorativeTalks?: Array<{ id: string; youthName: string; createdBy: string; reason: string }>;
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<{ id: string; name: string } | null>(null);
  const [restorativeModalGroup, setRestorativeModalGroup] = useState<Group | null>(null);

  useEffect(() => {
    fetchGroups();

    // Poll every 10 seconds for live updates
    const interval = setInterval(fetchGroups, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/groups");
      const data = await res.json();
      if (Array.isArray(data)) {
        // Fetch restorative talk counts for each group
        const groupsWithTalks = await Promise.all(
          data.map(async (group: Group) => {
            try {
              const talksRes = await fetch(`/api/restorative-talks?groupId=${group.id}&includeArchived=false`);
              const talks = await talksRes.json();
              const pendingTalks = Array.isArray(talks) ? talks.filter((t: any) => t.status === 'PENDING') : [];
              return { ...group, restorativeTalks: pendingTalks };
            } catch (err) {
              console.error(`Failed to fetch talks for group ${group.id}`, err);
              return { ...group, restorativeTalks: [] };
            }
          })
        );
        setGroups(groupsWithTalks);
      } else {
        console.error("API returned non-array for groups:", data);
        setGroups([]);
      }
    } catch (error) {
      console.error("Failed to fetch groups", error);
    } finally {
      setLoading(false);
    }
  };

  const handleColorChange = (groupId: string, newColor: string) => {
    setGroups(groups.map(g =>
      g.id === groupId ? { ...g, color: newColor } : g
    ));
  };



  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 font-serif">
            <Users className="text-teylingereind-royal" size={32} />
            Groepen
          </h1>
          <p className="text-gray-500 text-lg mt-1">
            Beheer groepen, kleuren en notities
          </p>
        </div>
      </div>

      {/* Groups Grid */}
      {Array.isArray(groups) && groups.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {groups.map((group) => (
            <div
              key={group.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
            >
              <div className="p-6">
                {/* Header with Color Picker */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 font-serif">{group.name}</h2>
                    {/* Status Text */}
                    <div className="mt-1 text-xs font-medium text-gray-600">
                      {(() => {
                        switch (group.color?.toUpperCase()) {
                          case 'ROOD': return 'Leiden (Veel sturing, weinig ondersteuning)';
                          case 'ORANJE': return 'Begeleiden (Gemiddelde sturing, gemiddelde ondersteuning)';
                          case 'GEEL': return 'Steunen (Weinig sturing, veel ondersteuning)';
                          case 'GROEN': return 'Delegeren (Weinig sturing, weinig ondersteuning)';
                          default: return '';
                        }
                      })()}
                    </div>
                  </div>
                  <ColorPicker
                    currentColor={group.color}
                    groupId={group.id}
                    groupName={group.name}
                    onColorChange={(newColor) => handleColorChange(group.id, newColor)}
                  />
                </div>

                {/* Youths List - REMOVED FOR PRIVACY */}
                {/* <div className="mb-4">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Jongeren ({group.youths?.length || 0})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {group.youths && group.youths.length > 0 ? (
                      group.youths.map((youth) => (
                        <span
                          key={youth.id}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md border border-gray-200"
                        >
                          {youth.firstName} {youth.lastName.charAt(0)}.
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 italic">Geen jongeren gekoppeld</span>
                    )}
                  </div>
                </div> */}

                {/* Restorative Talk Flag */}
                <div className="mb-4">
                  {group.restorativeTalks && group.restorativeTalks.length > 0 ? (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-teylingereind-orange uppercase tracking-wider flex items-center gap-1">
                        <MessageCircleWarning size={14} />
                        Herstelgesprekken ({group.restorativeTalks.length})
                      </h3>
                      {group.restorativeTalks.map(talk => (
                        <div key={talk.id} className="bg-orange-50 border border-orange-100 p-2 rounded-lg text-sm">
                          <div className="font-bold text-gray-800 flex justify-between">
                            <span>{talk.youthName}</span>
                            <span className="text-xs font-normal text-gray-500">o.l.v. {talk.createdBy || "Onbekend"}</span>
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5 truncate">{talk.reason}</div>
                        </div>
                      ))}
                      <button
                        onClick={() => setRestorativeModalGroup(group)}
                        className="w-full text-center text-xs text-teylingereind-orange hover:underline mt-1"
                      >
                        Beheren
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setRestorativeModalGroup(group)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gray-50 text-gray-500 hover:bg-gray-100 border border-transparent transition-all"
                    >
                      <MessageCircleWarning size={18} />
                      Geen Herstelgesprekken
                    </button>
                  )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-2 bg-red-50 rounded-lg">
                    <div className="flex justify-center text-red-500 mb-1">
                      <Activity size={16} />
                    </div>
                    <div className="text-lg font-bold text-gray-700">{group._count.mutations}</div>
                    <div className="text-xs text-gray-500">Mutaties</div>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded-lg">
                    <div className="flex justify-center text-purple-500 mb-1">
                      <Activity size={16} />
                    </div>
                    <div className="text-lg font-bold text-gray-700">{group._count.indications}</div>
                    <div className="text-xs text-gray-500">Indicaties</div>
                  </div>
                </div>

                {/* Notes Preview - Clickable */}
                <div
                  onClick={() => setSelectedGroup({ id: group.id, name: group.name })}
                  className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 min-h-[80px] cursor-pointer hover:bg-yellow-100 hover:border-yellow-200 transition-all hover:shadow-sm group"
                  title="Klik om notities te beheren"
                >
                  <h3 className="text-xs font-bold text-yellow-800 mb-1 uppercase tracking-wide flex items-center justify-between">
                    Notities
                    <span className="text-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity text-xs normal-case font-normal">
                      Klik om te beheren
                    </span>
                  </h3>
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {group.notes && group.notes.length > 0 ? (
                      group.notes[0].content
                    ) : (
                      <span className="italic text-gray-400">Klik om notitie toe te voegen...</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Users size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Geen groepen gevonden</p>
        </div>
      )}

      {/* Notes Modal */}
      <NotesModal
        isOpen={selectedGroup !== null}
        onClose={() => {
          setSelectedGroup(null);
          fetchGroups(); // Refresh to show updated notes
        }}
        groupId={selectedGroup?.id || ""}
        groupName={selectedGroup?.name || ""}
      />

      {/* Restorative Talk Modal */}
      {restorativeModalGroup && (
        <RestorativeTalkModal
          isOpen={!!restorativeModalGroup}
          onClose={() => {
            setRestorativeModalGroup(null);
            fetchGroups(); // Refresh to update counts
          }}
          groupId={restorativeModalGroup.id}
          groupName={restorativeModalGroup.name}
        />
      )}
    </div>
  );
}
