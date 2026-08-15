import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-black/40"
    >
      <div className={`bg-white border border-[#E5E5E5] rounded w-full ${maxWidth} mx-4 animate-in`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E5E5]">
          <h2 className="text-base font-semibold text-[#171717]">{title}</h2>
          <Button variant="ghost" size="xs" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </Button>
        </div>
        <div className="px-5 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}
