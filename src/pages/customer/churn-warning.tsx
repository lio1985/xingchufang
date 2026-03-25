import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, ScrollView, Input, Textarea } from '@tarojs/components';
import { Network } from '@/network';
import { ShieldX, ShieldAlert, Phone, MapPin, MessageSquare, Mail, CircleEllipsis } from 'lucide-react-taro';

interface ChurnRiskAssessment {
  customerId: string;
  customerName: string;
  riskLevel: 'low' | 'yellow' | 'orange' | 'red';
  riskScore: number;
  daysSinceLastFollowUp: number;
  riskFactors: string[];
  suggestedActions: string[];
  lastFollowUpDate?: string;
  estimatedAmount?: number;
}

interface HandleForm {
  handle_action: 'phone' | 'visit' | 'message' | 'email' | 'other';
  handle_result: 'success' | 'pending' | 'failed' | 'converted';
  handle_notes: string;
  follow_up_date: string;
}

const riskLevelMap = {
  red: { label: '高危', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30', icon: ShieldX, desc: '超过30天未跟进' },
  orange: { label: '中危', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30', icon: ShieldAlert, desc: '超过14天未跟进' },
  yellow: { label: '低危', color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', icon: ShieldAlert, desc: '超过7天未跟进' }
};

const actionOptions = [
  { key: 'phone', label: '电话回访', icon: Phone },
  { key: 'visit', label: '上门拜访', icon: MapPin },
  { key: 'message', label: '微信/短信', icon: MessageSquare },
  { key: 'email', label: '邮件沟通', icon: Mail },
  { key: 'other', label: '其他方式', icon: CircleEllipsis },
];

const resultOptions = [
  { key: 'success', label: '挽回成功', color: 'emerald' },
  { key: 'converted', label: '已成交', color: 'blue' },
  { key: 'pending', label: '待跟进', color: 'amber' },
  { key: 'failed', label: '挽回失败', color: 'slate' },
];

export default function ChurnWarningList() {
  const [churnRisks, setChurnRisks] = useState<ChurnRiskAssessment[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  
  // 处理弹窗状态
  const [showHandleModal, setShowHandleModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<ChurnRiskAssessment | null>(null);
  const [handleForm, setHandleForm] = useState<HandleForm>({
    handle_action: 'phone',
    handle_result: 'success',
    handle_notes: '',
    follow_up_date: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadChurnRisks = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await Network.request({
        url: '/api/customers/churn-warning/risk-list',
        data: {
          riskLevel: activeFilter === 'all' ? undefined : activeFilter
        }
      });
      console.log('[ChurnWarningList] Loaded:', res.data);

      if (res.data.code === 200) {
        setChurnRisks(res.data.data || []);
      }
    } catch (err) {
      console.error('[ChurnWarningList] Load error:', err);
      Taro.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChurnRisks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter]);

  const openHandleModal = (customer: ChurnRiskAssessment) => {
    setSelectedCustomer(customer);
    setHandleForm({
      handle_action: 'phone',
      handle_result: 'success',
      handle_notes: '',
      follow_up_date: '',
    });
    setShowHandleModal(true);
  };

  const closeHandleModal = () => {
    setShowHandleModal(false);
    setSelectedCustomer(null);
  };

  const submitHandleRecord = async () => {
    if (!selectedCustomer) return;
    if (submitting) return;

    setSubmitting(true);
    try {
      const res = await Network.request({
        url: '/api/customers/churn-warning/handle',
        method: 'POST',
        data: {
          customer_id: selectedCustomer.customerId,
          customer_name: selectedCustomer.customerName,
          risk_level: selectedCustomer.riskLevel,
          risk_score: selectedCustomer.riskScore,
          handle_action: handleForm.handle_action,
          handle_result: handleForm.handle_result,
          handle_notes: handleForm.handle_notes,
          follow_up_date: handleForm.follow_up_date || undefined,
        }
      });
      console.log('[ChurnWarningList] Submit result:', res.data);

      if (res.data.code === 200) {
        Taro.showToast({ title: '处理记录已保存', icon: 'success' });
        closeHandleModal();
        // 刷新列表
        loadChurnRisks();
      } else {
        Taro.showToast({ title: res.data.msg || '提交失败', icon: 'none' });
      }
    } catch (err) {
      console.error('[ChurnWarningList] Submit error:', err);
      Taro.showToast({ title: '提交失败', icon: 'none' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCallCustomer = (customer: ChurnRiskAssessment) => {
    Taro.showActionSheet({
      itemList: ['立即跟进', '标记已处理', '查看效果分析', '查看详情'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            Taro.navigateTo({ url: `/pages/customer/detail?id=${customer.customerId}` });
            break;
          case 1:
            openHandleModal(customer);
            break;
          case 2:
            Taro.navigateTo({ url: `/pages/customer/churn-analysis` });
            break;
          case 3:
            Taro.navigateTo({ url: `/pages/customer/detail?id=${customer.customerId}` });
            break;
        }
      }
    });
  };

  const navigateToAnalysis = () => {
    Taro.navigateTo({ url: '/pages/customer/churn-analysis' });
  };

  return (
    <View className="min-h-screen bg-gradient-to-b from-sky-50 via-slate-800 to-slate-900">
      {/* Header */}
      <View className="pt-12 pb-4 px-4 bg-slate-900/95 sticky top-0 z-20 border-b border-slate-700">
        <View className="flex items-center justify-between mb-4">
          <View className="flex items-center gap-3">
            <View
              onClick={() => Taro.navigateBack()}
              className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center active:scale-95"
            >
              <Text>{">"}</Text>
            </View>
            <Text className="block text-white text-xl font-bold">客户流失预警</Text>
          </View>
          <View className="flex items-center gap-2">
            <View
              onClick={navigateToAnalysis}
              className="w-9 h-9 rounded-full bg-slate-9000/20 flex items-center justify-center active:scale-95 mr-2"
            >
              <Text>📊</Text>
            </View>
            <View className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <Text className="block text-red-400 text-xs">需跟进</Text>
          </View>
        </View>

        {/* 筛选标签 */}
        <View className="flex gap-2">
          {[
            { key: 'all', label: '全部', color: 'blue', count: churnRisks.length },
            { key: 'red', label: '高危', color: 'red', count: churnRisks.filter(r => r.riskLevel === 'red').length },
            { key: 'orange', label: '中危', color: 'amber', count: churnRisks.filter(r => r.riskLevel === 'orange').length },
            { key: 'yellow', label: '低危', color: 'yellow', count: churnRisks.filter(r => r.riskLevel === 'yellow').length }
          ].map((item) => (
            <View
              key={item.key}
              onClick={() => setActiveFilter(item.key)}
              className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl border transition-all ${
                activeFilter === item.key
                  ? item.key === 'all' ? 'bg-slate-9000/20 border-blue-500/50' :
                    item.key === 'red' ? 'bg-red-500/20 border-red-500/50' :
                    item.key === 'orange' ? 'bg-amber-500/20 border-amber-500/50' :
                    'bg-yellow-500/20 border-yellow-500/50'
                  : 'bg-slate-800 border-slate-700'
              }`}
            >
              <Text className={`block text-sm font-medium ${
                activeFilter === item.key
                  ? item.key === 'all' ? 'text-blue-400' :
                    item.key === 'red' ? 'text-red-400' :
                    item.key === 'orange' ? 'text-amber-400' :
                    'text-yellow-400'
                  : 'text-slate-400'
              }`}
              >
                {item.label}
              </Text>
              {item.count > 0 && (
                <View className={`px-1.5 py-0.5 rounded-full ${
                  item.key === 'all' ? 'bg-blue-500/30' :
                  item.key === 'red' ? 'bg-red-500/30' :
                  item.key === 'orange' ? 'bg-amber-500/30' :
                  'bg-yellow-500/30'
                }`}
                >
                  <Text className={`block text-xs font-bold ${
                    item.key === 'all' ? 'text-blue-400' :
                    item.key === 'red' ? 'text-red-400' :
                    item.key === 'orange' ? 'text-amber-400' :
                    'text-yellow-400'
                  }`}
                  >{item.count}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* 预警列表 */}
      <ScrollView
        scrollY
        className="flex-1 px-4 py-4"
        style={{ height: 'calc(100vh - 120px)' }}
        onScrollToLower={loadChurnRisks}
      >
        {churnRisks.length === 0 ? (
          <View className="py-20 text-center">
            <View className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Text>📈</Text>
            </View>
            <Text className="block text-white text-lg font-semibold mb-2">暂无流失预警</Text>
            <Text className="block text-slate-400 text-sm">您的客户跟进情况良好，继续保持！</Text>
            <View
              onClick={navigateToAnalysis}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-slate-9000/20 border border-sky-500/30 rounded-xl"
            >
              <Text>📊</Text>
              <Text className="block text-blue-400 text-sm">查看效果分析</Text>
            </View>
          </View>
        ) : (
          <View className="space-y-3">
            {churnRisks.map((risk) => {
              const levelInfo = riskLevelMap[risk.riskLevel];
              const IconComponent = levelInfo.icon;

              return (
                <View
                  key={risk.customerId}
                  onClick={() => handleCallCustomer(risk)}
                  className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700 active:scale-[0.98] transition-transform"
                >
                  {/* 头部：客户名称和风险等级 */}
                  <View className="flex items-start justify-between mb-3">
                    <View className="flex-1">
                      <Text className="block text-white text-lg font-semibold">{risk.customerName}</Text>
                      <Text className="block text-slate-400 text-xs mt-1">{levelInfo.desc}</Text>
                    </View>
                    <View className={`flex items-center gap-1 px-3 py-1.5 rounded-full ${levelInfo.bg} ${levelInfo.border} border`}>
                      <IconComponent size={14} color={risk.riskLevel === 'red' ? '#f87171' : risk.riskLevel === 'orange' ? '#fbbf24' : '#facc15'} />
                      <Text className={`block text-sm font-bold ${levelInfo.color}`}>{levelInfo.label}</Text>
                    </View>
                  </View>

                  {/* 关键信息 */}
                  <View className="flex items-center gap-4 mb-3">
                    <View className="flex items-center gap-1">
                      <Text>🕐</Text>
                      <Text className="block text-slate-400 text-sm">
                        <Text className={risk.daysSinceLastFollowUp >= 30 ? 'text-red-400' : risk.daysSinceLastFollowUp >= 14 ? 'text-amber-400' : 'text-yellow-400'}>
                          {risk.daysSinceLastFollowUp}天
                        </Text>
                        未跟进
                      </Text>
                    </View>
                    {risk.estimatedAmount && (
                      <View className="flex items-center gap-1">
                        <Text>💰</Text>
                        <Text className="block text-emerald-400 text-sm">
                          ¥{(risk.estimatedAmount / 10000).toFixed(1)}万
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* 风险因素 */}
                  {risk.riskFactors.length > 0 && (
                    <View className="mb-3">
                      <View className="flex flex-wrap gap-2">
                        {risk.riskFactors.slice(0, 2).map((factor, idx) => (
                          <View key={idx} className="px-2 py-1 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <Text className="block text-red-400 text-xs">{factor}</Text>
                          </View>
                        ))}
                        {risk.riskFactors.length > 2 && (
                          <View className="px-2 py-1 bg-slate-800 rounded-lg">
                            <Text className="block text-slate-400 text-xs">+{risk.riskFactors.length - 2}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  )}

                  {/* 建议措施 */}
                  {risk.suggestedActions.length > 0 && (
                    <View className="pt-3 border-t border-slate-700">
                      <View className="flex items-start gap-2">
                        <View className="w-5 h-5 rounded-full bg-slate-9000/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Text className="block text-blue-400 text-xs">💡</Text>
                        </View>
                        <Text className="block text-blue-400 text-sm flex-1">
                          {risk.suggestedActions[0]}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* 操作提示 */}
                  <View className="mt-3 pt-3 border-t border-slate-700 flex items-center justify-between">
                    <Text className="block text-slate-400 text-xs">点击查看详情</Text>
                    <View className="flex gap-2">
                      <View
                        onClick={(e) => {
                          e.stopPropagation();
                          openHandleModal(risk);
                        }}
                        className="px-3 py-1.5 bg-emerald-500/20 rounded-lg"
                      >
                        <Text className="block text-emerald-400 text-sm font-medium">标记处理</Text>
                      </View>
                      <View className="px-3 py-1.5 bg-slate-9000/20 rounded-lg">
                        <Text className="block text-blue-400 text-sm font-medium">立即跟进</Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View className="h-8" />
      </ScrollView>

      {/* 处理弹窗 */}
      {showHandleModal && selectedCustomer && (
        <View
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={closeHandleModal}
        >
          <View
            className="bg-slate-800 rounded-2xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 弹窗头部 */}
            <View className="px-4 py-4 border-b border-slate-700">
              <Text className="block text-white text-lg font-semibold">标记预警处理</Text>
              <Text className="block text-slate-400 text-sm mt-1">客户：{selectedCustomer.customerName}</Text>
            </View>

            {/* 弹窗内容 */}
            <ScrollView scrollY className="px-4 py-4 max-h-[60vh]">
              {/* 处理方式 */}
              <View className="mb-4">
                <Text className="block text-slate-300 text-sm mb-2">处理方式</Text>
                <View className="flex flex-wrap gap-2">
                  {actionOptions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <View
                        key={action.key}
                        onClick={() => setHandleForm({ ...handleForm, handle_action: action.key as any })}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all ${
                          handleForm.handle_action === action.key
                            ? 'bg-slate-9000/20 border-blue-500/50'
                            : 'bg-slate-800 border-slate-700'
                        }`}
                      >
                        <Icon size={14} color={handleForm.handle_action === action.key ? '#60a5fa' : '#94a3b8'} />
                        <Text className={`block text-sm ${handleForm.handle_action === action.key ? 'text-blue-400' : 'text-slate-400'}`}>
                          {action.label}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* 处理结果 */}
              <View className="mb-4">
                <Text className="block text-slate-300 text-sm mb-2">处理结果</Text>
                <View className="grid grid-cols-2 gap-2">
                  {resultOptions.map((result) => (
                    <View
                      key={result.key}
                      onClick={() => setHandleForm({ ...handleForm, handle_result: result.key as any })}
                      className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border transition-all ${
                        handleForm.handle_result === result.key
                          ? result.key === 'success' ? 'bg-emerald-500/20 border-emerald-500/50' :
                            result.key === 'converted' ? 'bg-slate-9000/20 border-blue-500/50' :
                            result.key === 'pending' ? 'bg-amber-500/20 border-amber-500/50' :
                            'bg-slate-700 border-slate-500'
                          : 'bg-slate-800 border-slate-700'
                      }`}
                    >
                      {handleForm.handle_result === result.key && (
                        <Text>✓</Text>
                      )}
                      <Text className={`block text-sm ${
                        handleForm.handle_result === result.key
                          ? result.key === 'success' ? 'text-emerald-400' :
                            result.key === 'converted' ? 'text-blue-400' :
                            result.key === 'pending' ? 'text-amber-400' :
                            'text-slate-400'
                          : 'text-slate-400'
                      }`}
                      >
                        {result.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* 备注 */}
              <View className="mb-4">
                <Text className="block text-slate-300 text-sm mb-2">处理备注</Text>
                <View className="bg-slate-800 rounded-xl p-3">
                  <Textarea
                    style={{ width: '100%', minHeight: '80px', backgroundColor: 'transparent', color: '#fff', fontSize: '14px' }}
                    placeholder="记录沟通内容、客户反馈等..."
                    placeholderStyle="color: #64748b"
                    value={handleForm.handle_notes}
                    onInput={(e) => setHandleForm({ ...handleForm, handle_notes: e.detail.value })}
                    maxlength={500}
                  />
                </View>
                <Text className="block text-slate-400 text-xs mt-1 text-right">{handleForm.handle_notes.length}/500</Text>
              </View>

              {/* 下次跟进日期 */}
              <View className="mb-4">
                <Text className="block text-slate-300 text-sm mb-2">下次跟进日期（可选）</Text>
                <View className="bg-slate-800 rounded-xl px-3 py-2">
                  <Input
                    style={{ width: '100%', color: '#fff', fontSize: '14px' }}
                    type="text"
                    value={handleForm.follow_up_date}
                    onInput={(e) => setHandleForm({ ...handleForm, follow_up_date: e.detail.value })}
                  />
                </View>
              </View>
            </ScrollView>

            {/* 弹窗底部 */}
            <View className="px-4 py-4 border-t border-slate-700 flex gap-3">
              <View
                onClick={closeHandleModal}
                className="flex-1 py-3 bg-slate-800 rounded-xl flex items-center justify-center"
              >
                <Text className="block text-slate-300 font-medium">取消</Text>
              </View>
              <View
                onClick={submitHandleRecord}
                className={`flex-1 py-3 rounded-xl flex items-center justify-center ${
                  submitting ? 'bg-blue-500/50' : 'bg-blue-500'
                }`}
              >
                <Text className="block text-white font-medium">
                  {submitting ? '提交中...' : '确认提交'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
