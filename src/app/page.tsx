'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Upload, X, Image as ImageIcon, Download } from 'lucide-react';
import Image from 'next/image';

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
}

interface FilterOptions {
  suppliers: string[];
  level1Categories: string[];
  level2Categories: string[];
}

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [supplier, setSupplier] = useState('');
  const [level1Category, setLevel1Category] = useState('');
  const [level2Category, setLevel2Category] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    suppliers: [],
    level1Categories: [],
    level2Categories: [],
  });
  const [isAdmin, setIsAdmin] = useState(false);

  // 检查登录状态
  useEffect(() => {
    fetch('/api/auth')
      .then((res) => res.json())
      .then((data) => setIsAdmin(data.authenticated));
  }, []);

  // 登出
  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    setIsAdmin(false);
    alert('已登出');
  };

  // 获取筛选选项
  useEffect(() => {
    fetch('/api/filter-options')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setFilterOptions(data.data);
        }
      });
  }, []);

  // 搜索商品
  const searchProducts = async (pageNum = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.append('keyword', keyword);
      if (supplier) params.append('supplier', supplier);
      if (level1Category) params.append('level1Category', level1Category);
      if (level2Category) params.append('level2Category', level2Category);
      params.append('page', String(pageNum));
      params.append('pageSize', '20');

      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();

      if (data.success) {
        setProducts(data.data.products);
        setPage(data.data.page);
        setTotalPages(data.data.totalPages);
        setTotal(data.data.total);
      }
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    searchProducts(1);
  }, [supplier, level1Category, level2Category]);

  // 搜索按钮点击
  const handleSearch = () => {
    searchProducts(1);
  };

  // 重置筛选
  const handleReset = () => {
    setKeyword('');
    setSupplier('');
    setLevel1Category('');
    setLevel2Category('');
    searchProducts(1);
  };

  // 分页
  const handlePageChange = (newPage: number) => {
    searchProducts(newPage);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">星厨房商品库</h1>
              <p className="text-blue-100 mt-1">快捷搜索选品系统 · 多人协作共享</p>
            </div>
            <div className="flex gap-2">
              {isAdmin ? (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => router.push('/batch-import')}
                    className="bg-white text-blue-600 hover:bg-blue-50"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    批量导入图片
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="text-white hover:bg-blue-700"
                  >
                    登出
                  </Button>
                </>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => router.push('/login')}
                  className="bg-white text-blue-600 hover:bg-blue-50"
                >
                  管理员登录
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* 搜索栏 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              {/* 关键词搜索 */}
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="搜索商品名称、品牌、规格..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* 供应商筛选 */}
              <Select value={supplier || 'all'} onValueChange={(value) => setSupplier(value === 'all' ? '' : value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="供应商" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部供应商</SelectItem>
                  {filterOptions.suppliers.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 一级分类 */}
              <Select value={level1Category || 'all'} onValueChange={(value) => setLevel1Category(value === 'all' ? '' : value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="一级分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部分类</SelectItem>
                  {filterOptions.level1Categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 二级分类 */}
              <Select value={level2Category || 'all'} onValueChange={(value) => setLevel2Category(value === 'all' ? '' : value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="二级分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部分类</SelectItem>
                  {filterOptions.level2Categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 按钮组 */}
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? '搜索中...' : '搜索'}
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <X className="h-4 w-4 mr-2" />
                重置
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const params = new URLSearchParams();
                  if (keyword) params.append('keyword', keyword);
                  if (supplier) params.append('supplier', supplier);
                  if (level1Category) params.append('level1Category', level1Category);
                  if (level2Category) params.append('level2Category', level2Category);
                  window.open(`/api/products/export?${params}`, '_blank');
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                导出Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 统计信息 */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-gray-600">
            共找到 <span className="font-semibold text-blue-600">{total}</span> 个商品
          </p>
        </div>

        {/* 商品列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => (
            <Card
              key={product.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/products/${product.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <ImageIcon className="h-12 w-12 text-gray-300" />
                  <div className="absolute bottom-2 right-2">
                    <Badge variant="secondary" className="text-xs">
                      点击上传图片
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold text-base mb-2 line-clamp-2">{product.name}</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  {product.brand && (
                    <p>
                      <span className="font-medium">品牌:</span> {product.brand}
                    </p>
                  )}
                  {product.spec && (
                    <p>
                      <span className="font-medium">规格:</span> {product.spec}
                    </p>
                  )}
                  {product.price && (
                    <p className="text-lg font-bold text-red-600">¥{product.price}</p>
                  )}
                  {product.supplier && (
                    <p>
                      <span className="font-medium">供应商:</span> {product.supplier}
                    </p>
                  )}
                </div>
                {product.level2_category && (
                  <Badge variant="outline" className="mt-2">
                    {product.level2_category}
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
            >
              上一页
            </Button>
            <div className="flex items-center px-4">
              {page} / {totalPages}
            </div>
            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => handlePageChange(page + 1)}
            >
              下一页
            </Button>
          </div>
        )}

        {/* 空状态 */}
        {!loading && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">暂无商品数据</p>
          </div>
        )}
      </main>

      {/* 底部 */}
      <footer className="bg-white border-t mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          <p>星厨房商品库 · 快捷搜索选品系统</p>
          <p className="mt-1">多人协作共享 · 图片上传管理</p>
        </div>
      </footer>
    </div>
  );
}
