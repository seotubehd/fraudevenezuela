'use client';
import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Check, Shield, FileText, Send, Users, Fingerprint, ShoppingCart, HelpCircle, XCircle, CheckCircle, UserCheck } from 'lucide-react';
import { SocialNetworkModal } from './SocialNetworkModal';
import { EvidenceForm, EvidenceData } from './EvidenceForm';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface ReportWizardProps {
    personName: string;
    personId: string;
}

const steps = [
    { title: 'Perfil del Estafador', icon: <Shield size={20} /> },
    { title: 'Tipo de Estafa', icon: <FileText size={20} /> },
    { title: 'Evidencia', icon: <Check size={20} /> },
    { title: 'Tu Identidad', icon: <UserCheck size={20} /> },
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
    const [isEvidenceFormValid, setIsEvidenceFormValid] = useState(false);

    const [isAnonymous, setIsAnonymous] = useState(true);
    const [reporterName, setReporterName] = useState('');

    const nextStep = () => {
        if (step === 0) {
            if (!scammerProfile || !scammerProfile.socialNetwork || !scammerProfile.profileUrl) {
                alert('Por favor, selecciona una red social y proporciona una URL de perfil.');
                return;
            }
        }
        if (step === 1) {
            if (!scamType) {
                alert('Por favor, selecciona un tipo de estafa.');
                return;
            }
        }
        if (step === 2 && !isEvidenceFormValid) {
             alert('Por favor, completa la información de evidencia requerida.');
            return;
        }
        setStep(s => s + 1);
    };
    const prevStep = () => setStep(s => s - 1);

    const resetForm = () => {
        setStep(0);
        setSubmissionStatus('idle');
        setError(null);
        setReportId(null);
        setScammerProfile(null);
        setEvidenceData(null);
        setScamType('social_media');
        setIsAnonymous(true);
        setReporterName('');
        setIsEvidenceFormValid(false);
    };

    const handleOpenChange = (isOpen: boolean) => {
        if (!isOpen) resetForm();
        setOpen(isOpen);
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (step !== steps.length - 1) {
            return;
        }

        if (!isAnonymous && !reporterName.trim()) {
            alert('Por favor, introduce tu nombre o selecciona la opción de denuncia anónima para enviar el reporte.');
            return;
        }
        setLoading(true);
        setError(null);

        try {
            const evidenceUrls = evidenceData?.evidenceLinks.split(/[ ,\n]+/).filter(link => link.trim() !== '') || [];

            const reportData = {
                cedula: personId,
                nombreCompleto: personName,
                socialNetwork: scammerProfile?.socialNetwork || 'No especificada',
                profileUrl: scammerProfile?.profileUrl || 'No especificada',
                scamType: scamType,
                descripcion: evidenceData?.descripcion || '',
                scammerBankAccount: evidenceData?.scammerBankAccount || '',
                scammerPagoMovil: evidenceData?.scammerPagoMovil || '',
                scammerPhone: evidenceData?.scammerPhone || '',
                evidencias: evidenceUrls,
                reporterName: isAnonymous ? 'Anónimo' : reporterName.trim(),
                createdAt: serverTimestamp(),
                estado: 'pending',
            };

            const docRef = await addDoc(collection(db, 'reports'), reportData);
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
    
    const isNextDisabled = (
        (step === 0 && (!scammerProfile || !scammerProfile.socialNetwork || !scammerProfile.profileUrl)) ||
        (step === 1 && !scamType) ||
        (step === 2 && !isEvidenceFormValid)
    );

    const isSubmitDisabled = loading || (!isAnonymous && !reporterName.trim());

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
                                Tu colaboración es clave para un entorno más seguro.
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
                                                <Button type="button" variant="ghost" onClick={() => setScammerProfile(null)}>Cambiar</Button>
                                            </div>
                                        ) : (
                                            <SocialNetworkModal onSave={setScammerProfile}>
                                                <Button type="button" className="w-full justify-start p-6 text-left bg-gray-800 hover:bg-gray-700 border-gray-600 border">
                                                    Seleccionar Red Social y Pegar URL
                                                </Button>
                                            </SocialNetworkModal>
                                        )}
                                    </div>
                                )}
                                {step === 1 && (
                                     <div className="animate-fade-in">
                                        <Label className="text-base text-center block mb-4">¿Cuál fue la modalidad de la estafa?</Label>
                                        <RadioGroup required name="scamType" value={scamType} onValueChange={setScamType} className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4">
                                             <Label className="flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer border-2 border-transparent has-[:checked]:border-yellow-500"><Users className="h-7 w-7 sm:h-8 sm:w-8 text-yellow-400" /> <span className="text-center text-xs sm:text-sm">Estafa en Redes Sociales</span> <RadioGroupItem value="social_media" className="sr-only" /></Label>
                                             <Label className="flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer border-2 border-transparent has-[:checked]:border-yellow-500"><Fingerprint className="h-7 w-7 sm:h-8 sm:w-8 text-yellow-400" /> <span className="text-center text-xs sm:text-sm">Phishing / Suplantación</span> <RadioGroupItem value="phishing" className="sr-only" /></Label>
                                             <Label className="flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer border-2 border-transparent has-[:checked]:border-yellow-500"><ShoppingCart className="h-7 w-7 sm:h-8 sm:w-8 text-yellow-400" /> <span className="text-center text-xs sm:text-sm">Venta Fraudulenta</span> <RadioGroupItem value="fraudulent_sale" className="sr-only" /></Label>
                                             <Label className="flex flex-col items-center justify-center gap-2 p-3 sm:p-4 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer border-2 border-transparent has-[:checked]:border-yellow-500"><HelpCircle className="h-7 w-7 sm:h-8 sm:w-8 text-yellow-400" /> <span className="text-center text-xs sm:text-sm">Otro tipo</span> <RadioGroupItem value="other" className="sr-only" /></Label>
                                        </RadioGroup>
                                    </div>
                                )}
                                {step === 2 && (
                                    <EvidenceForm onChange={setEvidenceData} onValidationChange={setIsEvidenceFormValid} />
                                )}
                                {step === 3 && (
                                    <div className="animate-fade-in space-y-6 text-center">
                                        <div className="flex items-center justify-center space-x-3 bg-gray-800/50 p-4 rounded-lg border border-gray-700 max-w-md mx-auto">
                                            <Switch id="anonymous-switch" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
                                            <Label htmlFor="anonymous-switch" className="text-base cursor-pointer">Realizar denuncia anónima</Label>
                                        </div>
                                        {!isAnonymous && (
                                            <div className="animate-fade-in">
                                                <Label htmlFor="reporterName" className="text-base">Tu Nombre Completo</Label>
                                                <Input required id="reporterName" name="reporterName" value={reporterName} onChange={(e) => setReporterName(e.target.value)} placeholder="Ej: Juan Pérez" className="bg-gray-800 border-gray-600 max-w-sm mx-auto mt-2" />
                                            </div>
                                        )}
                                         <div className="text-sm text-gray-400 bg-gray-800/50 p-4 rounded-lg border border-yellow-400/30 max-w-lg mx-auto">
                                            <p className="font-bold text-yellow-400 text-base mb-2">Proceso de Revisión</p>
                                            <p>Tu reporte será revisado por nuestro equipo. Si es aprobado, se hará público para alertar a la comunidad. {isAnonymous ? 'Tu identidad no será revelada.' : 'El nombre que proporcionaste será visible en el reporte.'}</p>
                                        </div>
                                    </div>
                                )}
                                
                                <DialogFooter className="mt-8 sm:mt-10 flex justify-between items-center">
                                    <Button type="button" onClick={prevStep} className={`bg-yellow-500 hover:bg-yellow-600 text-black px-4 sm:px-6 ${step === 0 ? 'invisible' : ''}`}>
                                        Anterior
                                    </Button>
                                    <div>
                                        {step < steps.length - 1 ? (
                                            <Button type="button" onClick={nextStep} className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg" disabled={isNextDisabled}>
                                                Siguiente
                                            </Button>
                                        ) : (
                                            <Button type="submit" className="bg-green-500 hover:bg-green-600 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg disabled:opacity-50" disabled={isSubmitDisabled}>
                                                {loading ? 'Enviando...' : 'Confirmar y Enviar Reporte'}
                                            </Button>
                                        )}
                                    </div>
                                </DialogFooter>
                            </form>
                        </div>
                    </>
                )}
                 {submissionStatus === 'success' && (
                    <div className="flex flex-col items-center justify-center text-center py-10 animate-fade-in">
                         <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                         <h2 className="text-2xl font-bold text-white mb-2">¡Reporte Enviado con Éxito!</h2>
                         <p className="text-gray-400 mb-4">Gracias por tu colaboración. Tu reporte ha sido recibido y será revisado.</p>
                         <p className="text-sm text-gray-500">ID del Reporte: <strong className="text-yellow-400">{reportId}</strong></p>
                        <DialogClose asChild>
                            <Button className="mt-8 bg-yellow-500 hover:bg-yellow-600 text-black">
                                 Cerrar
                            </Button>
                        </DialogClose>
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
                            <DialogClose asChild>
                                <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
                                    Cerrar
                                </Button>
                            </DialogClose>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}