# Testing Guide

This document explains how to run and develop tests for the MASO File Support extension.

## Running Tests

### Quick Test Run

```bash
npm test
```

### Individual Test Commands

```bash
# Compile tests only
npm run compile-tests

# Run tests with unit focus
npm run test:unit

# Watch tests during development
npm run test:watch
```

### From VS Code

1. Open Command Palette (`Ctrl+Shift+P`)
2. Run "Tasks: Run Task"
3. Select "npm: test"

Or use the debug configuration:

1. Go to Run and Debug (`Ctrl+Shift+D`)
2. Select "Run Extension Tests"
3. Press F5

### Continuous Integration

The project uses GitHub Actions for automated testing on every push:

- **Workflow file**: `.github/workflows/ci.yml`
- **Triggers**: Push to `main` branch and pull requests
- **Platforms**: Ubuntu, Windows, and macOS
- **Steps**: Install → Lint → Type Check → Compile → Test → Package

#### CI Status

You can check the current status at: https://github.com/vicajilau/maso_vs_extension/actions

#### Local CI Simulation

To run the same checks locally as in CI:

```bash
npm ci              # Clean install (like CI)
npm run lint        # Linting checks
npm run check-types # TypeScript type checking
npm run compile     # Compilation
npm test            # Run tests
npm run vsce:package # Package extension
```

## Test Structure

### Test Categories

The test suite covers:

1. **Valid File Tests**

   - ✅ Valid regular mode files
   - ✅ Valid burst mode files

2. **Type Validation Tests**

   - ❌ Invalid `enabled` type (string instead of boolean)
   - ❌ Invalid `arrival_time` type (string instead of integer)
   - ❌ Invalid `service_time` type (decimal instead of integer)
   - ❌ Invalid `id` type (number instead of string)

3. **Value Validation Tests**

   - ❌ Negative `arrival_time` values
   - ❌ Negative `service_time` values
   - ❌ Duplicate process IDs

4. **Structure Validation Tests**

   - ❌ Missing required metadata fields
   - ❌ Missing required process fields
   - ❌ Invalid burst types

5. **Burst Mode Specific Tests**
   - ❌ Invalid burst types (not "cpu" or "io")
   - ❌ Missing thread fields

### Test Files

Tests are located in:

- `test/extension.test.ts` - Main test suite
- `test-files/` - Temporary test files (auto-generated, git-ignored)

## Adding New Tests

### Basic Test Template

```typescript
test("Description of what should happen", async () => {
  const testContent = `{
      // Your test MASO content here
    }`;

  const document = await createTestDocument(testContent, "test-name.maso");
  const diagnostics = await getDiagnostics(document);

  // Assertions
  assert.ok(diagnostics.length > 0, "Should have diagnostics");
  const specificError = diagnostics.find((d) =>
    d.message.includes("expected error text")
  );
  assert.ok(specificError, "Should have specific error message");
});
```

### Test Categories to Add

Consider adding tests for:

1. **Edge Cases**

   - Empty files
   - Malformed JSON
   - Very large numbers
   - Unicode characters in IDs

2. **Complex Scenarios**

   - Mixed valid/invalid elements
   - Multiple error types in one file
   - Nested validation errors

3. **Performance Tests**
   - Large files with many elements
   - Complex burst mode files

## Test Utilities

### Helper Functions

- `createTestDocument(content, fileName)` - Creates temporary test files
- `getDiagnostics(document)` - Retrieves validation diagnostics
- `assert.strictEqual()` - Exact equality checks
- `assert.ok()` - Boolean assertions

### Available Assertions

```typescript
// No errors expected
assert.strictEqual(diagnostics.length, 0, "Should have no diagnostics");

// Errors expected
assert.ok(diagnostics.length > 0, "Should have diagnostics");

// Specific error message
const error = diagnostics.find((d) => d.message.includes("expected text"));
assert.ok(error, "Should have specific error");

// Multiple errors
assert.ok(diagnostics.length >= 2, "Should have multiple errors");
```

## Continuous Integration

### GitHub Actions (Future)

To set up automated testing:

```yaml
# .github/workflows/test.yml
name: Test Extension

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "18"
      - run: npm ci
      - run: npm test
```

### Pre-commit Hooks

Consider adding:

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run compile && npm test"
    }
  }
}
```

## Test Coverage

### Current Coverage

The test suite currently covers:

- ✅ **Type validation**: All field types (string, integer, boolean)
- ✅ **Value validation**: Non-negative numbers, valid enums
- ✅ **Structure validation**: Required fields, array types
- ✅ **Business logic**: Duplicate IDs, mode-specific fields
- ✅ **Both modes**: Regular and burst mode validation

### Areas for Expansion

- 🔲 **Error positioning**: Line and column accuracy
- 🔲 **Complex nesting**: Deep validation errors
- 🔲 **Performance**: Large file handling
- 🔲 **Integration**: VS Code API integration
- 🔲 **Regression**: Specific bug scenarios

## Debugging Tests

### VS Code Debugging

1. Set breakpoints in test files
2. Use "Run Extension Tests" configuration
3. Step through test execution

### Console Output

```typescript
// Add debugging output
console.log(
  "Diagnostics:",
  diagnostics.map((d) => d.message)
);
```

### Test Isolation

Each test creates isolated temporary files, so tests don't interfere with each other.

## Best Practices

### Test Writing

1. **Descriptive names**: Test names should explain the expected behavior
2. **Single responsibility**: One concept per test
3. **Clear assertions**: Use descriptive assertion messages
4. **Realistic data**: Use realistic MASO file content

### Maintenance

1. **Keep tests updated**: When validation rules change, update tests
2. **Regular runs**: Run tests frequently during development
3. **CI integration**: Ensure tests run on every commit
4. **Documentation**: Keep this guide updated

## Troubleshooting

### Common Issues

**Tests timeout**: Increase wait time in `getDiagnostics()`

```typescript
await new Promise((resolve) => setTimeout(resolve, 1000)); // Increase from 500ms
```

**Extension not loading**: Check extension activation events and ensure `.maso` files trigger activation

**Diagnostics not appearing**: Verify the extension's diagnostic collection is working

### VS Code Test Issues

- Ensure VS Code test runner is properly installed
- Check that test files are in the correct directory structure
- Verify TypeScript compilation is working
