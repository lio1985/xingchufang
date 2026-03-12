const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.COZE_SUPABASE_URL,
  process.env.COZE_SUPABASE_ANON_KEY
);

async function main() {
  console.log('查询所有不同的 status 值...');

  // 查询所有不同的 status 值
  const { data: statuses, error } = await supabase
    .from('users')
    .select('status')
    .order('status');

  if (error) {
    console.error('查询失败:', error);
  } else {
    console.log('\n现有的 status 值:');
    const uniqueStatuses = [...new Set(statuses?.map(u => u.status) || [])];
    uniqueStatuses.forEach(status => console.log(`  - ${status}`));
  }
}

main();
