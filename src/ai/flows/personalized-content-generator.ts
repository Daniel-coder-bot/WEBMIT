'use server';

/**
 * @fileOverview Generates personalized content (questions, messages) for the Amor Games to make the experience tailored and unique.
 *
 * - personalizeContent - A function that generates personalized content for the games.
 * - PersonalizedContentInput - The input type for the personalizeContent function.
 * - PersonalizedContentOutput - The return type for the personalizeContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedContentInputSchema = z.object({
  gameType: z.enum([
    'wordSearch',
    'personalQuestion',
    'photoMemory',
    'quizGame',
    'secretCode',
  ]).describe('The type of game for which content is being generated.'),
  userRelationshipDetails: z
    .string()
    .describe(
      'Details about the user relationship to personalize the content. For example, common memories, interests, etc.'
    ),
});
export type PersonalizedContentInput = z.infer<
  typeof PersonalizedContentInputSchema
>;

const PersonalizedContentOutputSchema = z.object({
  content: z
    .string()
    .describe('The personalized content for the specified game type.'),
});
export type PersonalizedContentOutput = z.infer<
  typeof PersonalizedContentOutputSchema
>;

export async function personalizeContent(
  input: PersonalizedContentInput
): Promise<PersonalizedContentOutput> {
  return personalizedContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedContentPrompt',
  input: {schema: PersonalizedContentInputSchema},
  output: {schema: PersonalizedContentOutputSchema},
  prompt: `You are an AI content generator specializing in creating personalized content for various games.

  Based on the game type and user relationship details, generate unique and tailored content to enhance the user experience.

  Game Type: {{{gameType}}}
  User Relationship Details: {{{userRelationshipDetails}}}

  Content:`,
});

const personalizedContentFlow = ai.defineFlow(
  {
    name: 'personalizedContentFlow',
    inputSchema: PersonalizedContentInputSchema,
    outputSchema: PersonalizedContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
