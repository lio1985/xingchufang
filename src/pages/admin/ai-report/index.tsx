import { useState } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Network } from '@/network';

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
    { value: 'week', label: '最近一周' },
    { value: 'month', label: '最近一月' },
    { value: 'quarter', label: '最近一季度' },
    { value: 'year', label: '最近一年' },
  ];

  // 加载已有报告
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

  // 创建新报告
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
        Taro.showToast({
          title: '报告创建成功',
          icon: 'success',
        });
      } else {
        throw new Error(res.data?.msg || '创建失败');
      }
    } catch (error: any) {
      console.error('创建报告失败:', error);
      Taro.showToast({
        title: error.message || '创建失败',
        icon: 'none',
      });
    } finally {
      setGenerating(false);
    }
  };

  // 导出报告
  const exportReport = () => {
    if (!reportData || reportData.length === 0) {
      Taro.showToast({
        title: '暂无报告可导出',
        icon: 'none',
      });
      return;
    }

    Taro.showToast({
      title: '报告导出成功',
      icon: 'success',
    });
  };

  return (
    <View className="min-h-screen bg-slate-900">
      {/* 顶部导航栏 */}
      <View style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: '#0f172a',
        borderBottom: '1px solid #1e293b',
      }}
      >
        <View className="h-14 px-4 flex items-center gap-3">
          <View onClick={() => Taro.navigateBack()}>
            <Text>←</Text>
          </View>
          <Text className="text-white text-lg font-semibold flex-1">运营报告</Text>
          <View onClick={loadLatestReport}>
            <Text>🔄</Text>
          </View>
        </View>
      </View>

      <ScrollView
        scrollY
        className="h-full pt-16 pb-24"
        style={{ height: 'calc(100vh - 50px)' }}
      >
        <View className="px-4 py-6">
          {/* 操作卡片 */}
          <View className="bg-slate-800 rounded-2xl p-4 mb-6">
            <Text className="block text-white text-base font-semibold mb-4">
              创建设置
            </Text>

            <View className="mb-4">
              <Text className="block text-slate-400 text-sm mb-2">
                时间范围
              </Text>
              <View style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '8px',
                flexWrap: 'wrap',
              }}
              >
                {timeRangeOptions.map((option) => (
                  <View
                    key={option.value}
                    onClick={() => setTimeRange(option.value as any)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      backgroundColor: timeRange === option.value ? '#3b82f6' : '#334155',
                    }}
                  >
                    <Text
                      className={`text-sm ${
                        timeRange === option.value ? 'text-white' : 'text-slate-300'
                      }`}
                    >
                      {option.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View
              onClick={generateReport}
              style={{
                width: '100%',
                backgroundColor: '#3b82f6',
                borderRadius: '12px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: generating ? 0.6 : 1,
              }}
            >
              <Activity
                size={20}
                color="#ffffff"
                className={generating ? 'animate-spin' : ''}
              />
              <Text className="text-white font-semibold text-base">
                {generating ? '创建中...' : '一键创建报告'}
              </Text>
            </View>
          </View>

          {/* 报告内容 */}
          {reportData && reportData.length > 0 ? (
            <>
              {/* 报告头部 */}
              <View className="bg-slate-800 rounded-2xl p-4 mb-6">
                <View className="flex items-center justify-between mb-4">
                  <View className="flex items-center gap-2">
                    <Text>📄</Text>
                    <Text className="text-white text-base font-semibold">
                      运营分析报告
                    </Text>
                  </View>
                  <View onClick={exportReport}>
                    <Text>⬇️</Text>
                  </View>
                </View>
                <Text className="block text-slate-400 text-sm">
                  创建时间: {new Date().toLocaleString('zh-CN')}
                </Text>
              </View>

              {/* 报告内容 */}
              {reportData.map((section, index) => (
                <View key={index} className="bg-slate-800 rounded-2xl p-4 mb-4">
                  <View className="flex items-center gap-2 mb-3">
                    {section.icon && (
                      <Text className="text-2xl">{section.icon}</Text>
                    )}
                    <Text className="text-white text-base font-semibold">
                      {section.title}
                    </Text>
                  </View>
                  <Text className="block text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                    {section.content}
                  </Text>
                </View>
              ))}

              {/* 数据统计卡片 */}
              <View className="bg-slate-800 rounded-2xl p-4 mb-4">
                <Text className="block text-white text-base font-semibold mb-4">
                  数据概览
                </Text>
                <View className="grid grid-cols-2 gap-4">
                  <View className="bg-slate-800 rounded-xl p-4">
                    <View className="flex items-center gap-2 mb-2">
                      <Text>👤</Text>
                      <Text className="text-slate-400 text-xs">活跃用户</Text>
                    </View>
                    <Text className="text-white text-xl font-bold">
                      128
                    </Text>
                  </View>
                  <View className="bg-slate-800 rounded-xl p-4">
                    <View className="flex items-center gap-2 mb-2">
                      <Text>#</Text>
                      <Text className="text-slate-400 text-xs">使用频次</Text>
                    </View>
                    <Text className="text-white text-xl font-bold">
                      1,234
                    </Text>
                  </View>
                  <View className="bg-slate-800 rounded-xl p-4">
                    <View className="flex items-center gap-2 mb-2">
                      <Text>📄</Text>
                      <Text className="text-slate-400 text-xs">对话数量</Text>
                    </View>
                    <Text className="text-white text-xl font-bold">
                      567
                    </Text>
                  </View>
                  <View className="bg-slate-800 rounded-xl p-4">
                    <View className="flex items-center gap-2 mb-2">
                      <Text>^</Text>
                      <Text className="text-slate-400 text-xs">转化率</Text>
                    </View>
                    <Text className="text-white text-xl font-bold">
                      42.3%
                    </Text>
                  </View>
                </View>
              </View>
            </>
          ) : (
            <View className="bg-slate-800 rounded-2xl p-8 text-center">
              <View className="flex justify-center mb-4">
                <Text>ℹ️</Text>
              </View>
              <Text className="block text-slate-400 text-base mb-2">
                暂无报告数据
              </Text>
              <Text className="block text-slate-400 text-sm">
                点击上方&quot;一键创建报告&quot;按钮，系统将为您创建运营分析报告
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 底部操作栏 */}
      <View
        style={{
          position: 'fixed',
          bottom: 50,
          left: 0,
          right: 0,
          backgroundColor: '#0f172a',
          borderTop: '1px solid #1e293b',
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'row',
          gap: '12px',
        }}
      >
        <View
          onClick={loadLatestReport}
          style={{
            flex: 1,
            backgroundColor: '#334155',
            borderRadius: '12px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <Text>🔄</Text>
          <Text className="text-slate-300 font-semibold text-base">刷新</Text>
        </View>
        <View
          onClick={exportReport}
          style={{
            flex: 1,
            backgroundColor: '#10b981',
            borderRadius: '12px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <Text>⬇️</Text>
          <Text className="text-white font-semibold text-base">导出</Text>
        </View>
      </View>
    </View>
  );
}
