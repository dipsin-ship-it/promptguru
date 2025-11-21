/**
 * Prompt-Guru - Electron Main Process
 *
 * This file manages the main Electron process, including:
 * - BrowserWindow creation and lifecycle
 * - System tray icon and menu
 * - Global keyboard shortcuts
 * - Window show/hide toggle behavior
 *
 * Author: Dipankar
 */

import { app, BrowserWindow, Tray, Menu, globalShortcut, nativeImage, type NativeImage } from 'electron';
import * as path from 'path';
import * as url from 'url';

// Keep references to prevent garbage collection
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

// Track if app is quitting to prevent hiding window on close
let isAppQuitting = false;

// Check if app is in development mode
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

/**
 * Create the main application window
 */
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false, // Don't show until ready
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false  // Disable sandbox to allow file:// protocol
    },
    icon: path.join(__dirname, '../../build/icon.png')
  });

  // Load the renderer
  if (isDev) {
    // Development: load from Vite dev server
    mainWindow.loadURL('http://localhost:5173').catch((err) => {
      console.error('Failed to load dev server:', err);
    });
    mainWindow.webContents.openDevTools();
  } else {
    // Production: load from built files
    // The path after packaging: app.asar/dist/main/main.js
    // Renderer is at: app.asar/renderer/dist/index.html
    const indexPath = path.join(__dirname, '../../renderer/dist/index.html');
    console.log('Loading production app from:', indexPath);
    console.log('__dirname:', __dirname);
    console.log('app.getAppPath():', app.getAppPath());

    mainWindow.loadFile(indexPath).catch((err) => {
      console.error('Failed to load production build:', err);
      console.error('Attempted path:', indexPath);
    });

    // Enable DevTools in production for debugging (remove after confirming it works)
    mainWindow.webContents.openDevTools();
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Log when DOM is ready
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Renderer finished loading');
  });

  // Log any load failures
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });

  // Minimize to tray instead of closing
  mainWindow.on('close', (event) => {
    if (!isAppQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * Create system tray icon with context menu
 */
function createTray(): void {
  // Create tray icon (use a simple icon or placeholder)
  // In production, this should reference a proper icon file
  const iconPath = path.join(__dirname, '../../build/tray-icon.png');

  // Create a simple icon if the file doesn't exist (for development)
  let trayIcon: NativeImage;
  try {
    trayIcon = nativeImage.createFromPath(iconPath);
    if (trayIcon.isEmpty()) {
      // Fallback to empty icon
      trayIcon = nativeImage.createEmpty();
    }
  } catch (err) {
    trayIcon = nativeImage.createEmpty();
  }

  tray = new Tray(trayIcon);
  tray.setToolTip('Prompt-Guru');

  // Context menu for tray
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open',
      click: () => {
        showWindow();
      }
    },
    {
      label: 'New Prompt',
      click: () => {
        showWindow();
        // Could send IPC message to renderer to create new prompt
      }
    },
    { type: 'separator' },
    {
      label: 'Preferences...',
      click: () => {
        showWindow();
        // Could open preferences dialog
      }
    },
    { type: 'separator' },
    {
      label: 'Exit',
      click: () => {
        isAppQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);

  // Toggle window on tray icon click
  tray.on('click', () => {
    toggleWindow();
  });
}

/**
 * Show the main window
 */
function showWindow(): void {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.show();
    mainWindow.focus();
  } else {
    createWindow();
  }
}

/**
 * Toggle window visibility
 */
function toggleWindow(): void {
  if (!mainWindow) {
    createWindow();
    return;
  }

  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    showWindow();
  }
}

/**
 * Register global keyboard shortcuts
 */
function registerShortcuts(): void {
  // Global hotkey: Ctrl+Alt+P to toggle window
  const registered = globalShortcut.register('CommandOrControl+Alt+P', () => {
    toggleWindow();
  });

  if (!registered) {
    console.error('Failed to register global shortcut');
  }
}

/**
 * App ready handler
 */
app.whenReady().then(() => {
  createWindow();
  createTray();
  registerShortcuts();

  // macOS: re-create window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      showWindow();
    }
  });
});

/**
 * Quit when all windows are closed (except on macOS)
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Don't quit - stay in tray
    // app.quit();
  }
});

/**
 * Cleanup on quit
 */
app.on('will-quit', () => {
  // Unregister all shortcuts
  globalShortcut.unregisterAll();
});

/**
 * Before quit - allow actual quit
 */
app.on('before-quit', () => {
  isAppQuitting = true;
});

// Disable hardware acceleration if needed (optional)
// app.disableHardwareAcceleration();

// Security: prevent navigation to external URLs
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);

    // Allow localhost in development
    if (isDev && parsedUrl.hostname === 'localhost') {
      return;
    }

    // Allow file protocol for production
    if (parsedUrl.protocol === 'file:') {
      return;
    }

    // Block all other navigation
    event.preventDefault();
    console.warn('Blocked navigation to:', navigationUrl);
  });

  // Block new window creation
  contents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });
});
