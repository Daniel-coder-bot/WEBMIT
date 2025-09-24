'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Heart, PartyPopper } from 'lucide-react';
import { useGameProgress } from '@/hooks/use-game-progress';
import { useRouter } from 'next/navigation';

type CardData = {
  id: number;
  imageId: string;
  imageUrl: string;
  isFlipped: boolean;
  isMatched: boolean;
};

const shuffleArray = (array: any[]) => {
  return array.sort(() => Math.random() - 0.5);
};

const generateCards = (): CardData[] => {
  const gameImages = PlaceHolderImages.slice(0, 6);
  const cardPairs = [...gameImages, ...gameImages];
  return shuffleArray(cardPairs).map((image, index) => ({
    id: index,
    imageId: image.id,
    imageUrl: image.imageUrl,
    isFlipped: false,
    isMatched: false,
  }));
};

export function PhotoMemoryGame() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [moves, setMoves] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const { completeGame, getNextGamePath } = useGameProgress();
  const router = useRouter();

  useEffect(() => {
    setCards(generateCards());
  }, []);

  const handleCardClick = (cardId: number) => {
    if (isChecking || flippedCards.includes(cardId) || cards[cardId].isMatched) {
      return;
    }

    const newCards = [...cards];
    newCards[cardId].isFlipped = true;
    setCards(newCards);

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(moves + 1);
      setIsChecking(true);
      const [firstCardId, secondCardId] = newFlippedCards;
      if (newCards[firstCardId].imageId === newCards[secondCardId].imageId) {
        // Match
        newCards[firstCardId].isMatched = true;
        newCards[secondCardId].isMatched = true;
        setCards(newCards);
        setFlippedCards([]);
        setIsChecking(false);
        if (newCards.every(card => card.isMatched)) {
          completeGame('/photo-memory');
          setTimeout(() => setIsComplete(true), 500);
        }
      } else {
        // No match
        setTimeout(() => {
          newCards[firstCardId].isFlipped = false;
          newCards[secondCardId].isFlipped = false;
          setCards(newCards);
          setFlippedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };
  
  const resetGame = () => {
    setCards(generateCards());
    setFlippedCards([]);
    setIsChecking(false);
    setMoves(0);
    setIsComplete(false);
  }

  const handleNext = () => {
    const nextGame = getNextGamePath('/photo-memory');
    if (nextGame) {
      router.push(nextGame);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-4">
        {cards.map(card => (
          <div
            key={card.id}
            className="aspect-square rounded-lg cursor-pointer [perspective:1000px]"
            onClick={() => handleCardClick(card.id)}
          >
            <div
              className={cn(
                "relative w-full h-full rounded-lg shadow-md [transform-style:preserve-3d] transition-transform duration-700",
                (card.isFlipped || card.isMatched) && "[transform:rotateY(180deg)]"
              )}
            >
              <div className="absolute w-full h-full rounded-lg bg-primary flex items-center justify-center [backface-visibility:hidden]">
                 <Heart className="size-1/2 text-primary-foreground/50"/>
              </div>
              <div className="absolute w-full h-full rounded-lg bg-card [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <Image
                  src={card.imageUrl}
                  alt={`Memory card ${card.imageId}`}
                  data-ai-hint={PlaceHolderImages.find(img => img.id === card.imageId)?.imageHint}
                  fill
                  className="object-cover rounded-lg"
                  sizes="(max-width: 768px) 33vw, 25vw"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
       <div className="flex items-center gap-4">
        <p className="font-semibold text-lg">Movimientos: {moves}</p>
        <Button onClick={resetGame} variant="outline">Reiniciar</Button>
      </div>
      <AlertDialog open={isComplete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <PartyPopper className="text-accent" />
              ¡Memoria de campeona!
            </AlertDialogTitle>
            <AlertDialogDescription>
             ¡Excelente! Tienes una memoria tan brillante como tú. Lo hiciste en {moves} movimientos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
             <AlertDialogAction onClick={handleNext}>
              {getNextGamePath('/photo-memory') ? 'Siguiente Juego' : 'Volver al Menú'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
