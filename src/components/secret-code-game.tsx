'use client';

import { useState, useMemo } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Heart, Mail } from 'lucide-react';
import { useGameProgress } from '@/hooks/use-game-progress';
import { useRouter } from 'next/navigation';

const SECRET_CODE = 'GATITOS';
const GRID_SIZE = 15;
const CHARS = 'ABCDEF0123456789*#@&?¿!¡';

const generateCodeGrid = () => {
  const grid = Array.from({ length: GRID_SIZE * GRID_SIZE }, () => CHARS[Math.floor(Math.random() * CHARS.length)]);
  const codeToHide = 'GATITOS';
  const startPos = Math.floor(Math.random() * (grid.length - codeToHide.length));
  for (let i = 0; i < codeToHide.length; i++) {
    grid[startPos + i] = codeToHide[i];
  }
  return grid.join('');
};

const FormSchema = z.object({
  code: z.string().min(1, 'La clave no puede estar vacía.'),
});
type FormData = z.infer<typeof FormSchema>;

type GameState = 'find_code' | 'show_letter' | 'show_question' | 'final_confirmation';

export function SecretCodeGame() {
  const [gameState, setGameState] = useState<GameState>('find_code');
  const { completeGame, getNextGamePath } = useGameProgress();
  const router = useRouter();

  const codeGrid = useMemo(() => generateCodeGrid(), []);

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: { code: '' },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const formattedInput = data.code.trim().toUpperCase();
    if (formattedInput === SECRET_CODE) {
      completeGame('/secret-code');
      setGameState('show_letter');
    } else {
      form.setError('code', {
        type: 'manual',
        message: 'Clave incorrecta. ¡Sigue buscando, tiene que ver con algo que amamos!',
      });
    }
  };

  const handleShowQuestion = () => {
    setGameState('show_question');
  };

  const handleFinalConfirmation = () => {
    setGameState('final_confirmation');
  }

  const handleNext = () => {
    const nextGame = getNextGamePath('/secret-code');
    if (nextGame) {
      router.push(nextGame);
    } else {
      router.push('/');
    }
  };

  if (gameState === 'find_code') {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Descifra el mensaje</CardTitle>
            <CardDescription>
              Hay una palabra secreta escondida en el texto de abajo. Encuéntrala y escríbela para revelar un mensaje especial.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-muted rounded-md font-code text-sm break-all leading-relaxed tracking-widest h-48 overflow-y-auto">
              {codeGrid}
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clave Secreta</FormLabel>
                      <FormControl>
                        <Input placeholder="Una de nuestras cosas favoritas..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">Confirmar</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameState === 'show_letter') {
     return (
      <AlertDialog open={true}>
        <AlertDialogContent>
          <AlertDialogHeader className="items-center text-center">
            <Mail className="size-12 text-accent" />
            <AlertDialogTitle className="text-3xl font-headline mt-4">
              ¡Descifraste el código!
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg text-left space-y-4 p-4">
              <p>Mi amor,</p>
              <p>Si estás leyendo esto, es porque una vez más demostraste lo increíble que eres. Cada día a tu lado ha sido una aventura, un descubrimiento, una razón para sonreír. Hemos compartido risas, sueños, y uno que otro secreto (como este).</p>
              <p>Me has enseñado tanto sobre el amor, la paciencia y sobre cómo encontrar la felicidad en los pequeños detalles, como en el ronroneo de un gatito. Por todo eso y más, tengo una última pregunta para ti...</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleShowQuestion}>
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
     )
  }
  
  if (gameState === 'show_question') {
    return (
      <AlertDialog open={true}>
        <AlertDialogContent>
          <AlertDialogHeader className="items-center text-center">
            <Heart className="size-12 text-destructive animate-pulse" />
            <AlertDialogTitle className="text-3xl font-headline mt-4">
              ¿Quieres ser mi novia?
            </AlertDialogTitle>
             <AlertDialogDescription className="text-lg">
              Elige tu respuesta:
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-col sm:justify-center gap-2 w-full">
            <Button onClick={handleFinalConfirmation} size="lg" className="w-full">Sí, acepto ❤️</Button>
            <Button onClick={handleFinalConfirmation} size="lg" className="w-full">Claro que sí, mi amor ✨</Button>
            <Button onClick={handleFinalConfirmation} size="lg" className="w-full">Obvio, ¡ya era hora! 🥰</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  if (gameState === 'final_confirmation') {
    return (
       <AlertDialog open={true}>
        <AlertDialogContent>
          <AlertDialogHeader className="items-center text-center">
            <Heart className="size-12 text-destructive animate-pulse" />
            <AlertDialogTitle className="text-3xl font-headline mt-4">
              ¡Dijo que sí! ❤️
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg">
              Oficialmente eres la mejor novia del universo. ¡Te amo!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleNext}>
              {getNextGamePath('/secret-code') ? 'Siguiente Juego' : 'Finalizar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }
  
  return null;
}
