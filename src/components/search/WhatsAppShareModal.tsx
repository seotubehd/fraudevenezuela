
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface WhatsAppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: () => void;
}

const WhatsAppShareModal: React.FC<WhatsAppShareModalProps> = ({ isOpen, onClose, onShare }) => {
  const shareMessage = `¡ALERTA VENEZUELA! ⚠️ ¿Fuiste víctima de una estafa?\n\nMiles de personas son engañadas a diario. Creamos FraudeVenezuela.info, una herramienta comunitaria y GRATUITA donde puedes reportar estafadores y consultar la cédula de cualquier persona antes de hacer un negocio.\n\nNo dejes que te pase a ti o a tus seres queridos. ¡Juntos podemos hacer de la internet un lugar más seguro!\n\nConsulta y reporta aquí: https://fraudevenezuela.info`;

  const handleShare = async () => {
    // Primero, cierra el modal
    onClose();

    // Luego, abre la URL de WhatsApp
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(whatsappUrl, '_blank');

    // Finalmente, realiza las acciones de post-compartir
    try {
      await fetch('/api/shares', { method: 'POST' });
      onShare(); // Llama a la función onShare que puede tener lógica adicional
    } catch (error) {
      console.error('Error en las acciones post-compartir:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-[425px] bg-gray-900 text-white border-yellow-500 shadow-lg rounded-lg animate-fade-in-up">
        <DialogHeader className="text-center p-4 sm:p-6">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-yellow-500">¡Apóyanos y continúa!</DialogTitle>
          <DialogDescription className="text-sm sm:text-base text-gray-400 mt-2">
            Ayúdanos a llegar a más personas compartiendo nuestra iniciativa en WhatsApp.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 px-4 sm:px-6 text-center">
          <p className="text-base sm:text-lg text-gray-300">Cada vez que compartes, nos ayudas a prevenir más fraudes.</p>
        </div>
        <div className="p-4 sm:p-6">
          <Button onClick={handleShare} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg text-base sm:text-lg transition-transform transform hover:scale-105">
            Compartir y Continuar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsAppShareModal;
