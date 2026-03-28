import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Network } from '@/network';
import {
  ChevronLeft,
  Bell,
  BellOff,
  Radio,
  ShoppingCart,
  Users,
  Sparkles,
  Package,
  Info,
} from 'lucide-react-taro';

interface SubscribeTemplate {
  id: string;
  templateId: string;
  title: string;
  desc: string;
  icon: typeof Bell;
  color: string;
  subscribed: boolean;
  category: string;
}

export default function SubscribeMessagePage() {
  const [templates, setTemplates] = useState<SubscribeTemplate[]>([
    {
      id: 'live_reminder',
      templateId: 'LIVE_REMINDER_TEMPLATE_ID', // 需要替换为实际的模板ID
      title: '直播提醒',
      desc: '直播开始前15分钟提醒您，不错过每一场精彩直播',
      icon: Radio,
      color: '#f43f5e',
      subscribed: false,
      category: '直播',
    },
    {
      id: 'order_status',
      templateId: 'ORDER_STATUS_TEMPLATE_ID',
      title: '订单状态通知',
      desc: '订单状态变更时及时通知您，随时掌握订单进度',
      icon: ShoppingCart,
      color: '#f97316',
      subscribed: false,
      category: '订单',
    },
    {
      id: 'customer_follow',
      templateId: 'CUSTOMER_FOLLOW_TEMPLATE_ID',
      title: '客户跟进提醒',
      desc: '待跟进客户提醒，帮助您及时维护客户关系',
      icon: Users,
      color: '#38bdf8',
      subscribed: false,
      category: '客户',
    },
    {
      id: 'ai_complete',
      templateId: 'AI_COMPLETE_TEMPLATE_ID',
      title: 'AI创作完成',
      desc: '内容创作完成后及时通知，快速查看创作结果',
      icon: Sparkles,
      color: '#a855f7',
      subscribed: false,
      category: '创作',
    },
    {
      id: 'equipment_order',
      templateId: 'EQUIPMENT_ORDER_TEMPLATE_ID',
      title: '设备订单通知',
      desc: '新设备订单发布时通知您，抢占优质订单',
      icon: Package,
      color: '#4ade80',
      subscribed: false,
      category: '订单',
    },
  ]);

  useEffect(() => {
    loadSubscribeStatus();
  }, []);

  const loadSubscribeStatus = async () => {
    try {
      const res = await Network.request({
        url: '/api/subscribe/status',
        method: 'GET',
      });

      if (res.data?.success && res.data.data) {
        const subscribedIds = res.data.data.subscribedIds || [];
        setTemplates(prev =>
          prev.map(t => ({
            ...t,
            subscribed: subscribedIds.includes(t.id),
          }))
        );
      }
    } catch (error) {
      console.error('加载订阅状态失败:', error);
    }
  };

  const handleSubscribe = async (template: SubscribeTemplate) => {
    // 跨端兼容性检测：订阅消息仅支持微信小程序
    if (Taro.getEnv() !== Taro.ENV_TYPE.WEAPP) {
      Taro.showToast({
        title: '订阅消息仅支持微信小程序',
        icon: 'none',
      });
      return;
    }

    try {
      // 1. 调用微信订阅消息API
      // @ts-ignore - Taro 类型定义问题
      const result = await Taro.requestSubscribeMessage({
        tmplIds: [template.templateId],
      });

      const status = result[template.templateId];

      if (status === 'accept') {
        // 2. 用户同意订阅，保存到后端
        await Network.request({
          url: '/api/subscribe/subscribe',
          method: 'POST',
          data: {
            templateId: template.id,
            wxTemplateId: template.templateId,
          },
        });

        // 3. 更新UI
        setTemplates(prev =>
          prev.map(t =>
            t.id === template.id ? { ...t, subscribed: true } : t
          )
        );

        Taro.showToast({
          title: '订阅成功',
          icon: 'success',
        });
      } else if (status === 'reject') {
        Taro.showToast({
          title: '您已拒绝订阅',
          icon: 'none',
        });
      } else if (status === 'ban') {
        Taro.showToast({
          title: '该模板已被禁用',
          icon: 'none',
        });
      }
    } catch (error: any) {
      console.error('订阅失败:', error);
      Taro.showToast({
        title: error.errMsg || '订阅失败',
        icon: 'none',
      });
    }
  };

  const handleUnsubscribe = async (template: SubscribeTemplate) => {
    try {
      await Network.request({
        url: '/api/subscribe/unsubscribe',
        method: 'POST',
        data: {
          templateId: template.id,
        },
      });

      setTemplates(prev =>
        prev.map(t =>
          t.id === template.id ? { ...t, subscribed: false } : t
        )
      );

      Taro.showToast({
        title: '已取消订阅',
        icon: 'success',
      });
    } catch (error) {
      console.error('取消订阅失败:', error);
      Taro.showToast({
        title: '取消订阅失败',
        icon: 'none',
      });
    }
  };

  const groupedTemplates = templates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, SubscribeTemplate[]>);

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
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', display: 'block' }}>消息订阅</Text>
            <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginTop: '2px' }}>管理您的消息订阅</Text>
          </View>
        </View>
      </View>

      <ScrollView scrollY style={{ height: 'calc(100vh - 120px)' }}>
        <View style={{ padding: '20px' }}>
          {/* 说明卡片 */}
          <View
            style={{
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
            }}
          >
            <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Info size={18} color="#38bdf8" />
              <Text style={{ fontSize: '14px', fontWeight: '600', color: '#38bdf8' }}>订阅说明</Text>
            </View>
            <Text style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6' }}>
              订阅后，即使不打开小程序也能收到微信服务通知。每次订阅只能接收一条消息，如需持续接收请多次订阅。
            </Text>
          </View>

          {/* 分类的订阅列表 */}
          {Object.entries(groupedTemplates).map(([category, items]) => (
            <View key={category} style={{ marginBottom: '20px' }}>
              <Text style={{ fontSize: '14px', fontWeight: '600', color: '#71717a', marginBottom: '12px', display: 'block' }}>
                {category}通知
              </Text>
              <View style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {items.map(template => (
                  <View
                    key={template.id}
                    style={{
                      backgroundColor: '#111827',
                      border: '1px solid #1e3a5f',
                      borderRadius: '12px',
                      padding: '16px',
                    }}
                  >
                    <View style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      {/* 图标 */}
                      <View
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '12px',
                          backgroundColor: `${template.color}20`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <template.icon size={22} color={template.color} />
                      </View>

                      {/* 内容 */}
                      <View style={{ flex: 1 }}>
                        <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <Text style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff' }}>{template.title}</Text>
                          {template.subscribed && (
                            <View
                              style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                backgroundColor: 'rgba(74, 222, 128, 0.15)',
                              }}
                            >
                              <Text style={{ fontSize: '11px', color: '#4ade80' }}>已订阅</Text>
                            </View>
                          )}
                        </View>
                        <Text style={{ fontSize: '13px', color: '#71717a', lineHeight: '1.5' }}>
                          {template.desc}
                        </Text>
                      </View>

                      {/* 订阅按钮 */}
                      <View
                        style={{
                          padding: '8px 16px',
                          borderRadius: '8px',
                          backgroundColor: template.subscribed ? '#1e293b' : template.color,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          flexShrink: 0,
                        }}
                        onClick={() => template.subscribed ? handleUnsubscribe(template) : handleSubscribe(template)}
                      >
                        {template.subscribed ? (
                          <>
                            <BellOff size={16} color="#64748b" />
                            <Text style={{ fontSize: '13px', color: '#64748b' }}>取消</Text>
                          </>
                        ) : (
                          <>
                            <Bell size={16} color="#ffffff" />
                            <Text style={{ fontSize: '13px', color: '#ffffff', fontWeight: '500' }}>订阅</Text>
                          </>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}

          {/* 使用场景说明 */}
          <View style={{ marginTop: '20px' }}>
            <Text style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9', marginBottom: '12px', display: 'block' }}>
              常见问题
            </Text>

            <View style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <View
                style={{
                  backgroundColor: '#111827',
                  border: '1px solid #1e3a5f',
                  borderRadius: '12px',
                  padding: '16px',
                }}
              >
                <Text style={{ fontSize: '14px', fontWeight: '500', color: '#f1f5f9', marginBottom: '6px', display: 'block' }}>
                  为什么每次只能接收一条消息？
                </Text>
                <Text style={{ fontSize: '13px', color: '#71717a', lineHeight: '1.5' }}>
                  这是微信小程序订阅消息的机制。为确保用户体验，微信规定一次性订阅只能接收一条消息。如需持续接收，请在每次收到通知后重新订阅。
                </Text>
              </View>

              <View
                style={{
                  backgroundColor: '#111827',
                  border: '1px solid #1e3a5f',
                  borderRadius: '12px',
                  padding: '16px',
                }}
              >
                <Text style={{ fontSize: '14px', fontWeight: '500', color: '#f1f5f9', marginBottom: '6px', display: 'block' }}>
                  消息会在哪里显示？
                </Text>
                <Text style={{ fontSize: '13px', color: '#71717a', lineHeight: '1.5' }}>
                  订阅消息会显示在微信「服务通知」中，点击消息可直接跳转到小程序对应页面。
                </Text>
              </View>

              <View
                style={{
                  backgroundColor: '#111827',
                  border: '1px solid #1e3a5f',
                  borderRadius: '12px',
                  padding: '16px',
                }}
              >
                <Text style={{ fontSize: '14px', fontWeight: '500', color: '#f1f5f9', marginBottom: '6px', display: 'block' }}>
                  如何取消订阅？
                </Text>
                <Text style={{ fontSize: '13px', color: '#71717a', lineHeight: '1.5' }}>
                  点击订阅项右侧的「取消」按钮即可取消订阅。取消后将不再接收该类消息通知。
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
