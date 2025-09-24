'use client';

import { useState, useEffect, useCallback } from 'react';

const GAME_PROGRESS_KEY = 'amorGamesProgress';

const gameOrder = [
  '/word-search',
  '/personal-question',
  '/photo-memory',
  '/quiz',
  '/secret-code',
];

export function useGameProgress() {
  const [completedGames, setCompletedGames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem(GAME_PROGRESS_KEY);
      if (savedProgress) {
        setCompletedGames(JSON.parse(savedProgress));
      }
    } catch (error) {
      console.error("Failed to load game progress from localStorage", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveProgress = (newCompletedGames: string[]) => {
    try {
      localStorage.setItem(GAME_PROGRESS_KEY, JSON.stringify(newCompletedGames));
    } catch (error) {
       console.error("Failed to save game progress to localStorage", error);
    }
  };

  const completeGame = useCallback((gamePath: string) => {
    setCompletedGames(prev => {
      if (prev.includes(gamePath)) {
        return prev;
      }
      const newCompletedGames = [...prev, gamePath];
      saveProgress(newCompletedGames);
      return newCompletedGames;
    });
  }, []);

  const resetProgress = useCallback(() => {
    const newCompletedGames: string[] = [];
    setCompletedGames(newCompletedGames);
    saveProgress(newCompletedGames);
  }, []);

  const isUnlocked = useCallback((gamePath: string) => {
    const gameIndex = gameOrder.indexOf(gamePath);
    if (gameIndex === 0) {
      return true; // First game is always unlocked
    }
    const previousGamePath = gameOrder[gameIndex - 1];
    return completedGames.includes(previousGamePath);
  }, [completedGames]);

  const getNextGamePath = useCallback((currentGamePath: string) => {
    const currentIndex = gameOrder.indexOf(currentGamePath);
    if (currentIndex > -1 && currentIndex < gameOrder.length - 1) {
      return gameOrder[currentIndex + 1];
    }
    return null;
  }, []);

  return { completedGames, completeGame, isUnlocked, getNextGamePath, isLoading, resetProgress };
}
