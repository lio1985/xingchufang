import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useEffect, useState } from 'react';
import { Network } from '@/network';
import {
  ChevronLeft,
  Search,
  Eye,
  Clock,
  FileText,
  Plus,
} from 'lucide-react-taro';

interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  viewCount: number;
  createdAt: string;
  author: string;
}

// 分类映射
const categoryConfig: Record<string, { name: string; color: string }> = {
  'policies': { name: '公司规章制度', color: '#a855f7' },
  'sales': { name: '销售技巧', color: '#4ade80' },
  'product': { name: '产品知识', color: '#60a5fa' },
  'equipment': { name: '商厨设备维修维保', color: '#38bdf8' },
  'other': { name: '其他', color: '#71717a' },
};

export default function KnowledgeCategoryListPage() {
  const router = useRouter();
  const { category } = router.params;
  
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<KnowledgeItem[]>([]);

  const categoryInfo = categoryConfig[category || 'other'] || categoryConfig['other'];

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await Network.request({
          url: '/api/knowledge-shares',
          method: 'GET',
          data: { category }
        });

        if (res.data?.code === 200 && res.data?.data) {
          setList(res.data.data);
        }
      } catch (error) {
        console.error('加载知识列表失败:', error);
        // 使用示例数据
        const mockItems: Record<string, KnowledgeItem[]> = {
          'policies': [
            { id: '1', title: '公司考勤管理制度', content: '公司考勤管理规定，包括上下班时间、请假流程等...', category: 'policies', tags: ['考勤', '制度'], viewCount: 234, createdAt: '2024-01-15', author: '人事部' },
            { id: '2', title: '差旅报销流程', content: '差旅费用报销的标准流程和注意事项...', category: 'policies', tags: ['报销', '流程'], viewCount: 189, createdAt: '2024-01-10', author: '财务部' },
            { id: '3', title: '员工行为规范', content: '公司员工日常行为准则和职业道德要求...', category: 'policies', tags: ['行为规范', '职业道德'], viewCount: 156, createdAt: '2024-01-05', author: '人事部' },
          ],
          'sales': [
            { id: '1', title: '客户沟通话术技巧', content: '与客户沟通的有效话术和技巧总结...', category: 'sales', tags: ['话术', '沟通'], viewCount: 312, createdAt: '2024-01-18', author: '销售部' },
            { id: '2', title: '如何处理客户异议', content: '客户提出异议时的处理方法和应对策略...', category: 'sales', tags: ['异议处理', '销售技巧'], viewCount: 278, createdAt: '2024-01-12', author: '销售部' },
            { id: '3', title: '成交促成技巧', content: '促进客户成交的实用技巧和案例分析...', category: 'sales', tags: ['成交', '技巧'], viewCount: 245, createdAt: '2024-01-08', author: '销售部' },
          ],
          'product': [
            { id: '1', title: '商用厨房设备产品手册', content: '商用厨房设备产品系列介绍和技术参数...', category: 'product', tags: ['产品', '手册'], viewCount: 456, createdAt: '2024-01-20', author: '产品部' },
            { id: '2', title: '设备选型指南', content: '根据客户需求选择合适设备的专业指南...', category: 'product', tags: ['选型', '指南'], viewCount: 389, createdAt: '2024-01-15', author: '产品部' },
            { id: '3', title: '新品功能介绍', content: '最新上市产品的功能特点和卖点介绍...', category: 'product', tags: ['新品', '功能'], viewCount: 267, createdAt: '2024-01-10', author: '产品部' },
          ],
          'other': [
            { id: '1', title: '办公软件使用技巧', content: '常用办公软件的使用技巧和快捷键汇总...', category: 'other', tags: ['软件', '技巧'], viewCount: 178, createdAt: '2024-01-08', author: 'IT部' },
          ],
        };
        setList(mockItems[category || 'other'] || []);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [category]);

  const handleItemClick = (id: string) => {
    Taro.navigateTo({ url: `/package-knowledge/pages/knowledge-share/detail?id=${id}` });
  };

  const handleCreate = () => {
    Taro.navigateTo({ url: `/package-knowledge/pages/knowledge-share/create?category=${category}` });
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', paddingBottom: '80px' }}>
      {/* 页面头部 */}
      <View style={{ padding: '48px 20px 16px', backgroundColor: '#111827', borderBottom: '1px solid #1e3a5f' }}>
        <View style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <View
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#1e3a5f',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={() => Taro.navigateBack()}
          >
            <ChevronLeft size={24} color="#f1f5f9" />
          </View>
          <FileText size={24} color={categoryInfo.color} />
          <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>{categoryInfo.name}</Text>
        </View>
        <Text style={{ fontSize: '13px', color: '#71717a', marginLeft: '48px' }}>知识文档与学习资料</Text>
      </View>

      {/* 搜索栏 */}
      <View style={{ padding: '12px 20px', backgroundColor: '#111827' }}>
        <View style={{ backgroundColor: '#0a0f1a', borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center' }}>
          <Search size={16} color="#71717a" />
          <Text style={{ marginLeft: '8px', fontSize: '14px', color: '#64748b' }}>搜索知识内容...</Text>
        </View>
      </View>

      {/* 列表 */}
      <ScrollView scrollY style={{ height: 'calc(100vh - 160px)' }}>
        <View style={{ padding: '16px 20px' }}>
          {/* 统计 */}
          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <Text style={{ fontSize: '13px', color: '#71717a' }}>共 {list.length} 篇知识</Text>
          </View>

          {/* 加载中 */}
          {loading && (
            <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
              <Text style={{ color: '#71717a' }}>加载中...</Text>
            </View>
          )}

          {/* 空状态 */}
          {!loading && list.length === 0 && (
            <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
              <FileText size={48} color="#71717a" />
              <Text style={{ fontSize: '16px', color: '#71717a', marginTop: '16px' }}>暂无知识内容</Text>
              <Text style={{ fontSize: '13px', color: '#64748b', marginTop: '8px' }}>点击右下角按钮创建新知识</Text>
            </View>
          )}

          {/* 列表项 */}
          {!loading && list.map((item) => (
            <View
              key={item.id}
              style={{
                backgroundColor: '#111827',
                border: '1px solid #1e3a5f',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '12px'
              }}
              onClick={() => handleItemClick(item.id)}
            >
              <View style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>{item.title}</Text>
                  <Text style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '20px' }} numberOfLines={2}>{item.content}</Text>
                </View>
              </View>

              {/* 标签 */}
              <View style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                {item.tags.map((tag, index) => (
                  <View key={index} style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
                    <Text style={{ fontSize: '11px', color: categoryInfo.color }}>{tag}</Text>
                  </View>
                ))}
              </View>

              {/* 底部信息 */}
              <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #1e3a5f', paddingTop: '12px' }}>
                <View style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Eye size={14} color="#71717a" />
                    <Text style={{ fontSize: '12px', color: '#71717a' }}>{item.viewCount}</Text>
                  </View>
                  <Text style={{ fontSize: '12px', color: '#64748b' }}>{item.author}</Text>
                </View>
                <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} color="#64748b" />
                  <Text style={{ fontSize: '12px', color: '#64748b' }}>{item.createdAt}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 新建按钮 */}
      <View
        style={{
          position: 'fixed',
          right: '20px',
          bottom: '40px',
          width: '56px',
          height: '56px',
          borderRadius: '28px',
          backgroundColor: categoryInfo.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}
        onClick={handleCreate}
      >
        <Plus size={28} color="#0a0f1a" />
      </View>
    </View>
  );
}
