import { GameLayout } from '@/components/game-layout';
import { QuizGame } from '@/components/quiz-game';
import { Suspense } from 'react';

export default function QuizPage() {
  return (
    <GameLayout title="Quiz Romántico">
      <Suspense fallback={<div className="text-center">Cargando...</div>}>
        <QuizGame />
      </Suspense>
    </GameLayout>
  );
}
