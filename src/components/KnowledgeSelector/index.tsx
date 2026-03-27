import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Loader,
  Search,
  FileText,
  Building2,
  MessageSquareText,
  Package,
  Palette,
} from 'lucide-react-taro';
import { Network } from '@/network';

interface KnowledgeItem {
  id: string;
  title: string;
  content?: string;
  category?: string;
  type: string;
  created_at: string;
}

interface KnowledgeSource {
  key: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
}

interface KnowledgeSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[], sources: string[]) => void;
  selectedSources?: string[];
}

const KNOWLEDGE_SOURCES: KnowledgeSource[] = [
  { key: 'lexicon', name: '个人语料', icon: 'MessageSquareText', color: '#38bdf8', bgColor: 'rgba(56, 189, 248, 0.2)' },
  { key: 'knowledge_share', name: '公司资料', icon: 'Building2', color: '#a855f7', bgColor: 'rgba(168, 85, 247, 0.2)' },
  { key: 'product_manual', name: '产品手册', icon: 'Package', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.2)' },
  { key: 'design_knowledge', name: '设计知识', icon: 'Palette', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.2)' },
];

const getIcon = (iconName: string, color: string, size = 18) => {
  switch (iconName) {
    case 'MessageSquareText': return <MessageSquareText size={size} color={color} />;
    case 'Building2': return <Building2 size={size} color={color} />;
    case 'Package': return <Package size={size} color={color} />;
    case 'Palette': return <Palette size={size} color={color} />;
    default: return <FileText size={size} color={color} />;
  }
};

