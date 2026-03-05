'use server';
/**
 * @fileOverview An AI agent that suggests concise descriptions and relevant tags for new Nuclei.
 *
 * - suggestNucleusDescription - A function that handles the nucleus description suggestion process.
 * - SuggestNucleusDescriptionInput - The input type for the suggestNucleusDescription function.
 * - SuggestNucleusDescriptionOutput - The return type for the suggestNucleusDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestNucleusDescriptionInputSchema = z.object({
  nucleusName: z
    .string()
    .optional()
    .describe('The name of the Nucleus for which to suggest descriptions/tags.'),
  intendedPurpose: z
    .string()
    .optional()
    .describe('The intended purpose or function of the Nucleus.'),
});
export type SuggestNucleusDescriptionInput = z.infer<
  typeof SuggestNucleusDescriptionInputSchema
>;

const SuggestNucleusDescriptionOutputSchema = z.object({
  conciseDescription: z
    .string()
    .describe('A concise, single-sentence description for the Nucleus.'),
  tags: z
    .array(z.string())
    .describe('An array of relevant tags for the Nucleus.'),
});
export type SuggestNucleusDescriptionOutput = z.infer<
  typeof SuggestNucleusDescriptionOutputSchema
>;

export async function suggestNucleusDescription(
  input: SuggestNucleusDescriptionInput
): Promise<SuggestNucleusDescriptionOutput> {
  return suggestNucleusDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestNucleusDescriptionPrompt',
  input: {schema: SuggestNucleusDescriptionInputSchema},
  output: {schema: SuggestNucleusDescriptionOutputSchema},
  prompt: `You are an AI assistant specialized in generating concise descriptions and relevant tags for system components called 'Nuclei'.

Based on the provided information, generate:
1. A single, concise sentence that describes the Nucleus.
2. A list of 3-5 relevant, comma-separated tags.

Only output the JSON object as specified by the output schema.

{{#if nucleusName}}
Nucleus Name: {{{nucleusName}}}
{{/if}}
{{#if intendedPurpose}}
Intended Purpose: {{{intendedPurpose}}}
{{/if}}

`,
});

const suggestNucleusDescriptionFlow = ai.defineFlow(
  {
    name: 'suggestNucleusDescriptionFlow',
    inputSchema: SuggestNucleusDescriptionInputSchema,
    outputSchema: SuggestNucleusDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
