/**
 * Prompt-Guru Entry Point
 *
 * Initializes the React application
 * Author: Dipankar
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles.css';

// Get root element
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find root element');
}

// Create React root and render app
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Log app version
console.log('Prompt-Guru initialized');
if (window.electronAPI) {
  console.log('Platform:', window.electronAPI.platform);
  console.log('Version:', window.electronAPI.getVersion());
}
