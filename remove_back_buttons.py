#!/usr/bin/env python3
"""
移除页面中的返回按钮
小程序自带返回键，不需要页面内的返回按钮
"""
import os
import re
import glob

def remove_back_button(content):
    """移除返回按钮"""
    
    # 模式1: ChevronLeft 图标按钮 (最常见的模式)
    # 匹配整个 View 包含 ChevronLeft 的返回按钮
    pattern1 = r'''
<View\s*
\s*style=\{\{\s*[^}]*width:\s*['"]40px['"][^}]*\}\}\s*
\s*onClick=\{\(\)\s*=>\s*Taro\.navigateBack\(\)\}\s*
>\s*
<ChevronLeft[^/]*/>\s*
</View>'''
    
    content = re.sub(pattern1, '', content, flags=re.MULTILINE | re.DOTALL | re.VERBOSE)
    
    # 模式2: 更宽松的匹配 - 包含 ChevronLeft 和 navigateBack 的 View
    pattern2 = r'<View[^>]*onClick=\{[^}]*navigateBack[^}]*\}[^>]*>\s*<ChevronLeft[^/]*/>\s*</View>'
    content = re.sub(pattern2, '', content, flags=re.MULTILINE | re.DOTALL)
    
    # 模式3: 包含 "返回" 文字的按钮
    pattern3 = r'<View[^>]*onClick=\{[^}]*navigateBack[^}]*\}[^>]*>\s*<Text[^>]*>返回</Text>\s*</View>'
    content = re.sub(pattern3, '', content, flags=re.MULTILINE | re.DOTALL)
    
    # 模式4: 返回按钮容器 - 包含 ChevronLeft 的圆形按钮
    pattern4 = r'<View\s+style=\{\{[^}]*borderRadius:\s*['"]50%['"][^}]*\}\}\s+onClick=\{\(\)\s*=>\s*\{[^}]*Taro\.navigateBack[^}]*\}\}>\s*<ChevronLeft[^/]*/>\s*</View>'
    content = re.sub(pattern4, '', content, flags=re.MULTILINE | re.DOTALL)
    
    # 模式5: 多行返回按钮
    pattern5 = r'<View\s+style=\{\{[^}]*\}\}\s+onClick=\{\(\)\s*=>\s*Taro\.navigateBack\(\)\}>\s*<ChevronLeft[^/]*/>\s*</View>'
    content = re.sub(pattern5, '', content, flags=re.MULTILINE | re.DOTALL)
    
    return content

def process_file(filepath):
    """处理单个文件"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        content = remove_back_button(content)
        
        # 检查是否有变化
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✓ 已处理: {filepath}")
            return True
        return False
    except Exception as e:
        print(f"✗ 错误处理 {filepath}: {e}")
        return False

def main():
    # 查找所有 tsx 文件
    files = glob.glob('src/**/*.tsx', recursive=True)
    
    processed = 0
    for filepath in files:
        if process_file(filepath):
            processed += 1
    
    print(f"\n总计处理 {processed} 个文件")

if __name__ == '__main__':
    main()
