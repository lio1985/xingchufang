import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  BookOpen,
  Lock,
} from 'lucide-react-taro';
import { Network } from '@/network';

interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  article_count: number;
}

interface CompanyStats {
  total: number;
  categories: number;
  weeklyUpdates: number;
}

const KnowledgeSharePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<CompanyStats>({ total: 0, categories: 0, weeklyUpdates: 0 });

  // 加载数据
  const loadData = useCallback(async () => {
    try {
      const [categoriesRes, statsRes] = await Promise.all([
        Network.request({ url: '/api/knowledge/categories' }),
        Network.request({ url: '/api/knowledge/company-stats' }),
      ]);

      console.log('分类数据:', categoriesRes.data);
      console.log('统计数据:', statsRes.data);

      if (categoriesRes.data?.code === 200 && categoriesRes.data?.data) {
        setCategories(categoriesRes.data.data);
      }

      if (statsRes.data?.code === 200 && statsRes.data?.data) {
        setStats(statsRes.data.data);
      }
    } catch (error) {
      console.error('加载知识库数据失败:', error);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const user = Taro.getStorageSync('user');
      const token = Taro.getStorageSync('token');
      if (user && token) {
        setIsLoggedIn(true);
        setUserRole(user.role || 'guest');
        // 登录后加载数据
        await loadData();
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
      }
    } catch (e) {
      console.log('获取用户信息失败');
    } finally {
      setLoading(false);
    }
  }, [loadData]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 使用 useEffect 替代 useDidShow 以支持 H5
  useEffect(() => {
    // H5 环境使用 visibilitychange 事件
    if (typeof document !== 'undefined') {
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          checkAuth();
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [checkAuth]);

  // 判断是否有权限（员工及以上权限）
  const canAccess = isLoggedIn && userRole && ['employee', 'team_leader', 'admin'].includes(userRole);

  const handleNavigate = (path: string) => {
    Taro.navigateTo({ url: path });
  };

  const handleCategoryClick = (categoryId: string) => {
    // 跳转到分类文章列表页面
    handleNavigate(`/package-knowledge/pages/knowledge/article-list?categoryId=${categoryId}`);
  };

  // 加载中
  if (loading) {
    return (
      <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#71717a' }}>加载中...</Text>
      </View>
    );
  }

  // 无权限提示
  if (!canAccess) {
    return (
      <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
          <Lock size={40} color="#f87171" />
        </View>
        <Text style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff', marginBottom: '12px' }}>权限不足</Text>
        <Text style={{ fontSize: '14px', color: '#71717a', textAlign: 'center', marginBottom: '24px' }}>
          该功能仅限正式员工使用{'\n'}请联系管理员开通权限
        </Text>
        <View
          style={{ padding: '12px 24px', backgroundColor: '#38bdf8', borderRadius: '8px' }}
          onClick={() => Taro.switchTab({ url: '/pages/tab-home/index' })}
        >
          <Text style={{ color: '#000', fontWeight: '500' }}>返回首页</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', paddingBottom: '80px' }}>
      {/* 页面头部 */}
      <View style={{ padding: '48px 20px 20px', backgroundColor: '#111827' }}>
        <View style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          
          <Building2 size={24} color="#a855f7" />
          <Text style={{ fontSize: '24px', fontWeight: '700', color: '#ffffff' }}>公司资料</Text>
        </View>
        <Text style={{ fontSize: '14px', color: '#71717a', marginLeft: '48px' }}>企业知识沉淀与复用</Text>
      </View>

      <ScrollView scrollY style={{ height: 'calc(100vh - 140px)' }}>
        <View style={{ padding: '16px 20px' }}>
          {/* 统计概览 */}
          <View style={{ backgroundColor: '#111827', border: '1px solid #1e3a5f', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
            <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={20} color="#38bdf8" />
                <Text style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>知识库概览</Text>
              </View>
            </View>
            <View style={{ display: 'flex', justifyContent: 'space-around', marginTop: '16px' }}>
              <View style={{ textAlign: 'center' }}>
                <Text style={{ fontSize: '28px', fontWeight: '700', color: '#ffffff' }}>{stats.total}</Text>
                <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>知识总数</Text>
              </View>
              <View style={{ width: '1px', backgroundColor: '#1e3a5f' }} />
              <View style={{ textAlign: 'center' }}>
                <Text style={{ fontSize: '28px', fontWeight: '700', color: '#38bdf8' }}>{stats.categories}</Text>
                <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>知识分类</Text>
              </View>
              <View style={{ width: '1px', backgroundColor: '#1e3a5f' }} />
              <View style={{ textAlign: 'center' }}>
                <Text style={{ fontSize: '28px', fontWeight: '700', color: '#4ade80' }}>{stats.weeklyUpdates}</Text>
                <Text style={{ fontSize: '12px', color: '#71717a', display: 'block', marginTop: '4px' }}>本周更新</Text>
              </View>
            </View>
          </View>

          {/* 空状态提示 */}
          {categories.length === 0 && (
            <View style={{
              backgroundColor: '#111827',
              border: '1px solid #1e3a5f',
              borderRadius: '12px',
              padding: '40px 20px',
              textAlign: 'center'
            }}
            >
              <BookOpen size={48} color="#71717a" style={{ display: 'block', margin: '0 auto 16px' }} />
              <Text style={{ fontSize: '16px', color: '#94a3b8', display: 'block', marginBottom: '8px' }}>暂无知识分类</Text>
              <Text style={{ fontSize: '14px', color: '#64748b', display: 'block' }}>点击下方&ldquo;新建知识&rdquo;添加内容</Text>
            </View>
          )}

          {/* 知识分类列表 */}
          <Text style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '12px', fontWeight: '500' }}>知识分类</Text>
          
          {categories.map((category) => {
            return (
              <View
                key={category.id}
                style={{
                  backgroundColor: '#111827',
                  border: '1px solid #1e3a5f',
                  borderRadius: '12px',
                  marginBottom: '12px',
                  overflow: 'hidden'
                }}
              >
                {/* 分类卡片 */}
                <View
                  style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <View style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: category.color || 'rgba(56, 189, 248, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                  >
                    <BookOpen size={24} color={category.color?.replace('0.2', '1') || '#38bdf8'} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>{category.name}</Text>
                      <View style={{ padding: '4px 10px', borderRadius: '12px', backgroundColor: category.color || 'rgba(56, 189, 248, 0.2)' }}>
                        <Text style={{ fontSize: '12px', color: category.color?.replace('0.2', '1') || '#38bdf8' }}>{category.article_count}</Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginTop: '4px' }}>{category.description || '暂无描述'}</Text>
                  </View>
                </View>
              </View>
            );
          })}

          {/* 快捷入口 */}
          <Text style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '12px', marginTop: '8px', fontWeight: '500' }}>快捷入口</Text>
          
          <View style={{ display: 'flex', gap: '12px' }}>
            <View
              style={{
                flex: 1,
                backgroundColor: '#111827',
                border: '1px solid #1e3a5f',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
              onClick={() => handleNavigate('/package-knowledge/pages/knowledge-share/create')}
            >
              <View style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '8px'
              }}
              >
                <Text style={{ fontSize: '20px' }}>+</Text>
              </View>
              <Text style={{ fontSize: '14px', color: '#ffffff' }}>新建知识</Text>
              <Text style={{ fontSize: '12px', color: '#71717a', marginTop: '4px' }}>分享你的知识</Text>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: '#111827',
                border: '1px solid #1e3a5f',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
              onClick={() => handleNavigate('/package-knowledge/pages/knowledge-share/index')}
            >
              <View style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '8px'
              }}
              >
                <BookOpen size={20} color="#60a5fa" />
              </View>
              <Text style={{ fontSize: '14px', color: '#ffffff' }}>全部知识</Text>
              <Text style={{ fontSize: '12px', color: '#71717a', marginTop: '4px' }}>查看所有内容</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default KnowledgeSharePage;
