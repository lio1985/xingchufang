import { View, Text, ScrollView } from '@tarojs/components';
import { useState, useEffect } from 'react';
import { Clock, TrendingUp } from 'lucide-react-taro';

interface TimelineData {
  time: string;
  hotness: number;
  event: string;
}

interface TimelineChartProps {
  data: TimelineData[];
}

// 生成唯一的 gradient id
let gradientIdCounter = 0;
const getGradientId = () => `timeline-gradient-${gradientIdCounter++}`;

export default function TimelineChart({ data }: TimelineChartProps) {
  const [maxHotness, setMaxHotness] = useState(0);
  const [gradientId] = useState(() => getGradientId());

  useEffect(() => {
    if (data && data.length > 0) {
      const max = Math.max(...data.map(d => d.hotness));
      setMaxHotness(max > 0 ? max * 1.1 : 100); // 留10%的顶部空间，至少为100
    }
  }, [data]);

  if (!data || data.length === 0) {
    return null;
  }

  // 防止除零错误
  if (data.length === 1) {
    return (
      <View className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
        <View className="flex items-center gap-2 mb-4">
          <Clock size={18} color="#06b6d4" strokeWidth={2} />
          <Text className="block text-base font-bold text-white">📈 热度时间轴</Text>
        </View>
        <View className="flex items-center justify-center h-40">
          <Text className="text-sm text-slate-400">数据点不足，无法显示趋势图</Text>
        </View>
      </View>
    );
  }

  // 计算点坐标（防止除零错误）
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((maxHotness > 0 ? item.hotness / maxHotness : 0) * 80); // 留20%的底部空间
    return { x, y, ...item };
  });

  // 生成SVG路径
  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  // 生成填充区域路径
  const areaPathD = `${pathD} L ${points[points.length - 1].x} 100 L ${points[0].x} 100 Z`;

  return (
    <View className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50">
      <View className="flex items-center gap-2 mb-4">
        <Clock size={18} color="#06b6d4" strokeWidth={2} />
        <Text className="block text-base font-bold text-white">📈 热度时间轴</Text>
        <View className="ml-auto flex items-center gap-1">
          <TrendingUp size={12} color="#06b6d4" strokeWidth={2} />
          <Text className="text-xs text-cyan-400">趋势分析</Text>
        </View>
      </View>

      {/* SVG 图表 */}
      <View className="relative h-40 mb-4">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full"
          style={{ overflow: 'visible' }}
        >
          {/* 填充区域 */}
          <path
            d={areaPathD}
            fill={`url(#${gradientId})`}
            opacity="0.3"
          />

          {/* 渐变定义 */}
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* 折线 */}
          <path
            d={pathD}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 数据点 */}
          {points.map((point, index) => (
            <g key={index}>
              {/* 外圈光晕 */}
              <circle
                cx={point.x}
                cy={point.y}
                r="3"
                fill="#06b6d4"
                opacity="0.3"
              />
              {/* 内圆点 */}
              <circle
                cx={point.x}
                cy={point.y}
                r="1.5"
                fill="#fff"
              />
            </g>
          ))}
        </svg>

        {/* 最高热度标签 */}
        <View
          className="absolute top-0 right-0 bg-cyan-500/20 border border-cyan-500/50 rounded px-2 py-1"
          style={{
            top: `${100 - (points[points.length - 1]?.hotness / maxHotness) * 80 - 5}%`,
            right: '0'
          }}
        >
          <Text className="text-xs text-cyan-400 font-medium">
            {formatHotness(points[points.length - 1]?.hotness || 0)}
          </Text>
        </View>
      </View>

      {/* 时间轴事件列表 */}
      <ScrollView
        scrollX
        className="flex gap-3 pb-2"
        style={{ whiteSpace: 'nowrap' }}
      >
        {points.map((point, index) => (
          <View
            key={index}
            className="flex-shrink-0 bg-slate-700/30 rounded-lg p-3 min-w-[120px]"
          >
            <Text className="text-xs text-slate-400 mb-1">{point.time}</Text>
            <View className="flex items-center gap-1 mb-1">
              <TrendingUp size={10} color="#fbbf24" strokeWidth={2} />
              <Text className="text-sm text-amber-400 font-medium">
                {formatHotness(point.hotness)}
              </Text>
            </View>
            <Text className="text-xs text-slate-300 leading-tight">{point.event}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// 格式化热度值
function formatHotness(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}
