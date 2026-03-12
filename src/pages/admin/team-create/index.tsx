import { useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Input, Textarea } from '@tarojs/components';
import { Network } from '@/network';
import { ChevronLeft, Users } from 'lucide-react-taro';

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
    }).then((res) => {
      console.log('[TeamCreate] Create response:', res);
      if (res.data.code === 200) {
        Taro.showToast({ title: '创建成功', icon: 'success' });
        setTimeout(() => {
          Taro.navigateBack();
        }, 1000);
      } else {
        Taro.showToast({ title: res.data.msg || '创建失败', icon: 'none' });
      }
    }).catch((err) => {
      console.error('[TeamCreate] Create error:', err);
      Taro.showToast({ title: '创建失败', icon: 'none' });
    }).finally(() => {
      setSubmitting(false);
    });
  };

  return (
    <View className="min-h-screen bg-slate-950">
      {/* Header */}
      <View className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
        <View className="flex items-center justify-between px-4 py-3">
          <View className="flex items-center gap-3">
            <View
              className="p-2 bg-slate-800 rounded-lg active:bg-slate-700 transition-colors"
              onClick={() => Taro.navigateBack()}
            >
              <ChevronLeft size={20} className="text-slate-300" />
            </View>
            <Text className="block text-lg font-semibold text-white">创建团队</Text>
          </View>
          <View
            className={`px-4 py-2 rounded-lg transition-colors ${
              submitting || !name.trim()
                ? 'bg-slate-700'
                : 'bg-blue-600 active:bg-blue-700'
            }`}
            onClick={!submitting && name.trim() ? handleSubmit : undefined}
          >
            <Text className={`block text-sm ${submitting || !name.trim() ? 'text-slate-400' : 'text-white'}`}>
              {submitting ? '创建中...' : '创建'}
            </Text>
          </View>
        </View>
      </View>

      {/* Form */}
      <View className="p-4 space-y-4">
        {/* Team Name */}
        <View className="bg-slate-900 rounded-xl p-4 border border-slate-800">
          <Text className="block text-sm text-slate-400 mb-2">团队名称 *</Text>
          <View className="bg-slate-800 rounded-lg px-3 py-2">
            <Input
              className="text-base text-white bg-transparent"
              placeholder="请输入团队名称"
              placeholderClass="text-slate-500"
              value={name}
              onInput={(e) => setName(e.detail.value)}
              maxlength={50}
            />
          </View>
        </View>

        {/* Team Description */}
        <View className="bg-slate-900 rounded-xl p-4 border border-slate-800">
          <Text className="block text-sm text-slate-400 mb-2">团队描述</Text>
          <View className="bg-slate-800 rounded-lg p-3">
            <Textarea
              className="w-full text-base text-white bg-transparent"
              placeholder="请输入团队描述（选填）"
              placeholderClass="text-slate-500"
              value={description}
              onInput={(e) => setDescription(e.detail.value)}
              maxlength={200}
              style={{ minHeight: '80px' }}
            />
          </View>
          <Text className="block text-xs text-slate-500 mt-1 text-right">{description.length}/200</Text>
        </View>

        {/* Leader ID */}
        <View className="bg-slate-900 rounded-xl p-4 border border-slate-800">
          <Text className="block text-sm text-slate-400 mb-2">负责人ID</Text>
          <View className="bg-slate-800 rounded-lg px-3 py-2">
            <Input
              className="text-base text-white bg-transparent"
              placeholder="输入用户ID作为团队负责人（选填）"
              placeholderClass="text-slate-500"
              value={leaderId}
              onInput={(e) => setLeaderId(e.detail.value)}
            />
          </View>
          <Text className="block text-xs text-slate-500 mt-2">负责人将自动加入团队并拥有管理权限</Text>
        </View>

        {/* Tips */}
        <View className="flex items-start gap-2 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
          <Users size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />
          <View>
            <Text className="block text-sm text-blue-400 font-medium mb-1">创建说明</Text>
            <Text className="block text-xs text-slate-400">创建团队后，您可以在团队详情页添加更多成员。团队成员可以共享客户数据和回收门店信息。</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
