import { GameLayout } from '@/components/game-layout';
import { PersonalQuestionGame } from '@/components/personal-question-game';
import { Suspense } from 'react';

export default function PersonalQuestionPage() {
  return (
    <GameLayout title="Pregunta Personal">
       <Suspense fallback={<div className="text-center">Cargando...</div>}>
        <PersonalQuestionGame />
      </Suspense>
    </GameLayout>
  );
}
