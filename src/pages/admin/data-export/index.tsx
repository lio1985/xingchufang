import React, { useState } from 'react';
import Taro, { useLoad } from '@tarojs/taro';
import { View, Text, Button, ScrollView, Picker } from '@tarojs/components';
import { Network } from '@/network';
import { Download, FileText, Users, History, Check, X, Loader, Calendar, Share2 } from 'lucide-react-taro';

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
  const [timeRangeType, setTimeRangeType] = useState<'all' | '7days' | '30days' | 'month' | 'custom'>('all');

  useLoad(() => {
    loadStats();
    loadHistory();
  });

  // 加载统计数据
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

  // 加载历史记录
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

  // 创建导出任务
  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await Network.request({
        url: '/api/admin/data-export/export',
        method: 'POST',
        data: config,
      });

      if (res.data.code === 200) {
        Taro.showToast({
          title: '导出任务创建成功',
          icon: 'success',
        });

        // 切换到历史记录页面
        setActiveTab('history');
        loadHistory();
        loadStats();
      } else {
        Taro.showToast({
          title: res.data.msg || '创建失败',
          icon: 'none',
        });
      }
    } catch (error) {
      console.error('创建导出任务失败:', error);
      Taro.showToast({
        title: '创建失败',
        icon: 'none',
      });
    } finally {
      setExporting(false);
    }
  };

  // 处理时间范围类型变化
  const handleTimeRangeTypeChange = (type: 'all' | '7days' | '30days' | 'month' | 'custom') => {
    setTimeRangeType(type);

    let newConfig = { ...config };

    if (type === 'all') {
      newConfig.timeRange = undefined;
    } else if (type === '7days') {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      newConfig.timeRange = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      };
    } else if (type === '30days') {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      newConfig.timeRange = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      };
    } else if (type === 'month') {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(1);
      startDate.setMonth(startDate.getMonth() - 1);
      newConfig.timeRange = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      };
    }

    setConfig(newConfig);
  };

  // 开始日期选择
  const handleStartDateChange = (e: any) => {
    const selectedDate = e.detail.value;
    const startDate = new Date(selectedDate).toISOString().split('T')[0];

    let newConfig = { ...config };
    if (!newConfig.timeRange) {
      newConfig.timeRange = { startDate, endDate: '' };
    } else {
      newConfig.timeRange.startDate = startDate;
    }

    setConfig(newConfig);
  };

  // 结束日期选择
  const handleEndDateChange = (e: any) => {
    const selectedDate = e.detail.value;
    const endDate = new Date(selectedDate).toISOString().split('T')[0];

    let newConfig = { ...config };
    if (!newConfig.timeRange) {
      newConfig.timeRange = { startDate: '', endDate };
    } else {
      newConfig.timeRange.endDate = endDate;
    }

    setConfig(newConfig);
  };

  // 刷新任务状态
  const refreshTaskStatus = async (taskId: string) => {
    try {
      const res = await Network.request({
        url: `/api/admin/data-export/task/${taskId}`,
      });

      if (res.data.code === 200) {
        const updatedTask = res.data.data;
        setTasks((prev) =>
          prev.map((task) =>
            task.id === taskId ? updatedTask : task
          )
        );
        loadStats();
      }
    } catch (error) {
      console.error('刷新任务状态失败:', error);
    }
  };

  // 下载文件
  const handleDownload = async (taskId: string) => {
    try {
      Taro.showToast({
        title: '获取下载链接...',
        icon: 'loading',
      });

      const res = await Network.request({
        url: `/api/admin/data-export/download/${taskId}`,
      });

      if (res.data.code === 200) {
        const { downloadUrl } = res.data.data;

        // 使用 Network 下载
        await Network.downloadFile({
          url: downloadUrl,
        });

        Taro.showToast({
          title: '下载成功',
          icon: 'success',
        });
      } else {
        Taro.showToast({
          title: res.data.msg || '获取下载链接失败',
          icon: 'none',
        });
      }
    } catch (error) {
      console.error('下载失败:', error);
      Taro.showToast({
        title: '下载失败',
        icon: 'none',
      });
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // 格式化时间
  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // 获取状态图标
  const getStatusIcon = (status: ExportTaskStatus) => {
    switch (status) {
      case 'pending':
      case 'processing':
        return <Loader className="w-4 h-4 animate-spin" />;
      case 'completed':
        return <Check className="w-4 h-4" />;
      case 'failed':
        return <X className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // 获取状态颜色
  const getStatusColor = (status: ExportTaskStatus) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-500';
      case 'processing':
        return 'text-blue-500';
      case 'completed':
        return 'text-green-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <View className="min-h-full bg-sky-50">
      {/* 顶部导航 */}
      <View className="bg-white px-4 py-3 border-b border-slate-200">
        <Text className="block text-lg font-semibold text-white">数据导出</Text>
      </View>

      {/* 统计卡片 */}
      <View className="p-4">
        <View className="grid grid-cols-2 gap-3">
          <View className="bg-white rounded-xl p-4 border border-slate-200">
            <Text className="block text-gray-400 text-sm mb-1">总任务数</Text>
            <Text className="block text-white text-2xl font-bold">{stats.totalTasks}</Text>
          </View>
          <View className="bg-white rounded-xl p-4 border border-slate-200">
            <Text className="block text-gray-400 text-sm mb-1">已完成</Text>
            <Text className="block text-green-400 text-2xl font-bold">{stats.completedTasks}</Text>
          </View>
          <View className="bg-white rounded-xl p-4 border border-slate-200">
            <Text className="block text-gray-400 text-sm mb-1">处理中</Text>
            <Text className="block text-sky-600 text-2xl font-bold">{stats.pendingTasks}</Text>
          </View>
          <View className="bg-white rounded-xl p-4 border border-slate-200">
            <Text className="block text-gray-400 text-sm mb-1">失败</Text>
            <Text className="block text-red-400 text-2xl font-bold">{stats.failedTasks}</Text>
          </View>
        </View>
      </View>

      {/* Tab 切换 */}
      <View className="flex border-b border-slate-200 bg-white">
        <View
          className={`flex-1 text-center py-3 cursor-pointer ${
            activeTab === 'create' ? 'border-b-2 border-blue-400' : ''
          }`}
          onClick={() => setActiveTab('create')}
        >
          <Text
            className={`block ${
              activeTab === 'create' ? 'text-sky-600' : 'text-gray-400'
            }`}
          >
            创建导出
          </Text>
        </View>
        <View
          className={`flex-1 text-center py-3 cursor-pointer ${
            activeTab === 'history' ? 'border-b-2 border-blue-400' : ''
          }`}
          onClick={() => setActiveTab('history')}
        >
          <Text
            className={`block ${
              activeTab === 'history' ? 'text-sky-600' : 'text-gray-400'
            }`}
          >
            导出历史
          </Text>
        </View>
      </View>

      {/* 内容区域 */}
      {activeTab === 'create' && (
        <ScrollView scrollY className="flex-1 px-4 py-4">
          {/* 数据类型选择 */}
          <View className="mb-4">
            <Text className="block text-gray-300 text-sm mb-2">数据类型</Text>
            <View className="grid grid-cols-2 gap-3">
              <View
                className={`rounded-xl p-3 border cursor-pointer ${
                  config.dataType === 'all'
                    ? 'border-blue-400 bg-blue-400/10'
                    : 'border-slate-200 bg-white'
                }`}
                onClick={() => setConfig({ ...config, dataType: 'all' })}
              >
                <FileText className="w-5 h-5 text-sky-600 mb-2" />
                <Text className="block text-white text-sm font-medium">全部数据</Text>
              </View>
              <View
                className={`rounded-xl p-3 border cursor-pointer ${
                  config.dataType === 'users'
                    ? 'border-blue-400 bg-blue-400/10'
                    : 'border-slate-200 bg-white'
                }`}
                onClick={() => setConfig({ ...config, dataType: 'users' })}
              >
                <Users className="w-5 h-5 text-emerald-400 mb-2" />
                <Text className="block text-white text-sm font-medium">用户数据</Text>
              </View>
              <View
                className={`rounded-xl p-3 border cursor-pointer ${
                  config.dataType === 'lexicons'
                    ? 'border-blue-400 bg-blue-400/10'
                    : 'border-slate-200 bg-white'
                }`}
                onClick={() => setConfig({ ...config, dataType: 'lexicons' })}
              >
                <Share2 className="w-5 h-5 text-purple-400 mb-2" />
                <Text className="block text-white text-sm font-medium">语料库</Text>
              </View>
              <View
                className={`rounded-xl p-3 border cursor-pointer ${
                  config.dataType === 'logs'
                    ? 'border-blue-400 bg-blue-400/10'
                    : 'border-slate-200 bg-white'
                }`}
                onClick={() => setConfig({ ...config, dataType: 'logs' })}
              >
                <History className="w-5 h-5 text-yellow-400 mb-2" />
                <Text className="block text-white text-sm font-medium">操作日志</Text>
              </View>
            </View>
          </View>

          {/* 格式选择 */}
          <View className="mb-4">
            <Text className="block text-gray-300 text-sm mb-2">导出格式</Text>
            <View className="flex gap-3">
              <View
                className={`flex-1 rounded-xl p-3 border cursor-pointer ${
                  config.format === 'json'
                    ? 'border-blue-400 bg-blue-400/10'
                    : 'border-slate-200 bg-white'
                }`}
                onClick={() => setConfig({ ...config, format: 'json' })}
              >
                <Text
                  className={`block text-center ${
                    config.format === 'json' ? 'text-sky-600' : 'text-gray-400'
                  } text-sm`}
                >
                  JSON
                </Text>
              </View>
              <View
                className={`flex-1 rounded-xl p-3 border cursor-pointer ${
                  config.format === 'csv'
                    ? 'border-blue-400 bg-blue-400/10'
                    : 'border-slate-200 bg-white'
                }`}
                onClick={() => setConfig({ ...config, format: 'csv' })}
              >
                <Text
                  className={`block text-center ${
                    config.format === 'csv' ? 'text-sky-600' : 'text-gray-400'
                  } text-sm`}
                >
                  CSV
                </Text>
              </View>
            </View>
          </View>

          {/* 时间范围 */}
          <View className="mb-6">
            <Text className="block text-gray-300 text-sm mb-2">时间范围</Text>

            {/* 快捷时间范围选择 */}
            <View className="grid grid-cols-3 gap-2 mb-3">
              <View
                className={`rounded-lg p-2 text-center cursor-pointer ${
                  timeRangeType === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-400 border border-slate-200'
                }`}
                onClick={() => handleTimeRangeTypeChange('all')}
              >
                <Text className="block text-xs">全部时间</Text>
              </View>
              <View
                className={`rounded-lg p-2 text-center cursor-pointer ${
                  timeRangeType === '7days'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-400 border border-slate-200'
                }`}
                onClick={() => handleTimeRangeTypeChange('7days')}
              >
                <Text className="block text-xs">最近7天</Text>
              </View>
              <View
                className={`rounded-lg p-2 text-center cursor-pointer ${
                  timeRangeType === '30days'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-400 border border-slate-200'
                }`}
                onClick={() => handleTimeRangeTypeChange('30days')}
              >
                <Text className="block text-xs">最近30天</Text>
              </View>
              <View
                className={`rounded-lg p-2 text-center cursor-pointer ${
                  timeRangeType === 'month'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-400 border border-slate-200'
                }`}
                onClick={() => handleTimeRangeTypeChange('month')}
              >
                <Text className="block text-xs">上个月</Text>
              </View>
              <View
                className={`rounded-lg p-2 text-center cursor-pointer ${
                  timeRangeType === 'custom'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-400 border border-slate-200'
                }`}
                onClick={() => handleTimeRangeTypeChange('custom')}
              >
                <Text className="block text-xs">自定义</Text>
              </View>
            </View>

            {/* 自定义日期选择 */}
            {timeRangeType === 'custom' && (
              <View className="bg-white rounded-xl p-4 border border-slate-200">
                <View className="mb-3">
                  <Text className="block text-gray-400 text-xs mb-2">开始日期</Text>
                  <Picker
                    mode="date"
                    value={config.timeRange?.startDate || ''}
                    onChange={handleStartDateChange}
                  >
                    <View className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                      <Text className="block text-white text-sm">
                        {config.timeRange?.startDate || '选择开始日期'}
                      </Text>
                      <Calendar className="w-4 h-4 text-gray-400" />
                    </View>
                  </Picker>
                </View>
                <View>
                  <Text className="block text-gray-400 text-xs mb-2">结束日期</Text>
                  <Picker
                    mode="date"
                    value={config.timeRange?.endDate || ''}
                    onChange={handleEndDateChange}
                  >
                    <View className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                      <Text className="block text-white text-sm">
                        {config.timeRange?.endDate || '选择结束日期'}
                      </Text>
                      <Calendar className="w-4 h-4 text-gray-400" />
                    </View>
                  </Picker>
                </View>
              </View>
            )}

            {/* 显示当前选择的时间范围 */}
            {config.timeRange && (
              <View className="mt-2 bg-white/50 rounded-lg px-3 py-2">
                <Text className="block text-gray-400 text-xs">
                  {config.timeRange.startDate} 至 {config.timeRange.endDate}
                </Text>
              </View>
            )}
          </View>

          {/* 导出按钮 */}
          <View>
            <Button
              className="w-full bg-blue-500 text-white rounded-xl py-3"
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? '创建中...' : '开始导出'}
            </Button>
          </View>
        </ScrollView>
      )}

      {activeTab === 'history' && (
        <ScrollView scrollY className="flex-1 px-4 py-4">
          <View className="flex items-center justify-between mb-3">
            <Text className="block text-gray-400 text-sm">导出历史</Text>
            <View
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => loadHistory()}
            >
              <Text className="block text-sky-600 text-sm">刷新</Text>
            </View>
          </View>

          {loading ? (
            <View className="flex items-center justify-center py-8">
              <Loader className="w-6 h-6 text-sky-600 animate-spin" />
            </View>
          ) : tasks.length === 0 ? (
            <View className="flex flex-col items-center justify-center py-16">
              <Download className="w-12 h-12 text-gray-600 mb-3" />
              <Text className="block text-gray-500 text-sm">暂无导出记录</Text>
            </View>
          ) : (
            tasks.map((task) => (
              <View
                key={task.id}
                className="bg-white rounded-xl p-4 mb-3 border border-slate-200"
              >
                {/* 任务头部 */}
                <View className="flex items-center justify-between mb-2">
                  <View className="flex items-center gap-2">
                    {getStatusIcon(task.status)}
                    <Text
                      className={`block text-sm ${getStatusColor(task.status)}`}
                    >
                      {task.status === 'pending' && '等待中'}
                      {task.status === 'processing' && '处理中'}
                      {task.status === 'completed' && '已完成'}
                      {task.status === 'failed' && '失败'}
                    </Text>
                  </View>
                  {task.status === 'processing' && (
                    <View
                      className="flex items-center gap-1 cursor-pointer"
                      onClick={() => refreshTaskStatus(task.id)}
                    >
                      <Loader className="w-4 h-4 text-sky-600 animate-spin" />
                      <Text className="block text-sky-600 text-xs">刷新</Text>
                    </View>
                  )}
                </View>

                {/* 任务信息 */}
                <View className="mb-3">
                  <Text className="block text-white text-sm font-medium mb-1">
                    {task.fileName}
                  </Text>
                  <Text className="block text-gray-400 text-xs">
                    {formatTime(task.createdAt)}
                  </Text>
                </View>

                {/* 任务统计 */}
                <View className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                  <View className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    <Text className="block">{task.recordCount} 条记录</Text>
                  </View>
                  <View className="flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    <Text className="block">{formatFileSize(task.fileSize)}</Text>
                  </View>
                </View>

                {/* 错误信息 */}
                {task.status === 'failed' && task.error && (
                  <View className="bg-red-400/10 rounded-lg p-2 mb-3">
                    <Text className="block text-red-400 text-xs">{task.error}</Text>
                  </View>
                )}

                {/* 操作按钮 */}
                {task.status === 'completed' && (
                  <Button
                    size="mini"
                    type="primary"
                    className="w-full"
                    onClick={() => handleDownload(task.id)}
                  >
                    下载文件
                  </Button>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default DataExportPage;
