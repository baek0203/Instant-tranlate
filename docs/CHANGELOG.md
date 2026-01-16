# Changelog

All notable changes to DragTranslator will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.2] - 2026-01-11

### Fixed
- Fixed translation button not displaying with rounded corners
- Fixed translation result not showing in popup (element query issue)
- Fixed "Extension context invalidated" error during development
- Added proper error handling for extension context validation
- Fixed duplicate script injection prevention

### Changed
- Improved translation reliability with 2-retry mechanism
- Reduced retry delay from 0.5s to 0.3s for faster response
- Increased timeout per attempt from 3s to 5s
- Removed fallback translation APIs (MyMemory, LibreTranslate) for better performance
- Changed popup element query from `document.getElementById` to `translationPopup.querySelector`
- Added `User-Agent` header to translation API requests

### Added
- Added comprehensive debug logging for troubleshooting
- Added extension context validation checks in all chrome API calls
- Added user-friendly error messages for context invalidation
- Added script initialization guard to prevent duplicate execution

### Documentation
- Added `fail-and-trial.md` documenting development challenges and solutions
- Added `git-guide.md` comprehensive Git usage guide
- Added detailed comments explaining extension context issues

### Technical Details
- `host_permissions` changed to `<all_urls>` for universal compatibility
- SVG button now uses CSS `border-radius` instead of SVG `rx` attribute
- Translation timeout increased to 15 seconds in content script
- Maximum retry count: 2 attempts (total 3 tries including initial attempt)

## [1.4.1] - 2026-01-09

### Added
- Added Privacy Policy document for Chrome Web Store compliance
- Multi-language support (10 languages: EN, KO, JA, ZH-CN, ZH-TW, ES, FR, DE, RU, AR)
- Translation history with save, export, and delete features
- Settings page for default language configuration
- Custom i18n system for dynamic UI language switching
- Menu dropdown with Info and Contact options

### Changed
- Migrated to Chrome i18n API for extension metadata
- Updated button positioning to follow drag end point
- Improved popup UI with dark theme
- Enhanced button hover effects

### Fixed
- Fixed settings button not opening properly
- Fixed text truncation in UI elements
- Fixed translation button positioning issues

## [1.4.0] - 2026-01-07

### Added
- Initial release with drag-to-translate functionality
- Google Translate API integration
- Translation popup with save feature
- Browser action popup for translation history
- Support for multiple languages

### Features
- Drag text to show translation button
- Click button to translate selected text
- Save translations to local storage
- View translation history in popup
- Export translations as JSON
- Delete individual or all translations

---

## Version Numbering

- **Major version (X.0.0)**: Breaking changes, major rewrites
- **Minor version (1.X.0)**: New features, backwards compatible
- **Patch version (1.4.X)**: Bug fixes, minor improvements

## Upgrade Guide

### From 1.4.1 to 1.4.2

No action required. Simply update the extension in Chrome Web Store or reload it in `chrome://extensions`.

**Note for developers**: If you're developing with the extension loaded unpacked:
1. Remove the extension from Chrome
2. Close Chrome completely
3. Reopen Chrome
4. Load the extension again

This prevents "Extension context invalidated" errors during development.

### Known Issues

- **Development only**: "Extension context invalidated" error may occur when reloading the extension. Solution: Refresh the web page (F5) after reloading the extension.
- Translation may be slow on first use after Chrome restarts (API warm-up time)

### Breaking Changes

None in this version.

---

## Future Roadmap

### Version 1.5.0 (Planned)
- [ ] Offline translation support
- [ ] Custom translation API selection
- [ ] Keyboard shortcuts
- [ ] Translation history search
- [ ] Auto-detect and translate

### Version 2.0.0 (Future)
- [ ] Voice output for translations
- [ ] OCR for image text translation
- [ ] Browser-wide translation toggle
- [ ] Sync translation history across devices

---

## Links

- [GitHub Repository](https://github.com/baek0203/DragTranslator)
- [Privacy Policy](https://baek0203.github.io/DragTranslator/privacy-policy)
- [Report Issues](https://github.com/baek0203/DragTranslator/issues)
- [Feedback Form](https://forms.gle/EzyJPL7aD3wKY8X49)

---

**Last Updated**: 2026-01-11
