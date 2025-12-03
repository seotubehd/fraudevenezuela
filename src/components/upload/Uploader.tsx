'use client';

import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File as FileIcon, X, CheckCircle } from 'lucide-react';

// Interfaz para el estado de cada archivo
interface FileUpload {
    file: File;
    status: 'pending' | 'uploading' | 'success' | 'error';
}

interface UploaderProps {
    onUploadComplete?: (urls: string[]) => void;
}

export function Uploader({ onUploadComplete }: UploaderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [files, setFiles] = useState<FileUpload[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newFiles: FileUpload[] = acceptedFiles.map(file => ({
            file,
            status: 'pending',
        }));
        setFiles(prevFiles => [...prevFiles, ...newFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, disabled: isUploading });

    const removeFile = (fileToRemove: File) => {
        setFiles(prevFiles => prevFiles.filter(f => f.file !== fileToRemove));
    };

    const handleUpload = async () => {
        if (files.length === 0) return;
        setIsUploading(true);
        const successfulUrls: string[] = [];

        const uploadPromises = files.map(async (fileUpload) => {
            if (fileUpload.status === 'success' || fileUpload.status === 'uploading') return;

            try {
                setFiles(prev => prev.map(f => f.file === fileUpload.file ? { ...f, status: 'uploading' } : f));

                const apiUrl = '/api/upload'; // Correct: Use relative path for the API call
                const res = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        filename: fileUpload.file.name,
                        contentType: fileUpload.file.type,
                    }),
                });

                if (!res.ok) {
                    throw new Error(`Error al obtener la URL: ${res.statusText}`);
                }
                const { url: presignedUrl } = await res.json();

                const uploadRes = await fetch(presignedUrl, {
                    method: 'PUT',
                    body: fileUpload.file,
                    headers: {
                        'Content-Type': fileUpload.file.type,
                    },
                });

                if (!uploadRes.ok) {
                    throw new Error(`Error al subir a R2: ${uploadRes.statusText}`);
                }
                
                // Correct: Construct the public URL using the environment variable for display
                const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${fileUpload.file.name}`;
                successfulUrls.push(publicUrl);
                
                setFiles(prev => prev.map(f => f.file === fileUpload.file ? { ...f, status: 'success' } : f));

            } catch (error) {
                console.error('Error en la subida:', error);
                setFiles(prev => prev.map(f => f.file === fileUpload.file ? { ...f, status: 'error' } : f));
            }
        });

        await Promise.all(uploadPromises);

        setIsUploading(false);
        if (onUploadComplete && successfulUrls.length > 0) {
            onUploadComplete(successfulUrls);
        }
    };
    
    const handleDone = () => {
        setFiles([]);
        setIsOpen(false);
    };


    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                    Subir Evidencia
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1a2332] text-white border-gray-700">
                <DialogHeader>
                    <DialogTitle className="text-yellow-400">Subir Evidencia</DialogTitle>
                </DialogHeader>
                <div className="p-4 space-y-4">
                    <div
                        {...getRootProps()}
                        className={`p-10 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragActive ? 'border-yellow-500 bg-gray-800/50' : 'border-gray-600'} ${isUploading ? 'cursor-not-allowed bg-gray-800/50' : 'hover:border-yellow-500 hover:bg-gray-800/50'}`}>
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                            <UploadCloud className="h-10 w-10" />
                            <p>{isDragActive ? 'Suelta los archivos aquí...' : 'Arrastra archivos o haz clic para seleccionar'}</p>
                        </div>
                    </div>

                    {files.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="font-semibold">Archivos para subir:</h3>
                            <ul className="space-y-2">
                                {files.map((fileUpload, i) => (
                                    <li key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-800">
                                        <div className="flex items-center gap-2">
                                            {fileUpload.status === 'success' ? (
                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                            ) : fileUpload.status === 'error' ? (
                                                <X className="h-5 w-5 text-red-500" />
                                            ) : fileUpload.status === 'uploading' ? (
                                                <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-yellow-400"></div>
                                            ) : (
                                                <FileIcon className="h-5 w-5 text-gray-400" />
                                            )}
                                            <span className="text-sm font-medium">{fileUpload.file.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {fileUpload.status === 'success' && <span className='text-xs text-green-400'>Completo</span>}
                                            {fileUpload.status === 'error' && <span className='text-xs text-red-400'>Error</span>}
                                            {fileUpload.status === 'uploading' && <span className='text-xs text-blue-400'>Subiendo...</span>}
                                            {!isUploading && fileUpload.status !== 'success' && (
                                                <Button variant="ghost" size="icon" onClick={() => removeFile(fileUpload.file)} className="text-gray-400 hover:text-red-500">
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="flex justify-end gap-2">
                        {files.every(f => f.status === 'success' || f.status === 'error') && files.length > 0 ? (
                            <Button onClick={handleDone} className="bg-green-600 hover:bg-green-700 text-white">
                                Hecho
                            </Button>
                        ) : (
                            <>
                                <Button variant="outline" onClick={() => setIsOpen(false)} className="text-gray-300 border-gray-600 hover:bg-gray-700" disabled={isUploading}>
                                    Cancelar
                                </Button>
                                <Button className="bg-yellow-500 hover:bg-yellow-600 text-black" onClick={handleUpload} disabled={files.length === 0 || isUploading || files.every(f => f.status === 'success')}>
                                    {isUploading ? 'Subiendo...' : `Subir ${files.length > 0 ? `(${files.filter(f => f.status === 'pending').length})` : ''}`}
                                </Button>
                            </>
                        )}
                     </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
