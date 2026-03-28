'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload, Download, FileSpreadsheet } from 'lucide-react';

export default function BatchImportPage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // 下载模板
  const downloadTemplate = () => {
    const template = '商品编码,图片URL\nYK-7-051,https://example.com/image1.jpg\nYK-7-041,https://example.com/image2.jpg';
    const blob = new Blob(['\uFEFF' + template], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '批量导入图片模板.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // 上传文件
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/images/batch-import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error('上传失败:', error);
      alert('上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <Button
            variant="ghost"
            className="text-white hover:bg-blue-700 mb-4"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回商品列表
          </Button>
          <h1 className="text-3xl font-bold">批量导入图片</h1>
          <p className="text-blue-100 mt-1">通过 Excel/CSV 文件批量导入商品图片</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          {/* 使用说明 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>使用说明</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>下载模板文件，了解格式要求</li>
                <li>填写商品编码（货号）和图片URL</li>
                <li>上传填好的 Excel/CSV 文件</li>
                <li>系统会自动下载图片并关联到对应商品</li>
              </ol>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>支持格式：</strong>Excel (.xlsx, .xls) 或 CSV (.csv)<br/>
                  <strong>必填字段：</strong>商品编码、图片URL<br/>
                  <strong>提示：</strong>图片URL必须可公开访问，建议使用 CDN 或对象存储链接
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 下载模板 */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <Button onClick={downloadTemplate} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                下载模板文件
              </Button>
            </CardContent>
          </Card>

          {/* 上传文件 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>上传文件</CardTitle>
            </CardHeader>
            <CardContent>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleUpload}
                className="hidden"
                id="batch-file"
                disabled={uploading}
              />
              <Button
                asChild
                disabled={uploading}
                className="w-full cursor-pointer"
                size="lg"
              >
                <label htmlFor="batch-file" className="cursor-pointer">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  {uploading ? '导入中...' : '选择文件并导入'}
                </label>
              </Button>
            </CardContent>
          </Card>

          {/* 导入结果 */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle>导入结果</CardTitle>
              </CardHeader>
              <CardContent>
                {result.success ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{result.data.total}</p>
                        <p className="text-sm text-gray-600">总计</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{result.data.success}</p>
                        <p className="text-sm text-gray-600">成功</p>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">{result.data.failed}</p>
                        <p className="text-sm text-gray-600">失败</p>
                      </div>
                    </div>

                    {result.data.errors.length > 0 && (
                      <div>
                        <p className="font-medium mb-2">错误详情：</p>
                        <div className="max-h-60 overflow-y-auto bg-gray-50 rounded-lg p-4">
                          {result.data.errors.map((error: string, index: number) => (
                            <p key={index} className="text-sm text-red-600">
                              {error}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-red-600">{result.error}</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
