import { useState } from 'react';
import { View, Text, ScrollView, Textarea, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  Bell,
  Sparkles,
  Gift,
  Globe,
  User,
  Send,
  ChevronLeft,
  CircleCheck,
} from 'lucide-react-taro';
import { Network } from '@/network';
import '@/styles/pages.css';
import '@/styles/admin.css';

type NotificationType = 'system' | 'activity' | 'update';
type TargetType = 'all' | 'single';

const notificationTypes = [
  {
    value: 'system' as const,
    label: '系统通知',
    desc: '重要系统公告',
    icon: Bell,
    iconColor: '#60a5fa',
    bgColor: 'rgba(59, 130, 246, 0.1)',
  },
  {
    value: 'activity' as const,
    label: '活动通知',
    desc: '推广活动信息',
    icon: Sparkles,
    iconColor: '#ec4899',
    bgColor: 'rgba(236, 72, 153, 0.1)',
  },
  {
    value: 'update' as const,
    label: '更新通知',
    desc: '版本更新说明',
    icon: Gift,
    iconColor: '#38bdf8',
    bgColor: 'rgba(245, 158, 11, 0.1)',
  },
];

const targetTypes = [
  {
    value: 'all' as const,
    label: '全部用户',
    desc: '发送给所有用户',
    icon: Globe,
    iconColor: '#4ade80',
    bgColor: 'rgba(34, 197, 94, 0.1)',
  },
  {
    value: 'single' as const,
    label: '指定用户',
    desc: '发送给特定用户',
    icon: User,
    iconColor: '#6366f1',
    bgColor: 'rgba(99, 102, 241, 0.1)',
  },
];

const SendNotificationPage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<NotificationType>('system');
  const [targetType, setTargetType] = useState<TargetType>('all');
  const [targetUsers, setTargetUsers] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!title.trim()) {
      Taro.showToast({ title: '请输入标题', icon: 'none' });
      return;
    }

    if (!content.trim()) {
      Taro.showToast({ title: '请输入内容', icon: 'none' });
      return;
    }

    if (targetType === 'single' && !targetUsers.trim()) {
      Taro.showToast({ title: '请输入目标用户ID', icon: 'none' });
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

      if (targetType === 'single') {
        requestData.targetUsers = targetUsers.split(',').map((id) => id.trim());
      }

      console.log('发送通知请求:', requestData);

      const response = await Network.request({
        url: '/api/notifications/send',
        method: 'POST',
        data: requestData,
      });

      console.log('发送通知响应:', response.data);

      if (response.data?.success) {
        Taro.showToast({ title: '发送成功', icon: 'success' });
        setTitle('');
        setContent('');
        setTargetUsers('');
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

  const selectedNotificationType = notificationTypes.find((t) => t.value === type);
  const selectedTargetType = targetTypes.find((t) => t.value === targetType);

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
              {notificationTypes.map((item) => (
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
              {targetTypes.map((item) => (
                <View
                  key={item.value}
                  style={{
                    flex: 1,
                    padding: '20px',
                    borderRadius: '16px',
                    backgroundColor: targetType === item.value ? item.bgColor : '#1e293b',
                    border: `2px solid ${targetType === item.value ? item.iconColor : '#1e3a5f'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                  onClick={() => setTargetType(item.value)}
                >
                  <View
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: targetType === item.value ? item.bgColor : '#1e3a5f',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <item.icon size={28} color={targetType === item.value ? item.iconColor : '#71717a'} />
                  </View>
                  <Text
                    style={{
                      fontSize: '24px',
                      fontWeight: '600',
                      color: targetType === item.value ? item.iconColor : '#94a3b8',
                    }}
                  >
                    {item.label}
                  </Text>
                  <Text style={{ fontSize: '18px', color: '#64748b' }}>{item.desc}</Text>
                </View>
              ))}
            </View>

            {targetType === 'single' && (
              <View style={{ marginTop: '16px' }}>
                <Text style={{ fontSize: '22px', color: '#71717a', marginBottom: '8px', display: 'block' }}>
                  用户ID（多个用逗号分隔）
                </Text>
                <Input
                  className="form-input"
                  placeholder="输入用户ID，多个用逗号分隔"
                  placeholderStyle="color: #64748b"
                  value={targetUsers}
                  onInput={(e) => setTargetUsers(e.detail.value)}
                />
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
                onInput={(e) => setTitle(e.detail.value)}
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
                  onInput={(e) => setContent(e.detail.value)}
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
