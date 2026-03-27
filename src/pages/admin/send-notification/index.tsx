import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Textarea, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  Bell,
  Sparkles,
  Gift,
  Globe,
  User,
  Users,
  Send,
  ChevronLeft,
  CircleCheck,
  Search,
  X,
  RefreshCw,
  Check,
} from 'lucide-react-taro';
import { Network } from '@/network';
import '@/styles/pages.css';
import '@/styles/admin.css';

type NotificationType = 'system' | 'activity' | 'update';
type TargetType = 'all' | 'team' | 'user';

interface Team {
  id: string;
  name: string;
  description?: string;
  memberCount?: number;
}

interface UserItem {
  id: string;
  nickname?: string;
  employee_id?: string;
  status: string;
}

const notificationTypes = [
  {
    value: 'system' as const,
    label: '系统通知',
    desc: '重要系统公告',
    icon: Bell,
    iconColor: '#60a5fa',
    bgColor: 'rgba(96, 165, 250, 0.15)',
  },
  {
    value: 'activity' as const,
    label: '活动通知',
    desc: '推广活动信息',
    icon: Sparkles,
    iconColor: '#ec4899',
    bgColor: 'rgba(236, 72, 153, 0.15)',
  },
  {
    value: 'update' as const,
    label: '更新通知',
    desc: '版本更新说明',
    icon: Gift,
    iconColor: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
  },
];

const targetTypes = [
  {
    value: 'all' as const,
    label: '全部用户',
    desc: '发送给所有用户',
    icon: Globe,
    iconColor: '#4ade80',
    bgColor: 'rgba(74, 222, 128, 0.15)',
  },
  {
    value: 'team' as const,
    label: '选择团队',
    desc: '发送给团队',
    icon: Users,
    iconColor: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
  },
  {
    value: 'user' as const,
    label: '选择用户',
    desc: '发送给特定用户',
    icon: User,
    iconColor: '#a855f7',
    bgColor: 'rgba(168, 85, 247, 0.15)',
  },
];

