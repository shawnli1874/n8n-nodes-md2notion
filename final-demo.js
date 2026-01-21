#!/usr/bin/env node

/**
 * Final Toggle Headings Demo
 * Demonstrates the complete toggle headings functionality
 */

require('dotenv').config();

const demoMarkdown = `# 📚 Project Documentation

Welcome to our comprehensive project documentation. This main section contains all the essential information.

## 🚀 Getting Started

This section will guide you through the initial setup process.

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (version 16 or higher)
- npm or yarn package manager
- Git for version control

### Installation Steps

Follow these steps to get the project running:

1. Clone the repository
2. Install dependencies
3. Configure environment variables
4. Run the development server

\`\`\`bash
git clone https://github.com/example/project.git
cd project
npm install
npm run dev
\`\`\`

## 📖 API Reference

This section contains detailed API documentation.

### Authentication

All API requests require authentication using Bearer tokens.

> **Important**: Keep your API keys secure and never commit them to version control.

### Endpoints

#### User Management

- \`GET /api/users\` - List all users
- \`POST /api/users\` - Create a new user
- \`PUT /api/users/:id\` - Update user information

#### Data Operations

- \`GET /api/data\` - Retrieve data
- \`POST /api/data\` - Submit new data

## 🔧 Configuration

Configuration options and environment setup.

### Environment Variables

Set these variables in your \`.env\` file:

- \`DATABASE_URL\` - Database connection string
- \`API_KEY\` - External service API key
- \`PORT\` - Server port (default: 3000)

## 📝 Contributing

Guidelines for contributing to the project.

### Code Style

We follow strict coding standards:

- Use TypeScript for type safety
- Follow ESLint rules
- Write comprehensive tests
- Document all public APIs

### Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

Some final notes and additional resources can be found in our wiki.`;

