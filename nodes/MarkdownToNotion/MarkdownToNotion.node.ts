import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IRequestOptions,
	NodeOperationError,
} from 'n8n-workflow';

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';
import { toString as mdastToString } from 'mdast-util-to-string';

interface NotionBlock {
	object: 'block';
	type: string;
	[key: string]: any;
}

interface RichTextObject {
	type: 'text';
	text: {
		content: string;
		link?: { url: string } | null;
	};
	annotations?: {
		bold?: boolean;
		italic?: boolean;
		strikethrough?: boolean;
		underline?: boolean;
		code?: boolean;
		color?: string;
	};
}

export class MarkdownToNotion implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Markdown to Notion',
		name: 'markdownToNotion',
		icon: 'file:notion.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Convert markdown content to Notion page blocks with proper formula handling',
		defaults: {
			name: 'Markdown to Notion',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'notionApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Append to Page',
						value: 'appendToPage',
						description: 'Convert markdown and append blocks to an existing Notion page',
						action: 'Append markdown content to a Notion page',
					},
				],
				default: 'appendToPage',
			},
			{
				displayName: 'Page ID',
				name: 'pageId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						operation: ['appendToPage'],
					},
				},
				default: '',
				placeholder: 'e.g. 59833787-2cf9-4fdf-8782-e53db20768a5',
				description: 'The ID of the Notion page to append content to. You can find this in the page URL.',
			},
			{
				displayName: 'Markdown Content',
				name: 'markdownContent',
				type: 'string',
				typeOptions: {
					rows: 10,
				},
				required: true,
				displayOptions: {
					show: {
						operation: ['appendToPage'],
					},
				},
				default: '',
				placeholder: '# Heading\\n\\nSome **bold** text with $inline formula$ and more content.',
				description: 'The markdown content to convert and append to the Notion page',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				displayOptions: {
					show: {
						operation: ['appendToPage'],
					},
				},
				options: [
					{
						displayName: 'Preserve Math Formulas',
						name: 'preserveMath',
						type: 'boolean',
						default: true,
						description: 'Whether to preserve inline math formulas (text between $ symbols) as plain text instead of converting them',
					},
					{
						displayName: 'Math Formula Delimiter',
						name: 'mathDelimiter',
						type: 'string',
						default: '$',
						description: 'The delimiter used for inline math formulas (default: $)',
						displayOptions: {
							show: {
								preserveMath: [true],
							},
						},
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				const pageId = this.getNodeParameter('pageId', i) as string;
				const markdownContent = this.getNodeParameter('markdownContent', i) as string;
				const options = this.getNodeParameter('options', i, {}) as {
					preserveMath?: boolean;
					mathDelimiter?: string;
				};

				if (operation === 'appendToPage') {
					const blocks = await this.convertMarkdownToNotionBlocks(
						markdownContent,
						options.preserveMath ?? true,
						options.mathDelimiter ?? '$'
					);

					const requestOptions: IRequestOptions = {
						method: 'PATCH',
						url: `https://api.notion.com/v1/blocks/${pageId}/children`,
						headers: {
							'Notion-Version': '2022-06-28',
						},
						body: {
							children: blocks,
						},
						json: true,
					};

					const response = await this.helpers.httpRequestWithAuthentication.call(
						this,
						'notionApi',
						requestOptions,
					);

					returnData.push({
						json: {
							success: true,
							pageId,
							blocksAdded: response.results?.length || 0,
							blocks: response.results,
						},
						pairedItem: {
							item: i,
						},
					});
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
							success: false,
						},
						pairedItem: {
							item: i,
						},
					});
					continue;
				}
				throw new NodeOperationError(this.getNode(), error as Error, {
					itemIndex: i,
				});
			}
		}

		return [returnData];
	}

	private async convertMarkdownToNotionBlocks(
		markdown: string,
		preserveMath: boolean = true,
		mathDelimiter: string = '$'
	): Promise<NotionBlock[]> {
		let processedMarkdown = markdown;
		const mathPlaceholders: { [key: string]: string } = {};
		
		if (preserveMath) {
			const mathRegex = new RegExp(`\\${mathDelimiter}([^${mathDelimiter}]+)\\${mathDelimiter}`, 'g');
			let mathCounter = 0;
			
			processedMarkdown = markdown.replace(mathRegex, (match, formula) => {
				const placeholder = `__MATH_PLACEHOLDER_${mathCounter}__`;
				mathPlaceholders[placeholder] = match;
				mathCounter++;
				return placeholder;
			});
		}

		const processor = unified()
			.use(remarkParse)
			.use(remarkGfm);

		const tree = processor.parse(processedMarkdown);
		const blocks: NotionBlock[] = [];

		visit(tree, (node: any) => {
			switch (node.type) {
				case 'heading':
					blocks.push(this.createHeadingBlock(node, mathPlaceholders));
					break;
				case 'paragraph': {
					const paragraphBlock = this.createParagraphBlock(node, mathPlaceholders);
					if (paragraphBlock) {
						blocks.push(paragraphBlock);
					}
					break;
				}
				case 'list':
					blocks.push(...this.createListBlocks(node, mathPlaceholders));
					break;
				case 'code':
					blocks.push(this.createCodeBlock(node));
					break;
				case 'blockquote':
					blocks.push(this.createQuoteBlock(node, mathPlaceholders));
					break;
			}
		});

		return blocks;
	}

	private createHeadingBlock(node: any, mathPlaceholders: { [key: string]: string }): NotionBlock {
		const level = Math.min(node.depth, 3);
		const headingType = `heading_${level}`;
		
		return {
			object: 'block',
			type: headingType,
			[headingType]: {
				rich_text: this.convertToRichText(node, mathPlaceholders),
			},
		};
	}

	private createParagraphBlock(node: any, mathPlaceholders: { [key: string]: string }): NotionBlock | null {
		const richText = this.convertToRichText(node, mathPlaceholders);
		
		if (richText.length === 0 || (richText.length === 1 && richText[0].text.content.trim() === '')) {
			return null;
		}

		return {
			object: 'block',
			type: 'paragraph',
			paragraph: {
				rich_text: richText,
			},
		};
	}

	private createListBlocks(node: any, mathPlaceholders: { [key: string]: string }): NotionBlock[] {
		const blocks: NotionBlock[] = [];
		const listType = node.ordered ? 'numbered_list_item' : 'bulleted_list_item';

		for (const listItem of node.children) {
			if (listItem.type === 'listItem') {
				blocks.push({
					object: 'block',
					type: listType,
					[listType]: {
						rich_text: this.convertToRichText(listItem, mathPlaceholders),
					},
				});
			}
		}

		return blocks;
	}

	private createCodeBlock(node: any): NotionBlock {
		return {
			object: 'block',
			type: 'code',
			code: {
				rich_text: [
					{
						type: 'text',
						text: {
							content: node.value || '',
						},
					},
				],
				language: node.lang || 'plain text',
			},
		};
	}

	private createQuoteBlock(node: any, mathPlaceholders: { [key: string]: string }): NotionBlock {
		return {
			object: 'block',
			type: 'quote',
			quote: {
				rich_text: this.convertToRichText(node, mathPlaceholders),
			},
		};
	}

	private convertToRichText(node: any, mathPlaceholders: { [key: string]: string }): RichTextObject[] {
		const richText: RichTextObject[] = [];
		
		let textContent = mdastToString(node);
		
		for (const [placeholder, originalMath] of Object.entries(mathPlaceholders)) {
			textContent = textContent.replace(placeholder, originalMath);
		}

		if (textContent.trim()) {
			this.processInlineFormatting(node, richText, mathPlaceholders);
		}

		if (richText.length === 0 && textContent.trim()) {
			richText.push({
				type: 'text',
				text: {
					content: textContent,
				},
			});
		}

		return richText;
	}

	private processInlineFormatting(node: any, richText: RichTextObject[], mathPlaceholders: { [key: string]: string }): void {
		if (node.type === 'text') {
			let content = node.value;
			
			for (const [placeholder, originalMath] of Object.entries(mathPlaceholders)) {
				content = content.replace(placeholder, originalMath);
			}

			if (content) {
				richText.push({
					type: 'text',
					text: {
						content,
					},
				});
			}
		} else if (node.type === 'strong') {
			const textContent = mdastToString(node);
			if (textContent) {
				richText.push({
					type: 'text',
					text: {
						content: textContent,
					},
					annotations: {
						bold: true,
					},
				});
			}
		} else if (node.type === 'emphasis') {
			const textContent = mdastToString(node);
			if (textContent) {
				richText.push({
					type: 'text',
					text: {
						content: textContent,
					},
					annotations: {
						italic: true,
					},
				});
			}
		} else if (node.type === 'inlineCode') {
			richText.push({
				type: 'text',
				text: {
					content: node.value,
				},
				annotations: {
					code: true,
				},
			});
		} else if (node.type === 'link') {
			const textContent = mdastToString(node);
			if (textContent) {
				richText.push({
					type: 'text',
					text: {
						content: textContent,
						link: { url: node.url },
					},
				});
			}
		} else if (node.children) {
			for (const child of node.children) {
				this.processInlineFormatting(child, richText, mathPlaceholders);
			}
		}
	}
}