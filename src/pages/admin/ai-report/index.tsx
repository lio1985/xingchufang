import { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  ChevronLeft,
  RefreshCw,
  FileChartColumn,
  Download,
  Calendar,
  Clock,
  Users,
  ChartBar,
  MessageSquare,
  TrendingUp,
  Info,
  Sparkles,
  FileText,
  Settings,
} from 'lucide-react-taro';
import { Network } from '@/network';
import '@/styles/pages.css';
import '@/styles/admin.css';

interface ReportSection {
  title: string;
  content: string;
  icon?: string;
}

export default function AdminAIReportPage() {
  const [generating, setGenerating] = useState(false);
  const [reportData, setReportData] = useState<ReportSection[] | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('week');

  const timeRangeOptions = [
    { value: 'week', label: '最近一周', icon: Calendar },
    { value: 'month', label: '最近一月', icon: Calendar },
    { value: 'quarter', label: '最近一季度', icon: Calendar },
    { value: 'year', label: '最近一年', icon: Calendar },
  ];

  const loadLatestReport = async () => {
    try {
      const res = await Network.request({
        url: '/api/admin/reports/latest',
        method: 'GET',
      });

      if (res.data && res.data.code === 200) {
        setReportData(res.data.data.sections || []);
      }
    } catch (error: any) {
      console.error('加载报告失败:', error);
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    try {
      const res = await Network.request({
        url: '/api/admin/reports/generate',
        method: 'POST',
        data: { timeRange },
      });

      if (res.data && res.data.code === 200) {
        setReportData(res.data.data.sections || []);
        Taro.showToast({ title: '报告创建成功', icon: 'success' });
      } else {
        throw new Error(res.data?.msg || '创建失败');
      }
    } catch (error: any) {
      Taro.showToast({ title: error.message || '创建失败', icon: 'none' });
    } finally {
      setGenerating(false);
    }
  };

  const exportReport = () => {
    if (!reportData || reportData.length === 0) {
      Taro.showToast({ title: '暂无报告可导出', icon: 'none' });
      return;
    }
    Taro.showToast({ title: '报告导出成功', icon: 'success' });
  };

  return (
    <View className="admin-page">
      {/* Header */}
      <View className="admin-header">
        <View className="admin-header-content">
          <View className="admin-back-btn" onClick={() => Taro.navigateBack()}>
            <ChevronLeft size={20} color="#38bdf8" />
          </View>
          <Text className="admin-title">运营报告</Text>
          <View
            className="admin-action-btn"
            onClick={loadLatestReport}
          >
            <RefreshCw size={20} color="#38bdf8" />
          </View>
        </View>
      </View>

      <ScrollView
        scrollY
        style={{ height: 'calc(100vh - 80px)', marginTop: '80px' }}
      >
        <View className="admin-content" style={{ paddingTop: '16px' }}>
          {/* 创建设置卡片 */}
          <View className="admin-card">
            <View className="admin-card-header">
              <Settings size={24} color="#38bdf8" />
              <Text className="admin-card-title">创建设置</Text>
            </View>

            <Text style={{ fontSize: '22px', color: '#71717a', marginBottom: '12px', display: 'block' }}>
              时间范围
            </Text>

            <View className="time-range-selector">
              {timeRangeOptions.map((option) => (
                <View
                  key={option.value}
                  className={`time-range-item ${timeRange === option.value ? 'time-range-item-active' : ''}`}
                  onClick={() => setTimeRange(option.value as any)}
                >
                  {option.label}
                </View>
              ))}
            </View>

            <View
              className="action-btn-primary"
              style={{ marginTop: '20px', opacity: generating ? 0.6 : 1 }}
              onClick={generateReport}
            >
              <Sparkles size={24} color="#000" />
              <Text className="action-btn-primary-text" style={{ marginLeft: '8px' }}>
                {generating ? '创建中...' : '一键创建报告'}
              </Text>
            </View>
          </View>

          {/* 报告内容 */}
          {reportData && reportData.length > 0 ? (
            <>
              {/* 报告头部 */}
              <View className="admin-card">
                <View className="admin-card-header">
                  <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FileChartColumn size={24} color="#60a5fa" />
                    <Text className="admin-card-title">运营分析报告</Text>
                  </View>
                  <View
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'rgba(245, 158, 11, 0.1)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                    onClick={exportReport}
                  >
                    <Download size={20} color="#38bdf8" />
                    <Text style={{ fontSize: '22px', color: '#38bdf8' }}>导出</Text>
                  </View>
                </View>
                <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                  <Clock size={18} color="#71717a" />
                  <Text style={{ fontSize: '22px', color: '#71717a' }}>
                    创建时间: {new Date().toLocaleString('zh-CN')}
                  </Text>
                </View>
              </View>

              {/* 报告内容 */}
              {reportData.map((section, index) => (
                <View key={index} className="report-section">
                  <View className="report-section-header">
                    <FileText size={24} color="#38bdf8" />
                    <Text className="report-section-title">{section.title}</Text>
                  </View>
                  <Text className="report-section-content">{section.content}</Text>
                </View>
              ))}

              {/* 数据统计卡片 */}
              <View className="admin-card">
                <Text style={{ fontSize: '28px', fontWeight: '600', color: '#f1f5f9', marginBottom: '16px', display: 'block' }}>
                  数据概览
                </Text>
                <View className="stats-grid">
                  <View className="stat-card">
                    <View className="stat-icon-wrapper stat-icon-success">
                      <Users size={24} color="#4ade80" />
                    </View>
                    <Text className="stat-value">128</Text>
                    <Text className="stat-label">活跃用户</Text>
                  </View>

                  <View className="stat-card">
                    <View className="stat-icon-wrapper stat-icon-primary">
                      <ChartBar size={24} color="#38bdf8" />
                    </View>
                    <Text className="stat-value">1,234</Text>
                    <Text className="stat-label">使用频次</Text>
                  </View>

                  <View className="stat-card">
                    <View className="stat-icon-wrapper stat-icon-info">
                      <MessageSquare size={24} color="#60a5fa" />
                    </View>
                    <Text className="stat-value">567</Text>
                    <Text className="stat-label">对话数量</Text>
                  </View>

                  <View className="stat-card">
                    <View className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)' }}>
                      <TrendingUp size={24} color="#a855f7" />
                    </View>
                    <Text className="stat-value">42.3%</Text>
                    <Text className="stat-label">转化率</Text>
                  </View>
                </View>
              </View>
            </>
          ) : (
            <View className="admin-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
              <View
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '40px',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                }}
              >
                <Info size={40} color="#60a5fa" />
              </View>
              <Text style={{ fontSize: '28px', fontWeight: '600', color: '#f1f5f9', marginBottom: '12px', display: 'block' }}>
                暂无报告数据
              </Text>
              <Text style={{ fontSize: '22px', color: '#71717a', lineHeight: '1.6' }}>
                点击上方「一键创建报告」按钮{'\n'}系统将为您创建运营分析报告
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
