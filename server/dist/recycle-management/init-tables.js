"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initRecycleManagementTables = initRecycleManagementTables;
const supabase_client_1 = require("../storage/database/supabase-client");
async function initRecycleManagementTables() {
    const client = (0, supabase_client_1.getSupabaseClient)();
    try {
        console.log('[RecycleManagement] 检查并初始化数据表...');
        const { data: existingTables, error: checkError } = await client
            .rpc('get_table_info', { table_name: 'recycle_stores' });
        if (checkError) {
            console.log('[RecycleManagement] 检查表失败:', checkError.message);
        }
        if (existingTables && existingTables.length > 0) {
            console.log('[RecycleManagement] recycle_stores 表已存在，跳过创建');
            return;
        }
        console.log('[RecycleManagement] 开始创建数据表...');
        console.log('[RecycleManagement] ⚠️  Supabase SDK 不支持直接执行 DDL');
        console.log('[RecycleManagement] 请使用以下方法创建表:');
        console.log('');
        console.log('方法 1: 使用 Supabase Dashboard');
        console.log('  1. 打开 Supabase Dashboard');
        console.log('  2. 进入 SQL Editor');
        console.log('  3. 执行以下文件:');
        console.log('     server/database/migrations/024_create_recycle_management.sql');
        console.log('');
        console.log('方法 2: 使用 psql 命令');
        console.log('  psql $DATABASE_URL -f server/database/migrations/024_create_recycle_management.sql');
        throw new Error('请先创建数据表（见上方说明）');
    }
    catch (error) {
        console.error('[RecycleManagement] 初始化数据表失败:', error.message);
        throw error;
    }
}
if (require.main === module) {
    initRecycleManagementTables()
        .then(() => {
        console.log('[RecycleManagement] 初始化完成');
        process.exit(0);
    })
        .catch((error) => {
        console.error('[RecycleManagement] 初始化失败:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=init-tables.js.map