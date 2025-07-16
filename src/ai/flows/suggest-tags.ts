'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting relevant tags for a post based on its title and description.
 *
 * - suggestTags - A function that takes a title and description as input and returns a list of suggested tags.
 * - SuggestTagsInput - The input type for the suggestTags function.
 * - SuggestTagsOutput - The return type for the suggestTags function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTagsInputSchema = z.object({
  title: z.string().describe('The title of the post.'),
  description: z.string().describe('The description of the post.'),
});
export type SuggestTagsInput = z.infer<typeof SuggestTagsInputSchema>;

const SuggestTagsOutputSchema = z.object({
  tags: z.array(z.string()).describe('An array of suggested tags for the post.'),
});
export type SuggestTagsOutput = z.infer<typeof SuggestTagsOutputSchema>;

export async function suggestTags(input: SuggestTagsInput): Promise<SuggestTagsOutput> {
  return suggestTagsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTagsPrompt',
  input: {schema: SuggestTagsInputSchema},
  output: {schema: SuggestTagsOutputSchema},
  prompt: `You are a helpful assistant that suggests relevant tags for a post based on its title and description.

  The tags should be relevant to the content of the post and should help users find the post when searching for similar items.

  Title: {{{title}}}
  Description: {{{description}}}

  Suggest at least 5 tags, but no more than 10.  The tags should be general, not specific (e.g. "electronics" instead of "used iPhone 12"). Do not include tags that are the same as words in the title.
  Do not include hashtags or any special characters.  Just return an array of strings.
  `,
});

const suggestTagsFlow = ai.defineFlow(
  {
    name: 'suggestTagsFlow',
    inputSchema: SuggestTagsInputSchema,
    outputSchema: SuggestTagsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
