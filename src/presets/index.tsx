import { useLaunch } from '@tarojs/taro';
import { PropsWithChildren } from 'react';
import { enableWxDebugIfNeeded } from './wx-debug';

export const Preset = ({ children }: PropsWithChildren) => {
  useLaunch(() => {
    enableWxDebugIfNeeded();
  });

  // H5 相关预设已移除
  // 小程序项目不再需要 H5 导航栏和样式

  return <>{children}</>;
};
