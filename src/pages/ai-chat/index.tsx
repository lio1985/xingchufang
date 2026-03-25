import { View, Text } from '@tarojs/components';

const StudioPage = () => {
  return (
    <View className="min-h-screen bg-[#0a0a0b] flex items-center justify-center px-6">
      <View className="text-center">
        <View className="w-20 h-20 bg-zinc-800/60 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-zinc-700/50">
          <Text className="text-3xl">🚧</Text>
        </View>
        <Text className="block text-zinc-400 text-lg mt-4">功能开发中</Text>
        <Text className="block text-zinc-500 text-sm mt-2">敬请期待</Text>
      </View>
    </View>
  );
};

export default StudioPage;
