'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Play,
  Eye,
  Loader2,
  CheckCircle,
  AlertCircle,
  XCircle,
  Image as ImageIcon,
} from 'lucide-react';

interface ProductPreview {
  id: number;
  name: string;
  supplier: string | null;
  level1_category: string | null;
  level2_category: string | null;
  current_code: string | null;
  new_code: string | null;
  status: 'ok' | 'missing_supplier_code' | 'missing_category_code' | 'no_change';
  message?: string;
}

interface PreviewStats {
  total: number;
  ok: number;
  noChange: number;
  missingSupplier: number;
  missingCategory: number;
}

interface FilterOptions {
  suppliers: string[];
  level1Categories: string[];
  level2Categories: string[];
}

export default function CodeGeneratePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState<ProductPreview[]>([]);
  const [stats, setStats] = useState<PreviewStats | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    suppliers: [],
    level1Categories: [],
    level2Categories: [],
  });
  
  // 筛选条件
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [selectedLevel1, setSelectedLevel1] = useState<string>('');
  const [selectedLevel2, setSelectedLevel2] = useState<string>('');
  
  // 选中的商品
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  
  // 执行状态
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<{ updated: number; skipped: number; message: string } | null>(null);

  // 加载筛选选项
  useEffect(() => {
    fetch('/api/filter-options')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setFilterOptions(data.data);
        }
      });
  }, []);

  // 生成预览
  const generatePreview = async () => {
    setLoading(true);
    setResult(null);
    setSelectedIds(new Set());
    
    try {
      const params = new URLSearchParams();
      if (selectedSupplier) params.append('supplier', selectedSupplier);
      if (selectedLevel1) params.append('level1Category', selectedLevel1);
      if (selectedLevel2) params.append('level2Category', selectedLevel2);
      params.append('limit', '500');
      
      const res = await fetch(`/api/generate-codes?${params}`);
      const data = await res.json();
      
      if (data.success) {
        setPreviews(data.data.previews);
        setStats(data.data.stats);
      } else {
        alert(data.error || '生成预览失败');
      }
    } catch (error) {
      alert('生成预览失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 切换选中
  const toggleSelect = (id: number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  // 全选可更新的商品
  const selectAllValid = () => {
    const validIds = previews
      .filter(p => p.status === 'ok')
      .map(p => p.id);
    setSelectedIds(new Set(validIds));
  };

  // 执行编码生成
  const executeGenerate = async () => {
    if (selectedIds.size === 0) {
      alert('请先选择要生成编码的商品');
      return;
    }

    if (!confirm(`确定要为 ${selectedIds.size} 个商品生成编码吗？`)) {
      return;
    }

    setExecuting(true);
    try {
      const res = await fetch('/api/generate-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productIds: Array.from(selectedIds),
          supplier: selectedSupplier,
          level1Category: selectedLevel1,
          level2Category: selectedLevel2,
        }),
      });

      const data = await res.json();
      
      if (data.success) {
        setResult({
          updated: data.data.updated,
          skipped: data.data.skipped,
          message: data.message,
        });
        // 重新生成预览
        generatePreview();
      } else {
        alert(data.error || '生成编码失败');
      }
    } catch (error) {
      alert('生成编码失败，请重试');
    } finally {
      setExecuting(false);
    }
  };

  // 状态图标
  const StatusIcon = ({ status }: { status: ProductPreview['status'] }) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'no_change':
        return <CheckCircle className="h-4 w-4 text-gray-400" />;
      case 'missing_supplier_code':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'missing_category_code':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.push('/admin/code-rules')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                返回
              </Button>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  一键生成编码
                </h1>
                <p className="text-sm text-gray-500">根据配置规则批量生成商品编码</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push('/admin/code-rules')}>
                配置规则
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* 筛选条件 */}
        <Card className="mb-4">
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="space-y-1">
                <label className="text-xs text-gray-500">供应商</label>
                <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="全部供应商" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">全部供应商</SelectItem>
                    {filterOptions.suppliers.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs text-gray-500">一级分类</label>
                <Select value={selectedLevel1} onValueChange={setSelectedLevel1}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="全部分类" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">全部分类</SelectItem>
                    {filterOptions.level1Categories.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs text-gray-500">二级分类</label>
                <Select value={selectedLevel2} onValueChange={setSelectedLevel2}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="全部分类" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">全部分类</SelectItem>
                    {filterOptions.level2Categories.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={generatePreview} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Eye className="h-4 w-4 mr-2" />
                )}
                预览
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 执行结果 */}
        {result && (
          <Card className="mb-4 border-green-200 bg-green-50">
            <CardContent className="py-3 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800">{result.message}</span>
            </CardContent>
          </Card>
        )}

        {/* 统计信息 */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            <Card>
              <CardContent className="py-3 text-center">
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-gray-500">总计</p>
              </CardContent>
            </Card>
            <Card className="border-green-200">
              <CardContent className="py-3 text-center">
                <p className="text-2xl font-bold text-green-600">{stats.ok}</p>
                <p className="text-xs text-gray-500">可更新</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-3 text-center">
                <p className="text-2xl font-bold text-gray-400">{stats.noChange}</p>
                <p className="text-xs text-gray-500">无需更新</p>
              </CardContent>
            </Card>
            <Card className="border-yellow-200">
              <CardContent className="py-3 text-center">
                <p className="text-2xl font-bold text-yellow-600">{stats.missingSupplier}</p>
                <p className="text-xs text-gray-500">缺供应商代码</p>
              </CardContent>
            </Card>
            <Card className="border-orange-200">
              <CardContent className="py-3 text-center">
                <p className="text-2xl font-bold text-orange-600">{stats.missingCategory}</p>
                <p className="text-xs text-gray-500">缺分类编码</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 操作栏 */}
        {previews.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={selectAllValid}>
                全选可更新 ({stats?.ok || 0})
              </Button>
              <span className="text-sm text-gray-500">
                已选择 {selectedIds.size} 个商品
              </span>
            </div>
            <Button 
              onClick={executeGenerate} 
              disabled={selectedIds.size === 0 || executing}
            >
              {executing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              生成编码
            </Button>
          </div>
        )}

        {/* 预览列表 */}
        {previews.length > 0 && (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="w-10 py-3 px-3">
                        <Checkbox
                          checked={selectedIds.size === previews.filter(p => p.status === 'ok').length && selectedIds.size > 0}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              selectAllValid();
                            } else {
                              setSelectedIds(new Set());
                            }
                          }}
                        />
                      </th>
                      <th className="text-left py-3 px-3 text-sm font-medium text-gray-500">状态</th>
                      <th className="text-left py-3 px-3 text-sm font-medium text-gray-500">商品名称</th>
                      <th className="text-left py-3 px-3 text-sm font-medium text-gray-500">供应商</th>
                      <th className="text-left py-3 px-3 text-sm font-medium text-gray-500">分类</th>
                      <th className="text-left py-3 px-3 text-sm font-medium text-gray-500">当前编码</th>
                      <th className="text-left py-3 px-3 text-sm font-medium text-gray-500">新编码</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previews.map((p) => (
                      <tr 
                        key={p.id} 
                        className={`border-b hover:bg-gray-50 ${p.status === 'ok' ? 'cursor-pointer' : 'opacity-60'}`}
                        onClick={() => p.status === 'ok' && toggleSelect(p.id)}
                      >
                        <td className="py-2 px-3">
                          {p.status === 'ok' && (
                            <Checkbox
                              checked={selectedIds.has(p.id)}
                              onCheckedChange={() => toggleSelect(p.id)}
                            />
                          )}
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-1">
                            <StatusIcon status={p.status} />
                            {p.status === 'ok' && <span className="text-xs text-green-600">可更新</span>}
                            {p.status === 'no_change' && <span className="text-xs text-gray-400">无变化</span>}
                            {p.status === 'missing_supplier_code' && <span className="text-xs text-yellow-600">缺代码</span>}
                            {p.status === 'missing_category_code' && <span className="text-xs text-orange-600">缺编码</span>}
                          </div>
                        </td>
                        <td className="py-2 px-3 max-w-[200px] truncate font-medium">{p.name}</td>
                        <td className="py-2 px-3 text-sm">{p.supplier || '-'}</td>
                        <td className="py-2 px-3 text-sm">
                          <div className="max-w-[150px]">
                            <p className="truncate">{p.level1_category}</p>
                            {p.level2_category && (
                              <p className="text-xs text-gray-400 truncate">{p.level2_category}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          {p.current_code ? (
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">{p.current_code}</code>
                          ) : (
                            <span className="text-gray-400 text-sm">无</span>
                          )}
                        </td>
                        <td className="py-2 px-3">
                          {p.new_code ? (
                            <code className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">{p.new_code}</code>
                          ) : (
                            <span className="text-gray-400 text-sm">{p.message || '-'}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 空状态 */}
        {!loading && previews.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Play className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">选择筛选条件后点击"预览"按钮</p>
              <p className="text-sm text-gray-400 mt-1">查看商品编码生成预览</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
