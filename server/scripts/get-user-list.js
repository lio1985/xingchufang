#!/usr/bin/env node

/**
 * 获取用户列表脚本
 *
 * 使用方法：
 * node server/scripts/get-user-list.js
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

async function getUserList() {
  console.log('🔍 获取用户列表...');
  console.log('');

  // 获取所有用户
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ 获取用户列表失败:', error);
    process.exit(1);
  }

  if (!users || users.length === 0) {
    console.log('ℹ️  暂无用户');
    process.exit(0);
  }

  console.log(`✅ 共找到 ${users.length} 个用户`);
  console.log('');
  console.log('─'.repeat(80));
  console.log('');

  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.nickname}`);
    console.log(`   OpenID: ${user.openid}`);
    console.log(`   角色: ${user.role}`);
    console.log(`   状态: ${user.status}`);
    console.log(`   注册时间: ${new Date(user.created_at).toLocaleString('zh-CN')}`);
    console.log(`   最后登录: ${user.last_login_at ? new Date(user.last_login_at).toLocaleString('zh-CN') : '未登录'}`);
    console.log('');
    console.log('─'.repeat(80));
    console.log('');
  });

  console.log('');
  console.log('💡 如何设置管理员:');
  console.log('   找到你的 openid，然后运行:');
  console.log('   node server/scripts/setup-admin.js <你的openid>');
}

// 执行脚本
getUserList().catch((error) => {
  console.error('❌ 发生错误:', error);
  process.exit(1);
});