const SendNotificationPage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<NotificationType>('system');
  const [targetType, setTargetType] = useState<TargetType>('all');
  const [sending, setSending] = useState(false);

  // 团队选择相关
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);

  // 用户选择相关
  const [userSearchKeyword, setUserSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<UserItem[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserItem[]>([]);
  const [searching, setSearching] = useState(false);

  // 加载团队列表
  useEffect(() => {
    if (targetType === 'team') {
      loadTeams();
    }
  }, [targetType]);

  const loadTeams = async () => {
    setLoadingTeams(true);
    try {
      const res = await Network.request({
        url: '/api/teams',
        method: 'GET',
      });

      if (res.data?.code === 200 && res.data?.data) {
        // 处理不同的响应格式
        const teamList = Array.isArray(res.data.data)
          ? res.data.data
          : res.data.data.data || [];
        setTeams(teamList);
      }
    } catch (error) {
      console.error('加载团队列表失败:', error);
    } finally {
      setLoadingTeams(false);
    }
  };

  const searchUsers = async () => {
    if (!userSearchKeyword.trim()) {
      Taro.showToast({ title: '请输入搜索关键词', icon: 'none' });
      return;
    }

    setSearching(true);
    try {
      const res = await Network.request({
        url: '/api/admin/users',
        method: 'GET',
        data: {
          search: userSearchKeyword,
          status: 'active',
          page: 1,
          pageSize: 20,
        },
      });

      if (res.data?.code === 200 && res.data?.data) {
        // 过滤掉已选择的用户
        const selectedIds = new Set(selectedUsers.map(u => u.id));
        const filtered = (res.data.data.users || []).filter(
          (u: UserItem) => !selectedIds.has(u.id)
        );
        setSearchResults(filtered);
      }
    } catch (error) {
      console.error('搜索用户失败:', error);
      Taro.showToast({ title: '搜索失败', icon: 'none' });
    } finally {
      setSearching(false);
    }
  };

  const toggleTeamSelection = (teamId: string) => {
    setSelectedTeams(prev =>
      prev.includes(teamId)
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const selectUser = (user: UserItem) => {
    setSelectedUsers(prev => [...prev, user]);
    setSearchResults(prev => prev.filter(u => u.id !== user.id));
  };

  const removeUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handleSend = async () => {
    if (!title.trim()) {
      Taro.showToast({ title: '请输入标题', icon: 'none' });
      return;
    }

    if (!content.trim()) {
      Taro.showToast({ title: '请输入内容', icon: 'none' });
      return;
    }

    if (targetType === 'team' && selectedTeams.length === 0) {
      Taro.showToast({ title: '请选择至少一个团队', icon: 'none' });
      return;
    }

    if (targetType === 'user' && selectedUsers.length === 0) {
      Taro.showToast({ title: '请选择至少一个用户', icon: 'none' });
      return;
    }

    setSending(true);

    try {
      const requestData: any = {
        title: title.trim(),
        content: content.trim(),
        type,
        targetType,
      };

      if (targetType === 'team') {
        requestData.targetTeams = selectedTeams;
      } else if (targetType === 'user') {
        requestData.targetUsers = selectedUsers.map(u => u.id);
      }

      console.log('发送通知请求:', requestData);

      const response = await Network.request({
        url: '/api/notifications/send',
        method: 'POST',
        data: requestData,
      });

      console.log('发送通知响应:', response.data);

      if (response.data?.success || response.data?.code === 200) {
        Taro.showToast({ title: '发送成功', icon: 'success' });
        setTitle('');
        setContent('');
        setSelectedTeams([]);
        setSelectedUsers([]);
        setTargetType('all');
      } else {
        Taro.showToast({ title: response.data?.message || '发送失败', icon: 'none' });
      }
    } catch (error) {
      console.error('发送通知失败:', error);
      Taro.showToast({ title: '发送失败，请重试', icon: 'none' });
    } finally {
      setSending(false);
    }
  };

  const selectedNotificationType = notificationTypes.find(t => t.value === type);
  const selectedTargetType = targetTypes.find(t => t.value === targetType);

  return (
    <View className="admin-page">
      {/* Header */}
      <View className="admin-header">
        <View className="admin-header-content">
          <View className="admin-back-btn" onClick={() => Taro.navigateBack()}>
            <ChevronLeft size={20} color="#38bdf8" />
          </View>
          <Text className="admin-title">发送通知</Text>
          <View style={{ width: '36px' }} />
        </View>
        <Text className="admin-subtitle">向用户推送系统消息和活动资讯</Text>
      </View>

      <ScrollView scrollY style={{ height: 'calc(100vh - 100px)', marginTop: '100px' }}>
        <View className="admin-content" style={{ paddingTop: '16px' }}>
          {/* 通知类型选择 */}
          <View className="admin-card">
            <Text style={{ fontSize: '24px', fontWeight: '600', color: '#f1f5f9', marginBottom: '16px', display: 'block' }}>
              通知类型
            </Text>

            <View style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {notificationTypes.map(item => (
                <View
                  key={item.value}
                  className={`user-list-item ${type === item.value ? 'card-hover' : ''}`}
                  style={{
                    borderLeft: type === item.value ? `4px solid ${item.iconColor}` : undefined,
                  }}
                  onClick={() => setType(item.value)}
                >
                  <View
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '14px',
                      backgroundColor: item.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <item.icon size={28} color={item.iconColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: '26px', fontWeight: '600', color: '#f1f5f9', display: 'block' }}>
                      {item.label}
                    </Text>
                    <Text style={{ fontSize: '20px', color: '#71717a', marginTop: '2px' }}>{item.desc}</Text>
                  </View>
                  {type === item.value && <CircleCheck size={24} color={item.iconColor} />}
                </View>
              ))}
            </View>
          </View>

          {/* 目标用户选择 */}
          <View className="admin-card">
            <Text style={{ fontSize: '24px', fontWeight: '600', color: '#f1f5f9', marginBottom: '16px', display: 'block' }}>
              目标用户
            </Text>

            <View style={{ display: 'flex', gap: '12px' }}>
              {targetTypes.map(item => (
                <View
                  key={item.value}
                  style={{
                    flex: 1,
                    padding: '16px',
                    borderRadius: '14px',
                    backgroundColor: targetType === item.value ? item.bgColor : '#1e293b',
                    border: `2px solid ${targetType === item.value ? item.iconColor : '#1e3a5f'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                  onClick={() => {
                    setTargetType(item.value);
                    setSelectedTeams([]);
                    setSelectedUsers([]);
                  }}
                >
                  <View
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      backgroundColor: targetType === item.value ? item.bgColor : '#1e3a5f',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <item.icon size={24} color={targetType === item.value ? item.iconColor : '#71717a'} />
                  </View>
                  <Text
                    style={{
                      fontSize: '22px',
                      fontWeight: '600',
                      color: targetType === item.value ? item.iconColor : '#94a3b8',
                    }}
                  >
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>

            {/* 团队选择 */}
            {targetType === 'team' && (
              <View style={{ marginTop: '16px' }}>
                <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <Text style={{ fontSize: '22px', color: '#71717a' }}>
                    选择团队 {selectedTeams.length > 0 && `(${selectedTeams.length})`}
                  </Text>
                  <View
                    style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#1e293b' }}
                    onClick={loadTeams}
                  >
                    <RefreshCw size={18} color={loadingTeams ? '#64748b' : '#38bdf8'} />
                  </View>
                </View>

                {loadingTeams ? (
                  <View style={{ padding: '32px 0', textAlign: 'center' }}>
                    <RefreshCw size={32} color="#38bdf8" />
                    <Text style={{ fontSize: '22px', color: '#71717a', marginTop: '12px', display: 'block' }}>
                      加载中...
                    </Text>
                  </View>
                ) : teams.length === 0 ? (
                  <View style={{ padding: '32px 0', textAlign: 'center' }}>
                    <Users size={48} color="#71717a" />
                    <Text style={{ fontSize: '22px', color: '#71717a', marginTop: '12px', display: 'block' }}>
                      暂无可用团队
                    </Text>
                  </View>
                ) : (
                  <View style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {teams.map(team => {
                      const isSelected = selectedTeams.includes(team.id);
                      return (
                        <View
                          key={team.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '14px',
                            backgroundColor: isSelected ? 'rgba(245, 158, 11, 0.15)' : '#1e293b',
                            borderRadius: '12px',
                            border: `1px solid ${isSelected ? '#f59e0b' : '#1e3a5f'}`,
                          }}
                          onClick={() => toggleTeamSelection(team.id)}
                        >
                          <View
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '12px',
                              backgroundColor: 'rgba(245, 158, 11, 0.15)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Users size={22} color="#f59e0b" />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: '24px', fontWeight: '600', color: '#f1f5f9', display: 'block' }}>
                              {team.name}
                            </Text>
                            {team.description && (
                              <Text style={{ fontSize: '20px', color: '#64748b', marginTop: '2px' }}>
                                {team.description}
                              </Text>
                            )}
                          </View>
                          {isSelected && (
                            <View
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                backgroundColor: '#f59e0b',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Check size={16} color="#000" />
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            )}

            {/* 用户选择 */}
            {targetType === 'user' && (
              <View style={{ marginTop: '16px' }}>
                {/* 已选择的用户 */}
                {selectedUsers.length > 0 && (
                  <View style={{ marginBottom: '16px' }}>
                    <Text style={{ fontSize: '22px', color: '#71717a', marginBottom: '10px', display: 'block' }}>
                      已选择 {selectedUsers.length} 位用户
                    </Text>
                    <View style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {selectedUsers.map(user => (
                        <View
                          key={user.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 12px',
                            backgroundColor: 'rgba(168, 85, 247, 0.15)',
                            borderRadius: '10px',
                            border: '1px solid rgba(168, 85, 247, 0.3)',
                          }}
                        >
                          <Text style={{ fontSize: '22px', color: '#a855f7' }}>
                            {user.nickname || '未设置昵称'}
                          </Text>
                          <View onClick={() => removeUser(user.id)}>
                            <X size={16} color="#a855f7" />
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* 搜索框 */}
                <View style={{ display: 'flex', gap: '12px' }}>
                  <View
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 16px',
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      border: '1px solid #1e3a5f',
                    }}
                  >
                    <Search size={22} color="#71717a" />
                    <Input
                      style={{ flex: 1, fontSize: '26px', color: '#f1f5f9' }}
                      placeholder="搜索用户名或员工ID"
                      placeholderStyle="color: #64748b"
                      value={userSearchKeyword}
                      onInput={e => setUserSearchKeyword(e.detail.value)}
                      onConfirm={searchUsers}
                    />
                    {userSearchKeyword && (
                      <View onClick={() => setUserSearchKeyword('')}>
                        <X size={20} color="#71717a" />
                      </View>
                    )}
                  </View>
                  <View
                    style={{
                      padding: '12px 20px',
                      backgroundColor: searching ? '#1e3a5f' : '#38bdf8',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onClick={searchUsers}
                  >
                    <Text style={{ fontSize: '24px', color: searching ? '#94a3b8' : '#000', fontWeight: '600' }}>
                      搜索
                    </Text>
                  </View>
                </View>

                {/* 搜索结果 */}
                {searchResults.length > 0 && (
                  <View style={{ marginTop: '12px' }}>
                    <Text style={{ fontSize: '20px', color: '#64748b', marginBottom: '8px', display: 'block' }}>
                      搜索结果（点击选择）
                    </Text>
                    <View style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {searchResults.slice(0, 10).map(user => (
                        <View
                          key={user.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px',
                            backgroundColor: '#1e293b',
                            borderRadius: '10px',
                            border: '1px solid #1e3a5f',
                          }}
                          onClick={() => selectUser(user)}
                        >
                          <View
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '10px',
                              backgroundColor: 'rgba(168, 85, 247, 0.15)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <User size={20} color="#a855f7" />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: '24px', color: '#f1f5f9' }}>
                              {user.nickname || '未设置昵称'}
                            </Text>
                            {user.employee_id && (
                              <Text style={{ fontSize: '20px', color: '#10b981' }}>
                                #{user.employee_id}
                              </Text>
                            )}
                          </View>
                          <View
                            style={{
                              padding: '6px 12px',
                              backgroundColor: 'rgba(168, 85, 247, 0.15)',
                              borderRadius: '8px',
                              border: '1px solid rgba(168, 85, 247, 0.3)',
                            }}
                          >
                            <Text style={{ fontSize: '20px', color: '#a855f7' }}>选择</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* 通知内容 */}
          <View className="admin-card">
            <Text style={{ fontSize: '24px', fontWeight: '600', color: '#f1f5f9', marginBottom: '16px', display: 'block' }}>
              通知内容
            </Text>

            <View className="form-group">
              <Text className="form-label">
                标题 <Text style={{ color: '#f87171' }}>*</Text>
              </Text>
              <Input
                className="form-input input-focus"
                placeholder="请输入通知标题"
                placeholderStyle="color: #64748b"
                value={title}
                onInput={e => setTitle(e.detail.value)}
                maxlength={100}
              />
            </View>

            <View className="form-group">
              <Text className="form-label">
                内容 <Text style={{ color: '#f87171' }}>*</Text>
              </Text>
              <View
                style={{
                  backgroundColor: '#1e293b',
                  borderRadius: '16px',
                  border: '1px solid #1e3a5f',
                }}
              >
                <Textarea
                  style={{
                    width: '100%',
                    minHeight: '200px',
                    padding: '20px',
                    fontSize: '28px',
                    color: '#f1f5f9',
                    backgroundColor: 'transparent',
                  }}
                  placeholder="请输入通知内容..."
                  placeholderStyle="color: #64748b"
                  value={content}
                  onInput={e => setContent(e.detail.value)}
                  maxlength={500}
                />
              </View>
              <Text style={{ fontSize: '20px', color: '#64748b', marginTop: '8px', textAlign: 'right' }}>
                {content.length}/500
              </Text>
            </View>
          </View>

          {/* 预览 */}
          <View className="admin-card">
            <Text style={{ fontSize: '24px', fontWeight: '600', color: '#f1f5f9', marginBottom: '16px', display: 'block' }}>
              预览效果
            </Text>

            <View
              style={{
                backgroundColor: '#1e293b',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid #1e3a5f',
              }}
            >
              <View style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <View
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: selectedNotificationType?.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {selectedNotificationType && (
                    <selectedNotificationType.icon size={20} color={selectedNotificationType.iconColor} />
                  )}
                </View>
                <Text style={{ fontSize: '26px', fontWeight: '600', color: '#f1f5f9' }}>
                  {title || '通知标题'}
                </Text>
              </View>
              <Text style={{ fontSize: '22px', color: '#94a3b8', lineHeight: '1.6' }}>
                {content || '通知内容将显示在这里...'}
              </Text>
              <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                <Text style={{ fontSize: '18px', color: '#64748b' }}>
                  目标: {selectedTargetType?.label}
                  {targetType === 'team' && selectedTeams.length > 0 && ` (${selectedTeams.length}个团队)`}
                  {targetType === 'user' && selectedUsers.length > 0 && ` (${selectedUsers.length}位用户)`}
                </Text>
              </View>
            </View>
          </View>

          {/* 发送按钮 */}
          <View
            className="action-btn-primary"
            style={{ marginTop: '20px', opacity: sending ? 0.6 : 1 }}
            onClick={handleSend}
          >
            <Send size={28} color="#000" />
            <Text className="action-btn-primary-text" style={{ marginLeft: '8px' }}>
              {sending ? '发送中...' : '发送通知'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default SendNotificationPage;
