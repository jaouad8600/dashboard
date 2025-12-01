import React, { useState } from 'react';
import { X, FileText, FileSpreadsheet, File as FileIcon, ChevronRight, ChevronDown, CheckSquare, Square } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

interface Material {
    id: string;
    name: string;
    category: string;
    quantityTotal: number;
    quantityUsable: number;
    quantityBroken: number;
    quantityToOrder: number;
    location: string;
    conditionStatus: string;
}

interface ExportDialogProps {
    isOpen: boolean;
    onClose: () => void;
    materials: Material[];
}

const FOLDER_STRUCTURE = {
    "Middelen": {
        "01. Kortverblijf (EB)": [
            "Fitness EB",
            "Sportzaal EB",
            "Dojo",
            "Sportveld EB",
            "Bibliotheek",
            "Chillroom"
        ],
        "02. Langverblijf (Vloed)": [
            "Fitness Vloed",
            "Sportzaal Vloed",
            "Dojo",
            "Sportveld Vloed"
        ]
    }
};

export default function ExportDialog({ isOpen, onClose, materials }: ExportDialogProps) {
    const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
    const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({ "Middelen": true });

    if (!isOpen) return null;

    // Helper to get all leaf locations from the structure
    const getAllLocations = () => {
        const locations: string[] = [];
        Object.values(FOLDER_STRUCTURE["Middelen"]).forEach(subFolder => {
            locations.push(...subFolder);
        });
        return locations;
    };

    const toggleFolder = (path: string) => {
        setExpandedFolders(prev => ({ ...prev, [path]: !prev[path] }));
    };

    const toggleLocation = (location: string) => {
        setSelectedLocations(prev =>
            prev.includes(location)
                ? prev.filter(l => l !== location)
                : [...prev, location]
        );
    };

    const toggleCategory = (category: string, locations: string[]) => {
        const allSelected = locations.every(l => selectedLocations.includes(l));
        if (allSelected) {
            setSelectedLocations(prev => prev.filter(l => !locations.includes(l)));
        } else {
            setSelectedLocations(prev => [...Array.from(new Set([...prev, ...locations]))]);
        }
    };

    const toggleAll = () => {
        const allLocs = getAllLocations();
        const allSelected = allLocs.every(l => selectedLocations.includes(l));
        if (allSelected) {
            setSelectedLocations([]);
        } else {
            setSelectedLocations(allLocs);
        }
    };

    const getFilteredMaterials = () => {
        if (selectedLocations.length === 0) return materials;
        return materials.filter(m => selectedLocations.includes(m.location));
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        const data = getFilteredMaterials();

        doc.setFontSize(18);
        doc.text("Materialen Lijst", 14, 22);
        doc.setFontSize(11);
        doc.text(`Gegenereerd op: ${new Date().toLocaleDateString('nl-NL')}`, 14, 30);

        const tableData = data.map(m => [
            m.name,
            m.location,
            m.quantityTotal.toString(),
            m.quantityUsable.toString(),
            m.quantityBroken.toString(),
            m.quantityToOrder.toString(),
            m.conditionStatus
        ]);

        autoTable(doc, {
            head: [['Naam', 'Locatie', 'Totaal', 'Bruikbaar', 'Kapot', 'Bestellen', 'Conditie']],
            body: tableData,
            startY: 40,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [66, 133, 244] }
        });

        doc.save('materialen-export.pdf');
    };

    const exportExcel = () => {
        const data = getFilteredMaterials().map(m => ({
            Naam: m.name,
            Categorie: m.category,
            Locatie: m.location,
            Totaal: m.quantityTotal,
            Bruikbaar: m.quantityUsable,
            Kapot: m.quantityBroken,
            Bestellen: m.quantityToOrder,
            Conditie: m.conditionStatus
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Materialen");
        XLSX.writeFile(wb, "materialen-export.xlsx");
    };

    const exportDOCX = async () => {
        const data = getFilteredMaterials();

        const tableRows = [
            new TableRow({
                children: ["Naam", "Locatie", "Totaal", "Bruikbaar", "Kapot", "Bestellen", "Conditie"].map(text =>
                    new TableCell({
                        children: [new Paragraph({ text, style: "strong" })],
                        width: { size: 100 / 7, type: WidthType.PERCENTAGE },
                        shading: { fill: "E0E0E0" }
                    })
                )
            }),
            ...data.map(m =>
                new TableRow({
                    children: [
                        m.name,
                        m.location,
                        m.quantityTotal.toString(),
                        m.quantityUsable.toString(),
                        m.quantityBroken.toString(),
                        m.quantityToOrder.toString(),
                        m.conditionStatus
                    ].map(text =>
                        new TableCell({
                            children: [new Paragraph(text)]
                        })
                    )
                })
            )
        ];

        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        text: "Materialen Lijst",
                        heading: HeadingLevel.HEADING_1,
                    }),
                    new Paragraph({
                        text: `Gegenereerd op: ${new Date().toLocaleDateString('nl-NL')}`,
                        spacing: { after: 200 }
                    }),
                    new Table({
                        rows: tableRows,
                        width: { size: 100, type: WidthType.PERCENTAGE }
                    })
                ]
            }]
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, "materialen-export.docx");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Exporteer Materialen</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-700 mb-3 flex justify-between items-center">
                            Selecteer Locaties
                            <button onClick={toggleAll} className="text-sm text-blue-600 hover:underline">
                                {getAllLocations().every(l => selectedLocations.includes(l)) ? "Deselecteer Alles" : "Selecteer Alles"}
                            </button>
                        </h3>
                        <div className="border border-gray-200 rounded-xl p-4 space-y-2">
                            {/* Root */}
                            <div>
                                <button
                                    onClick={() => toggleFolder("Middelen")}
                                    className="flex items-center gap-2 font-medium text-gray-800 hover:text-blue-600"
                                >
                                    {expandedFolders["Middelen"] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                    Middelen
                                </button>
                                {expandedFolders["Middelen"] && (
                                    <div className="ml-6 mt-2 space-y-3">
                                        {Object.entries(FOLDER_STRUCTURE["Middelen"]).map(([category, locations]) => (
                                            <div key={category}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <button onClick={() => toggleFolder(category)}>
                                                        {expandedFolders[category] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                                    </button>
                                                    <button
                                                        onClick={() => toggleCategory(category, locations)}
                                                        className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600"
                                                    >
                                                        {locations.every(l => selectedLocations.includes(l)) ? (
                                                            <CheckSquare size={16} className="text-blue-600" />
                                                        ) : (
                                                            <Square size={16} className="text-gray-400" />
                                                        )}
                                                        {category}
                                                    </button>
                                                </div>
                                                {expandedFolders[category] && (
                                                    <div className="ml-6 space-y-1">
                                                        {locations.map(loc => (
                                                            <button
                                                                key={loc}
                                                                onClick={() => toggleLocation(loc)}
                                                                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 w-full py-1"
                                                            >
                                                                {selectedLocations.includes(loc) ? (
                                                                    <CheckSquare size={14} className="text-blue-600" />
                                                                ) : (
                                                                    <Square size={14} className="text-gray-300" />
                                                                )}
                                                                {loc}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <button
                            onClick={exportPDF}
                            className="flex flex-col items-center justify-center p-4 border-2 border-red-100 bg-red-50 rounded-xl hover:bg-red-100 hover:border-red-200 transition-all group"
                        >
                            <FileText size={32} className="text-red-500 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="font-semibold text-red-700">PDF</span>
                            <span className="text-xs text-red-500 mt-1">Printvriendelijk</span>
                        </button>
                        <button
                            onClick={exportExcel}
                            className="flex flex-col items-center justify-center p-4 border-2 border-green-100 bg-green-50 rounded-xl hover:bg-green-100 hover:border-green-200 transition-all group"
                        >
                            <FileSpreadsheet size={32} className="text-green-500 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="font-semibold text-green-700">Excel</span>
                            <span className="text-xs text-green-500 mt-1">Bewerkbaar</span>
                        </button>
                        <button
                            onClick={exportDOCX}
                            className="flex flex-col items-center justify-center p-4 border-2 border-blue-100 bg-blue-50 rounded-xl hover:bg-blue-100 hover:border-blue-200 transition-all group"
                        >
                            <FileIcon size={32} className="text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="font-semibold text-blue-700">Word</span>
                            <span className="text-xs text-blue-500 mt-1">Document</span>
                        </button>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                        {getFilteredMaterials().length} items geselecteerd
                    </span>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium shadow-sm"
                    >
                        Sluiten
                    </button>
                </div>
            </div>
        </div>
    );
}
