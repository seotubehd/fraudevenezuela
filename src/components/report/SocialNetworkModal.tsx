'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Facebook, Instagram, Twitter, Youtube, Twitch, Github, Globe } from 'lucide-react';

// Custom TikTok Icon using SVG path
const TikTokIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-music-2">
        <path d="M16.5 6.5a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0Z"/>
        <path d="M16.5 6.5v11"/>
        <path d="M11.5 17.5a5 5 0 1 0 0-10H7.5v10Z"/>
    </svg>
);

const socialNetworks = [
    { id: 'facebook', name: 'Facebook', icon: <Facebook /> },
    { id: 'instagram', name: 'Instagram', icon: <Instagram /> },
    { id: 'twitter', name: 'Twitter', icon: <Twitter /> },
    { id: 'tiktok', name: 'TikTok', icon: <TikTokIcon /> },
    { id: 'youtube', name: 'YouTube', icon: <Youtube /> },
    { id: 'twitch', name: 'Twitch', icon: <Twitch /> },
    { id: 'github', name: 'GitHub', icon: <Github /> },
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

    const handleSave = () => {
        if (selectedSocialNetwork && profileUrl) {
            onSave({ socialNetwork: selectedSocialNetwork, profileUrl });
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
                    />
                </div>
                <div className="mt-6 flex justify-end">
                    <Button
                        onClick={handleSave}
                        className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-3"
                        disabled={!selectedSocialNetwork || !profileUrl}
                    >
                        Guardar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
