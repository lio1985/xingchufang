import { View } from '@tarojs/components';

interface SkeletonProps {
  rows?: number;
  className?: string;
}

/**
 * 骨架屏组件
 * 用于加载状态展示
 */
export const Skeleton = ({ rows = 3, className = '' }: SkeletonProps) => {
  return (
    <View className={`animate-pulse ${className}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <View
          key={index}
          className="h-4 bg-slate-700 rounded mb-3"
          style={{ width: `${Math.random() * 30 + 70}%` }}
        />
      ))}
    </View>
  );
};

export default Skeleton;
