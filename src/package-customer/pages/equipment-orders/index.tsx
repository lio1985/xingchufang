import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect, useCallback } from 'react';
import {
  ShoppingCart,
  Package,
  Eye,
  ChevronRight,
  ChevronLeft,
  Plus,
  Clock,
  Phone,
  RefreshCw,
  Inbox,
} from 'lucide-react-taro';
import { Network } from '@/network';
import { colors, fontSize, spacing, containerStyles } from '@/styles/common';
import { formatRelativeTime, formatMoney } from '@/utils/format';
import { debounce } from '@/utils/loading';
import { PaginationState } from '@/types';

interface Order {
  id: string;
  order_no: string;
  order_type: 'purchase' | 'transfer';
  title: string;
  description?: string;
  category?: string;
  brand?: string;
  model?: string;
  condition?: string;
  expected_price?: number;
  customer_phone: string;
  customer_wechat?: string;
  customer_address?: string;
  status: string;
  priority: string;
  taken_by?: string;
  taken_at?: string;
  created_at: string;
  canViewDetail: boolean;
  canTake: boolean;
  canTransfer: boolean;
}

// 状态映射
const statusMap: Record<string, { text: string; color: string; bgColor: string }> = {
  published: { text: '待接单', color: '#f59e0b', bgColor: 'rgba(245, 158, 11, 0.2)' },
  taken: { text: '已接单', color: '#60a5fa', bgColor: 'rgba(59, 130, 246, 0.2)' },
  completed: { text: '已完成', color: '#4ade80', bgColor: 'rgba(34, 197, 94, 0.2)' },
  closed: { text: '已关闭', color: '#71717a', bgColor: 'rgba(113, 113, 122, 0.2)' },
};

// 优先级映射
const priorityMap: Record<string, { text: string; color: string }> = {
  low: { text: '低', color: '#71717a' },
  normal: { text: '普通', color: '#60a5fa' },
  high: { text: '高', color: '#38bdf8' },
  urgent: { text: '紧急', color: '#f87171' },
};

const PAGE_SIZE = 20;

const EquipmentOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    hasMore: true,
    total: 0,
  });

  const [activeTab, setActiveTab] = useState<'all' | 'purchase' | 'transfer'>('all');
  const [activeStatus, setActiveStatus] = useState<string>('all');

  // 获取订单列表
  const fetchOrders = useCallback(async (page: number = 1, isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
        setError(null);
      } else if (page === 1) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', String(PAGE_SIZE));
      
      if (activeTab !== 'all') {
        params.append('orderType', activeTab);
      }
      if (activeStatus !== 'all') {
        params.append('status', activeStatus);
      }

      const res = await Network.request({
        url: `/api/equipment-orders?${params.toString()}`,
        method: 'GET',
      });

      if (res.data?.success) {
        const newList = res.data.data.list || [];
        const total = res.data.data.total || 0;
        
        setOrders(prev => page === 1 ? newList : [...prev, ...newList]);
        setPagination({
          page,
          hasMore: newList.length === PAGE_SIZE,
          total,
        });
      }
    } catch (err) {
      console.error('获取订单列表失败:', err);
      setError('加载失败，请重试');
      Taro.showToast({ title: '获取列表失败', icon: 'none' });
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [activeTab, activeStatus]);

  // 初始加载和筛选变化时重新加载
  useEffect(() => {
    fetchOrders(1);
  }, [fetchOrders, activeTab, activeStatus]);

  // 下拉刷新
  const handleRefresh = () => {
    if (refreshing) return;
    fetchOrders(1, true);
  };

  // 加载更多
  const handleLoadMore = () => {
    if (loadingMore || !pagination.hasMore) return;
    fetchOrders(pagination.page + 1);
  };

  // 防抖的加载更多
  const debouncedLoadMore = debounce(handleLoadMore, 300);

  // 滚动到底部时加载更多
  const handleScrollToLower = () => {
    debouncedLoadMore();
  };

  const handleOrderClick = (orderId: string) => {
    Taro.navigateTo({ url: `/pages/equipment-orders/detail?id=${orderId}` });
  };

  const handleCreateOrder = () => {
    Taro.navigateTo({ url: '/package-customer/pages/equipment-orders/create' });
  };

  // 渲染加载状态
  const renderLoadingState = () => (
    <View style={containerStyles.centerColumn}>
      <RefreshCw size={32} color={colors.primary} />
      <Text style={{ fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.md }}>
        加载中...
      </Text>
    </View>
  );

  // 渲染错误状态
  const renderErrorState = () => (
    <View style={containerStyles.centerColumn}>
      <Inbox size={48} color={colors.error} />
      <Text style={{ fontSize: fontSize.base, color: colors.textSecondary, marginTop: spacing.lg }}>
        {error || '加载失败'}
      </Text>
      <View
        style={{
          marginTop: spacing.lg,
          padding: `${spacing.sm} ${spacing.xl}`,
          backgroundColor: colors.primary,
          borderRadius: spacing.md,
        }}
        onClick={() => fetchOrders(1)}
      >
        <Text style={{ fontSize: fontSize.sm, color: colors.textPrimary }}>重试</Text>
      </View>
    </View>
  );

  // 渲染空状态
  const renderEmptyState = () => (
    <View style={containerStyles.centerColumn}>
      <Inbox size={64} color={colors.textDisabled} />
      <Text style={{ fontSize: fontSize.lg, color: colors.textSecondary, marginTop: spacing.lg, fontWeight: '600' }}>
        暂无订单
      </Text>
      <Text style={{ fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.sm }}>
        当前筛选条件下没有订单数据
      </Text>
    </View>
  );

  // 渲染加载更多
  const renderLoadMore = () => {
    if (!pagination.hasMore) {
      return (
        <View style={{ padding: spacing.xl, textAlign: 'center' }}>
          <Text style={{ fontSize: fontSize.sm, color: colors.textDisabled }}>
            没有更多了
          </Text>
        </View>
      );
    }

    return (
      <View
        style={{
          padding: spacing.xl,
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing.sm,
        }}
        onClick={loadingMore ? undefined : handleLoadMore}
      >
        {loadingMore ? (
          <>
            <RefreshCw size={16} color={colors.textMuted} />
            <Text style={{ fontSize: fontSize.sm, color: colors.textMuted }}>
              加载中...
            </Text>
          </>
        ) : (
          <Text style={{ fontSize: fontSize.sm, color: colors.primary }}>
            点击加载更多
          </Text>
        )}
      </View>
    );
  };

  // 渲染订单卡片
  const renderOrderCard = (order: Order) => {
    const statusInfo = statusMap[order.status] || statusMap.published;
    const priorityInfo = priorityMap[order.priority] || priorityMap.normal;

    return (
      <View
        key={order.id}
        style={containerStyles.listItem}
        onClick={() => handleOrderClick(order.id)}
      >
        {/* 头部 */}
        <View style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: spacing.md }}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginBottom: '4px' }}>
              {order.order_type === 'purchase' ? (
                <ShoppingCart size={16} color="#60a5fa" />
              ) : (
                <Package size={16} color="#4ade80" />
              )}
              <Text style={{ fontSize: fontSize.md, fontWeight: '600', color: colors.textPrimary }}>
                {order.title}
              </Text>
            </View>
            <Text style={{ fontSize: fontSize.xs, color: colors.textDisabled }}>{order.order_no}</Text>
          </View>
          <View style={{ padding: '4px 10px', borderRadius: '12px', backgroundColor: statusInfo.bgColor }}>
            <Text style={{ fontSize: fontSize.xs, color: statusInfo.color, fontWeight: '500' }}>
              {statusInfo.text}
            </Text>
          </View>
        </View>

        {/* 标签 */}
        <View style={{ display: 'flex', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md }}>
          {order.category && (
            <View style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: colors.backgroundTertiary }}>
              <Text style={{ fontSize: fontSize.xs, color: colors.textMuted }}>{order.category}</Text>
            </View>
          )}
          {order.brand && (
            <View style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: colors.backgroundTertiary }}>
              <Text style={{ fontSize: fontSize.xs, color: colors.textMuted }}>{order.brand}</Text>
            </View>
          )}
          {order.expected_price && (
            <View style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(34, 197, 94, 0.2)' }}>
              <Text style={{ fontSize: fontSize.xs, color: colors.success }}>
                {formatMoney(order.expected_price, 0)}
              </Text>
            </View>
          )}
          <View style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: priorityInfo.color + '20' }}>
            <Text style={{ fontSize: fontSize.xs, color: priorityInfo.color }}>{priorityInfo.text}优先</Text>
          </View>
        </View>

        {/* 联系方式 */}
        <View style={{ display: 'flex', alignItems: 'center', gap: spacing.lg, marginBottom: spacing.md }}>
          <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Phone size={12} color={colors.textDisabled} />
            <Text style={{ fontSize: fontSize.xs, color: colors.textDisabled }}>{order.customer_phone}</Text>
          </View>
          {order.customer_address && (
            <Text style={{ fontSize: fontSize.xs, color: colors.textDisabled }}>{order.customer_address}</Text>
          )}
        </View>

        {/* 底部 */}
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${colors.border}`, paddingTop: spacing.md }}>
          <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={14} color={colors.textDisabled} />
            <Text style={{ fontSize: fontSize.xs, color: colors.textDisabled }}>
              {formatRelativeTime(order.created_at)}
            </Text>
          </View>
          <View style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
            {order.canTake && (
              <View style={{ padding: '6px 12px', borderRadius: '6px', backgroundColor: colors.primary }}>
                <Text style={{ fontSize: fontSize.xs, color: colors.background, fontWeight: '500' }}>立即接单</Text>
              </View>
            )}
            {order.canViewDetail && (
              <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Eye size={14} color={colors.primary} />
                <Text style={{ fontSize: fontSize.xs, color: colors.primary }}>查看详情</Text>
              </View>
            )}
            <ChevronRight size={16} color={colors.textDisabled} />
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={containerStyles.page}>
      {/* 页面头部 */}
      <View style={{ padding: '48px 20px 16px', backgroundColor: colors.backgroundSecondary, borderBottom: `1px solid ${colors.border}` }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm }}>
          <View style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
            <View
              style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: colors.border, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => Taro.switchTab({ url: '/pages/tab-customer/index' })}
            >
              <ChevronLeft size={24} color={colors.textSecondary} />
            </View>
            <View style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
              <ShoppingCart size={24} color={colors.primary} />
              <Text style={{ fontSize: fontSize.xxl, fontWeight: '700', color: colors.textPrimary }}>获取客资</Text>
            </View>
          </View>
          <View
            style={{
              padding: `${spacing.sm} ${spacing.lg}`,
              borderRadius: spacing.md,
              backgroundColor: colors.primary,
              display: 'flex',
              alignItems: 'center',
              gap: spacing.sm,
            }}
            onClick={handleCreateOrder}
          >
            <Plus size={16} color={colors.background} />
            <Text style={{ fontSize: fontSize.base, fontWeight: '500', color: colors.background }}>发布</Text>
          </View>
        </View>
        <Text style={{ fontSize: fontSize.xs, color: colors.textDisabled, marginLeft: '52px' }}>
          客户求购 / 转让信息接单获取客资
        </Text>
      </View>

      {/* 类型筛选 */}
      <View style={{ backgroundColor: colors.backgroundSecondary, padding: `${spacing.md} ${spacing.xl}`, borderBottom: `1px solid ${colors.border}` }}>
        <View style={{ display: 'flex', gap: spacing.sm }}>
          {[
            { key: 'all', label: '全部' },
            { key: 'purchase', label: '求购' },
            { key: 'transfer', label: '转让' },
          ].map((tab) => (
            <View
              key={tab.key}
              style={{
                padding: `${spacing.sm} ${spacing.lg}`,
                borderRadius: '20px',
                backgroundColor: activeTab === tab.key ? colors.primary : colors.backgroundTertiary,
                flexShrink: 0,
              }}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
            >
              <Text style={{ fontSize: fontSize.xs, color: activeTab === tab.key ? colors.background : colors.textMuted, fontWeight: '500' }}>
                {tab.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* 状态筛选 */}
      <ScrollView scrollX style={{ backgroundColor: colors.backgroundSecondary, padding: `${spacing.md} ${spacing.xl}`, whiteSpace: 'nowrap' }}>
        <View style={{ display: 'inline-flex', gap: spacing.sm }}>
          {[
            { key: 'all', label: '全部状态' },
            { key: 'published', label: '待接单' },
            { key: 'taken', label: '已接单' },
            { key: 'completed', label: '已完成' },
            { key: 'closed', label: '已关闭' },
          ].map((status) => (
            <View
              key={status.key}
              style={{
                padding: `${spacing.xs} ${spacing.md}`,
                borderRadius: '16px',
                backgroundColor: activeStatus === status.key ? 'rgba(56, 189, 248, 0.2)' : colors.background,
                border: activeStatus === status.key ? `1px solid ${colors.primary}` : `1px solid ${colors.border}`,
                flexShrink: 0,
              }}
              onClick={() => setActiveStatus(status.key)}
            >
              <Text style={{ fontSize: fontSize.xs, color: activeStatus === status.key ? colors.primary : colors.textDisabled }}>
                {status.label}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 订单列表 */}
      <ScrollView
        scrollY
        style={{ height: 'calc(100vh - 220px)' }}
        refresherEnabled
        refresherTriggered={refreshing}
        onRefresherRefresh={handleRefresh}
        onScrollToLower={handleScrollToLower}
      >
        <View style={{ padding: `${spacing.lg} ${spacing.xl}` }}>
          {/* 加载状态 */}
          {loading && orders.length === 0 && renderLoadingState()}

          {/* 错误状态 */}
          {error && orders.length === 0 && renderErrorState()}

          {/* 空状态 */}
          {!loading && !error && orders.length === 0 && renderEmptyState()}

          {/* 订单列表 */}
          {orders.length > 0 && (
            <>
              {/* 下拉刷新提示 */}
              {refreshing && (
                <View style={{ textAlign: 'center', padding: spacing.md }}>
                  <Text style={{ fontSize: fontSize.xs, color: colors.textMuted }}>刷新中...</Text>
                </View>
              )}

              {/* 订单卡片 */}
              {orders.map(renderOrderCard)}

              {/* 加载更多 */}
              {renderLoadMore()}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default EquipmentOrdersPage;
