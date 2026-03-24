#!/bin/bash

# 清理未使用的资源文件脚本
# 用法: bash scripts/clean-assets.sh

echo "🔍 开始检查未使用的资源文件..."

# 进入项目根目录
cd "$(dirname "$0")/.."

# 查找所有 PNG 文件
all_pngs=$(find assets -name "*.png" -type f 2>/dev/null)

# 检查每个 PNG 文件是否被引用
unused_count=0
for png in $all_pngs; do
  # 跳过特定文件
  if [[ "$png" == *"星厨房"* ]] || [[ "$png" == "assets/image.png" ]]; then
    continue
  fi
  
  # 检查是否被引用
  if ! grep -r "$(basename $png)" src --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" > /dev/null 2>&1; then
    echo "❌ 未使用: $png"
    unused_count=$((unused_count + 1))
  fi
done

if [ $unused_count -eq 0 ]; then
  echo "✅ 所有资源文件都在使用中"
else
  echo ""
  echo "📊 发现 $unused_count 个未使用的资源文件"
  echo "💡 建议执行: find assets -name '*.png' -type f ! -name '星厨房*' ! -name 'image.png' -exec rm {} \;"
fi
