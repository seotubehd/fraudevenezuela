'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Globe,
} from 'lucide-react';

interface SocialNetworkModalProps {
  children: React.ReactNode;
  onSave: (data: { socialNetwork: string; profileUrl: string }) => void;
}

const socialNetworks = [
  { name: 'Facebook', icon: <Facebook className="w-6 h-6" /> },
  { name: 'Instagram', icon: <Instagram className="w-6 h-6" /> },
  { name: 'Twitter', icon: <Twitter className="w-6 h-6" /> },
  { name: 'Youtube', icon: <Youtube className="w-6 h-6" /> },
  { name: 'Otro', icon: <Globe className="w-6 h-6" /> },
];

export function SocialNetworkModal({
  children,
  onSave,
}: SocialNetworkModalProps) {
  const [selectedNetwork, setSelectedNetwork] = useState<string>('');
  const [profileUrl, setProfileUrl] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    onSave({ socialNetwork: selectedNetwork, profileUrl });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-full max-w-sm bg-[#1a2332] text-white border-gray-700 p-4 sm:rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-yellow-400">Agregar Perfil de Red Social</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="social-network" className="text-base text-gray-300">Red Social</Label>
            <RadioGroup
              defaultValue={selectedNetwork}
              onValueChange={setSelectedNetwork}
              className="grid grid-cols-2 gap-2 sm:grid-cols-3"
            >
              {socialNetworks.map((network) => (
                <Label
                  key={network.name}
                  htmlFor={network.name}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors cursor-pointer border-2 ${selectedNetwork === network.name.toLowerCase()
                      ? 'border-yellow-500 text-yellow-400'
                      : 'border-gray-600 text-gray-400'}`}
                >
                  {network.icon}
                  <span className="mt-2 text-xs sm:text-sm">{network.name}</span>
                  <RadioGroupItem
                    value={network.name.toLowerCase()}
                    id={network.name}
                    className="sr-only"
                  />
                </Label>
              ))}
            </RadioGroup>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <Label htmlFor="profile-url" className="text-base text-gray-300">URL del Perfil</Label>
            <Input
              id="profile-url"
              value={profileUrl}
              onChange={(e) => setProfileUrl(e.target.value)}
              placeholder="https://ejemplo.com/perfil"
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-500"
            />
          </div>
        </div>
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="border-gray-600 hover:bg-gray-700 text-gray-300 hover:text-white">Cancelar</Button>
          </DialogClose>
          <Button type="button" onClick={handleSave} className="bg-yellow-500 hover:bg-yellow-600 text-black">Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}