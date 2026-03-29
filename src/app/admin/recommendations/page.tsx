'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  DialogDescription,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Star,
  Trash2,
  Search,
  Plus,
  Flame,
  Sparkles,
  DollarSign,
  Award,
  Calendar,
  Loader2,
  Image as ImageIcon,
  Settings,
} from 'lucide-react';

// 推荐类型配置
const RECOMMEND_TYPES = {
  hot: { label: '爆款', color: 'bg-red-500', icon: Flame },
  new: { label: '新款', color: 'bg-green-500', icon: Sparkles },
  sale: { label: '特价', color: 'bg-orange-500', icon: DollarSign },
  featured: { label: '精选', color: 'bg-blue-500', icon: Award },
} as const;

interface Recommendation {
  id: number;
  product_id: number;
  recommend_type: keyof typeof RECOMMEND_TYPES;
  start_date: string | null;
  end_date: string | null;
  sort_order: number;
  created_by: string | null;
  created_at: string;
  products?: {
    id: number;
    name: string;
    brand: string | null;
    spec: string | null;
    price: string | null;
    supplier: string | null;
    level2_category: string | null;
  };
  primary_image_url?: string | null;
}

interface Product {
  id: number;
  name: string;
  brand: string | null;
  spec: string | null;
  price: string | null;
  supplier: string | null;
  level2_category: string | null;
  primary_image_url?: string | null;
}

function RecommendationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  
  // 添加推荐对话框
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedType, setSelectedType] = useState<keyof typeof RECOMMEND_TYPES>('hot');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [submitLoading, setSubmitLoading] = useState(false);

  // 编辑对话框
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingRec, setEditingRec] = useState<Recommendation | null>(null);

  // 删除确认
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // 处理URL参数，从商品列表跳转过来时自动打开添加对话框
  useEffect(() => {
    const productId = searchParams.get('productId');
    const productName = searchParams.get('productName');
    
    if (productId && productName) {
      // 设置选中的商品
      setSelectedProduct({
        id: parseInt(productId),
        name: productName,
        brand: null,
        spec: null,
        price: null,
        supplier: null,
        level2_category: null,
      });
      // 打开添加对话框
      setShowAddDialog(true);
      // 清除URL参数
      router.replace('/admin/recommendations', { scroll: false });
    }
  }, [searchParams, router]);

  // 获取推荐列表
  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType !== 'all') {
        params.append('type', filterType);
      }
      params.append('withProducts', 'true');
      
      const res = await fetch(`/api/recommendations?${params}`);
      const data = await res.json();
      
      if (data.success) {
        setRecommendations(data.data);
      }
    } catch (error) {
      console.error('获取推荐列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [filterType]);

  // 搜索商品
  const searchProducts = async () => {
    if (!searchKeyword.trim()) return;
    
    setSearchLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('keyword', searchKeyword.trim());
      params.append('pageSize', '10');
      
      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();
      
      if (data.success) {
        setSearchResults(data.data.products);
      }
    } catch (error) {
      console.error('搜索商品失败:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  // 添加推荐
  const handleAddRecommendation = async () => {
    if (!selectedProduct) return;
    
    setSubmitLoading(true);
    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          recommendType: selectedType,
          startDate: startDate || null,
          endDate: endDate || null,
          sortOrder,
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setShowAddDialog(false);
        resetAddForm();
        fetchRecommendations();
      } else {
        alert(data.error || '添加失败');
      }
    } catch (error) {
      console.error('添加推荐失败:', error);
      alert('添加失败，请重试');
    } finally {
      setSubmitLoading(false);
    }
  };

  // 更新推荐
  const handleUpdateRecommendation = async () => {
    if (!editingRec) return;
    
    setSubmitLoading(true);
    try {
      const res = await fetch('/api/recommendations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingRec.id,
          recommendType: selectedType,
          startDate: startDate || null,
          endDate: endDate || null,
          sortOrder,
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setShowEditDialog(false);
        fetchRecommendations();
      } else {
        alert(data.error || '更新失败');
      }
    } catch (error) {
      console.error('更新推荐失败:', error);
      alert('更新失败，请重试');
    } finally {
      setSubmitLoading(false);
    }
  };

  // 删除推荐
  const handleDeleteRecommendation = async () => {
    if (!deleteId) return;
    
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/recommendations?id=${deleteId}`, {
        method: 'DELETE',
      });
      
      const data = await res.json();
      
      if (data.success) {
        setDeleteId(null);
        fetchRecommendations();
      } else {
        alert(data.error || '删除失败');
      }
    } catch (error) {
      console.error('删除推荐失败:', error);
      alert('删除失败，请重试');
    } finally {
      setDeleteLoading(false);
    }
  };

  // 重置添加表单
  const resetAddForm = () => {
    setSelectedProduct(null);
    setSearchKeyword('');
    setSearchResults([]);
    setSelectedType('hot');
    setStartDate('');
    setEndDate('');
    setSortOrder(0);
  };

  // 打开编辑对话框
  const openEditDialog = (rec: Recommendation) => {
    setEditingRec(rec);
    setSelectedType(rec.recommend_type);
    setStartDate(rec.start_date?.split('T')[0] || '');
    setEndDate(rec.end_date?.split('T')[0] || '');
    setSortOrder(rec.sort_order);
    setShowEditDialog(true);
  };

  // 判断推荐是否有效
  const isActive = (rec: Recommendation) => {
    const now = new Date();
    if (rec.start_date && new Date(rec.start_date) > now) return false;
    if (rec.end_date && new Date(rec.end_date) < now) return false;
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.push('/admin')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回
              </Button>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  推荐管理
                </h1>
                <p className="text-sm text-gray-500">管理爆款、新款、特价等推荐商品</p>
              </div>
            </div>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              添加推荐
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* 筛选栏 */}
        <Card className="mb-6">
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">推荐类型：</span>
              <div className="flex gap-2">
                <Button
                  variant={filterType === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('all')}
                >
                  全部
                </Button>
                {Object.entries(RECOMMEND_TYPES).map(([key, { label, color }]) => {
                  const Icon = RECOMMEND_TYPES[key as keyof typeof RECOMMEND_TYPES].icon;
                  return (
                    <Button
                      key={key}
                      variant={filterType === key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterType(key)}
                      className="flex items-center gap-1"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 推荐列表 */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : recommendations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">暂无推荐商品</p>
              <p className="text-sm text-gray-400 mt-1">点击上方"添加推荐"按钮开始</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {recommendations.map((rec) => {
              const typeConfig = RECOMMEND_TYPES[rec.recommend_type];
              const Icon = typeConfig.icon;
              const active = isActive(rec);
              
              return (
                <Card key={rec.id} className={`overflow-hidden ${!active ? 'opacity-60' : ''}`}>
                  {/* 商品图片 */}
                  <div className="aspect-square bg-gray-100 relative">
                    {rec.primary_image_url ? (
                      <img
                        src={rec.primary_image_url}
                        alt={rec.products?.name || ''}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-gray-300" />
                      </div>
                    )}
                    {/* 类型标签 */}
                    <Badge className={`absolute top-2 left-2 ${typeConfig.color} text-white`}>
                      <Icon className="h-3 w-3 mr-1" />
                      {typeConfig.label}
                    </Badge>
                    {/* 有效期状态 */}
                    {!active && (
                      <Badge variant="secondary" className="absolute top-2 right-2">
                        已过期
                      </Badge>
                    )}
                  </div>
                  
                  {/* 商品信息 */}
                  <CardContent className="p-3">
                    <h3 className="font-medium text-sm line-clamp-2 mb-2">
                      {rec.products?.name || '未知商品'}
                    </h3>
                    <div className="text-xs text-gray-500 space-y-1">
                      {rec.products?.brand && (
                        <p>品牌: {rec.products.brand}</p>
                      )}
                      {rec.products?.price && (
                        <p className="text-red-600 font-semibold">¥{rec.products.price}</p>
                      )}
                      {rec.sort_order > 0 && (
                        <p>排序: {rec.sort_order}</p>
                      )}
                      {rec.start_date && (
                        <p className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(rec.start_date).toLocaleDateString()}
                          {rec.end_date && ` - ${new Date(rec.end_date).toLocaleDateString()}`}
                        </p>
                      )}
                    </div>
                    
                    {/* 操作按钮 */}
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openEditDialog(rec)}
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        编辑
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => setDeleteId(rec.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* 添加推荐对话框 */}
      <Dialog open={showAddDialog} onOpenChange={(open) => {
        setShowAddDialog(open);
        if (!open) resetAddForm();
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>添加推荐商品</DialogTitle>
            <DialogDescription>
              选择商品并设置推荐类型
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* 搜索商品 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">搜索商品</label>
              <div className="flex gap-2">
                <Input
                  placeholder="输入商品名称或编码..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchProducts()}
                />
                <Button onClick={searchProducts} disabled={searchLoading}>
                  {searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            {/* 搜索结果 */}
            {searchResults.length > 0 && (
              <div className="border rounded-lg max-h-48 overflow-y-auto">
                {searchResults.map((product) => (
                  <div
                    key={product.id}
                    className={`p-2 cursor-pointer hover:bg-gray-50 flex items-center gap-2 ${
                      selectedProduct?.id === product.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedProduct(product)}
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded flex-shrink-0">
                      {product.primary_image_url ? (
                        <img src={product.primary_image_url} alt="" className="w-full h-full object-contain" />
                      ) : (
                        <ImageIcon className="w-full h-full p-2 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.brand} {product.price && `· ¥${product.price}`}</p>
                    </div>
                    {selectedProduct?.id === product.id && (
                      <Badge variant="default">已选</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* 已选商品 */}
            {selectedProduct && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600 mb-1">已选商品：</p>
                <p className="font-medium">{selectedProduct.name}</p>
              </div>
            )}
            
            {/* 推荐类型 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">推荐类型</label>
              <Select value={selectedType} onValueChange={(v) => setSelectedType(v as keyof typeof RECOMMEND_TYPES)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(RECOMMEND_TYPES).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* 有效期 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">开始日期（可选）</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">结束日期（可选）</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            
            {/* 排序权重 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">排序权重（数字越大越靠前）</label>
              <Input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              取消
            </Button>
            <Button onClick={handleAddRecommendation} disabled={!selectedProduct || submitLoading}>
              {submitLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              确认添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑推荐对话框 */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>编辑推荐</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* 商品信息 */}
            {editingRec && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="font-medium">{editingRec.products?.name}</p>
              </div>
            )}
            
            {/* 推荐类型 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">推荐类型</label>
              <Select value={selectedType} onValueChange={(v) => setSelectedType(v as keyof typeof RECOMMEND_TYPES)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(RECOMMEND_TYPES).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* 有效期 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">开始日期</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">结束日期</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            
            {/* 排序权重 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">排序权重</label>
              <Input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              取消
            </Button>
            <Button onClick={handleUpdateRecommendation} disabled={submitLoading}>
              {submitLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              保存修改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除这个推荐吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDeleteRecommendation} disabled={deleteLoading}>
              {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function RecommendationsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    }>
      <RecommendationsContent />
    </Suspense>
  );
}
