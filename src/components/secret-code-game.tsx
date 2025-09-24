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
import { Heart } from 'lucide-react';
import { useGameProgress } from '@/hooks/use-game-progress';
import { useRouter } from 'next/navigation';

const SECRET_CODE = '¿Quieres ser mi novia?';
const GRID_SIZE = 15;
const CHARS = 'ABCDEF0123456789*#@&?¿!¡';

const generateCodeGrid = () => {
  const grid = Array.from({ length: GRID_SIZE*GRID_SIZE }, () => CHARS[Math.floor(Math.random() * CHARS.length)]);
  const startPos = Math.floor(Math.random() * (grid.length - SECRET_CODE.length));
  for(let i=0; i < SECRET_CODE.length; i++) {
    grid[startPos + i] = SECRET_CODE[i];
  }
  return grid.join('');
};

const FormSchema = z.object({
  code: z.string().min(1, 'La clave no puede estar vacía.'),
});
type FormData = z.infer<typeof FormSchema>;

export function SecretCodeGame() {
  const [isRevealed, setIsRevealed] = useState(false);
  const { completeGame, getNextGamePath } = useGameProgress();
  const router = useRouter();

  const codeGrid = useMemo(() => generateCodeGrid(), []);

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: { code: '' },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    const formattedInput = data.code.trim();
    if (formattedInput.toLowerCase() === SECRET_CODE.toLowerCase()) {
      completeGame('/secret-code');
      setIsRevealed(true);
    } else {
      form.setError('code', {
        type: 'manual',
        message: 'Clave incorrecta. ¡Sigue buscando!',
      });
    }
  };
  
  const resetGame = () => {
    setIsRevealed(false);
    form.reset();
  }

  const handleNext = () => {
    const nextGame = getNextGamePath('/secret-code');
    if (nextGame) {
      router.push(nextGame);
    } else {
      router.push('/');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Descifra el mensaje</CardTitle>
          <CardDescription>
            Hay una clave secreta escondida en el texto de abajo. Encuéntrala y escríbela para revelar un mensaje especial.
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
                      <Input placeholder="Escribe la clave aquí..." {...field} />
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
      <AlertDialog open={isRevealed}>
        <AlertDialogContent>
          <AlertDialogHeader className="items-center text-center">
            <Heart className="size-12 text-destructive animate-pulse" />
            <AlertDialogTitle className="text-3xl font-headline mt-4">
              {SECRET_CODE} ❤️
            </AlertDialogTitle>
            <AlertDialogDescription className="text-lg">
              ¡Has descifrado el código de mi corazón! Eres la mejor detective y la mejor novia.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleNext}>
              {getNextGamePath('/secret-code') ? 'Siguiente Juego' : 'Finalizar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
