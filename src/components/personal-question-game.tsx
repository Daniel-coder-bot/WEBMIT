'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { personalizeContent } from '@/ai/flows/personalized-content-generator';
import { useGameProgress } from '@/hooks/use-game-progress';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Loader2, Sparkles, PartyPopper } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const FormSchema = z.object({
  answer: z.string().min(1, 'La respuesta no puede estar vacía.'),
});

type FormData = z.infer<typeof FormSchema>;

const CORRECT_ANSWER = '11/agosto/2004';

export function PersonalQuestionGame() {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [aiQuestion, setAiQuestion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { toast } = useToast();
  const { completeGame, getNextGamePath } = useGameProgress();
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: { answer: '' },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    if (data.answer.toLowerCase().trim() === CORRECT_ANSWER) {
      setFeedback('¡Correcto! Sabes mucho de mí. ❤️');
      completeGame('/personal-question');
      setIsComplete(true);
    } else {
      setFeedback('Intenta otra vez. ¡Tú puedes!');
    }
  };

  const handleGenerateQuestion = async () => {
    setIsLoading(true);
    setAiQuestion(null);
    try {
      const result = await personalizeContent({
        gameType: 'personalQuestion',
        userRelationshipDetails: 'Una pareja romántica que disfruta de los museos, los gatos, los libros y pasar tiempo juntos. Genera una pregunta abierta y cariñosa sobre un recuerdo o sentimiento compartido.',
      });
      setAiQuestion(result.content);
    } catch (error) {
      console.error('Error generating AI question:', error);
      toast({
        variant: 'destructive',
        title: 'Error de IA',
        description: 'No se pudo generar una pregunta. Por favor, inténtalo de nuevo.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    const nextGame = getNextGamePath('/personal-question');
    if (nextGame) {
      router.push(nextGame);
    } else {
      router.push('/');
    }
  };


  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Un pequeño test...</CardTitle>
          <CardDescription>¿Cuál es mi fecha de nacimiento?</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="answer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tu respuesta</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 01/enero/2000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">Confirmar</Button>
            </form>
          </Form>
          {feedback && (
            <p className="mt-4 text-center font-semibold text-lg">{feedback}</p>
          )}
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="text-accent" />
            Sorpresa de IA
          </CardTitle>
          <CardDescription>Genera una pregunta especial solo para ustedes dos.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <Button onClick={handleGenerateQuestion} disabled={isLoading} variant="outline">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              'Generar pregunta con IA'
            )}
          </Button>
          {aiQuestion && (
            <blockquote className="mt-4 border-l-2 border-accent pl-6 italic text-center">
              "{aiQuestion}"
            </blockquote>
          )}
        </CardContent>
      </Card>

       <AlertDialog open={isComplete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <PartyPopper className="text-accent" />
              ¡Respuesta Correcta, mi amor!
            </AlertDialogTitle>
            <AlertDialogDescription>
              Conocerme tan bien es el mejor regalo. ¡Sigamos con la diversión!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleNext}>
              {getNextGamePath('/personal-question') ? 'Siguiente Juego' : 'Volver al Menú'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
