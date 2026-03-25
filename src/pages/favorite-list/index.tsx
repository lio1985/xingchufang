import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { Network } from '@/network';
import {
  Heart,
  Clock,
  CircleCheck,
  Link,
  Trash2,
} from 'lucide-react-taro';

interface FavoriteItem {
  id: string;
  hotTitle: string;
  topicTitle: string;
  scriptSummary: string;
  account: string;
  responsible: string;
  status: '待拍' | '已拍' | '已发布';
  createdAt: string;
}

export default function FavoriteListPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const res = await Network.request({
        url: '/api/hot/favorite/list'
      });
      console.log('[FavoriteList] 获取收藏列表响应:', res.data);

      if (res.data?.code === 200 && res.data?.data) {
        setFavorites(res.data.data);
      }
    } catch (error) {
      console.error('[FavoriteList] 获取收藏列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFavorite = async (id: string) => {
    Taro.showModal({
      title: '提示',
      content: '确定要删除这条收藏吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const deleteRes = await Network.request({
              url: '/api/hot/favorite',
              method: 'DELETE',
              data: { id }
            });

            if (deleteRes.data?.code === 200) {
              Taro.showToast({ title: '删除成功', icon: 'success' });
              loadFavorites();
            }
          } catch (error) {
            Taro.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  };

  const handleUpdateStatus = async (id: string, newStatus: '待拍' | '已拍' | '已发布') => {
    try {
      const res = await Network.request({
        url: '/api/hot/favorite/status',
        method: 'PUT',
        data: { id, status: newStatus }
      });

      if (res.data?.code === 200) {
        Taro.showToast({ title: '状态已更新', icon: 'success' });
        loadFavorites();
      }
    } catch (error) {
      Taro.showToast({ title: '更新状态失败', icon: 'none' });
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case '待拍':
        return { color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.2)', icon: Clock };
      case '已拍':
        return { color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.2)', icon: CircleCheck };
      case '已发布':
        return { color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.2)', icon: Link };
      default:
        return { color: '#71717a', bgColor: 'rgba(113, 113, 122, 0.2)', icon: Clock };
    }
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0a0b', paddingBottom: '80px' }}>
      {/* 页面头部 */}
      <View style={{ padding: '48px 20px 20px', backgroundColor: '#141416' }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ display: 'flex', alignItems: 'center' }}>
            <Heart size={24} color="#ef4444" />
            <Text style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', marginLeft: '8px' }}>个人收藏</Text>
          </View>
          <Text style={{ fontSize: '14px', color: '#71717a' }}>共 {favorites.length} 条</Text>
        </View>
      </View>

      {/* 列表内容 */}
      <ScrollView scrollY style={{ height: 'calc(100vh - 140px)' }}>
        {loading ? (
          <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
            <Text style={{ color: '#71717a' }}>加载中...</Text>
          </View>
        ) : favorites.length === 0 ? (
          <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px' }}>
            <View style={{ width: '64px', height: '64px', borderRadius: '32px', backgroundColor: '#18181b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Heart size={32} color="#52525b" />
            </View>
            <Text style={{ fontSize: '16px', color: '#71717a', display: 'block', marginTop: '16px' }}>暂无收藏内容</Text>
            <Text style={{ fontSize: '13px', color: '#52525b', display: 'block', marginTop: '8px', textAlign: 'center' }}>去热点列表收藏感兴趣的内容吧</Text>
          </View>
        ) : (
          <View style={{ padding: '16px 20px' }}>
            {favorites.map((item) => {
              const statusConfig = getStatusConfig(item.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <View
                  key={item.id}
                  style={{
                    backgroundColor: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: '12px',
                    padding: '16px',
                    marginBottom: '12px'
                  }}
                >
                  {/* 热点标题 */}
                  <View style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #27272a' }}>
                    <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginBottom: '4px' }}>热点标题</Text>
                    <Text style={{ fontSize: '14px', color: '#a1a1aa' }}>{item.hotTitle}</Text>
                  </View>

                  {/* 选题标题 */}
                  <View style={{ marginBottom: '12px' }}>
                    <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginBottom: '4px' }}>选题标题</Text>
                    <Text style={{ fontSize: '16px', fontWeight: '600', color: '#a855f7' }}>{item.topicTitle}</Text>
                  </View>

                  {/* 脚本摘要 */}
                  {item.scriptSummary && (
                    <View style={{ marginBottom: '12px' }}>
                      <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginBottom: '4px' }}>脚本摘要</Text>
                      <Text style={{ fontSize: '13px', color: '#a1a1aa', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.scriptSummary}
                      </Text>
                    </View>
                  )}

                  {/* 账号和负责人 */}
                  <View style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginBottom: '4px' }}>账号</Text>
                      <Text style={{ fontSize: '14px', color: '#ffffff' }}>{item.account || '-'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginBottom: '4px' }}>负责人</Text>
                      <Text style={{ fontSize: '14px', color: '#ffffff' }}>{item.responsible || '-'}</Text>
                    </View>
                  </View>

                  {/* 状态和操作 */}
                  <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #27272a' }}>
                    <View style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', backgroundColor: statusConfig.bgColor }}>
                      <StatusIcon size={14} color={statusConfig.color} />
                      <Text style={{ fontSize: '12px', color: statusConfig.color }}>{item.status}</Text>
                    </View>

                    <View style={{ display: 'flex', gap: '8px' }}>
                      {item.status === '待拍' && (
                        <View
                          style={{ padding: '6px 12px', borderRadius: '8px', backgroundColor: '#22c55e' }}
                          onClick={() => handleUpdateStatus(item.id, '已拍')}
                        >
                          <Text style={{ fontSize: '12px', color: '#ffffff' }}>已拍</Text>
                        </View>
                      )}
                      {item.status === '已拍' && (
                        <View
                          style={{ padding: '6px 12px', borderRadius: '8px', backgroundColor: '#3b82f6' }}
                          onClick={() => handleUpdateStatus(item.id, '已发布')}
                        >
                          <Text style={{ fontSize: '12px', color: '#ffffff' }}>已发布</Text>
                        </View>
                      )}
                      <View
                        style={{ padding: '6px 12px', borderRadius: '8px', backgroundColor: '#27272a', display: 'flex', alignItems: 'center' }}
                        onClick={() => handleDeleteFavorite(item.id)}
                      >
                        <Trash2 size={14} color="#ef4444" />
                      </View>
                    </View>
                  </View>

                  {/* 创建时间 */}
                  <Text style={{ fontSize: '11px', color: '#52525b', display: 'block', marginTop: '12px' }}>
                    {item.createdAt}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
