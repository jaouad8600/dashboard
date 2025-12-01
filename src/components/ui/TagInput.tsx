'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface TagInputProps {
    label: string;
    tags: string[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function TagInput({
    label,
    tags,
    value,
    onChange,
    placeholder = '',
}: TagInputProps) {
    const [activeTags, setActiveTags] = useState<string[]>([]);

    const handleTagClick = (tag: string) => {
        if (activeTags.includes(tag)) {
            // Remove tag
            const newTags = activeTags.filter(t => t !== tag);
            setActiveTags(newTags);

            // Remove from text
            const newValue = value.replace(new RegExp(`${tag}[.;,]?\\s*`, 'g'), '').trim();
            onChange(newValue);
        } else {
            // Add tag
            setActiveTags([...activeTags, tag]);

            // Append to text
            const newValue = value ? `${value}. ${tag}` : tag;
            onChange(newValue);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">{label}</label>

            {/* Quick Tags */}
            <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => {
                    const isActive = activeTags.includes(tag);
                    return (
                        <button
                            key={tag}
                            type="button"
                            onClick={() => handleTagClick(tag)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${isActive
                                ? 'bg-green-500 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {isActive && <Plus size={14} className="rotate-45" />}
                            {tag}
                        </button>
                    );
                })}
            </div>

            {/* Text Area */}
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-base bg-white text-gray-900"
            />
        </div>
    );
}
