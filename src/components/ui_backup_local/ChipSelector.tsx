'use client';

import { useState } from 'react';

interface ChipSelectorProps {
    label: string;
    options: string[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function ChipSelector({
    label,
    options,
    value,
    onChange,
    placeholder = '',
}: ChipSelectorProps) {
    const [isCustom, setIsCustom] = useState(false);

    const handleChipClick = (option: string) => {
        onChange(option);
        setIsCustom(false);
    };

    const handleCustomInput = () => {
        setIsCustom(true);
    };

    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">{label}</label>

            {/* Quick Select Chips */}
            <div className="flex flex-wrap gap-2 mb-2">
                {options.map((option) => (
                    <button
                        key={option}
                        type="button"
                        onClick={() => handleChipClick(option)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${value === option && !isCustom
                                ? 'bg-blue-500 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {option}
                    </button>
                ))}

                <button
                    type="button"
                    onClick={handleCustomInput}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isCustom
                            ? 'bg-purple-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Anders...
                </button>
            </div>

            {/* Custom/Selected Input */}
            <textarea
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                    if (e.target.value && !options.includes(e.target.value)) {
                        setIsCustom(true);
                    }
                }}
                placeholder={placeholder}
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-base bg-white text-gray-900"
            />
        </div>
    );
}
