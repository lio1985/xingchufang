import { Component, PropsWithChildren, ErrorInfo } from 'react';
import { View, Text } from '@tarojs/components';

interface Props extends PropsWithChildren {
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * 全局错误边界组件
 * 捕获子组件的错误，防止整个应用崩溃
 */
export class ErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    // 使用 location.reload 代替 Taro.switchTab，避免 H5 兼容性问题
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="min-h-screen bg-slate-900 flex flex-col items-center justify-center px-6">
          <View className="text-center">
            <Text className="block text-6xl mb-4">😵</Text>
            <Text className="block text-xl font-bold text-white mb-2">
              页面出错了
            </Text>
            <Text className="block text-sm text-slate-400 mb-6">
              {this.state.error?.message || '发生未知错误'}
            </Text>
            <View 
              className="bg-blue-500 text-white px-6 py-3 rounded-xl"
              onClick={this.handleReset}
            >
              <Text className="text-white">返回首页</Text>
            </View>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
