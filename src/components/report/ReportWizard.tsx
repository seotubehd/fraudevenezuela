'use client';
import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Check, Shield, FileText, Send, Users, Fingerprint, ShoppingCart, HelpCircle, XCircle, CheckCircle } from 'lucide-react';
import { SocialNetworkModal } from './SocialNetworkModal';
import { EvidenceForm, EvidenceData, EvidenceFormHandle } from './EvidenceForm';
import { db } from '@/lib/firebase'; 
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// No se necesita importar Report aquí porque estamos construyendo el objeto, no tipando una variable

interface ReportWizardProps {
    personName: string;
    personId: string;
}

const steps = [
    { title: 'Datos del Estafador', description: 'Perfil o sitio web', icon: <Shield size={20} /> },
    { title: 'Tipo de Estafa', description: 'Seleccione la modalidad', icon: <FileText size={20} /> },
    { title: 'Evidencia', description: 'Detalles y pruebas', icon: <Check size={20} /> },
    { title: 'Revisión y Envío', description: 'Confirmar reporte', icon: <Send size={20} /> },
];

const StepProgress = ({ currentStep }: { currentStep: number }) => (
    <div className="flex justify-between items-start mb-8">
        {steps.map((step, index) => (
            <div key={index} className="flex-1 text-center relative">
                <div className={`relative z-10 mx-auto h-12 w-12 rounded-full flex items-center justify-center border-2 ${currentStep >= index ? 'bg-yellow-500 border-yellow-400 text-black' : 'bg-gray-700 border-gray-600 text-gray-400'} transition-all duration-500`}>
                    {step.icon}
                </div>
                <p className={`text-xs mt-2 font-semibold ${currentStep >= index ? 'text-white' : 'text-gray-500'}`}>{step.title}</p>
                {index < steps.length - 1 && (
                    <div className="absolute top-6 left-1/2 w-full h-0.5 bg-gray-600 z-0">
                        <div className="h-full bg-yellow-500 transition-all duration-500" style={{ width: currentStep > index ? '100%' : (currentStep === index ? '50%' : '0%') }}></div>
                    </div>
                )}
            </div>
        ))}
    </div>
);

