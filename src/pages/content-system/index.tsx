import { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';

interface ContentItem {
  id: string;
  title: string;
  type: string;
  platform: string;
  status: 'draft' | 'pending' | 'published';
  createdAt: string;
  views?: number;
  likes?: number;
}

const ContentSystemPage = () => {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  const statuses = [
    { key: 'all', label: '全部', count: 0 },
    { key: 'draft', label: '草稿', count: 0 },
    { key: 'pending', label: '待发布', count: 0 },
    { key: 'published', label: '已发布', count: 0 }
  ];

  useEffect(() => {
    loadContents();
  }, []);

  const loadContents = () => {
    setLoading(true);
    const localData = Taro.getStorageSync('contents') || [];
    setContents(localData);
    setLoading(false);
  };

  const getFilteredContents = () => {
    if (selectedStatus === 'all') return contents;
    return contents.filter(c => c.status === selectedStatus);
  };

  const getCounts = () => {
    return {
      all: contents.length,
      draft: contents.filter(c => c.status === 'draft').length,
      pending: contents.filter(c => c.status === 'pending').length,
      published: contents.filter(c => c.status === 'published').length
    };
  };

  const counts = getCounts();

  const statusConfig = {
    draft: { label: '草稿', color: '#71717a', bg: 'rgba(113, 113, 122, 0.1)' },
    pending: { label: '待发布', color: '#38bdf8', bg: 'rgba(245, 158, 11, 0.1)' },
    published: { label: '已发布', color: '#4ade80', bg: 'rgba(34, 197, 94, 0.1)' }
  };

  const platformConfig: Record<string, string> = {
    '抖音': '🎵',
    '小红书': '📕',
    '微信': '💬',
    'B站': '📺',
    '微博': '🌐'
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const filteredContents = getFilteredContents();

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', paddingBottom: '120px' }}>
      {/* Header */}
      <View 
        style={{ 
          background: 'linear-gradient(180deg, #111827 0%, #0a0f1a 100%)',
          padding: '48px 32px 32px',
          borderBottom: '1px solid #1e3a5f'
        }}
      >
        <View style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <View style={{ padding: '8px' }} onClick={() => Taro.navigateBack()}>
            <Text style={{ fontSize: '32px', color: '#f1f5f9' }}>←</Text>
          </View>
          <Text style={{ fontSize: '36px', fontWeight: '700', color: '#f1f5f9' }}>内容体系</Text>
        </View>

        {/* 状态筛选 */}
        <View style={{ display: 'flex', gap: '12px' }}>
          {statuses.map((status) => (
            <View
              key={status.key}
              style={{
                flex: 1,
                padding: '16px 8px',
                backgroundColor: selectedStatus === status.key ? '#38bdf8' : '#111827',
                borderRadius: '12px',
                textAlign: 'center',
                border: selectedStatus === status.key ? 'none' : '1px solid #1e3a5f'
              }}
              onClick={() => setSelectedStatus(status.key)}
            >
              <Text 
                style={{ 
                  fontSize: '24px', 
                  fontWeight: '600',
                  color: selectedStatus === status.key ? '#000' : '#94a3b8',
                  display: 'block'
                }}
              >
                {counts[status.key as keyof typeof counts]}
              </Text>
              <Text 
                style={{ 
                  fontSize: '18px', 
                  color: selectedStatus === status.key ? '#000' : '#71717a',
                  marginTop: '4px'
                }}
              >
                {status.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* 内容列表 */}
      <View style={{ padding: '32px' }}>
        {loading ? (
          <View style={{ textAlign: 'center', paddingTop: '120px' }}>
            <Text style={{ fontSize: '64px' }}>⏳</Text>
            <Text style={{ fontSize: '28px', color: '#71717a', marginTop: '24px' }}>加载中...</Text>
          </View>
        ) : filteredContents.length === 0 ? (
          <View style={{ textAlign: 'center', paddingTop: '120px' }}>
            <Text style={{ fontSize: '80px' }}>📝</Text>
            <Text style={{ fontSize: '28px', color: '#71717a', marginTop: '24px' }}>
              {selectedStatus === 'all' ? '暂无内容' : `暂无${statuses.find(s => s.key === selectedStatus)?.label}`}
            </Text>
            <Text style={{ fontSize: '24px', color: '#38bdf8', marginTop: '16px' }}
              onClick={() => Taro.navigateTo({ url: '/pages/content-creation/index' })}
            >
              去创建内容
            </Text>
          </View>
        ) : (
          filteredContents.map((content) => (
            <View
              key={content.id}
              style={{
                backgroundColor: '#111827',
                borderRadius: '20px',
                padding: '28px',
                marginBottom: '16px',
                border: '1px solid #1e3a5f'
              }}
            >
              <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <View style={{ flex: 1 }}>
                  <Text 
                    style={{ 
                      fontSize: '28px', 
                      fontWeight: '600', 
                      color: '#f1f5f9',
                      display: 'block',
                      marginBottom: '8px'
                    }}
                  >
                    {content.title}
                  </Text>
                  <View style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <View 
                      style={{
                        padding: '6px 12px',
                        backgroundColor: statusConfig[content.status].bg,
                        borderRadius: '8px'
                      }}
                    >
                      <Text style={{ fontSize: '20px', color: statusConfig[content.status].color }}>
                        {statusConfig[content.status].label}
                      </Text>
                    </View>
                    <Text style={{ fontSize: '22px', color: '#71717a' }}>
                      {platformConfig[content.platform] || '📱'} {content.platform}
                    </Text>
                    <Text style={{ fontSize: '22px', color: '#71717a' }}>
                      {content.type}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ display: 'flex', gap: '16px' }}>
                  {content.views !== undefined && (
                    <Text style={{ fontSize: '22px', color: '#71717a' }}>
                      👁 {content.views}
                    </Text>
                  )}
                  {content.likes !== undefined && (
                    <Text style={{ fontSize: '22px', color: '#71717a' }}>
                      ❤️ {content.likes}
                    </Text>
                  )}
                </View>
                <Text style={{ fontSize: '20px', color: '#64748b' }}>
                  {formatDate(content.createdAt)}
                </Text>
              </View>

              {/* 操作按钮 */}
              <View style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                {content.status === 'draft' && (
                  <View 
                    style={{ flex: 1, padding: '14px', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', textAlign: 'center' }}
                    onClick={() => Taro.showToast({ title: '提交审核', icon: 'success' })}
                  >
                    <Text style={{ fontSize: '24px', color: '#38bdf8' }}>提交审核</Text>
                  </View>
                )}
                {content.status === 'pending' && (
                  <View 
                    style={{ flex: 1, padding: '14px', backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: '12px', textAlign: 'center' }}
                    onClick={() => Taro.showToast({ title: '立即发布', icon: 'success' })}
                  >
                    <Text style={{ fontSize: '24px', color: '#4ade80' }}>立即发布</Text>
                  </View>
                )}
                <View 
                  style={{ flex: 1, padding: '14px', backgroundColor: '#1e293b', borderRadius: '12px', textAlign: 'center', border: '1px solid #1e3a5f' }}
                  onClick={() => Taro.showToast({ title: '编辑内容', icon: 'none' })}
                >
                  <Text style={{ fontSize: '24px', color: '#94a3b8' }}>编辑</Text>
                </View>
                <View 
                  style={{ flex: 1, padding: '14px', backgroundColor: '#1e293b', borderRadius: '12px', textAlign: 'center', border: '1px solid #1e3a5f' }}
                  onClick={() => Taro.setClipboardData({ data: content.title })}
                >
                  <Text style={{ fontSize: '24px', color: '#94a3b8' }}>复制</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      {/* 悬浮创建按钮 */}
      <View 
        style={{
          position: 'fixed',
          right: '32px',
          bottom: '140px',
          width: '112px',
          height: '112px',
          background: 'linear-gradient(135deg, #38bdf8 0%, #fb923c 100%)',
          borderRadius: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '48px',
          boxShadow: '0 8px 32px rgba(245, 158, 11, 0.3)',
          zIndex: 100
        }}
        onClick={() => Taro.navigateTo({ url: '/pages/content-creation/index' })}
      >
        ✏️
      </View>
    </View>
  );
};

export default ContentSystemPage;
