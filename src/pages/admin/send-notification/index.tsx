import { useState } from 'react';
import { showToast } from '@tarojs/taro';
import { View, Text, Textarea, Input, Radio } from '@tarojs/components';
import { Network } from '@/network';
import {
  Send, User, Globe, Bell, Sparkles, Gift, Info
} from 'lucide-react-taro';
import './index.less';

type NotificationType = 'system' | 'activity' | 'update';
type TargetType = 'all' | 'single';

const notificationTypes = [
  {
    value: 'system' as const,
    label: '系统通知',
    desc: '重要系统公告',
    icon: Bell,
    iconColor: '#3b82f6',
    bgColor: '#dbeafe',
  },
  {
    value: 'activity' as const,
    label: '活动通知',
    desc: '推广活动信息',
    icon: Sparkles,
    iconColor: '#ec4899',
    bgColor: '#fce7f3',
  },
  {
    value: 'update' as const,
    label: '更新通知',
    desc: '版本更新说明',
    icon: Gift,
    iconColor: '#f59e0b',
    bgColor: '#fef3c7',
  },
];

const targetTypes = [
  {
    value: 'all' as const,
    label: '全部用户',
    desc: '发送给所有用户',
    icon: Globe,
    iconColor: '#10b981',
    bgColor: '#d1fae5',
  },
  {
    value: 'single' as const,
    label: '指定用户',
    desc: '发送给特定用户',
    icon: User,
    iconColor: '#6366f1',
    bgColor: '#e0e7ff',
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
      showToast({ title: '请输入标题', icon: 'none' });
      return;
    }

    if (!content.trim()) {
      showToast({ title: '请输入内容', icon: 'none' });
      return;
    }

    if (targetType === 'single' && !targetUsers.trim()) {
      showToast({ title: '请输入目标用户ID', icon: 'none' });
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
        showToast({ title: '发送成功', icon: 'success' });
        setTitle('');
        setContent('');
        setTargetUsers('');
      } else {
        showToast({ title: response.data?.message || '发送失败', icon: 'none' });
      }
    } catch (error) {
      console.error('发送通知失败:', error);
      showToast({ title: '发送失败，请重试', icon: 'none' });
    } finally {
      setSending(false);
    }
  };

  return (
    <View className="send-notification-page">
      {/* 头部 */}
      <View className="header">
        <Text className="header-title">发送通知</Text>
        <Text className="header-subtitle">向用户推送系统消息和活动资讯</Text>
      </View>

      <View className="form-section">
        {/* 标题输入 */}
        <View className="form-item">
          <Text className="label">
            通知标题
            <Text className="required">*</Text>
          </Text>
          <View className="input-wrapper">
            <Input
              className="input"
              placeholder="请输入通知标题"
              value={title}
              onInput={(e) => setTitle(e.detail.value)}
              maxlength={100}
            />
          </View>
        </View>

        {/* 内容输入 */}
        <View className="form-item">
          <Text className="label">
            通知内容
            <Text className="required">*</Text>
          </Text>
          <View className="textarea-wrapper">
            <Textarea
              className="textarea"
              placeholder="请输入通知内容，清晰简洁地描述通知要点..."
              value={content}
              onInput={(e) => setContent(e.detail.value)}
              maxlength={500}
            />
          </View>
          <Text className="char-count">{content.length}/500</Text>
        </View>

        {/* 通知类型 */}
        <View className="form-item">
          <Text className="label">通知类型</Text>
          <View className="radio-group">
            {notificationTypes.map((item) => {
              const Icon = item.icon;
              const isActive = type === item.value;
              return (
                <View
                  key={item.value}
                  className={`radio-card ${isActive ? 'active' : ''}`}
                  onClick={() => setType(item.value)}
                >
                  <Radio value={item.value} checked={isActive} style={{ display: 'none' }} />
                  <View
                    className="radio-icon system"
                    style={{ backgroundColor: item.bgColor }}
                  >
                    <Icon size={18} color={item.iconColor} />
                  </View>
                  <View className="radio-content">
                    <Text className="radio-title">{item.label}</Text>
                    <Text className="radio-desc">{item.desc}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* 发送对象 */}
        <View className="form-item">
          <Text className="label">发送对象</Text>
          <View className="radio-group">
            {targetTypes.map((item) => {
              const Icon = item.icon;
              const isActive = targetType === item.value;
              return (
                <View
                  key={item.value}
                  className={`radio-card ${isActive ? 'active' : ''}`}
                  onClick={() => setTargetType(item.value)}
                >
                  <Radio value={item.value} checked={isActive} style={{ display: 'none' }} />
                  <View
                    className="radio-icon all"
                    style={{ backgroundColor: item.bgColor }}
                  >
                    <Icon size={18} color={item.iconColor} />
                  </View>
                  <View className="radio-content">
                    <Text className="radio-title">{item.label}</Text>
                    <Text className="radio-desc">{item.desc}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* 指定用户输入 */}
        {targetType === 'single' && (
          <View className="form-item">
            <Text className="label">
              目标用户ID
              <Text className="required">*</Text>
            </Text>
            <View className="textarea-wrapper">
              <Textarea
                className="textarea"
                placeholder="输入用户ID，多个用户用逗号分隔&#10;例如：user123, user456, user789"
                value={targetUsers}
                onInput={(e) => setTargetUsers(e.detail.value)}
              />
            </View>
          </View>
        )}
      </View>

      {/* 发送按钮 */}
      <View className="action-section">
        <View
          className={`send-btn ${sending ? 'disabled' : ''}`}
          onClick={!sending ? handleSend : undefined}
        >
          <Send size={22} color="#fff" />
          <Text className="send-text">{sending ? '发送中...' : '发送通知'}</Text>
        </View>
      </View>

      {/* 使用说明 */}
      <View className="tips-section">
        <View className="tips-header">
          <Info size={18} color="#047857" />
          <Text className="tips-title">使用说明</Text>
        </View>
        <View className="tips-list">
          <View className="tips-item">
            <Text className="item-number">1</Text>
            <Text className="item-text">系统通知：用于发布重要系统公告和维护通知</Text>
          </View>
          <View className="tips-item">
            <Text className="item-number">2</Text>
            <Text className="item-text">活动通知：用于推广优惠活动、限时特惠等营销内容</Text>
          </View>
          <View className="tips-item">
            <Text className="item-number">3</Text>
            <Text className="item-text">更新通知：用于版本更新说明和新功能介绍</Text>
          </View>
          <View className="tips-item">
            <Text className="item-number">4</Text>
            <Text className="item-text">指定用户：输入用户ID，多个用户用英文逗号分隔</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default SendNotificationPage;
