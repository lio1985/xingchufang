import { View, Text } from '@tarojs/components';
import { ChevronRight } from 'lucide-react-taro';
import * as LucideIcons from 'lucide-react-taro';

interface CoreCardProps {
  title: string;
  desc: string;
  icon: string;
  gradient: string;
  url: string;
  onNavigate: (url: string) => void;
}

const CoreCard: React.FC<CoreCardProps> = ({
  title,
  desc,
  icon,
  gradient,
  url,
  onNavigate,
}) => {
  // 动态获取图标组件
  const IconComponent = (LucideIcons as any)[icon] || LucideIcons.Users;

  return (
    <View
      className={`flex-1 bg-gradient-to-br ${gradient} rounded-2xl p-5 shadow-lg active:scale-[0.98] transition-transform`}
      onClick={() => onNavigate(url)}
    >
      {/* 图标 */}
      <View 
        className="w-14 h-14 rounded-xl flex items-center justify-center mb-3"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
      >
        <IconComponent size={28} color="#FFFFFF" />
      </View>

      {/* 标题 */}
      <Text className="block text-lg font-bold text-white mb-1">{title}</Text>
      
      {/* 描述 */}
      <Text className="block text-sm text-white/90 mb-3">{desc}</Text>

      {/* 引导箭头 */}
      <View className="flex items-center justify-end">
        <View className="flex items-center gap-1">
          <Text className="text-sm text-white/80">进入</Text>
          <ChevronRight size={16} color="rgba(255, 255, 255, 0.8)" />
        </View>
      </View>
    </View>
  );
};

export default CoreCard;
