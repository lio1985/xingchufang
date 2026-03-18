-- 星厨房预设账号初始化 SQL 脚本
-- 执行此脚本可在 Supabase 数据库中创建管理员和测试账号
-- 执行前请确保：
-- 1. 已连接到正确的 Supabase 数据库
-- 2. users 表和 user_profiles 表已存在
-- 3. employee_id 没有重复（如有重复请修改下面的 employee_id 值）

-- ============================================
-- 管理员账号
-- 用户名: admin
-- 密码: Admin@2025!Secure
-- 角色: admin
-- 状态: active
-- ============================================

-- 先删除已存在的 admin 账号（如果需要重新创建）
DELETE FROM user_profiles WHERE user_id IN (SELECT id FROM users WHERE nickname = 'admin');
DELETE FROM users WHERE nickname = 'admin';

-- 插入管理员账号
INSERT INTO users (
    openid,
    employee_id,
    nickname,
    password,
    role,
    status,
    created_at,
    updated_at
) VALUES (
    'pwd_admin',
    '100486',
    'admin',
    '$2b$10$zVeIzz9gPh8jxQpeiwrHmu7elq0MopH00XT1YIq.y8Q0yFNApxEXi',
    'admin',
    'active',
    NOW(),
    NOW()
)
RETURNING id;

-- 插入管理员档案（使用上面返回的 id）
-- 注意：如果上面的 RETURNING id 没有显示，请先查询用户 id
-- SELECT id FROM users WHERE nickname = 'admin';
-- 然后将下面的 'ADMIN_USER_ID' 替换为实际的 UUID

INSERT INTO user_profiles (
    user_id,
    real_name,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM users WHERE nickname = 'admin' LIMIT 1),
    '系统管理员',
    NOW(),
    NOW()
);

-- ============================================
-- 测试账号
-- 用户名: test2026
-- 密码: test123456
-- 角色: user
-- 状态: active
-- ============================================

-- 先删除已存在的 test2026 账号（如果需要重新创建）
DELETE FROM user_profiles WHERE user_id IN (SELECT id FROM users WHERE nickname = 'test2026');
DELETE FROM users WHERE nickname = 'test2026';

-- 插入测试账号
INSERT INTO users (
    openid,
    employee_id,
    nickname,
    password,
    role,
    status,
    created_at,
    updated_at
) VALUES (
    'pwd_test2026',
    '140071',
    'test2026',
    '$2b$10$aCW.cZZrpYmJ8Mu18MzDpuRcxJWlY.ceORvDpCAWtQT5Wv/gyCy9q',
    'user',
    'active',
    NOW(),
    NOW()
)
RETURNING id;

-- 插入测试账号档案
INSERT INTO user_profiles (
    user_id,
    real_name,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM users WHERE nickname = 'test2026' LIMIT 1),
    '测试用户',
    NOW(),
    NOW()
);

-- ============================================
-- 验证账号是否创建成功
-- ============================================
SELECT 
    id,
    nickname,
    employee_id,
    role,
    status,
    created_at
FROM users 
WHERE nickname IN ('admin', 'test2026');
