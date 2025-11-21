/**
 * TemplateEditor Component
 *
 * Editor for creating and modifying prompt templates
 * Author: Dipankar
 */

import React, { useState, useEffect } from 'react';
import './TemplateEditor.css';
import type { Adapter, PromptParams } from '../lib/types';
import { promptTechniques } from '../lib/promptTechniques';

interface TemplateEditorProps {
  adapter: Adapter | null;
  onParamsChange: (params: PromptParams) => void;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  adapter,
  onParamsChange
}) => {
  const [params, setParams] = useState<PromptParams>({
    userInput: '',
    customParams: {},
    technique: 'none'
  });

  useEffect(() => {
    // Reset params when adapter changes
    if (adapter) {
      const defaultParams: Record<string, number> = {};
      if (adapter.parameters) {
        for (const [key, range] of Object.entries(adapter.parameters)) {
          // Set to midpoint of range
          if (Array.isArray(range) && range.length === 2) {
            defaultParams[key] = (range[0] + range[1]) / 2;
          }
        }
      }
      const newParams = {
        userInput: '',
        customParams: defaultParams,
        technique: 'none'
      };
      setParams(newParams);
      onParamsChange(newParams);
    }
  }, [adapter]);

  const handleInputChange = (value: string) => {
    const newParams = { ...params, userInput: value };
    setParams(newParams);
    onParamsChange(newParams);
  };

  const handleParamChange = (key: string, value: number) => {
    const newParams = {
      ...params,
      customParams: { ...params.customParams, [key]: value }
    };
    setParams(newParams);
    onParamsChange(newParams);
  };

  const handleTechniqueChange = (techniqueId: string) => {
    const newParams = { ...params, technique: techniqueId };
    setParams(newParams);
    onParamsChange(newParams);
  };

  if (!adapter) {
    return (
      <div className="template-editor">
        <div className="editor-empty">
          <p className="text-muted">Select an adapter to begin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="template-editor">
      <div className="editor-header">
        <h2>Template Editor</h2>
        <span className="adapter-badge">{adapter.display_name}</span>
      </div>

      <div className="editor-content">
        {/* System message display */}
        {adapter.system_message && (
          <div className="editor-section">
            <label className="section-label">System Message</label>
            <div className="system-message-display">
              {adapter.system_message}
            </div>
          </div>
        )}

        {/* User input */}
        <div className="editor-section">
          <label className="section-label" htmlFor="user-input">
            Your Prompt
          </label>
          <textarea
            id="user-input"
            className="prompt-input"
            value={params.userInput}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Enter your prompt here..."
            rows={8}
          />
          <div className="input-meta">
            <span className="char-count">
              {params.userInput.length} characters
            </span>
          </div>
        </div>

        {/* Prompt Technique Selector */}
        <div className="editor-section">
          <label className="section-label" htmlFor="technique-select">
            Prompt Technique
            <span className="technique-help">Choose a prompting strategy for better results</span>
          </label>
          <select
            id="technique-select"
            className="technique-select"
            value={params.technique || 'none'}
            onChange={(e) => handleTechniqueChange(e.target.value)}
          >
            {promptTechniques.map((technique) => (
              <option key={technique.id} value={technique.id}>
                {technique.name}
              </option>
            ))}
          </select>
          {params.technique && params.technique !== 'none' && (
            <div className="technique-description">
              {promptTechniques.find(t => t.id === params.technique)?.description}
              {promptTechniques.find(t => t.id === params.technique)?.example && (
                <div className="technique-example">
                  💡 {promptTechniques.find(t => t.id === params.technique)?.example}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Parameters */}
        {adapter.parameters && Object.keys(adapter.parameters).length > 0 && (
          <div className="editor-section">
            <label className="section-label">Parameters</label>
            <div className="parameters-grid">
              {Object.entries(adapter.parameters).map(([key, range]) => {
                if (!Array.isArray(range) || range.length !== 2) return null;
                const [min, max] = range;
                const rawValue = params.customParams[key] ?? (min + max) / 2;
                const value = typeof rawValue === 'number' ? rawValue : parseFloat(String(rawValue)) || (min + max) / 2;

                return (
                  <div key={key} className="parameter-control">
                    <div className="parameter-header">
                      <span className="parameter-name">{key}</span>
                      <span className="parameter-value">{value.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min={min}
                      max={max}
                      step={(max - min) / 100}
                      value={value}
                      onChange={(e) =>
                        handleParamChange(key, parseFloat(e.target.value))
                      }
                      className="parameter-slider"
                    />
                    <div className="parameter-range">
                      <span>{min}</span>
                      <span>{max}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Template preview */}
        <div className="editor-section">
          <label className="section-label">Template Preview</label>
          <div className="template-preview">
            <code>{adapter.prompt_template || 'No template defined'}</code>
          </div>
        </div>
      </div>
    </div>
  );
};
