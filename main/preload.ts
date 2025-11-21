/**
 * Prompt-Guru - Preload Script
 *
 * This script runs in the renderer process before the web page loads.
 * It safely exposes select Node.js and Electron APIs to the renderer.
 *
 * Author: Dipankar
 */

import { contextBridge, shell } from 'electron';

/**
 * Expose safe APIs to the renderer process via contextBridge
 */
contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * Open external URL in default browser
   * @param url - The URL to open
   */
  openExternal: (url: string): Promise<void> => {
    return shell.openExternal(url);
  },

  /**
   * Get platform information
   */
  platform: process.platform,

  /**
   * Get app version (if needed)
   */
  getVersion: (): string => {
    return process.env.npm_package_version || '0.1.0';
  }
});

/**
 * Type definitions for the exposed API (for renderer TypeScript)
 * Add this to a .d.ts file in renderer/src for type safety
 */
