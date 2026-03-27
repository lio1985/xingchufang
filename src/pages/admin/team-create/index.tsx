import { useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Input, Textarea } from '@tarojs/components';
import { Network } from '@/network';
import {
  ArrowLeft,
  Users,
  Info
} from 'lucide-react-taro';

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
    <View className="min-h-screen bg-[#0a0f1a]">
      {/* Header */}
      <View className="sticky top-0 z-50 bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800">
        <View className="flex items-center justify-between px-4 py-3">
          <View className="flex items-center gap-3">
            <View
              className="p-2 bg-zinc-800/60 rounded-lg border border-zinc-700/50 active:bg-zinc-700"
              onClick={() => Taro.navigateBack()}
            >
              <ArrowLeft size={20} color="#f59e0b" />
            </View>
            <View className="flex items-center gap-2">
              <View className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center border border-amber-500/30">
                <Users size={16} color="#f59e0b" />
              </View>
              <Text className="block text-lg font-semibold text-white">创建团队</Text>
            </View>
          </View>
          <View
            className={`px-4 py-2 rounded-lg transition-colors ${
              submitting || !name.trim()
                ? 'bg-zinc-700/50'
                : 'bg-amber-500 active:bg-amber-600'
            }`}
            onClick={!submitting && name.trim() ? handleSubmit : undefined}
          >
            <Text className={`block text-sm font-medium ${submitting || !name.trim() ? 'text-zinc-500' : 'text-black'}`}>
              {submitting ? '创建中...' : '创建'}
            </Text>
          </View>
        </View>
      </View>

      {/* Form */}
      <View className="p-4 space-y-4">
        {/* Team Name */}
        <View className="bg-zinc-800/40 rounded-xl p-4 border border-zinc-700/50">
          <Text className="block text-sm text-zinc-400 mb-2">团队名称 *</Text>
          <View className="bg-zinc-700/50 rounded-lg px-3 py-2 border border-zinc-600/50">
            <Input
              className="text-base text-white bg-transparent"
              placeholder="请输入团队名称"
              placeholderClass="text-zinc-500"
              value={name}
              onInput={(e) => setName(e.detail.value)}
              maxlength={50}
            />
          </View>
        </View>

        {/* Team Description */}
        <View className="bg-zinc-800/40 rounded-xl p-4 border border-zinc-700/50">
          <Text className="block text-sm text-zinc-400 mb-2">团队描述</Text>
          <View className="bg-zinc-700/50 rounded-lg p-3 border border-zinc-600/50">
            <Textarea
              className="w-full text-base text-white bg-transparent"
              placeholder="请输入团队描述（选填）"
              placeholderClass="text-zinc-500"
              value={description}
              onInput={(e) => setDescription(e.detail.value)}
              maxlength={200}
              style={{ minHeight: '80px' }}
            />
          </View>
          <Text className="block text-xs text-zinc-500 mt-1 text-right">{description.length}/200</Text>
        </View>

        {/* Leader ID */}
        <View className="bg-zinc-800/40 rounded-xl p-4 border border-zinc-700/50">
          <Text className="block text-sm text-zinc-400 mb-2">负责人ID</Text>
          <View className="bg-zinc-700/50 rounded-lg px-3 py-2 border border-zinc-600/50">
            <Input
              className="text-base text-white bg-transparent"
              placeholder="输入用户ID作为团队负责人（选填）"
              placeholderClass="text-zinc-500"
              value={leaderId}
              onInput={(e) => setLeaderId(e.detail.value)}
            />
          </View>
          <Text className="block text-xs text-zinc-500 mt-2">负责人将自动加入团队并拥有管理权限</Text>
        </View>

        {/* Tips */}
        <View className="flex items-start gap-3 p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
          <View className="flex-shrink-0 w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
            <Info size={16} color="#f59e0b" />
          </View>
          <View>
            <Text className="block text-sm text-amber-500 font-medium mb-1">创建说明</Text>
            <Text className="block text-xs text-zinc-400">创建团队后，您可以在团队详情页添加更多成员。团队成员可以共享客户数据和回收门店信息。</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
