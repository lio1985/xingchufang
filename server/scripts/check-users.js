const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.COZE_SUPABASE_URL,
  process.env.COZE_SUPABASE_ANON_KEY
);

async function main() {
  console.log('查询现有用户...');

  // 查询现有的用户
  const { data: users, error } = await supabase
    .from('users')
    .select('id, openid, role, status, created_at')
    .limit(5);

  if (error) {
    console.error('查询失败:', error);
  } else {
    console.log('\n现有用户数量:', users?.length || 0);
    if (users && users.length > 0) {
      console.log('\n第一个用户:', JSON.stringify(users[0], null, 2));
    }
  }
}

main();
