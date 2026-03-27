import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { ShieldX, RefreshCw } from 'lucide-react-taro';
import { useAdminGuard } from '@/hooks/useAuthGuard';

interface AdminPageWrapperProps {
  children: React.ReactNode;
  /** 页面标题 */
  title?: string;
  /** 是否显示返回按钮 */
  showBack?: boolean;
  /** 自定义返回路径 */
  backPath?: string;
}

/**
 * 管理页面包装组件
 * 自动处理权限检查、加载状态和错误显示
 */
export const AdminPageWrapper: React.FC<AdminPageWrapperProps> = ({
  children,
  title,
  showBack = true,
  backPath,
}) => {
  const { canAccess, loading, user, logout } = useAdminGuard();

  // 加载中状态
  if (loading) {
    return (
      <View
        style={{
          minHeight: '100vh',
          backgroundColor: '#0a0f1a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View style={{ textAlign: 'center' }}>
          <RefreshCw size={48} color="#38bdf8" style={{ animation: 'spin 1s linear infinite' }} />
          <Text
            style={{ display: 'block', marginTop: '16px', color: '#71717a', fontSize: '14px' }}
          >
            正在验证权限...
          </Text>
        </View>
      </View>
    );
  }

  // 无权限状态
  if (!canAccess) {
    return (
      <View
        style={{
          minHeight: '100vh',
          backgroundColor: '#0a0f1a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <View
          style={{
            textAlign: 'center',
            backgroundColor: '#111827',
            borderRadius: '16px',
            padding: '32px',
            border: '1px solid #1e3a5f',
          }}
        >
          <ShieldX size={64} color="#f87171" />
          <Text
            style={{
              display: 'block',
              marginTop: '16px',
              fontSize: '18px',
              fontWeight: '600',
              color: '#f1f5f9',
            }}
          >
            权限不足
          </Text>
          <Text
            style={{
              display: 'block',
              marginTop: '8px',
              fontSize: '14px',
              color: '#71717a',
            }}
          >
            此功能仅管理员可用
          </Text>
          <View
            style={{
              marginTop: '24px',
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                padding: '12px 24px',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                borderRadius: '12px',
                border: '1px solid rgba(56, 189, 248, 0.3)',
              }}
              onClick={() => Taro.switchTab({ url: '/pages/tab-home/index' })}
            >
              <Text style={{ color: '#38bdf8', fontSize: '14px', fontWeight: '500' }}>
                返回首页
              </Text>
            </View>
            <View
              style={{
                padding: '12px 24px',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                borderRadius: '12px',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
              onClick={logout}
            >
              <Text style={{ color: '#f87171', fontSize: '14px', fontWeight: '500' }}>
                退出登录
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  // 有权限，渲染页面内容
  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', paddingBottom: '60px' }}>
      {/* 顶部导航栏 */}
      {title && (
        <View
          style={{
            padding: '48px 20px 16px',
            backgroundColor: '#111827',
            borderBottom: '1px solid #1e3a5f',
          }}
        >
          <View style={{ display: 'flex', alignItems: 'center' }}>
            {showBack && (
              <View
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(56, 189, 248, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px',
                }}
                onClick={() => {
                  if (backPath) {
                    Taro.navigateTo({ url: backPath });
                  } else {
                    Taro.navigateBack({ delta: 1 });
                  }
                }}
              >
                <Text style={{ color: '#38bdf8', fontSize: '20px' }}>←</Text>
              </View>
            )}
            <Text style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff' }}>{title}</Text>
            <View style={{ flex: 1 }} />
            {user && (
              <View style={{ display: 'flex', alignItems: 'center' }}>
                <View
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#22c55e',
                    marginRight: '6px',
                  }}
                />
                <Text style={{ fontSize: '12px', color: '#22c55e' }}>管理员</Text>
              </View>
            )}
          </View>
        </View>
      )}
      {/* 页面内容 */}
      {children}
    </View>
  );
};

export default AdminPageWrapper;
