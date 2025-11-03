import React from 'react';
import { CheckCircle, XCircle, FileWarning, Image } from 'lucide-react';

interface Props {
    title: string;
    stats: any;
}

const StatCard = ({ icon, label, value, colorClass = "text-gray-600 dark:text-gray-300" }) => (
    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg flex items-center gap-4">
        <div className={`p-2 rounded-full bg-gray-200 dark:bg-gray-600 ${colorClass}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </div>
);

export const StatsDisplay: React.FC<Props> = ({ title, stats }) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4">{title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard icon={<Image size={24} />} label="Images Processed" value={stats.images_processed || 0} />
                <StatCard icon={<CheckCircle size={24} />} label="Valid Images Saved" value={stats.valid_images_saved || 0} colorClass="text-green-500" />
                <StatCard icon={<XCircle size={24} />} label="Corrupted Removed" value={stats.corrupted_removed || 0} colorClass="text-red-500" />
                <StatCard icon={<FileWarning size={24} />} label="Unlabeled Found" value={stats.unlabeled_images_found || 0} colorClass="text-yellow-500" />
                <StatCard icon={<XCircle size={24} />} label="Invalid Labels Removed" value={stats.invalid_labels_removed || 0} colorClass="text-orange-500" />
            </div>
        </div>
    );
};