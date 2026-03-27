import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  FileText,
  Search,
  ListFilter,
  ChevronRight,
  Download,
  Eye,
  Clock,
  Tag,
} from 'lucide-react-taro';

// 产品分类
const productCategories = [
  { id: 'all', name: '全部', count: 15 },
  { id: 'stove', name: '灶具', count: 5 },
  { id: 'oven', name: '烤箱', count: 3 },
  { id: 'refrigerator', name: '制冷设备', count: 4 },
  { id: 'dishwasher', name: '洗碗机', count: 3 },
];

// 产品说明书数据
const manualsData = [
  {
    id: '1',
    title: '商用燃气炒灶使用说明书',
    category: 'stove',
    categoryName: '灶具',
    brand: '星厨',
    model: 'XC-ZC-1200',
    updateTime: '2024-01-15',
    downloadCount: 156,
    viewCount: 324,
    tags: ['燃气灶', '商用', '安全操作'],
  },
  {
    id: '2',
    title: '商用蒸柜操作手册',
    category: 'stove',
    categoryName: '灶具',
    brand: '星厨',
    model: 'XC-ZG-800',
    updateTime: '2024-01-10',
    downloadCount: 98,
    viewCount: 187,
    tags: ['蒸柜', '商用', '节能'],
  },
  {
    id: '3',
    title: '商用烤箱使用指南',
    category: 'oven',
    categoryName: '烤箱',
    brand: '星厨',
    model: 'XC-KX-600',
    updateTime: '2024-01-08',
    downloadCount: 76,
    viewCount: 145,
    tags: ['电烤箱', '温控', '商用'],
  },
  {
    id: '4',
    title: '四门商用冰箱维护手册',
    category: 'refrigerator',
    categoryName: '制冷设备',
    brand: '星厨',
    model: 'XC-BX-1200',
    updateTime: '2024-01-05',
    downloadCount: 132,
    viewCount: 267,
    tags: ['冰箱', '制冷', '维护保养'],
  },
  {
    id: '5',
    title: '商用洗碗机操作规程',
    category: 'dishwasher',
    categoryName: '洗碗机',
    brand: '星厨',
    model: 'XC-XWJ-500',
    updateTime: '2024-01-03',
    downloadCount: 89,
    viewCount: 198,
    tags: ['洗碗机', '清洗', '消毒'],
  },
];

const ProductManualPage = () => {
  const handleCategoryClick = (categoryId: string) => {
    Taro.showToast({ title: `切换到${productCategories.find(c => c.id === categoryId)?.name}`, icon: 'none' });
  };

  const handleManualClick = (manualId: string) => {
    Taro.navigateTo({ url: `/pages/knowledge/product-manual/detail?id=${manualId}` });
  };

  const handleSearch = () => {
    Taro.showToast({ title: '搜索功能开发中', icon: 'none' });
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', paddingBottom: '20px' }}>
      {/* 页面头部 */}
      <View style={{ padding: '48px 20px 16px', backgroundColor: '#111827', borderBottom: '1px solid #1e3a5f' }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <View style={{ display: 'flex', alignItems: 'center' }}>
            <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>产品使用说明书</Text>
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
        <Text style={{ fontSize: '13px', color: '#71717a' }}>商厨设备使用与维护指南</Text>
      </View>

      {/* 分类筛选 */}
      <ScrollView scrollX style={{ backgroundColor: '#111827', padding: '12px 20px', whiteSpace: 'nowrap' }}>
        <View style={{ display: 'inline-flex', gap: '8px' }}>
          {productCategories.map((cat) => (
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

      {/* 说明书列表 */}
      <ScrollView scrollY style={{ height: 'calc(100vh - 160px)' }}>
        <View style={{ padding: '16px 20px' }}>
          {/* 统计信息 */}
          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <Text style={{ fontSize: '13px', color: '#71717a' }}>共 {manualsData.length} 份说明书</Text>
            <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ListFilter size={14} color="#71717a" />
              <Text style={{ fontSize: '13px', color: '#71717a' }}>筛选</Text>
            </View>
          </View>

          {/* 列表项 */}
          {manualsData.map((manual) => (
            <View
              key={manual.id}
              style={{
                backgroundColor: '#111827',
                border: '1px solid #1e3a5f',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '12px'
              }}
              onClick={() => handleManualClick(manual.id)}
            >
              {/* 标题和分类 */}
              <View style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <FileText size={16} color="#38bdf8" />
                    <Text style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff' }}>{manual.title}</Text>
                  </View>
                  <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                    <View style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: 'rgba(245, 158, 11, 0.2)' }}>
                      <Text style={{ fontSize: '11px', color: '#38bdf8' }}>{manual.categoryName}</Text>
                    </View>
                    <Text style={{ fontSize: '12px', color: '#64748b' }}>{manual.brand} | {manual.model}</Text>
                  </View>
                </View>
                <ChevronRight size={20} color="#64748b" />
              </View>

              {/* 标签 */}
              <View style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                {manual.tags.map((tag, index) => (
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
                    <Text style={{ fontSize: '12px', color: '#71717a' }}>{manual.viewCount}</Text>
                  </View>
                  <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Download size={14} color="#71717a" />
                    <Text style={{ fontSize: '12px', color: '#71717a' }}>{manual.downloadCount}</Text>
                  </View>
                </View>
                <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} color="#64748b" />
                  <Text style={{ fontSize: '12px', color: '#64748b' }}>{manual.updateTime}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default ProductManualPage;
