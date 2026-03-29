import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  Save,
  Loader,
  MessageSquare,
  Shield,
  DollarSign,
  Power,
} from 'lucide-react-taro';
import { Network } from '@/network';

interface AiSettings {
  id: string;
  response_style: string;
  response_tone: string;
  max_response_length: number;
  enable_content_filter: boolean;
  sensitive_words: string[];
  global_system_prompt?: string;
  monthly_budget?: number;
  alert_threshold?: number;
  enable_ai_chat: boolean;
  enable_ai_writing: boolean;
  enable_ai_analysis: boolean;
}

const AiSettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<AiSettings | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await Network.request({
        url: '/api/ai-admin/settings',
        method: 'GET',
      });

      console.log('[AiSettings] Settings response:', response);

      if (response.data?.code === 200 && response.data?.data) {
        setSettings(response.data.data);
      }
    } catch (error) {
      console.error('[AiSettings] 加载失败:', error);
      Taro.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const response = await Network.request({
        url: '/api/ai-admin/settings',
        method: 'PUT',
        data: settings,
      });

      if (response.data?.code === 200) {
        Taro.showToast({ title: '保存成功', icon: 'success' });
      } else {
        Taro.showToast({ title: response.data?.msg || '保存失败', icon: 'none' });
      }
    } catch (error) {
      console.error('[AiSettings] 保存失败:', error);
      Taro.showToast({ title: '保存失败', icon: 'none' });
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (updates: Partial<AiSettings>) => {
    if (settings) {
      setSettings({ ...settings, ...updates });
    }
  };

  const getStyleLabel = (style: string) => {
    const labels: Record<string, string> = {
      professional: '专业严谨',
      friendly: '友好亲切',
      concise: '简洁明了',
    };
    return labels[style] || style;
  };

  const getToneLabel = (tone: string) => {
    const labels: Record<string, string> = {
      neutral: '中性',
      positive: '积极',
      encouraging: '鼓励性',
    };
    return labels[tone] || tone;
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', paddingBottom: '80px' }}>
      {/* Header */}
      <View style={{ padding: '48px 20px 20px', backgroundColor: '#111827', borderBottom: '1px solid #1e3a5f' }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            
            <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>全局设置</Text>
          </View>
          <View
            style={{ padding: '10px 16px', borderRadius: '10px', backgroundColor: saving ? '#1e3a5f' : '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={saving ? undefined : handleSave}
          >
            {saving ? <Loader size={16} color="#71717a" /> : <Save size={16} color="#0a0f1a" />}
            <Text style={{ fontSize: '14px', fontWeight: '600', color: saving ? '#71717a' : '#0a0f1a' }}>{saving ? '保存中' : '保存'}</Text>
          </View>
        </View>
      </View>

      <ScrollView scrollY style={{ height: 'calc(100vh - 160px)' }}>
        {loading ? (
          <View style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Loader size={32} color="#38bdf8" />
            <Text style={{ fontSize: '14px', color: '#71717a', display: 'block', marginTop: '12px' }}>加载中...</Text>
          </View>
        ) : settings ? (
          <View style={{ padding: '20px' }}>
            {/* 回答风格设置 */}
            <View style={{ marginBottom: '24px' }}>
              <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <MessageSquare size={16} color="#38bdf8" />
                <Text style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>回答风格</Text>
              </View>
              <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px' }}>
                <Text style={{ fontSize: '12px', color: '#71717a', marginBottom: '10px', display: 'block' }}>回答风格</Text>
                <View style={{ display: 'flex', gap: '8px' }}>
                  {['professional', 'friendly', 'concise'].map((style) => (
                    <View
                      key={style}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        backgroundColor: settings.response_style === style ? 'rgba(56, 189, 248, 0.2)' : 'rgba(0,0,0,0.2)',
                        border: settings.response_style === style ? '1px solid #38bdf8' : '1px solid #1e3a5f',
                        textAlign: 'center',
                      }}
                      onClick={() => updateSettings({ response_style: style })}
                    >
                      <Text style={{ fontSize: '13px', color: settings.response_style === style ? '#38bdf8' : '#94a3b8' }}>{getStyleLabel(style)}</Text>
                    </View>
                  ))}
                </View>

                <Text style={{ fontSize: '12px', color: '#71717a', marginBottom: '10px', marginTop: '16px', display: 'block' }}>回答语气</Text>
                <View style={{ display: 'flex', gap: '8px' }}>
                  {['neutral', 'positive', 'encouraging'].map((tone) => (
                    <View
                      key={tone}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        backgroundColor: settings.response_tone === tone ? 'rgba(56, 189, 248, 0.2)' : 'rgba(0,0,0,0.2)',
                        border: settings.response_tone === tone ? '1px solid #38bdf8' : '1px solid #1e3a5f',
                        textAlign: 'center',
                      }}
                      onClick={() => updateSettings({ response_tone: tone })}
                    >
                      <Text style={{ fontSize: '13px', color: settings.response_tone === tone ? '#38bdf8' : '#94a3b8' }}>{getToneLabel(tone)}</Text>
                    </View>
                  ))}
                </View>

                <Text style={{ fontSize: '12px', color: '#71717a', marginBottom: '10px', marginTop: '16px', display: 'block' }}>最大回复长度: {settings.max_response_length} 字</Text>
                <View style={{ backgroundColor: '#1e3a5f', borderRadius: '8px', height: '4px' }}>
                  <View style={{ width: `${(settings.max_response_length / 4000) * 100}%`, backgroundColor: '#38bdf8', height: '100%', borderRadius: '8px' }} />
                </View>
              </View>
            </View>

            {/* 内容控制 */}
            <View style={{ marginBottom: '24px' }}>
              <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Shield size={16} color="#10b981" />
                <Text style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>内容控制</Text>
              </View>
              <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px' }}>
                <View
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}
                  onClick={() => updateSettings({ enable_content_filter: !settings.enable_content_filter })}
                >
                  <Text style={{ fontSize: '14px', color: '#ffffff' }}>启用内容过滤</Text>
                  <View style={{ width: '44px', height: '24px', borderRadius: '12px', backgroundColor: settings.enable_content_filter ? '#10b981' : '#1e3a5f', padding: '2px' }}>
                    <View style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#ffffff', transform: settings.enable_content_filter ? 'translateX(20px)' : 'translateX(0)', transition: 'transform 0.2s' }} />
                  </View>
                </View>
              </View>
            </View>

            {/* 成本控制 */}
            <View style={{ marginBottom: '24px' }}>
              <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <DollarSign size={16} color="#f59e0b" />
                <Text style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>成本控制</Text>
              </View>
              <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px' }}>
                <View style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <Text style={{ fontSize: '12px', color: '#71717a' }}>月度预算</Text>
                  <Text style={{ fontSize: '13px', color: '#ffffff' }}>¥{settings.monthly_budget || 0}</Text>
                </View>
                <View style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: '12px', color: '#71717a' }}>告警阈值</Text>
                  <Text style={{ fontSize: '13px', color: '#ffffff' }}>{settings.alert_threshold || 80}%</Text>
                </View>
              </View>
            </View>

            {/* 功能开关 */}
            <View>
              <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Power size={16} color="#a855f7" />
                <Text style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>功能开关</Text>
              </View>
              <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', overflow: 'hidden' }}>
                {[
                  { key: 'enable_ai_chat', label: '对话功能' },
                  { key: 'enable_ai_writing', label: '写作功能' },
                  { key: 'enable_ai_analysis', label: '分析功能' },
                ].map((item, index) => (
                  <View
                    key={item.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px',
                      borderBottom: index < 2 ? '1px solid #1e3a5f' : 'none',
                    }}
                    onClick={() => updateSettings({ [item.key]: !settings[item.key as keyof AiSettings] })}
                  >
                    <Text style={{ fontSize: '14px', color: '#ffffff' }}>{item.label}</Text>
                    <View style={{ width: '44px', height: '24px', borderRadius: '12px', backgroundColor: settings[item.key as keyof AiSettings] ? '#10b981' : '#1e3a5f', padding: '2px' }}>
                      <View style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#ffffff', transform: settings[item.key as keyof AiSettings] ? 'translateX(20px)' : 'translateX(0)' }} />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
};

export default AiSettingsPage;
