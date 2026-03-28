import { useState, useEffect } from 'react';
import Taro, { useRouter } from '@tarojs/taro';
import { View, Text, ScrollView, Textarea } from '@tarojs/components';
import { Network } from '@/network';
import {
  ArrowLeft,
  Phone,
  MapPin,
  MessageCircle,
  Pencil,
  Trash2,
  Clock,
  Store,
  Navigation,
  X,
} from 'lucide-react-taro';

interface RecycleStore {
  id: string;
  store_name: string;
  phone?: string;
  wechat?: string;
  xiaohongshu?: string;
  douyin?: string;
  city?: string;
  address?: string;
  location?: { latitude: number; longitude: number };
  business_type?: string;
  area_size?: number;
  open_date?: string;
  close_reason?: string;
  recycle_status: 'pending' | 'contacted' | 'assessing' | 'negotiating' | 'deal' | 'recycling' | 'completed' | 'cancelled';
  estimated_devices?: string;
  estimated_value?: number;
  purchase_price?: number;
  transport_cost?: number;
  labor_cost?: number;
  total_cost?: number;
  recycle_date?: string;
  device_count?: number;
  device_status?: string;
  first_follow_up_at?: string;
  updated_at: string;
}

interface FollowUp {
  id: string;
  follow_up_time: string;
  content: string;
  follow_up_method?: string;
  next_follow_up_plan?: string;
  status_change?: string;
}

const statusMap = {
  pending: { label: '待接触', color: '#71717a', bgColor: 'rgba(113, 113, 122, 0.2)' },
  contacted: { label: '已接触', color: '#60a5fa', bgColor: 'rgba(59, 130, 246, 0.2)' },
  assessing: { label: '评估中', color: '#a855f7', bgColor: 'rgba(168, 85, 247, 0.2)' },
  negotiating: { label: '谈判中', color: '#38bdf8', bgColor: 'rgba(245, 158, 11, 0.2)' },
  deal: { label: '已签约', color: '#4ade80', bgColor: 'rgba(34, 197, 94, 0.2)' },
  recycling: { label: '回收中', color: '#06b6d4', bgColor: 'rgba(6, 182, 212, 0.2)' },
  completed: { label: '已完成', color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.2)' },
  cancelled: { label: '已取消', color: '#f87171', bgColor: 'rgba(239, 68, 68, 0.2)' }
};

