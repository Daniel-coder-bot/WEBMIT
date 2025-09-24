'use client';

import { useGameProgress } from '@/hooks/use-game-progress';
import { createContext, useContext, type ReactNode } from 'react';

type GameProgressContextType = ReturnType<typeof useGameProgress>;

const GameProgressContext = createContext<GameProgressContextType | null>(null);

export function GameProgressProvider({ children }: { children: ReactNode }) {
  const gameProgress = useGameProgress();
  return (
    <GameProgressContext.Provider value={gameProgress}>
      {children}
    </GameProgressContext.Provider>
  );
}

export const useGameProgressClient = () => {
  const context = useContext(GameProgressContext);
  if (!context) {
    throw new Error('useGameProgressClient must be used within a GameProgressProvider');
  }
  return context;
};
