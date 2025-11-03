import React, { useState } from 'react';
import { PlayCircle } from 'lucide-react';

interface CleaningParams {
  remove_unlabeled_images: boolean;
}

interface Props {
    onStart: (params: CleaningParams) => void;
    isLoading: boolean;
}

export const CleaningOptions: React.FC<Props> = ({ onStart, isLoading }) => {
    const [removeUnlabeled, setRemoveUnlabeled] = useState(false);

    const handleStart = () => {
        onStart({ remove_unlabeled_images: removeUnlabeled });
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4">Cleaning Options</h2>
            <div className="space-y-4">
                <div className="relative flex items-start">
                    <div className="flex h-6 items-center">
                        <input
                            id="remove-unlabeled"
                            name="remove-unlabeled"
                            type="checkbox"
                            checked={removeUnlabeled}
                            onChange={(e) => setRemoveUnlabeled(e.target.checked)}
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                    </div>
                    <div className="ml-3 text-sm leading-6">
                        <label htmlFor="remove-unlabeled" className="font-medium text-gray-900 dark:text-gray-100">
                            Delete Unlabeled Images
                        </label>
                        <p className="text-gray-500 dark:text-gray-400">
                            If checked, images with no valid labels will be permanently deleted.
                            By default, they are saved to a 'no_label' folder.
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleStart}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                >
                    <PlayCircle size={20} />
                    {isLoading ? 'Cleaning...' : 'Start Cleaning'}
                </button>
            </div>
        </div>
    );
};