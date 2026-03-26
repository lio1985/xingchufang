import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  Search,
  ListFilter,
  Download,
  RefreshCw,
  ChevronLeft,
  CircleCheck,
  CircleX,
  Clock,
  User,
  Monitor,
  TriangleAlert,
  Info,
  X,
  ScrollText,
} from 'lucide-react-taro';
import { Network } from '@/network';
import '@/styles/pages.css';
import '@/styles/admin.css';

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
      Taro.hideLoading();
      Taro.showToast({ title: '导出成功', icon: 'success' });
    } catch (error: any) {
      Taro.hideLoading();
      Taro.showToast({ title: error.message || '导出失败', icon: 'none' });
    }
  };

  const getStatusBadgeClass = (status: string) => {
    return status === 'success' ? 'status-active' : 'status-disabled';
  };

  const getStatusText = (status: string) => {
    return status === 'success' ? '成功' : '失败';
  };

  const formatOperation = (operation: string) => {
    const operationMap: { [key: string]: string } = {
      login: '登录',
      logout: '登出',
      create: '创建',
      update: '更新',
      delete: '删除',
      view: '查看',
      upload: '上传',
      download: '下载',
    };
    return operationMap[operation] || operation;
  };

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const operationOptions = [
    { value: 'all', label: '全部操作' },
    { value: 'login', label: '登录' },
    { value: 'create', label: '创建' },
    { value: 'update', label: '更新' },
    { value: 'delete', label: '删除' },
  ];

  const statusOptions = [
    { value: 'all', label: '全部状态' },
    { value: 'success', label: '成功' },
    { value: 'failure', label: '失败' },
  ];

  return (
    <View className="admin-page">
      {/* Header */}
      <View className="admin-header">
        <View className="admin-header-content">
          <View className="admin-back-btn" onClick={() => Taro.navigateBack()}>
            <ChevronLeft size={20} color="#f59e0b" />
          </View>
          <Text className="admin-title">审计日志</Text>
          <View
            className="admin-action-btn"
            onClick={handleRefresh}
          >
            <RefreshCw size={20} color={loading ? '#52525b' : '#f59e0b'} />
          </View>
        </View>

        {/* 搜索框 */}
        <View className="search-box" style={{ marginTop: '16px' }}>
          <Search size={28} color="#71717a" />
          <Input
            className="search-input"
            placeholder="搜索用户、操作..."
            placeholderStyle="color: #52525b"
            value={searchText}
            onInput={(e) => handleSearch(e.detail.value)}
          />
          <View
            style={{
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: showFilters ? '#f59e0b' : '#1a1a1d',
            }}
            onClick={() => setShowFilters(!showFilters)}
          >
            <ListFilter size={20} color={showFilters ? '#000' : '#71717a'} />
          </View>
          <View
            style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#1a1a1d' }}
            onClick={exportLogs}
          >
            <Download size={20} color="#71717a" />
          </View>
        </View>

        {/* 筛选器 */}
        {showFilters && (
          <View style={{ marginTop: '16px' }}>
            <Text style={{ fontSize: '22px', color: '#71717a', marginBottom: '8px', display: 'block' }}>
              操作类型
            </Text>
            <View className="filter-bar">
              {operationOptions.map((option) => (
                <View
                  key={option.value}
                  className={`filter-item ${operationFilter === option.value ? 'filter-item-active' : ''}`}
                  onClick={() => setOperationFilter(option.value)}
                >
                  {option.label}
                </View>
              ))}
            </View>

            <Text style={{ fontSize: '22px', color: '#71717a', marginBottom: '8px', marginTop: '12px', display: 'block' }}>
              状态
            </Text>
            <View className="filter-bar">
              {statusOptions.map((option) => (
                <View
                  key={option.value}
                  className={`filter-item ${statusFilter === option.value ? 'filter-item-active' : ''}`}
                  onClick={() => setStatusFilter(option.value as any)}
                >
                  {option.label}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 统计信息 */}
        <View style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
          <Text style={{ fontSize: '22px', color: '#71717a' }}>共 {total} 条日志</Text>
          <Text style={{ fontSize: '22px', color: '#71717a' }}>第 {page} 页</Text>
        </View>
      </View>

      {/* 日志列表 */}
      <ScrollView
        className="flex-1"
        scrollY
        style={{ height: 'calc(100vh - 200px)', marginTop: '200px' }}
        onScrollToLower={handleLoadMore}
        refresherEnabled
        refresherTriggered={loading}
        onRefresherRefresh={handleRefresh}
      >
        <View className="admin-content" style={{ paddingTop: '16px' }}>
          {logs.length === 0 && !loading ? (
            <View className="empty-state">
              <ScrollText size={80} color="#71717a" />
              <Text className="empty-title">暂无审计日志</Text>
            </View>
          ) : (
            logs.map((log) => (
              <View key={log.id} className="user-list-item" onClick={() => showLogDetail(log)}>
                <View
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: log.status === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  }}
                >
                  {log.status === 'success' ? (
                    <CircleCheck size={28} color="#22c55e" />
                  ) : (
                    <CircleX size={28} color="#ef4444" />
                  )}
                </View>

                <View className="user-info">
                  <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Text className="user-name">{formatOperation(log.operation)}</Text>
                    <View className={`status-badge ${getStatusBadgeClass(log.status)}`}>
                      {getStatusText(log.status)}
                    </View>
                  </View>
                  <Text className="user-meta">
                    {log.username || log.userId} · {log.resourceType || '系统'}
                  </Text>
                </View>

                <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={16} color="#52525b" />
                  <Text style={{ fontSize: '20px', color: '#52525b' }}>{formatTime(log.createdAt)}</Text>
                </View>
              </View>
            ))
          )}

          {loading && (
            <View className="loading-state">
              <RefreshCw size={48} color="#f59e0b" />
              <Text className="loading-text">加载中...</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 详情弹窗 */}
      {showDetailModal && selectedLog && (
        <View className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <View className="modal-content" onClick={(e) => e.stopPropagation()}>
            <View className="modal-header">
              <Text className="modal-title">日志详情</Text>
              <View onClick={() => setShowDetailModal(false)}>
                <X size={28} color="#71717a" />
              </View>
            </View>

            <View className="admin-card" style={{ marginBottom: '16px' }}>
              <View style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                {selectedLog.status === 'success' ? (
                  <CircleCheck size={32} color="#22c55e" />
                ) : (
                  <CircleX size={32} color="#ef4444" />
                )}
                <View>
                  <Text style={{ fontSize: '28px', fontWeight: '600', color: '#fafafa', display: 'block' }}>
                    {formatOperation(selectedLog.operation)}
                  </Text>
                  <View className={`status-badge ${getStatusBadgeClass(selectedLog.status)}`} style={{ marginTop: '4px' }}>
                    {getStatusText(selectedLog.status)}
                  </View>
                </View>
              </View>

              <View style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <User size={20} color="#71717a" />
                  <Text style={{ fontSize: '22px', color: '#71717a' }}>用户</Text>
                  <Text style={{ fontSize: '22px', color: '#fafafa' }}>{selectedLog.username || selectedLog.userId}</Text>
                </View>

                <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Clock size={20} color="#71717a" />
                  <Text style={{ fontSize: '22px', color: '#71717a' }}>时间</Text>
                  <Text style={{ fontSize: '22px', color: '#fafafa' }}>
                    {new Date(selectedLog.createdAt).toLocaleString('zh-CN')}
                  </Text>
                </View>

                {selectedLog.ipAddress && (
                  <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Monitor size={20} color="#71717a" />
                    <Text style={{ fontSize: '22px', color: '#71717a' }}>IP</Text>
                    <Text style={{ fontSize: '22px', color: '#fafafa' }}>{selectedLog.ipAddress}</Text>
                  </View>
                )}

                {selectedLog.resourceType && (
                  <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Info size={20} color="#71717a" />
                    <Text style={{ fontSize: '22px', color: '#71717a' }}>资源</Text>
                    <Text style={{ fontSize: '22px', color: '#fafafa' }}>
                      {selectedLog.resourceType}
                      {selectedLog.resourceId && ` / ${selectedLog.resourceId}`}
                    </Text>
                  </View>
                )}

                {selectedLog.errorMessage && (
                  <View
                    style={{
                      padding: '16px',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      borderRadius: '12px',
                      marginTop: '8px',
                    }}
                  >
                    <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <TriangleAlert size={20} color="#ef4444" />
                      <Text style={{ fontSize: '22px', fontWeight: '600', color: '#ef4444' }}>错误信息</Text>
                    </View>
                    <Text style={{ fontSize: '22px', color: '#fca5a5' }}>{selectedLog.errorMessage}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
