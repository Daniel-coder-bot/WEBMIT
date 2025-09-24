'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { useGameProgress } from '@/hooks/use-game-progress';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PartyPopper } from 'lucide-react';

type Card = {
  id: string; // Unique ID for each card instance
  pairId: string; // ID to match pairs
  imageUrl: string;
  imageHint: string;
  isFlipped: boolean;
  isMatched: boolean;
};

const shuffleArray = (array: any[]) => {
  return array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
};

export function PhotoMemoryGame() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const { completeGame, getNextGamePath } = useGameProgress();
  const router = useRouter();

  useEffect(() => {
    // Generate cards on client side
    const gameImages = PlaceHolderImages.slice(0, 5); // Use 5 pairs
    const initialCards = gameImages.flatMap((image, index) => {
      const pairId = image.id;
      return [
        { id: `${pairId}-a`, pairId, imageUrl: image.imageUrl, imageHint: image.imageHint, isFlipped: false, isMatched: false },
        { id: `${pairId}-b`, pairId, imageUrl: image.imageUrl, imageHint: image.imageHint, isFlipped: false, isMatched: false },
      ];
    });
    setCards(shuffleArray(initialCards));
  }, []);

  const handleCardClick = (index: number) => {
    if (isChecking || cards[index].isFlipped || cards[index].isMatched || flippedCards.length === 2) {
      return;
    }

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlippedCards = [...flippedCards, index];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(moves + 1);
      setIsChecking(true);
      const [firstIndex, secondIndex] = newFlippedCards;
      if (newCards[firstIndex].pairId === newCards[secondIndex].pairId) {
        // It's a match
        newCards[firstIndex].isMatched = true;
        newCards[secondIndex].isMatched = true;
        setFlippedCards([]);
        setIsChecking(false);
        const allMatched = newCards.every(card => card.isMatched);
        if (allMatched) {
          completeGame('/photo-memory');
          setIsComplete(true);
        }
      } else {
        // Not a match, flip back after a delay
        setTimeout(() => {
          newCards[firstIndex].isFlipped = false;
          newCards[secondIndex].isFlipped = false;
          setCards([...newCards]); // Force re-render with new array
          setFlippedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };

  const handleNext = () => {
    const nextGame = getNextGamePath('/photo-memory');
    if (nextGame) {
      router.push(nextGame);
    } else {
      router.push('/');
    }
  };

  if (cards.length === 0) {
    return <p className="text-center">Cargando juego de memoria...</p>;
  }

  return (
    <>
      <div className="flex flex-col items-center gap-4">
        <p className="text-xl font-semibold">Movimientos: {moves}</p>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
          {cards.map((card, index) => (
            <div
              key={card.id}
              className="aspect-square w-24 h-24 sm:w-32 sm:h-32 [perspective:1000px] cursor-pointer"
              onClick={() => handleCardClick(index)}
            >
              <div
                className={cn(
                  'relative w-full h-full [transform-style:preserve-3d] transition-transform duration-500',
                  card.isFlipped || card.isMatched ? '[transform:rotateY(180deg)]' : ''
                )}
              >
                <div className="absolute w-full h-full [backface-visibility:hidden] bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-4xl text-primary-foreground">❤️</span>
                </div>
                <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-card rounded-lg overflow-hidden">
                  <Image
                    src={card.imageUrl}
                    alt={card.imageHint}
                    fill
                    sizes="(max-width: 640px) 25vw, 20vw"
                    className="object-cover"
                    data-ai-hint={card.imageHint}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AlertDialog open={isComplete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <PartyPopper className="text-accent" />
              ¡Encontraste todos los pares!
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tu memoria es tan increíble como tú. ¡Gracias por jugar, mi amor!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleNext}>
              {getNextGamePath('/photo-memory') ? 'Siguiente Juego' : 'Volver al Menú'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
