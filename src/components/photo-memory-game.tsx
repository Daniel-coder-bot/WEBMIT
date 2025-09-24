'use client';

import { useState, useEffect } from 'react';
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

// This function now runs on the client and is stable
const createShuffledCards = (): CardData[] => {
  const imagePool = PlaceHolderImages;
  
  // Shuffle images and pick 5
  const shuffledImages = [...imagePool].sort(() => 0.5 - Math.random());
  const selectedImages = shuffledImages.slice(0, 5);

  // Create pairs
  const cardPairs = [...selectedImages, ...selectedImages];

  // Shuffle pairs and map to CardData
  return cardPairs
    .sort(() => 0.5 - Math.random())
    .map((imageData, index) => ({
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
    setCards(createShuffledCards());
  }, []);

  const handleCardClick = (cardIndex: number) => {
    // If checking, card already flipped/matched, or 2 cards already open, do nothing
    if (isChecking || cards[cardIndex].isFlipped || flippedCards.length === 2) {
      return;
    }

    const newFlippedCards = [...flippedCards, cardIndex];
    setFlippedCards(newFlippedCards);

    // Flip the card visually
    const newCards = [...cards];
    newCards[cardIndex].isFlipped = true;
    setCards(newCards);

    // If two cards are flipped, check for a match
    if (newFlippedCards.length === 2) {
      setIsChecking(true);
      setMoves(prev => prev + 1);

      const [firstIndex, secondIndex] = newFlippedCards;
      const card1 = cards[firstIndex];
      const card2 = cards[secondIndex];

      if (card1.imageId === card2.imageId) {
        // It's a match!
        const matchedCards = cards.map((card, index) => {
          if (index === firstIndex || index === secondIndex) {
            return { ...card, isMatched: true };
          }
          return card;
        });
        
        // Check for win condition
        if (matchedCards.every(card => card.isMatched)) {
          completeGame('/photo-memory');
          setTimeout(() => setIsComplete(true), 600);
        }
        
        setCards(matchedCards);
        setFlippedCards([]);
        setIsChecking(false);

      } else {
        // Not a match, flip them back after a delay
        setTimeout(() => {
          const flippedBackCards = cards.map((card, index) => {
            if (index === firstIndex || index === secondIndex) {
              return { ...card, isFlipped: false };
            }
            return card;
          });
          setCards(flippedBackCards);
          setFlippedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };
  
  const resetGame = () => {
    setCards(createShuffledCards());
    setFlippedCards([]);
    setIsChecking(false);
    setMoves(0);
    setIsComplete(false);
  }

  const handleNext = () => {
    const nextGame = getNextGamePath('/photo-memory');
    router.push(nextGame ?? '/');
  };
  
  return (
    <div className="flex flex-col items-center gap-8">
       {cards.length === 0 ? (
        <div className="text-center p-8">Generando memorama...</div>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-4 max-w-lg mx-auto p-4">
          {cards.map((card, index) => (
            <div
              key={card.id}
              className="aspect-square rounded-lg cursor-pointer [perspective:1000px]"
              onClick={() => handleCardClick(index)}
            >
              <div
                className={cn(
                  "relative w-full h-full rounded-lg shadow-md [transform-style:preserve-3d] transition-transform duration-700",
                  card.isFlipped && "[transform:rotateY(180deg)]"
                )}
              >
                {/* Card Back */}
                <div className="absolute w-full h-full rounded-lg bg-primary flex items-center justify-center [backface-visibility:hidden]">
                   <Cat className="size-1/2 text-primary-foreground/50"/>
                </div>
                {/* Card Front */}
                <div className="absolute w-full h-full rounded-lg bg-card p-1 [backface-visibility:hidden] [transform:rotateY(180deg)] overflow-hidden">
                  <Image
                      src={card.imageUrl}
                      alt={card.imageHint}
                      fill
                      sizes="10vw"
                      className="object-cover"
                      data-ai-hint={card.imageHint}
                    />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
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
