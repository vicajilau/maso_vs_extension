<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# MASO File Support Extension

This is a VS Code extension project for supporting .maso files. Please use the get_vscode_api with a query as input to fetch the latest VS Code API references.

## Project Context

This extension provides:

- Language support for .maso files (JSON-based format)
- Schema validation for MASO file structure
- Syntax highlighting specific to MASO fields
- Real-time error diagnostics
- Custom validation rules for process scheduling data

## MASO File Structure

MASO files contain process scheduling information with the following schema:

- `metadata`: Contains name, version, and description
- `processes`: Contains mode (regular/priority/round_robin) and elements array
- Each process element has: id, arrival_time, service_time, enabled

## Development Guidelines

- Use TypeScript for type safety
- Leverage VS Code's diagnostic API for error reporting
- Implement JSON schema validation using AJV
- Follow VS Code extension best practices
- Test with real .maso files during development
