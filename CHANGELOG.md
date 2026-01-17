# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2024-01-17

### Added
- Initial release of n8n Markdown to Notion node
- Support for converting markdown content to Notion page blocks
- Proper math formula preservation (fixes common `$formula$` conversion errors)
- Support for all major markdown elements:
  - Headings (H1-H3)
  - Paragraphs with rich text formatting
  - Bold and italic text
  - Inline code
  - Code blocks with syntax highlighting
  - Bulleted and numbered lists
  - Blockquotes
  - Links
- Configurable options:
  - Math formula preservation toggle
  - Custom math delimiter configuration
- Comprehensive error handling and user feedback
- TypeScript implementation with full type safety
- Complete test suite for core functionality
- Detailed documentation and usage examples

### Technical Details
- Uses reliable remark ecosystem for markdown parsing
- Implements smart formula protection algorithm
- Generates Notion-compatible block structures
- Integrates with Notion API v2022-06-28
- Supports n8n workflow integration

### Documentation
- Complete README with installation and usage instructions
- Contributing guidelines for open source development
- MIT license for open source distribution
- Comprehensive test examples and edge cases

[Unreleased]: https://github.com/your-username/n8n-nodes-markdown-to-notion/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/your-username/n8n-nodes-markdown-to-notion/releases/tag/v1.0.0