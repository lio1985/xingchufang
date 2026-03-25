import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  Building2,
  Wrench,
  FileText,
  PenTool,
  ChevronRight,
  BookOpen,
  Settings,
  Lightbulb,
} from 'lucide-react-taro';

// 知识分类数据
const knowledgeCategories = [
  {
    id: 'equipment-maintenance',
    title: '商厨设备维修维保',
    description: '设备维修保养指南与知识库',
    icon: Wrench,
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.2)',
    count: 24,
    subCategories: [
      { id: 'product-manual', title: '产品使用说明书', count: 15 },
      { id: 'design-knowledge', title: '商厨设计知识', count: 9 },
    ]
  },
  {
    id: 'company-policies',
    title: '公司规章制度',
    description: '企业管理制度与流程规范',
    icon: Building2,
    color: '#a855f7',
    bgColor: 'rgba(168, 85, 247, 0.2)',
    count: 12,
  },
  {
    id: 'sales-skills',
    title: '销售技巧',
    description: '销售话术与客户沟通技巧',
    icon: Lightbulb,
    color: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.2)',
    count: 18,
  },
  {
    id: 'product-knowledge',
    title: '产品知识',
    description: '产品介绍与参数说明',
    icon: Settings,
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.2)',
    count: 32,
  },
];

const KnowledgeSharePage = () => {
  const handleNavigate = (path: string) => {
    Taro.navigateTo({ url: path });
  };

  const handleCategoryClick = (categoryId: string) => {
    if (categoryId === 'equipment-maintenance') {
      // 商厨设备维修维保是主分类，展开子分类
      return;
    }
    Taro.showToast({ title: '功能开发中', icon: 'none' });
  };

  const handleSubCategoryClick = (subId: string) => {
    if (subId === 'product-manual') {
      handleNavigate('/pages/knowledge/product-manual/index');
    } else if (subId === 'design-knowledge') {
      handleNavigate('/pages/knowledge/design-knowledge/index');
    } else {
      Taro.showToast({ title: '功能开发中', icon: 'none' });
    }
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0a0b', paddingBottom: '80px' }}>
      {/* 页面头部 */}
      <View style={{ padding: '48px 20px 20px', backgroundColor: '#141416' }}>
        <View style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <Building2 size={24} color="#a855f7" />
          <Text style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', marginLeft: '8px' }}>公司资料</Text>
        </View>
        <Text style={{ fontSize: '14px', color: '#71717a' }}>企业知识沉淀与复用</Text>
      </View>

      <ScrollView scrollY style={{ height: 'calc(100vh - 140px)' }}>
        <View style={{ padding: '16px 20px' }}>
          {/* 统计概览 */}
          <View style={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
            <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={20} color="#f59e0b" />
                <Text style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>知识库概览</Text>
              </View>
            </View>
            <View style={{ display: 'flex', justifyContent: 'space-around', marginTop: '16px' }}>
              <View style={{ textAlign: 'center' }}>
                <Text style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff' }}>86</Text>
                <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>知识总数</Text>
              </View>
              <View style={{ width: '1px', backgroundColor: '#27272a' }} />
              <View style={{ textAlign: 'center' }}>
                <Text style={{ fontSize: '28px', fontWeight: '700', color: '#f59e0b' }}>4</Text>
                <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>知识分类</Text>
              </View>
              <View style={{ width: '1px', backgroundColor: '#27272a' }} />
              <View style={{ textAlign: 'center' }}>
                <Text style={{ fontSize: '28px', fontWeight: '700', color: '#22c55e' }}>12</Text>
                <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>本周更新</Text>
              </View>
            </View>
          </View>

          {/* 知识分类列表 */}
          <Text style={{ fontSize: '12px', color: '#52525b', display: 'block', marginBottom: '12px', fontWeight: '500' }}>知识分类</Text>
          
          {knowledgeCategories.map((category) => {
            const CategoryIcon = category.icon;
            return (
              <View
                key={category.id}
                style={{
                  backgroundColor: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '12px',
                  marginBottom: '12px',
                  overflow: 'hidden'
                }}
              >
                {/* 主分类 */}
                <View
                  style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <View style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: category.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                  >
                    <CategoryIcon size={24} color={category.color} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>{category.title}</Text>
                      <View style={{ padding: '4px 10px', borderRadius: '12px', backgroundColor: category.bgColor }}>
                        <Text style={{ fontSize: '12px', color: category.color }}>{category.count}</Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginTop: '4px' }}>{category.description}</Text>
                  </View>
                </View>

                {/* 子分类（仅商厨设备维修维保显示） */}
                {category.subCategories && category.subCategories.length > 0 && (
                  <View style={{ borderTop: '1px solid #27272a' }}>
                    {category.subCategories.map((sub, index) => (
                      <View
                        key={sub.id}
                        style={{
                          padding: '12px 16px 12px 76px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderBottom: index < category.subCategories!.length - 1 ? '1px solid #27272a' : 'none',
                          backgroundColor: '#141416'
                        }}
                        onClick={() => handleSubCategoryClick(sub.id)}
                      >
                        <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {sub.id === 'product-manual' ? (
                            <FileText size={16} color="#f59e0b" />
                          ) : (
                            <PenTool size={16} color="#f59e0b" />
                          )}
                          <Text style={{ fontSize: '14px', color: '#a1a1aa' }}>{sub.title}</Text>
                        </View>
                        <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Text style={{ fontSize: '12px', color: '#52525b' }}>{sub.count}篇</Text>
                          <ChevronRight size={16} color="#52525b" />
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}

          {/* 快捷入口 */}
          <Text style={{ fontSize: '12px', color: '#52525b', display: 'block', marginBottom: '12px', marginTop: '8px', fontWeight: '500' }}>快捷入口</Text>
          
          <View style={{ display: 'flex', gap: '12px' }}>
            <View
              style={{
                flex: 1,
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
              onClick={() => handleNavigate('/pages/knowledge-share/create')}
            >
              <View style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '8px'
              }}
              >
                <Text style={{ fontSize: '20px' }}>+</Text>
              </View>
              <Text style={{ fontSize: '14px', color: '#ffffff' }}>新建知识</Text>
              <Text style={{ fontSize: '12px', color: '#71717a', marginTop: '4px' }}>分享你的知识</Text>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
              onClick={() => handleNavigate('/pages/knowledge-share/index')}
            >
              <View style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '8px'
              }}
              >
                <BookOpen size={20} color="#3b82f6" />
              </View>
              <Text style={{ fontSize: '14px', color: '#ffffff' }}>全部知识</Text>
              <Text style={{ fontSize: '12px', color: '#71717a', marginTop: '4px' }}>查看所有内容</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default KnowledgeSharePage;
