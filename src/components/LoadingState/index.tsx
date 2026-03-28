/**
 * 加载状态组件
 * 统一的加载、错误、空状态展示
 */

import { View, Text } from '@tarojs/components';
import { RefreshCw, CircleAlert, Inbox } from 'lucide-react-taro';
import { colors, fontSize, spacing } from '@/styles/common';

interface LoadingStateProps {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyText?: string;
  onRetry?: () => void;
  children?: React.ReactNode;
}

/**
 * 加载状态容器
 * 处理加载中、错误、空状态三种情况
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  loading,
  error,
  empty,
  emptyText = '暂无数据',
  onRetry,
  children,
}) => {
  // 加载中状态
  if (loading) {
    return (
      <View style={{
        padding: `${spacing.xxxl} ${spacing.xl}`,
        textAlign: 'center',
      }}
      >
        <RefreshCw 
          size={32} 
          color={colors.primary}
          style={{
            animation: 'spin 1s linear infinite',
          }}
        />
        <Text style={{
          display: 'block',
          marginTop: spacing.md,
          color: colors.textMuted,
          fontSize: fontSize.sm,
        }}
        >
          加载中...
        </Text>
      </View>
    );
  }

  // 错误状态
  if (error) {
    return (
      <View style={{
        padding: `${spacing.xxxl} ${spacing.xl}`,
        textAlign: 'center',
      }}
      >
        <CircleAlert size={48} color={colors.error} />
        <Text style={{
          display: 'block',
          marginTop: spacing.lg,
          fontSize: fontSize.base,
          color: colors.textSecondary,
        }}
        >
          {error}
        </Text>
        {onRetry && (
          <View
            style={{
              marginTop: spacing.lg,
              padding: `${spacing.sm} ${spacing.xl}`,
              backgroundColor: colors.primary,
              borderRadius: spacing.md,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={onRetry}
          >
            <Text style={{
              fontSize: fontSize.sm,
              color: colors.textPrimary,
            }}
            >
              重试
            </Text>
          </View>
        )}
      </View>
    );
  }

  // 空状态
  if (empty) {
    return (
      <View style={{
        padding: `${spacing.xxxl} ${spacing.xl}`,
        textAlign: 'center',
      }}
      >
        <Inbox size={64} color={colors.textDisabled} />
        <Text style={{
          display: 'block',
          marginTop: spacing.lg,
          fontSize: fontSize.base,
          color: colors.textMuted,
        }}
        >
          {emptyText}
        </Text>
      </View>
    );
  }

  // 正常内容
  return <>{children}</>;
};

/**
 * 加载更多组件
 */
interface LoadMoreProps {
  loading: boolean;
  hasMore: boolean;
  onLoadMore?: () => void;
}

export const LoadMore: React.FC<LoadMoreProps> = ({
  loading,
  hasMore,
  onLoadMore,
}) => {
  if (!hasMore) {
    return (
      <View style={{
        padding: spacing.xl,
        textAlign: 'center',
      }}
      >
        <Text style={{
          fontSize: fontSize.sm,
          color: colors.textDisabled,
        }}
        >
          没有更多了
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        padding: spacing.xl,
        textAlign: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
      }}
      onClick={loading ? undefined : onLoadMore}
    >
      {loading ? (
        <>
          <RefreshCw size={16} color={colors.textMuted} />
          <Text style={{
            fontSize: fontSize.sm,
            color: colors.textMuted,
          }}
          >
            加载中...
          </Text>
        </>
      ) : (
        <Text style={{
          fontSize: fontSize.sm,
          color: colors.primary,
        }}
        >
          点击加载更多
        </Text>
      )}
    </View>
  );
};

/**
 * 简单的加载动画
 */
export const LoadingSpinner: React.FC<{ size?: number; color?: string }> = ({
  size = 32,
  color = colors.primary,
}) => {
  return (
    <View style={{
      padding: spacing.xl,
      textAlign: 'center',
    }}
    >
      <RefreshCw 
        size={size} 
        color={color}
        style={{
          animation: 'spin 1s linear infinite',
        }}
      />
    </View>
  );
};

/**
 * 空状态组件
 */
interface EmptyStateProps {
  icon?: typeof Inbox;
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title = '暂无数据',
  description,
  actionText,
  onAction,
}) => {
  return (
    <View style={{
      padding: `${spacing.xxxl} ${spacing.xl}`,
      textAlign: 'center',
    }}
    >
      <Icon size={64} color={colors.textDisabled} />
      <Text style={{
        display: 'block',
        marginTop: spacing.lg,
        fontSize: fontSize.lg,
        fontWeight: '600',
        color: colors.textSecondary,
      }}
      >
        {title}
      </Text>
      {description && (
        <Text style={{
          display: 'block',
          marginTop: spacing.sm,
          fontSize: fontSize.sm,
          color: colors.textMuted,
          lineHeight: 1.6,
        }}
        >
          {description}
        </Text>
      )}
      {actionText && onAction && (
        <View
          style={{
            marginTop: spacing.xl,
            padding: `${spacing.md} ${spacing.xxl}`,
            backgroundColor: colors.primary,
            borderRadius: spacing.lg,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={onAction}
        >
          <Text style={{
            fontSize: fontSize.base,
            fontWeight: '500',
            color: colors.textPrimary,
          }}
          >
            {actionText}
          </Text>
        </View>
      )}
    </View>
  );
};

export default LoadingState;
