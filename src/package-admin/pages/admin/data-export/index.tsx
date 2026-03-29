import React, { useState } from 'react';
import Taro, { useLoad } from '@tarojs/taro';
import { View, Text, ScrollView, Picker } from '@tarojs/components';
import {
  RefreshCw,
  Download,
  FileCode,
  FileSpreadsheet,
  Users,
  BookOpen,
  ScrollText,
  Database,
  Clock,
  CircleCheck,
  CircleX,
  LoaderCircle,
  Settings,
  User,
  Building2,
  Globe,
  ShoppingCart,
  Store,
} from 'lucide-react-taro';
import { Network } from '@/network';
import '@/styles/pages.css';
import '@/styles/admin.css';

type ExportDataType = 'users' | 'lexicons' | 'logs' | 'customers' | 'recycles' | 'equipment_orders' | 'all';
type ExportFormat = 'json' | 'csv';
type ExportTaskStatus = 'pending' | 'processing' | 'completed' | 'failed';
type ExportScope = 'self' | 'team' | 'all';

interface ExportTask {
  id: string;
  dataType: ExportDataType;
  format: ExportFormat;
  scope: ExportScope;
  fileName: string;
  status: ExportTaskStatus;
  downloadUrl: string;
  fileSize: number;
  recordCount: number;
  createdAt: string;
  completedAt: string;
  error: string;
}

interface ExportConfig {
  dataType: ExportDataType;
  format: ExportFormat;
  scope: ExportScope;
  teamId?: string;
}

interface ExportStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  failedTasks: number;
  totalExportSize: number;
}

interface ScopeOption {
  value: ExportScope;
  label: string;
  description: string;
}

interface Team {
  id: string;
  name: string;
  memberCount: number;
}

