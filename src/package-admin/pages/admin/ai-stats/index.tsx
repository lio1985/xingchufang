import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import {
  Users,
  Zap,
  TrendingUp,
  DollarSign,
  Loader,
  RefreshCw,
} from 'lucide-react-taro';
import { Network } from '@/network';

interface UsageStats {
  totalCalls: number;
  successCalls: number;
  successRate: string;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalCost: number;
  activeUsers: number;
  avgResponseTime: number;
}

interface ModuleStat {
  id: string;
  code: string;
  name: string;
  callCount: number;
  is_active: boolean;
}

interface UserRanking {
  rank: number;
  userId: string;
  nickname?: string;
  avatarUrl?: string;
  callCount: number;
  totalCost: number;
  totalTokens: number;
}

const AiStatsPage = () => {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [moduleStats, setModuleStats] = useState<ModuleStat[]>([]);
  const [userRanking, setUserRanking] = useState<UserRanking[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(
        period === 'today' ? Date.now() :
        period === 'week' ? Date.now() - 7 * 24 * 60 * 60 * 1000 :
        Date.now() - 30 * 24 * 60 * 60 * 1000
      ).toISOString().split('T')[0];

      const [statsRes, moduleRes, rankingRes] = await Promise.all([
        Network.request({
          url: '/api/ai-admin/usage/stats',
          method: 'GET',
          data: { startDate, endDate },
        }),
        Network.request({
          url: '/api/ai-admin/usage/module-stats',
          method: 'GET',
          data: { startDate, endDate },
        }),
        Network.request({
          url: '/api/ai-admin/usage/user-ranking',
          method: 'GET',
          data: { startDate, endDate, limit: 5 },
        }),
      ]);

      if (statsRes.data?.code === 200) setStats(statsRes.data.data);
      if (moduleRes.data?.code === 200) setModuleStats(moduleRes.data.data);
      if (rankingRes.data?.code === 200) setUserRanking(rankingRes.data.data);
    } catch (error) {
      console.error('[AiStats] 加载失败:', error);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatMoney = (amount: number) => {
    if (amount >= 10000) return (amount / 10000).toFixed(1) + '万';
    return amount.toFixed(2);
  };

  const formatTokens = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', paddingBottom: '60px' }}>
      {/* Header */}
      <View style={{ padding: '48px 20px 20px', backgroundColor: '#111827', borderBottom: '1px solid #1e3a5f' }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            
            <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>使用统计</Text>
          </View>
          <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }} onClick={loadData}>
            <RefreshCw size={14} color="#38bdf8" />
            <Text style={{ fontSize: '12px', color: '#38bdf8' }}>刷新</Text>
          </View>
        </View>

        {/* 时间筛选 */}
        <View style={{ display: 'flex', gap: '8px' }}>
          {[
            { key: 'today', label: '今日' },
            { key: 'week', label: '本周' },
            { key: 'month', label: '本月' },
          ].map((item) => (
            <View
              key={item.key}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '10px',
                backgroundColor: period === item.key ? '#38bdf8' : '#111827',
                border: period === item.key ? 'none' : '1px solid #1e3a5f',
                textAlign: 'center',
              }}
              onClick={() => setPeriod(item.key as typeof period)}
            >
              <Text style={{ fontSize: '14px', fontWeight: '500', color: period === item.key ? '#0a0f1a' : '#94a3b8' }}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView scrollY style={{ height: 'calc(100vh - 200px)' }}>
        {loading ? (
          <View style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Loader size={32} color="#38bdf8" />
            <Text style={{ fontSize: '14px', color: '#71717a', display: 'block', marginTop: '12px' }}>加载中...</Text>
          </View>
        ) : (
          <View style={{ padding: '20px' }}>
            {/* 统计概览 */}
            {stats && (
              <View style={{ marginBottom: '24px' }}>
                <Text style={{ fontSize: '14px', color: '#64748b', fontWeight: '500', marginBottom: '12px', display: 'block' }}>总体概览</Text>
                <View style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                    <Zap size={16} color="#38bdf8" />
                    <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', display: 'block', marginTop: '6px' }}>{stats.totalCalls}</Text>
                    <Text style={{ fontSize: '10px', color: '#71717a', display: 'block', marginTop: '2px' }}>调用次数</Text>
                  </View>
                  <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                    <TrendingUp size={16} color="#10b981" />
                    <Text style={{ fontSize: '20px', fontWeight: '700', color: '#10b981', display: 'block', marginTop: '6px' }}>{stats.successRate}%</Text>
                    <Text style={{ fontSize: '10px', color: '#71717a', display: 'block', marginTop: '2px' }}>成功率</Text>
                  </View>
                  <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                    <Users size={16} color="#a855f7" />
                    <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', display: 'block', marginTop: '6px' }}>{stats.activeUsers}</Text>
                    <Text style={{ fontSize: '10px', color: '#71717a', display: 'block', marginTop: '2px' }}>活跃用户</Text>
                  </View>
                  <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                    <DollarSign size={16} color="#f59e0b" />
                    <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', display: 'block', marginTop: '6px' }}>¥{formatMoney(stats.totalCost)}</Text>
                    <Text style={{ fontSize: '10px', color: '#71717a', display: 'block', marginTop: '2px' }}>总成本</Text>
                  </View>
                </View>

                <View style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '10px' }}>
                  <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '10px', padding: '12px' }}>
                    <Text style={{ fontSize: '11px', color: '#71717a', display: 'block' }}>Token消耗</Text>
                    <Text style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', display: 'block', marginTop: '4px' }}>{formatTokens(stats.totalTokens)}</Text>
                  </View>
                  <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '10px', padding: '12px' }}>
                    <Text style={{ fontSize: '11px', color: '#71717a', display: 'block' }}>平均响应</Text>
                    <Text style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff', display: 'block', marginTop: '4px' }}>{stats.avgResponseTime}ms</Text>
                  </View>
                </View>
              </View>
            )}

            {/* 模块使用排行 */}
            {moduleStats.length > 0 && (
              <View style={{ marginBottom: '24px' }}>
                <Text style={{ fontSize: '14px', color: '#64748b', fontWeight: '500', marginBottom: '12px', display: 'block' }}>模块使用排行</Text>
                <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', overflow: 'hidden' }}>
                  {moduleStats.slice(0, 5).map((module, index) => {
                    const maxCalls = Math.max(...moduleStats.map(m => m.callCount));
                    const percentage = maxCalls > 0 ? (module.callCount / maxCalls * 100) : 0;
                    
                    return (
                      <View key={module.id} style={{ padding: '12px 16px', borderBottom: index < Math.min(4, moduleStats.length - 1) ? '1px solid #1e3a5f' : 'none' }}>
                        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Text style={{ fontSize: '12px', color: '#64748b', width: '16px' }}>#{index + 1}</Text>
                            <Text style={{ fontSize: '14px', color: '#ffffff' }}>{module.name}</Text>
                          </View>
                          <Text style={{ fontSize: '13px', color: '#94a3b8' }}>{module.callCount}次</Text>
                        </View>
                        <View style={{ height: '4px', backgroundColor: '#1e3a5f', borderRadius: '2px', overflow: 'hidden' }}>
                          <View style={{ width: `${percentage}%`, height: '100%', backgroundColor: '#38bdf8' }} />
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* 用户使用排行 */}
            {userRanking.length > 0 && (
              <View>
                <Text style={{ fontSize: '14px', color: '#64748b', fontWeight: '500', marginBottom: '12px', display: 'block' }}>用户使用排行</Text>
                <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', overflow: 'hidden' }}>
                  {userRanking.map((user) => (
                    <View key={user.userId} style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e3a5f' }}>
                      <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <View style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: user.rank <= 3 ? '#fbbf24' : '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ fontSize: '11px', fontWeight: '600', color: user.rank <= 3 ? '#0a0f1a' : '#94a3b8' }}>#{user.rank}</Text>
                        </View>
                        <Text style={{ fontSize: '14px', color: '#ffffff' }}>{user.nickname || '用户'}</Text>
                      </View>
                      <View style={{ textAlign: 'right' }}>
                        <Text style={{ fontSize: '13px', color: '#94a3b8', display: 'block' }}>{user.callCount}次</Text>
                        <Text style={{ fontSize: '11px', color: '#71717a', display: 'block' }}>¥{formatMoney(user.totalCost)}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default AiStatsPage;
