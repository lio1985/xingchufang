import type { CSSProperties } from 'react';

/**
 * 公共样式常量
 * 统一管理样式，确保跨页面一致性
 */

// 颜色常量
export const colors = {
  // 主色
  primary: '#38bdf8',
  primaryDark: '#0ea5e9',
  primaryLight: '#7dd3fc',
  
  // 辅助色
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#60a5fa',
  
  // 中性色
  background: '#0a0f1a',
  backgroundSecondary: '#111827',
  backgroundTertiary: '#1e293b',
  border: '#1e3a5f',
  borderLight: '#334155',
  
  // 文字颜色
  textPrimary: '#ffffff',
  textSecondary: '#f1f5f9',
  textMuted: '#94a3b8',
  textDisabled: '#64748b',
  
  // 渐变色
  gradientPrimary: 'linear-gradient(135deg, #38bdf8 0%, #8b5cf6 100%)',
  gradientSuccess: 'linear-gradient(135deg, #10b981 0%, #38bdf8 100%)',
};

// 间距常量
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  xxl: '24px',
  xxxl: '32px',
};

// 圆角常量
export const borderRadius = {
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  xxl: '20px',
  full: '9999px',
};

// 字体大小
export const fontSize = {
  xs: '11px',
  sm: '12px',
  base: '14px',
  md: '15px',
  lg: '16px',
  xl: '18px',
  xxl: '20px',
  xxxl: '24px',
};

// 阴影
export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.15)',
  glow: '0 0 20px rgba(56, 189, 248, 0.3)',
};

// 公共容器样式
export const containerStyles: Record<string, CSSProperties> = {
  // 页面容器
  page: {
    minHeight: '100vh',
    backgroundColor: colors.background,
    paddingBottom: '60px',
  },

  // 卡片容器
  card: {
    backgroundColor: colors.backgroundSecondary,
    border: `1px solid ${colors.border}`,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },

  // 列表项容器
  listItem: {
    backgroundColor: colors.backgroundSecondary,
    border: `1px solid ${colors.border}`,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },

  // 表单容器
  formGroup: {
    marginBottom: spacing.xl,
  },

  // 横向居中
  centerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 纵向居中
  centerColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

// 公共按钮样式
export const buttonStyles = {
  primary: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: `${spacing.md} ${spacing.xl}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  secondary: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.lg,
    padding: `${spacing.md} ${spacing.xl}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  outline: {
    backgroundColor: 'transparent',
    border: `1px solid ${colors.primary}`,
    borderRadius: borderRadius.lg,
    padding: `${spacing.md} ${spacing.xl}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

// 公共输入框样式
export const inputStyles = {
  base: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    color: colors.textPrimary,
  },
  
  withIcon: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    paddingLeft: '44px',
    width: '100%',
    color: colors.textPrimary,
  },
};

// 加载状态样式
export const loadingStyles = {
  container: {
    padding: `${spacing.xxxl} ${spacing.xl}`,
    textAlign: 'center' as const,
  },
  
  spinner: {
    width: '32px',
    height: '32px',
    margin: '0 auto',
  },
  
  text: {
    display: 'block' as const,
    marginTop: spacing.md,
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
};

// 空状态样式
export const emptyStyles = {
  container: {
    padding: `${spacing.xxxl} ${spacing.xl}`,
    textAlign: 'center' as const,
  },
  
  icon: {
    width: '64px',
    height: '64px',
    margin: '0 auto',
    marginBottom: spacing.lg,
  },
  
  title: {
    display: 'block' as const,
    fontSize: fontSize.lg,
    fontWeight: '600' as const,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  
  description: {
    display: 'block' as const,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: '1.6',
  },
};

// 分页加载更多样式
export const loadMoreStyles = {
  container: {
    padding: spacing.xl,
    textAlign: 'center' as const,
  },
  
  text: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
};

// 标签样式
export const tagStyles = {
  base: {
    padding: `${spacing.xs} ${spacing.sm}`,
    borderRadius: borderRadius.sm,
    fontSize: fontSize.xs,
  },
  
  success: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    color: colors.success,
  },
  
  warning: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    color: colors.warning,
  },
  
  error: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    color: colors.error,
  },
  
  info: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    color: colors.primary,
  },
};

// 图片样式（支持懒加载）
export const imageStyles = {
  thumbnail: {
    width: '80px',
    height: '80px',
    borderRadius: borderRadius.md,
    objectFit: 'cover' as const,
  },
  
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: borderRadius.full,
    objectFit: 'cover' as const,
  },
  
  cover: {
    width: '100%',
    height: '200px',
    borderRadius: borderRadius.lg,
    objectFit: 'cover' as const,
  },
};
