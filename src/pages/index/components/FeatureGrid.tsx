import { View, Text } from '@tarojs/components';
import * as LucideIcons from 'lucide-react-taro';

interface FeatureGridProps {
  features: Array<{
    id: string;
    title: string;
    desc: string;
    icon: string;
    color: string;
    bgColor: string;
    url: string;
  }>;
  onNavigate: (url: string) => void;
}

const FeatureGrid: React.FC<FeatureGridProps> = ({ features, onNavigate }) => {
  return (
    <View className="grid grid-cols-3 gap-3">
      {features.map((feature) => {
        const IconComponent = (LucideIcons as any)[feature.icon] || LucideIcons.Star;
        
        return (
          <View
            key={feature.id}
            className="bg-white rounded-xl p-4 shadow-sm active:scale-[0.98] transition-transform"
            style={{ boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}
            onClick={() => onNavigate(feature.url)}
          >
            {/* 图标背景 */}
            <View
              className="w-10 h-10 rounded-lg flex items-center justify-center mb-2"
              style={{ backgroundColor: feature.bgColor }}
            >
              <IconComponent size={20} color={feature.color} />
            </View>

            {/* 标题 */}
            <Text className="block text-sm font-semibold text-slate-800 mb-1">
              {feature.title}
            </Text>

            {/* 描述 */}
            <Text className="block text-xs text-slate-500 leading-relaxed">
              {feature.desc}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

export default FeatureGrid;
