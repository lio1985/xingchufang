import React, { useState } from 'react';
import Taro, { useLoad } from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/components';
import {
  RefreshCw,
  Download,
  FileCode,
  FileSpreadsheet,
  ChevronLeft,
  Users,
  BookOpen,
  ScrollText,
  Database,
  Clock,
  CircleCheck,
  CircleX,
  LoaderCircle,
  Settings,
} from 'lucide-react-taro';
import { Network } from '@/network';
import '@/styles/pages.css';
import '@/styles/admin.css';

type ExportDataType = 'users' | 'lexicons' | 'logs' | 'all';
type ExportFormat = 'json' | 'csv';
type ExportTaskStatus = 'pending' | 'processing' | 'completed' | 'failed';

interface ExportTask {
  id: string;
  dataType: ExportDataType;
  format: ExportFormat;
  status: ExportTaskStatus;
  downloadUrl: string;
  fileName: string;
  fileSize: number;
  recordCount: number;
  createdAt: string;
  completedAt: string;
  error: string;
}

interface ExportConfig {
  dataType: ExportDataType;
  format: ExportFormat;
  timeRange?: {
    startDate: string;
    endDate: string;
  };
}

interface ExportStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  failedTasks: number;
  totalExportSize: number;
}

const DataExportPage: React.FC = () => {
  const [config, setConfig] = useState<ExportConfig>({
    dataType: 'all',
    format: 'json',
  });
  const [tasks, setTasks] = useState<ExportTask[]>([]);
  const [stats, setStats] = useState<ExportStats>({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    failedTasks: 0,
    totalExportSize: 0,
  });
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');

  useLoad(() => {
    loadStats();
    loadHistory();
  });

  const loadStats = async () => {
    try {
      const res = await Network.request({
        url: '/api/admin/data-export/stats',
      });

      if (res.data.code === 200) {
        setStats(res.data.data);
      }
    } catch (error) {
      console.error('加载统计失败:', error);
    }
  };

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await Network.request({
        url: '/api/admin/data-export/history',
        data: {
          page: 1,
          pageSize: 20,
        },
      });

      if (res.data.code === 200) {
        setTasks(res.data.data);
      }
    } catch (error) {
      console.error('加载历史失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await Network.request({
        url: '/api/admin/data-export/export',
        method: 'POST',
        data: config,
      });

      if (res.data.code === 200) {
        Taro.showToast({ title: '导出任务创建成功', icon: 'success' });
        setActiveTab('history');
        loadHistory();
        loadStats();
      } else {
        Taro.showToast({ title: res.data.msg || '创建失败', icon: 'none' });
      }
    } catch (error) {
      console.error('创建导出任务失败:', error);
      Taro.showToast({ title: '创建失败', icon: 'none' });
    } finally {
      setExporting(false);
    }
  };

  const dataTypeOptions = [
    { value: 'all', label: '全部数据', icon: Database, color: '#f59e0b' },
    { value: 'users', label: '用户数据', icon: Users, color: '#3b82f6' },
    { value: 'lexicons', label: '语料库', icon: BookOpen, color: '#22c55e' },
    { value: 'logs', label: '操作日志', icon: ScrollText, color: '#a855f7' },
  ];

  const formatOptions = [
    { value: 'json', label: 'JSON', icon: FileCode, color: '#f59e0b' },
    { value: 'csv', label: 'CSV', icon: FileSpreadsheet, color: '#22c55e' },
  ];

  const getStatusIcon = (status: ExportTaskStatus) => {
    switch (status) {
      case 'completed':
        return <CircleCheck size={20} color="#22c55e" />;
      case 'failed':
        return <CircleX size={20} color="#ef4444" />;
      case 'processing':
        return <LoaderCircle size={20} color="#3b82f6" />;
      default:
        return <Clock size={20} color="#71717a" />;
    }
  };

  const getStatusText = (status: ExportTaskStatus) => {
    const map: Record<ExportTaskStatus, string> = {
      pending: '等待中',
      processing: '处理中',
      completed: '已完成',
      failed: '失败',
    };
    return map[status];
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <View className="admin-page">
      {/* Header */}
      <View className="admin-header">
        <View className="admin-header-content">
          <View onClick={() => Taro.navigateBack()} style={{ padding: '8px', borderRadius: '12px', backgroundColor: '#1a1a1d' }}>
            <ChevronLeft size={24} color="#f59e0b" />
          </View>
          <Text className="admin-title">数据导出</Text>
          <View
            style={{ padding: '8px', borderRadius: '12px', backgroundColor: '#1a1a1d' }}
            onClick={() => {
              loadStats();
              loadHistory();
            }}
          >
            <RefreshCw size={24} color={loading ? '#52525b' : '#f59e0b'} />
          </View>
        </View>

        {/* Tab 切换 */}
        <View style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          {[
            { key: 'create', label: '创建导出' },
            { key: 'history', label: '导出历史' },
          ].map((tab) => (
            <View
              key={tab.key}
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '12px',
                backgroundColor: activeTab === tab.key ? '#f59e0b' : '#1a1a1d',
                textAlign: 'center',
              }}
              onClick={() => setActiveTab(tab.key as any)}
            >
              <Text
                style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: activeTab === tab.key ? '#000' : '#a1a1aa',
                }}
              >
                {tab.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView scrollY style={{ height: 'calc(100vh - 160px)', marginTop: '160px' }}>
        <View className="admin-content" style={{ paddingTop: '16px' }}>
          {activeTab === 'create' ? (
            <>
              {/* 统计概览 */}
              <View className="stats-grid">
                <View className="stat-card">
                  <View className="stat-icon-wrapper stat-icon-primary">
                    <Download size={24} color="#f59e0b" />
                  </View>
                  <Text className="stat-value">{stats.totalTasks}</Text>
                  <Text className="stat-label">总导出次数</Text>
                </View>

                <View className="stat-card">
                  <View className="stat-icon-wrapper stat-icon-success">
                    <CircleCheck size={24} color="#22c55e" />
                  </View>
                  <Text className="stat-value">{stats.completedTasks}</Text>
                  <Text className="stat-label">已完成</Text>
                </View>
              </View>

              {/* 数据类型选择 */}
              <View className="admin-card">
                <View className="admin-card-header">
                  <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Settings size={24} color="#f59e0b" />
                    <Text className="admin-card-title">导出设置</Text>
                  </View>
                </View>

                <Text style={{ fontSize: '22px', color: '#71717a', marginBottom: '12px', display: 'block' }}>
                  选择数据类型
                </Text>

                <View style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {dataTypeOptions.map((option) => (
                    <View
                      key={option.value}
                      className={`user-list-item ${config.dataType === option.value ? 'card-hover' : ''}`}
                      style={{
                        borderLeft: config.dataType === option.value ? `4px solid ${option.color}` : undefined,
                      }}
                      onClick={() => setConfig({ ...config, dataType: option.value as ExportDataType })}
                    >
                      <View
                        style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '12px',
                          backgroundColor: `${option.color}20`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <option.icon size={24} color={option.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: '26px', fontWeight: '600', color: '#fafafa', display: 'block' }}>
                          {option.label}
                        </Text>
                      </View>
                      {config.dataType === option.value && (
                        <CircleCheck size={24} color={option.color} />
                      )}
                    </View>
                  ))}
                </View>

                <Text style={{ fontSize: '22px', color: '#71717a', marginBottom: '12px', marginTop: '20px', display: 'block' }}>
                  选择格式
                </Text>

                <View style={{ display: 'flex', gap: '12px' }}>
                  {formatOptions.map((option) => (
                    <View
                      key={option.value}
                      style={{
                        flex: 1,
                        padding: '16px',
                        borderRadius: '12px',
                        backgroundColor: config.format === option.value ? `${option.color}20` : '#1a1a1d',
                        border: `2px solid ${config.format === option.value ? option.color : '#27272a'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                      }}
                      onClick={() => setConfig({ ...config, format: option.value as ExportFormat })}
                    >
                      <option.icon size={24} color={config.format === option.value ? option.color : '#71717a'} />
                      <Text
                        style={{
                          fontSize: '24px',
                          fontWeight: '600',
                          color: config.format === option.value ? option.color : '#a1a1aa',
                        }}
                      >
                        {option.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* 导出按钮 */}
              <View
                className="action-btn-primary"
                style={{ marginTop: '20px', opacity: exporting ? 0.6 : 1 }}
                onClick={handleExport}
              >
                <Download size={28} color="#000" />
                <Text className="action-btn-primary-text" style={{ marginLeft: '8px' }}>
                  {exporting ? '创建中...' : '开始导出'}
                </Text>
              </View>
            </>
          ) : (
            <>
              {/* 导出历史 */}
              <Text style={{ fontSize: '24px', fontWeight: '600', color: '#fafafa', marginBottom: '16px', display: 'block' }}>
                导出历史
              </Text>

              {tasks.length === 0 ? (
                <View className="empty-state">
                  <Download size={80} color="#71717a" />
                  <Text className="empty-title">暂无导出记录</Text>
                </View>
              ) : (
                <View style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {tasks.map((task) => (
                    <View key={task.id} className="admin-card">
                      <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {getStatusIcon(task.status)}
                          <View>
                            <Text style={{ fontSize: '26px', fontWeight: '600', color: '#fafafa', display: 'block' }}>
                              {task.fileName}
                            </Text>
                            <Text style={{ fontSize: '20px', color: '#71717a', marginTop: '4px' }}>
                              {task.recordCount} 条记录 · {formatFileSize(task.fileSize)}
                            </Text>
                          </View>
                        </View>

                        {task.status === 'completed' && (
                          <View
                            style={{
                              padding: '10px 20px',
                              backgroundColor: 'rgba(245, 158, 11, 0.1)',
                              borderRadius: '10px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                            onClick={() => {
                              // 下载文件
                              Taro.showToast({ title: '开始下载', icon: 'success' });
                            }}
                          >
                            <Download size={18} color="#f59e0b" />
                            <Text style={{ fontSize: '22px', color: '#f59e0b' }}>下载</Text>
                          </View>
                        )}
                      </View>

                      <View style={{ marginTop: '12px', display: 'flex', gap: '16px' }}>
                        <Text style={{ fontSize: '20px', color: '#52525b' }}>
                          {new Date(task.createdAt).toLocaleString('zh-CN')}
                        </Text>
                        <View
                          className={`status-badge ${
                            task.status === 'completed'
                              ? 'status-active'
                              : task.status === 'failed'
                              ? 'status-disabled'
                              : 'status-pending'
                          }`}
                        >
                          {getStatusText(task.status)}
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default DataExportPage;
