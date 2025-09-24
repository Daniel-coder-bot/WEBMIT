import { GameLayout } from '@/components/game-layout';
import { WordSearchGame } from '@/components/word-search-game';
import { Suspense } from 'react';

export default function WordSearchPage() {
  return (
    <GameLayout title="Sopa de Letras">
      <Suspense fallback={<div className="text-center">Cargando...</div>}>
        <WordSearchGame />
      </Suspense>
    </GameLayout>
  );
}
