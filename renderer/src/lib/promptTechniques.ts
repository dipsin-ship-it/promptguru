/**
 * Prompt Engineering Techniques Library
 *
 * Provides various prompt engineering techniques to enhance prompts
 * Author: Dipankar
 */

export interface PromptTechnique {
  id: string;
  name: string;
  description: string;
  template: string;
  example?: string;
}

/**
 * Available prompt engineering techniques
 */
export const promptTechniques: PromptTechnique[] = [
  {
    id: 'none',
    name: 'Standard',
    description: 'Use the prompt as-is without any specific technique',
    template: '{prompt}'
  },
  {
    id: 'cot',
    name: 'Chain of Thought (CoT)',
    description: 'Encourages step-by-step reasoning',
    template: `{prompt}

Let's approach this step by step:
1. First, let's break down the problem
2. Think through each component carefully
3. Arrive at a well-reasoned conclusion

Please show your thinking process.`,
    example: 'Great for complex reasoning, math problems, and logical deduction'
  },
  {
    id: 'tot',
    name: 'Tree of Thought',
    description: 'Explores multiple reasoning paths',
    template: `{prompt}

Let's explore multiple approaches:
- Approach 1: [Consider this angle]
- Approach 2: [Consider alternative perspective]
- Approach 3: [Consider another possibility]

Evaluate each approach and determine the best solution.`,
    example: 'Ideal for problems with multiple valid solutions'
  },
  {
    id: 'few_shot',
    name: 'Few-Shot Learning',
    description: 'Provides examples before the actual task',
    template: `Here are some examples:

Example 1: [Example input] → [Example output]
Example 2: [Example input] → [Example output]

Now, apply the same pattern to:
{prompt}`,
    example: 'Best for pattern recognition and consistent formatting'
  },
  {
    id: 'role_play',
    name: 'Role-Based Prompting',
    description: 'Assigns a specific expert role',
    template: `You are an expert professional with deep knowledge and experience.

Your task: {prompt}

Approach this with your expertise and provide detailed, professional insights.`,
    example: 'Useful for domain-specific tasks requiring expertise'
  },
  {
    id: 'constraint',
    name: 'Constraint-Based',
    description: 'Adds specific constraints and requirements',
    template: `{prompt}

Requirements:
- Be specific and detailed
- Provide concrete examples
- Consider edge cases
- Format the response clearly

Constraints:
- Focus on practical solutions
- Avoid jargon unless necessary
- Explain your reasoning`,
    example: 'Good for precise, well-structured outputs'
  },
  {
    id: 'socratic',
    name: 'Socratic Method',
    description: 'Encourages critical thinking through questions',
    template: `{prompt}

Before answering, consider these questions:
- What are the key assumptions?
- What evidence supports different viewpoints?
- What are the implications of each approach?
- What would challenge this conclusion?

Now provide a thoughtful response.`,
    example: 'Excellent for analysis and critical evaluation'
  },
  {
    id: 'iterative',
    name: 'Iterative Refinement',
    description: 'Builds solution through iterations',
    template: `{prompt}

Please approach this iteratively:
1. Provide an initial solution
2. Identify potential improvements
3. Refine based on those improvements
4. Present the final, optimized result`,
    example: 'Perfect for complex tasks requiring refinement'
  },
  {
    id: 'structured',
    name: 'Structured Output',
    description: 'Enforces a specific output format',
    template: `{prompt}

Please structure your response as follows:
## Overview
[Brief summary]

## Details
[Detailed explanation]

## Key Points
- Point 1
- Point 2
- Point 3

## Conclusion
[Final thoughts]`,
    example: 'Best for reports and organized documentation'
  }
];

/**
 * Apply a prompt technique to a user prompt
 */
export function applyTechnique(
  userPrompt: string,
  techniqueId: string
): string {
  const technique = promptTechniques.find(t => t.id === techniqueId);

  if (!technique || techniqueId === 'none') {
    return userPrompt;
  }

  return technique.template.replace('{prompt}', userPrompt);
}

/**
 * Get technique by ID
 */
export function getTechnique(techniqueId: string): PromptTechnique | undefined {
  return promptTechniques.find(t => t.id === techniqueId);
}

/**
 * Optimize a prompt by making it more effective
 */
export function optimizePrompt(prompt: string, adapterId: string): string {
  // Add clarity and specificity
  let optimized = prompt.trim();

  // Add context if missing
  if (!optimized.toLowerCase().includes('context') && !optimized.toLowerCase().includes('background')) {
    optimized = `Context: Provide relevant background and specific details.\n\n${optimized}`;
  }

  // Add output format guidance
  if (!optimized.toLowerCase().includes('format') && !optimized.toLowerCase().includes('structure')) {
    optimized += `\n\nOutput Format: Provide a clear, well-structured response.`;
  }

  // Add quality indicators based on adapter type
  const qualityIndicators = getQualityIndicators(adapterId);
  if (qualityIndicators) {
    optimized += `\n\n${qualityIndicators}`;
  }

  return optimized;
}

/**
 * Get quality indicators based on adapter type
 */
function getQualityIndicators(adapterId: string): string {
  const indicators: Record<string, string> = {
    chatgpt: 'Quality Criteria:\n- Be comprehensive yet concise\n- Provide examples where helpful\n- Use clear, accessible language',
    claude: 'Quality Expectations:\n- Think step-by-step\n- Consider multiple perspectives\n- Provide nuanced, thoughtful responses',
    gemini: 'Response Guidelines:\n- Be accurate and up-to-date\n- Include relevant details\n- Maintain objectivity',
    stable_diffusion: 'Image Quality:\n- High detail and clarity\n- Professional composition\n- Proper lighting and perspective',
    runway_video: 'Video Quality:\n- Smooth motion\n- Professional cinematography\n- Coherent narrative flow',
    figma: 'Design Quality:\n- Clean, modern aesthetic\n- Consistent design system\n- User-friendly interface'
  };

  return indicators[adapterId] || '';
}
