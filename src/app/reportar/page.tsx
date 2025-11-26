
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createReport, uploadEvidence, ReportData } from "@/lib/services/reports"; // Importar ReportData

export default function ReportarPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState<FileList | null>(null);
    // Inicializar el estado del formulario para que coincida con ReportData
    const [formData, setFormData] = useState<Omit<ReportData, 'evidencias'>>({
        nombreCompleto: "",
        cedula: "",
        tipo: "",
        descripcion: "",
        ubicacion: "",
        contacto: ""
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (value: string) => {
        setFormData(prev => ({ ...prev, tipo: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.nombreCompleto || !formData.cedula || !formData.tipo || !formData.descripcion) {
            alert("Por favor, complete todos los campos obligatorios.");
            return;
        }
        setLoading(true);
        try {
            let evidenciasUrls: string[] = [];

            if (files && files.length > 0) {
                const uploadPromises = Array.from(files).map(file => uploadEvidence(file));
                evidenciasUrls = await Promise.all(uploadPromises);
            }

            await createReport({
                ...formData,
                evidencias: evidenciasUrls
            });

            alert("Reporte enviado exitosamente");
            router.push("/");
        } catch (error) {
            console.error(error);
            alert("Error al enviar el reporte");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container flex items-center justify-center py-10 px-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Reportar Irregularidad</CardTitle>
                    <CardDescription>
                        Complete el formulario para reportar incidencias relacionadas con el registro electoral.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {/* --- CAMPO NUEVO: NOMBRE COMPLETO -- */}
                            <div className="space-y-2">
                                <Label htmlFor="nombreCompleto">Nombre Completo del Afectado</Label>
                                <Input
                                    id="nombreCompleto"
                                    placeholder="Ej: María Pérez"
                                    required
                                    value={formData.nombreCompleto}
                                    onChange={handleInputChange}
                                />
                            </div>
                             {/* --- CAMPO CÉDULA --- */}
                            <div className="space-y-2">
                                <Label htmlFor="cedula">Cédula Afectada</Label>
                                <Input
                                    id="cedula"
                                    placeholder="V-12345678"
                                    required
                                    value={formData.cedula}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="tipo">Tipo de Irregularidad</Label>
                            <Select required onValueChange={handleSelectChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione una opción" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cambio_centro">Cambio de Centro no autorizado</SelectItem>
                                    <SelectItem value="fallecido_activo">Persona fallecida activa</SelectItem>
                                    <SelectItem value="datos_incorrectos">Datos personales incorrectos</SelectItem>
                                    <SelectItem value="otro">Otro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ubicacion">Centro de Votación / Ubicación</Label>
                            <Input
                                id="ubicacion"
                                placeholder="Nombre del centro o dirección"
                                value={formData.ubicacion}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="descripcion">Descripción Detallada</Label>
                            <Textarea
                                id="descripcion"
                                placeholder="Describa los detalles de la irregularidad..."
                                required
                                className="min-h-[100px]"
                                value={formData.descripcion}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="evidencias">Evidencias (Imágenes/Documentos)</Label>
                            <Input
                                id="evidencias"
                                type="file"
                                multiple
                                accept="image/*,.pdf"
                                onChange={(e) => setFiles(e.target.files)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="contacto">Contacto (Opcional)</Label>
                            <Input
                                id="contacto"
                                type="email"
                                placeholder="correo@ejemplo.com"
                                value={formData.contacto}
                                onChange={handleInputChange}
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Enviando..." : "Enviar Reporte"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
