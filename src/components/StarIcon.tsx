import React, { useEffect, useState } from 'react';
import { View } from '@tarojs/components';
import { Sparkles, Star } from 'lucide-react-taro';

interface StarIconProps {
  size?: number;
  className?: string;
}

const StarIcon: React.FC<StarIconProps> = ({ size = 40, className = '' }) => {
  const [pulse, setPulse] = useState(0);
  const [rotate, setRotate] = useState(0);

  useEffect(() => {
    // 脉冲动画
    const pulseInterval = setInterval(() => {
      setPulse(prev => (prev + 1) % 3);
    }, 1000);

    // 旋转动画
    const rotateInterval = setInterval(() => {
      setRotate(prev => (prev + 360) % 360);
    }, 8000);

    return () => {
      clearInterval(pulseInterval);
      clearInterval(rotateInterval);
    };
  }, []);

  return (
    <View className={`relative ${className}`}>
      {/* 主星星图标 */}
      <View
        className="relative"
        style={{
          width: size,
          height: size,
          transform: `rotate(${rotate}deg)`,
          transition: 'transform 8s linear',
        }}
      >
        {/* 背景光晕 */}
        <View
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(96, 165, 250, 0.4) 0%, rgba(96, 165, 250, 0) 70%)',
            transform: `scale(${1 + pulse * 0.2})`,
            transition: 'transform 1s ease-in-out',
          }}
        />

        {/* 渐变边框 */}
        <View
          className="absolute inset-[-4px] rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, #60a5fa, #a855f7, #f59e0b, #60a5fa)',
            animation: 'spin 3s linear infinite',
          }}
        >
          <View
            className="absolute inset-[1px] rounded-full bg-slate-900"
          />
        </View>

        {/* 主图标容器 */}
        <View
          className="relative w-full h-full rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500/30 to-purple-500/30"
          style={{
            boxShadow: `0 0 ${20 + pulse * 10}px rgba(96, 165, 250, 0.6)`,
          }}
        >
          <Sparkles size={size * 0.5} color="#60a5fa" strokeWidth={2.5} />
        </View>

        {/* 装饰小星星 */}
        <View
          className="absolute"
          style={{
            top: '20%',
            right: '10%',
            transform: `scale(${0.6 + pulse * 0.2})`,
            transition: 'transform 1s ease-in-out',
          }}
        >
          <Star size={size * 0.25} color="#f59e0b" strokeWidth={2} />
        </View>

        <View
          className="absolute"
          style={{
            bottom: '15%',
            left: '15%',
            transform: `scale(${0.5 + pulse * 0.15})`,
            transition: 'transform 1s ease-in-out',
          }}
        >
          <Star size={size * 0.2} color="#a855f7" strokeWidth={2} />
        </View>
      </View>

      {/* 外圈光环 */}
      <View
        className="absolute inset-0 rounded-full"
        style={{
          border: '2px solid rgba(96, 165, 250, 0.3)',
          transform: `scale(${1.3 + pulse * 0.1})`,
          transition: 'transform 1s ease-in-out',
        }}
      />
    </View>
  );
};

export default StarIcon;
