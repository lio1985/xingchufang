#!/usr/bin/env node

/**
 * 快速设置管理员脚本
 *
 * 使用方法：
 * node server/scripts/setup-admin.js <openid>
 *
 * 示例：
 * node server/scripts/setup-admin.js o6_bmasdasdsad6_2sgVt7hMZOPfL
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.COZE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.COZE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ 错误: 缺少 Supabase 环境变量');
  console.error('请确保已配置 SUPABASE_URL 和 SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function setupAdmin(openid) {
  if (!openid) {
    console.error('❌ 错误: 缺少 openid 参数');
    console.error('使用方法: node server/scripts/setup-admin.js <openid>');
    console.error('');
    console.error('💡 如何获取 openid:');
    console.error('1. 先在小程序中用你的微信登录');
    console.error('2. 运行: node server/scripts/get-user-list.js 查看用户列表');
    console.error('3. 找到你的 openid');
    process.exit(1);
  }

  console.log(`🔍 查找用户: ${openid}`);

  // 查找用户
  const { data: users, error: findError } = await supabase
    .from('users')
    .select('*')
    .eq('openid', openid)
    .limit(1);

  if (findError) {
    console.error('❌ 查找用户失败:', findError);
    process.exit(1);
  }

  if (!users || users.length === 0) {
    console.error('❌ 未找到该 openid 对应的用户');
    console.error('');
    console.error('💡 请检查 openid 是否正确');
    process.exit(1);
  }

  const user = users[0];
  console.log(`✅ 找到用户:`);
  console.log(`   ID: ${user.id}`);
  console.log(`   昵称: ${user.nickname}`);
  console.log(`   当前角色: ${user.role}`);
  console.log(`   当前状态: ${user.status}`);

  if (user.role === 'admin') {
    console.log('');
    console.log('ℹ️  该用户已经是管理员');
    process.exit(0);
  }

  console.log('');
  console.log('🔧 设置为管理员...');

  // 更新用户角色
  const { data: updatedUser, error: updateError } = await supabase
    .from('users')
    .update({
      role: 'admin',
      status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select()
    .single();

  if (updateError) {
    console.error('❌ 设置管理员失败:', updateError);
    process.exit(1);
  }

  console.log('');
  console.log('✅ 成功！该用户已设置为管理员');
  console.log('');
  console.log('📋 用户信息:');
  console.log(`   ID: ${updatedUser.id}`);
  console.log(`   昵称: ${updatedUser.nickname}`);
  console.log(`   角色: ${updatedUser.role}`);
  console.log(`   状态: ${updatedUser.status}`);
  console.log('');
  console.log('🎉 现在你可以使用管理后台了！');
}

// 执行脚本
const openid = process.argv[2];
setupAdmin(openid).catch((error) => {
  console.error('❌ 发生错误:', error);
  process.exit(1);
});
