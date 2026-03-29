import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  PenTool,
  Search,
  ListFilter,
  ChevronRight,
  Eye,
  Clock,
  Tag,
  Layers,
  Ruler,
} from 'lucide-react-taro';

// 设计知识分类
const designCategories = [
  { id: 'all', name: '全部', count: 9 },
  { id: 'layout', name: '厨房布局', count: 3 },
  { id: 'equipment', name: '设备选型', count: 2 },
  { id: 'ventilation', name: '通风排烟', count: 2 },
  { id: 'safety', name: '安全规范', count: 2 },
];

// 设计知识数据
const designKnowledgeData = [
  {
    id: '1',
    title: '商用厨房布局设计原则',
    category: 'layout',
    categoryName: '厨房布局',
    summary: '详细讲解商用厨房的功能分区、动线设计、空间利用率优化等核心原则，帮助设计师打造高效实用的商用厨房空间。',
    author: '张工',
    updateTime: '2024-01-18',
    viewCount: 234,
    tags: ['布局设计', '空间规划', '动线优化'],
    difficulty: '进阶',
  },
  {
    id: '2',
    title: '商用厨房设备选型指南',
    category: 'equipment',
    categoryName: '设备选型',
    summary: '根据餐饮类型、客流量、预算等因素，科学选择商用厨房设备的完整方法论，避免选型失误造成的损失。',
    author: '李工',
    updateTime: '2024-01-16',
    viewCount: 189,
    tags: ['设备选型', '性价比', '品牌对比'],
    difficulty: '入门',
  },
  {
    id: '3',
    title: '厨房通风排烟系统设计',
    category: 'ventilation',
    categoryName: '通风排烟',
    summary: '商用厨房通风排烟系统的设计要点、设备选型、管道布局及环保要求，确保厨房空气质量和合规性。',
    author: '王工',
    updateTime: '2024-01-12',
    viewCount: 156,
    tags: ['通风设计', '排烟系统', '环保'],
    difficulty: '进阶',
  },
  {
    id: '4',
    title: '商用厨房消防安全规范',
    category: 'safety',
    categoryName: '安全规范',
    summary: '商用厨房消防安全的设计要求、设备配置、验收标准及日常管理要点，保障厨房运营安全。',
    author: '赵工',
    updateTime: '2024-01-10',
    viewCount: 278,
    tags: ['消防安全', '规范标准', '安全设计'],
    difficulty: '必读',
  },
  {
    id: '5',
    title: '小型餐饮厨房设计方案',
    category: 'layout',
    categoryName: '厨房布局',
    summary: '针对小型餐饮店铺的厨房设计方案，在有限空间内实现功能最大化，适合快餐店、奶茶店等场景。',
    author: '张工',
    updateTime: '2024-01-08',
    viewCount: 312,
    tags: ['小型厨房', '空间利用', '案例'],
    difficulty: '入门',
  },
  {
    id: '6',
    title: '厨房电力负荷计算方法',
    category: 'equipment',
    categoryName: '设备选型',
    summary: '商用厨房电力负荷的计算方法、配电设计要点及节能建议，确保电力系统安全稳定运行。',
    author: '刘工',
    updateTime: '2024-01-05',
    viewCount: 145,
    tags: ['电力负荷', '配电设计', '节能'],
    difficulty: '进阶',
  },
];

// 难度颜色映射
const difficultyColors: Record<string, { color: string; bgColor: string }> = {
  '入门': { color: '#4ade80', bgColor: 'rgba(34, 197, 94, 0.2)' },
  '进阶': { color: '#38bdf8', bgColor: 'rgba(245, 158, 11, 0.2)' },
  '必读': { color: '#f87171', bgColor: 'rgba(239, 68, 68, 0.2)' },
};

