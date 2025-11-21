"use client";

import { useState, useEffect } from "react";
import { Plus, Filter, Edit2, Trash2, Package, X, Save } from "lucide-react";
import { MaterialCategory, ConditionStatus } from "@prisma/client";

interface Material {
  id: string;
  name: string;
  category: MaterialCategory;
  description?: string;
  quantityTotal: number;
  quantityUsable: number;
  location: string;
  conditionStatus: ConditionStatus;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = ["FITNESS", "BALLEN", "MATTEN", "ELASTIEKEN", "OVERIG"];
const CONDITIONS = ["GOED", "LICHT_BESCHADIGD", "KAPOT", "TE_VERVANGEN"];

const CATEGORY_LABELS: Record<string, string> = {
  FITNESS: "Fitness",
  BALLEN: "Ballen",
  MATTEN: "Matten",
  ELASTIEKEN: "Elastieken",
  OVERIG: "Overig",
};

const CONDITION_LABELS: Record<string, string> = {
  GOED: "Goed",
  LICHT_BESCHADIGD: "Licht Beschadigd",
  KAPOT: "Kapot",
  TE_VERVANGEN: "Te Vervangen",
};

const CONDITION_COLORS: Record<string, string> = {
  GOED: "bg-green-100 text-green-800",
  LICHT_BESCHADIGD: "bg-yellow-100 text-yellow-800",
  KAPOT: "bg-red-100 text-red-800",
  TE_VERVANGEN: "bg-orange-100 text-orange-800",
};

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  // Filters
  const [filterCategory, setFilterCategory] = useState("");
  const [filterCondition, setFilterCondition] = useState("");
  const [filterLocation, setFilterLocation] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "FITNESS" as MaterialCategory,
    description: "",
    quantityTotal: 0,
    quantityUsable: 0,
    location: "",
    conditionStatus: "GOED" as ConditionStatus,
  });

  useEffect(() => {
    fetchMaterials();
  }, [filterCategory, filterCondition, filterLocation]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterCategory) params.append("category", filterCategory);
      if (filterCondition) params.append("conditionStatus", filterCondition);
      if (filterLocation) params.append("location", filterLocation);

      const res = await fetch(`/api/materials?${params}`);
      const data = await res.json();
      setMaterials(data);
    } catch (error) {
      console.error("Failed to fetch materials", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (material?: Material) => {
    if (material) {
      setEditingMaterial(material);
      setFormData({
        name: material.name,
        category: material.category,
        description: material.description || "",
        quantityTotal: material.quantityTotal,
        quantityUsable: material.quantityUsable,
        location: material.location,
        conditionStatus: material.conditionStatus,
      });
    } else {
      setEditingMaterial(null);
      setFormData({
        name: "",
        category: "FITNESS",
        description: "",
        quantityTotal: 0,
        quantityUsable: 0,
        location: "",
        conditionStatus: "GOED",
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingMaterial ? "PUT" : "POST";
      const body = editingMaterial
        ? { id: editingMaterial.id, ...formData }
        : formData;

      const res = await fetch("/api/materials", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setShowModal(false);
        fetchMaterials();
      } else {
        alert("Opslaan mislukt");
      }
    } catch (error) {
      console.error("Error saving material", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Weet je zeker dat je dit materiaal wilt verwijderen?")) return;

    try {
      const res = await fetch(`/api/materials?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchMaterials();
      } else {
        alert("Verwijderen mislukt");
      }
    } catch (error) {
      console.error("Error deleting material", error);
    }
  };

  if (loading) return <div className="p-8">Laden...</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Materialen</h1>
          <p className="text-gray-500 mt-1">Beheer sportmaterialen en inventaris</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center shadow-sm transition-all"
        >
          <Plus size={20} className="mr-2" />
          Nieuw Materiaal
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex gap-4">
        <div className="flex items-center text-gray-500">
          <Filter size={18} className="mr-2" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="bg-gray-50 border-none text-sm rounded-md px-3 py-1 focus:ring-0"
        >
          <option value="">Alle Categorieën</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
        <select
          value={filterCondition}
          onChange={(e) => setFilterCondition(e.target.value)}
          className="bg-gray-50 border-none text-sm rounded-md px-3 py-1 focus:ring-0"
        >
          <option value="">Alle Condities</option>
          {CONDITIONS.map((cond) => (
            <option key={cond} value={cond}>
              {CONDITION_LABELS[cond]}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Locatie..."
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
          className="bg-gray-50 border-none text-sm rounded-md px-3 py-1 focus:ring-0"
        />
      </div>

      {/* Materials Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Naam</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Categorie</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Locatie</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Totaal</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Bruikbaar</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Conditie</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Acties</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {materials.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-400 italic">
                  Geen materialen gevonden.
                </td>
              </tr>
            ) : (
              materials.map((material) => (
                <tr key={material.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mr-3">
                        <Package size={16} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{material.name}</div>
                        {material.description && (
                          <div className="text-xs text-gray-500">{material.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {CATEGORY_LABELS[material.category]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{material.location}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{material.quantityTotal}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{material.quantityUsable}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${CONDITION_COLORS[material.conditionStatus]}`}>
                      {CONDITION_LABELS[material.conditionStatus]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(material)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(material.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Package className="mr-2 text-blue-500" />
                {editingMaterial ? "Materiaal Bewerken" : "Nieuw Materiaal"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Naam *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="bijv. Dumbbell 10kg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categorie *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as MaterialCategory })}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {CATEGORY_LABELS[cat]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Locatie *</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="bijv. Magazijn"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Totaal Aantal *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.quantityTotal}
                    onChange={(e) => setFormData({ ...formData, quantityTotal: parseInt(e.target.value) })}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bruikbaar Aantal *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.quantityUsable}
                    onChange={(e) => setFormData({ ...formData, quantityUsable: parseInt(e.target.value) })}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Conditie *</label>
                  <select
                    required
                    value={formData.conditionStatus}
                    onChange={(e) => setFormData({ ...formData, conditionStatus: e.target.value as ConditionStatus })}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {CONDITIONS.map((cond) => (
                      <option key={cond} value={cond}>
                        {CONDITION_LABELS[cond]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Omschrijving</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Optionele beschrijving..."
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Annuleren
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Save size={18} className="mr-2" />
                  Opslaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
