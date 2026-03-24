#!/usr/bin/env python3
"""
创建回收管理数据表
使用 psycopg2 直接连接 PostgreSQL 执行 SQL
用法: python3 server/scripts/create-recycle-tables.py
"""
import os
import sys
import re
from pathlib import Path

# 添加项目根目录到 Python 路径
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

def load_env():
    """加载环境变量"""
    env_files = ['.env.local', '.env.development', '.env']
    for env_file in env_files:
        env_path = project_root / env_file
        if env_path.exists():
            with open(env_path, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        key, value = line.split('=', 1)
                        key = key.strip()
                        value = value.strip()
                        # 移除引号
                        if value.startswith("'") and value.endswith("'") or \
                           value.startswith('"') and value.endswith('"'):
                            value = value[1:-1]
                        os.environ[key] = value
            print(f"✅ 已加载环境变量: {env_file}")
            break

def parse_supabase_url(url):
    """解析 Supabase URL 获取 PostgreSQL 连接信息"""
    # Supabase URL 格式: https://xkufzwehvgdmxhutfggh.supabase.co
    # PostgreSQL URL 格式: postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

    match = re.match(r'https://([^.]+)\.supabase\.co', url)
    if not match:
        raise ValueError(f"无效的 Supabase URL: {url}")

    project_ref = match.group(1)

    # 注意: 我们需要数据库密码，这需要从 Supabase Dashboard 获取
    # 由于我们没有密码，我们无法直接连接

    return {
        'host': f'db.{project_ref}.supabase.co',
        'port': 5432,
        'database': 'postgres',
        'user': 'postgres'
    }

def execute_sql_via_python():
    """使用 Python 执行 SQL"""
    try:
        load_env()

        supabase_url = os.environ.get('COZE_SUPABASE_URL') or os.environ.get('SUPABASE_URL')
        if not supabase_url:
            raise ValueError('缺少 COZE_SUPABASE_URL 环境变量')

        # 解析连接信息
        conn_info = parse_supabase_url(supabase_url)

        # 读取 SQL 文件
        migration_file = project_root / 'server/database/migrations/024_create_recycle_management.sql'
        if not migration_file.exists():
            raise FileNotFoundError(f"迁移文件不存在: {migration_file}")

        with open(migration_file, 'r', encoding='utf-8') as f:
            sql = f.read()

        print("📋 准备创建回收管理数据表...")
        print(f"📝 SQL 文件: {migration_file}")
        print(f"📝 SQL 预览: {sql[:200]}...\n")

        print("⚠️  需要数据库密码才能直接连接 PostgreSQL")
        print("请使用以下方法之一创建表:\n")

        print("方法 1: 使用 Supabase Dashboard（推荐）")
        print("  1. 打开浏览器，访问: https://supabase.com/dashboard/project/xkufzwehvgdmxhutfggh/sql/new")
        print("  2. 复制以下文件内容:")
        print(f"     {migration_file}")
        print("  3. 粘贴到 SQL Editor 中")
        print("  4. 点击 Run 执行\n")

        print("方法 2: 使用 psql 命令")
        print(f"  psql $DATABASE_URL -f {migration_file}\n")

        print("方法 3: 如果你有数据库密码，可以使用此脚本:")
        print(f"  export DB_PASSWORD='your-password'")
        print(f"  python3 {__file__}\n")

        # 尝试使用环境变量中的密码
        db_password = os.environ.get('DB_PASSWORD') or os.environ.get('POSTGRES_PASSWORD')
        if db_password:
            import psycopg2
            conn_str = f"postgresql://{conn_info['user']}:{db_password}@{conn_info['host']}:{conn_info['port']}/{conn_info['database']}"
            print(f"🔗 连接数据库: {conn_str[:50]}...")

            conn = psycopg2.connect(conn_str)
            conn.autocommit = True
            cursor = conn.cursor()

            print("⏳ 执行 SQL...")
            cursor.execute(sql)

            print("✅ 数据表创建成功!")

            cursor.close()
            conn.close()
            return True
        else:
            print("💡 提示: 设置 DB_PASSWORD 环境变量后，此脚本可以自动创建表")
            return False

    except Exception as e:
        print(f"❌ 错误: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = execute_sql_via_python()
    sys.exit(0 if success else 1)
