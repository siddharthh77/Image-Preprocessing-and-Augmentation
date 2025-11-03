import React, { useState } from 'react';
import { Zap } from 'lucide-react';

interface Props {
    onStart: (params: any) => void;
    isLoading: boolean;
}

const ALL_AUGMENTATIONS = ['flip', 'color', 'rotate', 'scale', 'translate', 'blur', 'cutout'];

export const AugmentationSettings: React.FC<Props> = ({ onStart, isLoading }) => {
    const [seed, setSeed] = useState(42);
    const [cap, setCap] = useState<number | null>(null);
    const [enabled, setEnabled] = useState<string[]>(ALL_AUGMENTATIONS);

    const handleToggle = (aug: string) => {
        setEnabled(prev => prev.includes(aug) ? prev.filter(a => a !== aug) : [...prev, aug]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onStart({
            random_seed: seed,
            augmentation_cap: cap,
            enabled_augmentations: enabled,
        });
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4">Augmentation Settings</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="seed" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Random Seed</label>
                        <input type="number" id="seed" value={seed} onChange={e => setSeed(parseInt(e.target.value))}
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="cap" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Max Images per Class (optional)</label>
                        <input type="number" id="cap" placeholder="No limit" onChange={e => setCap(e.target.value ? parseInt(e.target.value) : null)}
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Enabled Augmentations</label>
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {ALL_AUGMENTATIONS.map(aug => (
                            <label key={aug} className="flex items-center space-x-2 cursor-pointer">
                                <input type="checkbox" checked={enabled.includes(aug)} onChange={() => handleToggle(aug)}
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                <span className="capitalize">{aug}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <button type="submit" disabled={isLoading || enabled.length === 0} className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 px-4 rounded-md hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed">
                    <Zap size={20} />
                    {isLoading ? 'Augmenting...' : 'Start Augmentation'}
                </button>
            </form>
        </div>
    );
};