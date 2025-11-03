// File: frontend/src/components/FileUpload.tsx

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, X, Folder } from 'lucide-react';

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
        setFiles(prev => [...prev, ...acceptedFiles].filter((file, index, self) => 
            index === self.findIndex(f => f.name === file.name && f.size === file.size)
        ));
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, noClick: true });

    const handleUpload = () => {
        const formData = new FormData();

        // --- THIS IS THE NEW, SMARTER LOGIC ---
        // It finds the common parent directory (e.g., "sample_dataset/") and removes it.
        let commonBasePath = '';
        if (files.length > 0) {
            const firstPath = (files[0] as any).webkitRelativePath || files[0].name;
            if (firstPath.includes('/')) {
                commonBasePath = firstPath.substring(0, firstPath.indexOf('/') + 1);
            }
        }
        
        // Check if all files share the same base path
        const allShareBasePath = files.every(file => {
            const path = (file as any).webkitRelativePath || file.name;
            return path.startsWith(commonBasePath);
        });

        if (!allShareBasePath) {
            commonBasePath = ''; // Reset if not all files are in the same parent folder
        }
        // --- END OF NEW LOGIC ---

        const filePathsForValidation: string[] = [];
        files.forEach(file => {
            let relativePath = (file as any).webkitRelativePath || file.name;

            // Strip the common base path if it exists
            if (commonBasePath && relativePath.startsWith(commonBasePath)) {
                relativePath = relativePath.substring(commonBasePath.length);
            }
            
            // Don't upload empty directory entries
            if (relativePath && file.size > 0) {
                formData.append('files', file, relativePath);
                filePathsForValidation.push(relativePath);
            } else if (relativePath && file.name === '.DS_Store') {
                // Silently ignore macOS metadata files
            } else if (!relativePath) {
                // This handles dropping a single file like classes.txt
                 formData.append('files', file, file.name);
                 filePathsForValidation.push(file.name);
            }
        });

        // Client-side check before bothering the server
        if (!filePathsForValidation.includes('classes.txt')) {
             setError('Error: A `classes.txt` file is required.');
             return;
        }

        onUpload(formData);
    };
    
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div {...getRootProps({ className: `p-8 border-2 border-dashed rounded-lg text-center ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'}` })}>
                <input {...getInputProps()} id="file-upload-input" webkitdirectory="" mozdirectory="" directory="" />
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-gray-500 dark:text-gray-400">Drag & drop your dataset folder here, or use the buttons below.</p>
                 <div className="mt-4 flex justify-center gap-4">
                    <label htmlFor="file-upload-input" className="cursor-pointer bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 inline-flex items-center gap-2">
                        <Folder size={20} /> Select Dataset Folder
                    </label>
                </div>
            </div>
            {error && <p className="text-red-500 text-sm mt-3 text-center">{error}</p>}
            {files.length > 0 && (
                <div className="mt-4">
                    <h3 className="font-semibold text-lg">Staged Files ({files.length}):</h3>
                    <div className="mt-2 max-h-48 overflow-y-auto space-y-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
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