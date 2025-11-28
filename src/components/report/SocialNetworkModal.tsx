'use client';
import { useState, useEffect, ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Facebook, Instagram, Twitter, Youtube, Globe, Users } from 'lucide-react';

// Custom TikTok icon component
const TikTokIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8.5c-2.76 0-5 2.24-5 5v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V12c0-1.65 1.35-3 3-3s3 1.35 3 3v1c0 3.87-3.13 7-7 7s-7-3.13-7-7V8.5c0-.83.67-1.5 1.5-1.5S8 7.67 8 8.5v8.5" />
  </svg>
);

interface SocialNetworkModalProps {
  children: ReactNode;
  onSave: (data: { socialNetwork: string; profileUrl: string }) => void;
}

const socialNetworks: { name: string; icon: ReactNode }[] = [
  { name: 'Facebook', icon: <Facebook className="w-6 h-6" /> },
  { name: 'Instagram', icon: <Instagram className="w-6 h-6" /> },
  { name: 'TikTok', icon: <TikTokIcon /> },
  { name: 'Twitter', icon: <Twitter className="w-6 h-6" /> },
  { name: 'Youtube', icon: <Youtube className="w-6 h-6" /> },
  { name: 'En Persona', icon: <Users className="w-6 h-6" /> },
  { name: 'Otro', icon: <Globe className="w-6 h-6" /> },
];

export function SocialNetworkModal({ children, onSave }: SocialNetworkModalProps) {
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [profileUrl, setProfileUrl] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const isUrlDisabled = selectedNetwork === 'en persona';

  useEffect(() => {
    // Clear URL when 'En Persona' is selected
    if (isUrlDisabled) {
      setProfileUrl('');
    }
  }, [selectedNetwork, isUrlDisabled]);

  const handleSave = () => {
    if (!selectedNetwork) {
      alert('Por favor, selecciona una opción.');
      return;
    }
    if (!isUrlDisabled && !profileUrl.trim()) {
      alert('Por favor, introduce la URL o nombre de usuario del perfil.');
      return;
    }
    onSave({ 
      socialNetwork: selectedNetwork, 
      profileUrl: isUrlDisabled ? 'N/A' : profileUrl.trim() 
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-full max-w-md bg-[#1a2332] text-white border-gray-700 p-6 sm:rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-yellow-400">Perfil del Estafador</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-1 gap-3">
            <Label className="text-base text-gray-300">¿Dónde ocurrió la estafa?</Label>
            <RadioGroup value={selectedNetwork} onValueChange={setSelectedNetwork} className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {socialNetworks.map((network) => (
                <Label
                  key={network.name}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer border-2 ${selectedNetwork === network.name.toLowerCase()
                      ? 'border-yellow-500 text-yellow-400'
                      : 'border-gray-600 text-gray-400'}`}
                >
                  {network.icon}
                  <span className="mt-2 text-center text-xs sm:text-sm">{network.name}</span>
                  <RadioGroupItem value={network.name.toLowerCase()} id={network.name} className="sr-only" />
                </Label>
              ))}
            </RadioGroup>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="profile-url" className={`text-base text-gray-300 ${isUrlDisabled ? 'text-gray-500' : ''}`}>
              URL o Nombre de Usuario del Perfil
            </Label>
            <Input
              id="profile-url"
              value={profileUrl}
              onChange={(e) => setProfileUrl(e.target.value)}
              placeholder={isUrlDisabled ? 'No aplica' : '@usuario o https://...'}
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isUrlDisabled}
            />
          </div>
        </div>
        <DialogFooter className="mt-4 flex sm:justify-end gap-2">
           <DialogClose asChild>
            <Button type="button" variant="ghost" className="w-full sm:w-auto text-gray-300 hover:bg-gray-700 hover:text-white">Cancelar</Button>
          </DialogClose>
          <Button type="button" onClick={handleSave} className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-black">Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
