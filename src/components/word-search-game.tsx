'use client';

import { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { PartyPopper } from 'lucide-react';
import { useGameProgress } from '@/hooks/use-game-progress';
import { useRouter } from 'next/navigation';

const GRID_SIZE = 12;
const WORDS = ['TEAMO', 'MITZY', 'MUSEOS', 'GATOS', 'LIBROS'];
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

type Cell = { r: number; c: number };

// Utility to generate the grid
const generateGrid = () => {
  const grid = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill('')
  );

  const placeWord = (word: string): boolean => {
    const directions = [
      { dr: 0, dc: 1 }, // Horizontal
      { dr: 1, dc: 0 }, // Vertical
      { dr: 1, dc: 1 }, // Diagonal down-right
    ];
    const dir = directions[Math.floor(Math.random() * directions.length)];
    const startR = Math.floor(Math.random() * (GRID_SIZE - (dir.dr === 0 ? 0 : word.length)));
    const startC = Math.floor(Math.random() * (GRID_SIZE - (dir.dc === 0 ? 0 : word.length)));

    // Check if word fits
    for (let i = 0; i < word.length; i++) {
      const r = startR + i * dir.dr;
      const c = startC + i * dir.dc;
      if (grid[r][c] !== '' && grid[r][c] !== word[i]) {
        return false; // Collision
      }
    }
    
    // Place word
    for (let i = 0; i < word.length; i++) {
      const r = startR + i * dir.dr;
      const c = startC + i * dir.dc;
      grid[r][c] = word[i];
    }
    return true;
  };

  WORDS.forEach(word => {
    let placed = false;
    while (!placed) {
      placed = placeWord(word);
    }
  });

  // Fill empty cells
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === '') {
        grid[r][c] = CHARS[Math.floor(Math.random() * CHARS.length)];
      }
    }
  }
  return grid;
};

export function WordSearchGame() {
  const [grid, setGrid] = useState<string[][]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selection, setSelection] = useState<Cell[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [foundCells, setFoundCells] = useState<Set<string>>(new Set());
  const [isComplete, setIsComplete] = useState(false);
  const { completeGame, getNextGamePath } = useGameProgress();
  const router = useRouter();


  useEffect(() => {
    setGrid(generateGrid());
  }, []);

  const cellKey = (r: number, c: number) => `${r}-${c}`;

  const isCellSelected = (r: number, c: number) =>
    selection.some(cell => cell.r === r && cell.c === c);

  const isCellFound = (r: number, c: number) => foundCells.has(cellKey(r, c));

  const handleMouseDown = (r: number, c: number) => {
    setIsSelecting(true);
    setSelection([{ r, c }]);
  };

  const handleMouseEnter = (r: number, c: number) => {
    if (isSelecting) {
      // Basic straight line logic
      const start = selection[0];
      const newSelection: Cell[] = [start];
      const dr = Math.sign(r - start.r);
      const dc = Math.sign(c - start.c);
      const dist = Math.max(Math.abs(r - start.r), Math.abs(c - start.c));

      for (let i = 1; i <= dist; i++) {
        newSelection.push({ r: start.r + i * dr, c: start.c + i * dc });
      }
      setSelection(newSelection);
    }
  };

  const handleMouseUp = () => {
    if (!isSelecting) return;

    const selectedWord = selection.map(({ r, c }) => grid[r][c]).join('');
    const reversedSelectedWord = selectedWord.split('').reverse().join('');

    const wordToFind = WORDS.find(w => w === selectedWord || w === reversedSelectedWord);

    if (wordToFind && !foundWords.includes(wordToFind)) {
      const newFoundWords = [...foundWords, wordToFind];
      setFoundWords(newFoundWords);
      const newFoundCells = new Set(foundCells);
      selection.forEach(cell => newFoundCells.add(cellKey(cell.r, cell.c)));
      setFoundCells(newFoundCells);
      if (newFoundWords.length === WORDS.length) {
        completeGame('/word-search');
        setIsComplete(true);
      }
    }

    setIsSelecting(false);
    setSelection([]);
  };
  
  const resetGame = () => {
    setGrid(generateGrid());
    setFoundWords([]);
    setFoundCells(new Set());
    setIsComplete(false);
    setSelection([]);
    setIsSelecting(false);
  }

  const handleNext = () => {
    const nextGame = getNextGamePath('/word-search');
    if (nextGame) {
      router.push(nextGame);
    } else {
      router.push('/');
    }
  };

  if (grid.length === 0) {
    return <div className="text-center">Generando sopa de letras...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row items-start justify-center gap-8">
      <Card className="p-2 sm:p-4 shadow-lg">
        <div 
          className="grid gap-1 select-none" 
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {grid.map((row, r) =>
            row.map((letter, c) => (
              <div
                key={`${r}-${c}`}
                className={cn(
                  "flex items-center justify-center aspect-square text-sm sm:text-lg font-bold rounded-md transition-colors duration-200",
                  "cursor-pointer",
                  isCellFound(r, c) ? "bg-accent text-accent-foreground" :
                  isCellSelected(r, c) ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-secondary"
                )}
                onMouseDown={() => handleMouseDown(r, c)}
                onMouseEnter={() => handleMouseEnter(r, c)}
              >
                {letter}
              </div>
            ))
          )}
        </div>
      </Card>
      <div className="w-full md:w-56">
        <h2 className="font-headline text-2xl mb-4">Palabras a encontrar:</h2>
        <ul className="space-y-2">
          {WORDS.map(word => (
            <li key={word} className={cn("text-lg font-body transition-colors", foundWords.includes(word) ? "line-through text-muted-foreground" : "text-foreground")}>
              {word}
            </li>
          ))}
        </ul>
        <Button onClick={resetGame} variant="outline" className="mt-8 w-full">Reiniciar Juego</Button>
      </div>

      <AlertDialog open={isComplete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <PartyPopper className="text-accent" />
              ¡Felicidades, mi vida!
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¡Has encontrado todas las palabras! Eres la mejor en esto, como en todo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleNext}>
              {getNextGamePath('/word-search') ? 'Siguiente Juego' : 'Volver al Menú'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
