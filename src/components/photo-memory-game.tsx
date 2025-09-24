'use client';

import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function PhotoMemoryGame() {
  if (!PlaceHolderImages || PlaceHolderImages.length === 0) {
    return <p className="text-center">No se encontraron imágenes para mostrar. Verifica el archivo `placeholder-images.json`.</p>;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-xl font-semibold">Galería de Imágenes del Juego</h2>
      <p className="text-muted-foreground">Si ves las imágenes aquí, significa que las rutas son correctas.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 p-4 rounded-lg border">
        {PlaceHolderImages.map((image) => (
          <div key={image.id} className="flex flex-col items-center gap-2">
            <div className="relative aspect-square w-32 h-32 border rounded-md overflow-hidden">
              <Image
                src={image.imageUrl}
                alt={image.description}
                fill
                sizes="(max-width: 640px) 50vw, 20vw"
                className="object-cover"
                data-ai-hint={image.imageHint}
                unoptimized // Usamos esto para asegurarnos de que no haya problemas con la optimización de Next.js mientras depuramos
              />
            </div>
            <p className="text-xs text-center">{image.imageUrl}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
