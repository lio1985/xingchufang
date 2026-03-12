import { View, ScrollView } from '@tarojs/components';
import { useState, useEffect } from 'react';

/**
 * 虚拟滚动列表组件
 * 适用于大量数据（>100条）的场景，提升渲染性能
 *
 * 使用示例：
 * <VirtualList
 *   data={items}
 *   itemHeight={100}
 *   renderItem={(item) => <ItemComponent data={item} />}
 *   estimatedHeight={60}
 * />
 */

export interface VirtualListProps<T = any> {
  /** 数据列表 */
  data: T[];
  /** 每项的高度（固定高度） */
  itemHeight: number;
  /** 渲染每一项的函数 */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** 预估容器高度（用于滚动区域） */
  estimatedHeight?: number;
  /** 缓冲区大小（额外渲染的项数） */
  bufferSize?: number;
  /** 列表底部加载提示 */
  loadingMore?: boolean;
  /** 滚动到底部时的回调 */
  onLoadMore?: () => void;
  /** 自定义样式 */
  className?: string;
}

function VirtualList<T>({
  data,
  itemHeight,
  renderItem,
  estimatedHeight = 600,
  bufferSize = 5,
  loadingMore = false,
  onLoadMore,
  className = '',
}: VirtualListProps<T>) {
  const [visibleData, setVisibleData] = useState<{ start: number; end: number }>({ start: 0, end: Math.min(data.length, 10) });
  const [scrollTop, setScrollTop] = useState(0);

  // 计算可见区域的数据范围
  useEffect(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize);
    const end = Math.min(data.length, Math.ceil((scrollTop + estimatedHeight) / itemHeight) + bufferSize);

    setVisibleData({ start, end });
  }, [scrollTop, itemHeight, data.length, bufferSize, estimatedHeight]);

  // 处理滚动事件
  const handleScroll = (e: any) => {
    const newScrollTop = e.detail.scrollTop;
    setScrollTop(newScrollTop);

    // 检测是否滚动到底部
    if (onLoadMore && !loadingMore) {
      const scrollHeight = data.length * itemHeight;
      const clientHeight = estimatedHeight;
      const threshold = 100; // 提前100px触发加载更多

      if (scrollHeight - newScrollTop - clientHeight < threshold) {
        onLoadMore();
      }
    }
  };

  // 计算占位高度
  const totalHeight = data.length * itemHeight;

  // 计算上偏移量
  const offsetY = visibleData.start * itemHeight;

  return (
    <View className={`virtual-list-container ${className}`} style={{ height: estimatedHeight }}>
      <ScrollView
        scrollY
        style={{ height: '100%' }}
        scrollTop={scrollTop}
        onScroll={handleScroll}
        scrollWithAnimation={false}
        lowerThreshold={100}
      >
        <View style={{ height: totalHeight, position: 'relative' }}>
          {/* 占位顶部区域 */}
          <View style={{ height: offsetY }} />

          {/* 可见区域的数据 */}
          {data.slice(visibleData.start, visibleData.end).map((item, index) => (
            <View
              key={visibleData.start + index}
              style={{
                height: itemHeight,
                position: 'absolute',
                top: (visibleData.start + index) * itemHeight,
                width: '100%',
              }}
            >
              {renderItem(item, visibleData.start + index)}
            </View>
          ))}
        </View>

        {/* 加载更多提示 */}
        {loadingMore && (
          <View
            style={{
              padding: '20px',
              textAlign: 'center',
              color: '#94a3b8',
              fontSize: '14px',
            }}
          >
            加载中...
          </View>
        )}
      </ScrollView>
    </View>
  );
}

export default VirtualList;
