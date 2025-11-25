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
    progress: number;
}

export function Uploader() {
    const [isOpen, setIsOpen] = useState(false);
    const [files, setFiles] = useState<FileUpload[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newFiles: FileUpload[] = acceptedFiles.map(file => ({
            file,
            status: 'pending',
            progress: 0,
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

        for (const fileUpload of files) {
            if (fileUpload.status === 'success') continue; // No volver a subir

            try {
                // 1. Obtener la URL firmada desde nuestra API
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        filename: fileUpload.file.name,
                        contentType: fileUpload.file.type,
                    }),
                });

                if (!res.ok) throw new Error('Fallo al obtener la URL firmada.');

                const { url } = await res.json();

                // 2. Subir el archivo a R2 usando la URL firmada
                await fetch(url, {
                    method: 'PUT',
                    body: fileUpload.file,
                    headers: {
                        'Content-Type': fileUpload.file.type,
                    },
                });

                // Actualizar estado a éxito
                setFiles(prev => prev.map(f => f.file === fileUpload.file ? { ...f, status: 'success', progress: 100 } : f));

            } catch (error) {
                console.error('Error subiendo el archivo:', error);
                setFiles(prev => prev.map(f => f.file === fileUpload.file ? { ...f, status: 'error' } : f));
            }
        }

        setIsUploading(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                    Subir Archivos
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
                                            <FileIcon className="h-5 w-5 text-gray-400" />
                                            <span className="text-sm font-medium">{fileUpload.file.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {fileUpload.status === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                                            {fileUpload.status === 'error' && <X className="h-5 w-5 text-red-500" />}
                                            {!isUploading && (
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
                         <Button variant="outline" onClick={() => setIsOpen(false)} className="text-gray-300 border-gray-600 hover:bg-gray-700" disabled={isUploading}>
                             Cancelar
                         </Button>
                         <Button className="bg-yellow-500 hover:bg-yellow-600 text-black" onClick={handleUpload} disabled={files.length === 0 || isUploading || files.every(f => f.status === 'success')}>
                            {isUploading ? 'Subiendo...' : `Subir ${files.length > 0 ? `(${files.length})` : ''}`}
                         </Button>
                     </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
