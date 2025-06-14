# Git Hooks for All Microservices

This directory contains Git hooks that automatically format code in affected microservices before commits.

## Quick Setup

After cloning this repository, run:

```bash
node commands/install-hooks.js
```

This will set up the pre-commit hook that automatically formats code in any microservice that has staged files.

## How It Works

1. **Pre-commit Detection**: When you run `git commit`, the hook detects which files are staged
2. **Microservice Identification**: Determines which microservices contain the staged files
3. **Automatic Formatting**: Runs the appropriate formatting command for each affected microservice
4. **Re-staging**: Automatically re-stages the formatted files so they're included in the commit

## Configuration

Edit `commands/hooks.config.json` to manage microservice configurations:

```json
{
  "microservices": {
    "path/to/microservice": {
      "command": "npm run format",
      "type": "node",
      "description": "Description of the microservice"
    }
  }
}
```

## Supported Languages & Commands

- **Node.js**: `npm run format`
- **Python**: `black . && isort .`
- **Go**: `gofmt -w .`
- **Rust**: `cargo fmt`
- **C#**: `dotnet format`
- **Java**: `mvn spotless:apply`

## Files

- `install-hooks.js` - Sets up Git hooks for new developers
- `pre-commit-format.js` - Main formatting logic
- `hooks.config.json` - Configuration for all microservices

## Manual Testing

You can test the formatting script manually:

```bash
# Stage some files first
git add src/backend/authentication/some-file.ts

# Run the formatter
node commands/pre-commit-format.js
```

## Bypass Hook (Emergency)

If you need to commit without formatting:

```bash
git commit --no-verify -m "Emergency commit"
```

## Troubleshooting

### Hook Not Running

1. Make sure you ran `node commands/install-hooks.js`
2. Check that Node.js is installed and accessible
3. Verify you're in the project root directory

### Formatting Fails

1. Test the formatting command manually in the microservice directory
2. Ensure all dependencies are installed
3. Check the command syntax in `hooks.config.json`

### Adding New Microservices

1. Add the microservice path and configuration to `hooks.config.json`
2. Test with staged files from that microservice
3. No need to reinstall hooks - changes are picked up automatically
