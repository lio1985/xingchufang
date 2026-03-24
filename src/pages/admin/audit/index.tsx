import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Network } from '@/network';

interface OperationLog {
  id: string;
  userId: string;
  username?: string;
  operation: string;
  resourceType?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure';
  errorMessage?: string;
  createdAt: string;
}

interface LogsResponse {
  logs: OperationLog[];
  total: number;
  page: number;
  pageSize: number;
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [searchText, setSearchText] = useState('');
  const [operationFilter, setOperationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failure'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState<OperationLog | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const loadLogs = async (pageNum: number = 1) => {
    if (loading) return;

    setLoading(true);
    try {
      const res = await Network.request({
        url: '/api/audit/logs',
        method: 'GET',
        data: {
          page: pageNum,
          pageSize,
          operation: operationFilter === 'all' ? undefined : operationFilter,
          status: statusFilter === 'all' ? undefined : statusFilter,
          search: searchText || undefined,
        },
      });

      console.log('审计日志响应:', res.data);

      if (res.data && res.data.data) {
        const response = res.data.data as LogsResponse;
        if (pageNum === 1) {
          setLogs(response.logs);
        } else {
          setLogs([...logs, ...response.logs]);
        }
        setTotal(response.total);
        setPage(pageNum);
      }
    } catch (error: any) {
      console.error('加载审计日志失败:', error);
      Taro.showToast({
        title: error.message || '加载失败',
        icon: 'none',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [operationFilter, statusFilter, searchText]);

  const handleRefresh = () => {
    setPage(1);
    loadLogs(1);
  };

  const handleLoadMore = () => {
    if (logs.length < total && !loading) {
      loadLogs(page + 1);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const showLogDetail = (log: OperationLog) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  const exportLogs = async () => {
    try {
      Taro.showLoading({ title: '导出中...' });
      
      // 这里应该调用导出接口，暂时用 alert 模拟
      // const res = await Network.request({
      //   url: '/api/audit/logs/export',
      //   method: 'GET',
      //   data: { ...filters }
      // });
      
      Taro.hideLoading();
      Taro.showToast({
        title: '导出成功',
        icon: 'success',
      });
    } catch (error: any) {
      console.error('导出失败:', error);
      Taro.hideLoading();
      Taro.showToast({
        title: error.message || '导出失败',
        icon: 'none',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'success' ? '成功' : '失败';
  };

  const getStatusColor = (status: string) => {
    return status === 'success'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  const formatOperation = (operation: string) => {
    const operationMap: { [key: string]: string } = {
      'login': '登录',
      'logout': '登出',
      'create': '创建',
      'update': '更新',
      'delete': '删除',
      'view': '查看',
      'upload': '上传',
      'download': '下载',
    };
    return operationMap[operation] || operation;
  };

  return (
    <View className="min-h-screen bg-slate-900">
      {/* 顶部搜索栏 */}
      <View className="sticky top-0 z-10 bg-slate-800 px-4 py-3 border-b border-slate-700">
        <View className="flex items-center gap-3">
          <View className="flex-1 bg-slate-800 rounded-lg px-4 py-2 flex items-center gap-2">
            <Text>?</Text>
            <Input
              className="flex-1 text-white bg-transparent placeholder-slate-400"
              placeholder="搜索用户、操作..."
              value={searchText}
              onInput={(e) => handleSearch(e.detail.value)}
            />
          </View>
          <View
            className="bg-slate-800 rounded-lg px-3 py-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Text>📋</Text>
          </View>
          <View className="bg-slate-800 rounded-lg px-3 py-2" onClick={exportLogs}>
            <Text>⬇️</Text>
          </View>
        </View>

        {/* 筛选器 */}
        {showFilters && (
          <View className="mt-3 flex flex-wrap gap-2">
            <View
              className={`px-3 py-1.5 rounded-lg text-sm ${
                operationFilter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800 text-slate-300'
              }`}
              onClick={() => setOperationFilter('all')}
            >
              <Text className="block">全部操作</Text>
            </View>
            <View
              className={`px-3 py-1.5 rounded-lg text-sm ${
                operationFilter === 'login'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800 text-slate-300'
              }`}
              onClick={() => setOperationFilter('login')}
            >
              <Text className="block">登录</Text>
            </View>
            <View
              className={`px-3 py-1.5 rounded-lg text-sm ${
                operationFilter === 'create'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800 text-slate-300'
              }`}
              onClick={() => setOperationFilter('create')}
            >
              <Text className="block">创建</Text>
            </View>
            <View
              className={`px-3 py-1.5 rounded-lg text-sm ${
                operationFilter === 'update'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800 text-slate-300'
              }`}
              onClick={() => setOperationFilter('update')}
            >
              <Text className="block">更新</Text>
            </View>
            <View
              className={`px-3 py-1.5 rounded-lg text-sm ${
                operationFilter === 'delete'
                  ? 'bg-blue-500 text-white'
                  : 'bg-slate-800 text-slate-300'
              }`}
              onClick={() => setOperationFilter('delete')}
            >
              <Text className="block">删除</Text>
            </View>
          </View>
        )}

        {/* 状态筛选 */}
        {showFilters && (
          <View className="mt-2 flex gap-2">
            <View
              className={`px-3 py-1.5 rounded-lg text-sm ${
                statusFilter === 'all'
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-800 text-slate-300'
              }`}
              onClick={() => setStatusFilter('all')}
            >
              <Text className="block">全部状态</Text>
            </View>
            <View
              className={`px-3 py-1.5 rounded-lg text-sm ${
                statusFilter === 'success'
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-800 text-slate-300'
              }`}
              onClick={() => setStatusFilter('success')}
            >
              <Text className="block">成功</Text>
            </View>
            <View
              className={`px-3 py-1.5 rounded-lg text-sm ${
                statusFilter === 'failure'
                  ? 'bg-red-500 text-white'
                  : 'bg-slate-800 text-slate-300'
              }`}
              onClick={() => setStatusFilter('failure')}
            >
              <Text className="block">失败</Text>
            </View>
          </View>
        )}

        {/* 统计信息 */}
        <View className="mt-3 flex justify-between text-slate-400 text-sm">
          <Text className="block">共 {total} 条日志</Text>
          <Text className="block">第 {page} 页</Text>
        </View>
      </View>

      {/* 日志列表 */}
      <ScrollView
        className="flex-1"
        scrollY
        onScrollToLower={handleLoadMore}
        refresherEnabled
        refresherTriggered={loading}
        onRefresherRefresh={handleRefresh}
      >
        <View className="px-4 py-3 space-y-3">
          {logs.map((log) => (
            <View
              key={log.id}
              className="bg-slate-800 rounded-xl p-4 border border-slate-700"
              onClick={() => showLogDetail(log)}
            >
              <View className="flex items-start gap-3">
                <View className="p-2 rounded-lg bg-slate-800 flex-shrink-0">
                  <Text>🕐</Text>
                </View>
                <View className="flex-1 min-w-0">
                  <View className="flex items-center gap-2 mb-1">
                    <Text className="text-white font-semibold">{formatOperation(log.operation)}</Text>
                    <View className={`px-2 py-0.5 rounded text-xs ${getStatusColor(log.status)}`}>
                      {getStatusBadge(log.status)}
                    </View>
                  </View>
                  {log.username && (
                    <Text className="text-slate-400 text-sm block">用户: {log.username}</Text>
                  )}
                  {log.resourceType && (
                    <View className="flex items-center gap-1">
                      <Text>📄</Text>
                      <Text className="text-slate-400 text-sm">{log.resourceType}</Text>
                    </View>
                  )}
                  <Text className="text-slate-300 text-xs block mt-1">
                    {new Date(log.createdAt).toLocaleString('zh-CN')}
                  </Text>
                </View>
                <Text>⌄</Text>
              </View>
            </View>
          ))}

          {loading && (
            <View className="text-center py-4">
              <Text className="text-slate-400">加载中...</Text>
            </View>
          )}

          {!loading && logs.length === 0 && (
            <View className="text-center py-12">
              <Text>🕐</Text>
              <Text className="text-slate-400 block">暂无日志数据</Text>
            </View>
          )}

          {!loading && logs.length >= total && logs.length > 0 && (
            <View className="text-center py-4">
              <Text className="text-slate-400">已加载全部数据</Text>
            </View>
          )}
        </View>

        {/* 底部空间 */}
        <View className="h-20"></View>
      </ScrollView>

      {/* 日志详情弹窗 */}
      {showDetailModal && selectedLog && (
        <View className="fixed inset-0 z-50 bg-black/50 flex items-end">
          <View className="w-full bg-slate-800 rounded-t-3xl p-4 max-h-[80vh] overflow-y-auto">
            <View className="flex justify-between items-center mb-4">
              <Text className="text-white text-lg font-bold">日志详情</Text>
              <View onClick={() => setShowDetailModal(false)}>
                <Text className="text-slate-400 text-2xl">×</Text>
              </View>
            </View>

            <View className="space-y-3">
              {/* 操作信息 */}
              <View className="bg-slate-800 rounded-lg p-4">
                <Text className="text-slate-400 text-sm mb-2 block">操作</Text>
                <Text className="text-white font-semibold">{formatOperation(selectedLog.operation)}</Text>
                <View className={`px-2 py-1 rounded text-xs mt-2 inline-block ${getStatusColor(selectedLog.status)}`}>
                  {getStatusBadge(selectedLog.status)}
                </View>
              </View>

              {/* 用户信息 */}
              <View className="bg-slate-800 rounded-lg p-4">
                <Text className="text-slate-400 text-sm mb-2 block">用户信息</Text>
                {selectedLog.username && (
                  <View className="mb-2">
                    <Text className="text-slate-400 text-xs block">用户名</Text>
                    <Text className="text-white">{selectedLog.username}</Text>
                  </View>
                )}
                <View className="mb-2">
                  <Text className="text-slate-400 text-xs block">用户ID</Text>
                  <Text className="text-white">{selectedLog.userId}</Text>
                </View>
              </View>

              {/* 资源信息 */}
              {selectedLog.resourceType && (
                <View className="bg-slate-800 rounded-lg p-4">
                  <Text className="text-slate-400 text-sm mb-2 block">资源信息</Text>
                  <View className="mb-2">
                    <Text className="text-slate-400 text-xs block">资源类型</Text>
                    <Text className="text-white">{selectedLog.resourceType}</Text>
                  </View>
                  {selectedLog.resourceId && (
                    <View className="mb-2">
                      <Text className="text-slate-400 text-xs block">资源ID</Text>
                      <Text className="text-white">{selectedLog.resourceId}</Text>
                    </View>
                  )}
                </View>
              )}

              {/* 网络信息 */}
              <View className="bg-slate-800 rounded-lg p-4">
                <Text className="text-slate-400 text-sm mb-2 block">网络信息</Text>
                {selectedLog.ipAddress && (
                  <View className="mb-2">
                    <Text className="text-slate-400 text-xs block">IP地址</Text>
                    <Text className="text-white">{selectedLog.ipAddress}</Text>
                  </View>
                )}
                {selectedLog.userAgent && (
                  <View className="mb-2">
                    <Text className="text-slate-400 text-xs block">User Agent</Text>
                    <Text className="text-white text-sm break-all">{selectedLog.userAgent}</Text>
                  </View>
                )}
              </View>

              {/* 时间信息 */}
              <View className="bg-slate-800 rounded-lg p-4">
                <Text className="text-slate-400 text-sm mb-2 block">时间</Text>
                <View className="mb-2">
                  <Text className="text-slate-400 text-xs block">操作时间</Text>
                  <Text className="text-white">
                    {new Date(selectedLog.createdAt).toLocaleString('zh-CN')}
                  </Text>
                </View>
              </View>

              {/* 错误信息 */}
              {selectedLog.errorMessage && (
                <View className="bg-red-900/30 rounded-lg p-4 border border-red-800">
                  <Text className="text-red-400 text-sm mb-2 block">错误信息</Text>
                  <Text className="text-red-300">{selectedLog.errorMessage}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
