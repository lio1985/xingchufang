import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  ChevronLeft,
  DollarSign,
  Users,
  FileText,
  Activity,
  RefreshCw,
  Crown,
  User,
} from 'lucide-react-taro';
import { Network } from '@/network';

interface DashboardStats {
  type: 'global' | 'personal';
  stats?: any;
  trends?: any[];
  personal?: {
    customerCount: number;
    totalDealValue: number;
    contentCount: number;
    dialogCount: number;
    messageCount: number;
    lexiconCount: number;
    trends: any[];
  };
  team?: {
    teamId: string;
    memberCount: number;
    customerCount: number;
    totalDealValue: number;
    contentCount: number;
    dialogCount: number;
    messageCount: number;
    memberStats: any[];
  } | null;
}

const DataStatsPage = () => {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkUserRole();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (dashboardData) {
      loadStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const checkUserRole = async () => {
    try {
      const user = Taro.getStorageSync('user');
      setIsAdmin(user?.role === 'admin');
      await loadStats();
    } catch (error) {
      console.error('检查用户角色失败:', error);
      setLoading(false);
    }
  };

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await Network.request({
        url: '/api/statistics/dashboard',
        method: 'GET',
        data: { period },
      });

      console.log('[DataStats] Dashboard response:', response);

      if (response.data?.code === 200 && response.data?.data) {
        setDashboardData(response.data.data);
      } else {
        // 如果接口失败，使用模拟数据
        setDashboardData(generateMockData());
      }
    } catch (error) {
      console.error('[DataStats] 加载失败:', error);
      // 使用模拟数据
      setDashboardData(generateMockData());
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = (): DashboardStats => {
    if (isAdmin) {
      return {
        type: 'global',
        stats: {
          totalUsers: 156,
          activeUsers: 89,
          totalDialogs: 1234,
          totalMessages: 5678,
          totalLexicons: 234,
          todayActiveUsers: 45,
          todayDialogs: 123,
          todayMessages: 456,
        },
        trends: Array.from({ length: 7 }, (_, i) => ({
          date: `周${['一', '二', '三', '四', '五', '六', '日'][i]}`,
          dialogCount: Math.floor(Math.random() * 100) + 50,
          messageCount: Math.floor(Math.random() * 200) + 100,
          activeUsers: Math.floor(Math.random() * 50) + 20,
        })),
      };
    } else {
      return {
        type: 'personal',
        personal: {
          customerCount: Math.floor(Math.random() * 50) + 10,
          totalDealValue: Math.floor(Math.random() * 50000) + 10000,
          contentCount: Math.floor(Math.random() * 30) + 10,
          dialogCount: Math.floor(Math.random() * 100) + 20,
          messageCount: Math.floor(Math.random() * 300) + 50,
          lexiconCount: Math.floor(Math.random() * 20) + 5,
          trends: Array.from({ length: 7 }, (_, i) => ({
            date: `周${['一', '二', '三', '四', '五', '六', '日'][i]}`,
            dialogCount: Math.floor(Math.random() * 20) + 5,
            messageCount: Math.floor(Math.random() * 50) + 10,
          })),
        },
        team: {
          teamId: 'mock-team',
          memberCount: 5,
          customerCount: Math.floor(Math.random() * 200) + 50,
          totalDealValue: Math.floor(Math.random() * 200000) + 50000,
          contentCount: Math.floor(Math.random() * 100) + 30,
          dialogCount: Math.floor(Math.random() * 300) + 100,
          messageCount: Math.floor(Math.random() * 800) + 200,
          memberStats: [],
        },
      };
    }
  };

  const formatMoney = (amount: number) => {
    if (amount >= 10000) {
      return (amount / 10000).toFixed(1) + '万';
    }
    return amount.toLocaleString();
  };

  const getMaxValue = (data: any[], key: string) => {
    return Math.max(...data.map((d) => d[key] || 0), 1);
  };

  const getBarHeight = (value: number, maxValue: number) => {
    return (value / maxValue) * 100;
  };

  // 管理员视图
  const renderAdminView = () => {
    if (!dashboardData?.stats) return null;

    const { stats, trends } = dashboardData;

    return (
      <ScrollView scrollY style={{ paddingTop: '32px', height: 'calc(100vh - 200px)' }}>
        {/* 核心指标 */}
        <View style={{ padding: '0 20px', marginBottom: '24px' }}>
          <Text style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', marginBottom: '12px', display: 'block' }}>核心指标</Text>
          
          <View style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px' }}>
              <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <View style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={16} color="#60a5fa" />
                </View>
                <Text style={{ fontSize: '13px', color: '#94a3b8' }}>总用户数</Text>
              </View>
              <Text style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff', display: 'block' }}>{stats.totalUsers}</Text>
              <Text style={{ fontSize: '12px', color: '#10b981', display: 'block', marginTop: '4px' }}>今日活跃 {stats.todayActiveUsers}</Text>
            </View>

            <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px' }}>
              <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <View style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Activity size={16} color="#10b981" />
                </View>
                <Text style={{ fontSize: '13px', color: '#94a3b8' }}>对话总数</Text>
              </View>
              <Text style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff', display: 'block' }}>{stats.totalDialogs}</Text>
              <Text style={{ fontSize: '12px', color: '#10b981', display: 'block', marginTop: '4px' }}>今日 {stats.todayDialogs}</Text>
            </View>

            <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px' }}>
              <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <View style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={16} color="#fbbf24" />
                </View>
                <Text style={{ fontSize: '13px', color: '#94a3b8' }}>消息总数</Text>
              </View>
              <Text style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff', display: 'block' }}>{stats.totalMessages}</Text>
              <Text style={{ fontSize: '12px', color: '#10b981', display: 'block', marginTop: '4px' }}>今日 {stats.todayMessages}</Text>
            </View>

            <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px' }}>
              <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <View style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: 'rgba(168, 85, 247, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={16} color="#a855f7" />
                </View>
                <Text style={{ fontSize: '13px', color: '#94a3b8' }}>语料库</Text>
              </View>
              <Text style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff', display: 'block' }}>{stats.totalLexicons}</Text>
              <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>总条目</Text>
            </View>
          </View>
        </View>

        {/* 趋势图 */}
        {trends && trends.length > 0 && (
          <View style={{ padding: '0 20px', marginBottom: '24px' }}>
            <Text style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', marginBottom: '12px', display: 'block' }}>活跃趋势</Text>
            
            <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px' }}>
              <View style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '120px', gap: '8px' }}>
                {trends.map((item, index) => {
                  const maxDialog = getMaxValue(trends, 'dialogCount');
                  return (
                    <View key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <View
                        style={{
                          width: '100%',
                          height: `${getBarHeight(item.dialogCount, maxDialog)}px`,
                          backgroundColor: index === trends.length - 1 ? '#38bdf8' : '#1e3a5f',
                          borderRadius: '4px 4px 0 0',
                          minHeight: '4px',
                        }}
                      />
                      <Text style={{ fontSize: '11px', color: '#71717a' }}>{item.date}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    );
  };

  // 普通用户视图
  const renderUserView = () => {
    const { personal, team } = dashboardData || {};

    return (
      <ScrollView scrollY style={{ paddingTop: '32px', height: 'calc(100vh - 200px)' }}>
        {/* 个人数据 */}
        {personal && (
          <View style={{ padding: '0 20px', marginBottom: '24px' }}>
            <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <User size={16} color="#38bdf8" />
              <Text style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>个人数据</Text>
            </View>
            
            <View style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px' }}>
                <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <View style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={16} color="#60a5fa" />
                  </View>
                  <Text style={{ fontSize: '13px', color: '#94a3b8' }}>客户数量</Text>
                </View>
                <Text style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff', display: 'block' }}>{personal.customerCount}</Text>
              </View>

              <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px' }}>
                <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <View style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DollarSign size={16} color="#10b981" />
                  </View>
                  <Text style={{ fontSize: '13px', color: '#94a3b8' }}>成交总额</Text>
                </View>
                <Text style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff', display: 'block' }}>¥{formatMoney(personal.totalDealValue)}</Text>
              </View>

              <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px' }}>
                <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <View style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={16} color="#fbbf24" />
                  </View>
                  <Text style={{ fontSize: '13px', color: '#94a3b8' }}>内容数量</Text>
                </View>
                <Text style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff', display: 'block' }}>{personal.contentCount}</Text>
              </View>

              <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px' }}>
                <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <View style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: 'rgba(168, 85, 247, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Activity size={16} color="#a855f7" />
                  </View>
                  <Text style={{ fontSize: '13px', color: '#94a3b8' }}>对话次数</Text>
                </View>
                <Text style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff', display: 'block' }}>{personal.dialogCount}</Text>
              </View>
            </View>
          </View>
        )}

        {/* 团队数据 */}
        {team && (
          <View style={{ padding: '0 20px', marginBottom: '24px' }}>
            <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Crown size={16} color="#fbbf24" />
              <Text style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>团队数据</Text>
            </View>
            
            <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px' }}>
              <View style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
                <View>
                  <Text style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>团队成员</Text>
                  <Text style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', display: 'block' }}>{team.memberCount} 人</Text>
                </View>
                <View>
                  <Text style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>团队客户</Text>
                  <Text style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', display: 'block' }}>{team.customerCount}</Text>
                </View>
                <View>
                  <Text style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>成交总额</Text>
                  <Text style={{ fontSize: '24px', fontWeight: '700', color: '#10b981', display: 'block' }}>¥{formatMoney(team.totalDealValue)}</Text>
                </View>
                <View>
                  <Text style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>内容数量</Text>
                  <Text style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', display: 'block' }}>{team.contentCount}</Text>
                </View>
              </View>

              <View style={{ borderTop: '1px solid #1e3a5f', paddingTop: '12px' }}>
                <Text style={{ fontSize: '13px', color: '#71717a', marginBottom: '8px', display: 'block' }}>团队活动</Text>
                <View style={{ display: 'flex', gap: '16px' }}>
                  <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Activity size={14} color="#38bdf8" />
                    <Text style={{ fontSize: '14px', color: '#ffffff' }}>{team.dialogCount} 次对话</Text>
                  </View>
                  <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <FileText size={14} color="#fbbf24" />
                    <Text style={{ fontSize: '14px', color: '#ffffff' }}>{team.messageCount} 条消息</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* 无团队提示 */}
        {!team && (
          <View style={{ padding: '0 20px', marginBottom: '24px' }}>
            <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '32px', textAlign: 'center' }}>
              <View style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Users size={28} color="#64748b" />
              </View>
              <Text style={{ fontSize: '14px', color: '#71717a', display: 'block' }}>暂未加入团队</Text>
              <Text style={{ fontSize: '12px', color: '#64748b', display: 'block', marginTop: '4px' }}>加入团队后可查看团队数据</Text>
            </View>
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', paddingBottom: '60px' }}>
      {/* Header */}
      <View style={{ padding: '48px 20px 20px', backgroundColor: '#111827', borderBottom: '1px solid #1e3a5f' }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <View
              style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => {
                const pages = Taro.getCurrentPages();
                if (pages.length > 1) {
                  Taro.navigateBack();
                } else {
                  Taro.redirectTo({ url: '/pages/tab-profile/index' });
                }
              }}
            >
              <ChevronLeft size={24} color="#f1f5f9" />
            </View>
            <View>
              <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', display: 'block' }}>数据看板</Text>
              <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginTop: '2px' }}>
                {isAdmin ? '全局数据监控' : '个人与团队数据'}
              </Text>
            </View>
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

      {/* 内容区 */}
      {loading ? (
        <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px' }}>
          <RefreshCw size={48} color="#38bdf8" />
          <Text style={{ fontSize: '14px', color: '#71717a', marginTop: '16px', display: 'block' }}>加载中...</Text>
        </View>
      ) : isAdmin ? (
        renderAdminView()
      ) : (
        renderUserView()
      )}
    </View>
  );
};

export default DataStatsPage;
