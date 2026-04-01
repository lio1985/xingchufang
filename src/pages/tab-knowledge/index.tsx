import { View, Text } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useState, useEffect, useCallback } from 'react';
import {
  Heart,
  Building2,
  MessageSquareText,
  GraduationCap,
  Search,
  Play,
  BookOpen,
} from 'lucide-react-taro';
import { Network } from '@/network';
import CustomTabBar from '@/custom-tab-bar';

interface LearningRecord {
  id: string;
  course_id: string;
  progress: number;
  status: string;
  time_spent: number;
  last_position: number;
  updated_at: string;
  course: {
    id: string;
    title: string;
    cover_image: string | null;
    duration: number;
    category?: {
      id: string;
      name: string;
    };
  };
}

const TabKnowledgePage = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [learningRecords, setLearningRecords] = useState<LearningRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // 获取学习记录
  const fetchLearningRecords = useCallback(async () => {
    try {
      const token = Taro.getStorageSync('token');
      if (!token) return;
      
      setLoading(true);
      const res = await Network.request({
        url: '/api/course/user/learnings',
        method: 'GET',
        data: { limit: 5 },
      });

      if (res.data?.code === 200 && res.data?.data?.list) {
        setLearningRecords(res.data.data.list);
      }
    } catch (error) {
      console.error('获取学习记录失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始化用户信息
  useEffect(() => {
    try {
      const user = Taro.getStorageSync('user');
      const token = Taro.getStorageSync('token');
      if (user && token) {
        setIsLoggedIn(true);
        setUserRole(user.role || 'guest');
      }
    } catch (e) {
      console.log('获取用户信息失败');
    }
  }, []);

  // 登录状态变化时获取学习记录
  useEffect(() => {
    if (isLoggedIn) {
      fetchLearningRecords();
    }
  }, [isLoggedIn, fetchLearningRecords]);

  // 监听页面显示，刷新用户信息 - 使用 useEffect 替代 useDidShow 以支持 H5
  useEffect(() => {
    const refreshUserInfo = () => {
      try {
        const user = Taro.getStorageSync('user');
        const token = Taro.getStorageSync('token');
        if (user && token) {
          setIsLoggedIn(true);
          setUserRole(user.role || 'guest');
        } else {
          setIsLoggedIn(false);
          setUserRole(null);
        }
      } catch (e) {
        console.log('刷新用户信息失败');
      }
    };

    // H5 环境使用 visibilitychange 事件
    if (typeof document !== 'undefined') {
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          refreshUserInfo();
          fetchLearningRecords();
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [fetchLearningRecords]);

  // 页面显示时刷新 TabBar
  useDidShow(() => {
    Taro.eventCenter.trigger('tabBarRefresh');
    fetchLearningRecords();
  });

  // 判断是否有权限查看公司资料（员工及以上权限）
  const canViewCompanyData = isLoggedIn && userRole && ['employee', 'team_leader', 'admin'].includes(userRole);

  const handleNav = (path: string) => {
    Taro.navigateTo({ url: path });
  };

  // 格式化时间
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}分钟`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}小时${mins}分` : `${hours}小时`;
  };

  // 获取状态显示
  const getStatusText = (status: string, progress: number) => {
    if (status === 'completed') return '已完成';
    if (status === 'in_progress') return `学习进度 ${progress}%`;
    return '未开始';
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', paddingBottom: '60px' }}>
      {/* 页面头部 */}
      <View style={{ padding: '48px 20px 24px', backgroundColor: '#111827' }}>
        <Text style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff', display: 'block' }}>知识库</Text>
        <Text style={{ fontSize: '14px', color: '#71717a', display: 'block', marginTop: '8px' }}>企业知识沉淀与复用</Text>
      </View>

      {/* 搜索栏 */}
      <View style={{ padding: '0 20px', marginTop: '-16px' }}>
        <View 
          style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center' }}
          onClick={() => Taro.showToast({ title: '搜索功能开发中', icon: 'none' })}
        >
          <Search size={18} color="#71717a" />
          <Text style={{ marginLeft: '8px', fontSize: '14px', color: '#71717a' }}>搜索知识库内容...</Text>
        </View>
      </View>

      {/* 知识分类 */}
      <View style={{ padding: '24px 20px 0' }}>
        <Text style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '12px', fontWeight: '500' }}>知识分类</Text>
        <View style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <View
            style={{ width: 'calc(50% - 6px)', backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            onClick={() => handleNav('/package-content/pages/favorite-list/index')}
          >
            <View style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Heart size={20} color="#f87171" />
            </View>
            <Text style={{ fontSize: '16px', fontWeight: '500', color: '#ffffff', display: 'block', marginTop: '8px' }}>个人收藏</Text>
            <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>我的收藏内容</Text>
          </View>

          {/* 公司资料 - 仅员工及以上权限可见 */}
          {canViewCompanyData && (
            <View
              style={{ width: 'calc(50% - 6px)', backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              onClick={() => handleNav('/package-knowledge/pages/knowledge-share/index')}
            >
              <View style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(168, 85, 247, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={20} color="#a855f7" />
              </View>
              <Text style={{ fontSize: '16px', fontWeight: '500', color: '#ffffff', display: 'block', marginTop: '8px' }}>公司资料</Text>
              <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>企业知识库</Text>
            </View>
          )}

          {/* 个人语料 - 根据公司资料是否显示调整位置 */}
          <View
            style={{ width: canViewCompanyData ? 'calc(50% - 6px)' : 'calc(50% - 6px)', backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            onClick={() => handleNav('/package-content/pages/lexicon-system/index')}
          >
            <View style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquareText size={20} color="#38bdf8" />
            </View>
            <Text style={{ fontSize: '16px', fontWeight: '500', color: '#ffffff', display: 'block', marginTop: '8px' }}>个人语料</Text>
            <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>个人表达风格</Text>
          </View>

          <View
            style={{ width: 'calc(50% - 6px)', backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            onClick={() => handleNav('/package-content/pages/news/index')}
          >
            <View style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(6, 182, 212, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={20} color="#06b6d4" />
            </View>
            <Text style={{ fontSize: '16px', fontWeight: '500', color: '#ffffff', display: 'block', marginTop: '8px' }}>课程培训</Text>
            <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>学习与培训</Text>
          </View>
        </View>
      </View>

      {/* 最近学习 */}
      <View style={{ padding: '24px 20px 0' }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <Text style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>最近学习</Text>
          <Text 
            style={{ fontSize: '12px', color: '#38bdf8' }}
            onClick={() => handleNav('/package-content/pages/news/index')}
          >
            查看全部
          </Text>
        </View>
        
        <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', overflow: 'hidden' }}>
          {loading ? (
            <View style={{ padding: '24px', textAlign: 'center' }}>
              <Text style={{ fontSize: '14px', color: '#71717a' }}>加载中...</Text>
            </View>
          ) : !isLoggedIn ? (
            <View style={{ padding: '24px', textAlign: 'center' }}>
              <BookOpen size={32} color="#64748b" style={{ display: 'block', margin: '0 auto 12px' }} />
              <Text style={{ fontSize: '14px', color: '#71717a' }}>登录后查看学习记录</Text>
            </View>
          ) : learningRecords.length === 0 ? (
            <View style={{ padding: '24px', textAlign: 'center' }}>
              <BookOpen size={32} color="#64748b" style={{ display: 'block', margin: '0 auto 12px' }} />
              <Text style={{ fontSize: '14px', color: '#71717a' }}>暂无学习记录</Text>
              <Text style={{ fontSize: '12px', color: '#64748b', display: 'block', marginTop: '4px' }}>开始学习课程吧</Text>
            </View>
          ) : (
            learningRecords.map((record, index) => (
              <View
                key={record.id}
                style={{ padding: '16px', borderBottom: index < learningRecords.length - 1 ? '1px solid #1e3a5f' : 'none' }}
                onClick={() => handleNav(`/pages/course-detail/index?id=${record.course_id}`)}
              >
                <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: '16px', color: '#ffffff', fontWeight: '500', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {record.course?.title || '未知课程'}
                  </Text>
                  <View style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                    <Play size={14} color={record.status === 'completed' ? '#22c55e' : '#38bdf8'} />
                    <Text style={{ fontSize: '12px', color: record.status === 'completed' ? '#22c55e' : '#38bdf8', marginLeft: '4px' }}>
                      {record.status === 'completed' ? '已完成' : '继续'}
                    </Text>
                  </View>
                </View>
                <View style={{ height: '4px', backgroundColor: '#1e3a5f', borderRadius: '2px', marginTop: '12px', overflow: 'hidden' }}>
                  <View style={{ height: '100%', width: `${record.progress || 0}%`, backgroundColor: record.status === 'completed' ? '#22c55e' : '#38bdf8', borderRadius: '2px' }} />
                </View>
                <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '8px' }}>
                  {getStatusText(record.status, record.progress)}
                  {record.time_spent > 0 && ` · 已学习 ${formatDuration(record.time_spent)}`}
                </Text>
              </View>
            ))
          )}
        </View>
      </View>
      <CustomTabBar />
    </View>
  );
};

export default TabKnowledgePage;
