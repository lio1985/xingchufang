import { useLaunch } from '@tarojs/taro';
import { PropsWithChildren } from 'react';
import { H5NavBar } from './h5-navbar';
import { injectH5Styles } from './h5-styles';
import { enableWxDebugIfNeeded } from './wx-debug';

export const Preset = ({ children }: PropsWithChildren) => {
  useLaunch(() => {
    enableWxDebugIfNeeded();
    injectH5Styles();
  });

  if (TARO_ENV === 'h5') {
    return <H5NavBar>{children}</H5NavBar>;
  }

  return <>{children}</>;
};