const DataExportPage: React.FC = () => {
  const [config, setConfig] = useState<ExportConfig>({
    dataType: 'all',
    format: 'json',
    scope: 'self',
  });
  const [tasks, setTasks] = useState<ExportTask[]>([]);
  const [stats, setStats] = useState<ExportStats>({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    failedTasks: 0,
    totalExportSize: 0,
  });
  const [scopeOptions, setScopeOptions] = useState<ScopeOption[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');

  useLoad(() => {
    loadScopeOptions();
    loadTeams();
    loadStats();
    loadHistory();
  });

  const loadScopeOptions = async () => {
    try {
      const res = await Network.request({
        url: '/api/data-export/scope-options',
      });

      if (res.data.code === 200) {
        setScopeOptions(res.data.data);
        // 默认选择第一个可用范围
        if (res.data.data.length > 0) {
          setConfig((prev) => ({ ...prev, scope: res.data.data[0].value }));
        }
      }
    } catch (error) {
      console.error('加载范围选项失败:', error);
    }
  };

  const loadTeams = async () => {
    try {
      const res = await Network.request({
        url: '/api/data-export/teams',
      });

      if (res.data.code === 200) {
        setTeams(res.data.data || []);
      }
    } catch (error) {
      console.error('加载团队列表失败:', error);
    }
  };

  const loadStats = async () => {
    try {
      const res = await Network.request({
        url: '/api/data-export/stats',
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
        url: '/api/data-export/history',
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
        url: '/api/data-export/export',
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

  const handleDownload = async (task: ExportTask) => {
    try {
      const res = await Network.request({
        url: `/api/data-export/download/${task.id}`,
      });

      if (res.data.code === 200 && res.data.data.downloadUrl) {
        // 复制下载链接或直接下载
        Taro.setClipboardData({
          data: res.data.data.downloadUrl,
          success: () => {
            Taro.showToast({ title: '下载链接已复制', icon: 'success' });
          },
        });
      } else {
        Taro.showToast({ title: '获取下载链接失败', icon: 'none' });
      }
    } catch (error) {
      console.error('下载失败:', error);
      Taro.showToast({ title: '下载失败', icon: 'none' });
    }
  };

  const dataTypeOptions = [
    { value: 'all', label: '全部数据', icon: Database, color: '#38bdf8' },
    { value: 'users', label: '用户数据', icon: Users, color: '#60a5fa' },
    { value: 'lexicons', label: '语料库', icon: BookOpen, color: '#4ade80' },
    { value: 'customers', label: '客户数据', icon: User, color: '#f472b6' },
    { value: 'recycles', label: '回收门店', icon: Store, color: '#fb923c' },
    { value: 'equipment_orders', label: '获客订单', icon: ShoppingCart, color: '#a78bfa' },
    { value: 'logs', label: '操作日志', icon: ScrollText, color: '#a855f7' },
  ];

  const formatOptions = [
    { value: 'json', label: 'JSON', icon: FileCode, color: '#38bdf8' },
    { value: 'csv', label: 'CSV', icon: FileSpreadsheet, color: '#4ade80' },
  ];

  const getScopeIcon = (scope: ExportScope) => {
    switch (scope) {
      case 'all':
        return Globe;
      case 'team':
        return Building2;
      default:
        return User;
    }
  };

  const getStatusIcon = (status: ExportTaskStatus) => {
    switch (status) {
      case 'completed':
        return <CircleCheck size={20} color="#4ade80" />;
      case 'failed':
        return <CircleX size={20} color="#f87171" />;
      case 'processing':
        return <LoaderCircle size={20} color="#60a5fa" />;
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

  const getScopeText = (scope: ExportScope) => {
    const map: Record<ExportScope, string> = {
      self: '个人数据',
      team: '团队数据',
      all: '全部数据',
    };
    return map[scope];
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
          
          <Text className="admin-title">数据导出</Text>
          <View
            className="admin-action-btn"
            onClick={() => {
              loadStats();
              loadHistory();
            }}
          >
            <RefreshCw size={22} color={loading ? '#64748b' : '#38bdf8'} />
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
                backgroundColor: activeTab === tab.key ? '#38bdf8' : '#1e293b',
                textAlign: 'center',
              }}
              onClick={() => setActiveTab(tab.key as any)}
            >
              <Text
                style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: activeTab === tab.key ? '#000' : '#94a3b8',
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
                    <Download size={24} color="#38bdf8" />
                  </View>
                  <Text className="stat-value">{stats.totalTasks}</Text>
                  <Text className="stat-label">总导出次数</Text>
                </View>

                <View className="stat-card">
                  <View className="stat-icon-wrapper stat-icon-success">
                    <CircleCheck size={24} color="#4ade80" />
                  </View>
                  <Text className="stat-value">{stats.completedTasks}</Text>
                  <Text className="stat-label">已完成</Text>
                </View>
              </View>

              {/* 导出设置 */}
              <View className="admin-card">
                <View className="admin-card-header">
                  <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Settings size={24} color="#38bdf8" />
                    <Text className="admin-card-title">导出设置</Text>
                  </View>
                </View>

                {/* 导出范围 */}
                <Text style={{ fontSize: '22px', color: '#71717a', marginBottom: '12px', display: 'block' }}>
                  选择导出范围
                </Text>

                <View style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                  {scopeOptions.map((option) => {
                    const Icon = getScopeIcon(option.value);
                    return (
                      <View
                        key={option.value}
                        className={`user-list-item ${config.scope === option.value ? 'card-hover' : ''}`}
                        style={{
                          borderLeft: config.scope === option.value ? '4px solid #38bdf8' : undefined,
                        }}
                        onClick={() => setConfig({ ...config, scope: option.value })}
                      >
                        <View
                          style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            backgroundColor: config.scope === option.value ? 'rgba(56, 189, 248, 0.2)' : '#1e293b',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Icon size={24} color={config.scope === option.value ? '#38bdf8' : '#71717a'} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: '26px', fontWeight: '600', color: '#f1f5f9', display: 'block' }}>
                            {option.label}
                          </Text>
                          <Text style={{ fontSize: '20px', color: '#71717a', marginTop: '2px' }}>
                            {option.description}
                          </Text>
                        </View>
                        {config.scope === option.value && <CircleCheck size={24} color="#38bdf8" />}
                      </View>
                    );
                  })}
                </View>

                {/* 团队选择（当选择团队数据时） */}
                {config.scope === 'team' && teams.length > 0 && (
                  <>
                    <Text style={{ fontSize: '22px', color: '#71717a', marginBottom: '12px', display: 'block' }}>
                      选择团队
                    </Text>
                    <View style={{ marginBottom: '20px' }}>
                      <Picker
                        mode="selector"
                        range={teams.map((t) => t.name)}
                        onChange={(e) => {
                          const team = teams[e.detail.value];
                          setConfig({ ...config, teamId: team?.id });
                        }}
                      >
                        <View
                          style={{
                            padding: '16px',
                            backgroundColor: '#1e293b',
                            borderRadius: '12px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ fontSize: '26px', color: '#f1f5f9' }}>
                            {teams.find((t) => t.id === config.teamId)?.name || '请选择团队'}
                          </Text>
                          <Text style={{ fontSize: '22px', color: '#71717a' }}>▼</Text>
                        </View>
                      </Picker>
                    </View>
                  </>
                )}

                {/* 数据类型选择 */}
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
                        <Text style={{ fontSize: '26px', fontWeight: '600', color: '#f1f5f9', display: 'block' }}>
                          {option.label}
                        </Text>
                      </View>
                      {config.dataType === option.value && <CircleCheck size={24} color={option.color} />}
                    </View>
                  ))}
                </View>

                {/* 格式选择 */}
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
                        backgroundColor: config.format === option.value ? `${option.color}20` : '#1e293b',
                        border: `2px solid ${config.format === option.value ? option.color : '#1e3a5f'}`,
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
                          color: config.format === option.value ? option.color : '#94a3b8',
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
              <Text style={{ fontSize: '24px', fontWeight: '600', color: '#f1f5f9', marginBottom: '16px', display: 'block' }}>
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
                            <Text style={{ fontSize: '26px', fontWeight: '600', color: '#f1f5f9', display: 'block' }}>
                              {task.fileName}
                            </Text>
                            <Text style={{ fontSize: '20px', color: '#71717a', marginTop: '4px' }}>
                              {task.recordCount} 条记录 · {formatFileSize(task.fileSize)} · {getScopeText(task.scope)}
                            </Text>
                          </View>
                        </View>

                        {task.status === 'completed' && (
                          <View
                            style={{
                              padding: '10px 20px',
                              backgroundColor: 'rgba(56, 189, 248, 0.1)',
                              borderRadius: '10px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                            onClick={() => handleDownload(task)}
                          >
                            <Download size={18} color="#38bdf8" />
                            <Text style={{ fontSize: '22px', color: '#38bdf8' }}>下载</Text>
                          </View>
                        )}
                      </View>

                      <View style={{ marginTop: '12px', display: 'flex', gap: '16px' }}>
                        <Text style={{ fontSize: '20px', color: '#64748b' }}>
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
