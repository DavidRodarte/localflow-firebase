'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating an image based on a title.
 *
 * - generateImage - A function that takes a title and returns a data URI for a generated image.
 * - GenerateImageInput - The input type for the generateImage function.
 * - GenerateImageOutput - The return type for the generateImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageInputSchema = z.object({
  title: z.string().describe('The title to base the image generation on.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

const GenerateImageOutputSchema = z.object({
  imageUrl: z
    .string()
    .describe(
      "The generated image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageOutput> {
  return generateImageFlow(input);
}

const generateImageFlow = ai.defineFlow(
  {
    name: 'generateImageFlow',
    inputSchema: GenerateImageInputSchema,
    outputSchema: GenerateImageOutputSchema,
  },
  async ({title}) => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Generate a realistic, high-quality, professional photograph of the following item or concept for a local classifieds website: ${title}. The image should be well-lit, in focus, and look appealing to potential buyers. Do not include any text or logos in the image.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });
    
    if (!media?.url) {
      // Fallback to a placeholder if generation fails
      return { imageUrl: 'https://placehold.co/600x400.png' };
    }

    return {imageUrl: media.url};
  }
);
