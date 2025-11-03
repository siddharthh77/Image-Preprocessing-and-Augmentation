import React, { useEffect, useState, useMemo } from 'react';
import { useDataset } from '../hooks/useDataset';
import * as api from '../api/datasetApi';
import { FileUpload } from '../components/FileUpload';
import { StatsDisplay } from '../components/StatsDisplay';
import { D3Chart } from '../components/D3Chart';
import { AugmentationSettings } from '../components/AugmentationSettings';
import { CleaningOptions } from '../components/CleaningOptions'; // <-- 1. IMPORT THE NEW COMPONENT
import { Download } from 'lucide-react';

interface CleaningParams {
  remove_unlabeled_images: boolean;
}

export default function HomePage() {
    const { job, setJob } = useDataset();
    const [isPolling, setIsPolling] = useState(false);

    // Polling effect for job status (NO CHANGE HERE)
    useEffect(() => {
        if (!job.jobId || !isPolling) return;
        const interval = setInterval(async () => {
            try {
                const { data } = await api.getStatus(job.jobId!);
                setJob(prev => ({ ...prev, ...data }));
                if (['cleaned', 'augmented', 'error'].includes(data.status)) {
                    setIsPolling(false);
                }
            } catch (error) {
                console.error("Failed to poll status:", error);
                setJob(prev => ({ ...prev, status: 'error', errorDetails: { message: 'Failed to connect to server' } }));
                setIsPolling(false);
            }
        }, 2000);
        return () => clearInterval(interval);
    }, [job.jobId, isPolling, setJob]);

    // handleUpload function (NO CHANGE HERE)
    const handleUpload = async (formData: FormData) => {
        setJob({ status: 'uploading', jobId: null, cleanStats: null, augmentReport: null, errorDetails: null });
        try {
            const data = await api.uploadDataset(formData);
            setJob(prev => ({ ...prev, status: 'uploaded', jobId: data.job_id }));
        } catch (error: any) {
            const errorMsg = error.response?.data?.detail || "Upload failed. Check file structure and try again.";
            setJob({ status: 'error', jobId: null, cleanStats: null, augmentReport: null, errorDetails: { message: errorMsg } });
        }
    };

    // <-- 2. MODIFY handleClean TO ACCEPT PARAMS
    const handleClean = async (params: CleaningParams) => {
        if (!job.jobId) return;
        setJob(prev => ({ ...prev, status: 'cleaning' }));
        setIsPolling(true);
        await api.startCleaning(job.jobId, params);
    };

    // handleAugment function (NO CHANGE HERE)
    const handleAugment = async (params: any) => {
        if (!job.jobId) return;
        setJob(prev => ({ ...prev, status: 'augmenting' }));
        setIsPolling(true);
        await api.startAugmentation(job.jobId, params);
    };
    
    // Chart data memos (NO CHANGE HERE)
    const preAugmentData = useMemo(() => {
        if (!job.augment_report?.initial_class_counts) return [];
        return Object.entries(job.augment_report.initial_class_counts).map(([name, count]) => ({ name, count: count as number }));
    }, [job.augment_report]);
    const postAugmentData = useMemo(() => {
        if (!job.augment_report?.final_class_counts) return [];
        return Object.entries(job.augment_report.final_class_counts).map(([name, count]) => ({ name, count: count as number }));
    }, [job.augment_report]);


    const renderStep = () => {
        switch (job.status) {
            case 'idle':
            case 'uploading':
                return <FileUpload onUpload={handleUpload} isLoading={job.status === 'uploading'} />;
            
            // <-- 3. REPLACE THE CONTENT OF THIS CASE
            case 'uploaded':
                return <CleaningOptions onStart={handleClean} isLoading={job.status === 'cleaning'} />;

            // (NO CHANGES TO OTHER CASES)
            case 'cleaning':
                return <p className="text-center text-lg animate-pulse">Cleaning dataset...</p>;
            case 'cleaned':
                return (
                    <div className="space-y-6">
                        {job.cleanStats && <StatsDisplay title="Cleaning Results" stats={job.cleanStats} />}
                        <AugmentationSettings onStart={handleAugment} isLoading={false} />
                        <a href={api.getDownloadLink(job.jobId!, 'cleaned')} className="inline-flex items-center gap-2 bg-gray-600 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-700">
                            <Download size={18} /> Download Cleaned Dataset
                        </a>
                    </div>
                );
            case 'augmenting':
                 return <p className="text-center text-lg animate-pulse">Augmenting dataset...</p>;
            case 'augmented':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-center text-green-500">Process Complete!</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <D3Chart title="Class Distribution (Before)" data={preAugmentData} />
                            <D3Chart title="Class Distribution (After)" data={postAugmentData} />
                        </div>
                        <div className="text-center">
                            <a href={api.getDownloadLink(job.jobId!, 'augmented')} className="inline-flex items-center gap-2 bg-green-600 text-white font-bold py-3 px-6 rounded-md hover:bg-green-700">
                                <Download size={20} /> Download Augmented Dataset
                            </a>
                        </div>
                    </div>
                );
            case 'error':
                return (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center" role="alert">
                        <strong className="font-bold">An Error Occurred!</strong>
                        <span className="block sm:inline ml-2">{job.errorDetails?.message || 'Something went wrong.'}</span>
                        <button onClick={() => setJob({status: 'idle', jobId: null, cleanStats: null, augmentReport: null, errorDetails: null})} className="mt-4 bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700">
                            Start Over
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8">
            {renderStep()}
        </div>
    );
}