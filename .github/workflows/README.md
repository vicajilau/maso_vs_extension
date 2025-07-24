# GitHub Actions Workflow

This file defines the Continuous Integration (CI) pipeline for the MASO File Support extension.

## Workflow: `ci.yml`

### Triggers
- **Push to main**: Runs on every commit pushed to the main branch
- **Pull requests**: Runs on every pull request targeting main branch

### Platforms
Tests run on multiple operating systems to ensure cross-platform compatibility:
- Ubuntu (Linux)
- Windows
- macOS

### Pipeline Steps

1. **Checkout**: Get the source code
2. **Setup Node.js**: Install Node.js 18.x
3. **Install dependencies**: `npm ci` (clean install)
4. **Linting**: `npm run lint` (ESLint checks)
5. **Type checking**: `npm run check-types` (TypeScript validation)
6. **Compile**: `npm run compile` (Build the extension)
7. **Run tests**: `npm test` (Execute all automated tests with Xvfb for headless VS Code)
8. **Package**: `npm run vsce:package` (Create VSIX file, Ubuntu only)
9. **Upload artifact**: Save the VSIX file for download

### Features

- **Multi-platform testing**: Ensures the extension works on all major OS
- **Comprehensive checks**: Linting, type checking, compilation, and testing
- **Artifact creation**: Automatic VSIX packaging for distribution
- **Fast feedback**: Quick notifications on build failures
- **Parallel execution**: Tests run simultaneously on all platforms

### Status Badge

Add this to your README to show build status:
```markdown
![CI](https://github.com/vicajilau/maso_vs_extension/workflows/CI%20-%20Test%20Extension/badge.svg)
```

### Local Testing

To run the same checks locally before pushing:

```bash
# Full CI simulation
npm ci
npm run lint
npm run check-types
npm run compile
npm test
npm run vsce:package
```

### Troubleshooting

- **Test failures**: Check test output in the Actions tab
- **Linting errors**: Run `npm run lint` locally to see issues
- **Type errors**: Run `npm run check-types` to see TypeScript issues
- **Platform-specific issues**: Check logs for specific OS failures
