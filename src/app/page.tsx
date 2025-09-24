'use client';

import Link from 'next/link';
import { Heart, CheckCircle2, Lock, Cat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { GameProgressProvider, useGameProgressClient } from '@/components/game-progress-provider';

const games = [
  { name: 'Sopa de Letras', path: '/word-search', description: 'Encuentra las palabras secretas.' },
  { name: 'Pregunta Personal', path: '/personal-question', description: '¿Qué tanto sabes de mí?' },
  { name: 'Memorama de Fotos', path: '/photo-memory', description: 'Encuentra todos los pares.' },
  { name: 'Quiz Romántico', path: '/quiz', description: 'Un quiz sobre nosotros.' },
  { name: 'Clave Secreta', path: '/secret-code', description: 'Descifra el mensaje oculto.' },
];

function GameList() {
  const { isUnlocked, completedGames, isLoading } = useGameProgressClient();
  
  return (
    <Card className="w-full max-w-md animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
      <CardHeader className="items-center text-center">
        <div className="flex gap-4">
          <Heart className="size-12 text-accent" />
          <Cat className="size-12 text-accent" />
        </div>
        <CardTitle className="font-headline text-4xl mt-2">
          Amor Games
        </CardTitle>
        <CardDescription className="font-body text-base">
          Una colección de juegos para nosotros.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {isLoading ? (
            <p className="text-center">Cargando progreso...</p>
          ) : (
            games.map((game) => {
              const unlocked = isUnlocked(game.path);
              const completed = completedGames.includes(game.path);

              return (
                <Button
                  key={game.path}
                  variant="default"
                  size="lg"
                  className={cn(
                    "h-auto w-full justify-start text-left relative",
                    !unlocked && "bg-muted text-muted-foreground hover:bg-muted cursor-not-allowed",
                    completed && "bg-green-100 dark:bg-green-900/50 hover:bg-green-100/90"
                  )}
                  asChild={unlocked}
                  disabled={!unlocked}
                >
                  <Link href={unlocked ? game.path : '#'}>
                    <div className="flex flex-col flex-grow">
                      <span className="text-lg font-semibold">{game.name}</span>
                      <span className={cn("text-sm font-normal", unlocked ? "text-primary-foreground/80" : "text-muted-foreground")}>{game.description}</span>
                    </div>
                     <div className="ml-4">
                      {completed ? (
                        <CheckCircle2 className="size-6 text-green-600 dark:text-green-400" />
                      ) : !unlocked ? (
                        <Lock className="size-6" />
                      ) : null}
                    </div>
                  </Link>
                </Button>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function Home() {
  return (
    <GameProgressProvider>
      <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 font-body">
        <GameList />
      </main>
    </GameProgressProvider>
  );
}
