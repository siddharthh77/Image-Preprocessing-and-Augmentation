import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

export const useDataset = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useDataset must be used within an AppProvider');
    }
    return context;
};