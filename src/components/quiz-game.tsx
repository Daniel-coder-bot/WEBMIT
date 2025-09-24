'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const questions = [
  {
    question: '¿Dónde fue nuestra primera cita "oficial"?',
    options: ['Un museo de arte', 'Un café con gatos', 'Una librería antigua'],
    correctAnswer: 0,
  },
  {
    question: '¿Cuál de estos es mi lenguaje de amor principal?',
    options: ['Palabras de afirmación', 'Tiempo de calidad', 'Actos de servicio'],
    correctAnswer: 1,
  },
  {
    question: 'Si pudieramos viajar a cualquier lugar ahora mismo, ¿cuál elegiría?',
    options: ['Una cabaña en el bosque', 'Un tour por museos de Europa', 'Una playa tranquila'],
    correctAnswer: 1,
  },
];

export function QuizGame() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showScore, setShowScore] = useState(false);

  const handleAnswerClick = (answerIndex: number) => {
    if (isAnswered) return;

    setSelectedAnswer(answerIndex);
    setIsAnswered(true);

    if (answerIndex === questions[currentQuestionIndex].correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
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

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  if (showScore) {
    return (
      <Card className="max-w-md mx-auto text-center">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">¡Juego Terminado!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xl">Tu puntuación final es:</p>
          <p className="text-5xl font-bold text-accent">{score} de {questions.length}</p>
          <Button onClick={resetGame} className="mt-4">Jugar de Nuevo</Button>
        </CardContent>
      </Card>
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
            const isCorrect = index === questions[currentQuestionIndex].correctAnswer;
            const isSelected = selectedAnswer === index;
            
            return (
              <Button
                key={index}
                onClick={() => handleAnswerClick(index)}
                disabled={isAnswered}
                variant="outline"
                size="lg"
                className={cn(
                  "h-auto text-wrap justify-start",
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
