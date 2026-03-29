import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Textarea, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  Plus,
  Clock,
  CircleCheck,
  Pause,
  Play,
  Trash2,
  X,
  ChevronRight,
  Repeat,
  Bell,
  RefreshCw,
  Target,
  ListTodo,
} from 'lucide-react-taro';
import { Network } from '@/network';

interface ScheduledTask {
  id: string;
  userId: string;
  title: string;
  description?: string;
  reminderTime: string;
  repeatType: 'none' | 'daily' | 'weekly' | 'monthly';
  status: 'pending' | 'completed' | 'cancelled';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

const REPEAT_OPTIONS = [
  { value: 'none', label: '不重复' },
  { value: 'daily', label: '每天' },
  { value: 'weekly', label: '每周' },
  { value: 'monthly', label: '每月' },
];

const STATUS_CONFIG = {
  pending: { label: '待完成', color: '#fbbf24', bgColor: 'rgba(251, 191, 36, 0.15)' },
  completed: { label: '已完成', color: '#4ade80', bgColor: 'rgba(74, 222, 128, 0.15)' },
  cancelled: { label: '已取消', color: '#64748b', bgColor: 'rgba(100, 116, 139, 0.15)' },
};

export default function TaskSchedulePage() {
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'all'>('pending');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // 表单状态
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formReminderTime, setFormReminderTime] = useState('');
  const [formRepeatType, setFormRepeatType] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const res = await Network.request({
        url: '/api/tasks/scheduled',
        method: 'GET',
        data: activeTab !== 'all' ? { status: activeTab } : {},
      });

      console.log('[TaskSchedule] 加载任务响应:', res);

