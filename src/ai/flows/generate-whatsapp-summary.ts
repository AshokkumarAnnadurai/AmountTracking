
'use server';

/**
 * @fileOverview This file defines a Genkit flow to generate a summary of festival contributions, expenses, and programs for sharing via WhatsApp.
 *
 * - generateWhatsappSummary -  A function that generates the WhatsApp summary.
 * - GenerateWhatsappSummaryInput - The input type for the generateWhatsappSummary function.
 * - GenerateWhatsappSummaryOutput - The return type for the generateWhatsappSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWhatsappSummaryInputSchema = z.object({
  totalCollection: z.number().describe('The total amount collected.'),
  totalExpenses: z.number().describe('The total amount of expenses.'),
  remainingBalance: z.number().describe('The remaining balance after expenses.'),
  eventList: z.array(z.string()).describe('A list of cultural programs/events.'),
});
export type GenerateWhatsappSummaryInput = z.infer<typeof GenerateWhatsappSummaryInputSchema>;

const GenerateWhatsappSummaryOutputSchema = z.object({
  summary: z.string().describe('A formatted summary of collections, expenses, and events suitable for sharing via WhatsApp.'),
});
export type GenerateWhatsappSummaryOutput = z.infer<typeof GenerateWhatsappSummaryOutputSchema>;

export async function generateWhatsappSummary(input: GenerateWhatsappSummaryInput): Promise<GenerateWhatsappSummaryOutput> {
  return generateWhatsappSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWhatsappSummaryPrompt',
  input: {schema: GenerateWhatsappSummaryInputSchema},
  output: {schema: GenerateWhatsappSummaryOutputSchema},
  prompt: `You are an expert in creating concise and informative summaries for sharing on WhatsApp.

  Based on the following information about the village festival, create a summary that includes key details about collections, expenses, and upcoming events.
  The summary should be engaging and easy to understand for all villagers. Present the financial details in a neat tabular format.

  Total Collection: {{{totalCollection}}}
  Total Expenses: {{{totalExpenses}}}
  Remaining Balance: {{{remainingBalance}}}
  Event List:
  {{#each eventList}}
  - {{{this}}}
  {{/each}}

  Summary:`, 
});

const generateWhatsappSummaryFlow = ai.defineFlow(
  {
    name: 'generateWhatsappSummaryFlow',
    inputSchema: GenerateWhatsappSummaryInputSchema,
    outputSchema: GenerateWhatsappSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
