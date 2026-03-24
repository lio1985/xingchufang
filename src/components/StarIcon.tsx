import React, { useEffect, useState } from 'react';
import { View, Text } from '@tarojs/components';

interface StarIconProps {
  size?: number;
  className?: string;
}

const StarIcon: React.FC<StarIconProps> = ({ size = 40, className = '' }) => {
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setPulse(prev => (prev + 1) % 3);
    }, 1000);
    return () => clearInterval(pulseInterval);
  }, []);

  return (
    <View className={`relative ${className}`} style={{ width: size, height: size }}>
      <Text style={{ fontSize: size * 0.7, transform: `scale(${1 + pulse * 0.1})` }}>
        ✨
      </Text>
    </View>
  );
};

export default StarIcon;
