/**
 * Prompt-Guru Main Application Component
 *
 * Main layout and state management for the application
 * Author: Dipankar
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { AdapterList } from './components/AdapterList';
import { TemplateEditor } from './components/TemplateEditor';
import { PromptPlayground } from './components/PromptPlayground';
import type { Adapter, PromptParams } from './lib/types';
import './App.css';

export const App: React.FC = () => {
  const [selectedAdapter, setSelectedAdapter] = useState<Adapter | null>(null);
  const [promptParams, setPromptParams] = useState<PromptParams>({
    userInput: '',
    customParams: {}
  });

  const handleAdapterSelect = (adapter: Adapter) => {
    setSelectedAdapter(adapter);
  };

  const handleParamsChange = (params: PromptParams) => {
    setPromptParams(params);
  };

  return (
    <div className="app">
      <Header />

      <div className="app-body">
        <aside className="sidebar">
          <AdapterList
            onSelectAdapter={handleAdapterSelect}
            selectedAdapterId={selectedAdapter?.id}
          />
        </aside>

        <main className="main-content">
          <div className="editor-section">
            <TemplateEditor
              adapter={selectedAdapter}
              onParamsChange={handleParamsChange}
            />
          </div>
        </main>

        <aside className="playground-section">
          <PromptPlayground adapter={selectedAdapter} params={promptParams} />
        </aside>
      </div>
    </div>
  );
};
