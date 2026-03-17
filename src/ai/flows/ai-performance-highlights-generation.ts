'use server';
/**
 * @fileOverview A Genkit flow for generating personalized performance highlights for students.
 *
 * - generatePerformanceHighlights - A function that analyzes student academic performance and participation data to generate highlights.
 * - AiPerformanceHighlightsGenerationInput - The input type for the generatePerformanceHighlights function.
 * - AiPerformanceHighlightsGenerationOutput - The return type for the generatePerformanceHighlights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StudentPerformanceDataSchema = z.object({
  id: z.string().describe('Unique identifier for the student.'),
  name: z.string().describe('Name of the student.'),
  grades: z.array(z.object({
    assignment: z.string().describe('Name of the assignment.'),
    score: z.number().describe('Score obtained by the student in this assignment.'),
    maxScore: z.number().describe('Maximum possible score for this assignment.'),
  })).describe('Array of assignment grades for the student.'),
  participationScore: z.number().describe('A score representing student participation (e.g., 0-100).'),
});

const AiPerformanceHighlightsGenerationInputSchema = z.object({
  studentData: z.array(StudentPerformanceDataSchema).describe('An array of student academic performance and participation data.'),
  teacherInstructions: z.string().optional().describe('Optional instructions or specific areas the teacher wants to focus on for generating highlights.'),
});
export type AiPerformanceHighlightsGenerationInput = z.infer<typeof AiPerformanceHighlightsGenerationInputSchema>;

const StudentHighlightSchema = z.object({
  studentId: z.string().describe('Unique identifier of the student.'),
  studentName: z.string().describe('Name of the student.'),
  achievements: z.string().describe('A summary of the student\'s academic achievements and positive contributions.'),
  areasForImprovement: z.string().describe('A summary of specific areas where the student can improve and suggestions for how.'),
});

const AiPerformanceHighlightsGenerationOutputSchema = z.object({
  highlights: z.array(StudentHighlightSchema).describe('An array of personalized highlights for each student, including achievements and areas for improvement.'),
});
export type AiPerformanceHighlightsGenerationOutput = z.infer<typeof AiPerformanceHighlightsGenerationOutputSchema>;

export async function generatePerformanceHighlights(input: AiPerformanceHighlightsGenerationInput): Promise<AiPerformanceHighlightsGenerationOutput> {
  return aiPerformanceHighlightsGenerationFlow(input);
}

const generatePerformanceHighlightsPrompt = ai.definePrompt({
  name: 'generatePerformanceHighlightsPrompt',
  input: {schema: AiPerformanceHighlightsGenerationInputSchema},
  output: {schema: AiPerformanceHighlightsGenerationOutputSchema},
  prompt: `You are an AI assistant designed to help teachers quickly understand student progress and provide tailored feedback. Your task is to analyze the provided student academic performance and participation data and generate personalized highlights of achievements and areas for improvement for each student.\n\nFocus on specific examples from their grades and participation scores. Be constructive and actionable in your suggestions for improvement.\n\nHere is the student data:\n{{#each studentData}}\nStudent ID: {{{id}}}\nStudent Name: {{{name}}}\nGrades:\n{{#each grades}}\n- Assignment: {{{assignment}}}, Score: {{{score}}}/{{{maxScore}}}\n{{/each}}\nParticipation Score: {{{participationScore}}}%\n\n---\n{{/each}}\n\n{{#if teacherInstructions}}\nAdditional instructions from the teacher: "{{{teacherInstructions}}}"\n{{/if}}\n\nPlease generate the highlights in JSON format, adhering strictly to the provided output schema.`,
});

const aiPerformanceHighlightsGenerationFlow = ai.defineFlow(
  {
    name: 'aiPerformanceHighlightsGenerationFlow',
    inputSchema: AiPerformanceHighlightsGenerationInputSchema,
    outputSchema: AiPerformanceHighlightsGenerationOutputSchema,
  },
  async input => {
    const {output} = await generatePerformanceHighlightsPrompt(input);
    return output!;
  }
);
