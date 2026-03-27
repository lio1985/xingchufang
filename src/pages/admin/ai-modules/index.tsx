import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  ChevronLeft,
  Puzzle,
  Power,
  Pencil,
  Loader,
} from 'lucide-react-taro';
import { Network } from '@/network';

interface AiModule {
  id: string;
  code: string;
  name: string;
  description?: string;
  position?: string;
  responsibility?: string;
  model_id?: string;
  prompt_template: string;
  is_active: boolean;
  display_order: number;
  model?: { name: string };
}

const AiModulesPage = () => {
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState<AiModule[]>([]);

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    setLoading(true);
    try {
      const response = await Network.request({
        url: '/api/ai-admin/modules',
        method: 'GET',
      });

      console.log('[AiModules] Modules response:', response);

      if (response.data?.code === 200 && response.data?.data) {
        setModules(response.data.data);
      }
    } catch (error) {
      console.error('[AiModules] 加载失败:', error);
      Taro.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (module: AiModule) => {
    try {
      const response = await Network.request({
        url: `/api/ai-admin/modules/${module.id}/toggle`,
        method: 'POST',
      });

      if (response.data?.code === 200) {
        Taro.showToast({ title: response.data.msg, icon: 'success' });
        await loadModules();
      }
    } catch (error) {
      console.error('[AiModules] 切换状态失败:', error);
      Taro.showToast({ title: '操作失败', icon: 'none' });
    }
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', paddingBottom: '60px' }}>
      {/* Header */}
      <View style={{ padding: '48px 20px 20px', backgroundColor: '#111827', borderBottom: '1px solid #1e3a5f' }}>
        <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <View
            style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => Taro.navigateBack()}
          >
            <ChevronLeft size={24} color="#f1f5f9" />
          </View>
          <View>
            <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', display: 'block' }}>AI功能模块</Text>
            <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginTop: '2px' }}>{modules.filter(m => m.is_active).length} 个已启用</Text>
          </View>
        </View>
      </View>

      {/* Module List */}
      <ScrollView scrollY style={{ height: 'calc(100vh - 140px)' }}>
        {loading ? (
          <View style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Loader size={32} color="#38bdf8" />
            <Text style={{ fontSize: '14px', color: '#71717a', display: 'block', marginTop: '12px' }}>加载中...</Text>
          </View>
        ) : modules.length === 0 ? (
          <View style={{ padding: '60px 20px', textAlign: 'center' }}>
            <Puzzle size={48} color="#64748b" />
            <Text style={{ fontSize: '14px', color: '#71717a', display: 'block', marginTop: '12px' }}>暂无功能模块</Text>
          </View>
        ) : (
          <View style={{ padding: '20px' }}>
            {modules.map((module) => (
              <View
                key={module.id}
                style={{
                  backgroundColor: '#111827',
                  border: '1px solid #1e3a5f',
                  borderRadius: '12px',
                  marginBottom: '12px',
                  overflow: 'hidden',
                }}
              >
                <View style={{ padding: '16px' }}>
                  <View style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1 }}>
                      <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <Text style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>{module.name}</Text>
                        {module.is_active ? (
                          <View style={{ padding: '2px 8px', backgroundColor: 'rgba(16, 185, 129, 0.2)', borderRadius: '4px' }}>
                            <Text style={{ fontSize: '10px', color: '#10b981' }}>已启用</Text>
                          </View>
                        ) : (
                          <View style={{ padding: '2px 8px', backgroundColor: 'rgba(239, 68, 68, 0.2)', borderRadius: '4px' }}>
                            <Text style={{ fontSize: '10px', color: '#ef4444' }}>已禁用</Text>
                          </View>
                        )}
                      </View>
                      <Text style={{ fontSize: '12px', color: '#71717a', display: 'block' }}>{module.code}</Text>
                      {module.description && (
                        <Text style={{ fontSize: '13px', color: '#94a3b8', display: 'block', marginTop: '8px' }}>{module.description}</Text>
                      )}
                    </View>
                  </View>

                  {/* 模块信息 */}
                  <View style={{ marginTop: '12px', padding: '12px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                    <View style={{ display: 'flex', gap: '16px' }}>
                      <View>
                        <Text style={{ fontSize: '11px', color: '#71717a', display: 'block' }}>定位</Text>
                        <Text style={{ fontSize: '13px', color: '#ffffff', display: 'block', marginTop: '2px' }}>{module.position || '-'}</Text>
                      </View>
                      <View>
                        <Text style={{ fontSize: '11px', color: '#71717a', display: 'block' }}>使用模型</Text>
                        <Text style={{ fontSize: '13px', color: '#38bdf8', display: 'block', marginTop: '2px' }}>{module.model?.name || '默认'}</Text>
                      </View>
                    </View>
                  </View>

                  {/* 操作按钮 */}
                  <View style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                    <View
                      style={{ flex: 1, padding: '10px', borderRadius: '8px', backgroundColor: module.is_active ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      onClick={() => handleToggle(module)}
                    >
                      <Power size={14} color={module.is_active ? '#ef4444' : '#10b981'} />
                      <Text style={{ fontSize: '13px', color: module.is_active ? '#ef4444' : '#10b981' }}>{module.is_active ? '禁用' : '启用'}</Text>
                    </View>
                    <View
                      style={{ padding: '10px 16px', borderRadius: '8px', backgroundColor: 'rgba(56, 189, 248, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      onClick={() => Taro.showToast({ title: '编辑功能开发中', icon: 'none' })}
                    >
                      <Pencil size={14} color="#38bdf8" />
                      <Text style={{ fontSize: '13px', color: '#38bdf8' }}>编辑</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default AiModulesPage;
