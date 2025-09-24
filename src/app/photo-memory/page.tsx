import { GameLayout } from '@/components/game-layout';
import { PhotoMemoryGame } from '@/components/photo-memory-game';
import { Suspense } from 'react';

export default function PhotoMemoryPage() {
  return (
    <GameLayout title="Memorama de Fotos">
      <Suspense fallback={<div className="text-center">Cargando...</div>}>
        <PhotoMemoryGame />
      </Suspense>
    </GameLayout>
  );
}