export function ReportWizard({ personName, personId }: ReportWizardProps) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [reportId, setReportId] = useState<string | null>(null);
    const [scammerProfile, setScammerProfile] = useState<{ socialNetwork: string, profileUrl: string } | null>(null);
    const [scamType, setScamType] = useState<string>('social_media');
    const [evidenceData, setEvidenceData] = useState<EvidenceData | null>(null);
    const evidenceFormRef = useRef<EvidenceFormHandle>(null);

    const nextStep = () => {
        if (step === 2 && evidenceFormRef.current) {
            if (evidenceFormRef.current.validate()) {
                setStep(s => s + 1);
            } 
        } else {
            setStep(s => s + 1);
        }
    };
    const prevStep = () => setStep((prev) => (prev > 0 ? prev - 1 : prev));

    const resetForm = () => {
        setStep(0);
        setSubmissionStatus('idle');
        setError(null);
        setReportId(null);
        setScammerProfile(null);
        setEvidenceData(null);
        setScamType('social_media');
    };

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) {
            resetForm();
        }
        setOpen(isOpen);
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;

        try {
            // FIX: Align with the global Report type from types/report.ts
            const evidenceUrls = evidenceData?.evidenceLinks.split(/[ ,\n]+/).filter(Boolean) || [];

            const reportData = {
                nombreCompleto: personName,
                cedula: personId,
                socialNetwork: scammerProfile?.socialNetwork || 'No especificada',
                profileUrl: scammerProfile?.profileUrl || 'No especificada',
                scamType: scamType,
                // FIX: Use `descripcion` from the aligned EvidenceData
                descripcion: evidenceData?.descripcion || '',
                scammerBankAccount: evidenceData?.scammerBankAccount || '',
                scammerPagoMovil: evidenceData?.scammerPagoMovil || '',
                scammerPhone: evidenceData?.scammerPhone || '',
                
                // FIX: Use `evidencias` (plural) as defined in the master type
                evidencias: evidenceUrls, 
                contactEmail: email || 'No proporcionado',
                createdAt: serverTimestamp(),
                status: 'pending',
            };

            const docRef = await addDoc(collection(db, 'reports'), reportData);
            console.log("Report submitted with ID: ", docRef.id);

            setReportId(docRef.id);
            setSubmissionStatus('success');
        } catch (err) {
            console.error("Error adding document: ", err);
            setError('Ocurrió un error al guardar el reporte. Por favor, inténtalo de nuevo.');
            setSubmissionStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-black font-bold animate-pulse">
                    Reportar Estafa
                </Button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-2xl bg-[#1a2332] text-white border-gray-700 p-4 sm:p-6 md:p-8 sm:rounded-lg h-screen sm:h-auto sm:max-h-[90vh] overflow-y-auto">
                 {submissionStatus === 'idle' && (
                    <>
                        <DialogHeader className="text-center mb-4 sm:mb-6">
                            <DialogTitle className="text-2xl sm:text-3xl font-bold text-yellow-400">Reportar a {personName}</DialogTitle>
                            <DialogDescription className="text-gray-400 text-base sm:text-lg">
                                Juntos podemos prevenir el fraude.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <StepProgress currentStep={step} />
                            <form onSubmit={handleSubmit} className="mt-6 sm:mt-8">
                                {step === 0 && (
                                    <div className="grid gap-4 animate-fade-in">
                                        <Label className="text-base">Perfil de Red Social del Estafador</Label>
                                        {scammerProfile ? (
                                            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800 border border-gray-600">
                                                <div>
                                                    <p className="font-bold capitalize">{scammerProfile.socialNetwork}</p>
                                                    <p className="text-sm text-gray-400">{scammerProfile.profileUrl}</p>
                                                </div>
                                                <Button variant="ghost" onClick={() => setScammerProfile(null)}>Cambiar</Button>
                                            </div>
                                        ) : (
                                            <SocialNetworkModal onSave={setScammerProfile}>
                                                <Button className="w-full justify-start p-6 text-left bg-gray-800 hover:bg-gray-700 border-gray-600 border">
                                                    Seleccionar Red Social y Pegar URL
                                                </Button>
                                            </SocialNetworkModal>
                                        )}
                                    </div>
                                )}
                                {step === 1 && (
                                    <div className="animate-fade-in">
                                        <Label className="text-base text-center block mb-4">Tipo de Estafa</Label>
                                        <RadioGroup 
                                            required 
                                            name="scamType" 
                                            value={scamType}
                                            onValueChange={setScamType}
                                            className="grid grid-cols-2 gap-2 sm:gap-4"
                                        >
                                             <Label className="flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer border-2 border-transparent has-[:checked]:border-yellow-500 has-[:checked]:bg-gray-700">
                                                <Users className="h-7 w-7 sm:h-8 sm:w-8 text-yellow-400" />
                                                <span className="text-center text-xs sm:text-sm">Estafa en Redes Sociales</span>
                                                <RadioGroupItem value="social_media" id="social_media" className="sr-only" />
                                            </Label>
                                            <Label className="flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer border-2 border-transparent has-[:checked]:border-yellow-500 has-[:checked]:bg-gray-700">
                                                <Fingerprint className="h-7 w-7 sm:h-8 sm:w-8 text-yellow-400" />
                                                <span className="text-center text-xs sm:text-sm">Phishing / Suplantación</span>
                                                <RadioGroupItem value="phishing" id="phishing" className="sr-only" />
                                            </Label>
                                            <Label className="flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer border-2 border-transparent has-[:checked]:border-yellow-500 has-[:checked]:bg-gray-700">
                                                <ShoppingCart className="h-7 w-7 sm:h-8 sm:w-8 text-yellow-400" />
                                                <span className="text-center text-xs sm:text-sm">Venta Fraudulenta</span>
                                                <RadioGroupItem value="fraudulent_sale" id="fraudulent_sale" className="sr-only" />
                                            </Label>
                                            <Label className="flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer border-2 border-transparent has-[:checked]:border-yellow-500 has-[:checked]:bg-gray-700">
                                                <HelpCircle className="h-7 w-7 sm:h-8 sm:w-8 text-yellow-400" />
                                                <span className="text-center text-xs sm:text-sm">Otro tipo</span>
                                                <RadioGroupItem value="other" id="other" className="sr-only" />
                                            </Label>
                                        </RadioGroup>
                                    </div>
                                )}
                                {step === 2 && (
                                    <EvidenceForm 
                                        ref={evidenceFormRef}
                                        onChange={setEvidenceData} 
                                    />
                                )}
                                {step === 3 && (
                                    <div className="grid gap-4 animate-fade-in text-center">
                                        <Label htmlFor="email" className="text-base">Tu Email de Contacto (Opcional)</Label>
                                        <Input id="email" name="email" type="email" placeholder="tucorreo@example.com" className="bg-gray-800 border-gray-600 max-w-sm mx-auto" />
                                        <div className="text-sm text-gray-400 bg-gray-800/50 p-4 rounded-lg border border-yellow-400/30 mt-4 max-w-lg mx-auto">
                                            <p className="font-bold text-yellow-400 text-base mb-2">Proceso de Revisión</p>
                                            <p>Tu reporte será enviado de forma <strong>anónima</strong>. Nuestro equipo evaluará la evidencia y, si es aprobado, se hará público para alertar a la comunidad. <strong>Tu identidad nunca será revelada.</strong></p>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-8 sm:mt-10 flex justify-between items-center">
                                    <div>
                                        {step > 0 && (
                                            <Button type="button" onClick={prevStep} className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 sm:px-6">
                                                Anterior
                                            </Button>
                                        )}
                                    </div>
                                    <div>
                                        {step < steps.length - 1 && (
                                            <Button type="button" onClick={nextStep} className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg" disabled={(step === 0 && !scammerProfile)}>
                                                Siguiente
                                            </Button>
                                        )}
                                        {step === steps.length - 1 && (
                                            <Button type="submit" className="bg-green-500 hover:bg-green-600 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg" disabled={loading}>
                                                {loading ? 'Enviando...' : 'Confirmar y Enviar Reporte'}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </>
                )}
                 {submissionStatus === 'success' && (
                    <div className="flex flex-col items-center justify-center text-center py-10 animate-fade-in">
                         <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                         <h2 className="text-2xl font-bold text-white mb-2">¡Reporte Enviado con Éxito!</h2>
                         <p className="text-gray-400 mb-4">Gracias por tu colaboración. Tu reporte ha sido recibido.</p>
                         <p className="text-sm text-gray-500">ID del Reporte: <strong className="text-yellow-400">{reportId}</strong></p>
                        <Button onClick={() => handleOpenChange(false)} className="mt-8 bg-yellow-500 hover:bg-yellow-600 text-black">
                             Cerrar
                         </Button>
                     </div>
                )}
                {submissionStatus === 'error' && (
                    <div className="flex flex-col items-center justify-center text-center py-10 animate-fade-in">
                        <XCircle className="h-16 w-16 text-red-500 mb-4" />
                        <h2 className="text-2xl font-bold text-white mb-2">Error al Enviar el Reporte</h2>
                        <p className="text-gray-400 mb-4">{error || 'No se pudo completar el envío. Por favor, inténtalo de nuevo más tarde.'}</p>
                        <div className="flex gap-4 mt-8">
                            <Button onClick={resetForm} variant="outline" className="border-gray-600 hover:bg-gray-700 text-gray-300 hover:text-white">
                                Intentar de Nuevo
                            </Button>
                            <Button onClick={() => handleOpenChange(false)} className="bg-yellow-500 hover:bg-yellow-600 text-black">
                                Cerrar
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
