'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Heart, Download, Trash2, Image as ImageIcon, Shield, Eye, ShoppingCart } from 'lucide-react';

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
}

interface Favorite {
  id: number;
  product_id: number;
  created_at: string;
  primary_image_url: string | null;
  products: Product | null;
}

export default function FavoritesPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // 检查登录状态
  useEffect(() => {
    fetch('/api/auth', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        } else {
          router.push('/login');
        }
      });
  }, [router]);

  // 获取收藏列表
  useEffect(() => {
    if (currentUser) {
      loadFavorites();
    }
  }, [currentUser]);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/favorites', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setFavorites(data.data || []);
      }
    } catch (error) {
      console.error('获取收藏列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 移除收藏
  const handleRemove = async (productId: number) => {
    try {
      const res = await fetch(`/api/favorites?productId=${productId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setFavorites(favorites.filter((f) => f.product_id !== productId));
      }
    } catch (error) {
      console.error('移除收藏失败:', error);
    }
  };

  // 导出清单
  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/favorites/export', { credentials: 'include' });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `选品清单_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请重试');
    } finally {
      setExporting(false);
    }
  };

  // 计算总价格
  const totalPrice = favorites.reduce((sum, f) => {
    const price = parseFloat(f.products?.price || '0');
    return sum + (isNaN(price) ? 0 : price);
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* 头部 */}
      <header className="bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-pink-700 p-2 md:p-3"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-5 w-5 md:h-4 md:w-4 md:mr-2" />
                <span className="hidden md:inline">返回</span>
              </Button>
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
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
                {currentUser.role === 'admin' ? (
                  <Shield className="h-4 w-4 text-yellow-300" />
                ) : (
                  <Eye className="h-4 w-4 text-green-300" />
                )}
                <span className="text-sm text-white">
                  {currentUser.username}
                  <span className="text-xs text-pink-200 ml-1">
                    ({currentUser.role === 'admin' ? '管理员' : '销售'})
                  </span>
                </span>
              </div>
            )}
          </div>
          <div className="mt-2 md:mt-4">
            <h1 className="text-lg md:text-2xl font-bold flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
              我的选品清单
            </h1>
            <p className="text-pink-100 text-xs md:text-sm mt-1">
              已收藏 {favorites.length} 个商品
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 md:py-6">
        {/* 统计卡片 */}
        {favorites.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
            <Card>
              <CardContent className="pt-4 md:pt-6 text-center">
                <p className="text-2xl md:text-3xl font-bold text-pink-600">{favorites.length}</p>
                <p className="text-xs md:text-sm text-gray-600">商品数量</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 md:pt-6 text-center">
                <p className="text-2xl md:text-3xl font-bold text-red-600">¥{totalPrice.toLocaleString()}</p>
                <p className="text-xs md:text-sm text-gray-600">预估总价</p>
              </CardContent>
            </Card>
            <Card className="col-span-2 md:col-span-2">
              <CardContent className="pt-4 md:pt-6 text-center">
                <Button
                  onClick={handleExport}
                  disabled={exporting}
                  className="bg-pink-600 hover:bg-pink-700 w-full md:w-auto"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {exporting ? '导出中...' : '导出选品清单'}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 空状态 */}
        {favorites.length === 0 ? (
          <div className="text-center py-12 md:py-20">
            <Heart className="h-16 w-16 md:h-20 md:w-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-sm md:text-base mb-2">暂无收藏商品</p>
            <p className="text-gray-400 text-xs md:text-sm mb-4">在商品列表点击收藏按钮即可添加</p>
            <Button onClick={() => router.push('/')}>去选品</Button>
          </div>
        ) : (
          /* 商品列表 */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {favorites.map((favorite) => (
              <Card
                key={favorite.id}
                className="hover:shadow-lg transition-shadow overflow-hidden"
              >
                {/* 图片区域 */}
                <div
                  className="aspect-square bg-gray-100 flex items-center justify-center relative cursor-pointer overflow-hidden"
                  onClick={() => router.push(`/products/${favorite.product_id}`)}
                >
                  {favorite.primary_image_url ? (
                    <img
                      src={favorite.primary_image_url}
                      alt={favorite.products?.name || '商品图片'}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <ImageIcon className="h-12 w-12 md:h-16 md:w-16 text-gray-300" />
                  )}
                  <div className="absolute top-2 right-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="p-2 bg-white/80 hover:bg-white rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(favorite.product_id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                {/* 商品信息 */}
                <CardContent className="p-2 md:p-3">
                  <h3
                    className="font-medium text-xs md:text-sm mb-1 md:mb-2 line-clamp-2 min-h-[2rem] md:min-h-[2.5rem] cursor-pointer hover:text-pink-600"
                    onClick={() => router.push(`/products/${favorite.product_id}`)}
                  >
                    {favorite.products?.name || '未知商品'}
                  </h3>
                  <div className="space-y-0.5 md:space-y-1 text-[10px] md:text-sm text-gray-600">
                    {favorite.products?.brand && (
                      <p className="truncate">
                        <span className="font-medium">品牌:</span> {favorite.products.brand}
                      </p>
                    )}
                    {favorite.products?.price && (
                      <p className="text-sm md:text-lg font-bold text-red-600">¥{favorite.products.price}</p>
                    )}
                    {favorite.products?.supplier && (
                      <p className="truncate text-[10px] md:text-xs">
                        <span className="font-medium">供应商:</span> {favorite.products.supplier}
                      </p>
                    )}
                  </div>
                  {favorite.products?.level2_category && (
                    <Badge variant="outline" className="mt-1 md:mt-2 text-[10px] md:text-xs">
                      {favorite.products.level2_category}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* 移动端底部固定导出按钮 */}
      {favorites.length > 0 && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-3">
          <Button
            onClick={handleExport}
            disabled={exporting}
            className="w-full bg-pink-600 hover:bg-pink-700"
          >
            <Download className="h-4 w-4 mr-2" />
            {exporting ? '导出中...' : `导出选品清单 (${favorites.length}个商品)`}
          </Button>
        </div>
      )}
    </div>
  );
}
