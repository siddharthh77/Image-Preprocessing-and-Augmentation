import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, X, Folder } from 'lucide-react';

interface Props {
    onUpload: (formData: FormData) => void;
    isLoading: boolean;
}

export const FileUpload: React.FC<Props> = ({ onUpload, isLoading }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setError(null);
        if (acceptedFiles.length === 0) return;
        setFiles(prev => [...prev, ...acceptedFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, noClick: true });

    const handleUpload = () => {
        // --- THIS IS THE CRITICAL DIAGNOSTIC STEP ---
        console.log("--- STARTING UPLOAD PROCESS (NEW CODE IS RUNNING!) ---");

        const formData = new FormData();
        let commonBasePath = '';
        if (files.length > 0) {
            const firstPath = (files[0] as any).webkitRelativePath || files[0].name;
            if (firstPath.includes('/')) {
                commonBasePath = firstPath.substring(0, firstPath.indexOf('/') + 1);
            }
        }
        
        const allShareBasePath = files.every(file => ((file as any).webkitRelativePath || file.name).startsWith(commonBasePath));
        if (!allShareBasePath) commonBasePath = '';

        const filePathsForValidation: string[] = [];
        files.forEach(file => {
            let relativePath = (file as any).webkitRelativePath || file.name;

            if (commonBasePath && relativePath.startsWith(commonBasePath)) {
                relativePath = relativePath.substring(commonBasePath.length);
            }
            
            // --- THIS WILL SHOW US THE EXACT PATH BEING SENT ---
            console.log("Sending file with path:", relativePath);

            if (relativePath && file.size > 0 && !file.name.startsWith('.DS_Store')) {
                formData.append('files', file, relativePath);
                filePathsForValidation.push(relativePath);
            } else if (!relativePath && file.name) {
                 formData.append('files', file, file.name);
                 filePathsForValidation.push(file.name);
            }
        });

        if (!filePathsForValidation.includes('classes.txt')) {
             setError('Error: A `classes.txt` file is required in your selection.');
             return;
        }
        onUpload(formData);
    };
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div {...getRootProps({ className: `p-8 border-2 border-dashed rounded-lg text-center ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}` })}>
                <input {...getInputProps()} id="file-upload-input" webkitdirectory="" mozdirectory="" directory="" />
                <p className="mt-2 text-gray-500">Drag & drop your dataset folder here, or use the buttons below.</p>
                <div className="mt-4 flex justify-center gap-4">
                    <label htmlFor="file-upload-input" className="cursor-pointer bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 inline-flex items-center gap-2">
                        <Folder size={20} /> Select Folders
                    </label>
                </div>
            </div>
            {error && <p className="text-red-500 text-sm mt-3 text-center">{error}</p>}
            {files.length > 0 && (
                <div className="mt-4">
                    <h3 className="font-semibold text-lg">Staged Files ({files.length}):</h3>
                    <div className="mt-2 max-h-48 overflow-y-auto space-y-2 p-2 bg-gray-50 rounded-md">
                        {files.map(file => (
                            <div key={(file as any).webkitRelativePath || file.name} className="text-sm flex items-center justify-between">
                                <span className="truncate">{(file as any).webkitRelativePath || file.name}</span>
                                <button onClick={() => setFiles(files.filter(f => f !== file))} className="text-red-500 hover:text-red-700 p-1"><X size={16} /></button>
                            </div>
                        ))}
                    </div>
                    <button onClick={handleUpload} disabled={isLoading} className="mt-4 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed">
                        {isLoading ? 'Uploading...' : 'Upload & Process'}
                    </button>
                </div>
            )}
        </div>
    );
};