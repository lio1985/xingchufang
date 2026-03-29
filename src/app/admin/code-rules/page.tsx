'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Settings,
  Building2,
  FolderTree,
  Plus,
  Trash2,
  Edit,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  Play,
  Eye,
} from 'lucide-react';

interface SupplierCode {
  id: number;
  supplier_name: string;
  supplier_code: string;
  description: string | null;
}

interface CategoryCode {
  id: number;
  level1_category: string | null;
  level2_category: string | null;
  category_code: string;
  description: string | null;
}

interface CodeConfig {
  id: number;
  config_key: string;
  config_value: string;
  description: string | null;
}

export default function CodeRulesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('suppliers');
  
  // 数据
  const [suppliers, setSuppliers] = useState<SupplierCode[]>([]);
  const [categories, setCategories] = useState<CategoryCode[]>([]);
  const [config, setConfig] = useState<CodeConfig[]>([]);
  const [missingSupplierCodes, setMissingSupplierCodes] = useState<string[]>([]);
  
  // 筛选
  const [supplierFilter, setSupplierFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // 对话框
  const [showSupplierDialog, setShowSupplierDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierCode | null>(null);
  const [editingCategory, setEditingCategory] = useState<CategoryCode | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  
  // 表单
  const [supplierForm, setSupplierForm] = useState({ name: '', code: '', description: '' });
  const [categoryForm, setCategoryForm] = useState({ level1: '', level2: '', code: '', description: '' });

  // 加载数据
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/code-config?type=all&missing-suppliers=true');
      const data = await res.json();
      
      if (data.success) {
        setSuppliers(data.data.suppliers || []);
        setCategories(data.data.categories || []);
        setConfig(data.data.config || []);
        setMissingSupplierCodes(data.data.missingSupplierCodes || []);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 保存供应商代码
  const handleSaveSupplier = async () => {
    if (!supplierForm.name || !supplierForm.code) {
      alert('供应商名称和代码不能为空');
      return;
    }

    setSaveLoading(true);
    try {
      const res = await fetch('/api/code-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'supplier',
          data: {
            supplierName: supplierForm.name,
            supplierCode: supplierForm.code,
            description: supplierForm.description,
          },
        }),
      });

      const data = await res.json();
      
      if (data.success) {
        setShowSupplierDialog(false);
        setSupplierForm({ name: '', code: '', description: '' });
        setEditingSupplier(null);
        loadData();
      } else {
        alert(data.error || '保存失败');
      }
    } catch (error) {
      alert('保存失败，请重试');
    } finally {
      setSaveLoading(false);
    }
  };

  // 保存分类编码
  const handleSaveCategory = async () => {
    if (!categoryForm.code) {
      alert('分类编码不能为空');
      return;
    }

    setSaveLoading(true);
    try {
      const res = await fetch('/api/code-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'category',
          data: {
            level1Category: categoryForm.level1 || null,
            level2Category: categoryForm.level2 || null,
            categoryCode: categoryForm.code,
            description: categoryForm.description,
          },
        }),
      });

      const data = await res.json();
      
      if (data.success) {
        setShowCategoryDialog(false);
        setCategoryForm({ level1: '', level2: '', code: '', description: '' });
        setEditingCategory(null);
        loadData();
      } else {
        alert(data.error || '保存失败');
      }
    } catch (error) {
      alert('保存失败，请重试');
    } finally {
      setSaveLoading(false);
    }
  };

  // 删除
  const handleDelete = async (type: 'supplier' | 'category', id: number) => {
    if (!confirm('确定要删除吗？')) return;

    try {
      const res = await fetch(`/api/code-config?type=${type}&id=${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      
      if (data.success) {
        loadData();
      } else {
        alert(data.error || '删除失败');
      }
    } catch (error) {
      alert('删除失败，请重试');
    }
  };

  // 打开编辑对话框
  const openEditSupplier = (supplier: SupplierCode) => {
    setEditingSupplier(supplier);
    setSupplierForm({
      name: supplier.supplier_name,
      code: supplier.supplier_code,
      description: supplier.description || '',
    });
    setShowSupplierDialog(true);
  };

  const openEditCategory = (category: CategoryCode) => {
    setEditingCategory(category);
    setCategoryForm({
      level1: category.level1_category || '',
      level2: category.level2_category || '',
      code: category.category_code,
      description: category.description || '',
    });
    setShowCategoryDialog(true);
  };

  // 筛选数据
  const filteredSuppliers = suppliers.filter(s => 
    !supplierFilter || 
    s.supplier_name.toLowerCase().includes(supplierFilter.toLowerCase()) ||
    s.supplier_code.toLowerCase().includes(supplierFilter.toLowerCase())
  );

  const filteredCategories = categories.filter(c => 
    !categoryFilter ||
    (c.level1_category?.toLowerCase().includes(categoryFilter.toLowerCase())) ||
    (c.level2_category?.toLowerCase().includes(categoryFilter.toLowerCase())) ||
    c.category_code.toLowerCase().includes(categoryFilter.toLowerCase())
  );

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
                  <Settings className="h-5 w-5" />
                  编码规则配置
                </h1>
                <p className="text-sm text-gray-500">配置供应商代码和分类编码规则</p>
              </div>
            </div>
            <Button onClick={() => router.push('/admin/code-generate')}>
              <Play className="h-4 w-4 mr-2" />
              一键生成编码
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* 未配置提示 */}
        {missingSupplierCodes.length > 0 && (
          <Card className="mb-4 border-yellow-200 bg-yellow-50">
            <CardContent className="py-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                有 {missingSupplierCodes.length} 个供应商未配置代码：
                {missingSupplierCodes.slice(0, 5).join('、')}
                {missingSupplierCodes.length > 5 && '...'}
              </span>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="suppliers" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              供应商代码 ({suppliers.length})
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <FolderTree className="h-4 w-4" />
              分类编码 ({categories.length})
            </TabsTrigger>
          </TabsList>

          {/* 供应商代码 */}
          <TabsContent value="suppliers">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>供应商代码映射</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingSupplier(null);
                      setSupplierForm({ name: '', code: '', description: '' });
                      setShowSupplierDialog(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    添加
                  </Button>
                </div>
                <Input
                  placeholder="搜索供应商名称或代码..."
                  value={supplierFilter}
                  onChange={(e) => setSupplierFilter(e.target.value)}
                  className="mt-2"
                />
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">供应商名称</th>
                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">代码</th>
                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">说明</th>
                        <th className="text-right py-2 px-3 text-sm font-medium text-gray-500">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSuppliers.map((s) => (
                        <tr key={s.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-3 font-medium">{s.supplier_name}</td>
                          <td className="py-2 px-3">
                            <Badge variant="secondary" className="font-mono">{s.supplier_code}</Badge>
                          </td>
                          <td className="py-2 px-3 text-sm text-gray-500">{s.description || '-'}</td>
                          <td className="py-2 px-3 text-right">
                            <Button variant="ghost" size="sm" onClick={() => openEditSupplier(s)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600"
                              onClick={() => handleDelete('supplier', s.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 分类编码 */}
          <TabsContent value="categories">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>分类编码规则</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingCategory(null);
                      setCategoryForm({ level1: '', level2: '', code: '', description: '' });
                      setShowCategoryDialog(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    添加
                  </Button>
                </div>
                <Input
                  placeholder="搜索分类或编码..."
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="mt-2"
                />
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">一级分类</th>
                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">二级分类</th>
                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">编码</th>
                        <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">说明</th>
                        <th className="text-right py-2 px-3 text-sm font-medium text-gray-500">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCategories.map((c) => (
                        <tr key={c.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-3">{c.level1_category || <span className="text-gray-400">全部</span>}</td>
                          <td className="py-2 px-3">{c.level2_category || <span className="text-gray-400">全部</span>}</td>
                          <td className="py-2 px-3">
                            <Badge variant="secondary" className="font-mono">{c.category_code}</Badge>
                          </td>
                          <td className="py-2 px-3 text-sm text-gray-500">{c.description || '-'}</td>
                          <td className="py-2 px-3 text-right">
                            <Button variant="ghost" size="sm" onClick={() => openEditCategory(c)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600"
                              onClick={() => handleDelete('category', c.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 编码格式说明 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">编码格式说明</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>编码格式：</strong><code className="bg-gray-100 px-2 py-1 rounded">供应商代码-分类编码-序号</code></p>
              <p><strong>示例：</strong><code className="bg-gray-100 px-2 py-1 rounded">YK-7-001</code>（怡康-商用炒炉-第1个）</p>
              <p><strong>序号位数：</strong>{config.find(c => c.config_key === 'sequence_length')?.config_value || 3} 位，不足补{(config.find(c => c.config_key === 'sequence_pad')?.config_value || '0')}</p>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* 供应商代码对话框 */}
      <Dialog open={showSupplierDialog} onOpenChange={setShowSupplierDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSupplier ? '编辑' : '添加'}供应商代码</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">供应商名称 *</label>
              <Input
                value={supplierForm.name}
                onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                placeholder="输入供应商名称"
                disabled={!!editingSupplier}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">代码 *</label>
              <Input
                value={supplierForm.code}
                onChange={(e) => setSupplierForm({ ...supplierForm, code: e.target.value.toUpperCase() })}
                placeholder="如：YK、SC"
                maxLength={10}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">说明</label>
              <Input
                value={supplierForm.description}
                onChange={(e) => setSupplierForm({ ...supplierForm, description: e.target.value })}
                placeholder="可选"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSupplierDialog(false)}>取消</Button>
            <Button onClick={handleSaveSupplier} disabled={saveLoading}>
              {saveLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 分类编码对话框 */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCategory ? '编辑' : '添加'}分类编码</DialogTitle>
            <DialogDescription>
              分类可以精确到二级分类，也可以只设置一级分类（适用于该一级分类下所有商品）
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">一级分类</label>
              <Input
                value={categoryForm.level1}
                onChange={(e) => setCategoryForm({ ...categoryForm, level1: e.target.value })}
                placeholder="如：烹饪加热设备"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">二级分类</label>
              <Input
                value={categoryForm.level2}
                onChange={(e) => setCategoryForm({ ...categoryForm, level2: e.target.value })}
                placeholder="如：商用炒炉/工程灶"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">编码 *</label>
              <Input
                value={categoryForm.code}
                onChange={(e) => setCategoryForm({ ...categoryForm, code: e.target.value })}
                placeholder="如：7、1.1"
                maxLength={20}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">说明</label>
              <Input
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                placeholder="可选"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>取消</Button>
            <Button onClick={handleSaveCategory} disabled={saveLoading}>
              {saveLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
