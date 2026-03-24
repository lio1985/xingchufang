import { Image } from '@tarojs/components';
import type { ImageProps } from '@tarojs/components';
import { useState } from 'react';

interface LazyImageProps {
  src: string;
  className?: string;
  mode?: ImageProps['mode'];
  placeholder?: string;
  onClick?: () => void;
}

/**
 * 懒加载图片组件
 * 支持占位图、懒加载
 */
export const LazyImage = ({
  src,
  className = '',
  mode = 'aspectFill',
  placeholder,
  onClick
}: LazyImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <Image
      src={error ? (placeholder || '') : src}
      className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
      mode={mode}
      lazyLoad
      onLoad={() => setLoaded(true)}
      onError={() => setError(true)}
      onClick={onClick}
    />
  );
};

export default LazyImage;
