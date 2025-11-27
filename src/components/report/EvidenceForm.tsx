'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export interface EvidenceData {
    descripcion: string;
    evidenceLinks: string;
    scammerPhone: string;
    scammerPagoMovil: string;
    scammerBankAccount: string;
}

interface EvidenceFormProps {
    onChange: (data: EvidenceData) => void;
    onValidationChange: (isValid: boolean) => void;
}

const EvidenceForm = ({ onChange, onValidationChange }: EvidenceFormProps) => {
    const [formData, setFormData] = useState<EvidenceData>({
        descripcion: '',
        evidenceLinks: '',
        scammerPhone: '',
        scammerPagoMovil: '',
        scammerBankAccount: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = useCallback(() => {
        const newErrors: Record<string, string> = {};
        if (!formData.descripcion.trim()) {
            newErrors.descripcion = 'La descripción de la estafa es obligatoria.';
        }
        if (formData.evidenceLinks.trim() && !/^(https?:\/\/[^\s,]+(\s*,\s*https?:\/\/[^\s,]+)*)?$/.test(formData.evidenceLinks.trim())) {
            newErrors.evidenceLinks = 'Los enlaces de evidencia deben ser URLs válidas separadas por comas.';
        }
        return newErrors;
    }, [formData]);

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
                <Label htmlFor="evidenceLinks" className="text-base text-gray-300">Enlaces de evidencia (opcional)</Label>
                <Input
                    id="evidenceLinks"
                    name="evidenceLinks"
                    value={formData.evidenceLinks}
                    onChange={handleInputChange}
                    placeholder="URLs separadas por comas (ej: imgur.com/a1, drive.google.com/b2)"
                    className="mt-2 bg-gray-800 border-gray-600 text-white placeholder-gray-500"
                />
                {errors.evidenceLinks && <p className="text-red-500 text-sm mt-1">{errors.evidenceLinks}</p>}
            </div>

            <h3 className="text-lg font-semibold text-yellow-400 mt-8">Datos de Contacto del Estafador (Opcional)</h3>
            <p className="text-sm text-gray-400 mb-4">Proporciona cualquier dato adicional para identificar al estafador.</p>

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
    );
};

EvidenceForm.displayName = 'EvidenceForm';

export { EvidenceForm };
