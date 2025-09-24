'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
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
import { PartyPopper, Cat } from 'lucide-react';
import { useGameProgress } from '@/hooks/use-game-progress';
import { useRouter } from 'next/navigation';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type CardData = {
  id: number;
  imageId: string;
  imageUrl: string;
  imageHint: string;
  isFlipped: boolean;
  isMatched: boolean;
};

const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const generateInitialCards = (): CardData[] => {
    const selectedImages = shuffleArray([...PlaceHolderImages]).slice(0, 5);
    const cardPairs = [...selectedImages, ...selectedImages];
    return shuffleArray(cardPairs).map((imageData, index) => ({
      id: index,
      imageId: imageData.id,
      imageUrl: imageData.imageUrl,
      imageHint: imageData.imageHint,
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
    setCards(generateInitialCards());
  }, []);

  const handleCardClick = (cardId: number) => {
    if (isChecking || flippedCards.includes(cardId) || cards.find(c => c.id === cardId)?.isMatched) {
      return;
    }

    const newCards = cards.map(card => 
      card.id === cardId ? { ...card, isFlipped: true } : card
    );
    setCards(newCards);

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(moves + 1);
      setIsChecking(true);
      const [firstCardId, secondCardId] = newFlippedCards;
      const firstCard = newCards.find(c => c.id === firstCardId);
      const secondCard = newCards.find(c => c.id === secondCardId);

      if (firstCard && secondCard && firstCard.imageId === secondCard.imageId) {
        // Match
        setTimeout(() => {
            const matchedCards = newCards.map(card => 
                (card.id === firstCardId || card.id === secondCardId) 
                ? { ...card, isMatched: true, isFlipped: true } 
                : card
            );
            setCards(matchedCards);
            setFlippedCards([]);
            setIsChecking(false);
            if (matchedCards.every(card => card.isMatched)) {
                completeGame('/photo-memory');
                setTimeout(() => setIsComplete(true), 500);
            }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          const flippedBackCards = newCards.map(card =>
            (card.id === firstCardId || card.id === secondCardId)
            ? { ...card, isFlipped: false }
            : card
          )
          setCards(flippedBackCards);
          setFlippedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };
  
  const resetGame = () => {
    setCards(generateInitialCards());
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
  
  if (cards.length === 0) {
    return <div className="text-center">Generando memorama...</div>;
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-4 max-w-lg mx-auto">
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
                 <Cat className="size-1/2 text-primary-foreground/50"/>
              </div>
              <div className="absolute w-full h-full rounded-lg bg-card p-1 [backface-visibility:hidden] [transform:rotateY(180deg)] text-accent overflow-hidden">
                <Image
                    src={card.imageUrl}
                    alt={card.imageHint}
                    fill
                    className="object-cover"
                    data-ai-hint={card.imageHint}
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
