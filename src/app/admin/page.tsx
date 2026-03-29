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
  Building2,
  FolderTree,
  Star,
  Flame,
  Sparkles,
  DollarSign,
  Award,
} from 'lucide-react';

// 推荐类型配置
const RECOMMEND_TYPES = {
  hot: { label: '爆款', color: 'bg-red-500', icon: Flame },
  new: { label: '新款', color: 'bg-green-500', icon: Sparkles },
  sale: { label: '特价', color: 'bg-orange-500', icon: DollarSign },
  featured: { label: '精选', color: 'bg-blue-500', icon: Award },
} as const;

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
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'images' | 'suppliers' | 'categories' | 'registrations' | 'data'>('overview');
  
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
  
  // 注册审核
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [registrationStatus, setRegistrationStatus] = useState<'pending' | 'all'>('pending');
  const [registrationLoading, setRegistrationLoading] = useState(false);
  
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

  // 供应商管理
  interface Supplier {
    id: number;
    name: string;
    contact_person: string | null;
    phone: string | null;
    address: string | null;
    remarks: string | null;
  }
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showSupplierDialog, setShowSupplierDialog] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    contact_person: '',
    phone: '',
    address: '',
    remarks: '',
  });

  // 分类管理
  interface Category {
    id: number;
    name: string;
    level: number;
    parent_id: number | null;
    sort_order: number;
    parent?: { id: number; name: string } | null;
  }
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    level: 1,
    parent_id: null as number | null,
    sort_order: 0,
  });

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

  // 加载注册申请列表
  const loadRegistrations = async () => {
    setRegistrationLoading(true);
    try {
      const res = await fetch(`/api/admin/registrations?status=${registrationStatus}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setRegistrations(data.data);
      }
    } catch (error) {
      console.error('加载注册申请失败:', error);
    } finally {
      setRegistrationLoading(false);
    }
  };

  // 加载供应商列表
  const loadSuppliers = async () => {
    try {
      const res = await fetch('/api/admin/suppliers', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setSuppliers(data.data);
      }
    } catch (error) {
      console.error('加载供应商失败:', error);
    }
  };

  // 加载分类列表
  const loadCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('加载分类失败:', error);
    }
  };

  // 审核通过
  const handleApprove = async (registrationId: number, username: string) => {
    if (!confirm(`确定通过 ${username} 的注册申请吗？`)) return;
    
    setRegistrationLoading(true);
    try {
      const res = await fetch('/api/admin/registrations/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ registrationId }),
      });
      const data = await res.json();
      if (data.success) {
        loadRegistrations();
      } else {
        alert(data.error || '操作失败');
      }
    } catch (error) {
      alert('操作失败');
    } finally {
      setRegistrationLoading(false);
    }
  };

  // 审核拒绝
  const handleReject = async (registrationId: number, username: string) => {
    const reason = prompt(`请输入拒绝 ${username} 的原因（选填）：`);
    if (reason === null) return; // 用户取消
    
    setRegistrationLoading(true);
    try {
      const res = await fetch('/api/admin/registrations/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ registrationId, reason }),
      });
      const data = await res.json();
      if (data.success) {
        loadRegistrations();
      } else {
        alert(data.error || '操作失败');
      }
    } catch (error) {
      alert('操作失败');
    } finally {
      setRegistrationLoading(false);
    }
  };

  // 切换标签时加载数据
  useEffect(() => {
    if (loading || !currentUser) return;
    
    if (activeTab === 'products') {
      loadProducts(1);
    } else if (activeTab === 'images') {
      loadImages(1);
    } else if (activeTab === 'registrations') {
      loadRegistrations();
    } else if (activeTab === 'suppliers') {
      loadSuppliers();
    } else if (activeTab === 'categories') {
      loadCategories();
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

  // ========== 供应商管理 ==========
  
  // 打开新建供应商对话框
  const openCreateSupplierDialog = () => {
    setEditingSupplier(null);
    setSupplierForm({
      name: '',
      contact_person: '',
      phone: '',
      address: '',
      remarks: '',
    });
    setShowSupplierDialog(true);
  };

  // 打开编辑供应商对话框
  const openEditSupplierDialog = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setSupplierForm({
      name: supplier.name,
      contact_person: supplier.contact_person || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      remarks: supplier.remarks || '',
    });
    setShowSupplierDialog(true);
  };

  // 保存供应商
  const handleSaveSupplier = async () => {
    if (!supplierForm.name.trim()) {
      alert('请输入供应商名称');
      return;
    }

    setActionLoading(true);
    try {
      const url = editingSupplier
        ? `/api/admin/suppliers`
        : '/api/admin/suppliers';
      const method = editingSupplier ? 'PUT' : 'POST';
      const body = editingSupplier
        ? { id: editingSupplier.id, ...supplierForm }
        : supplierForm;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        setShowSupplierDialog(false);
        loadSuppliers();
        loadFilterOptions();
      } else {
        alert(data.error || '保存失败');
      }
    } catch (error) {
      alert('保存失败');
    } finally {
      setActionLoading(false);
    }
  };

  // 删除供应商
  const handleDeleteSupplier = async (id: number, name: string) => {
    if (!confirm(`确定要删除供应商"${name}"吗？`)) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/suppliers?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        loadSuppliers();
      } else {
        alert(data.error || '删除失败');
      }
    } catch (error) {
      alert('删除失败');
    } finally {
      setActionLoading(false);
    }
  };

  // ========== 分类管理 ==========

  // 打开新建分类对话框
  const openCreateCategoryDialog = (level: number = 1, parentId: number | null = null) => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      level,
      parent_id: parentId,
      sort_order: 0,
    });
    setShowCategoryDialog(true);
  };

  // 打开编辑分类对话框
  const openEditCategoryDialog = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      level: category.level,
      parent_id: category.parent_id,
      sort_order: category.sort_order,
    });
    setShowCategoryDialog(true);
  };

  // 保存分类
  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) {
      alert('请输入分类名称');
      return;
    }

    setActionLoading(true);
    try {
      const url = editingCategory
        ? '/api/admin/categories'
        : '/api/admin/categories';
      const method = editingCategory ? 'PUT' : 'POST';
      const body = editingCategory
        ? { id: editingCategory.id, ...categoryForm }
        : categoryForm;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        setShowCategoryDialog(false);
        loadCategories();
        loadFilterOptions();
      } else {
        alert(data.error || '保存失败');
      }
    } catch (error) {
      alert('保存失败');
    } finally {
      setActionLoading(false);
    }
  };

  // 删除分类
  const handleDeleteCategory = async (id: number, name: string) => {
    if (!confirm(`确定要删除分类"${name}"吗？`)) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        loadCategories();
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
            { key: 'suppliers', label: '供应商', icon: Building2 },
            { key: 'categories', label: '产品分类', icon: FolderTree },
            { key: 'registrations', label: '用户审核', icon: Users },
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
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col gap-2 bg-yellow-50 border-yellow-200 hover:bg-yellow-100"
                    onClick={() => router.push('/admin/recommendations')}
                  >
                    <Star className="h-5 w-5 text-yellow-600" />
                    <span>推荐管理</span>
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
                              onClick={() => router.push(`/admin/recommendations?productId=${product.id}&productName=${encodeURIComponent(product.name)}`)}
                              title="设为推荐"
                            >
                              <Star className="h-4 w-4" />
                            </Button>
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

        {/* 用户审核 */}
        {activeTab === 'registrations' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle>用户注册审核</CardTitle>
                <div className="flex gap-2">
                  <Select
                    value={registrationStatus}
                    onValueChange={(value) => { setRegistrationStatus(value as 'pending' | 'all'); setTimeout(loadRegistrations, 0); }}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">待审核</SelectItem>
                      <SelectItem value="all">全部</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={loadRegistrations}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    刷新
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {registrationLoading ? (
                <div className="text-center py-8 text-gray-500">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  加载中...
                </div>
              ) : registrations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  暂无注册申请
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2">用户名</th>
                        <th className="text-left py-3 px-2">角色</th>
                        <th className="text-left py-3 px-2">联系方式</th>
                        <th className="text-left py-3 px-2">备注</th>
                        <th className="text-left py-3 px-2">申请时间</th>
                        <th className="text-left py-3 px-2">状态</th>
                        <th className="text-left py-3 px-2">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registrations.map((reg) => (
                        <tr key={reg.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-2 font-medium">{reg.username}</td>
                          <td className="py-3 px-2">
                            <Badge variant={reg.role === 'admin' ? 'default' : 'secondary'}>
                              {reg.role === 'admin' ? '管理员' : '销售'}
                            </Badge>
                          </td>
                          <td className="py-3 px-2">{reg.contact || '-'}</td>
                          <td className="py-3 px-2 max-w-[200px] truncate" title={reg.remarks}>{reg.remarks || '-'}</td>
                          <td className="py-3 px-2 text-gray-500">
                            {new Date(reg.created_at).toLocaleString('zh-CN')}
                          </td>
                          <td className="py-3 px-2">
                            <Badge
                              variant={
                                reg.status === 'approved' ? 'default' :
                                reg.status === 'rejected' ? 'destructive' : 'secondary'
                              }
                            >
                              {reg.status === 'approved' ? '已通过' :
                               reg.status === 'rejected' ? '已拒绝' : '待审核'}
                            </Badge>
                          </td>
                          <td className="py-3 px-2">
                            {reg.status === 'pending' ? (
                              <div className="flex gap-1">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleApprove(reg.id, reg.username)}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                >
                                  通过
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleReject(reg.id, reg.username)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  拒绝
                                </Button>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">
                                {reg.reviewed_by && `由 ${reg.reviewed_by} 处理`}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 供应商管理 */}
        {activeTab === 'suppliers' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>供应商管理 ({suppliers.length} 个)</CardTitle>
                <Button size="sm" onClick={openCreateSupplierDialog}>
                  <Plus className="h-4 w-4 mr-1" />
                  新增供应商
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">ID</th>
                      <th className="text-left py-3 px-2">供应商名称</th>
                      <th className="text-left py-3 px-2">联系人</th>
                      <th className="text-left py-3 px-2">电话</th>
                      <th className="text-left py-3 px-2">地址</th>
                      <th className="text-left py-3 px-2">备注</th>
                      <th className="text-left py-3 px-2">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suppliers.map((supplier) => (
                      <tr key={supplier.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-2">{supplier.id}</td>
                        <td className="py-3 px-2 font-medium">{supplier.name}</td>
                        <td className="py-3 px-2">{supplier.contact_person || '-'}</td>
                        <td className="py-3 px-2">{supplier.phone || '-'}</td>
                        <td className="py-3 px-2 max-w-[200px] truncate">{supplier.address || '-'}</td>
                        <td className="py-3 px-2 max-w-[200px] truncate">{supplier.remarks || '-'}</td>
                        <td className="py-3 px-2">
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditSupplierDialog(supplier)}
                              title="编辑"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSupplier(supplier.id, supplier.name)}
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
            </CardContent>
          </Card>
        )}

        {/* 分类管理 */}
        {activeTab === 'categories' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>产品分类管理</CardTitle>
                <Button size="sm" onClick={() => openCreateCategoryDialog(1)}>
                  <Plus className="h-4 w-4 mr-1" />
                  新增一级分类
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* 一级分类 */}
              {categories.filter(c => c.level === 1).map((level1Cat) => (
                <div key={level1Cat.id} className="mb-4 border rounded-lg">
                  <div className="flex items-center justify-between p-3 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <Badge variant="default">一级</Badge>
                      <span className="font-medium">{level1Cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openCreateCategoryDialog(2, level1Cat.id)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        添加子分类
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditCategoryDialog(level1Cat)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCategory(level1Cat.id, level1Cat.name)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {/* 二级分类 */}
                  <div className="p-3">
                    {categories.filter(c => c.parent_id === level1Cat.id).length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {categories
                          .filter(c => c.parent_id === level1Cat.id)
                          .map((level2Cat) => (
                            <div
                              key={level2Cat.id}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded border group"
                            >
                              <span className="text-sm">{level2Cat.name}</span>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditCategoryDialog(level2Cat)}
                                  className="p-1 h-auto"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteCategory(level2Cat.id, level2Cat.name)}
                                  className="p-1 h-auto text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">暂无子分类</p>
                    )}
                  </div>
                </div>
              ))}
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

      {/* 供应商对话框 */}
      <Dialog open={showSupplierDialog} onOpenChange={setShowSupplierDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSupplier ? '编辑供应商' : '新增供应商'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">供应商名称 *</label>
              <Input
                value={supplierForm.name}
                onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                placeholder="请输入供应商名称"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">联系人</label>
                <Input
                  value={supplierForm.contact_person}
                  onChange={(e) => setSupplierForm({ ...supplierForm, contact_person: e.target.value })}
                  placeholder="请输入联系人"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">电话</label>
                <Input
                  value={supplierForm.phone}
                  onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                  placeholder="请输入电话"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">地址</label>
              <Input
                value={supplierForm.address}
                onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                placeholder="请输入地址"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">备注</label>
              <Textarea
                value={supplierForm.remarks}
                onChange={(e) => setSupplierForm({ ...supplierForm, remarks: e.target.value })}
                placeholder="请输入备注"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSupplierDialog(false)}>
              取消
            </Button>
            <Button onClick={handleSaveSupplier} disabled={actionLoading}>
              {actionLoading ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 分类对话框 */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? '编辑分类' : `新增${categoryForm.level === 1 ? '一级' : '二级'}分类`}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">分类名称 *</label>
              <Input
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                placeholder="请输入分类名称"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">排序（数字越小越靠前）</label>
              <Input
                type="number"
                value={categoryForm.sort_order}
                onChange={(e) => setCategoryForm({ ...categoryForm, sort_order: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            {categoryForm.level === 2 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">父分类</label>
                <Select
                  value={categoryForm.parent_id?.toString() || ''}
                  onValueChange={(value) => setCategoryForm({ ...categoryForm, parent_id: parseInt(value) || null })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择父分类" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c.level === 1).map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>
              取消
            </Button>
            <Button onClick={handleSaveCategory} disabled={actionLoading}>
              {actionLoading ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
