'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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

const questions = [
  {
    question: '¿Dónde fue nuestra primera cita?',
    options: ['En el cine 🎬', 'En Insurgentes por un helado 🍦', 'En un museo 🖼️'],
    correctAnswers: [1],
  },
  {
    question: '¿Cuál es mi comida favorita?',
    options: ['Pizza 🍕', 'Tacos 🌮', 'Sushi 🍣'],
    correctAnswers: [2],
  },
  {
    question: '¿Qué animal tendría si pudiera elegir?',
    options: ['Gatos 🐱', 'Perros 🐶', 'Conejos 🐇'],
    correctAnswers: [1],
  },
  {
    question: '¿Qué palabra uso mucho contigo?',
    options: ['Te amo ❤️', 'Oye 🙃', 'Mitzy 💖'],
    correctAnswers: [0, 2],
  },
  {
    question: 'Si vamos a un museo, ¿qué es lo que más disfruto?',
    options: ['Ver las pinturas 🖌️', 'Comprar recuerdos 🎁', 'Tomar fotos 📸'],
    correctAnswers: [2],
  },
  {
    question: '¿Qué me gusta leer más?',
    options: ['Libros 📚', 'Revistas', 'Comics'],
    correctAnswers: [0],
  },
  {
    question: 'Una frase de un escritor famoso que me recuerda a ti:',
    options: [
      '"Amar no es mirarse el uno al otro; es mirar juntos en la misma dirección." – Antoine de Saint-Exupéry',
      '"La amistad es un alma que habita en dos cuerpos." – Aristóteles',
      '"Donde hay amor, hay vida." – Mahatma Gandhi',
    ],
    correctAnswers: [0],
  },
];

export function QuizGame() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showScore, setShowScore] = useState(false);
  const { completeGame, getNextGamePath } = useGameProgress();
  const router = useRouter();

  const handleAnswerClick = (answerIndex: number) => {
    if (isAnswered) return;

    setSelectedAnswer(answerIndex);
    setIsAnswered(true);

    if (questions[currentQuestionIndex].correctAnswers.includes(answerIndex)) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      completeGame('/quiz');
      setShowScore(true);
    }
  };
  
  const resetGame = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setShowScore(false);
  }

  const handleNext = () => {
    const nextGame = getNextGamePath('/quiz');
    if (nextGame) {
      router.push(nextGame);
    } else {
      router.push('/');
    }
  };

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  if (showScore) {
    return (
      <AlertDialog open={showScore}>
        <AlertDialogContent>
          <AlertDialogHeader className="items-center text-center">
            <PartyPopper className="text-accent size-12" />
            <AlertDialogTitle className="font-headline text-3xl">¡Juego Terminado!</AlertDialogTitle>
            <AlertDialogDescription className="text-xl space-y-4">
              <p>Obtuviste {score} de {questions.length} correctas ❤️</p>
              <p>¡Eres increíble! Gracias por conocerme tanto ❤️</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogAction onClick={handleNext}>
               {getNextGamePath('/quiz') ? 'Siguiente Juego' : 'Volver al Menú'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <Progress value={progress} className="w-full mb-4" />
        <CardTitle className="font-headline text-2xl">Pregunta {currentQuestionIndex + 1}</CardTitle>
        <CardDescription className="text-lg min-h-[3em]">
          {questions[currentQuestionIndex].question}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          {questions[currentQuestionIndex].options.map((option, index) => {
            const isCorrect = questions[currentQuestionIndex].correctAnswers.includes(index);
            const isSelected = selectedAnswer === index;
            
            return (
              <Button
                key={index}
                onClick={() => handleAnswerClick(index)}
                disabled={isAnswered}
                variant="outline"
                size="lg"
                className={cn(
                  "h-auto text-wrap justify-start text-left",
                  isAnswered && isCorrect && "bg-green-200 border-green-400 text-green-900 hover:bg-green-200",
                  isAnswered && isSelected && !isCorrect && "bg-red-200 border-red-400 text-red-900 hover:bg-red-200",
                  "dark:bg-card dark:hover:bg-muted",
                  isAnswered && isCorrect && "dark:bg-green-800/50 dark:text-green-200 dark:border-green-700",
                  isAnswered && isSelected && !isCorrect && "dark:bg-red-800/50 dark:text-red-200 dark:border-red-700",
                )}
              >
                {option}
              </Button>
            )
          })}
        </div>
        {isAnswered && (
          <div className="flex justify-end mt-6">
            <Button onClick={handleNextQuestion}>
              {currentQuestionIndex < questions.length - 1 ? 'Siguiente Pregunta' : 'Ver Puntuación'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
