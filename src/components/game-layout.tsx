import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowLeft, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

type GameLayoutProps = {
  title: string;
  children: ReactNode;
};

export function GameLayout({ title, children }: GameLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center bg-background p-4 font-body sm:p-8">
      <div className="w-full max-w-4xl animate-in fade-in-50 duration-500">
        <header className="relative mb-8 flex items-center justify-center">
          <Button variant="ghost" size="icon" className="absolute left-0 top-1/2 -translate-y-1/2" asChild>
            <Link href="/">
              <ArrowLeft className="size-6" />
              <span className="sr-only">Volver al menú</span>
            </Link>
          </Button>
          <h1 className="font-headline text-3xl text-center sm:text-4xl flex items-center gap-2">
            <Heart className="text-accent size-7 hidden sm:block" />
            {title}
            <Heart className="text-accent size-7 hidden sm:block" />
          </h1>
        </header>
        <main className="w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