      if (res.data?.code === 200) {
        setTasks(res.data.data?.tasks || []);
      }
    } catch (error) {
      console.error('[TaskSchedule] 加载任务失败:', error);
      Taro.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!formTitle.trim()) {
      Taro.showToast({ title: '请输入任务标题', icon: 'none' });
      return;
    }

    if (!formReminderTime) {
      Taro.showToast({ title: '请选择提醒时间', icon: 'none' });
      return;
    }

    try {
      const res = await Network.request({
        url: '/api/tasks/scheduled',
        method: 'POST',
        data: {
          title: formTitle,
          description: formDescription,
          reminderTime: formReminderTime,
          repeatType: formRepeatType,
        },
      });

      if (res.data?.code === 200) {
        Taro.showToast({ title: '创建成功', icon: 'success' });
        setShowAddModal(false);
        resetForm();
        loadTasks();
      } else {
        Taro.showToast({ title: res.data?.msg || '创建失败', icon: 'none' });
      }
    } catch (error) {
      console.error('[TaskSchedule] 创建任务失败:', error);
      Taro.showToast({ title: '创建失败', icon: 'none' });
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const res = await Network.request({
        url: `/api/tasks/scheduled/${taskId}/complete`,
        method: 'POST',
      });

      if (res.data?.code === 200) {
        Taro.showToast({ title: '任务已完成', icon: 'success' });
        loadTasks();
      }
    } catch (error) {
      console.error('[TaskSchedule] 完成任务失败:', error);
      Taro.showToast({ title: '操作失败', icon: 'none' });
    }
  };

  const handleToggleTask = async (taskId: string, currentActive: boolean) => {
    try {
      const res = await Network.request({
        url: `/api/tasks/scheduled/${taskId}/toggle`,
        method: 'POST',
        data: { isActive: !currentActive },
      });

      if (res.data?.code === 200) {
        Taro.showToast({ title: currentActive ? '已暂停' : '已激活', icon: 'success' });
        loadTasks();
      }
    } catch (error) {
      console.error('[TaskSchedule] 切换任务状态失败:', error);
      Taro.showToast({ title: '操作失败', icon: 'none' });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const confirm = await Taro.showModal({
        title: '确认删除',
        content: '确定要删除这个任务吗？',
      });

      if (confirm.confirm) {
        const res = await Network.request({
          url: `/api/tasks/scheduled/${taskId}`,
          method: 'DELETE',
        });

        if (res.data?.code === 200) {
          Taro.showToast({ title: '已删除', icon: 'success' });
          loadTasks();
        }
      }
    } catch (error) {
      console.error('[TaskSchedule] 删除任务失败:', error);
      Taro.showToast({ title: '删除失败', icon: 'none' });
    }
  };

  const resetForm = () => {
    setFormTitle('');
    setFormDescription('');
    setFormReminderTime('');
    setFormRepeatType('none');
  };

  const formatDateTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${month}月${day}日 ${hour}:${minute}`;
  };

  const getRepeatLabel = (type: string) => {
    return REPEAT_OPTIONS.find(o => o.value === type)?.label || '不重复';
  };

  const tabs = [
    { key: 'pending', label: '待完成' },
    { key: 'completed', label: '已完成' },
    { key: 'all', label: '全部' },
  ];

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a' }}>
      {/* 顶部导航 */}
      <View style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 56,
        backgroundColor: '#111827',
        borderBottomWidth: 1,
        borderBottomColor: '#1e3a5f',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft:  16,
        zIndex: 100,
      }}
      >
        
        <Text style={{ flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '600', color: '#f1f5f9' }}>
          任务调度
        </Text>
        <View
          onClick={() => setShowAddModal(true)}
          style={{ padding: 8, marginRight: -8 }}
        >
          <Plus size={24} color="#38bdf8" />
        </View>
      </View>

      {/* Tab 栏 */}
      <View style={{
        position: 'fixed',
        top: 56,
        left: 0,
        right: 0,
        backgroundColor: '#111827',
        borderBottomWidth: 1,
        borderBottomColor: '#1e3a5f',
        zIndex: 99,
      }}
      >
        <View style={{ flexDirection: 'row', paddingLeft:  16, paddingTop:  12, gap: 12 }}>
          {tabs.map(tab => (
            <View
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                flex: 1,
                paddingTop:  10,
                borderRadius: 12,
                backgroundColor: activeTab === tab.key ? '#38bdf8' : 'transparent',
                borderWidth: 1,
                borderColor: activeTab === tab.key ? '#38bdf8' : '#334155',
                alignItems: 'center',
              }}
            >
              <Text style={{
                color: activeTab === tab.key ? '#0c4a6e' : '#94a3b8',
                fontSize: 14,
                fontWeight: '500',
              }}
              >
                {tab.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* 主内容区 */}
      <ScrollView
        scrollY
        style={{ marginTop: 112, padding: 16, paddingBottom: 100 }}
      >
        {/* 功能入口 */}
        <View style={{
          flexDirection: 'row',
          gap: 12,
          marginBottom: 16,
        }}
        >
          <View
            onClick={() => Taro.navigateTo({ url: '/pages/work-plans/index' })}
            style={{
              flex: 1,
              backgroundColor: '#111827',
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: '#1e3a5f',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: 'rgba(168, 85, 247, 0.15)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            >
              <Target size={20} color="#a855f7" />
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={{ color: '#f1f5f9', fontSize: 14, fontWeight: '500' }}>工作计划</Text>
              <Text style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>管理长期目标</Text>
            </View>
            <ChevronRight size={18} color="#64748b" style={{ marginLeft: 'auto' }} />
          </View>
        </View>

        {/* 任务统计 */}
        <View style={{
          flexDirection: 'row',
          gap: 12,
          marginBottom: 16,
        }}
        >
          <View style={{
            flex: 1,
            backgroundColor: '#111827',
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: '#1e3a5f',
            alignItems: 'center',
          }}
          >
            <Text style={{ color: '#fbbf24', fontSize: 28, fontWeight: '700' }}>
              {tasks.filter(t => t.status === 'pending').length}
            </Text>
            <Text style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>待完成</Text>
          </View>
          <View style={{
            flex: 1,
            backgroundColor: '#111827',
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: '#1e3a5f',
            alignItems: 'center',
          }}
          >
            <Text style={{ color: '#4ade80', fontSize: 28, fontWeight: '700' }}>
              {tasks.filter(t => t.status === 'completed').length}
            </Text>
            <Text style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>已完成</Text>
          </View>
        </View>

        {/* 任务列表 */}
        {loading ? (
          <View style={{ alignItems: 'center', paddingTop:  40 }}>
            <RefreshCw size={24} color="#38bdf8" />
            <Text style={{ color: '#64748b', fontSize: 14, marginTop: 12 }}>加载中...</Text>
          </View>
        ) : tasks.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop:  60 }}>
            <ListTodo size={48} color="#334155" />
            <Text style={{ color: '#64748b', fontSize: 14, marginTop: 16 }}>暂无任务</Text>
            <Text style={{ color: '#475569', fontSize: 12, marginTop: 4 }}>点击右上角添加新任务</Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {tasks.map(task => {
              const statusConfig = STATUS_CONFIG[task.status];
              
              return (
                <View
                  key={task.id}
                  style={{
                    backgroundColor: '#111827',
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: '#1e3a5f',
                    padding: 16,
                    opacity: task.status === 'cancelled' ? 0.6 : 1,
                  }}
                >
                  {/* 顶部：状态和操作 */}
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 12,
                  }}
                  >
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                    }}
                    >
                      <View style={{
                        paddingLeft:  8,
                        paddingTop:  4,
                        borderRadius: 6,
                        backgroundColor: statusConfig.bgColor,
                      }}
                      >
                        <Text style={{ color: statusConfig.color, fontSize: 11 }}>
                          {statusConfig.label}
                        </Text>
                      </View>
                      {task.repeatType !== 'none' && (
                        <View style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                        >
                          <Repeat size={12} color="#60a5fa" />
                          <Text style={{ color: '#60a5fa', fontSize: 11, marginLeft: 4 }}>
                            {getRepeatLabel(task.repeatType)}
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    {/* 操作按钮 */}
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {task.status === 'pending' && (
                        <>
                          <View
                            onClick={() => handleCompleteTask(task.id)}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              backgroundColor: 'rgba(74, 222, 128, 0.15)',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <CircleCheck size={16} color="#4ade80" />
                          </View>
                          <View
                            onClick={() => handleToggleTask(task.id, task.isActive)}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              backgroundColor: task.isActive ? 'rgba(251, 191, 36, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {task.isActive ? (
                              <Pause size={16} color="#fbbf24" />
                            ) : (
                              <Play size={16} color="#38bdf8" />
                            )}
                          </View>
                        </>
                      )}
                      <View
                        onClick={() => handleDeleteTask(task.id)}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          backgroundColor: 'rgba(248, 113, 113, 0.15)',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Trash2 size={16} color="#f87171" />
                      </View>
                    </View>
                  </View>
                  
                  {/* 任务标题 */}
                  <Text style={{
                    color: task.status === 'completed' ? '#64748b' : '#f1f5f9',
                    fontSize: 16,
                    fontWeight: '500',
                    textDecorationLine: task.status === 'completed' ? 'line-through' : 'none',
                  }}
                  >
                    {task.title}
                  </Text>
                  
                  {/* 描述 */}
                  {task.description && (
                    <Text style={{ color: '#64748b', fontSize: 13, marginTop: 6 }}>
                      {task.description}
                    </Text>
                  )}
                  
                  {/* 时间信息 */}
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 12,
                    gap: 16,
                  }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Bell size={14} color="#fbbf24" />
                      <Text style={{ color: '#94a3b8', fontSize: 12, marginLeft: 6 }}>
                        {formatDateTime(task.reminderTime)}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* 添加任务弹窗 */}
      {showAddModal && (
        <View
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 200,
            justifyContent: 'flex-end',
          }}
          onClick={() => setShowAddModal(false)}
        >
          <View
            style={{
              backgroundColor: '#111827',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              paddingBottom: 48,
            }}
            onClick={e => e.stopPropagation()}
          >
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
            }}
            >
              <Text style={{ color: '#f1f5f9', fontSize: 18, fontWeight: '600' }}>
                新建任务
              </Text>
              <View onClick={() => setShowAddModal(false)} style={{ padding: 4 }}>
                <X size={20} color="#64748b" />
              </View>
            </View>

            {/* 表单 */}
            <View style={{ gap: 16 }}>
              {/* 标题 */}
              <View>
                <Text style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8 }}>任务标题 *</Text>
                <View style={{
                  backgroundColor: '#0a0f1a',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#1e3a5f',
                  paddingLeft:  12,
                }}
                >
                  <Input
                    style={{ color: '#f1f5f9', fontSize: 15, height: 44 }}
                    placeholder="输入任务标题"
                    placeholderStyle="color: #475569"
                    value={formTitle}
                    onInput={e => setFormTitle(e.detail.value)}
                  />
                </View>
              </View>

              {/* 描述 */}
              <View>
                <Text style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8 }}>任务描述</Text>
                <View style={{
                  backgroundColor: '#0a0f1a',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#1e3a5f',
                  padding: 12,
                }}
                >
                  <Textarea
                    style={{ color: '#f1f5f9', fontSize: 15, minHeight: 80, width: '100%' }}
                    placeholder="输入任务描述（可选）"
                    placeholderStyle="color: #475569"
                    value={formDescription}
                    onInput={e => setFormDescription(e.detail.value)}
                  />
                </View>
              </View>

              {/* 提醒时间 */}
              <View>
                <Text style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8 }}>提醒时间 *</Text>
                <View
                  onClick={() => {
                    // 使用 Taro 日期时间选择器
                    Taro.showActionSheet({
                      itemList: ['今天', '明天', '后天', '选择日期'],
                    }).then(res => {
                      const now = new Date();
                      let targetDate = new Date();
                      
                      switch (res.tapIndex) {
                        case 0: // 今天
                          targetDate = now;
                          break;
                        case 1: // 明天
                          targetDate.setDate(now.getDate() + 1);
                          break;
                        case 2: // 后天
                          targetDate.setDate(now.getDate() + 2);
                          break;
                        case 3: // 选择日期
                          Taro.navigateTo({ url: '/pages/date-picker/index' });
                          return;
                      }
                      
                      // 设置默认时间
                      targetDate.setHours(9, 0, 0, 0);
                      setFormReminderTime(targetDate.toISOString());
                    }).catch(() => {});
                  }}
                  style={{
                    backgroundColor: '#0a0f1a',
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#1e3a5f',
                    paddingLeft:  12,
                    height: 44,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Clock size={18} color="#38bdf8" />
                  <Text style={{ color: formReminderTime ? '#f1f5f9' : '#475569', fontSize: 15, marginLeft: 10 }}>
                    {formReminderTime ? formatDateTime(formReminderTime) : '选择提醒时间'}
                  </Text>
                </View>
              </View>

              {/* 重复类型 */}
              <View>
                <Text style={{ color: '#94a3b8', fontSize: 13, marginBottom: 8 }}>重复</Text>
                <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                  {REPEAT_OPTIONS.map(option => (
                    <View
                      key={option.value}
                      onClick={() => setFormRepeatType(option.value as any)}
                      style={{
                        paddingLeft:  14,
                        paddingTop:  8,
                        borderRadius: 8,
                        backgroundColor: formRepeatType === option.value ? '#38bdf8' : '#1e3a5f',
                        borderWidth: 1,
                        borderColor: formRepeatType === option.value ? '#38bdf8' : '#334155',
                      }}
                    >
                      <Text style={{
                        color: formRepeatType === option.value ? '#0c4a6e' : '#94a3b8',
                        fontSize: 13,
                      }}
                      >
                        {option.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* 提交按钮 */}
              <View
                onClick={handleCreateTask}
                style={{
                  backgroundColor: '#38bdf8',
                  borderRadius: 12,
                  paddingTop:  14,
                  alignItems: 'center',
                  marginTop: 8,
                }}
              >
                <Text style={{ color: '#0c4a6e', fontSize: 16, fontWeight: '600' }}>
                  创建任务
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
