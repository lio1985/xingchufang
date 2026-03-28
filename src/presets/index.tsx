import { PropsWithChildren } from 'react';

// 空的 Preset 组件，避免 useLaunch 在 H5 环境的问题
// useLaunch 是微信小程序特有的生命周期，H5 环境不需要
export const Preset = ({ children }: PropsWithChildren) => {
  return <>{children}</>;
};
