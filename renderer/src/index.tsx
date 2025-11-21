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

console.log('Starting Prompt-Guru initialization...');

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Get root element
const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('Root element not found!');
  document.body.innerHTML = '<div style="padding: 20px; color: red;">Error: Root element not found. Please check the console.</div>';
  throw new Error('Failed to find root element');
}

console.log('Root element found, creating React root...');

// Create React root and render app
try {
  const root = createRoot(rootElement);

  console.log('Rendering React app...');

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  console.log('React app rendered successfully');
} catch (error) {
  console.error('Failed to render React app:', error);
  document.body.innerHTML = `<div style="padding: 20px; color: red;">
    <h1>Error Loading App</h1>
    <p>${error instanceof Error ? error.message : String(error)}</p>
    <p>Check the console for more details.</p>
  </div>`;
}

// Log app version
console.log('Prompt-Guru initialized');
if (window.electronAPI) {
  console.log('Platform:', window.electronAPI.platform);
  console.log('Version:', window.electronAPI.getVersion());
} else {
  console.warn('Electron API not available - running in browser mode?');
}
