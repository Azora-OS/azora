# AzStudio Packaging and Distribution

This document describes the Windows packaging and distribution setup for AzStudio.

## Build Configuration

AzStudio uses `electron-builder` to create Windows installers with the following formats:

### NSIS Installer (.exe)
- Traditional Windows installer with custom installation directory
- Desktop and Start Menu shortcuts
- File associations for `.azstudio` project files
- Supports both x64 and ARM64 architectures
- Silent install option for enterprise deployment

### MSIX/AppX Package
- Modern Windows Store-compatible package
- Automatic updates through Windows Store
- Sandboxed execution for enhanced security
- Supports both x64 and ARM64 architectures

## Build Scripts

### Development
```bash
npm run dev              # Start development mode with hot reload
npm start                # Start Electron app from built files
```

### Building
```bash
npm run build            # Build main and renderer processes
npm run build:main       # Build main process only
npm run build:renderer   # Build renderer process only
```

### Packaging
```bash
npm run package          # Build and package for Windows (both NSIS and MSIX)
npm run package:nsis     # Build and create NSIS installer only
npm run package:msix     # Build and create MSIX package only
npm run package:dir      # Build unpacked directory (for testing)
npm run package:all      # Build all Windows formats
npm run dist             # Build and publish to update server
```

## Directory Structure

```
azstudio/
├── build/                          # Build resources
│   ├── icon.ico                    # Application icon (256x256)
│   ├── file-icon.ico               # File association icon
│   ├── installer-header.bmp        # NSIS installer header (150x57)
│   ├── installer-sidebar.bmp       # NSIS installer sidebar (164x314)
│   └── resources/                  # Extra resources bundled with app
├── dist/                           # Compiled application code
│   ├── main/                       # Main process compiled code
│   └── renderer/                   # Renderer process compiled code
├── release/                        # Built installers and packages
│   ├── AzStudio-Setup-0.1.0.exe   # NSIS installer
│   ├── AzStudio-0.1.0-x64.appx    # MSIX package (x64)
│   ├── AzStudio-0.1.0-arm64.appx  # MSIX package (ARM64)
│   └── win-unpacked/              # Unpacked application (for testing)
└── src/                            # Source code
```

## File Associations

AzStudio registers the `.azstudio` file extension for project files. When users double-click an `.azstudio` file, it will open in AzStudio.

## Installation Options

### NSIS Installer
- **Per-user installation** (default): Installs to `%LOCALAPPDATA%\Programs\AzStudio`
- **Per-machine installation**: Requires admin elevation, installs to `C:\Program Files\AzStudio`
- **Custom directory**: Users can choose installation location
- **Silent install**: `AzStudio-Setup-0.1.0.exe /S`

### MSIX Package
- Installed through Windows Store or PowerShell
- Automatic sandboxing and security
- Managed updates through Windows Update

## Auto-Updates

AzStudio includes automatic update functionality:

1. **Update Server**: Configured at `https://updates.azora.com/azstudio`
2. **Update Channel**: `latest` (can be changed to `beta` or `alpha`)
3. **Check Frequency**: On app startup and every 24 hours
4. **Update Process**:
   - Background download of updates
   - User notification when update is ready
   - Install on next app restart
   - Rollback support if update fails

## Code Signing

### Prerequisites
To enable code signing, you need:
1. Windows Authenticode code signing certificate (.pfx file)
2. Certificate password
3. Timestamp server URL

### Configuration
Set environment variables before building:

```bash
# Windows
set CSC_LINK=path\to\certificate.pfx
set CSC_KEY_PASSWORD=your_certificate_password
set WIN_CSC_LINK=path\to\certificate.pfx
set WIN_CSC_KEY_PASSWORD=your_certificate_password

# PowerShell
$env:CSC_LINK="path\to\certificate.pfx"
$env:CSC_KEY_PASSWORD="your_certificate_password"
$env:WIN_CSC_LINK="path\to\certificate.pfx"
$env:WIN_CSC_KEY_PASSWORD="your_certificate_password"
```

Then build:
```bash
npm run package
```

### Certificate Types
- **EV Code Signing Certificate** (recommended): No SmartScreen warnings
- **Standard Code Signing Certificate**: SmartScreen warnings until reputation is built
- **Self-signed Certificate**: For testing only, will show security warnings

## Build Optimization

The build configuration includes several optimizations:

1. **File Exclusion**: Source files, tests, and dev dependencies are excluded
2. **Compression**: Maximum compression for smaller installer size
3. **Architecture Support**: Both x64 and ARM64 builds
4. **Resource Bundling**: Extra resources in `build/resources/` are included

## Testing Installers

### Test NSIS Installer
```bash
npm run package:nsis
.\release\AzStudio-Setup-0.1.0.exe
```

### Test MSIX Package
```bash
npm run package:msix
Add-AppxPackage .\release\AzStudio-0.1.0-x64.appx
```

### Test Unpacked
```bash
npm run package:dir
.\release\win-unpacked\AzStudio.exe
```

## Distribution

### Direct Download
1. Build installers: `npm run package:all`
2. Upload to download server
3. Provide download links on website

### Windows Store
1. Build MSIX package: `npm run package:msix`
2. Submit to Microsoft Partner Center
3. Pass certification requirements
4. Publish to Windows Store

### Enterprise Deployment
1. Build NSIS installer with silent install support
2. Distribute via Group Policy or SCCM
3. Silent install command: `AzStudio-Setup-0.1.0.exe /S /D=C:\Program Files\AzStudio`

## Troubleshooting

### Build Fails
- Ensure all dependencies are installed: `npm install`
- Clean build: `rm -rf dist release && npm run build`
- Check Node.js version: Requires Node.js 20+

### Installer Won't Run
- Check Windows SmartScreen settings
- Verify code signing certificate is valid
- Try running as administrator

### Auto-Update Fails
- Check update server is accessible
- Verify `latest.yml` manifest is present
- Check network firewall settings

## CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: Build and Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run package:all
        env:
          CSC_LINK: ${{ secrets.WINDOWS_CERTIFICATE }}
          CSC_KEY_PASSWORD: ${{ secrets.CERTIFICATE_PASSWORD }}
      - uses: actions/upload-artifact@v3
        with:
          name: installers
          path: release/*.exe
```

## Security Considerations

1. **Code Signing**: Always sign production builds
2. **Update Server**: Use HTTPS for update server
3. **Certificate Storage**: Never commit certificates to version control
4. **Environment Variables**: Use secure CI/CD secrets for certificates
5. **Verification**: Enable update signature verification in production

## Resources

- [electron-builder Documentation](https://www.electron.build/)
- [Windows Code Signing Guide](https://docs.microsoft.com/en-us/windows/win32/seccrypto/cryptography-tools)
- [MSIX Packaging](https://docs.microsoft.com/en-us/windows/msix/)
- [NSIS Documentation](https://nsis.sourceforge.io/Docs/)
