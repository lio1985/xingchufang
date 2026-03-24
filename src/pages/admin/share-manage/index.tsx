import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Input, Button } from '@tarojs/components';
import Taro, { showToast } from '@tarojs/taro';
import { Network } from '@/network';

interface ShareRecord {
  lexiconId: string;
  lexiconTitle: string;
  userId: string;
  userName: string;
  isShared: boolean;
  shareScope: 'custom' | 'all' | 'department';
  sharedWithUsers: string[];
  isGloballyShared: boolean;
  sharedAt: string | null;
}

export default function AdminShareManagePage() {
  const [loading, setLoading] = useState(false);
  const [shareRecords, setShareRecords] = useState<ShareRecord[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'shared' | 'global'>('all');
  const [showHistory, setShowHistory] = useState(false);
  const [historyRecords, setHistoryRecords] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  // const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // const [showBatchActions, setShowBatchActions] = useState(false);

  // 加载共享记录
  const loadShareRecords = async () => {
    setLoading(true);
    try {
      const response = await Network.request({
        url: '/api/admin/share/all-records',
        method: 'GET',
      });

      console.log('共享记录响应:', response.data);

      if (response.statusCode === 200 && response.data?.data) {
        setShareRecords(response.data.data || []);
      }
    } catch (error) {
      console.error('加载共享记录失败:', error);
      showToast({
        title: '加载失败',
        icon: 'none',
      });
    } finally {
      setLoading(false);
    }
  };

  // 设置全局共享
  const handleToggleGlobalShare = async (lexiconId: string, isGloballyShared: boolean) => {
    try {
      await Network.request({
        url: `/api/admin/lexicons/${lexiconId}/force-share`,
        method: 'POST',
        data: { isGloballyShared: !isGloballyShared },
      });

      showToast({
        title: !isGloballyShared ? '已开启全局共享' : '已关闭全局共享',
        icon: 'success',
      });

      await loadShareRecords();
    } catch (error) {
      console.error('设置全局共享失败:', error);
      showToast({
        title: '操作失败',
        icon: 'none',
      });
    }
  };

  // 获取共享范围标签
  const getShareScopeLabel = (scope: string) => {
    const labels: Record<string, { label: string; color: string; bg: string }> = {
      custom: { label: '指定用户', color: 'text-blue-400', bg: 'bg-slate-9000/20' },
      all: { label: '所有人', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
      department: { label: '同部门', color: 'text-purple-400', bg: 'bg-purple-500/20' },
    };
    return labels[scope] || labels.custom;
  };

  // 过滤共享记录
  const filteredRecords = shareRecords.filter((record) => {
    // 关键词搜索
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      const matchTitle = record.lexiconTitle.toLowerCase().includes(keyword);
      const matchUser = record.userName.toLowerCase().includes(keyword);
      if (!matchTitle && !matchUser) return false;
    }

    // 类型过滤
    if (filterType === 'global' && !record.isGloballyShared) return false;
    if (filterType === 'shared' && !record.isShared) return false;

    return true;
  });

  // 加载共享历史
  const loadShareHistory = async (lexiconId: string) => {
    setHistoryLoading(true);
    try {
      const response = await Network.request({
        url: '/api/lexicon/share-history',
        method: 'GET',
        data: {
          lexiconId,
          page: 1,
          pageSize: 50,
        },
      });

      console.log('共享历史响应:', response.data);

      if (response.statusCode === 200 && response.data?.data) {
        setHistoryRecords(response.data.data.items || []);
        setShowHistory(true);
      }
    } catch (error) {
      console.error('加载共享历史失败:', error);
      showToast({
        title: '加载失败',
        icon: 'none',
      });
    } finally {
      setHistoryLoading(false);
    }
  };

  /*
  // 切换选择状态
  const toggleSelect = (lexiconId: string) => {
    setSelectedIds((prev) =>
      prev.includes(lexiconId)
        ? prev.filter((id) => id !== lexiconId)
        : [...prev, lexiconId]
    );
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    const allIds = filteredRecords.map((r) => r.lexiconId);
    if (selectedIds.length === allIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allIds);
    }
  };

  // 批量设置全局共享
  const handleBatchSetGlobalShare = async () => {
    if (selectedIds.length === 0) {
      showToast({
        title: '请先选择语料库',
        icon: 'none',
      });
      return;
    }

    try {
      showToast({
        title: '批量设置中...',
        icon: 'loading',
      });

      // 调用批量共享接口
      const res = await Network.request({
        url: '/api/admin/share/batch-set-global',
        method: 'POST',
        data: { lexiconIds: selectedIds, isGloballyShared: true },
      });

      if (res.data.code === 200) {
        showToast({
          title: `已为 ${selectedIds.length} 个语料库设置全局共享`,
          icon: 'success',
        });
        setSelectedIds([]);
        setShowBatchActions(false);
        await loadShareRecords();
      } else {
        showToast({
          title: res.data.msg || '操作失败',
          icon: 'none',
        });
      }
    } catch (error) {
      console.error('批量设置全局共享失败:', error);
      showToast({
        title: '操作失败',
        icon: 'none',
      });
    }
  };

  // 批量取消全局共享
  const handleBatchCancelGlobalShare = async () => {
    if (selectedIds.length === 0) {
      showToast({
        title: '请先选择语料库',
        icon: 'none',
      });
      return;
    }

    try {
      showToast({
        title: '批量取消中...',
        icon: 'loading',
      });

      // 调用批量共享接口
      const res = await Network.request({
        url: '/api/admin/share/batch-set-global',
        method: 'POST',
        data: { lexiconIds: selectedIds, isGloballyShared: false },
      });

      if (res.data.code === 200) {
        showToast({
          title: `已为 ${selectedIds.length} 个语料库取消全局共享`,
          icon: 'success',
        });
        setSelectedIds([]);
        setShowBatchActions(false);
        await loadShareRecords();
      } else {
        showToast({
          title: res.data.msg || '操作失败',
          icon: 'none',
        });
      }
    } catch (error) {
      console.error('批量取消全局共享失败:', error);
      showToast({
        title: '操作失败',
        icon: 'none',
      });
    }
  };
  */

  useEffect(() => {
    loadShareRecords();
  }, []);

  return (
    <View className="min-h-screen bg-slate-900">
      {/* 顶部导航栏 */}
      <View className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 px-4 py-5">
        <View className="flex items-center justify-between">
          <View className="flex items-center gap-3">
            <View className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl flex items-center justify-center">
              <Text>U</Text>
            </View>
            <Text className="block text-xl font-bold text-white">共享管理</Text>
          </View>
          <View className="flex items-center gap-2">
            <View
              className="p-2 bg-slate-800 rounded-lg active:scale-95 transition-all"
              onClick={() => Taro.navigateTo({ url: '/pages/admin/share-stats/index' })}
            >
              <Text>^</Text>
            </View>
            <View
              className="p-2 bg-slate-800 rounded-lg active:scale-95 transition-all"
              onClick={loadShareRecords}
            >
              <Text>🔄</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" scrollY>
        <View className="px-4 py-6">
          {/* 统计卡片 */}
          <View className="grid grid-cols-2 gap-3 mb-6">
            <View className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700">
              <View className="flex items-center gap-2 mb-2">
                <Text>U</Text>
                <Text className="block text-sm text-slate-400">用户共享</Text>
              </View>
              <Text className="block text-2xl font-bold text-white">
                {shareRecords.filter((r) => r.isShared).length}
              </Text>
            </View>
            <View className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700">
              <View className="flex items-center gap-2 mb-2">
                <Text>🌐</Text>
                <Text className="block text-sm text-slate-400">全局共享</Text>
              </View>
              <Text className="block text-2xl font-bold text-white">
                {shareRecords.filter((r) => r.isGloballyShared).length}
              </Text>
            </View>
          </View>

          {/* 搜索框 */}
          <View className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700 mb-4">
            <View className="bg-slate-800 rounded-xl px-4 py-3 flex items-center gap-3">
              <Text>?</Text>
              <Input
                className="flex-1 bg-transparent text-white text-sm"
                placeholder="搜索语料名称或用户..."
                value={searchKeyword}
                onInput={(e) => setSearchKeyword(e.detail.value)}
              />
            </View>
          </View>

          {/* 过滤器 */}
          <View className="flex gap-2 mb-4">
            {[
              { value: 'all', label: '全部' },
              { value: 'shared', label: '用户共享' },
              { value: 'global', label: '全局共享' },
            ].map((filter) => (
              <View
                key={filter.value}
                className={`px-4 py-2 rounded-xl border-2 transition-all ${
                  filterType === filter.value
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-700 bg-slate-800/50'
                }`}
                onClick={() => setFilterType(filter.value as any)}
              >
                <Text
                  className={`block text-sm ${
                    filterType === filter.value ? 'text-white' : 'text-slate-400'
                  }`}
                >
                  {filter.label}
                </Text>
              </View>
            ))}
          </View>

          {/* 共享记录列表 */}
          {filteredRecords.length === 0 ? (
            <View className="flex flex-col items-center justify-center py-12">
              <Text>ℹ️</Text>
              <Text className="block text-sm text-slate-400 mt-3">
                {searchKeyword ? '未找到匹配的共享记录' : '暂无共享记录'}
              </Text>
            </View>
          ) : (
            <View className="flex flex-col gap-3">
              {filteredRecords.map((record) => {
                const scopeInfo = getShareScopeLabel(record.shareScope);

                return (
                  <View
                    key={record.lexiconId}
                    className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700"
                  >
                    {/* 语料信息 */}
                    <View className="mb-3">
                      <View className="flex items-start justify-between mb-2">
                        <View className="flex-1">
                          <View className="flex items-center gap-2 mb-2">
                            {record.isGloballyShared && (
                              <View className="px-2 py-0.5 bg-emerald-500/20 rounded flex items-center gap-1">
                                <Text>🌐</Text>
                                <Text className="block text-xs text-emerald-400">全局共享</Text>
                              </View>
                            )}
                            {record.isShared && !record.isGloballyShared && (
                              <View className={`px-2 py-0.5 ${scopeInfo.bg} rounded flex items-center gap-1`}>
                                <Text>👥</Text>
                                <Text className={`block text-xs ${scopeInfo.color}`}>
                                  {scopeInfo.label}
                                </Text>
                              </View>
                            )}
                          </View>
                          <Text className="block text-base font-bold text-white mb-1">
                            {record.lexiconTitle}
                          </Text>
                          <Text className="block text-xs text-slate-400">
                            所有者: {record.userName}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* 共享详情 */}
                    {record.isShared && (
                      <View className="mb-3 px-3 py-2 bg-slate-800/30 rounded-xl">
                        <View className="flex items-center justify-between">
                          <Text className="block text-xs text-slate-400">
                            共享给 {record.shareScope === 'custom' ? `${record.sharedWithUsers.length} 位用户` : scopeInfo.label}
                          </Text>
                          {record.sharedAt && (
                            <Text className="block text-xs text-slate-400">
                              {new Date(record.sharedAt).toLocaleDateString('zh-CN')}
                            </Text>
                          )}
                        </View>
                      </View>
                    )}

                    {/* 操作按钮 */}
                    <View
                      className="flex gap-2 pt-3 border-t border-slate-700"
                      style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}
                    >
                      <View style={{ flex: 1 }}>
                        <Button
                          size="mini"
                          className="w-full bg-slate-800 text-white"
                          onClick={() => loadShareHistory(record.lexiconId)}
                        >
                          查看历史
                        </Button>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Button
                          size="mini"
                          className={`w-full ${
                            record.isGloballyShared
                              ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                          }`}
                          onClick={() => handleToggleGlobalShare(record.lexiconId, record.isGloballyShared)}
                        >
                          {record.isGloballyShared ? '取消全局' : '设为全局'}
                        </Button>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {/* 底部空间 */}
          <View className="h-20"></View>
        </View>
      </ScrollView>

      {/* 共享历史弹窗 */}
      {showHistory && (
        <View
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end"
          onClick={() => setShowHistory(false)}
        >
          <View
            className="bg-slate-800 w-full rounded-t-3xl max-h-[80vh]"
            style={{ display: 'flex', flexDirection: 'column' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 弹窗标题 */}
            <View
              className="px-4 py-3 border-b border-slate-700"
              style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <Text className="block text-white text-base font-semibold">共享历史</Text>
              <View
                className="p-1 bg-slate-800 rounded-full"
                onClick={() => setShowHistory(false)}
              >
                <Text>✕</Text>
              </View>
            </View>

            {/* 历史记录列表 */}
            <ScrollView
              scrollY
              className="flex-1 px-4 py-3"
            >
              {historyLoading ? (
                <View className="flex items-center justify-center py-8">
                  <Text>🔄</Text>
                </View>
              ) : historyRecords.length === 0 ? (
                <View className="flex flex-col items-center justify-center py-16">
                  <Text>📜</Text>
                  <Text className="block text-slate-400 text-sm mt-3">暂无历史记录</Text>
                </View>
              ) : (
                historyRecords.map((record) => (
                  <View
                    key={record.id}
                    className="bg-slate-800/30 rounded-xl p-3 mb-2 border border-slate-700"
                  >
                    {/* 操作人 */}
                    <View
                      className="mb-2"
                      style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <View
                        style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '6px' }}
                      >
                        <Text>U</Text>
                        <Text className="block text-white text-sm">{record.operatorName}</Text>
                      </View>
                      <Text className="block text-slate-400 text-xs">
                        {new Date(record.createdAt).toLocaleString('zh-CN')}
                      </Text>
                    </View>

                    {/* 操作类型 */}
                    <View className="mb-2">
                      {record.action === 'share' ? (
                        <View className="flex items-center gap-1">
                          <Text>✓</Text>
                          <Text className="block text-emerald-400 text-xs">
                            {record.shareType === 'user_share' ? '用户共享' : '管理员全局共享'}
                          </Text>
                        </View>
                      ) : (
                        <View className="flex items-center gap-1">
                          <Text>✕</Text>
                          <Text className="block text-red-400 text-xs">取消共享</Text>
                        </View>
                      )}
                    </View>

                    {/* 共享范围 */}
                    {record.shareScope && record.shareScope !== 'global' && (
                      <View className="flex items-center gap-1 mb-2">
                        <Text>👤</Text>
                        <Text className="block text-slate-400 text-xs">
                          范围: {record.shareScope === 'custom' ? '指定用户' : record.shareScope === 'all' ? '所有人' : '同部门'}
                        </Text>
                      </View>
                    )}

                    {/* 共享用户 */}
                    {record.sharedWithUsers && record.sharedWithUsers.length > 0 && (
                      <View
                        className="px-2 py-1.5 bg-slate-700/30 rounded-lg"
                      >
                        <Text className="block text-slate-300 text-xs">
                          共享给 {record.sharedWithUsers.length} 位用户
                        </Text>
                      </View>
                    )}
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}
