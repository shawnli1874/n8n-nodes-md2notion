#!/bin/bash

# n8n Markdown to Notion Node - NPM Publishing Script
# This script prepares and publishes the node to npm registry

set -e

echo "🚀 Preparing to publish n8n-nodes-markdown-to-notion..."
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Check if user is logged in to npm
echo "🔐 Checking npm authentication..."
if ! npm whoami > /dev/null 2>&1; then
    echo "❌ You are not logged in to npm."
    echo "   Please run: npm login"
    echo "   If you don't have an npm account, create one at: https://www.npmjs.com/signup"
    exit 1
fi

NPM_USER=$(npm whoami)
echo "✅ Logged in as: $NPM_USER"

# Check if package name is available
echo "📦 Checking package availability..."
if npm view n8n-nodes-markdown-to-notion > /dev/null 2>&1; then
    echo "⚠️  Package 'n8n-nodes-markdown-to-notion' already exists on npm."
    echo "   This will publish a new version. Make sure you have permission to publish."
    read -p "   Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Publishing cancelled."
        exit 1
    fi
    
    # Bump version
    echo "📈 Bumping version..."
    npm version patch --no-git-tag-version
else
    echo "✅ Package name is available for first-time publishing."
fi

# Run tests
echo "🧪 Running tests..."
if ! npm test; then
    echo "❌ Tests failed. Please fix issues before publishing."
    exit 1
fi

echo "✅ All tests passed."

# Build the project
echo "🔨 Building project..."
if ! npm run build; then
    echo "❌ Build failed. Please fix build issues before publishing."
    exit 1
fi

echo "✅ Build completed successfully."

# Verify build output
if [ ! -d "dist" ]; then
    echo "❌ Build output directory 'dist' not found."
    exit 1
fi

if [ ! -f "dist/nodes/MarkdownToNotion/MarkdownToNotion.node.js" ]; then
    echo "❌ Main node file not found in build output."
    exit 1
fi

if [ ! -f "dist/credentials/NotionApi.credentials.js" ]; then
    echo "❌ Credentials file not found in build output."
    exit 1
fi

echo "✅ Build output verified."

# Show what will be published
echo "📋 Files to be published:"
npm pack --dry-run

echo ""
echo "🚀 Ready to publish!"
echo "   Package: n8n-nodes-markdown-to-notion"
echo "   Version: $(node -p "require('./package.json').version")"
echo "   Registry: $(npm config get registry)"
echo ""

read -p "Proceed with publishing? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Publishing cancelled."
    exit 1
fi

# Publish to npm
echo "📦 Publishing to npm..."
if npm publish; then
    PACKAGE_VERSION=$(node -p "require('./package.json').version")
    echo ""
    echo "🎉 Successfully published n8n-nodes-markdown-to-notion@$PACKAGE_VERSION!"
    echo ""
    echo "📋 What happens next:"
    echo "   • Package is now available on npm registry"
    echo "   • Users can install via n8n Community Nodes interface"
    echo "   • Package will appear in n8n community nodes search"
    echo ""
    echo "📖 Installation instructions for users:"
    echo "   1. In n8n, go to Settings → Community Nodes"
    echo "   2. Enter package name: n8n-nodes-markdown-to-notion"
    echo "   3. Click Install"
    echo ""
    echo "   Or via command line:"
    echo "   npm install -g n8n-nodes-markdown-to-notion"
    echo ""
    echo "🔗 Package URL: https://www.npmjs.com/package/n8n-nodes-markdown-to-notion"
    echo ""
    echo "🎯 Next steps:"
    echo "   • Share in n8n community forums"
    echo "   • Create GitHub releases"
    echo "   • Monitor for user feedback"
    echo "   • Update documentation as needed"
else
    echo "❌ Publishing failed. Please check the error messages above."
    exit 1
fi