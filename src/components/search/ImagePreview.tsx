import { useState } from 'react';
import { ImageModal } from '@/components/ui/image-modal';
import { Button } from '@/components/ui/button';
import { ZoomIn } from 'lucide-react';

interface ImagePreviewProps {
  src: string;
  alt: string;
}

export function ImagePreview({ src, alt }: ImagePreviewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showZoom, setShowZoom] = useState(false);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setShowZoom(true)}
      onMouseLeave={() => setShowZoom(false)}
    >
      <img
        src={src}
        alt={alt}
        className="border h-40 w-64 rounded-sm object-cover transition-all duration-200 hover:scale-105 cursor-pointer"
        onClick={() => setIsModalOpen(true)}
        loading="lazy"
      />
      {showZoom && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute bottom-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          onClick={() => setIsModalOpen(true)}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
      )}
      <ImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageSrc={src.replace('&pid=Api&P=0&w=300&h=300', '')}
      />
    </div>
  );
}
