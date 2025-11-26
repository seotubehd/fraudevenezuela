'use client';
import { useState, forwardRef, useImperativeHandle } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertCircle, FileText, Link, Phone, Landmark, PiggyBank } from 'lucide-react';

export interface EvidenceData {
    description: string;
    evidenceLinks: string;
    scammerPhone: string;
    scammerPagoMovil: string;
    scammerBankAccount: string;
}

interface EvidenceFormProps {
    onChange: (data: EvidenceData) => void;
}

export interface EvidenceFormHandle {
    validate: () => boolean;
}

const EvidenceForm = forwardRef<EvidenceFormHandle, EvidenceFormProps>(({ onChange }, ref) => {
    const [formData, setFormData] = useState<EvidenceData>({
        description: '',
        evidenceLinks: '',
        scammerPhone: '',
        scammerPagoMovil: '',
        scammerBankAccount: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const newData = { ...formData, [name]: value };
        setFormData(newData);
        onChange(newData);
        
        if (errors[name]) {
            const newErrors = { ...errors };
            delete newErrors[name];
            setErrors(newErrors);
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.description.trim()) {
            newErrors.description = 'La descripción no puede estar vacía.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    useImperativeHandle(ref, () => ({ validate }));

    const inputStyles = "bg-gray-900/70 border-gray-700 focus-visible:ring-yellow-500 focus-visible:ring-offset-gray-900";
    const itemStyles = "border border-gray-700/80 rounded-xl bg-gray-800/40 overflow-hidden transition-all";

    return (
        <div className="w-full space-y-4 animate-fade-in">
            <Accordion type="single" collapsible defaultValue="item-1" className="w-full space-y-3">
                <AccordionItem value="item-1" className={itemStyles}>
                    <AccordionTrigger className="text-lg font-semibold text-yellow-400 px-6 py-4 hover:no-underline hover:bg-gray-700/20 data-[state=open]:bg-gray-700/30">
                        <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5" />
                            Descripción Detallada
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 pt-2 bg-black/20">
                        <div className="grid gap-2">
                            <Label htmlFor="description" className="sr-only">Descripción</Label>
                            <Textarea
                                required
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe con el mayor detalle posible cómo ocurrió la estafa. Incluye fechas, montos, modus operandi, etc."
                                rows={6}
                                className={inputStyles}
                            />
                            {errors.description && (
                                <div className="flex items-center gap-2 text-red-400 text-sm mt-2">
                                    <AlertCircle size={16} />
                                    <span>{errors.description}</span>
                                </div>
                            )}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className={itemStyles}>
                     <AccordionTrigger className="text-lg font-semibold text-yellow-400 px-6 py-4 hover:no-underline hover:bg-gray-700/20 data-[state=open]:bg-gray-700/30">
                        <div className="flex items-center gap-3">
                            <Link className="h-5 w-5" />
                            Pruebas Adicionales
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 pt-2 bg-black/20">
                        <div className="grid gap-3">
                            <div>
                                <Label htmlFor="evidenceLinks" className="text-gray-300 mb-2 block">Enlaces de Evidencia (Capturas, etc.)</Label>
                                <Input id="evidenceLinks" name="evidenceLinks" value={formData.evidenceLinks} onChange={handleChange} placeholder="Pega aquí los enlaces (Imgur, Google Drive, etc.)" className={inputStyles} />
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className={itemStyles}>
                     <AccordionTrigger className="text-lg font-semibold text-yellow-400 px-6 py-4 hover:no-underline hover:bg-gray-700/20 data-[state=open]:bg-gray-700/30">
                        <div className="flex items-center gap-3">
                            <PiggyBank className="h-5 w-5" />
                            Información de Pago del Estafador
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 pt-2 bg-black/20">
                        <div className="grid gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="scammerPhone" className="flex items-center gap-2 text-gray-300 mb-2"><Phone size={16}/>Teléfono</Label>
                                    <Input id="scammerPhone" name="scammerPhone" value={formData.scammerPhone} onChange={handleChange} placeholder="Número de teléfono" className={inputStyles} />
                                </div>
                                <div>
                                    <Label htmlFor="scammerPagoMovil" className="flex items-center gap-2 text-gray-300 mb-2"><PiggyBank size={16}/>Pago Móvil</Label>
                                    <Input id="scammerPagoMovil" name="scammerPagoMovil" value={formData.scammerPagoMovil} onChange={handleChange} placeholder="Datos de pago móvil" className={inputStyles} />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="scammerBankAccount" className="flex items-center gap-2 text-gray-300 mb-2"><Landmark size={16}/>Cuenta Bancaria</Label>
                                <Input id="scammerBankAccount" name="scammerBankAccount" value={formData.scammerBankAccount} onChange={handleChange} placeholder="Número de cuenta bancaria" className={inputStyles} />
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
});

EvidenceForm.displayName = "EvidenceForm";

export { EvidenceForm };
