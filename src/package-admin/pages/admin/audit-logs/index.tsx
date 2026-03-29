import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Network } from '@/network';
import {
  FileText,
  RefreshCw,
  User,
  Activity,
  Info,
  CircleAlert,
} from 'lucide-react-taro';

interface AuditLog {
  id: string;
  action: string;
  module: string;
  userId: string;
  userName?: string;
  ip?: string;
  details?: string;
  createdAt: string;
  level: 'info' | 'warning' | 'error';
}

interface LogStatistics {
  todayCount: number;
  weekCount: number;
  errorCount: number;
  warningCount: number;
}

export default function AdminAuditLogsPage() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [statistics, setStatistics] = useState<LogStatistics | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filterModule, setFilterModule] = useState('');
  const [filterLevel, setFilterLevel] = useState('');

  const moduleOptions = ['全部模块', '用户管理', '语料库', '客户管理', '订单管理', '系统设置'];
  const levelOptions = ['全部级别', 'info', 'warning', 'error'];

  const loadLogs = async (isRefresh = false) => {
    if (loading) return;
    setLoading(true);

    try {
      const currentPage = isRefresh ? 1 : page;
      const res = await Network.request({
        url: '/api/admin/audit-logs',
        data: {
          page: currentPage,
          pageSize: 20,
          module: filterModule || undefined,
          level: filterLevel || undefined,
        },
      });

      console.log('审计日志响应:', res.data);

      if (res.statusCode === 200 && res.data?.data) {
        const newLogs = res.data.data.data || res.data.data;
        setLogs(isRefresh ? newLogs : [...logs, ...newLogs]);
        setHasMore(newLogs.length === 20);
        if (!isRefresh) setPage(currentPage + 1);
      }
    } catch (error) {
      console.error('加载日志失败:', error);
      Taro.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const res = await Network.request({
        url: '/api/admin/audit-logs/statistics',
      });

      if (res.statusCode === 200 && res.data?.data) {
        setStatistics(res.data.data);
      }
    } catch (error) {
      console.error('加载统计失败:', error);
    }
  };

  useEffect(() => {
    loadStatistics();
    loadLogs(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterModule, filterLevel]);

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return CircleAlert;
      case 'warning':
        return CircleAlert;
      default:
        return Info;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return '#f87171';
      case 'warning':
        return '#fbbf24';
      default:
        return '#38bdf8';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
  };

  const statCards = [
    {
      icon: Activity,
      label: '今日操作',
      value: statistics?.todayCount || 0,
      color: '#38bdf8',
    },
    {
      icon: FileText,
      label: '本周操作',
      value: statistics?.weekCount || 0,
      color: '#a855f7',
    },
    {
      icon: CircleAlert,
      label: '警告',
      value: statistics?.warningCount || 0,
      color: '#fbbf24',
    },
    {
      icon: CircleAlert,
      label: '错误',
      value: statistics?.errorCount || 0,
      color: '#f87171',
    },
  ];

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', paddingBottom: '60px' }}>
      {/* Header */}
      <View style={{ padding: '48px 20px 20px', backgroundColor: '#111827', borderBottom: '1px solid #1e3a5f' }}>
        <View style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', display: 'block' }}>审计日志</Text>
            <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginTop: '2px' }}>系统操作记录</Text>
          </View>
          <View onClick={() => { loadStatistics(); loadLogs(true); }} style={{ padding: '8px' }}>
            <RefreshCw size={20} color={loading ? '#64748b' : '#38bdf8'} />
          </View>
        </View>
      </View>

      <ScrollView scrollY style={{ height: 'calc(100vh - 120px)' }}>
        <View style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 统计卡片 */}
          <View style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {statCards.map((card, index) => (
              <View
                key={index}
                style={{
                  backgroundColor: '#111827',
                  border: '1px solid #1e3a5f',
                  borderRadius: '12px',
                  padding: '12px',
                  textAlign: 'center',
                }}
              >
                <View style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                  <card.icon size={18} color={card.color} />
                </View>
                <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', display: 'block' }}>{card.value}</Text>
                <Text style={{ fontSize: '11px', color: '#71717a', display: 'block', marginTop: '2px' }}>{card.label}</Text>
              </View>
            ))}
          </View>

          {/* 筛选器 */}
          <View style={{
            backgroundColor: '#111827',
            border: '1px solid #1e3a5f',
            borderRadius: '12px',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
          >
            <FileText size={18} color="#38bdf8" />
            <View style={{ display: 'flex', gap: '12px', flex: 1 }}>
              <Picker
                mode="selector"
                range={moduleOptions}
                onChange={(e) => setFilterModule(moduleOptions[e.detail.value] === '全部模块' ? '' : moduleOptions[e.detail.value])}
              >
                <View style={{
                  padding: '8px 12px',
                  backgroundColor: '#1e293b',
                  borderRadius: '8px',
                  border: filterModule ? '1px solid #38bdf8' : '1px solid #1e3a5f',
                }}
                >
                  <Text style={{ fontSize: '13px', color: filterModule ? '#38bdf8' : '#94a3b8' }}>
                    {filterModule || '全部模块'}
                  </Text>
                </View>
              </Picker>

              <Picker
                mode="selector"
                range={levelOptions}
                onChange={(e) => setFilterLevel(levelOptions[e.detail.value] === '全部级别' ? '' : levelOptions[e.detail.value])}
              >
                <View style={{
                  padding: '8px 12px',
                  backgroundColor: '#1e293b',
                  borderRadius: '8px',
                  border: filterLevel ? '1px solid #38bdf8' : '1px solid #1e3a5f',
                }}
                >
                  <Text style={{ fontSize: '13px', color: filterLevel ? '#38bdf8' : '#94a3b8' }}>
                    {filterLevel || '全部级别'}
                  </Text>
                </View>
              </Picker>
            </View>
          </View>

          {/* 日志列表 */}
          {logs.length === 0 && !loading ? (
            <View style={{
              padding: '60px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
            >
              <FileText size={64} color="#71717a" />
              <Text style={{ fontSize: '15px', color: '#64748b', display: 'block', marginTop: '16px' }}>暂无日志</Text>
            </View>
          ) : (
            logs.map((log) => {
              const LevelIcon = getLevelIcon(log.level);
              return (
                <View
                  key={log.id}
                  style={{
                    backgroundColor: '#111827',
                    border: '1px solid #1e3a5f',
                    borderRadius: '12px',
                    padding: '16px',
                  }}
                >
                  <View style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <View style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      backgroundColor: `${getLevelColor(log.level)}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                    >
                      <LevelIcon size={18} color={getLevelColor(log.level)} />
                    </View>

                    <View style={{ flex: 1, minWidth: 0 }}>
                      <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <Text style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff', display: 'block' }}>{log.action}</Text>
                        <Text style={{ fontSize: '12px', color: '#64748b' }}>
                          {formatDate(log.createdAt)}
                        </Text>
                      </View>

                      <View style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                        <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <User size={14} color="#71717a" />
                          <Text style={{ fontSize: '12px', color: '#94a3b8' }}>{log.userName || '系统'}</Text>
                        </View>
                        <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Activity size={14} color="#71717a" />
                          <Text style={{ fontSize: '12px', color: '#94a3b8' }}>{log.module}</Text>
                        </View>
                      </View>

                      {log.details && (
                        <Text style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
                          {log.details}
                        </Text>
                      )}

                      {log.ip && (
                        <Text style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                          IP: {log.ip}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              );
            })
          )}

          {loading && (
            <View style={{ padding: '40px 0', display: 'flex', justifyContent: 'center' }}>
              <RefreshCw size={32} color="#38bdf8" />
            </View>
          )}

          {!loading && hasMore && (
            <View
              style={{ padding: '16px 0', textAlign: 'center' }}
              onClick={() => loadLogs()}
            >
              <Text style={{ fontSize: '13px', color: '#64748b' }}>加载更多</Text>
            </View>
          )}

          {!loading && !hasMore && logs.length > 0 && (
            <View style={{ padding: '16px 0', textAlign: 'center' }}>
              <Text style={{ fontSize: '13px', color: '#64748b' }}>没有更多日志了</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
