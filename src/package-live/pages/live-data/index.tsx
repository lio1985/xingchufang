import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Network } from '@/network';
import {
  ChevronLeft,
  ChevronRight,
  Radio,
  Upload,
  ChartBar,
  ChartArea,
  TrendingUp,
  Eye,
  Heart,
  ShoppingCart,
  Clock,
  RefreshCw,
  FileUp,
  ImagePlus,
  ClipboardList,
  Users,
} from 'lucide-react-taro';

interface LiveStats {
  totalStreams: number;
  totalGMV: number;
  totalOrders: number;
  totalViews: number;
  avgOnline: number;
  newFollowers: number;
  interactionRate: number;
  conversionRate: number;
}

interface RecentStream {
  id: string;
  title: string;
  startTime: string;
  totalViews: number;
  gmv: number;
  ordersCount: number;
  durationSeconds: number;
}

interface UserInfo {
  id: string;
  nickname: string;
  avatar_url?: string;
  role: string;
  status: string;
}

export default function LiveDataPage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'stats' | 'analysis'>('stats');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<LiveStats | null>(null);
  const [recentStreams, setRecentStreams] = useState<RecentStream[]>([]);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // 检查是否为管理员
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const token = Taro.getStorageSync('token');
        if (!token) return;

        const res = await Network.request({
          url: '/api/user/profile',
          method: 'GET',
        });

        if (res.data?.data?.role === 'admin') {
          setIsAdmin(true);
          loadUsers();
        }
      } catch (error) {
        console.error('检查管理员权限失败:', error);
      }
    };
    checkAdmin();
  }, []);

  // 加载用户列表
  const loadUsers = async () => {
    try {
      const res = await Network.request({
        url: '/api/user/list',
        method: 'GET',
        data: { limit: 100 },
      });

      if (res.data?.data?.list) {
        setUsers(res.data.data.list);
      }
    } catch (error) {
      console.error('加载用户列表失败:', error);
    }
  };

  const loadStats = async () => {
    setLoading(true);
    try {
      const url = isAdmin
        ? '/api/live-data/admin/stats'
        : '/api/live-data/dashboard';
      const params: any = {};
      if (selectedUserId) {
        params.userId = selectedUserId;
      }

      const res = await Network.request({
        url,
        method: 'GET',
        data: params,
      });

      if (res.data?.success && res.data.data) {
        setStats(res.data.data);
      }
    } catch (error) {
      console.error('加载统计数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentStreams = async () => {
    try {
      const url = isAdmin
        ? '/api/live-data/admin/all'
        : '/api/live-data/list';
      const params: any = { page: 1, limit: 5 };
      if (selectedUserId) {
        params.userId = selectedUserId;
      }

      const res = await Network.request({
        url,
        method: 'GET',
        data: params,
      });

      if (res.data?.success && res.data.data) {
        setRecentStreams(res.data.data.list || []);
      }
    } catch (error) {
      console.error('加载直播列表失败:', error);
    }
  };

  useEffect(() => {
    loadStats();
    loadRecentStreams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserId, isAdmin]);

  const handleRefresh = async () => {
    await Promise.all([loadStats(), loadRecentStreams()]);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}小时${minutes}分` : `${minutes}分钟`;
  };

  const getSelectedUserName = () => {
    if (!selectedUserId) return '全部用户';
    const user = users.find(u => u.id === selectedUserId);
    return user?.nickname || '未知用户';
  };

  const renderUploadTab = () => (
    <View style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 上传方式卡片 */}
      <View
        style={{
          backgroundColor: '#111827',
          border: '1px solid #1e3a5f',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
        onClick={() => {
          console.log('Navigate to import page');
          Taro.navigateTo({ url: '/package-live/pages/live-data/import' });
        }}
      >
        <View
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'rgba(244, 63, 94, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FileUp size={24} color="#f43f5e" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff', display: 'block' }}>手动填写</Text>
          <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginTop: '2px' }}>逐条输入直播数据</Text>
        </View>
        <ChevronRight size={18} color="#64748b" />
      </View>

      <View
        style={{
          backgroundColor: '#111827',
          border: '1px solid #1e3a5f',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
        onClick={() => {
          console.log('Navigate to import page (excel)');
          Taro.navigateTo({ url: '/package-live/pages/live-data/import?method=excel' });
        }}
      >
        <View
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'rgba(74, 222, 128, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Upload size={24} color="#4ade80" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff', display: 'block' }}>Excel导入</Text>
          <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginTop: '2px' }}>批量上传数据表格</Text>
        </View>
        <ChevronRight size={18} color="#64748b" />
      </View>

      <View
        style={{
          backgroundColor: '#111827',
          border: '1px solid #1e3a5f',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
        onClick={() => {
          console.log('Navigate to import page (screenshot)');
          Taro.navigateTo({ url: '/package-live/pages/live-data/import?method=screenshot' });
        }}
      >
        <View
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'rgba(96, 165, 250, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ImagePlus size={24} color="#60a5fa" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff', display: 'block' }}>截图识别</Text>
          <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginTop: '2px' }}>识别复盘截图信息</Text>
        </View>
        <ChevronRight size={18} color="#64748b" />
      </View>

      {/* 数据模板下载 */}
      <View
        style={{
          backgroundColor: '#111827',
          border: '1px solid #1e3a5f',
          borderRadius: '12px',
          padding: '16px',
        }}
      >
        <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <ClipboardList size={18} color="#38bdf8" />
          <Text style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9' }}>数据模板</Text>
        </View>
        <Text style={{ fontSize: '13px', color: '#71717a' }}>下载Excel模板，按格式填写后上传</Text>
      </View>
    </View>
  );

  const renderStatsTab = () => (
    <View style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 核心指标 */}
      <View style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {[
          { icon: Radio, label: '直播场次', value: stats?.totalStreams || 0, color: '#f43f5e' },
          { icon: ShoppingCart, label: '总GMV', value: `¥${((stats?.totalGMV || 0) / 10000).toFixed(1)}万`, color: '#4ade80' },
          { icon: Eye, label: '总观看', value: stats?.totalViews || 0, color: '#60a5fa' },
          { icon: Heart, label: '新增粉丝', value: stats?.newFollowers || 0, color: '#f87171' },
        ].map((item, index) => (
          <View
            key={index}
            style={{
              backgroundColor: '#111827',
              border: '1px solid #1e3a5f',
              borderRadius: '12px',
              padding: '16px',
            }}
          >
            <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <item.icon size={16} color={item.color} />
              <Text style={{ fontSize: '13px', color: '#71717a' }}>{item.label}</Text>
            </View>
            <Text style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff' }}>{item.value}</Text>
          </View>
        ))}
      </View>

      {/* 转化指标 */}
      <View
        style={{
          backgroundColor: '#111827',
          border: '1px solid #1e3a5f',
          borderRadius: '12px',
          padding: '16px',
        }}
      >
        <Text style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9', marginBottom: '16px', display: 'block' }}>转化指标</Text>

        <View style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <View>
            <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <Text style={{ fontSize: '13px', color: '#71717a' }}>互动率</Text>
              <Text style={{ fontSize: '13px', color: '#f1f5f9' }}>{(stats?.interactionRate || 0).toFixed(1)}%</Text>
            </View>
            <View style={{ width: '100%', height: '6px', borderRadius: '3px', backgroundColor: '#1e3a5f', overflow: 'hidden' }}>
              <View style={{ width: `${Math.min(stats?.interactionRate || 0, 100)}%`, height: '100%', backgroundColor: '#f43f5e', borderRadius: '3px' }} />
            </View>
          </View>

          <View>
            <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <Text style={{ fontSize: '13px', color: '#71717a' }}>转化率</Text>
              <Text style={{ fontSize: '13px', color: '#f1f5f9' }}>{(stats?.conversionRate || 0).toFixed(1)}%</Text>
            </View>
            <View style={{ width: '100%', height: '6px', borderRadius: '3px', backgroundColor: '#1e3a5f', overflow: 'hidden' }}>
              <View style={{ width: `${Math.min(stats?.conversionRate || 0, 100)}%`, height: '100%', backgroundColor: '#4ade80', borderRadius: '3px' }} />
            </View>
          </View>
        </View>
      </View>

      {/* 最近直播 */}
      <View
        style={{
          backgroundColor: '#111827',
          border: '1px solid #1e3a5f',
          borderRadius: '12px',
          padding: '16px',
        }}
      >
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <Text style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9' }}>最近直播</Text>
          <Text
            style={{ fontSize: '13px', color: '#38bdf8' }}
            onClick={() => Taro.navigateTo({ url: '/package-live/pages/live-data/list' })}
          >
            查看全部
          </Text>
        </View>

        {recentStreams.length > 0 ? (
          recentStreams.map((stream) => (
            <View
              key={stream.id}
              style={{
                backgroundColor: '#0f172a',
                borderRadius: '12px',
                padding: '12px',
                marginBottom: '8px',
              }}
              onClick={() => Taro.navigateTo({ url: `/pages/live-data/detail?id=${stream.id}` })}
            >
              <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Text style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff' }}>{stream.title}</Text>
                <Text style={{ fontSize: '12px', color: '#64748b' }}>{formatDate(stream.startTime)}</Text>
              </View>
              <View style={{ display: 'flex', gap: '16px' }}>
                <Text style={{ fontSize: '12px', color: '#94a3b8' }}>观看: {stream.totalViews}</Text>
                <Text style={{ fontSize: '12px', color: '#4ade80' }}>GMV: ¥{(stream.gmv / 100).toFixed(0)}</Text>
                <Text style={{ fontSize: '12px', color: '#64748b' }}>{formatDuration(stream.durationSeconds)}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={{ padding: '20px 0', textAlign: 'center' }}>
            <Text style={{ fontSize: '13px', color: '#64748b' }}>暂无直播数据</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderAnalysisTab = () => (
    <View style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 分析功能 */}
      <View
        style={{
          backgroundColor: '#111827',
          border: '1px solid #1e3a5f',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
        onClick={() => Taro.navigateTo({ url: '/package-live/pages/live-data/analysis' })}
      >
        <View
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'rgba(168, 85, 247, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChartArea size={24} color="#a855f7" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff', display: 'block' }}>复盘分析</Text>
          <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginTop: '2px' }}>深度分析直播数据，输出专业报告</Text>
        </View>
        <ChevronRight size={18} color="#64748b" />
      </View>

      {/* 数据对比 */}
      <View
        style={{
          backgroundColor: '#111827',
          border: '1px solid #1e3a5f',
          borderRadius: '12px',
          padding: '16px',
        }}
      >
        <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <ChartBar size={18} color="#38bdf8" />
          <Text style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9' }}>数据对比</Text>
        </View>

        <View style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <View
            style={{
              backgroundColor: '#0f172a',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: '14px', color: '#f1f5f9' }}>本场 vs 上场</Text>
            <Text style={{ fontSize: '13px', color: '#38bdf8' }}>进入对比</Text>
          </View>

          <View
            style={{
              backgroundColor: '#0f172a',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: '14px', color: '#f1f5f9' }}>本周 vs 上周</Text>
            <Text style={{ fontSize: '13px', color: '#38bdf8' }}>进入对比</Text>
          </View>
        </View>
      </View>

      {/* 趋势分析 */}
      <View
        style={{
          backgroundColor: '#111827',
          border: '1px solid #1e3a5f',
          borderRadius: '12px',
          padding: '16px',
        }}
      >
        <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <TrendingUp size={18} color="#38bdf8" />
          <Text style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9' }}>趋势分析</Text>
        </View>

        <Text style={{ fontSize: '13px', color: '#71717a' }}>查看GMV、观看人数、转化率等关键指标的历史趋势</Text>
      </View>

      {/* 时段分析 */}
      <View
        style={{
          backgroundColor: '#111827',
          border: '1px solid #1e3a5f',
          borderRadius: '12px',
          padding: '16px',
        }}
      >
        <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Clock size={18} color="#38bdf8" />
          <Text style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9' }}>时段分析</Text>
        </View>

        <Text style={{ fontSize: '13px', color: '#71717a' }}>分析不同时段的直播表现，找到最佳开播时间</Text>
      </View>
    </View>
  );

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', paddingBottom: '60px' }}>
      {/* Header */}
      <View style={{ padding: '48px 20px 20px', backgroundColor: '#111827', borderBottom: '1px solid #1e3a5f' }}>
        <View style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
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
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', display: 'block' }}>直播数据</Text>
            <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginTop: '2px' }}>直播数据分析与管理</Text>
          </View>
          <View onClick={handleRefresh} style={{ padding: '8px' }}>
            <RefreshCw size={20} color={loading ? '#64748b' : '#38bdf8'} />
          </View>
        </View>

        {/* 用户筛选（仅管理员可见） */}
        {isAdmin && (
          <View
            style={{
              backgroundColor: '#1e293b',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
            onClick={() => setShowUserPicker(!showUserPicker)}
          >
            <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={16} color="#38bdf8" />
              <Text style={{ fontSize: '14px', color: '#f1f5f9' }}>{getSelectedUserName()}</Text>
            </View>
            <ChevronRight size={16} color="#64748b" />
          </View>
        )}

        {/* 用户选择器弹窗 */}
        {showUserPicker && (
          <View
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 999,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              paddingTop: '140px',
            }}
            onClick={() => setShowUserPicker(false)}
          >
            <View
              style={{
                backgroundColor: '#1e293b',
                borderRadius: '12px',
                width: '90%',
                maxWidth: '400px',
                maxHeight: '300px',
                overflow: 'hidden',
                zIndex: 1000,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <ScrollView scrollY style={{ maxHeight: '280px' }}>
                <View
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid #1e3a5f',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    backgroundColor: !selectedUserId ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                  }}
                  onClick={() => {
                    setSelectedUserId('');
                    setShowUserPicker(false);
                  }}
                >
                  <Users size={18} color={!selectedUserId ? '#38bdf8' : '#71717a'} />
                  <Text style={{ fontSize: '14px', color: !selectedUserId ? '#38bdf8' : '#f1f5f9', fontWeight: !selectedUserId ? '600' : '400' }}>
                    全部用户
                  </Text>
                </View>
                {users.map((user) => (
                  <View
                    key={user.id}
                    style={{
                      padding: '14px 16px',
                      borderBottom: '1px solid #1e3a5f',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      backgroundColor: selectedUserId === user.id ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                    }}
                    onClick={() => {
                      setSelectedUserId(user.id);
                      setShowUserPicker(false);
                    }}
                  >
                    <View style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#1e3a5f',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                    >
                      {user.avatar_url ? (
                        <View style={{ width: '100%', height: '100%', backgroundColor: '#38bdf8' }} />
                      ) : (
                        <Text style={{ fontSize: '14px', color: '#f1f5f9' }}>{(user.nickname || 'U')[0]}</Text>
                      )}
                    </View>
                    <Text style={{
                      fontSize: '14px',
                      color: selectedUserId === user.id ? '#38bdf8' : '#f1f5f9',
                      fontWeight: selectedUserId === user.id ? '600' : '400',
                    }}
                    >
                      {user.nickname || '未命名用户'}
                    </Text>
                    <Text style={{ fontSize: '12px', color: '#71717a', marginLeft: 'auto' }}>
                      {user.role === 'admin' ? '管理员' : '用户'}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        {/* Tab 切换 */}
        <View style={{ display: 'flex', gap: '8px', marginTop: isAdmin ? '12px' : '0' }}>
          {[
            { key: 'upload', label: '上传数据', icon: Upload },
            { key: 'stats', label: '数据统计', icon: ChartBar },
            { key: 'analysis', label: '数据分析', icon: ChartArea },
          ].map((tab) => (
            <View
              key={tab.key}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '12px',
                backgroundColor: activeTab === tab.key ? '#38bdf8' : '#1e293b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
              hoverClass="bg-opacity-80"
              onClick={() => {
                console.log('Tab clicked:', tab.key);
                setActiveTab(tab.key as typeof activeTab);
              }}
            >
              <tab.icon size={16} color={activeTab === tab.key ? '#000' : '#71717a'} />
              <Text style={{ fontSize: '14px', fontWeight: '600', color: activeTab === tab.key ? '#000' : '#64748b' }}>{tab.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView scrollY style={{ height: isAdmin ? 'calc(100vh - 220px)' : 'calc(100vh - 180px)' }}>
        {activeTab === 'upload' && renderUploadTab()}
        {activeTab === 'stats' && renderStatsTab()}
        {activeTab === 'analysis' && renderAnalysisTab()}
        <View style={{ height: '20px' }} />
      </ScrollView>
    </View>
  );
}
