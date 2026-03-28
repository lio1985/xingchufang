'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  Image as ImageIcon,
  Download,
  Upload,
  ArrowLeft,
  Shield,
  Trash2,
  Search,
  RefreshCw,
  Database,
  Users,
  TrendingUp,
  Loader2,
} from 'lucide-react';

interface Stats {
  totalProducts: number;
  productsWithImages: number;
  productsWithoutImages: number;
  totalSuppliers: number;
  totalCategories: number;
}

interface Product {
  id: number;
  name: string;
  brand: string | null;
  spec: string | null;
  supplier: string | null;
  level2_category: string | null;
  has_image: boolean;
}

interface ImageInfo {
  id: number;
  product_id: number;
  product_name: string;
  image_url: string;
  created_at: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ username: string; role: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'images' | 'data'>('overview');
  
  // 数据状态
  const [stats, setStats] = useState<Stats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [productPage, setProductPage] = useState(1);
  const [productTotal, setProductTotal] = useState(0);
  const [imagePage, setImagePage] = useState(1);
  const [imageTotal, setImageTotal] = useState(0);
  
  // 操作状态
  const [actionLoading, setActionLoading] = useState(false);

  // 检查登录状态和权限
  useEffect(() => {
    fetch('/api/auth', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated || data.user?.role !== 'admin') {
          router.push('/login');
          return;
        }
        setCurrentUser(data.user);
        setLoading(false);
        loadStats();
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  // 加载统计数据
  const loadStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('加载统计失败:', error);
    }
  };