const DesignKnowledgePage = () => {
  const handleCategoryClick = (categoryId: string) => {
    Taro.showToast({ title: `切换到${designCategories.find(c => c.id === categoryId)?.name}`, icon: 'none' });
  };

  const handleKnowledgeClick = (knowledgeId: string) => {
    Taro.navigateTo({ url: `/package-knowledge/pages/knowledge/design-knowledge/detail?id=${knowledgeId}` });
  };

  const handleSearch = () => {
    Taro.showToast({ title: '搜索功能开发中', icon: 'none' });
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', paddingBottom: '20px' }}>
      {/* 页面头部 */}
      <View style={{ padding: '48px 20px 16px', backgroundColor: '#111827', borderBottom: '1px solid #1e3a5f' }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            
            <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>商厨设计知识</Text>
          </View>
          <View style={{ display: 'flex', gap: '8px' }}>
            <View
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#111827',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={handleSearch}
            >
              <Search size={18} color="#94a3b8" />
            </View>
          </View>
        </View>
        <Text style={{ fontSize: '13px', color: '#71717a' }}>专业设计理念与最佳实践</Text>
      </View>

      {/* 分类筛选 */}
      <ScrollView scrollX style={{ backgroundColor: '#111827', padding: '12px 20px', whiteSpace: 'nowrap' }}>
        <View style={{ display: 'inline-flex', gap: '8px' }}>
          {designCategories.map((cat) => (
            <View
              key={cat.id}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                backgroundColor: cat.id === 'all' ? '#38bdf8' : '#1e3a5f',
                flexShrink: 0
              }}
              onClick={() => handleCategoryClick(cat.id)}
            >
              <Text style={{ fontSize: '13px', color: cat.id === 'all' ? '#0a0f1a' : '#94a3b8', fontWeight: '500' }}>
                {cat.name} ({cat.count})
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 设计知识列表 */}
      <ScrollView scrollY style={{ height: 'calc(100vh - 160px)' }}>
        <View style={{ padding: '16px 20px' }}>
          {/* 知识卡片统计 */}
          <View style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <View style={{
              flex: 1,
              backgroundColor: '#111827',
              border: '1px solid #1e3a5f',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            >
              <Layers size={20} color="#60a5fa" />
              <View>
                <Text style={{ fontSize: '12px', color: '#71717a' }}>设计案例</Text>
                <Text style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff' }}>32</Text>
              </View>
            </View>
            <View style={{
              flex: 1,
              backgroundColor: '#111827',
              border: '1px solid #1e3a5f',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            >
              <Ruler size={20} color="#4ade80" />
              <View>
                <Text style={{ fontSize: '12px', color: '#71717a' }}>设计规范</Text>
                <Text style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff' }}>18</Text>
              </View>
            </View>
          </View>

          {/* 统计信息 */}
          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <Text style={{ fontSize: '13px', color: '#71717a' }}>共 {designKnowledgeData.length} 篇知识</Text>
            <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ListFilter size={14} color="#71717a" />
              <Text style={{ fontSize: '13px', color: '#71717a' }}>筛选</Text>
            </View>
          </View>

          {/* 列表项 */}
          {designKnowledgeData.map((knowledge) => {
            const difficultyStyle = difficultyColors[knowledge.difficulty] || difficultyColors['入门'];
            return (
              <View
                key={knowledge.id}
                style={{
                  backgroundColor: '#111827',
                  border: '1px solid #1e3a5f',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '12px'
                }}
                onClick={() => handleKnowledgeClick(knowledge.id)}
              >
                {/* 标题和难度标签 */}
                <View style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <PenTool size={16} color="#38bdf8" />
                      <Text style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff' }}>{knowledge.title}</Text>
                    </View>
                    <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                      <View style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(245, 158, 11, 0.2)' }}>
                        <Text style={{ fontSize: '11px', color: '#38bdf8' }}>{knowledge.categoryName}</Text>
                      </View>
                      <View style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: difficultyStyle.bgColor }}>
                        <Text style={{ fontSize: '11px', color: difficultyStyle.color }}>{knowledge.difficulty}</Text>
                      </View>
                    </View>
                  </View>
                  <ChevronRight size={20} color="#64748b" />
                </View>

                {/* 摘要 */}
                <Text style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '20px', marginBottom: '12px' }}>
                  {knowledge.summary}
                </Text>

                {/* 标签 */}
                <View style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                  {knowledge.tags.map((tag, index) => (
                    <View key={index} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Tag size={12} color="#71717a" />
                      <Text style={{ fontSize: '12px', color: '#71717a' }}>{tag}</Text>
                    </View>
                  ))}
                </View>

                {/* 底部信息 */}
                <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #1e3a5f', paddingTop: '12px' }}>
                  <View style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Eye size={14} color="#71717a" />
                      <Text style={{ fontSize: '12px', color: '#71717a' }}>{knowledge.viewCount}</Text>
                    </View>
                    <Text style={{ fontSize: '12px', color: '#64748b' }}>作者: {knowledge.author}</Text>
                  </View>
                  <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} color="#64748b" />
                    <Text style={{ fontSize: '12px', color: '#64748b' }}>{knowledge.updateTime}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default DesignKnowledgePage;
