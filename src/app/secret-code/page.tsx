import { GameLayout } from '@/components/game-layout';
import { SecretCodeGame } from '@/components/secret-code-game';
import { Suspense } from 'react';

export default function SecretCodePage() {
  return (
    <GameLayout title="Clave Secreta">
      <Suspense fallback={<div className="text-center">Cargando...</div>}>
        <SecretCodeGame />
      </Suspense>
    </GameLayout>
  );
}
