import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { Network } from '@/network';

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
      } else {
        Taro.showToast({
          title: '获取收藏列表失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('[FavoriteList] 获取收藏列表失败:', error);
      Taro.showToast({
        title: '获取收藏列表失败',
        icon: 'none'
      });
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

            console.log('[FavoriteList] 删除收藏响应:', deleteRes.data);

            if (deleteRes.data?.code === 200) {
              Taro.showToast({
                title: '删除成功',
                icon: 'success'
              });
              loadFavorites();
            } else {
              Taro.showToast({
                title: '删除失败',
                icon: 'none'
              });
            }
          } catch (error) {
            console.error('[FavoriteList] 删除收藏失败:', error);
            Taro.showToast({
              title: '删除失败',
              icon: 'none'
            });
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

      console.log('[FavoriteList] 更新状态响应:', res.data);

      if (res.data?.code === 200) {
        Taro.showToast({
          title: '状态已更新',
          icon: 'success'
        });
        loadFavorites();
      } else {
        Taro.showToast({
          title: '更新状态失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('[FavoriteList] 更新状态失败:', error);
      Taro.showToast({
        title: '更新状态失败',
        icon: 'none'
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case '待拍':
        return <Text>🕐</Text>;
      case '已拍':
        return <Text>✓</Text>;
      case '已发布':
        return <Text>U</Text>;
      default:
        return <Text>🕐</Text>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '待拍':
        return 'bg-amber-100 text-amber-700';
      case '已拍':
        return 'bg-green-100 text-green-700';
      case '已发布':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <View className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <View className="bg-slate-800 sticky top-0 z-10 shadow-sm">
        <View className="px-4 py-3 flex items-center justify-between">
          <View className="flex items-center gap-2">
            <Text>❤️</Text>
            <Text className="text-lg font-semibold text-gray-800 block">待拍清单</Text>
          </View>
          <View className="flex items-center gap-1">
            <Text className="text-sm text-gray-500 block">共 {favorites.length} 条</Text>
          </View>
        </View>
      </View>

      {/* 列表内容 */}
      <ScrollView className="flex-1" scrollY>
        {loading ? (
          <View className="flex items-center justify-center py-20">
            <Text className="block text-gray-500 text-sm">加载中...</Text>
          </View>
        ) : favorites.length === 0 ? (
          <View className="flex flex-col items-center justify-center py-20 px-4">
            <Text>❤️</Text>
            <Text className="block text-gray-500 mt-4 text-center">
              暂无收藏内容{'\n'}去热点列表收藏感兴趣的内容吧
            </Text>
          </View>
        ) : (
          <View className="p-4 space-y-4">
            {favorites.map((item) => (
              <View key={item.id} className="bg-slate-800 rounded-xl p-4 shadow-sm">
                {/* 热点标题 */}
                <View className="mb-3 pb-3 border-b border-gray-100">
                  <Text className="block text-xs text-gray-500 mb-1">热点标题</Text>
                  <Text className="block text-sm font-medium text-gray-800">
                    {item.hotTitle}
                  </Text>
                </View>

                {/* 选题标题 */}
                <View className="mb-3">
                  <Text className="block text-xs text-gray-500 mb-1">选题标题</Text>
                  <Text className="block text-base font-semibold text-purple-700">
                    {item.topicTitle}
                  </Text>
                </View>

                {/* 脚本摘要 */}
                {item.scriptSummary && (
                  <View className="mb-3">
                    <Text className="block text-xs text-gray-500 mb-1">脚本摘要</Text>
                    <Text className="block text-sm text-gray-600 line-clamp-2">
                      {item.scriptSummary}
                    </Text>
                  </View>
                )}

                {/* 账号和负责人 */}
                <View className="flex gap-3 mb-3">
                  <View className="flex-1">
                    <Text className="block text-xs text-gray-500 mb-1">账号</Text>
                    <Text className="block text-sm text-gray-700">{item.account || '-'}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="block text-xs text-gray-500 mb-1">负责人</Text>
                    <Text className="block text-sm text-gray-700">{item.responsible || '-'}</Text>
                  </View>
                </View>

                {/* 状态和操作 */}
                <View className="flex items-center justify-between">
                  <View className={`px-3 py-1 rounded-full flex items-center gap-1 ${getStatusColor(item.status)}`}>
                    {getStatusIcon(item.status)}
                    <Text className="block text-xs font-medium">{item.status}</Text>
                  </View>

                  <View className="flex gap-2">
                    {/* 状态切换 */}
                    {item.status === '待拍' && (
                      <Button
                        size="mini"
                        type="primary"
                        className="bg-green-500 border-none text-white"
                        onClick={() => handleUpdateStatus(item.id, '已拍')}
                      >
                        已拍
                      </Button>
                    )}
                    {item.status === '已拍' && (
                      <Button
                        size="mini"
                        type="primary"
                        className="bg-blue-500 border-none text-white"
                        onClick={() => handleUpdateStatus(item.id, '已发布')}
                      >
                        已发布
                      </Button>
                    )}

                    {/* 删除按钮 */}
                    <Button
                      size="mini"
                      type="default"
                      className="border border-red-300 text-red-500"
                      onClick={() => handleDeleteFavorite(item.id)}
                    >
                      <Text>🗑️</Text>
                    </Button>
                  </View>
                </View>

                {/* 创建时间 */}
                <Text className="block text-xs text-gray-400 mt-3">
                  {item.createdAt}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* 底部 TabBar 占位 */}
      <View className="h-16" />
    </View>
  );
}
