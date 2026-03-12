import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import { Network } from '@/network';
import { ChevronRight, Target, DollarSign, Users, CircleCheck, Plus, Trash2 } from 'lucide-react-taro';

interface SalesTarget {
  id: string;
  target_type: 'monthly' | 'quarterly' | 'yearly';
  target_year: number;
  target_month?: number;
  target_quarter?: number;
  target_amount: number;
  target_deals: number;
  target_customers: number;
  description?: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'cancelled';
  user_name?: string;
}

interface TargetProgress {
  target: SalesTarget;
  currentAmount: number;
  currentDeals: number;
  currentCustomers: number;
  amountProgress: number;
  dealsProgress: number;
  customersProgress: number;
  daysElapsed: number;
  daysTotal: number;
  timeProgress: number;
  isAhead: boolean;
  gapAmount: number;
}

const typeLabels: Record<string, string> = {
  monthly: '月度目标',
  quarterly: '季度目标',
  yearly: '年度目标',
};

export default function SalesTargetPage() {
  const [targets, setTargets] = useState<SalesTarget[]>([]);
  const [progresses, setProgresses] = useState<TargetProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'current' | 'all'>('current');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // 创建表单
  const [createForm, setCreateForm] = useState({
    target_type: 'monthly' as 'monthly' | 'quarterly' | 'yearly',
    target_year: new Date().getFullYear(),
    target_month: new Date().getMonth() + 1,
    target_quarter: Math.floor(new Date().getMonth() / 3) + 1,
    target_amount: '',
    target_deals: '',
    target_customers: '',
    description: '',
  });

  const loadTargets = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const res = await Network.request({
        url: '/api/sales-targets',
        data: { status: 'active' }
      });
      console.log('[SalesTarget] Loaded:', res.data);

      if (res.data.code === 200) {
        setTargets(res.data.data.targets || []);
      }
    } catch (err) {
      console.error('[SalesTarget] Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async () => {
    try {
      const res = await Network.request({
        url: '/api/sales-targets/my/progress'
      });
      console.log('[SalesTarget] Progress:', res.data);

      if (res.data.code === 200) {
        setProgresses(res.data.data || []);
      }
    } catch (err) {
      console.error('[SalesTarget] Progress error:', err);
    }
  };

  useEffect(() => {
    loadTargets();
    loadProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createTarget = async () => {
    if (!createForm.target_amount) {
      Taro.showToast({ title: '请输入目标金额', icon: 'none' });
      return;
    }

    try {
      let startDate = '';
      let endDate = '';

      if (createForm.target_type === 'monthly') {
        startDate = `${createForm.target_year}-${String(createForm.target_month).padStart(2, '0')}-01`;
        const lastDay = new Date(createForm.target_year, createForm.target_month!, 0).getDate();
        endDate = `${createForm.target_year}-${String(createForm.target_month).padStart(2, '0')}-${lastDay}`;
      } else if (createForm.target_type === 'quarterly') {
        const startMonth = (createForm.target_quarter! - 1) * 3 + 1;
        const endMonth = startMonth + 2;
        startDate = `${createForm.target_year}-${String(startMonth).padStart(2, '0')}-01`;
        const lastDay = new Date(createForm.target_year, endMonth, 0).getDate();
        endDate = `${createForm.target_year}-${String(endMonth).padStart(2, '0')}-${lastDay}`;
      } else {
        startDate = `${createForm.target_year}-01-01`;
        endDate = `${createForm.target_year}-12-31`;
      }

      const res = await Network.request({
        url: '/api/sales-targets',
        method: 'POST',
        data: {
          target_type: createForm.target_type,
          target_year: createForm.target_year,
          target_month: createForm.target_type === 'monthly' ? createForm.target_month : undefined,
          target_quarter: createForm.target_type === 'quarterly' ? createForm.target_quarter : undefined,
          target_amount: parseFloat(createForm.target_amount) || 0,
          target_deals: parseInt(createForm.target_deals) || 0,
          target_customers: parseInt(createForm.target_customers) || 0,
          description: createForm.description,
          start_date: startDate,
          end_date: endDate,
        }
      });

      if (res.data.code === 200) {
        Taro.showToast({ title: '创建成功', icon: 'success' });
        setShowCreateModal(false);
        loadTargets();
        loadProgress();
      } else {
        Taro.showToast({ title: res.data.msg || '创建失败', icon: 'none' });
      }
    } catch (err) {
      console.error('[SalesTarget] Create error:', err);
      Taro.showToast({ title: '创建失败', icon: 'none' });
    }
  };

  const deleteTarget = async (id: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '删除后无法恢复，是否继续？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await Network.request({
              url: `/api/sales-targets/${id}`,
              method: 'DELETE'
            });
            if (result.data.code === 200) {
              Taro.showToast({ title: '删除成功', icon: 'success' });
              loadTargets();
              loadProgress();
            }
          } catch (err) {
            Taro.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  };

  // 获取当前期间的目标
  const currentProgresses = progresses.filter(p => {
    const now = new Date();
    if (p.target.target_type === 'monthly') {
      return p.target.target_year === now.getFullYear() && p.target.target_month === now.getMonth() + 1;
    } else if (p.target.target_type === 'quarterly') {
      const quarter = Math.floor(now.getMonth() / 3) + 1;
      return p.target.target_year === now.getFullYear() && p.target.target_quarter === quarter;
    } else {
      return p.target.target_year === now.getFullYear();
    }
  });

  return (
    <View className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <View className="pt-12 pb-4 px-4 bg-slate-900/95 sticky top-0 z-20 border-b border-slate-700/50">
        <View className="flex items-center justify-between">
          <View className="flex items-center gap-3">
            <View
              onClick={() => Taro.navigateBack()}
              className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center active:scale-95"
            >
              <ChevronRight size={18} color="#94a3b8" />
            </View>
            <Text className="block text-white text-xl font-bold">业绩目标</Text>
          </View>
          <View
            onClick={() => setShowCreateModal(true)}
            className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center active:scale-95"
          >
            <Plus size={20} color="#60a5fa" />
          </View>
        </View>

        {/* Tab切换 */}
        <View className="flex gap-2 mt-4">
          {[
            { key: 'current', label: '当前目标' },
            { key: 'all', label: '全部目标' },
          ].map((tab) => (
            <View
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 py-2 rounded-xl text-center transition-all ${
                activeTab === tab.key
                  ? 'bg-blue-500/20 border border-blue-500/50'
                  : 'bg-slate-800 border border-slate-700'
              }`}
            >
              <Text className={`block text-sm font-medium ${activeTab === tab.key ? 'text-blue-400' : 'text-slate-400'}`}>
                {tab.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* 内容区域 */}
      <ScrollView
        scrollY
        className="flex-1 px-4 py-4"
        style={{ height: 'calc(100vh - 140px)' }}
      >
        {activeTab === 'current' && (
          <View className="space-y-4">
            {currentProgresses.length === 0 ? (
              <View className="py-20 text-center">
                <View className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target size={40} color="#60a5fa" />
                </View>
                <Text className="block text-white text-lg font-semibold mb-2">暂无当前目标</Text>
                <Text className="block text-slate-400 text-sm mb-4">设置业绩目标，追踪完成情况</Text>
                <View
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-xl"
                >
                  <Plus size={16} color="#60a5fa" />
                  <Text className="block text-blue-400 text-sm">创建目标</Text>
                </View>
              </View>
            ) : (
              currentProgresses.map((progress) => (
                <View key={progress.target.id} className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
                  {/* 目标标题 */}
                  <View className="flex items-center justify-between mb-4">
                    <View>
                      <Text className="block text-white font-semibold">
                        {typeLabels[progress.target.target_type]}
                      </Text>
                      <Text className="block text-slate-400 text-xs mt-1">
                        {progress.target.target_type === 'monthly' && `${progress.target.target_year}年${progress.target.target_month}月`}
                        {progress.target.target_type === 'quarterly' && `${progress.target.target_year}年Q${progress.target.target_quarter}`}
                        {progress.target.target_type === 'yearly' && `${progress.target.target_year}年`}
                      </Text>
                    </View>
                    <View className={`px-3 py-1 rounded-full ${progress.isAhead ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
                      <Text className={`block text-xs font-medium ${progress.isAhead ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {progress.isAhead ? '超前完成' : '需努力'}
                      </Text>
                    </View>
                  </View>

                  {/* 金额进度 */}
                  <View className="mb-4">
                    <View className="flex items-center justify-between mb-2">
                      <View className="flex items-center gap-2">
                        <DollarSign size={16} color="#60a5fa" />
                        <Text className="block text-slate-300 text-sm">金额目标</Text>
                      </View>
                      <Text className="block text-white font-semibold">
                        ¥{(progress.currentAmount / 10000).toFixed(1)}万 / ¥{(progress.target.target_amount / 10000).toFixed(1)}万
                      </Text>
                    </View>
                    <View className="h-3 bg-slate-700 rounded-full overflow-hidden">
                      <View
                        className={`h-full rounded-full ${progress.amountProgress >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                        style={{ width: `${Math.min(progress.amountProgress, 100)}%` }}
                      />
                    </View>
                    <View className="flex items-center justify-between mt-1">
                      <Text className="block text-slate-400 text-xs">完成度 {progress.amountProgress}%</Text>
                      <Text className="block text-slate-400 text-xs">剩余 ¥{(progress.gapAmount / 10000).toFixed(1)}万</Text>
                    </View>
                  </View>

                  {/* 其他指标 */}
                  <View className="grid grid-cols-2 gap-4 mb-4">
                    {progress.target.target_deals > 0 && (
                      <View className="bg-slate-700/50 rounded-xl p-3">
                        <View className="flex items-center gap-2 mb-1">
                          <CircleCheck size={14} color="#94a3b8" />
                          <Text className="block text-slate-400 text-xs">成交单数</Text>
                        </View>
                        <Text className="block text-white font-semibold">{progress.currentDeals} / {progress.target.target_deals}</Text>
                        <View className="h-1.5 bg-slate-600 rounded-full mt-2 overflow-hidden">
                          <View
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: `${Math.min(progress.dealsProgress, 100)}%` }}
                          />
                        </View>
                      </View>
                    )}
                    {progress.target.target_customers > 0 && (
                      <View className="bg-slate-700/50 rounded-xl p-3">
                        <View className="flex items-center gap-2 mb-1">
                          <Users size={14} color="#94a3b8" />
                          <Text className="block text-slate-400 text-xs">客户数</Text>
                        </View>
                        <Text className="block text-white font-semibold">{progress.currentCustomers} / {progress.target.target_customers}</Text>
                        <View className="h-1.5 bg-slate-600 rounded-full mt-2 overflow-hidden">
                          <View
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${Math.min(progress.customersProgress, 100)}%` }}
                          />
                        </View>
                      </View>
                    )}
                  </View>

                  {/* 时间进度 */}
                  <View className="pt-3 border-t border-slate-700/50">
                    <View className="flex items-center justify-between">
                      <Text className="block text-slate-400 text-xs">时间进度 {progress.timeProgress}%</Text>
                      <Text className="block text-slate-400 text-xs">已用 {progress.daysElapsed} / {progress.daysTotal} 天</Text>
                    </View>
                    <View className="h-1.5 bg-slate-700 rounded-full mt-2 overflow-hidden">
                      <View className="h-full bg-slate-500 rounded-full" style={{ width: `${progress.timeProgress}%` }} />
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'all' && (
          <View className="space-y-3">
            {targets.length === 0 ? (
              <View className="py-20 text-center">
                <Text className="block text-slate-400">暂无目标记录</Text>
              </View>
            ) : (
              targets.map((target) => (
                <View key={target.id} className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
                  <View className="flex items-center justify-between">
                    <View className="flex-1">
                      <View className="flex items-center gap-2 mb-1">
                        <Text className="block text-white font-semibold">{typeLabels[target.target_type]}</Text>
                        <View className={`px-2 py-0.5 rounded-full ${
                          target.status === 'active' ? 'bg-emerald-500/20' :
                          target.status === 'completed' ? 'bg-blue-500/20' :
                          'bg-slate-600/20'
                        }`}
                        >
                          <Text className={`block text-xs ${
                            target.status === 'active' ? 'text-emerald-400' :
                            target.status === 'completed' ? 'text-blue-400' :
                            'text-slate-400'
                          }`}
                          >
                            {target.status === 'active' ? '进行中' : target.status === 'completed' ? '已完成' : '已取消'}
                          </Text>
                        </View>
                      </View>
                      <Text className="block text-slate-400 text-sm">
                        ¥{(target.target_amount / 10000).toFixed(1)}万
                        {target.target_deals > 0 && ` · ${target.target_deals}单`}
                        {target.target_customers > 0 && ` · ${target.target_customers}客户`}
                      </Text>
                    </View>
                    <View className="flex gap-2">
                      <View
                        onClick={() => deleteTarget(target.id)}
                        className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center"
                      >
                        <Trash2 size={16} color="#f87171" />
                      </View>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        <View className="h-8" />
      </ScrollView>

      {/* 创建弹窗 */}
      {showCreateModal && (
        <View
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <View
            className="bg-slate-800 rounded-2xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <View className="px-4 py-4 border-b border-slate-700">
              <Text className="block text-white text-lg font-semibold">创建业绩目标</Text>
            </View>

            <ScrollView scrollY className="px-4 py-4 max-h-[60vh]">
              {/* 目标类型 */}
              <View className="mb-4">
                <Text className="block text-slate-300 text-sm mb-2">目标类型</Text>
                <View className="flex gap-2">
                  {[
                    { key: 'monthly', label: '月度' },
                    { key: 'quarterly', label: '季度' },
                    { key: 'yearly', label: '年度' },
                  ].map((type) => (
                    <View
                      key={type.key}
                      onClick={() => setCreateForm({ ...createForm, target_type: type.key as any })}
                      className={`flex-1 py-2 rounded-xl text-center border transition-all ${
                        createForm.target_type === type.key
                          ? 'bg-blue-500/20 border-blue-500/50'
                          : 'bg-slate-700 border-slate-600'
                      }`}
                    >
                      <Text className={`block text-sm ${createForm.target_type === type.key ? 'text-blue-400' : 'text-slate-400'}`}>
                        {type.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* 年份 */}
              <View className="mb-4">
                <Text className="block text-slate-300 text-sm mb-2">年份</Text>
                <View className="bg-slate-700 rounded-xl px-3 py-2">
                  <Input
                    style={{ width: '100%', color: '#fff', fontSize: '14px' }}
                    type="number"
                    value={String(createForm.target_year)}
                    onInput={(e) => setCreateForm({ ...createForm, target_year: parseInt(e.detail.value) || new Date().getFullYear() })}
                  />
                </View>
              </View>

              {/* 月份/季度 */}
              {createForm.target_type === 'monthly' && (
                <View className="mb-4">
                  <Text className="block text-slate-300 text-sm mb-2">月份</Text>
                  <View className="grid grid-cols-4 gap-2">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <View
                        key={month}
                        onClick={() => setCreateForm({ ...createForm, target_month: month })}
                        className={`py-2 rounded-lg text-center border transition-all ${
                          createForm.target_month === month
                            ? 'bg-blue-500/20 border-blue-500/50'
                            : 'bg-slate-700 border-slate-600'
                        }`}
                      >
                        <Text className={`block text-sm ${createForm.target_month === month ? 'text-blue-400' : 'text-slate-400'}`}>
                          {month}月
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {createForm.target_type === 'quarterly' && (
                <View className="mb-4">
                  <Text className="block text-slate-300 text-sm mb-2">季度</Text>
                  <View className="flex gap-2">
                    {[1, 2, 3, 4].map((q) => (
                      <View
                        key={q}
                        onClick={() => setCreateForm({ ...createForm, target_quarter: q })}
                        className={`flex-1 py-2 rounded-xl text-center border transition-all ${
                          createForm.target_quarter === q
                            ? 'bg-blue-500/20 border-blue-500/50'
                            : 'bg-slate-700 border-slate-600'
                        }`}
                      >
                        <Text className={`block text-sm ${createForm.target_quarter === q ? 'text-blue-400' : 'text-slate-400'}`}>
                          Q{q}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* 目标金额 */}
              <View className="mb-4">
                <Text className="block text-slate-300 text-sm mb-2">目标金额（元）</Text>
                <View className="bg-slate-700 rounded-xl px-3 py-2">
                  <Input
                    style={{ width: '100%', color: '#fff', fontSize: '14px' }}
                    type="digit"
                    placeholder="请输入目标金额"
                    value={createForm.target_amount}
                    onInput={(e) => setCreateForm({ ...createForm, target_amount: e.detail.value })}
                  />
                </View>
              </View>

              {/* 目标单数 */}
              <View className="mb-4">
                <Text className="block text-slate-300 text-sm mb-2">目标成交单数（可选）</Text>
                <View className="bg-slate-700 rounded-xl px-3 py-2">
                  <Input
                    style={{ width: '100%', color: '#fff', fontSize: '14px' }}
                    type="number"
                    placeholder="请输入目标单数"
                    value={createForm.target_deals}
                    onInput={(e) => setCreateForm({ ...createForm, target_deals: e.detail.value })}
                  />
                </View>
              </View>

              {/* 目标客户数 */}
              <View className="mb-4">
                <Text className="block text-slate-300 text-sm mb-2">目标客户数（可选）</Text>
                <View className="bg-slate-700 rounded-xl px-3 py-2">
                  <Input
                    style={{ width: '100%', color: '#fff', fontSize: '14px' }}
                    type="number"
                    placeholder="请输入目标客户数"
                    value={createForm.target_customers}
                    onInput={(e) => setCreateForm({ ...createForm, target_customers: e.detail.value })}
                  />
                </View>
              </View>

              {/* 说明 */}
              <View className="mb-4">
                <Text className="block text-slate-300 text-sm mb-2">目标说明（可选）</Text>
                <View className="bg-slate-700 rounded-xl px-3 py-2">
                  <Input
                    style={{ width: '100%', color: '#fff', fontSize: '14px' }}
                    placeholder="请输入目标说明"
                    value={createForm.description}
                    onInput={(e) => setCreateForm({ ...createForm, description: e.detail.value })}
                  />
                </View>
              </View>
            </ScrollView>

            <View className="px-4 py-4 border-t border-slate-700 flex gap-3">
              <View
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-3 bg-slate-700 rounded-xl flex items-center justify-center"
              >
                <Text className="block text-slate-300 font-medium">取消</Text>
              </View>
              <View
                onClick={createTarget}
                className="flex-1 py-3 bg-blue-500 rounded-xl flex items-center justify-center"
              >
                <Text className="block text-white font-medium">创建</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
