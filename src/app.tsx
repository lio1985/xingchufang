import { PropsWithChildren } from 'react';
import '@/app.css';
import { Preset } from './presets';

const App = ({ children }: PropsWithChildren) => {
  // 支持游客模式，不再强制登录
  // 用户可以浏览部分功能，需要高级功能时再提示登录

  return <Preset>{children}</Preset>;
};

export default App;
