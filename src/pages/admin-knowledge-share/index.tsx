import Taro, { useLoad } from '@tarojs/taro';
import { useState } from 'react';
import { View, Text, Image, Input } from '@tarojs/components';
import { Search, Funnel, Trash, FileText, Heart, Eye, Star, Calendar, Image as ImageIcon, File, Download, TrendingUp } from 'lucide-react-taro';
import { Network } from '@/network';

interface KnowledgeShareItem {
  id: string;
  title: string;
  author: {
    id: string;
    nickname: string;
    avatar: string;
  };
  category: string;
  tags: string[];
  viewCount: number;
  likeCount: number;
  createdAt: string;
  isPublished: boolean;
  isFeatured: boolean;
  attachmentCount: number;
}

export default function AdminKnowledgeSharePage() {
  const [activeTab, setActiveTab] = useState<'manage' | 'stats'>('manage');
  const [loading, setLoading] = useState(false);

  // 管理页面状态
  const [items, setItems] = useState<KnowledgeShareItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [keyword, setKeyword] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    approvalStatus: '',
    authorId: '',
    startDate: '',
    endDate: '',
    attachmentType: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // 统计页面状态
  const [summary, setSummary] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [trend, setTrend] = useState<any>(null);
  const [topItems, setTopItems] = useState<any>(null);
  const [topAuthors, setTopAuthors] = useState<any>(null);
  const [trendDays, setTrendDays] = useState(7);
  const [timeAnalysisDays, setTimeAnalysisDays] = useState(30);
  const [timeAnalysis, setTimeAnalysis] = useState<any>(null);

  useLoad(() => {
    loadData();
  });

  const loadData = async () => {
    if (activeTab === 'manage') {
      await loadList(1);
    } else {
      await loadStats();
    }
  };

  // 加载列表数据
  const loadList = async (pageNum: number = page) => {
    try {
      setLoading(true);
      const params: any = {
        page: pageNum,
        pageSize
      };

      if (keyword) params.keyword = keyword;
      if (filters.category) params.category = filters.category;
      if (filters.status) params.status = filters.status;
      if (filters.approvalStatus) params.approvalStatus = filters.approvalStatus;
      if (filters.authorId) params.authorId = filters.authorId;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.attachmentType) params.attachmentType = filters.attachmentType;
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.sortOrder) params.sortOrder = filters.sortOrder;

      const res = await Network.request({
        url: '/api/admin/knowledge-shares',
        data: params
      });

      if (res.data?.code === 200) {
        const { items: listItems, total: totalCount, page: currentPage } = res.data.data;
        setItems(pageNum === 1 ? listItems : [...items, ...listItems]);
        setTotal(totalCount);
        setPage(currentPage);
      }
    } catch (error) {
      console.error('加载失败', error);
      Taro.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      setLoading(false);
    }
  };

  // 加载统计数据
  const loadStats = async () => {
    try {
      setLoading(true);
      const [summaryRes, statsRes, trendRes, topRes, authorsRes, timeAnalysisRes] = await Promise.all([
        Network.request({ url: '/api/admin/knowledge-shares/summary' }),
        Network.request({ url: '/api/admin/knowledge-shares/stats' }),
        Network.request({ url: `/api/admin/knowledge-shares/trend?days=${trendDays}` }),
        Network.request({ url: '/api/admin/knowledge-shares/top?type=view&limit=10' }),
        Network.request({ url: '/api/admin/knowledge-shares/authors/top?limit=10' }),
        Network.request({ url: `/api/admin/knowledge-shares/time-analysis?days=${timeAnalysisDays}` })
      ]);

      if (summaryRes.data?.code === 200) {
        setSummary(summaryRes.data.data);
      }
      if (statsRes.data?.code === 200) {
        setStats(statsRes.data.data);
      }
      if (trendRes.data?.code === 200) {
        setTrend(trendRes.data.data);
      }
      if (topRes.data?.code === 200) {
        setTopItems(topRes.data.data);
      }
      if (authorsRes.data?.code === 200) {
        setTopAuthors(authorsRes.data.data);
      }
      if (timeAnalysisRes.data?.code === 200) {
        setTimeAnalysis(timeAnalysisRes.data.data);
      }
    } catch (error) {
      console.error('加载统计失败', error);
      Taro.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      setLoading(false);
    }
  };

  // 删除项目
  const handleDelete = async (id: string) => {
    const { confirm } = await Taro.showModal({
      title: '确认删除',
      content: '确定要删除这条知识分享吗？'
    });

    if (!confirm) return;

    try {
      const res = await Network.request({
        url: `/api/admin/knowledge-shares/${id}`,
        method: 'DELETE'
      });

      if (res.data?.code === 200) {
        Taro.showToast({
          title: '删除成功',
          icon: 'success'
        });
        loadList(1);
      }
    } catch (error) {
      console.error('删除失败', error);
      Taro.showToast({
        title: '删除失败',
        icon: 'none'
      });
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedItems.size === 0) {
      Taro.showToast({
        title: '请先选择要删除的项目',
        icon: 'none'
      });
      return;
    }

    const { confirm } = await Taro.showModal({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedItems.size} 条知识分享吗？`
    });

    if (!confirm) return;

    try {
      const res = await Network.request({
        url: '/api/admin/knowledge-shares/batch-delete',
        method: 'POST',
        data: { ids: Array.from(selectedItems) }
      });

      if (res.data?.code === 200) {
        Taro.showToast({
          title: '删除成功',
          icon: 'success'
        });
        setSelectedItems(new Set());
        loadList(1);
      }
    } catch (error) {
      console.error('删除失败', error);
      Taro.showToast({
        title: '删除失败',
        icon: 'none'
      });
    }
  };

  // 批量导出
  const handleBatchExport = async () => {
    if (selectedItems.size === 0) {
      Taro.showToast({
        title: '请先选择要导出的项目',
        icon: 'none'
      });
      return;
    }

    try {
      Taro.showLoading({ title: '导出中...', mask: true });

      const res = await Network.request({
        url: '/api/admin/knowledge-shares/export',
        method: 'POST',
        data: { ids: Array.from(selectedItems) }
      });

      if (res.data?.code === 200) {
        const { filename, content } = res.data.data;

        // 创建并下载文件
        if (Taro.getEnv() === Taro.ENV_TYPE.WEAPP) {
          // 小程序端：需要使用文件系统API
          const fs = Taro.getFileSystemManager();
          const filePath = `${Taro.env.USER_DATA_PATH}/${filename}`;
          fs.writeFileSync(filePath, content, 'utf-8');

          Taro.openDocument({
            filePath,
            showMenu: true
          });
        } else {
          // H5端：创建Blob并下载
          const blob = new Blob([content], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          link.click();
          URL.revokeObjectURL(url);
        }

        Taro.hideLoading();
        Taro.showToast({
          title: '导出成功',
          icon: 'success'
        });
      } else {
        Taro.hideLoading();
        Taro.showToast({
          title: '导出失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('导出失败', error);
      Taro.hideLoading();
      Taro.showToast({
        title: '导出失败',
        icon: 'none'
      });
    }
  };

  // 导出统计报告
  const handleExportReport = async () => {
    try {
      Taro.showLoading({ title: '生成中...', mask: true });

      const res = await Network.request({
        url: '/api/admin/knowledge-shares/export-report',
        method: 'POST'
      });

      if (res.data?.code === 200) {
        const { filename, content } = res.data.data;

        if (Taro.getEnv() === Taro.ENV_TYPE.WEAPP) {
          const fs = Taro.getFileSystemManager();
          const filePath = `${Taro.env.USER_DATA_PATH}/${filename}`;
          fs.writeFileSync(filePath, content, 'utf-8');

          Taro.openDocument({
            filePath,
            showMenu: true
          });
        } else {
          const blob = new Blob([content], { type: 'text/markdown' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          link.click();
          URL.revokeObjectURL(url);
        }

        Taro.hideLoading();
        Taro.showToast({
          title: '导出成功',
          icon: 'success'
        });
      } else {
        Taro.hideLoading();
        Taro.showToast({
          title: '导出失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('导出失败', error);
      Taro.hideLoading();
      Taro.showToast({
        title: '导出失败',
        icon: 'none'
      });
    }
  };

  // 置顶/取消置顶
  const handleFeature = async (id: string, isFeatured: boolean) => {
    try {
      const res = await Network.request({
        url: `/api/admin/knowledge-shares/${id}/feature`,
        method: 'POST',
        data: { isFeatured: !isFeatured }
      });

      if (res.data?.code === 200) {
        Taro.showToast({
          title: '操作成功',
          icon: 'success'
        });
        loadList(page);
      }
    } catch (error) {
      console.error('操作失败', error);
      Taro.showToast({
        title: '操作失败',
        icon: 'none'
      });
    }
  };

  // 切换选择
  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  // 搜索
  const handleSearch = () => {
    loadList(1);
  };

  // 跳转到详情页
  const handleViewDetail = (id: string) => {
    Taro.navigateTo({
      url: `/pages/knowledge-share/detail?id=${id}&isAdmin=true`
    });
  };

  return (
    <View className="min-h-screen bg-sky-50">
      {/* 顶部导航 */}
      <View className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <View className="flex flex-row">
          <View
            className={`flex-1 py-4 text-center cursor-pointer ${activeTab === 'manage' ? 'text-sky-600 border-b-2 border-blue-400' : 'text-gray-400'}`}
            onClick={() => setActiveTab('manage')}
          >
            <Text className="block font-semibold">知识分享管理</Text>
          </View>
          <View
            className={`flex-1 py-4 text-center cursor-pointer ${activeTab === 'stats' ? 'text-sky-600 border-b-2 border-blue-400' : 'text-gray-400'}`}
            onClick={() => setActiveTab('stats')}
          >
            <Text className="block font-semibold">统计分析</Text>
          </View>
        </View>
      </View>

      {activeTab === 'manage' ? (
        <>
          {/* 搜索和筛选栏 */}
          <View className="p-4 bg-white">
            <View style={{ display: 'flex', flexDirection: 'row', gap: '8px', marginBottom: '12px' }}>
              <View style={{ flex: 1 }}>
                <View className="bg-white rounded-xl px-4 py-3">
                  <Input
                    className="w-full bg-transparent text-white"
                    placeholder="搜索标题或内容..."
                    value={keyword}
                    onInput={(e) => setKeyword(e.detail.value)}
                    onConfirm={handleSearch}
                    placeholderClass="text-gray-400"
                  />
                </View>
              </View>
              <View style={{ flexShrink: 0 }} onClick={handleSearch}>
                <View className="bg-blue-500 px-6 py-3 rounded-xl flex items-center justify-center">
                  <Search color="#ffffff" size={20} />
                </View>
              </View>
            </View>

            {/* 第一行筛选 */}
            <View style={{ display: 'flex', flexDirection: 'row', gap: '8px', marginBottom: '8px' }}>
              <View style={{ flex: 1 }} onClick={() => Taro.showActionSheet({
                itemList: ['全部', '技术', '生活', '工作', '其他'],
                success: (res) => {
                  const categories = ['', '技术', '生活', '工作', '其他'];
                  setFilters({ ...filters, category: categories[res.tapIndex] });
                  loadList(1);
                }
              })}
              >
                <View className="bg-white px-4 py-3 rounded-xl flex items-center justify-center">
                  <Funnel color="#94a3b8" size={16} />
                  <Text className="text-gray-300 ml-2">{filters.category || '分类'}</Text>
                </View>
              </View>
              <View style={{ flex: 1 }} onClick={() => Taro.showActionSheet({
                itemList: ['全部', '已发布', '草稿'],
                success: (res) => {
                  const statuses = ['', 'published', 'draft'];
                  setFilters({ ...filters, status: statuses[res.tapIndex] });
                  loadList(1);
                }
              })}
              >
                <View className="bg-white px-4 py-3 rounded-xl flex items-center justify-center">
                  <FileText color="#94a3b8" size={16} />
                  <Text className="text-gray-300 ml-2">{filters.status === 'published' ? '已发布' : filters.status === 'draft' ? '草稿' : '状态'}</Text>
                </View>
              </View>
            </View>

            {/* 第二行筛选 */}
            <View style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
              <View style={{ flex: 1 }} onClick={() => Taro.showActionSheet({
                itemList: ['今天', '本周', '本月', '全部时间'],
                success: (res) => {
                  const now = new Date();
                  let startDate = '';
                  if (res.tapIndex === 0) {
                    startDate = now.toISOString().split('T')[0];
                  } else if (res.tapIndex === 1) {
                    const weekStart = new Date(now);
                    weekStart.setDate(now.getDate() - now.getDay());
                    startDate = weekStart.toISOString().split('T')[0];
                  } else if (res.tapIndex === 2) {
                    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                    startDate = monthStart.toISOString().split('T')[0];
                  }
                  setFilters({ ...filters, startDate, endDate: '' });
                  loadList(1);
                }
              })}
              >
                <View className="bg-white px-4 py-3 rounded-xl flex items-center justify-center">
                  <Calendar color="#94a3b8" size={16} />
                  <Text className="text-gray-300 ml-2">{filters.startDate ? '时间范围' : '全部时间'}</Text>
                </View>
              </View>
              <View style={{ flex: 1 }} onClick={() => Taro.showActionSheet({
                itemList: ['全部', '有图片', '有文件', '有录音', '无附件'],
                success: (res) => {
                  const attachmentTypes = ['', 'image', 'file', 'audio', 'none'];
                  setFilters({ ...filters, attachmentType: attachmentTypes[res.tapIndex] });
                  loadList(1);
                }
              })}
              >
                <View className="bg-white px-4 py-3 rounded-xl flex items-center justify-center">
                  <File color="#94a3b8" size={16} />
                  <Text className="text-gray-300 ml-2">
                    {filters.attachmentType === 'image' ? '有图片' :
                     filters.attachmentType === 'file' ? '有文件' :
                     filters.attachmentType === 'audio' ? '有录音' :
                     filters.attachmentType === 'none' ? '无附件' : '附件类型'}
                  </Text>
                </View>
              </View>
              {selectedItems.size > 0 && (
                <View style={{ flexShrink: 0 }} onClick={handleBatchDelete}>
                  <View className="bg-red-500 px-4 py-3 rounded-xl flex items-center justify-center">
                    <Trash color="#ffffff" size={16} />
                    <Text className="text-white ml-2">删除({selectedItems.size})</Text>
                  </View>
                </View>
              )}
              {selectedItems.size > 0 && (
                <View style={{ flexShrink: 0 }} onClick={handleBatchExport}>
                  <View className="bg-green-500 px-4 py-3 rounded-xl flex items-center justify-center">
                    <Download color="#ffffff" size={16} />
                    <Text className="text-white ml-2">导出({selectedItems.size})</Text>
                  </View>
                </View>
              )}
            </View>

            {/* 排序选项 */}
            <View style={{ display: 'flex', flexDirection: 'row', gap: '8px', marginTop: '8px' }}>
              <View style={{ flex: 1 }} onClick={() => Taro.showActionSheet({
                itemList: ['创建时间', '浏览量', '点赞数'],
                success: (res) => {
                  const sortOptions = ['createdAt', 'viewCount', 'likeCount'];
                  setFilters({ ...filters, sortBy: sortOptions[res.tapIndex] });
                  loadList(1);
                }
              })}
              >
                <View className="bg-white px-4 py-3 rounded-xl flex items-center justify-center">
                  <Text className="text-gray-300 text-sm">
                    {filters.sortBy === 'createdAt' ? '按创建时间' :
                     filters.sortBy === 'viewCount' ? '按浏览量' :
                     filters.sortBy === 'likeCount' ? '按点赞数' : '排序'}
                  </Text>
                  <Text className="text-gray-500 text-xs ml-2">
                    {filters.sortOrder === 'desc' ? '↓' : '↑'}
                  </Text>
                </View>
              </View>
              <View style={{ flexShrink: 0 }} onClick={() => {
                const newOrder = filters.sortOrder === 'desc' ? 'asc' : 'desc';
                setFilters({ ...filters, sortOrder: newOrder });
                loadList(1);
              }}
              >
                <View className="bg-white px-4 py-3 rounded-xl flex items-center justify-center">
                  <Text className="text-gray-300 text-sm">切换排序</Text>
                </View>
              </View>
            </View>
          </View>

          {/* 列表 */}
          <View className="px-4 pb-4">
            <View className="mb-2 flex items-center justify-between">
              <Text className="text-gray-400 text-sm">共 {total} 条</Text>
              <View className="flex items-center gap-2">
                {Object.keys(filters).filter(key => filters[key]).length > 0 && (
                  <Text onClick={() => {
                    setFilters({
                      category: '',
                      status: '',
                      approvalStatus: '',
                      authorId: '',
                      startDate: '',
                      endDate: '',
                      attachmentType: '',
                      sortBy: 'createdAt',
                      sortOrder: 'desc'
                    });
                    loadList(1);
                  }} className="text-sky-600 text-sm"
                  >
                    清空筛选
                  </Text>
                )}
              </View>
            </View>

            {loading && items.length === 0 ? (
              <View className="flex items-center justify-center py-12">
                <Text className="text-gray-400">加载中...</Text>
              </View>
            ) : items.length === 0 ? (
              <View className="flex items-center justify-center py-12">
                <Text className="text-gray-400">暂无数据</Text>
              </View>
            ) : (
              items.map((item) => (
                <View key={item.id} className="bg-white rounded-xl p-4 mb-3 border border-slate-200" onClick={() => handleViewDetail(item.id)}>
                  <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start' }}>
                    <View style={{ marginTop: '4px' }} onClick={(e) => { e.stopPropagation(); toggleSelect(item.id); }}>
                      <View className={`w-5 h-5 rounded border-2 ${selectedItems.has(item.id) ? 'bg-blue-500 border-blue-500' : 'border-gray-600'}`} />
                    </View>
                    <View style={{ flex: 1, marginLeft: '12px' }}>
                      <View className="flex items-center gap-2 mb-2">
                        {item.isFeatured && <Star color="#fbbf24" size={14} />}
                        <Text className="text-white font-semibold text-base flex-1">{item.title}</Text>
                        <View className="flex items-center gap-1">
                          {item.isFeatured ? (
                            <View onClick={(e) => { e.stopPropagation(); handleFeature(item.id, true); }}>
                              <Star color="#fbbf24" size={18} />
                            </View>
                          ) : (
                            <View onClick={(e) => { e.stopPropagation(); handleFeature(item.id, false); }}>
                              <Star color="#6b7280" size={18} />
                            </View>
                          )}
                          <View onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} style={{ marginLeft: '8px' }}>
                            <Trash color="#ef4444" size={18} />
                          </View>
                        </View>
                      </View>

                      <View className="flex items-center gap-2 mb-2">
                        <Image
                          src={item.author.avatar || ''}
                          className="w-5 h-5 rounded-full"
                          mode="aspectFill"
                        />
                        <Text className="text-gray-400 text-sm">{item.author.nickname}</Text>
                        <Text className="text-gray-500 text-xs">•</Text>
                        <Text className="text-gray-400 text-xs">{item.category}</Text>
                        {item.tags.length > 0 && (
                          <>
                            <Text className="text-gray-500 text-xs">•</Text>
                            <Text className="text-sky-600 text-xs">{item.tags[0]}</Text>
                          </>
                        )}
                      </View>

                      <View className="flex items-center gap-4 mb-2">
                        <View className="flex items-center gap-1">
                          <Eye color="#6b7280" size={14} />
                          <Text className="text-gray-400 text-xs">{item.viewCount}</Text>
                        </View>
                        <View className="flex items-center gap-1">
                          <Heart color="#6b7280" size={14} />
                          <Text className="text-gray-400 text-xs">{item.likeCount}</Text>
                        </View>
                        {item.attachmentCount > 0 && (
                          <View className="flex items-center gap-1">
                            <File color="#6b7280" size={14} />
                            <Text className="text-gray-400 text-xs">{item.attachmentCount}个附件</Text>
                          </View>
                        )}
                      </View>

                      <Text className="text-gray-500 text-xs">{new Date(item.createdAt).toLocaleString('zh-CN')}</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </>
      ) : (
        <>
          {/* 统计数据 */}
          <View className="p-4">
            <View className="flex items-center justify-between mb-4">
              <Text className="block text-white font-semibold text-lg">统计分析</Text>
              <View onClick={handleExportReport} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Download color="#60a5fa" size={16} />
                <Text className="text-sky-600 text-sm">导出报告</Text>
              </View>
            </View>

            <Text className="block text-white font-semibold text-lg mb-4">核心指标</Text>
            {summary ? (
              <View className="grid grid-cols-2 gap-3 mb-6">
                <View className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4">
                  <Text className="text-white/80 text-sm mb-1">总知识分享数</Text>
                  <Text className="text-white font-bold text-2xl">{summary.totalCount}</Text>
                </View>
                <View className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4">
                  <Text className="text-white/80 text-sm mb-1">已发布</Text>
                  <Text className="text-white font-bold text-2xl">{summary.publishedCount}</Text>
                </View>
                <View className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4">
                  <Text className="text-white/80 text-sm mb-1">总浏览量</Text>
                  <Text className="text-white font-bold text-2xl">{summary.totalViewCount}</Text>
                </View>
                <View className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-4">
                  <Text className="text-white/80 text-sm mb-1">总点赞数</Text>
                  <Text className="text-white font-bold text-2xl">{summary.totalLikeCount}</Text>
                </View>
              </View>
            ) : null}

            {/* 趋势数据 */}
            <View className="flex items-center justify-between mb-4">
              <Text className="block text-white font-semibold text-lg">趋势分析</Text>
              <View onClick={() => Taro.showActionSheet({
                itemList: ['最近7天', '最近15天', '最近30天'],
                success: (res) => {
                  const days = [7, 15, 30][res.tapIndex];
                  setTrendDays(days);
                  loadStats();
                }
              })}
              >
                <Text className="text-sky-600 text-sm">
                  {trendDays === 7 ? '最近7天' : trendDays === 15 ? '最近15天' : '最近30天'} ▼
                </Text>
              </View>
            </View>
            {trend?.daily && (
              <View className="bg-white rounded-xl p-4 mb-6">
                <View className="flex items-center justify-between mb-4">
                  <Text className="text-gray-400 text-sm">新增知识分享数</Text>
                  <Text className="text-sky-600 font-semibold">总计 {trend.total}</Text>
                </View>
                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', height: '120px' }}>
                  {trend.daily.map((day: any, index: number) => {
                    const maxValue = Math.max(...trend.daily.map((d: any) => d.count));
                    const height = maxValue > 0 ? (day.count / maxValue) * 100 : 0;
                    return (
                      <View key={index} className="flex flex-col items-center justify-end flex-1" style={{ marginRight: index < trend.daily.length - 1 ? '4px' : '0' }}>
                        <View
                          className="bg-blue-500 rounded-t-sm transition-all"
                          style={{
                            width: '100%',
                            minHeight: day.count > 0 ? '4px' : '0',
                            height: `${height}%`,
                            opacity: day.count > 0 ? 1 : 0.3
                          }}
                        />
                        <Text className="text-gray-500 text-xs mt-2">{day.date.slice(5)}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* 时间分析 */}
            <View className="flex items-center justify-between mb-4">
              <View className="flex items-center gap-2">
                <TrendingUp color="#60a5fa" size={20} />
                <Text className="block text-white font-semibold text-lg">时间分析</Text>
              </View>
              <View onClick={() => Taro.showActionSheet({
                itemList: ['最近30天', '最近60天', '最近90天'],
                success: (res) => {
                  const days = [30, 60, 90][res.tapIndex];
                  setTimeAnalysisDays(days);
                  loadStats();
                }
              })}
              >
                <Text className="text-sky-600 text-sm">
                  {timeAnalysisDays === 30 ? '最近30天' : timeAnalysisDays === 60 ? '最近60天' : '最近90天'} ▼
                </Text>
              </View>
            </View>
            {timeAnalysis && (
              <View className="bg-white rounded-xl p-4 mb-6">
                <Text className="text-white text-sm font-semibold mb-3">按小时分布</Text>
                <View style={{ display: 'flex', flexDirection: 'row', gap: '2px', marginBottom: '12px', height: '60px' }}>
                  {timeAnalysis.hourly.map((hour: any, index: number) => {
                    const maxCount = Math.max(...timeAnalysis.hourly.map((h: any) => h.count));
                    const height = maxCount > 0 ? (hour.count / maxCount) * 100 : 0;
                    return (
                      <View key={index} className="flex-1 flex flex-col items-center justify-end">
                        <View
                          className="bg-emerald-500 rounded-t-sm w-full"
                          style={{
                            minHeight: hour.count > 0 ? '2px' : '0',
                            height: `${height}%`,
                            opacity: hour.count > 0 ? 1 : 0.3
                          }}
                        />
                        <Text className="text-gray-500 text-xs mt-1">{index % 6 === 0 ? hour.hour : ''}</Text>
                      </View>
                    );
                  })}
                </View>
                <Text className="text-white text-sm font-semibold mb-3">按星期分布</Text>
                <View style={{ display: 'flex', flexDirection: 'row', gap: '4px', height: '60px' }}>
                  {timeAnalysis.weekly.map((day: any, index: number) => {
                    const maxCount = Math.max(...timeAnalysis.weekly.map((d: any) => d.count));
                    const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                    return (
                      <View key={index} className="flex-1 flex flex-col items-center justify-end">
                        <View
                          className="bg-amber-500 rounded-t-sm w-full"
                          style={{
                            minHeight: day.count > 0 ? '2px' : '0',
                            height: `${height}%`,
                            opacity: day.count > 0 ? 1 : 0.3
                          }}
                        />
                        <Text className="text-gray-500 text-xs mt-1">{day.day}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* 热门排行 */}
            <Text className="block text-white font-semibold text-lg mb-4">热门知识分享</Text>
            {topItems?.items && topItems.items.length > 0 && (
              <View className="bg-white rounded-xl p-4 mb-6">
                {topItems.items.map((item: any, index: number) => (
                  <View key={item.id} className="flex items-center py-3 border-b border-slate-200 last:border-0" onClick={() => handleViewDetail(item.id)}>
                    <View className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${index < 3 ? 'bg-yellow-500' : 'bg-white'}`}>
                      <Text className="text-white text-xs font-bold">{index + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text className="text-white text-sm">{item.title}</Text>
                      <Text className="text-gray-400 text-xs">{item.author.nickname}</Text>
                    </View>
                    <View className="flex items-center gap-3">
                      <View className="flex items-center gap-1">
                        <Eye color="#6b7280" size={12} />
                        <Text className="text-gray-400 text-xs">{item.viewCount}</Text>
                      </View>
                      <View className="flex items-center gap-1">
                        <Heart color="#6b7280" size={12} />
                        <Text className="text-gray-400 text-xs">{item.likeCount}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* 活跃作者排行 */}
            <Text className="block text-white font-semibold text-lg mb-4">活跃作者排行</Text>
            {topAuthors?.items && topAuthors.items.length > 0 && (
              <View className="bg-white rounded-xl p-4 mb-6">
                {topAuthors.items.map((author: any, index: number) => (
                  <View key={author.id} className="flex items-center py-3 border-b border-slate-200 last:border-0">
                    <View className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${index < 3 ? 'bg-yellow-500' : 'bg-white'}`}>
                      <Text className="text-white text-xs font-bold">{index + 1}</Text>
                    </View>
                    <Image
                      src={author.avatar || ''}
                      className="w-8 h-8 rounded-full mr-3"
                      mode="aspectFill"
                    />
                    <View style={{ flex: 1 }}>
                      <Text className="text-white text-sm">{author.nickname}</Text>
                      <Text className="text-gray-400 text-xs">发布 {author.shareCount} 条</Text>
                    </View>
                    <View className="text-right">
                      <Text className="text-sky-600 text-sm">{author.totalViewCount} 浏览</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* 分类统计 */}
            {stats?.categoryStats && Object.keys(stats.categoryStats).length > 0 && (
              <>
                <Text className="block text-white font-semibold text-lg mb-4">分类分布</Text>
                <View className="bg-white rounded-xl p-4 mb-6">
                  {Object.entries(stats.categoryStats).map(([category, count]: [string, any]) => {
                    const maxCount = Math.max(...Object.values(stats.categoryStats) as number[]);
                    const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                    return (
                      <View key={category} className="mb-3 last:mb-0">
                        <View className="flex items-center justify-between mb-1">
                          <Text className="text-gray-300 text-sm">{category}</Text>
                          <Text className="text-sky-600 text-sm">{count}</Text>
                        </View>
                        <View className="bg-white rounded-full h-2 overflow-hidden">
                          <View
                            className="bg-blue-500 h-full rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </View>
                      </View>
                    );
                  })}
                </View>
              </>
            )}

            {/* 附件统计 */}
            {stats?.attachmentStats && (
              <>
                <Text className="block text-white font-semibold text-lg mb-4">附件类型分布</Text>
                <View className="bg-white rounded-xl p-4 mb-6">
                  <View className="grid grid-cols-2 gap-4">
                    <View className="bg-white rounded-lg p-3 text-center">
                      <View className="flex justify-center mb-2">
                        <ImageIcon color="#60a5fa" size={24} />
                      </View>
                      <Text className="text-white font-bold text-xl">{stats.attachmentStats.withImage}</Text>
                      <Text className="text-gray-400 text-xs">有图片</Text>
                    </View>
                    <View className="bg-white rounded-lg p-3 text-center">
                      <View className="flex justify-center mb-2">
                        <File color="#10b981" size={24} />
                      </View>
                      <Text className="text-white font-bold text-xl">{stats.attachmentStats.withFile}</Text>
                      <Text className="text-gray-400 text-xs">有文件</Text>
                    </View>
                    <View className="bg-white rounded-lg p-3 text-center">
                      <View className="flex justify-center mb-2">
                        <File color="#f59e0b" size={24} />
                      </View>
                      <Text className="text-white font-bold text-xl">{stats.attachmentStats.withAudio}</Text>
                      <Text className="text-gray-400 text-xs">有录音</Text>
                    </View>
                    <View className="bg-white rounded-lg p-3 text-center">
                      <View className="flex justify-center mb-2">
                        <File color="#6b7280" size={24} />
                      </View>
                      <Text className="text-white font-bold text-xl">{stats.attachmentStats.noAttachment}</Text>
                      <Text className="text-gray-400 text-xs">无附件</Text>
                    </View>
                  </View>
                </View>
              </>
            )}

            {/* 附件数量分布 */}
            {stats?.attachmentCountStats && Object.keys(stats.attachmentCountStats).length > 0 && (
              <>
                <Text className="block text-white font-semibold text-lg mb-4">附件数量分布</Text>
                <View className="bg-white rounded-xl p-4 mb-6">
                  {Object.entries(stats.attachmentCountStats).map(([range, count]: [string, any]) => {
                    const maxCount = Math.max(...Object.values(stats.attachmentCountStats) as number[]);
                    const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                    return (
                      <View key={range} className="mb-3 last:mb-0">
                        <View className="flex items-center justify-between mb-1">
                          <Text className="text-gray-300 text-sm">{range} 个附件</Text>
                          <Text className="text-sky-600 text-sm">{count}</Text>
                        </View>
                        <View className="bg-white rounded-full h-2 overflow-hidden">
                          <View
                            className="bg-blue-500 h-full rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </View>
                      </View>
                    );
                  })}
                </View>
              </>
            )}
          </View>
        </>
      )}
    </View>
  );
}
