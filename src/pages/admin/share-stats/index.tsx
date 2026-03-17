import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import { Network } from '@/network';
import { Share2, Globe, FileText, TrendingUp, RefreshCw, Activity } from 'lucide-react-taro';

interface ShareStats {
  totalLexicons: number;
  sharedLexicons: number;
  globalShared: number;
  recentShareActions: number;
  shareScopeStats: {
    custom?: number;
    all?: number;
    department?: number;
  };
}

export default function AdminShareStatsPage() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<ShareStats | null>(null);

  // 加载统计数据
  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await Network.request({
        url: '/api/admin/share/stats',
      });

      console.log('共享统计响应:', res.data);

      if (res.statusCode === 200 && res.data?.data) {
        setStats(res.data.data);
      }
    } catch (error) {
      console.error('加载统计失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  // 计算共享率
  const getShareRate = () => {
    if (!stats || stats.totalLexicons === 0) return 0;
    return Math.round((stats.sharedLexicons / stats.totalLexicons) * 100);
  };

  return (
    <View className="min-h-screen bg-sky-50">
      {/* 顶部导航栏 */}
      <View className="sticky top-0 z-10 bg-white px-4 py-3 border-b border-slate-200 flex justify-between items-center">
        <Text className="text-white text-lg font-bold">共享统计</Text>
        <View
          className={`p-2 rounded-lg bg-white ${loading ? 'opacity-50' : ''}`}
          onClick={loadStats}
        >
          <RefreshCw size={20} className={`text-slate-600 ${loading ? 'animate-spin' : ''}`} />
        </View>
      </View>

      <ScrollView scrollY className="flex-1 px-4 py-4">
        {/* 核心统计卡片 */}
        <View className="grid grid-cols-2 gap-3 mb-4">
          <View className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4">
            <View className="flex items-center gap-2 mb-2">
              <FileText size={20} className="text-white" />
              <Text className="text-white/80 text-sm">总语料库</Text>
            </View>
            <Text className="text-white text-3xl font-bold">{stats?.totalLexicons || 0}</Text>
          </View>
          <View className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-4">
            <View className="flex items-center gap-2 mb-2">
              <Share2 size={20} className="text-white" />
              <Text className="text-white/80 text-sm">已共享</Text>
            </View>
            <Text className="text-white text-3xl font-bold">{stats?.sharedLexicons || 0}</Text>
          </View>
          <View className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-4">
            <View className="flex items-center gap-2 mb-2">
              <Globe size={20} className="text-white" />
              <Text className="text-white/80 text-sm">全局共享</Text>
            </View>
            <Text className="text-white text-3xl font-bold">{stats?.globalShared || 0}</Text>
          </View>
          <View className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-4">
            <View className="flex items-center gap-2 mb-2">
              <Activity size={20} className="text-white" />
              <Text className="text-white/80 text-sm">近7天操作</Text>
            </View>
            <Text className="text-white text-3xl font-bold">{stats?.recentShareActions || 0}</Text>
          </View>
        </View>

        {/* 共享率概览 */}
        <View className="bg-white rounded-xl p-4 mb-4 border border-slate-200">
          <View className="flex items-center justify-between mb-3">
            <Text className="text-white font-semibold">共享率概览</Text>
            <TrendingUp size={18} className="text-sky-600" />
          </View>
          <View className="bg-white rounded-lg p-4">
            <View className="flex items-center justify-between mb-2">
              <Text className="text-gray-400 text-sm">语料库共享率</Text>
              <Text className="text-white text-2xl font-bold">{getShareRate()}%</Text>
            </View>
            <View className="w-full bg-slate-100 rounded-full h-2">
              <View
                className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full"
                style={{ width: `${getShareRate()}%` }}
              ></View>
            </View>
          </View>
        </View>

        {/* 共享范围分布 */}
        {stats?.shareScopeStats && (
          <View className="bg-white rounded-xl p-4 mb-4 border border-slate-200">
            <View className="flex items-center gap-2 mb-3">
              <TrendingUp size={18} className="text-sky-600" />
              <Text className="text-white font-semibold">共享范围分布</Text>
            </View>
            <View className="space-y-3">
              <View>
                <View className="flex justify-between mb-1">
                  <Text className="text-gray-400 text-sm">指定用户</Text>
                  <Text className="text-white text-sm">{stats.shareScopeStats.custom || 0}</Text>
                </View>
                <View className="w-full bg-white rounded-full h-2">
                  <View
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: stats.sharedLexicons > 0
                        ? `${((stats.shareScopeStats.custom || 0) / stats.sharedLexicons) * 100}%`
                        : '0%',
                    }}
                  ></View>
                </View>
              </View>
              <View>
                <View className="flex justify-between mb-1">
                  <Text className="text-gray-400 text-sm">所有人</Text>
                  <Text className="text-white text-sm">{stats.shareScopeStats.all || 0}</Text>
                </View>
                <View className="w-full bg-white rounded-full h-2">
                  <View
                    className="bg-emerald-500 h-2 rounded-full"
                    style={{
                      width: stats.sharedLexicons > 0
                        ? `${((stats.shareScopeStats.all || 0) / stats.sharedLexicons) * 100}%`
                        : '0%',
                    }}
                  ></View>
                </View>
              </View>
              <View>
                <View className="flex justify-between mb-1">
                  <Text className="text-gray-400 text-sm">同部门</Text>
                  <Text className="text-white text-sm">{stats.shareScopeStats.department || 0}</Text>
                </View>
                <View className="w-full bg-white rounded-full h-2">
                  <View
                    className="bg-purple-500 h-2 rounded-full"
                    style={{
                      width: stats.sharedLexicons > 0
                        ? `${((stats.shareScopeStats.department || 0) / stats.sharedLexicons) * 100}%`
                        : '0%',
                    }}
                  ></View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* 统计说明 */}
        <View className="bg-white/50 rounded-xl p-4 border border-slate-200">
          <Text className="text-gray-400 text-xs leading-relaxed">
            • 总语料库：系统中的所有语料库总数{'\n'}
            • 已共享：已开启共享功能的语料库数量{'\n'}
            • 全局共享：管理员设置为全局共享的语料库数量{'\n'}
            • 近7天操作：最近7天内的共享操作次数{'\n'}
            • 共享率：已共享语料库占总语料库的比例
          </Text>
        </View>

        {/* 底部空间 */}
        <View className="h-20"></View>
      </ScrollView>
    </View>
  );
}
