'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import WhatsAppShareModal from './WhatsAppShareModal';

export function SearchForm() {
    const [cedula, setCedula] = useState('');
    const [nacionalidad, setNacionalidad] = useState('V');
    const [searchCount, setSearchCount] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pendingCedula, setPendingCedula] = useState<string | null>(null);

    useEffect(() => {
        const count = localStorage.getItem('searchCount');
        setSearchCount(count ? parseInt(count, 10) : 0);
    }, []);

    const executeSearch = async (fullCedula: string) => {
        try {
            await fetch('/api/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cedula: fullCedula }),
            });
        } catch (error) {
            console.error("Error calling /api/search:", error);
        }
        window.location.href = `/${fullCedula}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (cedula.trim()) {
            const fullCedula = `${nacionalidad}${cedula.trim()}`;

            if (searchCount >= 3) {
                setPendingCedula(fullCedula);
                setIsModalOpen(true);
            } else {
                const newCount = searchCount + 1;
                setSearchCount(newCount);
                localStorage.setItem('searchCount', newCount.toString());
                await executeSearch(fullCedula);
            }
        }
    };

    const handleShare = async () => {
        setSearchCount(0);
        localStorage.setItem('searchCount', '0');
        setIsModalOpen(false);
        if (pendingCedula) {
            await executeSearch(pendingCedula);
            setPendingCedula(null);
        }
    };

    return (
        <div className="bg-[#2a3544] rounded-lg p-6 shadow-xl border border-gray-700">
            <form onSubmit={handleSubmit}>
                <Label htmlFor="cedula" className="text-gray-300 text-sm mb-2 block">
                    Número de Cédula
                </Label>
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex flex-1 gap-2">
                        <Select value={nacionalidad} onValueChange={setNacionalidad}>
                            <SelectTrigger className="w-20 bg-[#1a2332] border-gray-600 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="V">V</SelectItem>
                                <SelectItem value="E">E</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            id="cedula"
                            type="text"
                            placeholder="Ej: 12345678"
                            value={cedula}
                            onChange={(e) => setCedula(e.target.value.replace(/\D/g, ''))}
                            required
                            className="flex-1 bg-[#1a2332] border-gray-600 text-white placeholder:text-gray-500"
                        />
                    </div>
                    <Button
                        type="submit"
                        className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                    >
                        Buscar
                    </Button>
                </div>
            </form>
            <WhatsAppShareModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onShare={handleShare}
            />
        </div>
    );
}
