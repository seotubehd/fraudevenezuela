'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Facebook, Instagram, Twitter, Youtube, Twitch, Globe, User } from 'lucide-react';

// Custom TikTok Icon using SVG path
const TikTokIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.235 4.312a1 1 0 0 1 1-1h2.53a1 1 0 0 1 1 1v13.37a1 1 0 0 1-1 1h-2.53a1 1 0 0 1-1-1v-2.583c-1.33.27-2.733.418-4.235.418-4.518 0-8.204-3.64-8.204-8.152S3.482 1.215 8 1.215c1.502 0 2.904.148 4.235.418V4.312zm-4.235 2.37a3.877 3.877 0 0 0-.25-.013c-2.073 0-3.754 1.68-3.754 3.752s1.681 3.752 3.754 3.752c.084 0 .167-.005.25-.013v-7.478z"/>
    </svg>
);

const socialNetworks = [
    { id: 'facebook', name: 'Facebook', icon: <Facebook /> },
    { id: 'instagram', name: 'Instagram', icon: <Instagram /> },
    { id: 'twitter', name: 'Twitter', icon: <Twitter /> },
    { id: 'tiktok', name: 'TikTok', icon: <TikTokIcon /> },
    { id: 'youtube', name: 'YouTube', icon: <Youtube /> },
    { id: 'twitch', name: 'Twitch', icon: <Twitch /> },
    { id: 'personalmente', name: 'Personalmente', icon: <User /> },
    { id: 'other', name: 'Otro', icon: <Globe /> },
];

interface SocialNetworkModalProps {
    onSave: (data: { socialNetwork: string, profileUrl: string }) => void;
    children: React.ReactNode;
}

export function SocialNetworkModal({ onSave, children }: SocialNetworkModalProps) {
    const [open, setOpen] = useState(false);
    const [selectedSocialNetwork, setSelectedSocialNetwork] = useState<string | null>(null);
    const [profileUrl, setProfileUrl] = useState('');

    const isUrlDisabled = selectedSocialNetwork === 'personalmente';

    useEffect(() => {
        if (isUrlDisabled) {
            setProfileUrl('');
        }
    }, [selectedSocialNetwork, isUrlDisabled]);

    const handleSave = () => {
        if (selectedSocialNetwork) {
            onSave({ 
                socialNetwork: selectedSocialNetwork, 
                profileUrl: isUrlDisabled ? 'Personalmente' : profileUrl 
            });
            setOpen(false);
            setSelectedSocialNetwork(null);
            setProfileUrl('');
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="w-full max-w-lg bg-[#1a2332] text-white border-gray-700 p-4 sm:p-6 sm:rounded-lg">
                <DialogHeader className="text-center mb-4">
                    <DialogTitle className="text-xl sm:text-2xl font-bold text-yellow-400">Seleccionar Red Social</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                    <Label className="text-base">Red Social</Label>
                    <RadioGroup
                        className="grid grid-cols-3 sm:grid-cols-4 gap-2"
                        value={selectedSocialNetwork || ''}
                        onValueChange={setSelectedSocialNetwork}
                    >
                        {socialNetworks.map((network) => {
                            const isSelected = selectedSocialNetwork === network.id;
                            return (
                                <Label
                                    key={network.id}
                                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg transition-colors cursor-pointer border-2 ${isSelected ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-gray-800 border-transparent hover:bg-gray-700'}`}>
                                    {network.icon}
                                    <span className="text-xs text-center">{network.name}</span>
                                    <RadioGroupItem value={network.id} id={network.id} className="sr-only" />
                                </Label>
                            );
                        })}
                    </RadioGroup>
                    <Label htmlFor="profileUrl" className="text-base mt-2">URL o Perfil del Estafador</Label>
                    <Input
                        id="profileUrl"
                        placeholder="Ej: instagram.com/usuario"
                        className="bg-gray-800 border-gray-600 text-base"
                        value={profileUrl}
                        onChange={(e) => setProfileUrl(e.target.value)}
                        disabled={isUrlDisabled}
                    />
                </div>
                <div className="mt-6 flex justify-end">
                    <Button
                        onClick={handleSave}
                        className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-3"
                        disabled={!selectedSocialNetwork || (!isUrlDisabled && !profileUrl)}
                    >
                        Guardar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
