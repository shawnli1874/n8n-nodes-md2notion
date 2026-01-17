# Contributing to n8n-nodes-markdown-to-notion

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## 🐛 Reporting Issues

Before creating an issue, please:

1. **Search existing issues** to avoid duplicates
2. **Use the issue template** if available
3. **Provide clear reproduction steps** for bugs
4. **Include your environment details**:
   - n8n version
   - Node.js version
   - Operating system

## 💡 Feature Requests

We welcome feature requests! Please:

1. **Check existing issues** for similar requests
2. **Describe the use case** clearly
3. **Explain why this feature would be valuable**
4. **Consider if it fits the project scope**

## 🔧 Development Setup

### Prerequisites

- Node.js 16+ 
- npm or yarn
- n8n installed locally for testing

### Setup Steps

```bash
# Clone the repository
git clone https://github.com/your-username/n8n-nodes-markdown-to-notion.git
cd n8n-nodes-markdown-to-notion

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
```

### Testing Your Changes

```bash
# Run the test suite
npm test

# Test the node manually
node core-test.js

# Install locally in n8n for integration testing
cp -r dist/* ~/.n8n/custom/
# Restart n8n and test in the UI
```

## 📝 Code Style

- **TypeScript**: Use TypeScript for all source code
- **Formatting**: Run `npm run format` before committing
- **Linting**: Ensure `npm run lint` passes
- **Comments**: Only add comments for complex logic or important context

## 🔄 Pull Request Process

1. **Fork the repository** and create a feature branch
2. **Make your changes** following the code style guidelines
3. **Add tests** for new functionality
4. **Update documentation** if needed
5. **Ensure all tests pass** (`npm test`)
6. **Create a pull request** with:
   - Clear title and description
   - Reference to related issues
   - Screenshots/examples if applicable

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Manual testing completed
- [ ] Integration testing in n8n

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

## 🧪 Testing Guidelines

### Unit Tests
- Test core functionality in isolation
- Mock external dependencies (Notion API)
- Cover edge cases and error conditions

### Integration Tests
- Test the complete workflow
- Verify Notion API integration
- Test with real markdown content

### Manual Testing
- Install the node in a local n8n instance
- Test various markdown inputs
- Verify formula preservation works correctly

## 📚 Documentation

When contributing:

- **Update README.md** for user-facing changes
- **Add inline documentation** for complex functions
- **Update examples** if behavior changes
- **Keep documentation concise** and accurate

## 🏷️ Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🤝 Code of Conduct

### Our Standards

- **Be respectful** and inclusive
- **Focus on constructive feedback**
- **Help others learn and grow**
- **Assume good intentions**

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or inflammatory comments
- Personal attacks
- Publishing private information

## 🆘 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **Discussions**: For questions and general discussion
- **n8n Community**: For n8n-specific questions

## 🎯 Project Goals

This project aims to:

1. **Solve formula conversion issues** in markdown-to-Notion workflows
2. **Provide reliable markdown parsing** using the remark ecosystem
3. **Maintain compatibility** with n8n's node architecture
4. **Offer excellent user experience** with clear error messages

Thank you for contributing! 🚀