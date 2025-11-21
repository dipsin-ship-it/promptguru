/**
 * Unit tests for PromptEngine
 * Author: Dipankar
 */

import { PromptEngine } from '../renderer/src/lib/promptEngine';
import type { Adapter, PromptParams } from '../renderer/src/lib/types';

describe('PromptEngine', () => {
  let engine: PromptEngine;

  beforeEach(() => {
    engine = new PromptEngine();
  });

  describe('build', () => {
    it('should build a simple prompt with user input', () => {
      const adapter: Adapter = {
        id: 'test',
        display_name: 'Test Adapter',
        prompt_template: 'User says: {user_input}'
      };

      const result = engine.build(adapter, 'Hello world', {});

      expect(result).toBe('User says: Hello world');
    });

    it('should replace parameter placeholders', () => {
      const adapter: Adapter = {
        id: 'test',
        display_name: 'Test Adapter',
        prompt_template:
          'Prompt: {user_input}\nTemperature: {temperature}\nMax Tokens: {max_tokens}'
      };

      const result = engine.build(adapter, 'Test prompt', {
        temperature: 0.7,
        max_tokens: 100
      });

      expect(result).toContain('Prompt: Test prompt');
      expect(result).toContain('Temperature: 0.7');
      expect(result).toContain('Max Tokens: 100');
    });

    it('should replace system message placeholder', () => {
      const adapter: Adapter = {
        id: 'test',
        display_name: 'Test Adapter',
        system_message: 'You are a helpful assistant',
        prompt_template: '{system_message}\n\nUser: {user_input}'
      };

      const result = engine.build(adapter, 'Help me', {});

      expect(result).toContain('You are a helpful assistant');
      expect(result).toContain('User: Help me');
    });

    it('should handle {input} as an alias for {user_input}', () => {
      const adapter: Adapter = {
        id: 'test',
        display_name: 'Test Adapter',
        prompt_template: 'Input: {input}'
      };

      const result = engine.build(adapter, 'Test input', {});

      expect(result).toBe('Input: Test input');
    });
  });

  describe('estimateTokens', () => {
    it('should estimate token count', () => {
      const text = 'This is a test string with about twenty characters total.';
      const estimate = engine.estimateTokens(text);

      // Rough estimate: ~4 chars per token
      expect(estimate).toBeGreaterThan(0);
      expect(estimate).toBeLessThan(text.length);
    });

    it('should return 0 for empty string', () => {
      const estimate = engine.estimateTokens('');
      expect(estimate).toBe(0);
    });
  });

  describe('parseTemplateVariables', () => {
    it('should extract variable names from template', () => {
      const template = 'Hello {name}, your {item} is ready. Price: {price}';
      const variables = engine.parseTemplateVariables(template);

      expect(variables).toEqual(['{name}', '{item}', '{price}']);
    });

    it('should return empty array for template with no variables', () => {
      const template = 'Hello world, no variables here';
      const variables = engine.parseTemplateVariables(template);

      expect(variables).toEqual([]);
    });

    it('should handle template with duplicate variables', () => {
      const template = '{user_input} and {user_input} again';
      const variables = engine.parseTemplateVariables(template);

      expect(variables).toHaveLength(2);
      expect(variables).toEqual(['{user_input}', '{user_input}']);
    });
  });

  describe('validateParameters', () => {
    it('should validate parameters within range', () => {
      const adapter: Adapter = {
        id: 'test',
        display_name: 'Test Adapter',
        prompt_template: '{user_input}',
        parameters: {
          temperature: [0.0, 1.0],
          max_tokens: [1, 2000]
        }
      };

      const result = engine.validateParameters(adapter, {
        temperature: 0.5,
        max_tokens: 100
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should fail validation for out-of-range parameters', () => {
      const adapter: Adapter = {
        id: 'test',
        display_name: 'Test Adapter',
        prompt_template: '{user_input}',
        parameters: {
          temperature: [0.0, 1.0]
        }
      };

      const result = engine.validateParameters(adapter, {
        temperature: 2.0 // Out of range
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.length).toBeGreaterThan(0);
    });
  });

  describe('exportJSON', () => {
    it('should export prompt as JSON', () => {
      const adapter: Adapter = {
        id: 'test',
        display_name: 'Test Adapter',
        prompt_template: '{user_input}'
      };

      const params: PromptParams = {
        userInput: 'Test input',
        customParams: {}
      };

      const result = engine.exportJSON(adapter, params, 'Built prompt text');
      const parsed = JSON.parse(result);

      expect(parsed.adapter_id).toBe('test');
      expect(parsed.adapter_name).toBe('Test Adapter');
      expect(parsed.prompt).toBe('Built prompt text');
      expect(parsed.timestamp).toBeDefined();
    });
  });

  describe('exportTOON', () => {
    it('should export prompt in TOON format', () => {
      const adapter: Adapter = {
        id: 'test',
        display_name: 'Test Adapter',
        prompt_template: '{user_input}'
      };

      const params: PromptParams = {
        userInput: 'Test input',
        customParams: { temperature: 0.7 }
      };

      const result = engine.exportTOON(adapter, params, 'Built prompt');

      expect(result).toContain('@adapter test');
      expect(result).toContain('@timestamp');
      expect(result).toContain('@params');
      expect(result).toContain('temperature: 0.7');
      expect(result).toContain('@prompt');
      expect(result).toContain('Built prompt');
    });
  });

  describe('exportCSV', () => {
    it('should export prompt as CSV', () => {
      const adapter: Adapter = {
        id: 'test',
        display_name: 'Test Adapter',
        prompt_template: '{user_input}'
      };

      const params: PromptParams = {
        userInput: 'Test input',
        customParams: {}
      };

      const result = engine.exportCSV(adapter, params, 'Built prompt');

      expect(result).toContain('adapter_id,timestamp,prompt,token_estimate');
      expect(result).toContain('test');
      expect(result).toContain('"Built prompt"');
    });

    it('should escape CSV special characters', () => {
      const adapter: Adapter = {
        id: 'test',
        display_name: 'Test Adapter',
        prompt_template: '{user_input}'
      };

      const params: PromptParams = {
        userInput: 'Test input',
        customParams: {}
      };

      const result = engine.exportCSV(
        adapter,
        params,
        'Prompt with "quotes" and, commas'
      );

      // Should escape quotes and wrap in quotes
      expect(result).toContain('""quotes""');
    });
  });
});
