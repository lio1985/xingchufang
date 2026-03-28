'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload, Download, FileSpreadsheet, ImagePlus, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface User {
  username: string;
  role: 'admin' | 'sales';
}

export default function BatchImportPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [uploadMode, setUploadMode] = useState<'excel' | 'files'>('excel');

  // 检查登录状态和权限
  useEffect(() => {
    fetch('/api/auth')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        }
        setChecking(false);
      });
  }, []);
  
  // 是否为管理员
  const isAdmin = currentUser?.role === 'admin';

  // 检查中
  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  // 非管理员，显示无权限提示
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-14 h-14 md:w-16 md:h-16 bg-red-100 rounded-full flex items-center justify-center mb-3 md:mb-4">
              <AlertTriangle className="h-7 w-7 md:h-8 md:w-8 text-red-600" />
            </div>
            <CardTitle className="text-lg md:text-xl">权限不足</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 text-sm md:text-base mb-4">
              批量导入功能仅限管理员（采购负责人）使用
            </p>
            <p className="text-xs md:text-sm text-gray-500 mb-4">
              当前角色：{currentUser?.role === 'sales' ? '销售' : '未知'}
            </p>
            <Button onClick={() => router.push('/')}>返回首页</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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

  // 上传Excel文件
  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  // 上传图片文件
  const handleFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      const res = await fetch('/api/images/batch-upload', {
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
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-blue-700 p-2 md:p-3"
                onClick={() => router.push('/')}
              >
                <ArrowLeft className="h-5 w-5 md:h-4 md:w-4 md:mr-2" />
                <span className="hidden md:inline">返回商品列表</span>
              </Button>
              {currentUser && (
                <div className="md:hidden flex items-center gap-1 px-2 py-1 bg-white/10 rounded-full">
                  <Shield className="h-3.5 w-3.5 text-yellow-300" />
                  <span className="text-xs text-white">{currentUser.username}</span>
                </div>
              )}
            </div>
            {currentUser && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
                <Shield className="h-4 w-4 text-yellow-300" />
                <span className="text-sm text-white">
                  {currentUser.username}
                  <span className="text-xs text-blue-200 ml-1">(管理员)</span>
                </span>
              </div>
            )}
          </div>
          <h1 className="text-lg md:text-3xl font-bold mt-2 md:mt-4">批量导入图片</h1>
          <p className="text-blue-100 text-xs md:text-base mt-1">支持Excel导入或直接上传图片文件</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 md:py-6">
        <div className="max-w-3xl mx-auto">
          {/* 上传模式选择 */}
          <Card className="mb-4 md:mb-6">
            <CardHeader className="pb-2 md:pb-4">
              <CardTitle className="text-base md:text-lg">选择导入方式</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 md:gap-4">
                <Button
                  variant={uploadMode === 'excel' ? 'default' : 'outline'}
                  onClick={() => setUploadMode('excel')}
                  className="h-16 md:h-24"
                >
                  <div className="flex flex-col items-center">
                    <FileSpreadsheet className="h-5 w-5 md:h-6 md:w-6 mb-1 md:mb-2" />
                    <span className="text-xs md:text-sm">Excel/CSV 导入</span>
                  </div>
                </Button>
                <Button
                  variant={uploadMode === 'files' ? 'default' : 'outline'}
                  onClick={() => setUploadMode('files')}
                  className="h-16 md:h-24"
                >
                  <div className="flex flex-col items-center">
                    <ImagePlus className="h-5 w-5 md:h-6 md:w-6 mb-1 md:mb-2" />
                    <span className="text-xs md:text-sm">图片文件上传</span>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Excel 导入模式 */}
          {uploadMode === 'excel' && (
            <>
              {/* 使用说明 */}
              <Card className="mb-4 md:mb-6">
                <CardHeader className="pb-2 md:pb-4">
                  <CardTitle className="text-base md:text-lg">使用说明</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal list-inside space-y-1.5 md:space-y-2 text-gray-700 text-sm md:text-base">
                    <li>下载模板文件，了解格式要求</li>
                    <li>填写商品编码（货号）和图片URL</li>
                    <li>上传填好的 Excel/CSV 文件</li>
                    <li>系统会自动下载图片并关联到对应商品</li>
                  </ol>
                  <div className="mt-3 md:mt-4 p-3 md:p-4 bg-blue-50 rounded-lg">
                    <p className="text-xs md:text-sm text-blue-800">
                      <strong>支持格式：</strong>Excel (.xlsx, .xls) 或 CSV (.csv)<br/>
                      <strong>必填字段：</strong>商品编码、图片URL<br/>
                      <strong>提示：</strong>图片URL必须可公开访问
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* 下载模板 */}
              <Card className="mb-4 md:mb-6">
                <CardContent className="pt-4 md:pt-6">
                  <Button onClick={downloadTemplate} className="w-full h-10 md:h-auto">
                    <Download className="h-4 w-4 mr-2" />
                    下载模板文件
                  </Button>
                </CardContent>
              </Card>

              {/* 上传文件 */}
              <Card className="mb-4 md:mb-6">
                <CardHeader className="pb-2 md:pb-4">
                  <CardTitle className="text-base md:text-lg">上传文件</CardTitle>
                </CardHeader>
                <CardContent>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleExcelUpload}
                    className="hidden"
                    id="excel-file"
                    disabled={uploading}
                  />
                  <Button
                    asChild
                    disabled={uploading}
                    className="w-full cursor-pointer h-12 md:h-auto"
                    size="lg"
                  >
                    <label htmlFor="excel-file" className="cursor-pointer">
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      {uploading ? '导入中...' : '选择文件并导入'}
                    </label>
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {/* 图片文件上传模式 */}
          {uploadMode === 'files' && (
            <>
              {/* 使用说明 */}
              <Card className="mb-4 md:mb-6">
                <CardHeader className="pb-2 md:pb-4">
                  <CardTitle className="text-base md:text-lg">使用说明</CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal list-inside space-y-1.5 md:space-y-2 text-gray-700 text-sm md:text-base">
                    <li>重命名图片文件，格式：商品编码.jpg 或 商品编码_序号.jpg</li>
                    <li>选择多个图片文件上传</li>
                    <li>系统根据文件名自动匹配商品并关联图片</li>
                  </ol>
                  <div className="mt-3 md:mt-4 p-3 md:p-4 bg-blue-50 rounded-lg">
                    <p className="text-xs md:text-sm text-blue-800">
                      <strong>支持格式：</strong>JPG、PNG、GIF、WebP<br/>
                      <strong>命名规则：</strong>YK-7-051.jpg 或 YK-7-051_1.jpg<br/>
                      <strong>提示：</strong>可一次性选择多个文件上传
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* 上传文件 */}
              <Card className="mb-4 md:mb-6">
                <CardHeader className="pb-2 md:pb-4">
                  <CardTitle className="text-base md:text-lg">上传图片文件</CardTitle>
                </CardHeader>
                <CardContent>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFilesUpload}
                    className="hidden"
                    id="image-files"
                    disabled={uploading}
                  />
                  <Button
                    asChild
                    disabled={uploading}
                    className="w-full cursor-pointer h-12 md:h-auto"
                    size="lg"
                  >
                    <label htmlFor="image-files" className="cursor-pointer">
                      <ImagePlus className="h-4 w-4 mr-2" />
                      {uploading ? '上传中...' : '选择图片文件（可多选）'}
                    </label>
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {/* 导入结果 */}
          {result && (
            <Card>
              <CardHeader className="pb-2 md:pb-4">
                <CardTitle className="text-base md:text-lg">导入结果</CardTitle>
              </CardHeader>
              <CardContent>
                {result.success ? (
                  <div className="space-y-3 md:space-y-4">
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-4">
                      <div className="text-center p-2.5 md:p-4 bg-blue-50 rounded-lg">
                        <p className="text-lg md:text-2xl font-bold text-blue-600">{result.data.total}</p>
                        <p className="text-xs md:text-sm text-gray-600">总计</p>
                      </div>
                      <div className="text-center p-2.5 md:p-4 bg-green-50 rounded-lg">
                        <p className="text-lg md:text-2xl font-bold text-green-600">{result.data.success}</p>
                        <p className="text-xs md:text-sm text-gray-600">成功</p>
                      </div>
                      <div className="text-center p-2.5 md:p-4 bg-red-50 rounded-lg">
                        <p className="text-lg md:text-2xl font-bold text-red-600">{result.data.failed}</p>
                        <p className="text-xs md:text-sm text-gray-600">失败</p>
                      </div>
                      {result.data.skipped !== undefined && (
                        <div className="text-center p-2.5 md:p-4 bg-gray-50 rounded-lg hidden md:block">
                          <p className="text-2xl font-bold text-gray-600">{result.data.skipped}</p>
                          <p className="text-sm text-gray-600">跳过</p>
                        </div>
                      )}
                    </div>

                    {result.data.errors.length > 0 && (
                      <div>
                        <p className="font-medium mb-2 text-sm md:text-base">错误详情：</p>
                        <div className="max-h-40 md:max-h-60 overflow-y-auto bg-gray-50 rounded-lg p-3 md:p-4">
                          {result.data.errors.slice(0, 20).map((error: string, index: number) => (
                            <p key={index} className="text-xs md:text-sm text-red-600 mb-1">
                              {error}
                            </p>
                          ))}
                          {result.data.errors.length > 20 && (
                            <p className="text-xs text-gray-500">
                              还有 {result.data.errors.length - 20} 条错误未显示...
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-red-600 text-sm md:text-base">{result.error}</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
