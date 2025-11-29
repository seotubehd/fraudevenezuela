'use client';

import { useState, useEffect } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
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

export function SearchForm() {
    const [cedula, setCedula] = useState('');
    const [nacionalidad, setNacionalidad] = useState('V');
    const [searchCount, setSearchCount] = useState(0);
    const [showCaptcha, setShowCaptcha] = useState(false);
    const [isCaptchaVerified, setCaptchaVerified] = useState(false);

    useEffect(() => {
        const fetchSearchCount = async () => {
            try {
                const response = await fetch('/api/search-count');
                if (response.ok) {
                    const data = await response.json();
                    const count = data.count || 0;
                    setSearchCount(count);
                    if (count >= 5) {
                        setShowCaptcha(true);
                    }
                }
            } catch (error) {
                console.error('Error fetching search count:', error);
            }
        };

        fetchSearchCount();
    }, []);

    const handleCaptchaChange = (value: string | null) => {
        if (value) {
            setCaptchaVerified(true);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (cedula.trim()) {
            if (showCaptcha && !isCaptchaVerified) {
                alert('Por favor, completa el reCAPTCHA.');
                return;
            }

            if (showCaptcha && isCaptchaVerified) {
                try {
                    await fetch('/api/reset-search-count', { method: 'POST' });
                } catch (error) {
                    console.error('Error resetting search count:', error);
                }
            }

            const absolutePath = `/${nacionalidad}${cedula.trim()}`;
            window.location.href = absolutePath;
        }
    };
    
    console.log("Clave de sitio para ReCAPTCHA:", process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY);

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
                        disabled={showCaptcha && !isCaptchaVerified}
                        className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                    >
                        Buscar
                    </Button>
                </div>
                {showCaptcha && (
                    <div className="mt-4 flex justify-center">
                        <ReCAPTCHA
                            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
                            onChange={handleCaptchaChange}
                            theme="dark"
                        />
                    </div>
                )}
            </form>
        </div>
    );
}
