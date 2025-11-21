/**
 * PromptEngine - Core prompt building and validation logic
 *
 * This module handles:
 * - Building prompts from templates and parameters
 * - Validating prompts against JSON schemas
 * - Token estimation
 *
 * Author: Dipankar
 */

import Ajv, { type JSONSchemaType } from 'ajv';
import type { Adapter, PromptParams, ValidationResult } from './types';

export class PromptEngine {
  private ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({ allErrors: true });
  }

  /**
   * Build a prompt from an adapter, user input, and parameters
   *
   * @param adapter - The adapter configuration
   * @param userInput - User's prompt text
   * @param params - Additional parameters
   * @returns The built prompt string
   */
  build(
    adapter: Adapter,
    userInput: string,
    params: Record<string, number | string> = {}
  ): string {
    let prompt = adapter.prompt_template;

    // Replace {input} or {user_input} with user's input
    prompt = prompt.replace(/\{input\}|\{user_input\}/g, userInput);

    // Replace parameter placeholders
    for (const [key, value] of Object.entries(params)) {
      const placeholder = new RegExp(`\\{${key}\\}`, 'g');
      prompt = prompt.replace(placeholder, String(value));
    }

    // Replace system message if present
    if (adapter.system_message) {
      prompt = prompt.replace(/\{system_message\}/g, adapter.system_message);
    }

    // Clean up any remaining unreplaced placeholders (optional)
    // prompt = prompt.replace(/\{[^}]+\}/g, '');

    return prompt;
  }

  /**
   * Validate a prompt against a JSON schema
   *
   * @param data - The data to validate
   * @param schema - JSON schema to validate against
   * @returns Validation result with any errors
   */
  validate(data: any, schema: JSONSchemaType<any>): ValidationResult {
    const validate = this.ajv.compile(schema);
    const valid = validate(data);

    if (!valid && validate.errors) {
      const errors = validate.errors.map(
        (err) => `${err.instancePath} ${err.message}`
      );
      return { valid: false, errors };
    }

    return { valid: true };
  }

  /**
   * Estimate token count for a prompt
   * Simple heuristic: ~4 characters per token
   *
   * @param text - The text to estimate
   * @returns Estimated token count
   */
  estimateTokens(text: string): number {
    // Simple estimation: average of 4 chars per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Parse template variables from a template string
   *
   * @param template - The template string
   * @returns Array of variable names
   */
  parseTemplateVariables(template: string): string[] {
    const matches = template.match(/\{([^}]+)\}/g);
    if (!matches) return [];

    return matches.map((match) => match.slice(1, -1));
  }

  /**
   * Validate that all required parameters are provided
   *
   * @param adapter - The adapter configuration
   * @param params - Provided parameters
   * @returns Validation result
   */
  validateParameters(
    adapter: Adapter,
    params: Record<string, any>
  ): ValidationResult {
    const variables = this.parseTemplateVariables(adapter.prompt_template);
    const errors: string[] = [];

    // Check required variables (excluding common ones like input, user_input, system_message)
    const commonVars = ['input', 'user_input', 'system_message'];
    const requiredVars = variables.filter((v) => !commonVars.includes(v));

    for (const varName of requiredVars) {
      if (!(varName in params)) {
        errors.push(`Missing required parameter: ${varName}`);
      }
    }

    // Validate parameter ranges if defined
    if (adapter.parameters) {
      for (const [key, range] of Object.entries(adapter.parameters)) {
        if (key in params) {
          const value = params[key];
          if (typeof value === 'number') {
            const [min, max] = range;
            if (value < min || value > max) {
              errors.push(
                `Parameter ${key} must be between ${min} and ${max}, got ${value}`
              );
            }
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * Export prompt as JSON
   *
   * @param adapter - The adapter used
   * @param params - The parameters
   * @param builtPrompt - The built prompt
   * @returns JSON string
   */
  exportJSON(
    adapter: Adapter,
    params: PromptParams,
    builtPrompt: string
  ): string {
    const exportData = {
      adapter_id: adapter.id,
      adapter_name: adapter.display_name,
      timestamp: new Date().toISOString(),
      parameters: params,
      prompt: builtPrompt,
      token_estimate: this.estimateTokens(builtPrompt)
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Export prompt in TOON format (compact component spec)
   * TOON format: simplified markup for component specifications
   *
   * @param adapter - The adapter used
   * @param params - The parameters
   * @param builtPrompt - The built prompt
   * @returns TOON formatted string
   */
  exportTOON(
    adapter: Adapter,
    params: PromptParams,
    builtPrompt: string
  ): string {
    const lines = [
      `@adapter ${adapter.id}`,
      `@timestamp ${new Date().toISOString()}`,
      ''
    ];

    // Add parameters
    if (Object.keys(params.customParams).length > 0) {
      lines.push('@params');
      for (const [key, value] of Object.entries(params.customParams)) {
        lines.push(`  ${key}: ${value}`);
      }
      lines.push('');
    }

    // Add prompt
    lines.push('@prompt');
    lines.push(builtPrompt);

    return lines.join('\n');
  }

  /**
   * Export prompt as CSV (useful for bulk operations)
   *
   * @param adapter - The adapter used
   * @param _params - The parameters (reserved for future use)
   * @param builtPrompt - The built prompt
   * @returns CSV formatted string
   */
  exportCSV(
    adapter: Adapter,
    _params: PromptParams,
    builtPrompt: string
  ): string {
    const escapeCsv = (str: string) => `"${str.replace(/"/g, '""')}"`;

    const headers = ['adapter_id', 'timestamp', 'prompt', 'token_estimate'];
    const values = [
      adapter.id,
      new Date().toISOString(),
      escapeCsv(builtPrompt),
      this.estimateTokens(builtPrompt).toString()
    ];

    return [headers.join(','), values.join(',')].join('\n');
  }
}
