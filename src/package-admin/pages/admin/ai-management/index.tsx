import { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  Bot,
  Puzzle,
  ChartBarBig,
  Settings,
  RefreshCw,
  DollarSign,
  Zap,
} from 'lucide-react-taro';
import { Network } from '@/network';

interface DashboardStats {
  modelCount: number;
  moduleCount: number;
  todayCalls: number;
  monthCost: number;
  totalCalls: number;
  successRate: string;
  activeUsers: number;
  avgResponseTime: number;
}

interface RecentLog {
  id: string;
  status: string;
  created_at: string;
  response_time_ms: number;
  input_token_count: number;
  output_token_count: number;
  user?: { nickname: string };
  module?: { name: string };
}

const AiManagementPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<RecentLog[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const response = await Network.request({
        url: '/api/ai-admin/dashboard',
        method: 'GET',
      });

      console.log('[AiManagement] Dashboard response:', response);

      if (response.data?.code === 200 && response.data?.data) {
        setStats(response.data.data.stats);
        setRecentLogs(response.data.data.recentLogs || []);
      }
    } catch (error) {
      console.error('[AiManagement] 加载失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNav = (path: string) => {
    Taro.navigateTo({ url: path });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const menuItems = [
    {
      icon: Bot,
      title: '模型管理',
      desc: '配置模型参数',
      path: '/package-admin/pages/admin/ai-models/index',
      color: '#38bdf8',
      bgColor: 'rgba(56, 189, 248, 0.2)',
    },
    {
      icon: Puzzle,
      title: '功能模块',
      desc: '管理赋能板块',
      path: '/package-admin/pages/admin/ai-modules/index',
      color: '#a855f7',
      bgColor: 'rgba(168, 85, 247, 0.2)',
    },
    {
      icon: ChartBarBig,
      title: '使用统计',
      desc: '查看调用数据',
      path: '/package-admin/pages/admin/ai-stats/index',
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.2)',
    },
    {
      icon: Settings,
      title: '全局设置',
      desc: '回答逻辑控制',
      path: '/package-admin/pages/admin/ai-settings/index',
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.2)',
    },
  ];

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', paddingBottom: '60px' }}>
      {/* Header */}
      <View style={{ padding: '48px 20px 20px', backgroundColor: '#111827', borderBottom: '1px solid #1e3a5f' }}>
        <View style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          
          <View>
            <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', display: 'block' }}>管理中心</Text>
            <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginTop: '2px' }}>全局配置与监控</Text>
          </View>
        </View>
      </View>

      {/* 统计卡片 */}
      <View style={{ padding: '20px 20px 0' }}>
        <View style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
            <Bot size={20} color="#38bdf8" />
            <Text style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', display: 'block', marginTop: '8px' }}>{stats?.modelCount || 0}</Text>
            <Text style={{ fontSize: '11px', color: '#71717a', display: 'block', marginTop: '2px' }}>模型</Text>
          </View>
          <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
            <Puzzle size={20} color="#a855f7" />
            <Text style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', display: 'block', marginTop: '8px' }}>{stats?.moduleCount || 0}</Text>
            <Text style={{ fontSize: '11px', color: '#71717a', display: 'block', marginTop: '2px' }}>功能模块</Text>
          </View>
          <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
            <Zap size={20} color="#10b981" />
            <Text style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', display: 'block', marginTop: '8px' }}>{stats?.todayCalls || 0}</Text>
            <Text style={{ fontSize: '11px', color: '#71717a', display: 'block', marginTop: '2px' }}>今日调用</Text>
          </View>
          <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
            <DollarSign size={20} color="#f59e0b" />
            <Text style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', display: 'block', marginTop: '8px' }}>¥{(stats?.monthCost || 0).toFixed(0)}</Text>
            <Text style={{ fontSize: '11px', color: '#71717a', display: 'block', marginTop: '2px' }}>本月成本</Text>
          </View>
        </View>
      </View>

      {/* 快速入口 */}
      <View style={{ padding: '24px 20px 0' }}>
        <Text style={{ fontSize: '14px', color: '#64748b', display: 'block', marginBottom: '12px', fontWeight: '500' }}>快速入口</Text>
        <View style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {menuItems.map((item, index) => (
            <View
              key={index}
              style={{
                backgroundColor: '#111827',
                border: '1px solid #1e3a5f',
                borderRadius: '12px',
                padding: '16px',
              }}
              onClick={() => handleNav(item.path)}
            >
              <View style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: item.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <item.icon size={22} color={item.color} />
              </View>
              <Text style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff', display: 'block' }}>{item.title}</Text>
              <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>{item.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 实时调用监控 */}
      <View style={{ padding: '24px 20px 0' }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <Text style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>实时调用监控</Text>
          <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }} onClick={loadDashboard}>
            <RefreshCw size={14} color="#38bdf8" />
            <Text style={{ fontSize: '12px', color: '#38bdf8' }}>刷新</Text>
          </View>
        </View>

        <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', overflow: 'hidden' }}>
          {loading ? (
            <View style={{ padding: '40px 20px', textAlign: 'center' }}>
              <RefreshCw size={24} color="#38bdf8" />
              <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginTop: '12px' }}>加载中...</Text>
            </View>
          ) : recentLogs.length === 0 ? (
            <View style={{ padding: '40px 20px', textAlign: 'center' }}>
              <Text style={{ fontSize: '13px', color: '#71717a' }}>暂无调用记录</Text>
            </View>
          ) : (
            recentLogs.map((log, index) => (
              <View
                key={log.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderBottom: index < recentLogs.length - 1 ? '1px solid #1e3a5f' : 'none',
                }}
              >
                <View style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <View style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: log.status === 'success' ? '#10b981' : '#f87171' }} />
                  <View style={{ flex: 1 }}>
                    <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Text style={{ fontSize: '13px', color: '#ffffff', fontWeight: '500' }}>{log.user?.nickname || '用户'}</Text>
                      <Text style={{ fontSize: '12px', color: '#64748b' }}>{log.module?.name || '模块'}</Text>
                    </View>
                    <Text style={{ fontSize: '11px', color: '#71717a', display: 'block', marginTop: '2px' }}>{formatTime(log.created_at)}</Text>
                  </View>
                </View>
                <View style={{ textAlign: 'right' }}>
                  <Text style={{ fontSize: '12px', color: '#94a3b8', display: 'block' }}>{log.input_token_count + log.output_token_count} tokens</Text>
                  <Text style={{ fontSize: '11px', color: '#71717a', display: 'block', marginTop: '2px' }}>{log.response_time_ms}ms</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </View>

      {/* 使用统计概览 */}
      {stats && (
        <View style={{ padding: '24px 20px 0' }}>
          <Text style={{ fontSize: '14px', color: '#64748b', display: 'block', marginBottom: '12px', fontWeight: '500' }}>使用统计概览</Text>
          <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px' }}>
            <View style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              <View>
                <Text style={{ fontSize: '12px', color: '#71717a', display: 'block' }}>总调用次数</Text>
                <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', display: 'block', marginTop: '4px' }}>{stats.totalCalls}</Text>
              </View>
              <View>
                <Text style={{ fontSize: '12px', color: '#71717a', display: 'block' }}>成功率</Text>
                <Text style={{ fontSize: '20px', fontWeight: '700', color: '#10b981', display: 'block', marginTop: '4px' }}>{stats.successRate}%</Text>
              </View>
              <View>
                <Text style={{ fontSize: '12px', color: '#71717a', display: 'block' }}>活跃用户</Text>
                <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', display: 'block', marginTop: '4px' }}>{stats.activeUsers}</Text>
              </View>
              <View>
                <Text style={{ fontSize: '12px', color: '#71717a', display: 'block' }}>平均响应</Text>
                <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', display: 'block', marginTop: '4px' }}>{stats.avgResponseTime}ms</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default AiManagementPage;
