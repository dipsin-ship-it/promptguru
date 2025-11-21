/**
 * Type definitions for Prompt-Guru
 * Author: Dipankar
 */

/**
 * Adapter definition for different AI platforms
 */
export interface Adapter {
  /** Unique identifier for the adapter */
  id: string;

  /** Display name shown in UI */
  display_name: string;

  /** System message or instructions for the adapter */
  system_message?: string;

  /** Parameter ranges (e.g., temperature: [0.0, 1.0]) */
  parameters?: Record<string, number[]>;

  /** Prompt template with placeholders */
  prompt_template: string;

  /** Additional metadata */
  metadata?: {
    category?: string;
    supports_image?: boolean;
    supports_video?: boolean;
    [key: string]: any;
  };
}

/**
 * Prompt parameters from user input
 */
export interface PromptParams {
  /** Main user input text */
  userInput: string;

  /** Custom parameter values */
  customParams: Record<string, number | string>;

  /** Selected prompt technique */
  technique?: string;
}

/**
 * Built prompt result
 */
export interface BuiltPrompt {
  /** The constructed prompt */
  text: string;

  /** Estimated token count */
  tokenCount: number;

  /** Adapter used */
  adapterId: string;

  /** Timestamp */
  timestamp: string;
}

/**
 * Validation result
 */
export interface ValidationResult {
  /** Whether validation passed */
  valid: boolean;

  /** Validation errors if any */
  errors?: string[];
}

/**
 * Template pack for import/export
 */
export interface TemplatePack {
  /** Pack metadata */
  name: string;
  version: string;
  author?: string;
  description?: string;

  /** Included adapters */
  adapters: Adapter[];

  /** Creation timestamp */
  created: string;
}