  // 加载商品列表
  const loadProducts = async (page = 1) => {
    try {
      const params = new URLSearchParams();
      if (searchKeyword) params.append('keyword', searchKeyword);
      params.append('page', String(page));
      params.append('pageSize', '20');
      
      const res = await fetch(`/api/admin/products?${params}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setProducts(data.data.products);
        setProductPage(data.data.page);
        setProductTotal(data.data.total);
      }
    } catch (error) {
      console.error('加载商品失败:', error);
    }
  };

  // 加载图片列表
  const loadImages = async (page = 1) => {
    try {
      const res = await fetch(`/api/admin/images?page=${page}&pageSize=20`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setImages(data.data.images);
        setImagePage(data.data.page);
        setImageTotal(data.data.total);
      }
    } catch (error) {
      console.error('加载图片失败:', error);
    }
  };

  // 切换标签时加载数据
  useEffect(() => {
    if (loading || !currentUser) return;
    
    if (activeTab === 'products') {
      loadProducts(1);
    } else if (activeTab === 'images') {
      loadImages(1);
    }
  }, [activeTab, loading, currentUser]);

  // 登出
  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE', credentials: 'include' });
    router.push('/login');
  };

  // 导出数据
  const handleExport = () => {
    window.open('/api/products/export', '_blank');
  };

  // 删除图片
  const handleDeleteImage = async (imageId: number) => {
    if (!confirm('确定要删除这张图片吗？')) return;
    
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/images/${imageId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        loadImages(imagePage);
        loadStats();
      } else {
        alert(data.error || '删除失败');
      }
    } catch (error) {
      alert('删除失败');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 顶部导航 */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="text-white hover:bg-blue-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回首页
              </Button>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <h1 className="text-lg font-bold">管理后台</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg">
                <Shield className="h-4 w-4 text-yellow-300" />
                <span className="text-sm">{currentUser?.username}</span>
                <span className="text-xs text-blue-200">(管理员)</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-white hover:bg-blue-700"
              >
                退出
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* 标签导航 */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { key: 'overview', label: '概览', icon: TrendingUp },
            { key: 'products', label: '商品管理', icon: Package },
            { key: 'images', label: '图片管理', icon: ImageIcon },
            { key: 'data', label: '数据操作', icon: Database },
          ].map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className="flex items-center gap-2"
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* 概览 */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 统计卡片 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats?.totalProducts || 0}</p>
                      <p className="text-sm text-gray-500">商品总数</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <ImageIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats?.productsWithImages || 0}</p>
                      <p className="text-sm text-gray-500">已上传图片</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <ImageIcon className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats?.productsWithoutImages || 0}</p>
                      <p className="text-sm text-gray-500">待上传图片</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats?.totalSuppliers || 0}</p>
                      <p className="text-sm text-gray-500">供应商数</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 快捷操作 */}
            <Card>
              <CardHeader>
                <CardTitle>快捷操作</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                    onClick={() => router.push('/batch-import')}
                  >
                    <Upload className="h-5 w-5" />
                    <span>批量导入图片</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                    onClick={handleExport}
                  >
                    <Download className="h-5 w-5" />
                    <span>导出商品数据</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                    onClick={() => setActiveTab('products')}
                  >
                    <Package className="h-5 w-5" />
                    <span>商品管理</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2"
                    onClick={() => setActiveTab('images')}
                  >
                    <ImageIcon className="h-5 w-5" />
                    <span>图片管理</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 商品管理 */}
        {activeTab === 'products' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>商品列表 ({productTotal} 条)</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="搜索商品名称..."
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && loadProducts(1)}
                      className="pl-9 w-48"
                    />
                  </div>
                  <Button variant="outline" size="sm" onClick={() => loadProducts(1)}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    刷新
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">ID</th>
                      <th className="text-left py-3 px-2">商品名称</th>
                      <th className="text-left py-3 px-2">品牌</th>
                      <th className="text-left py-3 px-2">供应商</th>
                      <th className="text-left py-3 px-2">分类</th>
                      <th className="text-left py-3 px-2">图片</th>
                      <th className="text-left py-3 px-2">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-2">{product.id}</td>
                        <td className="py-3 px-2 max-w-[200px] truncate">{product.name}</td>
                        <td className="py-3 px-2">{product.brand || '-'}</td>
                        <td className="py-3 px-2">{product.supplier || '-'}</td>
                        <td className="py-3 px-2">{product.level2_category || '-'}</td>
                        <td className="py-3 px-2">
                          <Badge variant={product.has_image ? 'default' : 'secondary'}>
                            {product.has_image ? '有' : '无'}
                          </Badge>
                        </td>
                        <td className="py-3 px-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/products/${product.id}`)}
                          >
                            查看
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* 分页 */}
              {productTotal > 20 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={productPage === 1}
                    onClick={() => loadProducts(productPage - 1)}
                  >
                    上一页
                  </Button>
                  <span className="px-4 py-2">
                    {productPage} / {Math.ceil(productTotal / 20)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={productPage * 20 >= productTotal}
                    onClick={() => loadProducts(productPage + 1)}
                  >
                    下一页
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 图片管理 */}
        {activeTab === 'images' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>图片列表 ({imageTotal} 张)</CardTitle>
                <Button variant="outline" size="sm" onClick={() => loadImages(imagePage)}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  刷新
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {images.map((image) => (
                  <div key={image.id} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={image.image_url}
                        alt={image.product_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="mt-2">
                      <p className="text-xs truncate">{image.product_name}</p>
                      <p className="text-xs text-gray-400">{image.product_id}</p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteImage(image.id)}
                      disabled={actionLoading}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              
              {/* 分页 */}
              {imageTotal > 20 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={imagePage === 1}
                    onClick={() => loadImages(imagePage - 1)}
                  >
                    上一页
                  </Button>
                  <span className="px-4 py-2">
                    {imagePage} / {Math.ceil(imageTotal / 20)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={imagePage * 20 >= imageTotal}
                    onClick={() => loadImages(imagePage + 1)}
                  >
                    下一页
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 数据操作 */}
        {activeTab === 'data' && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>数据导出</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-500">
                  导出所有商品数据为Excel文件，包含商品名称、品牌、规格、价格、供应商等信息。
                </p>
                <Button onClick={handleExport} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  导出Excel
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>图片导入</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-500">
                  批量上传商品图片，支持按文件名自动匹配商品（格式：商品编码.jpg）。
                </p>
                <Button 
                  onClick={() => router.push('/batch-import')} 
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  批量导入图片
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
