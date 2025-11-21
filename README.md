# Prompt-Guru

> Local prompt optimizer for text/image/video — standalone Electron app with system tray integration

**Author**: [Dipankar](https://www.linkedin.com/in/dipankars/)

## Overview

Prompt-Guru is a lightweight, privacy-focused desktop application for optimizing and managing prompts for various AI platforms. It runs completely offline, stores everything locally, and provides an intuitive interface for building, testing, and exporting prompts.

### Key Features

- **System Tray Resident**: Runs in the background, accessible via tray icon or hotkey (Ctrl+Alt+P)
- **Multi-Platform Support**: Adapters for ChatGPT, Claude, Gemini, Stable Diffusion, Runway, and Figma
- **Template System**: Create and manage reusable prompt templates
- **Parameter Controls**: Fine-tune generation parameters with visual sliders
- **Export Formats**: JSON, TOON (compact spec), CSV, and plain text
- **Offline-First**: No network calls, no telemetry, complete privacy
- **Cross-Platform**: Windows, macOS, and Linux

## Installation

### End Users

1. Download the installer for your platform from [Releases](../../releases)
   - **Windows**: `Prompt-Guru-Setup-{version}.exe`
   - **macOS**: `Prompt-Guru-{version}.dmg`
   - **Linux**: `Prompt-Guru-{version}.AppImage`

2. Run the installer and follow the prompts

3. Launch Prompt-Guru from:
   - **Windows**: Start Menu or Desktop shortcut
   - **macOS**: Applications folder
   - **Linux**: Application menu

4. The app will appear in your system tray

### System Requirements

- **Windows**: Windows 10 or later (64-bit)
- **macOS**: macOS 10.13 (High Sierra) or later
- **Linux**: Ubuntu 18.04 or equivalent (64-bit)
- **Memory**: 512 MB RAM minimum
- **Disk**: 200 MB available space

## Usage

### Quick Start

1. **Select an Adapter**: Choose from the sidebar (ChatGPT, Claude, etc.)
2. **Enter Your Prompt**: Type in the template editor
3. **Adjust Parameters**: Use sliders to fine-tune settings
4. **Preview**: See the built prompt in the playground
5. **Copy/Export**: Copy to clipboard or export in various formats

### Keyboard Shortcuts

- `Ctrl+Alt+P` (or `Cmd+Alt+P` on Mac): Toggle window visibility
- Right-click tray icon: Access context menu

### Adapters

#### Text-based AI

- **ChatGPT (OpenAI)**: Temperature, max tokens, top-p, frequency/presence penalties
- **Claude (Anthropic)**: Temperature, max tokens, top-p, top-k
- **Gemini (Google)**: Temperature, max tokens, top-p, top-k

#### Image Generation

- **Stable Diffusion**: Resolution, steps, guidance scale, seed, presets (photoreal, artistic, quick)

#### Video Generation

- **Runway**: Duration, FPS, resolution, motion strength, guidance scale, presets (cinematic, social, quick)

#### Design

- **Figma**: Canvas size, component count, complexity level, presets (mobile, desktop, component)

### Export Formats

- **Plain Text**: Copy directly to clipboard
- **JSON**: Full metadata with parameters and timestamp
- **TOON**: Compact component specification format
- **CSV**: Bulk operations and data analysis

## Development

### Prerequisites

- **Node.js**: 18.x or later
- **npm**: 9.x or later
- **Git**: For version control

### Platform-Specific Requirements

#### Windows
- **NSIS**: For creating `.exe` installers
  ```bash
  # Install NSIS via Chocolatey
  choco install nsis
  ```

#### macOS
- **Xcode Command Line Tools**:
  ```bash
  xcode-select --install
  ```

#### Linux
- **Build essentials**:
  ```bash
  sudo apt-get install build-essential libsecret-1-dev
  ```

### Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url> prompt-guru
   cd prompt-guru
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

   This will automatically:
   - Install root dependencies
   - Install renderer dependencies (via postinstall hook)

3. **Run in development mode**:
   ```bash
   npm run dev
   ```

   This will:
   - Start Vite dev server on http://localhost:5173
   - Compile TypeScript main process
   - Launch Electron with hot reload

**Note for Windows**: Make sure you're running in PowerShell or Command Prompt (not WSL) for native builds.

### Build Commands

#### Development

```bash
# Run both renderer and main in dev mode
npm run dev

# Run renderer dev server only
npm run dev:renderer

# Compile and run main process
npm run dev:main
```

#### Production Build

```bash
# Full build (renderer + main + package)
npm run build

# Build renderer only
npm run build:renderer

# Compile main process only
npm run build:main

# Bootstrap renderer (install deps + build)
npm run bootstrap
```

#### Testing

```bash
# Run unit tests
npm test

# Run linter
npm run lint
```

### Project Structure

```
prompt-guru/
├── main/                       # Electron main process
│   ├── main.ts                # Main entry point, window & tray management
│   ├── preload.ts             # Preload script for IPC
│   └── tsconfig.json          # TypeScript config for main
├── renderer/                   # React renderer process
│   ├── public/
│   │   ├── index.html         # HTML entry point
│   │   └── favicon.ico        # App icon
│   ├── src/
│   │   ├── App.tsx            # Main React component
│   │   ├── index.tsx          # React entry point
│   │   ├── styles.css         # Global styles
│   │   ├── components/        # React components
│   │   │   ├── Header.tsx     # Header with LinkedIn button
│   │   │   ├── AdapterList.tsx
│   │   │   ├── TemplateEditor.tsx
│   │   │   └── PromptPlayground.tsx
│   │   └── lib/
│   │       ├── adapters/      # Adapter JSON configs
│   │       ├── promptEngine.ts # Core prompt building logic
│   │       └── types.ts       # TypeScript definitions
│   ├── package.json
│   ├── vite.config.mjs        # Vite configuration
│   └── tsconfig.json          # TypeScript config for renderer
├── __tests__/                 # Unit tests
│   └── promptEngine.test.ts
├── .github/
│   └── workflows/
│       └── release.yml        # CI/CD pipeline
├── package.json               # Root package config
├── electron-builder.yml       # Electron builder config
├── jest.config.js             # Jest test config
└── README.md                  # This file
```

### Building Installers

#### Windows (Native Build)

**Requirements**: Must run on Windows (not WSL)

```bash
# In PowerShell or Command Prompt
npm install
npm run build
```

Output: `dist/Prompt-Guru Setup {version}.exe`

#### macOS

```bash
npm install
npm run build
```

Output: `dist/Prompt-Guru-{version}.dmg`

#### Linux

```bash
npm install
npm run build
```

Output: `dist/Prompt-Guru-{version}.AppImage`

### CI/CD

The project includes a GitHub Actions workflow that:

1. Builds on Windows, macOS, and Linux
2. Runs tests
3. Creates installers for each platform
4. Uploads artifacts
5. Creates GitHub releases on version tags

**To trigger a release**:

```bash
git tag v0.1.0
git push origin v0.1.0
```

## Architecture

### Electron Main Process

- **Window Management**: Creates and manages the main BrowserWindow
- **Tray Integration**: System tray icon with context menu
- **Global Shortcuts**: Registers hotkeys (Ctrl+Alt+P)
- **Security**: Prevents navigation to external URLs, sandboxed renderer

### Renderer Process (React)

- **Component Architecture**: Modular React components
- **State Management**: React hooks for local state
- **Adapter System**: JSON-based adapter configurations
- **Prompt Engine**: Template processing and validation

### Security Features

- **Context Isolation**: Enabled for renderer process
- **Node Integration**: Disabled in renderer
- **Sandbox**: Enabled for web contents
- **Content Security Policy**: Restricts resource loading
- **No Network Calls**: Offline-only by default

## Adding Custom Adapters

Create a new JSON file in `renderer/src/lib/adapters/`:

```json
{
  "id": "my_adapter",
  "display_name": "My Custom Adapter",
  "system_message": "Optional system message",
  "parameters": {
    "param_name": [min, max]
  },
  "prompt_template": "{system_message}\n\nUser: {user_input}\n\nParam: {param_name}",
  "metadata": {
    "category": "text|image|video|design",
    "provider": "Provider Name"
  }
}
```

## Troubleshooting

### "vite is not recognized" or TypeScript errors on first run

This happens if renderer dependencies aren't installed. Run:
```bash
npm run setup
```

Or manually:
```bash
cd renderer
npm install
```

Then try `npm run dev` again.

### Windows: Build fails with "NSIS not found"

Install NSIS:
```bash
choco install nsis
```

Or download from: https://nsis.sourceforge.io/Download

### macOS: "Cannot be opened because the developer cannot be verified"

Right-click the app → Open → Confirm

Or remove quarantine:
```bash
xattr -cr "/Applications/Prompt-Guru.app"
```

### Linux: AppImage won't run

Make executable:
```bash
chmod +x Prompt-Guru-*.AppImage
```

### Dev Mode: "Failed to load dev server"

Ensure Vite dev server is running:
```bash
cd renderer
npm run dev
```

### TypeScript errors in main/main.ts

If you see errors about `app.isQuitting`, ensure you're using the latest code:
```bash
git pull
npm install
```

## Contributing

This is a personal project by Dipankar. If you'd like to contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - See LICENSE file for details

## Credits

**Author**: [Dipankar](https://www.linkedin.com/in/dipankars/)

**Built with**:
- [Electron](https://www.electronjs.org/)
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [AJV](https://ajv.js.org/)

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

Made with ❤️ by Dipankar
