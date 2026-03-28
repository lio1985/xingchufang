'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
  Plus,
  Edit,
  X,
  CheckSquare,
  Square,
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

interface FilterOptions {
  suppliers: string[];
  level1Categories: string[];
  level2Categories: string[];
}

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ username: string; role: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'images' | 'data'>('overview');
  
  // 数据状态
  const [stats, setStats] = useState<Stats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [productPage, setProductPage] = useState(1);
  const [productTotal, setProductTotal] = useState(0);
  const [imagePage, setImagePage] = useState(1);
  const [imageTotal, setImageTotal] = useState(0);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    suppliers: [],
    level1Categories: [],
    level2Categories: [],
  });
  
  // 操作状态
  const [actionLoading, setActionLoading] = useState(false);
  
  // 新建/编辑商品
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    product_code: '',
    brand: '',
    spec: '',
    params: '',
    price: '',
    supplier: '',
    level1_category: '',
    level2_category: '',
    origin: '',
    warranty: '',
    selling_points: '',
    remarks: '',
  });
  
  // 批量选择
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false);

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
        loadFilterOptions();
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

  // 加载筛选选项
  const loadFilterOptions = async () => {
    try {
      const res = await fetch('/api/filter-options', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setFilterOptions(data.data);
      }
    } catch (error) {
      console.error('加载筛选选项失败:', error);
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
        setSelectedIds(new Set()); // 清空选择
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

  // 打开新建商品对话框
  const openCreateDialog = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      product_code: '',
      brand: '',
      spec: '',
      params: '',
      price: '',
      supplier: '',
      level1_category: '',
      level2_category: '',
      origin: '',
      warranty: '',
      selling_points: '',
      remarks: '',
    });
    setShowProductDialog(true);
  };

  // 打开编辑商品对话框
  const openEditDialog = async (product: Product) => {
    setEditingProduct(product);
    // 获取完整商品信息
    try {
      const res = await fetch(`/api/products/${product.id}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        const p = data.data;
        setProductForm({
          name: p.name || '',
          product_code: p.product_code || '',
          brand: p.brand || '',
          spec: p.spec || '',
          params: p.params || '',
          price: p.price || '',
          supplier: p.supplier || '',
          level1_category: p.level1_category || '',
          level2_category: p.level2_category || '',
          origin: p.origin || '',
          warranty: p.warranty || '',
          selling_points: p.selling_points || '',
          remarks: p.remarks || '',
        });
        setShowProductDialog(true);
      }
    } catch (error) {
      console.error('获取商品详情失败:', error);
    }
  };

  // 保存商品
  const handleSaveProduct = async () => {
    console.log('[handleSaveProduct] Starting...', { productForm, editingProduct });
    
    if (!productForm.name.trim()) {
      alert('请输入商品名称');
      return;
    }

    setActionLoading(true);
    try {
      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';

      console.log('[handleSaveProduct] Sending request:', { url, method, body: productForm });

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(productForm),
      });

      const data = await res.json();
      console.log('[handleSaveProduct] Response:', data);
      
      if (data.success) {
        setShowProductDialog(false);
        loadProducts(productPage);
        loadStats();
      } else {
        alert(data.error || '保存失败');
      }
    } catch (error) {
      console.error('[handleSaveProduct] Error:', error);
      alert('保存失败');
    } finally {
      setActionLoading(false);
    }
  };

  // 删除商品
  const handleDeleteProduct = async (productId: number) => {
    if (!confirm('确定要删除这个商品吗？此操作不可恢复。')) return;
    
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        loadProducts(productPage);
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

  // 切换选择
  const toggleSelect = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map(p => p.id)));
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/products/batch-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ product_ids: Array.from(selectedIds) }),
      });
      const data = await res.json();
      if (data.success) {
        setShowBatchDeleteConfirm(false);
        loadProducts(productPage);
        loadStats();
        alert(data.message);
      } else {
        alert(data.error || '删除失败');
      }
    } catch (error) {
      alert('删除失败');
    } finally {
      setActionLoading(false);
    }
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
                className="text-white hover:bg-blue-700 px-3 py-1.5 h-auto"
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
                className="text-white hover:bg-blue-700 px-3 py-1.5 h-auto"
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
              className="flex items-center gap-2 px-4 py-2"
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
                    onClick={() => { setActiveTab('products'); openCreateDialog(); }}
                  >
                    <Plus className="h-5 w-5" />
                    <span>新建商品</span>
                  </Button>
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
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle>商品列表 ({productTotal} 条)</CardTitle>
                <div className="flex gap-2 flex-wrap">
                  {selectedIds.size > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowBatchDeleteConfirm(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      删除选中 ({selectedIds.size})
                    </Button>
                  )}
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
                  <Button size="sm" onClick={openCreateDialog}>
                    <Plus className="h-4 w-4 mr-1" />
                    新建商品
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-2 w-8">
                        <button
                          onClick={toggleSelectAll}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {selectedIds.size === products.length && products.length > 0 ? (
                            <CheckSquare className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </th>
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
                        <td className="py-3 px-2">
                          <button
                            onClick={() => toggleSelect(product.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {selectedIds.has(product.id) ? (
                              <CheckSquare className="h-4 w-4 text-blue-600" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                          </button>
                        </td>
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
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(product)}
                              title="编辑"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/products/${product.id}`)}
                              title="查看"
                            >
                              查看
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="删除"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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

      {/* 新建/编辑商品对话框 */}
      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? '编辑商品' : '新建商品'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">商品名称 *</label>
                <Input
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="请输入商品名称"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">商品编码</label>
                <Input
                  value={productForm.product_code}
                  onChange={(e) => setProductForm({ ...productForm, product_code: e.target.value })}
                  placeholder="请输入商品编码"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">品牌</label>
                <Input
                  value={productForm.brand}
                  onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                  placeholder="请输入品牌"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">规格</label>
                <Input
                  value={productForm.spec}
                  onChange={(e) => setProductForm({ ...productForm, spec: e.target.value })}
                  placeholder="请输入规格"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">价格</label>
                <Input
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  placeholder="请输入价格"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">供应商</label>
                <Select
                  value={productForm.supplier || '__none__'}
                  onValueChange={(value) => setProductForm({ ...productForm, supplier: value === '__none__' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择供应商" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">无</SelectItem>
                    {filterOptions.suppliers.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">一级分类</label>
                <Select
                  value={productForm.level1_category || '__none__'}
                  onValueChange={(value) => setProductForm({ ...productForm, level1_category: value === '__none__' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择一级分类" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">无</SelectItem>
                    {filterOptions.level1Categories.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">二级分类</label>
                <Select
                  value={productForm.level2_category || '__none__'}
                  onValueChange={(value) => setProductForm({ ...productForm, level2_category: value === '__none__' ? '' : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择二级分类" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">无</SelectItem>
                    {filterOptions.level2Categories.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">产地</label>
                <Input
                  value={productForm.origin}
                  onChange={(e) => setProductForm({ ...productForm, origin: e.target.value })}
                  placeholder="请输入产地"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">质保</label>
                <Input
                  value={productForm.warranty}
                  onChange={(e) => setProductForm({ ...productForm, warranty: e.target.value })}
                  placeholder="请输入质保信息"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">参数</label>
              <Textarea
                value={productForm.params}
                onChange={(e) => setProductForm({ ...productForm, params: e.target.value })}
                placeholder="请输入商品参数"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">产品优势/卖点</label>
              <Textarea
                value={productForm.selling_points}
                onChange={(e) => setProductForm({ ...productForm, selling_points: e.target.value })}
                placeholder="请输入产品优势/卖点"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">备注</label>
              <Textarea
                value={productForm.remarks}
                onChange={(e) => setProductForm({ ...productForm, remarks: e.target.value })}
                placeholder="请输入备注"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProductDialog(false)}>
              取消
            </Button>
            <Button onClick={handleSaveProduct} disabled={actionLoading}>
              {actionLoading ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 批量删除确认对话框 */}
      <Dialog open={showBatchDeleteConfirm} onOpenChange={setShowBatchDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认批量删除</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            确定要删除选中的 {selectedIds.size} 个商品吗？此操作不可恢复，关联的图片也会被删除。
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBatchDeleteConfirm(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleBatchDelete} disabled={actionLoading}>
              {actionLoading ? '删除中...' : '确认删除'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
