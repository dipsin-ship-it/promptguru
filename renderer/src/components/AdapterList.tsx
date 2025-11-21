/**
 * AdapterList Component
 *
 * Displays and manages the list of available adapters (ChatGPT, Claude, etc.)
 * Author: Dipankar
 */

import React, { useState, useEffect } from 'react';
import './AdapterList.css';
import type { Adapter } from '../lib/types';

// Import all adapters statically for better bundling
import chatgptAdapter from '../lib/adapters/chatgpt.json';
import claudeAdapter from '../lib/adapters/claude.json';
import geminiAdapter from '../lib/adapters/gemini.json';
import stableDiffusionAdapter from '../lib/adapters/stable_diffusion.json';
import runwayAdapter from '../lib/adapters/runway_video.json';
import figmaAdapter from '../lib/adapters/figma.json';

interface AdapterListProps {
  onSelectAdapter: (adapter: Adapter) => void;
  selectedAdapterId?: string;
}

export const AdapterList: React.FC<AdapterListProps> = ({
  onSelectAdapter,
  selectedAdapterId
}) => {
  const [adapters, setAdapters] = useState<Adapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAdapters();
  }, []);

  const loadAdapters = () => {
    try {
      setLoading(true);
      setError(null);

      // Load all adapters from static imports
      const loadedAdapters: Adapter[] = [
        chatgptAdapter as Adapter,
        claudeAdapter as Adapter,
        geminiAdapter as Adapter,
        stableDiffusionAdapter as Adapter,
        runwayAdapter as Adapter,
        figmaAdapter as Adapter
      ];

      // Sort by display name
      loadedAdapters.sort((a, b) =>
        a.display_name.localeCompare(b.display_name)
      );

      setAdapters(loadedAdapters);

      // Auto-select first adapter if none selected
      if (loadedAdapters.length > 0 && !selectedAdapterId) {
        onSelectAdapter(loadedAdapters[0]);
      }
    } catch (err) {
      console.error('Failed to load adapters:', err);
      setError('Failed to load adapters');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="adapter-list">
        <div className="adapter-list-header">
          <h2>Adapters</h2>
        </div>
        <div className="adapter-list-content">
          <p className="text-muted">Loading adapters...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="adapter-list">
        <div className="adapter-list-header">
          <h2>Adapters</h2>
        </div>
        <div className="adapter-list-content">
          <p className="error-message">{error}</p>
          <button onClick={loadAdapters} className="secondary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="adapter-list">
      <div className="adapter-list-header">
        <h2>Adapters</h2>
        <span className="adapter-count">{adapters.length}</span>
      </div>
      <div className="adapter-list-content">
        {adapters.map((adapter) => (
          <button
            key={adapter.id}
            className={`adapter-item ${
              selectedAdapterId === adapter.id ? 'selected' : ''
            }`}
            onClick={() => onSelectAdapter(adapter)}
          >
            <div className="adapter-icon">
              {getAdapterIcon(adapter.id)}
            </div>
            <div className="adapter-info">
              <div className="adapter-name">{adapter.display_name}</div>
              <div className="adapter-id">{adapter.id}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * Get icon for adapter (simple emoji-based for now)
 */
function getAdapterIcon(adapterId: string): string {
  const icons: Record<string, string> = {
    chatgpt: '🤖',
    claude: '🧠',
    gemini: '💎',
    stable_diffusion: '🎨',
    runway_video: '🎬',
    figma: '🎯'
  };
  return icons[adapterId] || '📝';
}
