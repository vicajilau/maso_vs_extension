# Changelog

All notable changes to the "maso_vs_extension" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.1.0]

- Enhanced icon support for MASO files across VS Code interface
- Menu integration for validation commands
  - Added "Validate MASO File" to editor title bar for .maso files
  - Added validation option to explorer context menu for .maso files
- Improved file format support and recognition
- Enhanced syntax highlighting with better JSON schema integration
- Command icons visible in toolbar when working with .maso files
- Better visual identification of MASO files in File Explorer
- Enhanced user experience with accessible validation commands
- More intuitive workflow for MASO file validation
- Refined icon presentation for both light and dark themes

## [0.0.1]

- Initial release of MASO File Support extension
- Language support for `.maso` files with JSON-based syntax highlighting
- Custom icon for MASO files in File Explorer and editor tabs
- Schema validation for MASO file structure
- Support for Regular mode process scheduling data
  - Process elements with id, arrival_time, service_time, and enabled fields
- Support for Burst mode process scheduling data
  - Process elements with threads containing CPU/IO bursts
- Real-time error diagnostics and validation
- Command: "Validate MASO File" for manual file validation
- Configuration options:
  - `maso.validation.enabled`: Enable/disable MASO file validation
  - `maso.validation.strictMode`: Enable strict validation mode
- TypeScript implementation with comprehensive type safety
- Custom grammar for syntax highlighting specific to MASO fields
- Automatic validation on file save and content changes- Automatic validation on file save and content changes
- Context-aware error messages for invalid MASO structures- Context-aware error messages for invalid MASO structures
- Support for both regular and burst scheduling modes- Support for both regular and burst scheduling modes
- Metadata validation (name, version, description)- Metadata validation (name, version, description)
- Process structure validation with mode-specific rules
