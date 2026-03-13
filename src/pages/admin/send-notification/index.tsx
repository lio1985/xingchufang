import { useState } from 'react';
import { showToast } from '@tarojs/taro';
import { View, Text, Textarea, Input, Radio, RadioGroup, Label } from '@tarojs/components';
import { Network } from '@/network';
import { Send, User, Globe } from 'lucide-react-taro';
import './index.less';

const SendNotificationPage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<'system' | 'activity' | 'update'>('system');
  const [targetType, setTargetType] = useState<'all' | 'single'>('all');
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
        requestData.targetUsers = targetUsers.split(',').map(id => id.trim());
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
        // 清空表单
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
      <View className="form-section">
        <View className="form-item">
          <Text className="label">通知标题</Text>
          <Input
            className="input"
            placeholder="请输入通知标题"
            value={title}
            onInput={(e) => setTitle(e.detail.value)}
            maxlength={100}
          />
        </View>

        <View className="form-item">
          <Text className="label">通知内容</Text>
          <Textarea
            className="textarea"
            placeholder="请输入通知内容"
            value={content}
            onInput={(e) => setContent(e.detail.value)}
            maxlength={500}
            autoHeight
          />
          <Text className="char-count">{content.length}/500</Text>
        </View>

        <View className="form-item">
          <Text className="label">通知类型</Text>
          <RadioGroup
            className="radio-group"
            onChange={(e) => setType(e.detail.value as any)}
          >
            <Label className="radio-label">
              <Radio value="system" checked={type === 'system'} />
              <Text className="radio-text">系统通知</Text>
            </Label>
            <Label className="radio-label">
              <Radio value="activity" checked={type === 'activity'} />
              <Text className="radio-text">活动通知</Text>
            </Label>
            <Label className="radio-label">
              <Radio value="update" checked={type === 'update'} />
              <Text className="radio-text">更新通知</Text>
            </Label>
          </RadioGroup>
        </View>

        <View className="form-item">
          <Text className="label">发送对象</Text>
          <RadioGroup
            className="radio-group"
            onChange={(e) => setTargetType(e.detail.value as any)}
          >
            <Label className="radio-label">
              <Radio value="all" checked={targetType === 'all'} />
              <Globe size={16} color="#6b7280" />
              <Text className="radio-text">全部用户</Text>
            </Label>
            <Label className="radio-label">
              <Radio value="single" checked={targetType === 'single'} />
              <User size={16} color="#6b7280" />
              <Text className="radio-text">指定用户</Text>
            </Label>
          </RadioGroup>
        </View>

        {targetType === 'single' && (
          <View className="form-item">
            <Text className="label">目标用户ID（用逗号分隔）</Text>
            <Textarea
              className="textarea"
              placeholder="输入用户ID，多个用户用逗号分隔，例如：user1,user2,user3"
              value={targetUsers}
              onInput={(e) => setTargetUsers(e.detail.value)}
              autoHeight
            />
          </View>
        )}
      </View>

      <View className="action-section">
        <View
          className={`send-btn ${sending ? 'disabled' : ''}`}
          onClick={!sending ? handleSend : undefined}
        >
          <Send size={20} color="#fff" />
          <Text className="send-text">{sending ? '发送中...' : '发送通知'}</Text>
        </View>
      </View>

      <View className="tips-section">
        <Text className="tips-title">使用说明：</Text>
        <Text className="tips-item">1. 系统通知：用于发布重要系统公告</Text>
        <Text className="tips-item">2. 活动通知：用于推广活动信息</Text>
        <Text className="tips-item">3. 更新通知：用于版本更新说明</Text>
        <Text className="tips-item">4. 指定用户：输入用户ID，多个用户用逗号分隔</Text>
      </View>
    </View>
  );
};

export default SendNotificationPage;
