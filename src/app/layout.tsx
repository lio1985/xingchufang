import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: '供应商产品库',
    template: '%s | 星厨房',
  },
  description:
    '供应商产品库 - 快捷搜索选品系统，支持多人协作共享和图片上传管理。',
  keywords: [
    '星厨房',
    '商品库',
    '选品系统',
    '商用厨房设备',
    '商品管理',
  ],
  authors: [{ name: '星厨房' }],
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: '供应商产品库',
    description:
      '供应商产品库 - 快捷搜索选品系统，支持多人协作共享和图片上传管理。',
    siteName: '供应商产品库',
    locale: 'zh_CN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';

  return (
    <html lang="en">
      <body className={`antialiased`}>
        {isDev && <Inspector />}
        {children}
      </body>
    </html>
  );
}
