'use client';

import { Minus, Plus } from 'lucide-react';

interface CounterProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
}

export default function Counter({
    label,
    value,
    onChange,
    min = 0,
    max = 99,
    step = 1,
}: CounterProps) {
    const handleDecrement = () => {
        const newValue = Math.max(min, value - step);
        onChange(newValue);
    };

    const handleIncrement = () => {
        const newValue = Math.min(max, value + step);
        onChange(newValue);
    };

    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={handleDecrement}
                    disabled={value <= min}
                    className="w-12 h-12 flex items-center justify-center bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-300 rounded-lg transition-colors active:scale-95"
                >
                    <Minus size={20} />
                </button>

                <div className="flex-1 text-center">
                    <span className="text-3xl font-bold text-gray-900">{value}</span>
                </div>

                <button
                    type="button"
                    onClick={handleIncrement}
                    disabled={value >= max}
                    className="w-12 h-12 flex items-center justify-center bg-blue-500 hover:bg-blue-600 disabled:bg-gray-50 disabled:text-gray-300 text-white rounded-lg transition-colors active:scale-95"
                >
                    <Plus size={20} />
                </button>
            </div>
        </div>
    );
}
