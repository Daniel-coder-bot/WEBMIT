'use client';

import { useState, useEffect, useRef } from 'react';
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
    let attempts = 0;
    while (attempts < 50) {
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const wordLength = word.length;
      
      let rowRange = GRID_SIZE;
      if (dir.dr !== 0) rowRange -= wordLength -1;
      
      let colRange = GRID_SIZE;
      if (dir.dc !== 0) colRange -= wordLength -1;
      
      if(rowRange <= 0 || colRange <= 0) continue;

      const startR = Math.floor(Math.random() * rowRange);
      const startC = Math.floor(Math.random() * colRange);

      let canPlace = true;
      for (let i = 0; i < word.length; i++) {
        const r = startR + i * dir.dr;
        const c = startC + i * dir.dc;
        if (grid[r][c] !== '' && grid[r][c] !== word[i]) {
          canPlace = false;
          break;
        }
      }

      if (canPlace) {
        for (let i = 0; i < word.length; i++) {
          const r = startR + i * dir.dr;
          const c = startC + i * dir.dc;
          grid[r][c] = word[i];
        }
        return true;
      }
      attempts++;
    }
    return false;
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
  const gridRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    setGrid(generateGrid());
    const endSelectionHandler = () => endSelection();
    window.addEventListener('mouseup', endSelectionHandler);
    window.addEventListener('touchend', endSelectionHandler);

    return () => {
      window.removeEventListener('mouseup', endSelectionHandler);
      window.removeEventListener('touchend', endSelectionHandler);
    };
  }, []);

  const cellKey = (r: number, c: number) => `${r}-${c}`;

  const isCellSelected = (r: number, c: number) =>
    selection.some(cell => cell.r === r && cell.c === c);

  const isCellFound = (r: number, c: number) => foundCells.has(cellKey(r, c));
  
  const getCellFromCoordinates = (x: number, y: number): Cell | null => {
    if (!gridRef.current) return null;
    const rect = gridRef.current.getBoundingClientRect();
    const size = rect.width / GRID_SIZE;
    const c = Math.floor((x - rect.left) / size);
    const r = Math.floor((y - rect.top) / size);
    if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
      return { r, c };
    }
    return null;
  };

  const startSelection = (cell: Cell | null) => {
    if (!cell) return;
    setIsSelecting(true);
    setSelection([cell]);
  };
  
  const moveSelection = (cell: Cell | null) => {
    if (!isSelecting || !cell) return;

    const start = selection[0];
    const newSelection: Cell[] = [start];
    
    // Check if the cell is the same as the last one to avoid unnecessary calculations
    if (selection.length > 1) {
      const last = selection[selection.length - 1];
      if (last.r === cell.r && last.c === cell.c) return;
    }

    // Determine direction
    const dr = Math.sign(cell.r - start.r);
    const dc = Math.sign(cell.c - start.c);
    
    // Only allow straight or diagonal lines
    if (dr !== 0 && dc !== 0 && Math.abs(cell.r - start.r) !== Math.abs(cell.c - start.c)) {
       // Not a valid line, could reset or just ignore
      return; 
    }
    
    const dist = Math.max(Math.abs(cell.r - start.r), Math.abs(cell.c - start.c));

    for (let i = 1; i <= dist; i++) {
      newSelection.push({ r: start.r + i * dr, c: start.c + i * dc });
    }
    setSelection(newSelection);
  };

  const endSelection = () => {
    if (!isSelecting || selection.length === 0) {
      setIsSelecting(false);
      return;
    };

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

  // Combined handlers for mouse and touch
  const handleInteractionStart = (r: number, c: number) => {
    startSelection({r,c});
  }

  const handleInteractionMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isSelecting) return;
    e.preventDefault(); // Prevent scrolling on touch

    let x, y;
    if ('touches' in e) {
      x = e.touches[0].clientX;
      y = e.touches[0].clientY;
    } else {
      x = e.clientX;
      y = e.clientY;
    }
    const cell = getCellFromCoordinates(x, y);
    moveSelection(cell);
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
    <div className="w-full flex flex-col items-center justify-center gap-8">
      <div className="w-full max-w-lg flex flex-col items-center gap-8 md:flex-row md:items-start">
        <Card className="p-2 sm:p-4 shadow-lg w-full max-w-md aspect-square">
          <div 
            ref={gridRef}
            className="grid gap-1 select-none w-full h-full" 
            style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
            onMouseLeave={() => isSelecting && endSelection()}
            onTouchMove={handleInteractionMove}
            onMouseMove={handleInteractionMove}
            onTouchEnd={endSelection}
            onMouseUp={endSelection}
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
                  onMouseDown={() => handleInteractionStart(r, c)}
                  onTouchStart={() => handleInteractionStart(r, c)}
                >
                  {letter}
                </div>
              ))
            )}
          </div>
        </Card>
        <div className="w-full md:w-56 flex-shrink-0">
          <h2 className="font-headline text-2xl mb-4 text-center md:text-left">Palabras a encontrar:</h2>
          <ul className="space-y-2 text-center md:text-left">
            {WORDS.map(word => (
              <li key={word} className={cn("text-lg font-body transition-colors", foundWords.includes(word) ? "line-through text-muted-foreground" : "text-foreground")}>
                {word}
              </li>
            ))}
          </ul>
          <Button onClick={resetGame} variant="outline" className="mt-8 w-full">Reiniciar Juego</Button>
        </div>
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
