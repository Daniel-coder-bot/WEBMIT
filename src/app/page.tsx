import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const games = [
  { name: 'Sopa de Letras', path: '/word-search', description: 'Encuentra las palabras secretas.' },
  { name: 'Pregunta Personal', path: '/personal-question', description: '¿Qué tanto sabes de mí?' },
  { name: 'Memorama de Fotos', path: '/photo-memory', description: 'Encuentra todos los pares.' },
  { name: 'Quiz Romántico', path: '/quiz', description: 'Un quiz sobre nosotros.' },
  { name: 'Clave Secreta', path: '/secret-code', description: 'Descifra el mensaje oculto.' },
];

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 font-body">
      <Card className="w-full max-w-md animate-in fade-in-50 slide-in-from-bottom-5 duration-500">
        <CardHeader className="items-center text-center">
          <Heart className="size-12 text-accent" />
          <CardTitle className="font-headline text-4xl mt-2">
            Amor Games
          </CardTitle>
          <CardDescription className="font-body text-base">
            Una colección de juegos para nosotros.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {games.map((game) => (
              <Button
                key={game.path}
                variant="default"
                size="lg"
                className="h-auto w-full justify-start text-left"
                asChild
              >
                <Link href={game.path}>
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold">{game.name}</span>
                    <span className="text-sm font-normal text-primary-foreground/80">{game.description}</span>
                  </div>
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
