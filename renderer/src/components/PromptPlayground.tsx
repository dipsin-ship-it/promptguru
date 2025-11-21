/**
 * PromptPlayground Component
 *
 * Build, preview, and export prompts
 * Author: Dipankar
 */

import React, { useState, useEffect } from 'react';
import './PromptPlayground.css';
import type { Adapter, PromptParams } from '../lib/types';
import { PromptEngine } from '../lib/promptEngine';
import { optimizePrompt } from '../lib/promptTechniques';

interface PromptPlaygroundProps {
  adapter: Adapter | null;
  params: PromptParams;
}

export const PromptPlayground: React.FC<PromptPlaygroundProps> = ({
  adapter,
  params
}) => {
  const [builtPrompt, setBuiltPrompt] = useState<string>('');
  const [tokenEstimate, setTokenEstimate] = useState<number>(0);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [isOptimized, setIsOptimized] = useState<boolean>(false);

  useEffect(() => {
    if (adapter && params.userInput) {
      try {
        const engine = new PromptEngine();
        const built = engine.build(
          adapter,
          params.userInput,
          params.customParams,
          params.technique
        );
        setBuiltPrompt(built);
        setIsOptimized(false); // Reset optimization flag when params change

        // Simple token estimation (rough: ~4 chars per token)
        const estimatedTokens = Math.ceil(built.length / 4);
        setTokenEstimate(estimatedTokens);
      } catch (err) {
        console.error('Failed to build prompt:', err);
        setBuiltPrompt('Error building prompt');
        setTokenEstimate(0);
      }
    } else {
      setBuiltPrompt('');
      setTokenEstimate(0);
    }
  }, [adapter, params]);

  const handleOptimize = () => {
    if (!adapter || !builtPrompt) return;

    try {
      const optimized = optimizePrompt(builtPrompt, adapter.id);
      setBuiltPrompt(optimized);
      setIsOptimized(true);

      // Update token estimate
      const estimatedTokens = Math.ceil(optimized.length / 4);
      setTokenEstimate(estimatedTokens);
    } catch (err) {
      console.error('Failed to optimize prompt:', err);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(builtPrompt);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleExport = () => {
    const blob = new Blob([builtPrompt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-${adapter?.id || 'export'}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const exportData = {
      adapter: adapter?.id,
      timestamp: new Date().toISOString(),
      params: params,
      prompt: builtPrompt
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-${adapter?.id || 'export'}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!adapter) {
    return (
      <div className="prompt-playground">
        <div className="playground-empty">
          <p className="text-muted">Select an adapter to begin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="prompt-playground">
      <div className="playground-header">
        <h2>Prompt Playground</h2>
        <div className="token-estimate">
          <span className="token-label">Tokens:</span>
          <span className="token-value">{tokenEstimate}</span>
        </div>
      </div>

      <div className="playground-content">
        {/* Built prompt preview */}
        <div className="playground-section">
          <label className="section-label">Built Prompt</label>
          <div className="prompt-preview">
            {builtPrompt ? (
              <pre className="prompt-text">{builtPrompt}</pre>
            ) : (
              <p className="text-muted">Enter a prompt to see preview...</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="playground-section">
          <div className="action-buttons">
            <button
              onClick={handleOptimize}
              disabled={!builtPrompt || isOptimized}
              className={isOptimized ? 'success' : 'optimize-btn'}
              title="Enhance prompt with quality improvements"
            >
              {isOptimized ? '✓ Optimized!' : '✨ Optimize'}
            </button>
            <button
              onClick={handleCopy}
              disabled={!builtPrompt}
              className={copyStatus === 'copied' ? 'success' : ''}
            >
              {copyStatus === 'copied' ? '✓ Copied!' : '📋 Copy'}
            </button>
            <button
              onClick={handleExport}
              disabled={!builtPrompt}
              className="secondary"
            >
              📄 Export TXT
            </button>
            <button
              onClick={handleExportJSON}
              disabled={!builtPrompt}
              className="secondary"
            >
              📦 Export JSON
            </button>
          </div>
        </div>

        {/* Metadata */}
        {builtPrompt && (
          <div className="playground-section">
            <label className="section-label">Metadata</label>
            <div className="metadata-grid">
              <div className="metadata-item">
                <span className="metadata-label">Adapter:</span>
                <span className="metadata-value">{adapter.display_name}</span>
              </div>
              <div className="metadata-item">
                <span className="metadata-label">Characters:</span>
                <span className="metadata-value">{builtPrompt.length}</span>
              </div>
              <div className="metadata-item">
                <span className="metadata-label">Lines:</span>
                <span className="metadata-value">
                  {builtPrompt.split('\n').length}
                </span>
              </div>
              <div className="metadata-item">
                <span className="metadata-label">Est. Tokens:</span>
                <span className="metadata-value">{tokenEstimate}</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
