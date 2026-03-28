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
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Upload, X, Image as ImageIcon, Download, TrendingUp, Shield, Eye, Menu, LogOut, ChevronLeft, ChevronRight, Filter, Settings } from 'lucide-react';

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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // 检查登录状态
  useEffect(() => {
    // 检查Cookie认证
    fetch('/api/auth', { 
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('[Home] Auth check result:', JSON.stringify(data));
        if (data.authenticated && data.user) {
          console.log('[Home] Setting currentUser:', data.user.username, 'role:', data.user.role);
          setCurrentUser(data.user);
        } else {
          console.log('[Home] Not authenticated, middleware will handle redirect');
        }
      })
      .catch((err) => {
        console.error('[Home] Auth check error:', err);
      });
  }, [router]);
  
  // 是否为管理员
  const isAdmin = currentUser?.role === 'admin';

  // 登出
  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE', credentials: 'include' });
    router.push('/login');
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

      const res = await fetch(`/api/search?${params}`);
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
    setShowFilters(false);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          {/* 桌面端头部 */}
          <div className="hidden md:flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">⭐ 星厨房商品库</h1>
              <p className="text-blue-100 text-sm mt-1">快捷搜索选品系统 · 多人协作共享</p>
            </div>
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/admin')}
                  className="text-white hover:bg-blue-700"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  管理后台
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/statistics')}
                className="text-white hover:bg-blue-700"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                数据统计
              </Button>
              {isAdmin && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => router.push('/batch-import')}
                  className="bg-white text-blue-600 hover:bg-blue-50"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  批量导入
                </Button>
              )}
              {/* 用户信息和退出按钮 */}
              <div className="flex items-center gap-2">
                {currentUser ? (
                  <>
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="text-white hover:bg-blue-700"
                      title="退出登录"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <div className="px-3 py-1.5 bg-white/10 rounded-lg">
                    <span className="text-sm text-blue-200">加载中...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 移动端头部 */}
          <div className="md:hidden">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-bold">⭐ 星厨房商品库</h1>
              <div className="flex items-center gap-2">
                {currentUser && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded-full">
                    {currentUser.role === 'admin' ? (
                      <Shield className="h-3.5 w-3.5 text-yellow-300" />
                    ) : (
                      <Eye className="h-3.5 w-3.5 text-green-300" />
                    )}
                    <span className="text-xs text-white">{currentUser.username}</span>
                    <span className="text-xs text-blue-200">
                      ({currentUser.role === 'admin' ? '管理员' : '销售'})
                    </span>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="text-white hover:bg-blue-700 p-2"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* 移动端菜单 */}
            {showMobileMenu && (
              <div className="mt-3 pt-3 border-t border-white/20 space-y-2">
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { router.push('/admin'); setShowMobileMenu(false); }}
                    className="w-full justify-start text-white hover:bg-blue-700"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    管理后台
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { router.push('/statistics'); setShowMobileMenu(false); }}
                  className="w-full justify-start text-white hover:bg-blue-700"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  数据统计
                </Button>
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { router.push('/batch-import'); setShowMobileMenu(false); }}
                    className="w-full justify-start text-white hover:bg-blue-700"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    批量导入图片
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { handleLogout(); setShowMobileMenu(false); }}
                  className="w-full justify-start text-white hover:bg-blue-700"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  退出登录
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 md:py-6">
        {/* 搜索栏 - 桌面端 */}
        <Card className="mb-4 md:mb-6 hidden md:block">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-3">
              {/* 关键词搜索 */}
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="搜索商品名称、品牌、规格..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* 供应商筛选 */}
              <Select value={supplier || 'all'} onValueChange={(value) => setSupplier(value === 'all' ? '' : value)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="供应商" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部供应商</SelectItem>
                  {filterOptions.suppliers.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 一级分类 */}
              <Select value={level1Category || 'all'} onValueChange={(value) => setLevel1Category(value === 'all' ? '' : value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="一级分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部分类</SelectItem>
                  {filterOptions.level1Categories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 二级分类 */}
              <Select value={level2Category || 'all'} onValueChange={(value) => setLevel2Category(value === 'all' ? '' : value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="二级分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部分类</SelectItem>
                  {filterOptions.level2Categories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
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
                导出
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 搜索栏 - 移动端 */}
        <div className="md:hidden mb-4">
          {/* 搜索输入框 */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索商品名称、品牌..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 pr-20"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowFilters(!showFilters)}
                className="p-2"
              >
                <Filter className="h-4 w-4" />
              </Button>
              <Button size="sm" onClick={handleSearch} disabled={loading}>
                搜索
              </Button>
            </div>
          </div>

          {/* 筛选面板 */}
          {showFilters && (
            <Card className="mb-3">
              <CardContent className="pt-4 pb-3 space-y-3">
                <Select value={supplier || 'all'} onValueChange={(value) => setSupplier(value === 'all' ? '' : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="供应商" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部供应商</SelectItem>
                    {filterOptions.suppliers.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={level1Category || 'all'} onValueChange={(value) => setLevel1Category(value === 'all' ? '' : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="一级分类" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部分类</SelectItem>
                    {filterOptions.level1Categories.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={level2Category || 'all'} onValueChange={(value) => setLevel2Category(value === 'all' ? '' : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="二级分类" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部分类</SelectItem>
                    {filterOptions.level2Categories.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={handleReset} className="flex-1">
                    <X className="h-4 w-4 mr-1" />
                    重置
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const params = new URLSearchParams();
                      if (keyword) params.append('keyword', keyword);
                      if (supplier) params.append('supplier', supplier);
                      if (level1Category) params.append('level1Category', level1Category);
                      if (level2Category) params.append('level2Category', level2Category);
                      window.open(`/api/products/export?${params}`, '_blank');
                    }}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    导出Excel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 当前筛选标签 */}
          {(supplier || level1Category || level2Category) && (
            <div className="flex flex-wrap gap-2 mb-3">
              {supplier && (
                <Badge variant="secondary" className="gap-1">
                  供应商: {supplier}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSupplier('')} />
                </Badge>
              )}
              {level1Category && (
                <Badge variant="secondary" className="gap-1">
                  分类: {level1Category}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setLevel1Category('')} />
                </Badge>
              )}
              {level2Category && (
                <Badge variant="secondary" className="gap-1">
                  子类: {level2Category}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setLevel2Category('')} />
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* 统计信息 */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm md:text-base text-gray-600">
            共找到 <span className="font-semibold text-blue-600">{total}</span> 个商品
          </p>
        </div>

        {/* 商品列表 */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
          {products.map((product) => (
            <Card
              key={product.id}
              className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
              onClick={() => router.push(`/products/${product.id}`)}
            >
              <CardHeader className="p-0">
                <div className="aspect-square bg-gray-100 flex items-center justify-center relative overflow-hidden">
                  <ImageIcon className="h-10 w-10 md:h-12 md:w-12 text-gray-300" />
                  <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2">
                    <Badge variant="secondary" className="text-[10px] md:text-xs px-1.5 py-0.5">
                      {isAdmin ? '上传' : '详情'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-2 md:p-3">
                <h3 className="font-medium text-xs md:text-sm mb-1 md:mb-2 line-clamp-2 min-h-[2rem] md:min-h-[2.5rem]">
                  {product.name}
                </h3>
                <div className="space-y-0.5 md:space-y-1 text-[10px] md:text-sm text-gray-600">
                  {product.brand && (
                    <p className="truncate">
                      <span className="font-medium">品牌:</span> {product.brand}
                    </p>
                  )}
                  {product.price && (
                    <p className="text-sm md:text-lg font-bold text-red-600">¥{product.price}</p>
                  )}
                </div>
                {product.level2_category && (
                  <Badge variant="outline" className="mt-1 md:mt-2 text-[10px] md:text-xs">
                    {product.level2_category}
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
              className="px-3"
            >
              <ChevronLeft className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">上一页</span>
            </Button>
            <div className="flex items-center px-3 md:px-4 text-sm">
              <span className="font-medium text-blue-600">{page}</span>
              <span className="mx-1">/</span>
              <span>{totalPages}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => handlePageChange(page + 1)}
              className="px-3"
            >
              <span className="hidden md:inline">下一页</span>
              <ChevronRight className="h-4 w-4 md:ml-1" />
            </Button>
          </div>
        )}

        {/* 空状态 */}
        {!loading && products.length === 0 && (
          <div className="text-center py-12">
            <ImageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">暂无商品数据</p>
          </div>
        )}
      </main>

      {/* 底部 */}
      <footer className="bg-white border-t mt-8 md:mt-12 py-4 md:py-6">
        <div className="container mx-auto px-4 text-center text-gray-500 text-xs md:text-sm">
          <p>星厨房商品库 · 快捷搜索选品系统</p>
          <p className="mt-1 hidden md:block">多人协作共享 · 图片上传管理</p>
        </div>
      </footer>
    </div>
  );
}
