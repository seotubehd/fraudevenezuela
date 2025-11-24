"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function SearchForm() {
    const router = useRouter();
    const [cedula, setCedula] = useState("");
    const [nacionalidad, setNacionalidad] = useState("V");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (cedula.trim()) {
            router.push(`/buscar?cedula=${nacionalidad}-${cedula.trim()}`);
        }
    };

    return (
        <div className="bg-[#2a3544] rounded-lg p-6 shadow-xl border border-gray-700">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="cedula" className="text-gray-300 text-sm mb-2 block">
                        Número de Cédula
                    </Label>
                    <div className="flex gap-2">
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
                            onChange={(e) => setCedula(e.target.value.replace(/\D/g, ""))}
                            required
                            className="flex-1 bg-[#1a2332] border-gray-600 text-white placeholder:text-gray-500"
                        />
                    </div>
                </div>
                <Button
                    type="submit"
                    className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold"
                >
                    Buscar
                </Button>
            </form>
        </div>
    );
}
