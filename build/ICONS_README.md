# Build Assets - Icons

This directory should contain the application icons for different platforms.

## Required Icons

### Windows
- **icon.ico**: 256x256 icon file for Windows installer and application

### macOS
- **icon.icns**: macOS icon set (should include multiple sizes: 16x16, 32x32, 128x128, 256x256, 512x512, 1024x1024)

### Linux
- **icon.png**: 512x512 PNG icon for Linux

### Tray Icon
- **tray-icon.png**: Small icon (16x16 or 32x32) for system tray, should be simple and recognizable at small sizes

## Creating Icons

You can use tools like:
- [Electron Icon Maker](https://www.npmjs.com/package/electron-icon-maker)
- [Image2icon](https://img2icons.com/) (online)
- Photoshop, GIMP, or Figma for design

### Quick Setup with electron-icon-maker

```bash
npm install -g electron-icon-maker

# Create a 1024x1024 PNG source image first (source.png)
electron-icon-maker --input=source.png --output=./build
```

## Placeholder Icons

For development, the app will work without icons but may show default Electron icon.
For production releases, proper branded icons should be added.

## Design Guidelines

- Use a simple, recognizable symbol
- Ensure good contrast for visibility
- Test at small sizes (especially tray icon)
- Follow platform design guidelines
  - Windows: Rounded corners, 3D effect acceptable
  - macOS: Rounded square (superellipse), flat design
  - Linux: Varies by desktop environment
