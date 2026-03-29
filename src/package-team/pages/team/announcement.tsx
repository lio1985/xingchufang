import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/components';
import { Network } from '@/network';
import {
  ArrowLeft,
  Megaphone,
  Plus,
  Calendar,
  User,
  ChevronRight,
} from 'lucide-react-taro';

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
  created_at: string;
  author?: {
    nickname: string;
    avatar_url?: string;
  };
  is_read?: boolean;
}

export default function TeamAnnouncement() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLeader, setIsLeader] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
    checkLeaderStatus();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await Network.request({
        url: '/api/teams/my/announcements',
        method: 'GET',
      });
      if (res.data?.code === 200 && res.data?.data) {
        setAnnouncements(res.data.data);
      } else {
        // 后端未返回数据时设置为空数组
        setAnnouncements([]);
      }
    } catch (error) {
      console.error('获取公告失败:', error);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const checkLeaderStatus = async () => {
    try {
      const user = Taro.getStorageSync('user');
      // 检查是否是队长
      const res = await Network.request({
        url: '/api/teams/my/members',
        method: 'GET',
      });
      if (res.data?.code === 200) {
        const myInfo = res.data.data?.find((m: any) => m.user_id === user?.id);
        setIsLeader(myInfo?.role === 'leader');
      }
    } catch (error) {
      console.error('检查权限失败:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 86400000) {
      return '今天';
    } else if (diff < 172800000) {
      return '昨天';
    } else {
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'high':
        return { color: '#f43f5e', bgColor: 'rgba(244, 63, 94, 0.15)', text: '重要' };
      case 'medium':
        return { color: '#fbbf24', bgColor: 'rgba(251, 191, 36, 0.15)', text: '普通' };
      default:
        return { color: '#64748b', bgColor: 'rgba(100, 116, 139, 0.15)', text: '通知' };
    }
  };

  const handleCreateAnnouncement = () => {
    Taro.showToast({ title: '功能开发中', icon: 'none' });
  };

  const handleViewDetail = (announcement: Announcement) => {
    Taro.showModal({
      title: announcement.title,
      content: announcement.content,
      showCancel: false,
      confirmText: '知道了',
    });
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a' }}>
      {/* Header */}
      <View style={{ padding: '48px 20px 20px', backgroundColor: '#111827', borderBottom: '1px solid #1e3a5f' }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ display: 'flex', alignItems: 'center' }}>
            <View
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px',
              }}
              onClick={() => Taro.navigateBack()}
            >
              <ArrowLeft size={20} color="#ffffff" />
            </View>
            <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>团队公告</Text>
          </View>
          {isLeader && (
            <View
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 14px',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                borderRadius: '20px',
              }}
              onClick={handleCreateAnnouncement}
            >
              <Plus size={16} color="#38bdf8" />
              <Text style={{ fontSize: '13px', color: '#38bdf8' }}>发布公告</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView scrollY style={{ flex: 1, padding: '16px 20px' }}>
        {loading ? (
          <View style={{ textAlign: 'center', padding: '40px' }}>
            <Text style={{ color: '#64748b' }}>加载中...</Text>
          </View>
        ) : announcements.length === 0 ? (
          <View style={{
            backgroundColor: '#111827',
            borderRadius: '16px',
            padding: '40px 20px',
            textAlign: 'center',
            border: '1px solid #1e3a5f',
          }}
          >
            <View style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
            >
              <Megaphone size={32} color="#38bdf8" />
            </View>
            <Text style={{ fontSize: '16px', color: '#ffffff', marginBottom: '8px', display: 'block' }}>暂无公告</Text>
            <Text style={{ fontSize: '13px', color: '#64748b', display: 'block' }}>团队公告将在这里显示</Text>
          </View>
        ) : (
          <View style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {announcements.map((item) => {
              const priorityStyle = getPriorityStyle(item.priority);
              return (
                <View
                  key={item.id}
                  style={{
                    backgroundColor: '#111827',
                    borderRadius: '12px',
                    border: '1px solid #1e3a5f',
                    overflow: 'hidden',
                  }}
                  onClick={() => handleViewDetail(item)}
                >
                  {/* 未读指示器 */}
                  {!item.is_read && (
                    <View style={{ height: '3px', background: 'linear-gradient(90deg, #38bdf8, #8b5cf6)' }} />
                  )}
                  
                  <View style={{ padding: '16px' }}>
                    {/* 标题行 */}
                    <View style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <View style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <View style={{
                          padding: '3px 8px',
                          backgroundColor: priorityStyle.bgColor,
                          borderRadius: '4px',
                        }}
                        >
                          <Text style={{ fontSize: '11px', color: priorityStyle.color }}>{priorityStyle.text}</Text>
                        </View>
                        <Text style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#ffffff',
                          display: 'block',
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        >
                          {item.title}
                        </Text>
                      </View>
                      <ChevronRight size={18} color="#64748b" />
                    </View>

                    {/* 内容预览 */}
                    <Text style={{
                      fontSize: '14px',
                      color: '#94a3b8',
                      display: 'block',
                      marginBottom: '12px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    >
                      {item.content}
                    </Text>

                    {/* 底部信息 */}
                    <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={12} color="#64748b" />
                        <Text style={{ fontSize: '12px', color: '#64748b' }}>{item.author?.nickname || '管理员'}</Text>
                      </View>
                      <View style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={12} color="#64748b" />
                        <Text style={{ fontSize: '12px', color: '#64748b' }}>{formatDate(item.created_at)}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
