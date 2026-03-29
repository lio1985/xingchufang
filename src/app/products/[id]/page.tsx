'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Upload, Trash2, Star, ImageIcon, Shield, Eye, MoreVertical, Heart, Flame, Sparkles, DollarSign, Award } from 'lucide-react';
import { compressImage, getImageInfo, shouldCompress } from '@/lib/image-compress';

// 推荐类型配置
const RECOMMEND_TYPES = {
  hot: { label: '爆款', color: 'bg-red-500', icon: Flame },
  new: { label: '新款', color: 'bg-green-500', icon: Sparkles },
  sale: { label: '特价', color: 'bg-orange-500', icon: DollarSign },
  featured: { label: '精选', color: 'bg-blue-500', icon: Award },
} as const;

interface User {
  username: string;
  role: 'admin' | 'sales';
}

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
  recommend_types?: string[];
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showImageActions, setShowImageActions] = useState<number | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);

  // 检查登录状态
  useEffect(() => {
    fetch('/api/auth', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        }
      });
  }, []);
  
  // 是否为管理员
  const isAdmin = currentUser?.role === 'admin';

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

  // 检查收藏状态
  useEffect(() => {
    if (currentUser && id) {
      fetch(`/api/favorites/check?productIds=${id}`, { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setIsFavorited(data.data[parseInt(id)] || false);
          }
        });
    }
  }, [currentUser, id]);

  // 切换收藏状态
  const toggleFavorite = async () => {
    try {
      if (isFavorited) {
        await fetch(`/api/favorites?productId=${id}`, { method: 'DELETE', credentials: 'include' });
        setIsFavorited(false);
      } else {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: parseInt(id) }),
          credentials: 'include',
        });
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('操作失败:', error);
    }
  };

  // 上传图片
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('图片大小不能超过10MB');
      return;
    }

    setUploading(true);
    try {
      let fileToUpload: File | Blob = file;
      
      if (shouldCompress(file, 500)) {
        try {
          fileToUpload = await compressImage(file, {
            maxWidth: 1920,
            maxHeight: 1080,
            quality: 0.8,
            maxSizeKB: 500,
          });
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
        setActiveImageIndex(Math.max(0, activeImageIndex - 1));
        setShowImageActions(null);
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
        setShowImageActions(null);
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
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* 头部 */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-blue-700 p-2 md:p-3"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-5 w-5 md:h-4 md:w-4 md:mr-2" />
                <span className="hidden md:inline">返回商品列表</span>
              </Button>
              <div className="md:hidden w-px h-6 bg-white/20" />
              {/* 移动端收藏按钮 */}
              {currentUser && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFavorite}
                  className="md:hidden text-white hover:bg-blue-700 p-2"
                >
                  <Heart
                    className={`h-4 w-4 ${
                      isFavorited ? 'fill-red-400 text-red-400' : ''
                    }`}
                  />
                </Button>
              )}
              {currentUser && (
                <div className="md:hidden flex items-center gap-1 px-2 py-1 bg-white/10 rounded-full">
                  {currentUser.role === 'admin' ? (
                    <Shield className="h-3.5 w-3.5 text-yellow-300" />
                  ) : (
                    <Eye className="h-3.5 w-3.5 text-green-300" />
                  )}
                  <span className="text-xs text-white">{currentUser.username}</span>
                </div>
              )}
            </div>
            {currentUser && (
              <div className="hidden md:flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFavorite}
                  className="text-white hover:bg-blue-700"
                >
                  <Heart
                    className={`h-4 w-4 mr-2 ${
                      isFavorited ? 'fill-red-400 text-red-400' : ''
                    }`}
                  />
                  {isFavorited ? '已收藏' : '收藏'}
                </Button>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
                  {currentUser.role === 'admin' ? (
                    <Shield className="h-4 w-4 text-yellow-300" />
                  ) : (
                    <Eye className="h-4 w-4 text-green-300" />
                  )}
                  <span className="text-sm text-white">
                    {currentUser.username}
                    <span className="text-xs text-blue-200 ml-1">
                      ({currentUser.role === 'admin' ? '管理员' : '销售'})
                    </span>
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* 商品名称 */}
          <div className="mt-2 md:mt-4">
            <div className="flex items-start gap-2 flex-wrap">
              <h1 className="text-lg md:text-2xl font-bold line-clamp-2">{product.name}</h1>
              {/* 推荐标签 */}
              {product.recommend_types && product.recommend_types.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {product.recommend_types.map((type) => {
                    const config = RECOMMEND_TYPES[type as keyof typeof RECOMMEND_TYPES];
                    if (!config) return null;
                    const Icon = config.icon;
                    return (
                      <Badge 
                        key={type} 
                        className={`${config.color} text-white text-xs gap-1`}
                      >
                        <Icon className="h-3 w-3" />
                        {config.label}
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>
            <p className="text-blue-100 text-xs md:text-sm mt-1">
              {product.product_code && <span>编码: {product.product_code}</span>}
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 md:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* 图片管理 */}
          <Card>
            <CardHeader className="pb-2 md:pb-4">
              <CardTitle className="flex items-center justify-between text-base md:text-lg">
                <span>商品图片 ({images.length})</span>
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
                      size="sm"
                      className="cursor-pointer"
                    >
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-1 md:mr-2" />
                        <span className="hidden sm:inline">{uploading ? '上传中...' : '上传图片'}</span>
                        <span className="sm:hidden">上传</span>
                      </label>
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {images.length === 0 ? (
                <div className="aspect-square md:aspect-video bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                  <ImageIcon className="h-16 w-16 md:h-20 md:w-20 text-gray-300 mb-3" />
                  <p className="text-gray-500 text-sm md:text-base">
                    {isAdmin ? '暂无图片，点击上方按钮上传' : '暂无图片'}
                  </p>
                </div>
              ) : (
                <>
                  {/* 主图显示 - 移动端大图 */}
                  <div className="relative mb-3 md:mb-4 bg-gray-100 rounded-lg">
                    <img
                      src={images[activeImageIndex]?.url}
                      alt="商品图片"
                      className="w-full aspect-square md:aspect-video object-contain rounded-lg"
                    />
                    {images[activeImageIndex]?.is_primary && (
                      <Badge className="absolute top-2 left-2">主图</Badge>
                    )}
                    {/* 移动端操作按钮 */}
                    {isAdmin && (
                      <div className="absolute top-2 right-2 md:hidden">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="p-2"
                          onClick={() => setShowImageActions(showImageActions === activeImageIndex ? null : activeImageIndex)}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                        {showImageActions === activeImageIndex && (
                          <div className="absolute right-0 top-10 bg-white rounded-lg shadow-lg border p-2 flex flex-col gap-1 min-w-[100px]">
                            {!images[activeImageIndex]?.is_primary && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleSetPrimary(images[activeImageIndex].id)}
                                className="justify-start"
                              >
                                <Star className="h-4 w-4 mr-2" />
                                设为主图
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(images[activeImageIndex].id)}
                              className="justify-start text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              删除
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                    {/* 图片计数 */}
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                      {activeImageIndex + 1} / {images.length}
                    </div>
                  </div>

                  {/* 缩略图列表 */}
                  <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                    {images.map((img, index) => (
                      <div
                        key={img.id}
                        className={`relative flex-shrink-0 cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                          index === activeImageIndex ? 'border-blue-500' : 'border-transparent'
                        }`}
                        onClick={() => setActiveImageIndex(index)}
                      >
                        <img
                          src={img.url}
                          alt="缩略图"
                          className="w-16 h-16 md:w-20 md:h-20 object-cover"
                        />
                        {img.is_primary && (
                          <div className="absolute top-0.5 left-0.5">
                            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* 桌面端图片操作 */}
                  {isAdmin && (
                    <div className="hidden md:flex gap-2 mt-4">
                      {!images[activeImageIndex]?.is_primary && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSetPrimary(images[activeImageIndex].id)}
                        >
                          <Star className="h-4 w-4 mr-1" />
                          设为主图
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(images[activeImageIndex].id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        删除
                      </Button>
                    </div>
                  )}
                </>
              )}
              {isAdmin && (
                <p className="text-xs md:text-sm text-gray-500 mt-3 md:mt-4">
                  提示：第一张上传的图片自动设为主图，支持 JPG、PNG 格式，最大 10MB
                </p>
              )}
            </CardContent>
          </Card>

          {/* 商品信息 */}
          <Card>
            <CardHeader className="pb-2 md:pb-4">
              <CardTitle className="text-base md:text-lg">商品信息</CardTitle>
            </CardHeader>
            <CardContent>
              {/* 价格突出显示 */}
              {product.price && (
                <div className="mb-4 p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600">价格</p>
                  <p className="text-3xl md:text-4xl font-bold text-red-600">
                    ¥{product.price}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-xs md:text-sm text-gray-500">商品编码</p>
                  <p className="font-medium text-sm md:text-base">{product.product_code || '-'}</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-xs md:text-sm text-gray-500">品牌</p>
                  <p className="font-medium text-sm md:text-base">{product.brand || '-'}</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-xs md:text-sm text-gray-500">一级分类</p>
                  <p className="font-medium text-sm md:text-base">{product.level1_category || '-'}</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-xs md:text-sm text-gray-500">二级分类</p>
                  <p className="font-medium text-sm md:text-base">{product.level2_category || '-'}</p>
                </div>
              </div>

              <div className="mt-3 md:mt-4 space-y-3">
                <div>
                  <p className="text-xs md:text-sm text-gray-500">规格</p>
                  <p className="font-medium text-sm md:text-base">{product.spec || '-'}</p>
                </div>

                <div>
                  <p className="text-xs md:text-sm text-gray-500">参数</p>
                  <p className="font-medium text-sm md:text-base whitespace-pre-wrap">{product.params || '-'}</p>
                </div>

                <div>
                  <p className="text-xs md:text-sm text-gray-500">供应商</p>
                  <p className="font-medium text-sm md:text-base">{product.supplier || '-'}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <p className="text-xs md:text-sm text-gray-500">产地</p>
                    <p className="font-medium text-sm md:text-base">{product.origin || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-gray-500">质保</p>
                    <p className="font-medium text-sm md:text-base">{product.warranty || '-'}</p>
                  </div>
                </div>

                {product.selling_points && (
                  <div>
                    <p className="text-xs md:text-sm text-gray-500">产品优势/卖点</p>
                    <p className="font-medium text-sm md:text-base">{product.selling_points}</p>
                  </div>
                )}

                {product.remarks && (
                  <div>
                    <p className="text-xs md:text-sm text-gray-500">备注</p>
                    <p className="font-medium text-sm md:text-base">{product.remarks}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* 移动端底部固定上传按钮 */}
      {isAdmin && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-3">
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            id="image-upload-mobile"
            disabled={uploading}
          />
          <Button
            asChild
            disabled={uploading}
            className="w-full cursor-pointer"
          >
            <label htmlFor="image-upload-mobile" className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? '上传中...' : '上传图片'}
            </label>
          </Button>
        </div>
      )}
    </div>
  );
}
