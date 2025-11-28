'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Uploader } from '@/components/upload/Uploader';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

export interface EvidenceData {
    descripcion: string;
    uploadedImageUrls: string[];
    scammerPhone: string;
    scammerPagoMovil: string;
    scammerBankAccount: string;
}

interface EvidenceFormProps {
    onChange: (data: Partial<EvidenceData>) => void;
    onValidationChange: (isValid: boolean) => void;
    initialData: Partial<EvidenceData>;
}

const EvidenceForm = ({ onChange, onValidationChange, initialData }: EvidenceFormProps) => {
    const [formData, setFormData] = useState<EvidenceData>(() => ({
        descripcion: initialData.descripcion || '',
        scammerPhone: initialData.scammerPhone || '',
        scammerPagoMovil: initialData.scammerPagoMovil || '',
        scammerBankAccount: initialData.scammerBankAccount || '',
        uploadedImageUrls: initialData.uploadedImageUrls || [],
    }));
    
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = useCallback(() => {
        const newErrors: Record<string, string> = {};
        if (!formData.descripcion.trim()) {
            newErrors.descripcion = 'La descripción de la estafa es obligatoria.';
        }
        if (formData.uploadedImageUrls.length === 0) {
            newErrors.images = 'Debes subir al menos una imagen como evidencia.';
        }
        return newErrors;
    }, [formData.descripcion, formData.uploadedImageUrls]);

    useEffect(() => {
        onChange(formData);
        const validationErrors = validate();
        setErrors(validationErrors);
        onValidationChange(Object.keys(validationErrors).length === 0);
    }, [formData, onChange, onValidationChange, validate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUploadComplete = (urls: string[]) => {
        setFormData(prev => ({
            ...prev,
            uploadedImageUrls: [...prev.uploadedImageUrls, ...urls]
        }));
    };

    const handleRemoveImage = (urlToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            uploadedImageUrls: prev.uploadedImageUrls.filter(url => url !== urlToRemove)
        }));
    };

    return (
        <div className="animate-fade-in space-y-6">
            <div>
                <Label htmlFor="descripcion" className="text-base text-gray-300">Descripción de la estafa <span className="text-red-500">*</span></Label>
                <Textarea
                    id="descripcion"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    required
                    placeholder="Describe brevemente cómo ocurrió la estafa..."
                    className="mt-2 bg-gray-800 border-gray-600 text-white placeholder-gray-500 min-h-[100px]"
                />
                {errors.descripcion && <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>}
            </div>

            <div>
                <Label className="text-base text-gray-300">Evidencias (Imágenes) <span className="text-red-500">*</span></Label>
                <p className="text-sm text-gray-400 mb-2">Sube capturas de pantalla que demuestren la estafa. Se requiere al menos una imagen.</p>
                
                <div className="p-4 border border-gray-700 rounded-lg bg-gray-900/50">
                    <Uploader onUploadComplete={handleUploadComplete} />
                    
                    {formData.uploadedImageUrls.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {formData.uploadedImageUrls.map((url, index) => (
                                <div key={index} className="relative group">
                                    <img src={url} alt={`Prueba ${index + 1}`} className="w-full h-24 object-cover rounded-md border-2 border-gray-600" />
                                    <button 
                                        onClick={() => handleRemoveImage(url)}
                                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                                        aria-label="Eliminar imagen"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {errors.images && <p className="text-red-500 text-sm mt-2">{errors.images}</p>}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-yellow-400 mt-6 border-t border-gray-700 pt-6">Datos de Contacto del Estafador (Opcional)</h3>
              <p className="text-sm text-gray-400 mb-4">Proporciona cualquier dato adicional que ayude a identificar al estafador.</p>

              <div className="space-y-4 mt-4">
                  <div>
                      <Label htmlFor="scammerPhone" className="text-base text-gray-300">Número de Teléfono</Label>
                      <Input
                          id="scammerPhone"
                          name="scammerPhone"
                          value={formData.scammerPhone}
                          onChange={handleInputChange}
                          placeholder="Ej: +584121234567"
                          className="mt-2 bg-gray-800 border-gray-600 text-white placeholder-gray-500"
                      />
                  </div>

                  <div>
                      <Label htmlFor="scammerPagoMovil" className="text-base text-gray-300">Pago Móvil</Label>
                      <Input
                          id="scammerPagoMovil"
                          name="scammerPagoMovil"
                          value={formData.scammerPagoMovil}
                          onChange={handleInputChange}
                          placeholder="Ej: 04121234567-V12345678"
                          className="mt-2 bg-gray-800 border-gray-600 text-white placeholder-gray-500"
                      />
                  </div>

                  <div>
                      <Label htmlFor="scammerBankAccount" className="text-base text-gray-300">Número de Cuenta Bancaria</Label>
                      <Input
                          id="scammerBankAccount"
                          name="scammerBankAccount"
                          value={formData.scammerBankAccount}
                          onChange={handleInputChange}
                          placeholder="Ej: 01020304050607080910"
                          className="mt-2 bg-gray-800 border-gray-600 text-white placeholder-gray-500"
                      />
                  </div>
              </div>
            </div>
        </div>
    );
};

EvidenceForm.displayName = 'EvidenceForm';

export { EvidenceForm };
