/**
 * Global type definitions for Electron APIs exposed via preload
 */

export interface ElectronAPI {
  openExternal: (url: string) => Promise<void>;
  platform: string;
  getVersion: () => string;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
