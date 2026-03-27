import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  ChevronLeft,
  Bot,
  Plus,
  Star,
  Power,
  Trash2,
  Play,
  Loader,
} from 'lucide-react-taro';
import { Network } from '@/network';

interface AiModel {
  id: string;
  name: string;
  provider: string;
  model_id: string;
  max_tokens: number;
  temperature: number;
  capabilities: string[];
  is_active: boolean;
  is_default: boolean;
  created_at: string;
}

const AiModelsPage = () => {
  const [loading, setLoading] = useState(true);
  const [models, setModels] = useState<AiModel[]>([]);
  const [testingId, setTestingId] = useState<string | null>(null);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    setLoading(true);
    try {
      const response = await Network.request({
        url: '/api/ai-admin/models',
        method: 'GET',
      });

      console.log('[AiModels] Models response:', response);

      if (response.data?.code === 200 && response.data?.data) {
        setModels(response.data.data);
      }
    } catch (error) {
      console.error('[AiModels] 加载失败:', error);
      Taro.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const response = await Network.request({
        url: `/api/ai-admin/models/${id}/set-default`,
        method: 'POST',
      });

      if (response.data?.code === 200) {
        Taro.showToast({ title: '已设为默认', icon: 'success' });
        await loadModels();
      }
    } catch (error) {
      console.error('[AiModels] 设置默认失败:', error);
      Taro.showToast({ title: '设置失败', icon: 'none' });
    }
  };

  const handleToggle = async (model: AiModel) => {
    try {
      const response = await Network.request({
        url: `/api/ai-admin/models/${model.id}`,
        method: 'PUT',
        data: { is_active: !model.is_active },
      });

      if (response.data?.code === 200) {
        Taro.showToast({ title: model.is_active ? '已禁用' : '已启用', icon: 'success' });
        await loadModels();
      }
    } catch (error) {
      console.error('[AiModels] 切换状态失败:', error);
      Taro.showToast({ title: '操作失败', icon: 'none' });
    }
  };

  const handleTest = async (model: AiModel) => {
    setTestingId(model.id);
    try {
      const response = await Network.request({
        url: `/api/ai-admin/models/${model.id}/test`,
        method: 'POST',
      });

      if (response.data?.code === 200) {
        Taro.showToast({ title: '连接测试成功', icon: 'success' });
      } else {
        Taro.showToast({ title: response.data?.msg || '测试失败', icon: 'none' });
      }
    } catch (error) {
      console.error('[AiModels] 测试失败:', error);
      Taro.showToast({ title: '测试失败', icon: 'none' });
    } finally {
      setTestingId(null);
    }
  };

  const handleDelete = (model: AiModel) => {
    if (model.is_default) {
      Taro.showToast({ title: '默认模型不能删除', icon: 'none' });
      return;
    }

    Taro.showModal({
      title: '确认删除',
      content: `确定要删除"${model.name}"吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            const response = await Network.request({
              url: `/api/ai-admin/models/${model.id}`,
              method: 'DELETE',
            });

            if (response.data?.code === 200) {
              Taro.showToast({ title: '已删除', icon: 'success' });
              await loadModels();
            }
          } catch (error) {
            console.error('[AiModels] 删除失败:', error);
            Taro.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      },
    });
  };

  const getProviderLabel = (provider: string) => {
    const labels: Record<string, string> = {
      openai: 'OpenAI',
      anthropic: 'Anthropic',
      deepseek: 'DeepSeek',
      moonshot: 'Moonshot',
      doubao: 'Doubao',
    };
    return labels[provider] || provider;
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', paddingBottom: '60px' }}>
      {/* Header */}
      <View style={{ padding: '48px 20px 20px', backgroundColor: '#111827', borderBottom: '1px solid #1e3a5f' }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <View
              style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => Taro.navigateBack()}
            >
              <ChevronLeft size={24} color="#f1f5f9" />
            </View>
            <View>
              <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', display: 'block' }}>AI模型管理</Text>
              <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginTop: '2px' }}>{models.length} 个模型</Text>
            </View>
          </View>
          <View
            style={{ padding: '10px 16px', borderRadius: '10px', backgroundColor: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => Taro.showToast({ title: '添加模型功能开发中', icon: 'none' })}
          >
            <Plus size={16} color="#0a0f1a" />
            <Text style={{ fontSize: '14px', fontWeight: '600', color: '#0a0f1a' }}>添加</Text>
          </View>
        </View>
      </View>

      {/* Model List */}
      <ScrollView scrollY style={{ height: 'calc(100vh - 160px)' }}>
        {loading ? (
          <View style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Loader size={32} color="#38bdf8" />
            <Text style={{ fontSize: '14px', color: '#71717a', display: 'block', marginTop: '12px' }}>加载中...</Text>
          </View>
        ) : models.length === 0 ? (
          <View style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Bot size={48} color="#64748b" />
            <Text style={{ fontSize: '14px', color: '#71717a', display: 'block', marginTop: '12px' }}>暂无AI模型</Text>
          </View>
        ) : (
          <View style={{ padding: '20px' }}>
            {models.map((model) => (
              <View
                key={model.id}
                style={{
                  backgroundColor: '#111827',
                  border: model.is_default ? '1px solid #38bdf8' : '1px solid #1e3a5f',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  overflow: 'hidden',
                }}
              >
                {/* Header */}
                <View style={{ padding: '16px', borderBottom: '1px solid #1e3a5f' }}>
                  <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <View style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: model.is_active ? 'rgba(56, 189, 248, 0.2)' : '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Bot size={20} color={model.is_active ? '#38bdf8' : '#64748b'} />
                      </View>
                      <View>
                        <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Text style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>{model.name}</Text>
                          {model.is_default && (
                            <View style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 8px', backgroundColor: 'rgba(56, 189, 248, 0.2)', borderRadius: '4px' }}>
                              <Star size={10} color="#38bdf8" />
                              <Text style={{ fontSize: '10px', color: '#38bdf8' }}>默认</Text>
                            </View>
                          )}
                          {!model.is_active && (
                            <View style={{ padding: '2px 8px', backgroundColor: 'rgba(239, 68, 68, 0.2)', borderRadius: '4px' }}>
                              <Text style={{ fontSize: '10px', color: '#ef4444' }}>已禁用</Text>
                            </View>
                          )}
                        </View>
                        <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '2px' }}>{getProviderLabel(model.provider)} · {model.model_id}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Info */}
                <View style={{ padding: '12px 16px', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                  <View style={{ display: 'flex', gap: '16px' }}>
                    <View>
                      <Text style={{ fontSize: '11px', color: '#71717a', display: 'block' }}>Max Tokens</Text>
                      <Text style={{ fontSize: '13px', color: '#ffffff', display: 'block', marginTop: '2px' }}>{model.max_tokens}</Text>
                    </View>
                    <View>
                      <Text style={{ fontSize: '11px', color: '#71717a', display: 'block' }}>Temperature</Text>
                      <Text style={{ fontSize: '13px', color: '#ffffff', display: 'block', marginTop: '2px' }}>{model.temperature}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: '11px', color: '#71717a', display: 'block' }}>能力标签</Text>
                      <View style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                        {model.capabilities?.map((cap, i) => (
                          <View key={i} style={{ padding: '2px 6px', backgroundColor: 'rgba(56, 189, 248, 0.1)', borderRadius: '3px' }}>
                            <Text style={{ fontSize: '10px', color: '#60a5fa' }}>{cap}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                </View>

                {/* Actions */}
                <View style={{ padding: '12px 16px', display: 'flex', gap: '8px' }}>
                  <View
                    style={{ flex: 1, padding: '8px', borderRadius: '8px', backgroundColor: testingId === model.id ? '#1e3a5f' : 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    onClick={testingId === model.id ? undefined : () => handleTest(model)}
                  >
                    {testingId === model.id ? (
                      <Loader size={14} color="#38bdf8" />
                    ) : (
                      <Play size={14} color="#10b981" />
                    )}
                    <Text style={{ fontSize: '12px', color: testingId === model.id ? '#71717a' : '#10b981' }}>测试</Text>
                  </View>
                  {!model.is_default && (
                    <View
                      style={{ flex: 1, padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(56, 189, 248, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      onClick={() => handleSetDefault(model.id)}
                    >
                      <Star size={14} color="#38bdf8" />
                      <Text style={{ fontSize: '12px', color: '#38bdf8' }}>设为默认</Text>
                    </View>
                  )}
                  <View
                    style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: model.is_active ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    onClick={() => handleToggle(model)}
                  >
                    <Power size={14} color={model.is_active ? '#ef4444' : '#10b981'} />
                    <Text style={{ fontSize: '12px', color: model.is_active ? '#ef4444' : '#10b981' }}>{model.is_active ? '禁用' : '启用'}</Text>
                  </View>
                  {!model.is_default && (
                    <View
                      style={{ padding: '8px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onClick={() => handleDelete(model)}
                    >
                      <Trash2 size={14} color="#f87171" />
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default AiModelsPage;