export default function RecycleStoreDetail() {
  const router = useRouter();
  const { id } = router.params;

  const [store, setStore] = useState<RecycleStore | null>(null);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [showAddFollowUp, setShowAddFollowUp] = useState(false);
  const [followUpContent, setFollowUpContent] = useState('');
  const [followUpMethod, setFollowUpMethod] = useState('电话');

  const loadData = async () => {
    if (!id) return;
    try {
      const [storeRes, followUpsRes] = await Promise.all([
        Network.request({ url: `/api/recycle/stores/${id}` }),
        Network.request({ url: `/api/recycle/stores/${id}/follow-ups` })
      ]);

      console.log('[RecycleDetail] Load data:', { store: storeRes.data, followUps: followUpsRes.data });

      if (storeRes.data.code === 200) {
        setStore(storeRes.data.data);
      }
      if (followUpsRes.data.code === 200) {
        setFollowUps(followUpsRes.data.data || []);
      }
    } catch (err) {
      console.error('[RecycleDetail] Load data error:', err);
      Taro.showToast({ title: '加载失败', icon: 'none' });
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddFollowUp = async () => {
    if (!followUpContent.trim()) {
      Taro.showToast({ title: '请输入跟进内容', icon: 'none' });
      return;
    }

    try {
      const res = await Network.request({
        url: `/api/recycle/stores/${id}/follow-ups`,
        method: 'POST',
        data: {
          followUpTime: new Date().toISOString(),
          content: followUpContent,
          followUpMethod: followUpMethod
        }
      });

      console.log('[RecycleDetail] Add follow-up:', res.data);

      if (res.data.code === 200) {
        Taro.showToast({ title: '添加成功', icon: 'success' });
        setFollowUpContent('');
        setShowAddFollowUp(false);
        loadData();
      } else {
        Taro.showToast({ title: res.data.msg || '添加失败', icon: 'none' });
      }
    } catch (err) {
      console.error('[RecycleDetail] Add follow-up error:', err);
      Taro.showToast({ title: '添加失败', icon: 'none' });
    }
  };

  const handleDelete = async () => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除此回收门店吗？',
      success: async (modalRes) => {
        if (modalRes.confirm) {
          try {
            const res = await Network.request({
              url: `/api/recycle/stores/${id}`,
              method: 'DELETE'
            });

            if (res.data.code === 200) {
              Taro.showToast({ title: '删除成功', icon: 'success' });
              setTimeout(() => {
                Taro.navigateBack();
              }, 1500);
            } else {
              Taro.showToast({ title: res.data.msg || '删除失败', icon: 'none' });
            }
          } catch (err) {
            console.error('[RecycleDetail] Delete error:', err);
            Taro.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  };

  const goBack = () => {
    Taro.navigateBack();
  };

  const goEdit = () => {
    Taro.navigateTo({ url: `/pages/recycle/edit?id=${id}` });
  };

  const openLocation = () => {
    if (store?.location) {
      Taro.openLocation({
        latitude: store.location.latitude,
        longitude: store.location.longitude,
        name: store.store_name,
        address: store.address || store.city || ''
      });
    }
  };

  const makePhoneCall = () => {
    if (store?.phone) {
      Taro.makePhoneCall({ phoneNumber: store.phone });
    }
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  if (!store) {
    return (
      <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#71717a' }}>加载中...</Text>
      </View>
    );
  }

  const statusConfig = statusMap[store.recycle_status];

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a' }}>
      {/* 头部 */}
      <View style={{ padding: '48px 20px 20px', backgroundColor: '#111827' }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ display: 'flex', alignItems: 'center' }} onClick={goBack}>
            <ArrowLeft size={20} color="#ffffff" />
          </View>
          <View style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <View onClick={goEdit}>
              <Pencil size={20} color="#94a3b8" />
            </View>
            <View onClick={handleDelete}>
              <Trash2 size={20} color="#f87171" />
            </View>
          </View>
        </View>

        <View style={{ marginTop: '20px' }}>
          <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Store size={24} color="#60a5fa" />
            <Text style={{ fontSize: '22px', fontWeight: '700', color: '#ffffff' }}>{store.store_name}</Text>
          </View>
          <View style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 12px', borderRadius: '8px', backgroundColor: statusConfig.bgColor }}>
            <Text style={{ fontSize: '13px', color: statusConfig.color }}>{statusConfig.label}</Text>
          </View>
        </View>
      </View>

      <ScrollView scrollY style={{ height: 'calc(100vh - 180px)' }}>
        {/* 核心数据卡片 */}
        <View style={{ padding: '16px 20px' }}>
          <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '16px', padding: '20px' }}>
            <View style={{ display: 'flex', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, textAlign: 'center' }}>
                <Text style={{ fontSize: '28px', fontWeight: '700', color: '#60a5fa' }}>
                  ¥{(store.estimated_value || 0).toFixed(0)}
                </Text>
                <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>预估价值（元）</Text>
              </View>
              {store.total_cost && (
                <>
                  <View style={{ width: '1px', backgroundColor: '#1e3a5f' }} />
                  <View style={{ flex: 1, textAlign: 'center' }}>
                    <Text style={{ fontSize: '28px', fontWeight: '700', color: '#4ade80' }}>
                      ¥{store.total_cost.toFixed(0)}
                    </Text>
                    <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>总成本（元）</Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>

        {/* 联系方式 */}
        <View style={{ padding: '0 20px' }}>
          <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px' }}>
            <Text style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', display: 'block', marginBottom: '12px' }}>联系方式</Text>
            
            <View style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #1e3a5f' }} onClick={makePhoneCall}>
              <Phone size={16} color="#60a5fa" />
              <Text style={{ fontSize: '14px', color: '#ffffff', marginLeft: '12px', flex: 1 }}>{store.phone || '未填写'}</Text>
              {store.phone && <Text style={{ fontSize: '12px', color: '#60a5fa' }}>拨打</Text>}
            </View>
            
            <View style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #1e3a5f' }}>
              <MessageCircle size={16} color="#4ade80" />
              <Text style={{ fontSize: '14px', color: '#ffffff', marginLeft: '12px' }}>{store.wechat || '未填写'}</Text>
            </View>
            
            <View style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #1e3a5f' }}>
              <Text style={{ fontSize: '12px', color: '#f87171', marginLeft: '28px' }}>小红书: {store.xiaohongshu || '未填写'}</Text>
            </View>
            
            <View style={{ display: 'flex', alignItems: 'center', padding: '12px 0' }}>
              <Text style={{ fontSize: '12px', color: '#a855f7', marginLeft: '28px' }}>抖音: {store.douyin || '未填写'}</Text>
            </View>
          </View>
        </View>

        {/* 位置信息 */}
        <View style={{ padding: '16px 20px 0' }}>
          <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px' }} onClick={openLocation}>
            <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ display: 'flex', alignItems: 'center' }}>
                <MapPin size={16} color="#38bdf8" />
                <View style={{ marginLeft: '12px' }}>
                  <Text style={{ fontSize: '14px', color: '#ffffff' }}>{store.city || '未填写城市'}</Text>
                  <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '2px' }}>{store.address || '未填写地址'}</Text>
                </View>
              </View>
              {store.location && <Navigation size={18} color="#60a5fa" />}
            </View>
          </View>
        </View>

        {/* 业务信息 */}
        <View style={{ padding: '16px 20px 0' }}>
          <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px' }}>
            <Text style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', display: 'block', marginBottom: '12px' }}>业务信息</Text>

            <View style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
              <Text style={{ fontSize: '13px', color: '#71717a' }}>餐饮类别</Text>
              <Text style={{ fontSize: '13px', color: '#ffffff' }}>{store.business_type || '未填写'}</Text>
            </View>
            <View style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
              <Text style={{ fontSize: '13px', color: '#71717a' }}>面积</Text>
              <Text style={{ fontSize: '13px', color: '#ffffff' }}>{store.area_size ? `${store.area_size}㎡` : '未填写'}</Text>
            </View>
            <View style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
              <Text style={{ fontSize: '13px', color: '#71717a' }}>开业时间</Text>
              <Text style={{ fontSize: '13px', color: '#ffffff' }}>{store.open_date || '未填写'}</Text>
            </View>
            {store.close_reason && (
              <View style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px solid #1e3a5f' }}>
                <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginBottom: '4px' }}>关店原因</Text>
                <Text style={{ fontSize: '13px', color: '#94a3b8' }}>{store.close_reason}</Text>
              </View>
            )}
          </View>
        </View>

        {/* 回收信息 */}
        {(store.estimated_devices || store.purchase_price || store.recycle_date) && (
          <View style={{ padding: '16px 20px 0' }}>
            <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px' }}>
              <Text style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff', display: 'block', marginBottom: '12px' }}>回收信息</Text>

              {store.estimated_devices && (
                <View style={{ marginBottom: '12px' }}>
                  <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginBottom: '4px' }}>预估设备清单</Text>
                  <Text style={{ fontSize: '13px', color: '#94a3b8' }}>{store.estimated_devices}</Text>
                </View>
              )}
              
              {store.purchase_price && (
                <View style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <Text style={{ fontSize: '13px', color: '#71717a' }}>收购价格</Text>
                  <Text style={{ fontSize: '14px', fontWeight: '600', color: '#4ade80' }}>¥{store.purchase_price.toFixed(0)}</Text>
                </View>
              )}
              
              {store.recycle_date && (
                <View style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <Text style={{ fontSize: '13px', color: '#71717a' }}>回收日期</Text>
                  <Text style={{ fontSize: '13px', color: '#ffffff' }}>{store.recycle_date}</Text>
                </View>
              )}
              
              {store.device_count && (
                <View style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <Text style={{ fontSize: '13px', color: '#71717a' }}>设备数量</Text>
                  <Text style={{ fontSize: '13px', color: '#ffffff' }}>{store.device_count}台</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* 跟进记录 */}
        <View style={{ padding: '16px 20px 80px' }}>
          <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px' }}>
            <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <Text style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>跟进记录</Text>
              <View
                style={{ backgroundColor: '#60a5fa', borderRadius: '20px', padding: '6px 12px', display: 'flex', alignItems: 'center' }}
                onClick={() => setShowAddFollowUp(true)}
              >
                <Text style={{ fontSize: '12px', color: '#ffffff' }}>+ 新增</Text>
              </View>
            </View>

            {followUps.length === 0 ? (
              <View style={{ textAlign: 'center', padding: '24px 0' }}>
                <Clock size={24} color="#64748b" />
                <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginTop: '8px' }}>暂无跟进记录</Text>
              </View>
            ) : (
              <View>
                {followUps.map((followUp) => (
                  <View key={followUp.id} style={{ borderLeft: '2px solid #60a5fa', paddingLeft: '12px', marginBottom: '16px' }}>
                    <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <Text style={{ fontSize: '12px', color: '#64748b' }}>{formatDateTime(followUp.follow_up_time)}</Text>
                      {followUp.follow_up_method && (
                        <View style={{ backgroundColor: '#1e3a5f', borderRadius: '4px', padding: '2px 8px' }}>
                          <Text style={{ fontSize: '11px', color: '#71717a' }}>{followUp.follow_up_method}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={{ fontSize: '14px', color: '#94a3b8', display: 'block' }}>{followUp.content}</Text>
                    {followUp.next_follow_up_plan && (
                      <View style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #1e3a5f' }}>
                        <Text style={{ fontSize: '12px', color: '#38bdf8' }}>下次计划：{followUp.next_follow_up_plan}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* 新增跟进弹窗 */}
      {showAddFollowUp && (
        <View style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', alignItems: 'flex-end', zIndex: 100 }}>
          <View style={{ backgroundColor: '#111827', width: '100%', borderRadius: '20px 20px 0 0', padding: '20px' }}>
            <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <Text style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>新增跟进记录</Text>
              <View onClick={() => setShowAddFollowUp(false)}>
                <X size={20} color="#71717a" />
              </View>
            </View>

            <View style={{ marginBottom: '16px' }}>
              <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginBottom: '8px' }}>跟进方式</Text>
              <View style={{ display: 'flex', gap: '8px' }}>
                {['电话', '微信', '上门'].map((method) => (
                  <View
                    key={method}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      backgroundColor: followUpMethod === method ? '#60a5fa' : '#1e3a5f'
                    }}
                    onClick={() => setFollowUpMethod(method)}
                  >
                    <Text style={{ fontSize: '13px', color: followUpMethod === method ? '#ffffff' : '#94a3b8' }}>{method}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={{ marginBottom: '20px' }}>
              <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginBottom: '8px' }}>跟进内容</Text>
              <View style={{ backgroundColor: '#1e3a5f', borderRadius: '12px', padding: '12px' }}>
                <Textarea
                  style={{ width: '100%', minHeight: '100px', fontSize: '14px', color: '#ffffff', backgroundColor: 'transparent' }}
                  placeholder="请输入跟进内容"
                  placeholderStyle="color: #64748b"
                  value={followUpContent}
                  onInput={(e) => setFollowUpContent(e.detail.value)}
                />
              </View>
            </View>

            <View
              style={{ backgroundColor: '#60a5fa', borderRadius: '12px', padding: '14px', textAlign: 'center' }}
              onClick={handleAddFollowUp}
            >
              <Text style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff' }}>确定添加</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
