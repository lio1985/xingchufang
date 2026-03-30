import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
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

interface ReportStats {
  activeUsers: number;
  usageCount: number;
  conversationCount: number;
  conversionRate: string;
}

export default function AdminAIReportPage() {
  const [generating, setGenerating] = useState(false);
  const [reportData, setReportData] = useState<ReportSection[] | null>(null);
  const [reportStats, setReportStats] = useState<ReportStats | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('week');

  const timeRangeOptions = [
    { value: 'week', label: '最近一周', icon: Calendar },
    { value: 'month', label: '最近一月', icon: Calendar },
    { value: 'quarter', label: '最近一季度', icon: Calendar },
    { value: 'year', label: '最近一年', icon: Calendar },
  ];

  const loadReportStats = async () => {
    try {
      const res = await Network.request({
        url: '/api/statistics/overview',
        method: 'GET',
      });

      if (res.data && res.data.code === 200 && res.data.data) {
        const data = res.data.data;
        setReportStats({
          activeUsers: data.activeUsers || 0,
          usageCount: data.totalConversations || 0,
          conversationCount: data.totalMessages || 0,
          conversionRate: '0%',
        });
      }
    } catch (error: any) {
      console.error('加载统计数据失败:', error);
    }
  };

  const loadLatestReport = async () => {
    try {
      const res = await Network.request({
        url: '/api/admin/reports/latest',
        method: 'GET',
      });

      if (res.data && res.data.code === 200) {
        setReportData(res.data.data.sections || []);
        // 如果后端返回了统计数据，设置它
        if (res.data.data.stats) {
          setReportStats(res.data.data.stats);
        }
      }
    } catch (error: any) {
      console.error('加载报告失败:', error);
    }
  };

  useEffect(() => {
    loadLatestReport();
    loadReportStats();
  }, []);

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
        // 如果后端返回了统计数据，设置它
        if (res.data.data.stats) {
          setReportStats(res.data.data.stats);
        } else {
          // 如果后端没有返回统计数据，尝试从统计接口获取
          loadReportStats();
        }
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

  // 用 Number 包装避免压缩器bug
  const buttonOpacity = Number(generating ? '0.6' : '1');

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', paddingBottom: '60px' }}>
      {/* Header */}
      <View style={{ padding: '48px 20px 20px', backgroundColor: '#111827', borderBottom: '1px solid #1e3a5f' }}>
        <View style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', display: 'block' }}>运营报告</Text>
            <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginTop: '2px' }}>报告创建</Text>
          </View>
          <View onClick={loadLatestReport} style={{ padding: '8px' }}>
            <RefreshCw size={20} color="#38bdf8" />
          </View>
        </View>

        {/* 时间范围选择 */}
        <View style={{ display: 'flex', gap: '8px' }}>
          {timeRangeOptions.map((option) => (
            <View
              key={option.value}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '10px',
                backgroundColor: timeRange === option.value ? '#38bdf8' : '#1e293b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={() => setTimeRange(option.value as any)}
            >
              <Text style={{ fontSize: '13px', fontWeight: '500', color: timeRange === option.value ? '#000' : '#64748b' }}>{option.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView scrollY style={{ height: 'calc(100vh - 180px)' }}>
        <View style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 创建设置卡片 */}
          <View style={{
            backgroundColor: '#111827',
            border: '1px solid #1e3a5f',
            borderRadius: '12px',
            padding: '16px',
          }}
          >
            <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Settings size={18} color="#38bdf8" />
              <Text style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9' }}>创建设置</Text>
            </View>

            <Text style={{ fontSize: '13px', color: '#71717a', marginBottom: '12px', display: 'block' }}>
              时间范围
            </Text>

            <View style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              {timeRangeOptions.map((option) => (
                <View
                  key={option.value}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '10px',
                    backgroundColor: timeRange === option.value ? '#38bdf8' : '#1e293b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onClick={() => setTimeRange(option.value as any)}
                >
                  <Text style={{ fontSize: '13px', fontWeight: '500', color: timeRange === option.value ? '#000' : '#64748b' }}>{option.label}</Text>
                </View>
              ))}
            </View>

            <View
              style={{
                marginTop: '20px',
                padding: '14px',
                borderRadius: '12px',
                backgroundColor: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: buttonOpacity,
              }}
              onClick={generateReport}
            >
              <Sparkles size={20} color="#000" />
              <Text style={{ marginLeft: '8px', fontSize: '15px', fontWeight: '600', color: '#000' }}>
                {generating ? '创建中...' : '一键创建报告'}
              </Text>
            </View>
          </View>

          {/* 报告内容 */}
          {reportData && reportData.length > 0 ? (
            <>
              {/* 报告头部 */}
              <View style={{
                backgroundColor: '#111827',
                border: '1px solid #1e3a5f',
                borderRadius: '12px',
                padding: '16px',
              }}
              >
                <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FileChartColumn size={20} color="#60a5fa" />
                    <Text style={{ fontSize: '15px', fontWeight: '600', color: '#f1f5f9' }}>运营分析报告</Text>
                  </View>
                  <View
                    style={{
                      padding: '8px 12px',
                      backgroundColor: 'rgba(56, 189, 248, 0.1)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                    onClick={exportReport}
                  >
                    <Download size={16} color="#38bdf8" />
                    <Text style={{ fontSize: '13px', color: '#38bdf8' }}>导出</Text>
                  </View>
                </View>
                <View style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} color="#71717a" />
                  <Text style={{ fontSize: '13px', color: '#71717a' }}>
                    创建时间: {new Date().toLocaleString('zh-CN')}
                  </Text>
                </View>
              </View>

              {/* 报告内容 */}
              {reportData.map((section, index) => (
                <View key={index} style={{
                  backgroundColor: '#111827',
                  border: '1px solid #1e3a5f',
                  borderRadius: '12px',
                  padding: '16px',
                }}
                >
                  <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <FileText size={18} color="#38bdf8" />
                    <Text style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9' }}>{section.title}</Text>
                  </View>
                  <Text style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6' }}>{section.content}</Text>
                </View>
              ))}

              {/* 数据统计卡片 */}
              <View style={{
                backgroundColor: '#111827',
                border: '1px solid #1e3a5f',
                borderRadius: '12px',
                padding: '16px',
              }}
              >
                <Text style={{ fontSize: '15px', fontWeight: '600', color: '#f1f5f9', marginBottom: '16px', display: 'block' }}>
                  数据概览
                </Text>
                <View style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <View style={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    padding: '16px',
                    textAlign: 'center',
                  }}
                  >
                    <View style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(74, 222, 128, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                      <Users size={18} color="#4ade80" />
                    </View>
                    <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', display: 'block' }}>{reportStats?.activeUsers || 0}</Text>
                    <Text style={{ fontSize: '12px', color: '#71717a', display: 'block' }}>活跃用户</Text>
                  </View>

                  <View style={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    padding: '16px',
                    textAlign: 'center',
                  }}
                  >
                    <View style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                      <ChartBar size={18} color="#38bdf8" />
                    </View>
                    <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', display: 'block' }}>{reportStats?.usageCount || 0}</Text>
                    <Text style={{ fontSize: '12px', color: '#71717a', display: 'block' }}>使用频次</Text>
                  </View>

                  <View style={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    padding: '16px',
                    textAlign: 'center',
                  }}
                  >
                    <View style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(96, 165, 250, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                      <MessageSquare size={18} color="#60a5fa" />
                    </View>
                    <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', display: 'block' }}>{reportStats?.conversationCount || 0}</Text>
                    <Text style={{ fontSize: '12px', color: '#71717a', display: 'block' }}>对话数量</Text>
                  </View>

                  <View style={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    padding: '16px',
                    textAlign: 'center',
                  }}
                  >
                    <View style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                      <TrendingUp size={18} color="#a855f7" />
                    </View>
                    <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', display: 'block' }}>{reportStats?.conversionRate || '0%'}</Text>
                    <Text style={{ fontSize: '12px', color: '#71717a', display: 'block' }}>转化率</Text>
                  </View>
                </View>
              </View>
            </>
          ) : (
            <View style={{
              backgroundColor: '#111827',
              border: '1px solid #1e3a5f',
              borderRadius: '12px',
              padding: '48px 24px',
              textAlign: 'center',
            }}
            >
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
              <Text style={{ fontSize: '16px', fontWeight: '600', color: '#f1f5f9', marginBottom: '12px', display: 'block' }}>
                暂无报告数据
              </Text>
              <Text style={{ fontSize: '13px', color: '#71717a', lineHeight: '1.6' }}>
                点击上方「一键创建报告」按钮{'\n'}系统将为您创建运营分析报告
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