const KnowledgeSelector: React.FC<KnowledgeSelectorProps> = ({
  selectedIds,
  onChange,
  selectedSources = [],
}) => {
  const [expandedSource, setExpandedSource] = useState<string | null>(null);
  const [sourceData, setSourceData] = useState<Record<string, KnowledgeItem[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [searchText] = useState('');

  const loadSourceData = useCallback(async (sourceKey: string) => {
    setLoading((prev) => ({ ...prev, [sourceKey]: true }));

    try {
      let url = '';
      switch (sourceKey) {
        case 'lexicon':
          url = '/api/lexicon';
          break;
        case 'knowledge_share':
          url = '/api/knowledge-shares';
          break;
        case 'product_manual':
          url = '/api/product-manuals';
          break;
        case 'design_knowledge':
          url = '/api/design-knowledge';
          break;
        default:
          return;
      }

      const response = await Network.request({
        url,
        method: 'GET',
        data: { keyword: searchText, limit: 20 },
      });

      console.log(`[KnowledgeSelector] ${sourceKey} response:`, response);

      if (response.data?.code === 200) {
        const items = response.data.data?.items || response.data.data || [];
        setSourceData((prev) => ({
          ...prev,
          [sourceKey]: items.map((item: any) => ({
            id: item.id,
            title: item.title || item.name || '未命名',
            content: item.content || item.description,
            category: item.category,
            type: sourceKey,
            created_at: item.created_at,
          })),
        }));
      }
    } catch (error) {
      console.error(`[KnowledgeSelector] 加载 ${sourceKey} 失败:`, error);
      setSourceData((prev) => ({ ...prev, [sourceKey]: [] }));
    } finally {
      setLoading((prev) => ({ ...prev, [sourceKey]: false }));
    }
  }, [searchText]);

  useEffect(() => {
    if (expandedSource && !sourceData[expandedSource]) {
      loadSourceData(expandedSource);
    }
  }, [expandedSource, sourceData, loadSourceData]);

  const toggleSource = (sourceKey: string) => {
    if (expandedSource === sourceKey) {
      setExpandedSource(null);
    } else {
      setExpandedSource(sourceKey);
    }
  };

  const toggleItem = (item: KnowledgeItem) => {
    const newSelectedIds = selectedIds.includes(item.id)
      ? selectedIds.filter((id) => id !== item.id)
      : [...selectedIds, item.id];

    const newSources = Array.from(new Set([...selectedSources, item.type]));
    onChange(newSelectedIds, newSources);
  };

  const toggleSourceSelection = (sourceKey: string) => {
    const items = sourceData[sourceKey] || [];
    const itemIds = items.map((item) => item.id);
    const allSelected = itemIds.every((id) => selectedIds.includes(id));

    let newSelectedIds: string[];
    let newSources: string[];

    if (allSelected) {
      newSelectedIds = selectedIds.filter((id) => !itemIds.includes(id));
      newSources = selectedSources.filter((s) => s !== sourceKey);
    } else {
      newSelectedIds = [...new Set([...selectedIds, ...itemIds])];
      newSources = [...new Set([...selectedSources, sourceKey])];
    }

    onChange(newSelectedIds, newSources);
  };

  const getSourceIcon = (source: KnowledgeSource) => {
    return getIcon(source.icon, source.color);
  };

  return (
    <View style={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1e3a5f', overflow: 'hidden' }}>
      {/* Header */}
      <View style={{ padding: '16px', borderBottom: '1px solid #1e3a5f' }}>
        <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <BookOpen size={18} color="#38bdf8" />
          <Text style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff' }}>知识库选择</Text>
        </View>

        {/* 搜索框 */}
        <View style={{ display: 'flex', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '10px 12px' }}>
          <Search size={16} color="#71717a" />
          <Text
            style={{ marginLeft: '8px', fontSize: '13px', color: '#71717a', flex: 1 }}
            onClick={() => Taro.showToast({ title: '搜索功能开发中', icon: 'none' })}
          >
            搜索知识库...
          </Text>
        </View>

        {/* 已选择数量 */}
        {selectedIds.length > 0 && (
          <View style={{ marginTop: '12px', padding: '8px 12px', backgroundColor: 'rgba(56, 189, 248, 0.1)', borderRadius: '8px' }}>
            <Text style={{ fontSize: '13px', color: '#38bdf8' }}>已选择 {selectedIds.length} 条知识内容</Text>
          </View>
        )}
      </View>

      {/* 知识来源列表 */}
      <ScrollView scrollY style={{ maxHeight: '300px' }}>
        {KNOWLEDGE_SOURCES.map((source) => {
          const isExpanded = expandedSource === source.key;
          const items = sourceData[source.key] || [];
          const isLoading = loading[source.key];
          const selectedCount = items.filter((item) => selectedIds.includes(item.id)).length;

          return (
            <View key={source.key} style={{ borderBottom: '1px solid #1e3a5f' }}>
              {/* 来源标题 */}
              <View
                style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                onClick={() => toggleSource(source.key)}
              >
                <View style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <View style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: source.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {getSourceIcon(source)}
                  </View>
                  <View>
                    <Text style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff', display: 'block' }}>{source.name}</Text>
                    {selectedCount > 0 && (
                      <Text style={{ fontSize: '12px', color: source.color, display: 'block', marginTop: '2px' }}>已选 {selectedCount} 条</Text>
                    )}
                  </View>
                </View>
                <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isLoading && <Loader size={16} color="#71717a" />}
                  {isExpanded ? <ChevronDown size={18} color="#71717a" /> : <ChevronRight size={18} color="#71717a" />}
                </View>
              </View>

              {/* 展开的条目列表 */}
              {isExpanded && (
                <View style={{ padding: '0 16px 12px', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                  {/* 全选按钮 */}
                  {items.length > 0 && (
                    <View
                      style={{ padding: '8px 12px', marginBottom: '8px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                      onClick={() => toggleSourceSelection(source.key)}
                    >
                      <Text style={{ fontSize: '13px', color: '#94a3b8' }}>全选</Text>
                      {selectedCount === items.length && <Check size={14} color="#38bdf8" />}
                    </View>
                  )}

                  {/* 条目列表 */}
                  {isLoading ? (
                    <View style={{ padding: '20px', textAlign: 'center' }}>
                      <Loader size={24} color="#38bdf8" />
                      <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginTop: '8px' }}>加载中...</Text>
                    </View>
                  ) : items.length === 0 ? (
                    <View style={{ padding: '20px', textAlign: 'center' }}>
                      <Text style={{ fontSize: '13px', color: '#71717a' }}>暂无数据</Text>
                    </View>
                  ) : (
                    items.map((item) => {
                      const isSelected = selectedIds.includes(item.id);
                      return (
                        <View
                          key={item.id}
                          style={{
                            padding: '10px 12px',
                            marginBottom: '6px',
                            backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.1)' : 'rgba(0,0,0,0.2)',
                            borderRadius: '6px',
                            border: isSelected ? '1px solid #38bdf8' : '1px solid transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                          onClick={() => toggleItem(item)}
                        >
                          <View style={{ flex: 1, overflow: 'hidden' }}>
                            <Text style={{ fontSize: '14px', color: '#ffffff', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</Text>
                            {item.category && (
                              <Text style={{ fontSize: '11px', color: '#71717a', display: 'block', marginTop: '2px' }}>{item.category}</Text>
                            )}
                          </View>
                          {isSelected && <Check size={16} color="#38bdf8" />}
                        </View>
                      );
                    })
                  )}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default KnowledgeSelector;
