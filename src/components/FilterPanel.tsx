import React from 'react';
import type { CardFilterState, CivMode } from '../hooks/useCardFilter';

interface FilterPanelProps {
    filters: CardFilterState;
    onChange: (filters: CardFilterState) => void; // State setter
    className?: string;
}

const CIV_OPTIONS = [
    { label: 'Light', value: '光', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    { label: 'Water', value: '水', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    { label: 'Dark', value: '闇', color: 'bg-gray-800 text-gray-100 border-gray-600' },
    { label: 'Fire', value: '火', color: 'bg-red-100 text-red-800 border-red-300' },
    { label: 'Nature', value: '自然', color: 'bg-green-100 text-green-800 border-green-300' },
    { label: 'Zero', value: 'ゼロ', color: 'bg-gray-100 text-gray-800 border-gray-300' },
];

const TYPE_OPTIONS = [
    'Creature', 'Spell', 'Twinpact', 'Evolution Creature',
    'NEO Creature', 'Tamaseed', 'Cross Gear', 'Castle', 'Field',
    'Rule Plus', 'Game Start'
];

export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onChange, className = '' }) => {

    const toggleCiv = (civ: string) => {
        // If exact mode, allow multiple selection logically.
        // If include/exclude, multiple is also fine.
        const newCivs = filters.civilizations.includes(civ)
            ? filters.civilizations.filter(c => c !== civ)
            : [...filters.civilizations, civ];

        // Create new state object
        const newFilters = { ...filters, civilizations: newCivs };
        onChange(newFilters);
    };

    const setCivMode = (mode: CivMode) => {
        onChange({ ...filters, civMode: mode });
    };

    const toggleType = (type: string) => {
        const newTypes = filters.cardTypes.includes(type)
            ? filters.cardTypes.filter(t => t !== type)
            : [...filters.cardTypes, type];
        onChange({ ...filters, cardTypes: newTypes });
    };

    const handleRangeChange = (key: 'costMin' | 'costMax' | 'powerMin' | 'powerMax', val: string) => {
        onChange({ ...filters, [key]: val });
    };

    const resetFilters = () => {
        onChange({
            searchQuery: '', // Reset text too
            civilizations: [],
            civMode: 'include',
            cardTypes: [],
            costMin: '',
            costMax: '',
            powerMin: '',
            powerMax: ''
        });
    };

    return (
        <div className={`bg-white p-4 rounded shadow-sm border border-gray-200 ${className}`}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-700">Detailed Filter</h3>
                <button onClick={resetFilters} className="text-xs text-blue-500 hover:underline">
                    Reset All
                </button>
            </div>

            {/* --- Civilization --- */}
            <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-semibold text-gray-500">Civilization</label>
                    <div className="flex bg-gray-100 rounded p-0.5">
                        {(['include', 'exact', 'exclude'] as CivMode[]).map(mode => (
                            <button
                                key={mode}
                                onClick={() => setCivMode(mode)}
                                className={`px-2 py-0.5 text-[10px] rounded capitalize ${filters.civMode === mode
                                        ? 'bg-white shadow text-blue-600 font-bold'
                                        : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {CIV_OPTIONS.map((civ) => (
                        <button
                            key={civ.value}
                            onClick={() => toggleCiv(civ.value)}
                            className={`px-2 py-1 text-xs rounded border transition-opacity ${filters.civilizations.includes(civ.value)
                                    ? `ring-2 ring-offset-1 ring-blue-400 font-bold opacity-100 ${civ.color}`
                                    : 'bg-gray-50 text-gray-500 border-gray-200 opacity-60 hover:opacity-100'
                                }`}
                        >
                            {civ.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- Card Types --- */}
            <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 mb-2">Card Type</label>
                <div className="flex flex-wrap gap-1.5">
                    {TYPE_OPTIONS.map((type) => (
                        <button
                            key={type}
                            onClick={() => toggleType(type)}
                            className={`px-2 py-1 text-[10px] rounded border ${filters.cardTypes.includes(type)
                                    ? 'bg-blue-100 text-blue-800 border-blue-300 font-bold'
                                    : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- Ranges (Cost & Power) --- */}
            <div className="grid grid-cols-2 gap-4 mb-2">
                {/* Cost */}
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Cost</label>
                    <div className="flex items-center gap-1">
                        <input
                            type="number"
                            placeholder="Min"
                            value={filters.costMin}
                            onChange={(e) => handleRangeChange('costMin', e.target.value)}
                            className="w-full p-1 text-xs border border-gray-300 rounded"
                        />
                        <span className="text-gray-300 text-xs">~</span>
                        <input
                            type="number"
                            placeholder="Max"
                            value={filters.costMax}
                            onChange={(e) => handleRangeChange('costMax', e.target.value)}
                            className="w-full p-1 text-xs border border-gray-300 rounded"
                        />
                    </div>
                </div>

                {/* Power */}
                <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Power</label>
                    <div className="flex items-center gap-1">
                        <input
                            type="number"
                            placeholder="Min"
                            step="500"
                            value={filters.powerMin}
                            onChange={(e) => handleRangeChange('powerMin', e.target.value)}
                            className="w-full p-1 text-xs border border-gray-300 rounded"
                        />
                        <span className="text-gray-300 text-xs">~</span>
                        <input
                            type="number"
                            placeholder="Max"
                            step="500"
                            value={filters.powerMax}
                            onChange={(e) => handleRangeChange('powerMax', e.target.value)}
                            className="w-full p-1 text-xs border border-gray-300 rounded"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
