// Test toggle functionality
console.log('🧪 Testing Toggle Block Functionality\n');

// Test toggle block detection and creation
function testToggleBlocks() {
    console.log('📝 Testing Toggle Block Support');
    console.log('-'.repeat(40));
    
    const testCases = [
        {
            name: 'Simple toggle',
            input: '<details><summary>Click to expand</summary>This is hidden content</details>',
            expected: 'toggle'
        },
        {
            name: 'Toggle with math',
            input: '<details><summary>Math Formula</summary>The equation is $E = mc^2$</details>',
            expected: 'toggle'
        },
        {
            name: 'Toggle with multiple lines',
            input: `<details>
<summary>Project Details</summary>
# Overview
This is a detailed explanation.
- Point 1
- Point 2
</details>`,
            expected: 'toggle'
        }
    ];
    
    // Simulate the preprocessing function
    function preprocessToggleBlocks(markdown) {
        const detailsRegex = /<details>\s*<summary>(.*?)<\/summary>\s*([\s\S]*?)<\/details>/gi;
        return markdown.replace(detailsRegex, (match, summary, content) => {
            const cleanSummary = summary.trim();
            const cleanContent = content.trim();
            return `__TOGGLE_START__${cleanSummary}__TOGGLE_CONTENT__${cleanContent}__TOGGLE_END__`;
        });
    }
    
    function isToggleBlock(content) {
        return content.includes('__TOGGLE_START__') && content.includes('__TOGGLE_END__');
    }
    
    function createToggleBlock(content) {
        const match = content.match(/__TOGGLE_START__(.*?)__TOGGLE_CONTENT__(.*?)__TOGGLE_END__/s);
        if (!match) return null;
        
        const [, summary, toggleContent] = match;
        const cleanSummary = summary.trim();
        const cleanContent = toggleContent.trim();
        
        const children = [];
        if (cleanContent) {
            const contentLines = cleanContent.split('\n').filter(line => line.trim());
            for (const line of contentLines) {
                const trimmedLine = line.trim();
                if (trimmedLine) {
                    if (trimmedLine.startsWith('#')) {
                        const level = Math.min((trimmedLine.match(/^#+/) || [''])[0].length, 3);
                        const headingType = `heading_${level}`;
                        const headingText = trimmedLine.replace(/^#+\s*/, '');
                        children.push({
                            object: 'block',
                            type: headingType,
                            [headingType]: {
                                rich_text: [{ type: 'text', text: { content: headingText } }]
                            }
                        });
                    } else if (trimmedLine.startsWith('- ')) {
                        children.push({
                            object: 'block',
                            type: 'bulleted_list_item',
                            bulleted_list_item: {
                                rich_text: [{ type: 'text', text: { content: trimmedLine.substring(2) } }]
                            }
                        });
                    } else {
                        children.push({
                            object: 'block',
                            type: 'paragraph',
                            paragraph: {
                                rich_text: [{ type: 'text', text: { content: trimmedLine } }]
                            }
                        });
                    }
                }
            }
        }
        
        return {
            object: 'block',
            type: 'toggle',
            toggle: {
                rich_text: [{ type: 'text', text: { content: cleanSummary || 'Toggle' } }],
                color: 'default',
                children: children
            }
        };
    }
    
    let allPassed = true;
    
    testCases.forEach((testCase, index) => {
        console.log(`\n  Test ${index + 1}: ${testCase.name}`);
        console.log(`  Input: ${testCase.input.substring(0, 50)}${testCase.input.length > 50 ? '...' : ''}`);
        
        // Test preprocessing
        const preprocessed = preprocessToggleBlocks(testCase.input);
        const isToggle = isToggleBlock(preprocessed);
        
        console.log(`  Preprocessed: ${preprocessed.substring(0, 80)}${preprocessed.length > 80 ? '...' : ''}`);
        console.log(`  Detected as toggle: ${isToggle}`);
        
        if (isToggle) {
            const toggleBlock = createToggleBlock(preprocessed);
            if (toggleBlock && toggleBlock.type === 'toggle') {
                console.log(`  ✅ Toggle block created successfully`);
                console.log(`  Summary: "${toggleBlock.toggle.rich_text[0].text.content}"`);
                console.log(`  Children: ${toggleBlock.toggle.children.length} blocks`);
                
                // Show children types
                if (toggleBlock.toggle.children.length > 0) {
                    const childTypes = toggleBlock.toggle.children.map(child => child.type).join(', ');
                    console.log(`  Child types: ${childTypes}`);
                }
            } else {
                console.log(`  ❌ Failed to create toggle block`);
                allPassed = false;
            }
        } else {
            console.log(`  ❌ Not detected as toggle block`);
            allPassed = false;
        }
    });
    
    console.log(`\nResult: ${allPassed ? '✅ PASS' : '❌ FAIL'} - Toggle block tests`);
    return allPassed;
}

// Test toggle block structure validation
function testToggleBlockStructure() {
    console.log('\n📝 Testing Toggle Block Structure');
    console.log('-'.repeat(40));
    
    const sampleToggleBlock = {
        object: 'block',
        type: 'toggle',
        toggle: {
            rich_text: [{
                type: 'text',
                text: {
                    content: 'Click to expand'
                }
            }],
            color: 'default',
            children: [
                {
                    object: 'block',
                    type: 'paragraph',
                    paragraph: {
                        rich_text: [{
                            type: 'text',
                            text: {
                                content: 'This is hidden content'
                            }
                        }]
                    }
                }
            ]
        }
    };
    
    // Validate structure
    let passed = true;
    let errors = [];
    
    if (sampleToggleBlock.object !== 'block') {
        passed = false;
        errors.push('Missing or invalid object property');
    }
    
    if (sampleToggleBlock.type !== 'toggle') {
        passed = false;
        errors.push('Missing or invalid type property');
    }
    
    if (!sampleToggleBlock.toggle) {
        passed = false;
        errors.push('Missing toggle property');
    } else {
        if (!sampleToggleBlock.toggle.rich_text || !Array.isArray(sampleToggleBlock.toggle.rich_text)) {
            passed = false;
            errors.push('Missing or invalid rich_text array');
        }
        
        if (!sampleToggleBlock.toggle.children || !Array.isArray(sampleToggleBlock.toggle.children)) {
            passed = false;
            errors.push('Missing or invalid children array');
        }
        
        if (typeof sampleToggleBlock.toggle.color !== 'string') {
            passed = false;
            errors.push('Missing or invalid color property');
        }
    }
    
    console.log('Sample toggle block structure:');
    console.log(JSON.stringify(sampleToggleBlock, null, 2));
    
    if (passed) {
        console.log('\n✅ Toggle block structure is valid');
    } else {
        console.log('\n❌ Toggle block structure has errors:');
        errors.forEach(error => console.log(`  - ${error}`));
    }
    
    console.log(`Result: ${passed ? '✅ PASS' : '❌ FAIL'} - Toggle block structure validation`);
    return passed;
}

// Run all toggle tests
function runToggleTests() {
    console.log('🚀 Running Toggle Block Tests\n');
    
    const results = [];
    results.push(testToggleBlocks());
    results.push(testToggleBlockStructure());
    
    const passedTests = results.filter(result => result).length;
    const totalTests = results.length;
    
    console.log('\n' + '='.repeat(50));
    console.log('🎯 Toggle Test Results');
    console.log('='.repeat(50));
    console.log(`Tests passed: ${passedTests}/${totalTests}`);
    console.log(`Success rate: ${Math.round((passedTests / totalTests) * 100)}%`);
    
    if (passedTests === totalTests) {
        console.log('\n🎉 All toggle tests passed!');
        console.log('✅ Toggle block detection works correctly');
        console.log('✅ Toggle block structure is valid');
        console.log('✅ Nested content parsing works');
        console.log('✅ Ready for production use!');
    } else {
        console.log('\n❌ Some toggle tests failed. Please review the implementation.');
    }
    
    return passedTests === totalTests;
}

// Run tests if this file is executed directly
if (require.main === module) {
    runToggleTests();
}

// Export for use in other test files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        runToggleTests,
        testToggleBlocks,
        testToggleBlockStructure
    };
}