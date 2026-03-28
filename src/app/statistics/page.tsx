'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, TrendingUp, Package, Image as ImageIcon, DollarSign } from 'lucide-react';

interface Statistics {
  totalProducts: number;
  totalImages: number;
  productsWithImages: number;
  topSuppliers: Array<{ name: string; count: number }>;
  categoryStats: Array<{ name: string; count: number }>;
  subCategoryStats: Array<{ name: string; count: number }>;
  priceStats: {
    min: number;
    max: number;
    avg: number;
    ranges: Array<{ label: string; min: number; max: number; count: number }>;
  };
}

export default function StatisticsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/statistics')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.data);
        }
      })
      .catch((error) => console.error('获取统计数据失败:', error))
      .finally(() => setLoading(false));
  }, []);

  const maxCount = stats?.topSuppliers[0]?.count || 1;

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
          <h1 className="text-3xl font-bold">数据统计</h1>
          <p className="text-blue-100 mt-1">商品数据分析与可视化</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">加载中...</p>
          </div>
        ) : stats ? (
          <div className="space-y-6">
            {/* 概览卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">商品总数</p>
                      <p className="text-3xl font-bold">{stats.totalProducts}</p>
                    </div>
                    <Package className="h-12 w-12 text-blue-100" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">图片总数</p>
                      <p className="text-3xl font-bold">{stats.totalImages}</p>
                    </div>
                    <ImageIcon className="h-12 w-12 text-green-100" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">平均价格</p>
                      <p className="text-3xl font-bold">¥{stats.priceStats.avg}</p>
                    </div>
                    <DollarSign className="h-12 w-12 text-yellow-100" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">供应商数量</p>
                      <p className="text-3xl font-bold">{stats.topSuppliers.length}</p>
                    </div>
                    <TrendingUp className="h-12 w-12 text-purple-100" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 供应商统计 */}
              <Card>
                <CardHeader>
                  <CardTitle>供应商 Top 10</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.topSuppliers.map((supplier, index) => (
                      <div key={supplier.name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">
                            {index + 1}. {supplier.name}
                          </span>
                          <span className="text-sm text-gray-500">{supplier.count} 个商品</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(supplier.count / maxCount) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 一级分类统计 */}
              <Card>
                <CardHeader>
                  <CardTitle>一级分类分布</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.categoryStats.map((category) => (
                      <div key={category.name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{category.name}</span>
                          <span className="text-sm text-gray-500">{category.count} 个商品</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${(category.count / stats.totalProducts) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 二级分类统计 */}
              <Card>
                <CardHeader>
                  <CardTitle>二级分类 Top 10</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.subCategoryStats.map((category) => (
                      <div key={category.name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{category.name}</span>
                          <span className="text-sm text-gray-500">{category.count} 个商品</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${(category.count / stats.subCategoryStats[0].count) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 价格分布 */}
              <Card>
                <CardHeader>
                  <CardTitle>价格分布</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm text-gray-500">最低价</p>
                        <p className="text-lg font-bold">¥{stats.priceStats.min}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">最高价</p>
                        <p className="text-lg font-bold">¥{stats.priceStats.max}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">平均价</p>
                        <p className="text-lg font-bold">¥{stats.priceStats.avg}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {stats.priceStats.ranges.map((range) => (
                      <div key={range.label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">¥{range.label}</span>
                          <span className="text-sm text-gray-500">{range.count} 个商品</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-600 h-2 rounded-full"
                            style={{
                              width: `${(range.count / Math.max(...stats.priceStats.ranges.map((r) => r.count))) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">暂无数据</p>
          </div>
        )}
      </main>
    </div>
  );
}
