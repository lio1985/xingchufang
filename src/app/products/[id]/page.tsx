'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Upload, Trash2, Star, ImageIcon } from 'lucide-react';
import { compressImage, getImageInfo, shouldCompress } from '@/lib/image-compress';

interface Product {
  id: number;
  name: string;
  brand: string | null;
  spec: string | null;
  params: string | null;
  price: string | null;
  supplier: string | null;
  level1_category: string | null;
  level2_category: string | null;
  product_code: string | null;
  origin: string | null;
  warranty: string | null;
  selling_points: string | null;
  remarks: string | null;
}

interface ProductImage {
  id: number;
  product_id: number;
  image_key: string;
  is_primary: boolean;
  url: string;
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // 检查登录状态
  useEffect(() => {
    fetch('/api/auth')
      .then((res) => res.json())
      .then((data) => setIsAdmin(data.authenticated));
  }, []);

  // 获取商品详情
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        if (data.success) {
          setProduct(data.data);
        }
      } catch (error) {
        console.error('获取商品详情失败:', error);
      }
    };

    const fetchImages = async () => {
      try {
        const res = await fetch(`/api/products/${id}/images`);
        const data = await res.json();
        if (data.success) {
          setImages(data.data);
        }
      } catch (error) {
        console.error('获取图片失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    fetchImages();
  }, [id]);

  // 上传图片
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件');
      return;
    }

    // 验证文件大小（最大10MB）
    if (file.size > 10 * 1024 * 1024) {
      alert('图片大小不能超过10MB');
      return;
    }

    setUploading(true);
    try {
      let fileToUpload: File | Blob = file;
      
      // 如果图片大于500KB，自动压缩
      if (shouldCompress(file, 500)) {
        const originalInfo = await getImageInfo(file);
        console.log(`压缩前: ${originalInfo.sizeKB.toFixed(1)}KB, ${originalInfo.width}x${originalInfo.height}`);
        
        try {
          fileToUpload = await compressImage(file, {
            maxWidth: 1920,
            maxHeight: 1080,
            quality: 0.8,
            maxSizeKB: 500,
          });
          
          const compressedSize = fileToUpload.size / 1024;
          console.log(`压缩后: ${compressedSize.toFixed(1)}KB`);
          console.log(`压缩率: ${((1 - compressedSize / originalInfo.sizeKB) * 100).toFixed(1)}%`);
        } catch (compressError) {
          console.warn('图片压缩失败，使用原图上传:', compressError);
        }
      }

      const formData = new FormData();
      formData.append('file', fileToUpload, file.name);
      formData.append('isPrimary', images.length === 0 ? 'true' : 'false');

      const res = await fetch(`/api/products/${id}/images`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setImages([...images, data.data]);
      } else {
        alert('上传失败：' + data.error);
      }
    } catch (error) {
      console.error('上传失败:', error);
      alert('上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  // 删除图片
  const handleDelete = async (imageId: number) => {
    if (!confirm('确定要删除这张图片吗？')) return;

    try {
      const res = await fetch(`/api/products/${id}/images?imageId=${imageId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        setImages(images.filter((img) => img.id !== imageId));
      } else {
        alert('删除失败：' + data.error);
      }
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请重试');
    }
  };

  // 设置主图
  const handleSetPrimary = async (imageId: number) => {
    try {
      const res = await fetch(`/api/products/${id}/images/primary`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId }),
      });

      const data = await res.json();
      if (data.success) {
        setImages(
          images.map((img) => ({
            ...img,
            is_primary: img.id === imageId,
          }))
        );
      } else {
        alert('设置失败：' + data.error);
      }
    } catch (error) {
      console.error('设置主图失败:', error);
      alert('设置失败，请重试');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">商品不存在</p>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-blue-100 mt-1">商品详情 · 图片管理</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 图片管理 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>商品图片</span>
                {isAdmin && (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUpload}
                      className="hidden"
                      id="image-upload"
                      disabled={uploading}
                    />
                    <Button
                      asChild
                      disabled={uploading}
                      className="cursor-pointer"
                    >
                      <label htmlFor="image-upload">
                        <Upload className="h-4 w-4 mr-2" />
                        {uploading ? '上传中...' : '上传图片'}
                      </label>
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {images.length === 0 ? (
                <div className="aspect-video bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                  <ImageIcon className="h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-gray-500">
                    {isAdmin ? '暂无图片，点击上方按钮上传' : '暂无图片'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {images.map((img) => (
                    <div key={img.id} className="relative group">
                      <img
                        src={img.url}
                        alt="商品图片"
                        className="w-full aspect-video object-cover rounded-lg"
                      />
                      {img.is_primary && (
                        <Badge className="absolute top-2 left-2">主图</Badge>
                      )}
                      {isAdmin && (
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                          {!img.is_primary && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleSetPrimary(img.id)}
                            >
                              <Star className="h-4 w-4 mr-1" />
                              设为主图
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(img.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            删除
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {isAdmin && (
                <p className="text-sm text-gray-500 mt-4">
                  提示：第一张上传的图片自动设为主图，支持 JPG、PNG 格式，最大 5MB
                </p>
              )}
            </CardContent>
          </Card>

          {/* 商品信息 */}
          <Card>
            <CardHeader>
              <CardTitle>商品信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">商品编码</p>
                    <p className="font-medium">{product.product_code || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">品牌</p>
                    <p className="font-medium">{product.brand || '-'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">一级分类</p>
                    <p className="font-medium">{product.level1_category || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">二级分类</p>
                    <p className="font-medium">{product.level2_category || '-'}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">规格</p>
                  <p className="font-medium">{product.spec || '-'}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">参数</p>
                  <p className="font-medium">{product.params || '-'}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">价格</p>
                  <p className="text-2xl font-bold text-red-600">
                    {product.price ? `¥${product.price}` : '未定价'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">供应商</p>
                  <p className="font-medium">{product.supplier || '-'}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">产地</p>
                  <p className="font-medium">{product.origin || '-'}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">质保</p>
                  <p className="font-medium">{product.warranty || '-'}</p>
                </div>

                {product.selling_points && (
                  <div>
                    <p className="text-sm text-gray-500">产品优势/卖点</p>
                    <p className="font-medium">{product.selling_points}</p>
                  </div>
                )}

                {product.remarks && (
                  <div>
                    <p className="text-sm text-gray-500">备注</p>
                    <p className="font-medium">{product.remarks}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
