#!/bin/bash

# npm 发布验证脚本 - 验证包是否准备好发布

set -e

echo "🔍 验证 npm 包发布准备状态..."
echo ""

# 检查 package.json 必需字段
echo "📋 检查 package.json 配置..."

# 检查包名
PACKAGE_NAME=$(node -p "require('./package.json').name")
if [[ "$PACKAGE_NAME" != "n8n-nodes-markdown-to-notion" ]]; then
    echo "❌ 包名不正确: $PACKAGE_NAME"
    exit 1
fi
echo "✅ 包名: $PACKAGE_NAME"

# 检查版本
VERSION=$(node -p "require('./package.json').version")
echo "✅ 版本: $VERSION"

# 检查关键字
KEYWORDS=$(node -p "require('./package.json').keywords.includes('n8n-community-node-package')")
if [[ "$KEYWORDS" != "true" ]]; then
    echo "❌ 缺少必需的关键字: n8n-community-node-package"
    exit 1
fi
echo "✅ 包含 n8n 社区节点关键字"

# 检查 n8n 配置
N8N_CONFIG=$(node -p "require('./package.json').n8n ? 'exists' : 'missing'")
if [[ "$N8N_CONFIG" != "exists" ]]; then
    echo "❌ 缺少 n8n 配置块"
    exit 1
fi
echo "✅ n8n 配置块存在"

# 检查必需文件
echo ""
echo "📁 检查必需文件..."

REQUIRED_FILES=(
    "dist/nodes/MarkdownToNotion/MarkdownToNotion.node.js"
    "dist/credentials/NotionApi.credentials.js"
    "README.md"
    "LICENSE"
    "package.json"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [[ ! -f "$file" ]]; then
        echo "❌ 缺少必需文件: $file"
        exit 1
    fi
    echo "✅ $file"
done

# 运行测试
echo ""
echo "🧪 运行测试..."
if ! npm test; then
    echo "❌ 测试失败"
    exit 1
fi
echo "✅ 所有测试通过"

# 检查构建
echo ""
echo "🔨 验证构建..."
if ! npm run build; then
    echo "❌ 构建失败"
    exit 1
fi
echo "✅ 构建成功"

# 检查包内容
echo ""
echo "📦 检查包内容..."
npm pack --dry-run > /tmp/npm-pack-output.txt 2>&1

# 验证包大小合理
PACKAGE_SIZE=$(grep "package size:" /tmp/npm-pack-output.txt | awk '{print $4}')
echo "✅ 包大小: $PACKAGE_SIZE"

# 验证文件数量
FILE_COUNT=$(grep "total files:" /tmp/npm-pack-output.txt | awk '{print $3}')
echo "✅ 文件数量: $FILE_COUNT"

# 检查是否包含核心文件
if ! grep -q "MarkdownToNotion.node.js" /tmp/npm-pack-output.txt; then
    echo "❌ 包中缺少主节点文件"
    exit 1
fi

if ! grep -q "NotionApi.credentials.js" /tmp/npm-pack-output.txt; then
    echo "❌ 包中缺少凭据文件"
    exit 1
fi

echo "✅ 包内容验证通过"

# 清理临时文件
rm -f /tmp/npm-pack-output.txt

echo ""
echo "🎉 npm 包发布准备验证完成！"
echo ""
echo "📋 发布摘要:"
echo "   包名: $PACKAGE_NAME"
echo "   版本: $VERSION"
echo "   包大小: $PACKAGE_SIZE"
echo "   文件数量: $FILE_COUNT"
echo ""
echo "✅ 包已准备好发布到 npm！"
echo ""
echo "🚀 发布步骤:"
echo "   1. 确保已登录 npm: npm login"
echo "   2. 运行发布脚本: ./publish.sh"
echo "   3. 或手动发布: npm publish"
echo ""
echo "📖 发布后用户可以通过以下方式安装:"
echo "   • n8n 界面: Settings → Community Nodes → 输入包名"
echo "   • 命令行: npm install -g n8n-nodes-markdown-to-notion"