import { useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Input, Textarea } from '@tarojs/components';
import { Network } from '@/network';
import {
  ChevronLeft,
  Users,
  Info,
} from 'lucide-react-taro';
import '@/styles/pages.css';
import '@/styles/admin.css';

export default function TeamCreate() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [leaderId, setLeaderId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!name.trim()) {
      Taro.showToast({ title: '请输入团队名称', icon: 'none' });
      return;
    }

    setSubmitting(true);
    Network.request({
      url: '/api/teams',
      method: 'POST',
      data: {
        name: name.trim(),
        description: description.trim() || undefined,
        leaderId: leaderId.trim() || undefined,
      },
    })
      .then(res => {
        console.log('[TeamCreate] Create response:', res);
        if (res.data.code === 200) {
          Taro.showToast({ title: '创建成功', icon: 'success' });
          setTimeout(() => {
            Taro.navigateBack();
          }, 1000);
        } else {
          Taro.showToast({ title: res.data.msg || '创建失败', icon: 'none' });
        }
      })
      .catch(err => {
        console.error('[TeamCreate] Create error:', err);
        Taro.showToast({ title: '创建失败', icon: 'none' });
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <View className="admin-page">
      {/* Header */}
      <View className="admin-header">
        <View className="admin-header-content">
          <View className="admin-back-btn" onClick={() => Taro.navigateBack()}>
            <ChevronLeft size={20} color="#38bdf8" />
          </View>
          <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <View
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={18} color="#f59e0b" />
            </View>
            <Text className="admin-title">创建团队</Text>
          </View>
          <View
            style={{
              padding: '8px 16px',
              backgroundColor: submitting || !name.trim() ? '#1e3a5f' : '#38bdf8',
              borderRadius: '10px',
            }}
            onClick={!submitting && name.trim() ? handleSubmit : undefined}
          >
            <Text
              style={{
                fontSize: '22px',
                fontWeight: '600',
                color: submitting || !name.trim() ? '#64748b' : '#000',
              }}
            >
              {submitting ? '创建中...' : '创建'}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ padding: '100px 16px 32px' }}>
        {/* Team Name */}
        <View className="admin-card">
          <Text style={{ fontSize: '22px', color: '#71717a', marginBottom: '10px', display: 'block' }}>
            团队名称 <Text style={{ color: '#f87171' }}>*</Text>
          </Text>
          <Input
            className="form-input input-focus"
            placeholder="请输入团队名称"
            placeholderStyle="color: #64748b"
            value={name}
            onInput={e => setName(e.detail.value)}
            maxlength={50}
          />
        </View>

        {/* Team Description */}
        <View className="admin-card">
          <Text style={{ fontSize: '22px', color: '#71717a', marginBottom: '10px', display: 'block' }}>
            团队描述
          </Text>
          <View
            style={{
              backgroundColor: '#1e293b',
              borderRadius: '12px',
              border: '1px solid #1e3a5f',
            }}
          >
            <Textarea
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '16px',
                fontSize: '26px',
                color: '#f1f5f9',
                backgroundColor: 'transparent',
              }}
              placeholder="请输入团队描述（选填）"
              placeholderStyle="color: #64748b"
              value={description}
              onInput={e => setDescription(e.detail.value)}
              maxlength={200}
            />
          </View>
          <Text style={{ fontSize: '20px', color: '#64748b', marginTop: '8px', textAlign: 'right' }}>
            {description.length}/200
          </Text>
        </View>

        {/* Leader ID */}
        <View className="admin-card">
          <Text style={{ fontSize: '22px', color: '#71717a', marginBottom: '10px', display: 'block' }}>
            负责人ID
          </Text>
          <Input
            className="form-input input-focus"
            placeholder="输入用户ID作为团队负责人（选填）"
            placeholderStyle="color: #64748b"
            value={leaderId}
            onInput={e => setLeaderId(e.detail.value)}
          />
          <Text style={{ fontSize: '20px', color: '#64748b', marginTop: '10px' }}>
            负责人将自动加入团队并拥有管理权限
          </Text>
        </View>

        {/* Tips */}
        <View
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            padding: '16px',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(245, 158, 11, 0.2)',
          }}
        >
          <View
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'rgba(245, 158, 11, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Info size={18} color="#f59e0b" />
          </View>
          <View>
            <Text style={{ fontSize: '24px', color: '#f59e0b', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
              创建说明
            </Text>
            <Text style={{ fontSize: '22px', color: '#94a3b8', lineHeight: '1.6' }}>
              创建团队后，您可以在团队详情页添加更多成员。团队成员可以共享客户数据和回收门店信息。
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
