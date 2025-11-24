'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';

interface ColorPickerProps {
    currentColor: string;
    groupId: string;
    groupName: string;
    onColorChange: (newColor: string) => void;
}

const COLORS = [
    { label: 'Groen', value: 'GROEN', bg: '#22c55e', meaning: 'Delegeren (Weinig sturing, weinig ondersteuning)' },
    { label: 'Geel', value: 'GEEL', bg: '#eab308', meaning: 'Steunen (Weinig sturing, veel ondersteuning)' },
    { label: 'Oranje', value: 'ORANJE', bg: '#f97316', meaning: 'Begeleiden (Veel sturing, veel ondersteuning)' },
    { label: 'Rood', value: 'ROOD', bg: '#ef4444', meaning: 'Leiden (Veel sturing, weinig ondersteuning)' },
];

export default function ColorPicker({ currentColor, groupId, groupName, onColorChange }: ColorPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleColorSelect = async (newColor: string) => {
        if (newColor === currentColor) {
            setIsOpen(false);
            return;
        }

        setSaving(true);
        try {
            const res = await fetch('/api/groups', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: groupId,
                    color: newColor,
                }),
            });

            if (res.ok) {
                onColorChange(newColor);
                setIsOpen(false);
            } else {
                alert('Kleur wijzigen mislukt');
            }
        } catch (error) {
            console.error('Error changing color', error);
            alert('Kleur wijzigen mislukt');
        } finally {
            setSaving(false);
        }
    };

    const currentColorObj = COLORS.find(c => c.value === currentColor);
    const bgColor = currentColorObj?.bg || '#6b7280';

    return (
        <div className="relative">
            {/* Color Circle - Clickable */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className="w-16 h-16 rounded-full shadow-md hover:shadow-lg transition-all hover:scale-110 border-4 border-white ring-2 ring-gray-200 hover:ring-gray-300"
                style={{ backgroundColor: bgColor }}
                title={`Klik om kleur te wijzigen (huidige: ${currentColorObj?.label})`}
                disabled={saving}
            />

            {/* Dropdown Color Picker */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Color Options */}
                    <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-3 z-50 min-w-[320px]">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                            Kies kleur voor {groupName}
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                            {COLORS.map((color) => (
                                <button
                                    key={color.value}
                                    onClick={() => handleColorSelect(color.value)}
                                    disabled={saving}
                                    className={`flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors ${currentColor === color.value ? 'bg-gray-100' : ''
                                        }`}
                                >
                                    <div
                                        className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: color.bg }}
                                    >
                                        {currentColor === color.value && (
                                            <Check size={16} className="text-white" strokeWidth={3} />
                                        )}
                                    </div>
                                    <div className="text-left">
                                        <span className="block text-sm font-medium text-gray-700">
                                            {color.label}
                                        </span>
                                        <span className="block text-xs text-gray-500">
                                            {color.meaning}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                        {saving && (
                            <p className="text-xs text-gray-500 mt-2 text-center">Opslaan...</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
