import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Props {
    title: string;
    data: { name: string; count: number }[];
}

export const D3Chart: React.FC<Props> = ({ title, data }) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 h-96">
            <h2 className="text-xl font-bold mb-4">{title}</h2>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff' }} />
                    <Legend />
                    <Bar dataKey="count" fill="#4f46e5" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};