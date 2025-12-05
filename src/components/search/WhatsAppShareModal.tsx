
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface WhatsAppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: () => void;
}

const WhatsAppShareModal: React.FC<WhatsAppShareModalProps> = ({ isOpen, onClose, onShare }) => {
  const shareMessage = `¡ALERTA VENEZUELA! ⚠️ ¿Fuiste víctima de una estafa?

Miles de personas son engañadas a diario. Creamos FraudeVenezuela.info, una herramienta comunitaria y GRATUITA donde puedes reportar estafadores y consultar la cédula de cualquier persona antes de hacer un negocio.

No dejes que te pase a ti o a tus seres queridos. ¡Juntos podemos hacer de la internet un lugar más seguro!

Consulta y reporta aquí: https://fraudevenezuela.info`;

  const handleShare = () => {
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(whatsappUrl, '_blank');
    onShare();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-800 text-white border-yellow-400">
        <DialogHeader>
          <DialogTitle className="text-yellow-400">¡Comparte para continuar!</DialogTitle>
          <DialogDescription>
            Para seguir utilizando nuestro servicio, por favor comparte esta información valiosa en WhatsApp.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-300">{shareMessage.split('\n').map((line, i) => <span key={i}>{line}<br/></span>)}</p>
        </div>
        <Button onClick={handleShare} className="w-full bg-green-500 hover:bg-green-600 text-white">
          Compartir y Continuar
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsAppShareModal;
