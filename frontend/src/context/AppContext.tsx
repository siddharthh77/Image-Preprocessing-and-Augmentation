import React, { createContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

interface JobData {
    status: 'idle' | 'uploading' | 'uploaded' | 'cleaning' | 'cleaned' | 'augmenting' | 'augmented' | 'error';
    jobId: string | null;
    cleanStats: any | null;
    augmentReport: any | null;
    errorDetails: any | null;
}

interface AppContextType {
    job: JobData;
    setJob: Dispatch<SetStateAction<JobData>>;
}

const defaultState: AppContextType = {
    job: {
        status: 'idle',
        jobId: null,
        cleanStats: null,
        augmentReport: null,
        errorDetails: null,
    },
    setJob: () => {},
};

export const AppContext = createContext<AppContextType>(defaultState);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [job, setJob] = useState<JobData>(defaultState.job);

    return (
        <AppContext.Provider value={{ job, setJob }}>
            {children}
        </AppContext.Provider>
    );
};