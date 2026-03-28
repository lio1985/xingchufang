/**
 * 图片压缩工具
 */

export interface CompressOptions {
  maxWidth?: number;       // 最大宽度，默认 1920
  maxHeight?: number;      // 最大高度，默认 1080
  quality?: number;        // 压缩质量 0-1，默认 0.8
  maxSizeKB?: number;      // 最大文件大小（KB），默认 500
  mimeType?: string;       // 输出格式，默认 'image/jpeg'
}

/**
 * 压缩图片
 * @param file 原始图片文件
 * @param options 压缩选项
 * @returns 压缩后的 Blob 对象
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<Blob> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    maxSizeKB = 500,
    mimeType = 'image/jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      // 计算缩放比例
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;

      // 绘制图片
      ctx?.drawImage(img, 0, 0, width, height);

      // 转换为 Blob
      const tryCompress = (currentQuality: number): void => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('图片压缩失败'));
              return;
            }

            const sizeKB = blob.size / 1024;

            // 如果大小超过限制且质量可降低，则降低质量重新压缩
            if (sizeKB > maxSizeKB && currentQuality > 0.1) {
              const newQuality = Math.max(0.1, currentQuality - 0.1);
              tryCompress(newQuality);
            } else {
              resolve(blob);
            }
          },
          mimeType,
          currentQuality
        );
      };

      tryCompress(quality);
    };

    img.onerror = () => {
      reject(new Error('图片加载失败'));
    };

    // 加载图片
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * 获取图片信息
 */
export async function getImageInfo(file: File): Promise<{
  width: number;
  height: number;
  sizeKB: number;
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
        sizeKB: file.size / 1024,
      });
    };
    img.onerror = () => reject(new Error('无法读取图片信息'));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * 检查图片是否需要压缩
 */
export function shouldCompress(
  file: File,
  maxSizeKB: number = 500
): boolean {
  return file.size / 1024 > maxSizeKB;
}