async function runFinalDemo() {
    console.log('🎯 Final Toggle Headings Demo\n');
    console.log('This demo shows the complete toggle headings functionality:');
    console.log('✅ Hierarchical nesting (headings contain sub-headings)');
    console.log('✅ Content becomes child blocks under headings');
    console.log('✅ Preserves all markdown formatting (code, lists, quotes)');
    console.log('✅ Handles orphan content appropriately');
    console.log('✅ Uses proper Notion API with is_toggleable: true\n');
    
    if (!process.env.NOTION_TOKEN || !process.env.NOTION_PAGE_ID) {
        console.log('⚠️  To run the live demo, add these to your .env file:');
        console.log('   NOTION_TOKEN=your_notion_integration_token');
        console.log('   NOTION_PAGE_ID=your_test_page_id\n');
        console.log('📊 Running structure analysis only...\n');
        
        try {
            const { MarkdownToNotion } = require('./dist/nodes/MarkdownToNotion/MarkdownToNotion.node.js');
            
            const structure = await MarkdownToNotion.convertMarkdownToToggleStructure(
                demoMarkdown, true, '$', true
            );
            
            console.log('📋 Generated Structure:');
            console.log(`📁 Root sections: ${structure.rootNodes.length}`);
            console.log(`📄 Orphan blocks: ${structure.orphanBlocks.length}\n`);
            
            structure.rootNodes.forEach((node, i) => {
                const title = node.heading.heading_1?.rich_text?.[0]?.text?.content || 'Unknown';
                console.log(`${i + 1}. 📁 ${title} (Level ${node.level})`);
                console.log(`   └── ${node.children.length} direct children`);
                
                node.subHeadings.forEach((sub, j) => {
                    const subTitle = getHeadingText(sub.heading);
                    console.log(`   ${j + 1}. 📁 ${subTitle} (Level ${sub.level})`);
                    console.log(`      └── ${sub.children.length} children, ${sub.subHeadings.length} sub-sections`);
                    
                    sub.subHeadings.forEach((nested, k) => {
                        const nestedTitle = getHeadingText(nested.heading);
                        console.log(`      ${k + 1}. 📁 ${nestedTitle} (Level ${nested.level})`);
                        console.log(`         └── ${nested.children.length} children`);
                    });
                });
            });
            
            console.log('\n✨ Structure analysis complete!');
            console.log('   This hierarchical structure will be created in Notion with');
            console.log('   each heading as a toggleable section containing its content.');
            
        } catch (error) {
            console.error('❌ Demo failed:', error.message);
        }
        
        return;
    }
    
    // Run live demo with real API
    console.log('🌐 Running live demo with Notion API...\n');
    
    try {
        const { MarkdownToNotion } = require('./dist/nodes/MarkdownToNotion/MarkdownToNotion.node.js');
        
        const mockExecuteFunctions = {
            getNode: () => ({ name: 'Toggle Headings Demo' }),
            helpers: {
                httpRequestWithAuthentication: {
                    call: async (context, authType, options) => {
                        const fetch = (await import('node-fetch')).default;
                        
                        const response = await fetch(options.url, {
                            method: options.method,
                            headers: {
                                'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
                                'Notion-Version': '2022-06-28',
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(options.body)
                        });
                        
                        if (!response.ok) {
                            const errorText = await response.text();
                            throw new Error(`API error: ${response.status} - ${errorText}`);
                        }
                        
                        return await response.json();
                    }
                }
            }
        };
        
        const result = await MarkdownToNotion.processToggleHeadingsWithAPI(
            mockExecuteFunctions,
            process.env.NOTION_PAGE_ID,
            demoMarkdown,
            {
                preserveMath: true,
                mathDelimiter: '$',
                supportLatex: true,
                toggleHeadings: true
            },
            0
        );
        
        console.log('🎉 Live Demo Results:');
        console.log(`✅ Success: ${result.json.success}`);
        console.log(`📊 Total blocks created: ${result.json.blocksAdded}`);
        console.log(`🔄 API calls made: ${result.json.chunksProcessed}`);
        
        if (result.json.warnings?.length > 0) {
            console.log(`⚠️  Warnings: ${result.json.warnings.length}`);
        }
        
        const pageUrl = `https://notion.so/${process.env.NOTION_PAGE_ID.replace(/-/g, '')}`;
        console.log(`\n🔗 View the result: ${pageUrl}`);
        
        console.log('\n📋 What you should see in Notion:');
        console.log('   📁 Project Documentation (toggleable)');
        console.log('      ├── Welcome text');
        console.log('      ├── 📁 Getting Started (toggleable)');
        console.log('      │   ├── Section intro');
        console.log('      │   ├── 📁 Prerequisites (toggleable)');
        console.log('      │   │   └── Requirements list');
        console.log('      │   └── 📁 Installation Steps (toggleable)');
        console.log('      │       ├── Step instructions');
        console.log('      │       └── Code block');
        console.log('      ├── 📁 API Reference (toggleable)');
        console.log('      │   ├── API intro');
        console.log('      │   ├── 📁 Authentication (toggleable)');
        console.log('      │   │   └── Auth info + blockquote');
        console.log('      │   └── 📁 Endpoints (toggleable)');
        console.log('      │       ├── 📁 User Management');
        console.log('      │       └── 📁 Data Operations');
        console.log('      ├── 📁 Configuration (toggleable)');
        console.log('      │   └── 📁 Environment Variables');
        console.log('      └── 📁 Contributing (toggleable)');
        console.log('          ├── 📁 Code Style');
        console.log('          └── 📁 Pull Request Process');
        console.log('   └── Final notes (orphan content)');
        
    } catch (error) {
        console.error('❌ Live demo failed:', error.message);
        
        if (error.message.includes('401')) {
            console.error('   🔑 Check your NOTION_TOKEN');
        } else if (error.message.includes('404')) {
            console.error('   📄 Check your NOTION_PAGE_ID');
        }
    }
}

function getHeadingText(headingBlock) {
    const types = ['heading_1', 'heading_2', 'heading_3', 'heading_4'];
    for (const type of types) {
        if (headingBlock[type]?.rich_text?.[0]?.text?.content) {
            return headingBlock[type].rich_text[0].text.content;
        }
    }
    return 'Unknown';
}

runFinalDemo();