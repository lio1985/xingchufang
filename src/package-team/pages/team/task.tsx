import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, ScrollView } from '@tarojs/components';
import { Network } from '@/network';
import {
  ArrowLeft,
  ClipboardList,
  Plus,
  Calendar,
  ChevronRight,
  Clock,
  Check,
  CircleAlert,
  Users,
} from 'lucide-react-taro';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  due_date: string;
  assignees: {
    id: string;
    nickname: string;
    avatar_url?: string;
  }[];
  created_at: string;
}

export default function TaskAssignment() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'my' | 'completed'>('all');
  const [isLeader, setIsLeader] = useState(false);

  useEffect(() => {
    fetchTasks();
    checkLeaderStatus();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      // 模拟数据
      setTasks([
        {
          id: '1',
          title: '本周客户回访任务',
          description: '对上周新增的意向客户进行电话回访，了解客户需求，推动成交进度。',
          status: 'in_progress',
          priority: 'high',
          due_date: new Date(Date.now() + 86400000 * 2).toISOString(),
          assignees: [
            { id: '1', nickname: '李四' },
            { id: '2', nickname: '王五' },
          ],
          created_at: new Date().toISOString(),
        },
        {
          id: '2',
          title: '产品资料整理',
          description: '整理本月新品的产品资料，包括功能说明、价格政策、促销方案等。',
          status: 'pending',
          priority: 'medium',
          due_date: new Date(Date.now() + 86400000 * 5).toISOString(),
          assignees: [{ id: '3', nickname: '赵六' }],
          created_at: new Date().toISOString(),
        },
        {
          id: '3',
          title: '月度销售报告',
          description: '完成本月销售数据统计和分析，撰写销售报告。',
          status: 'completed',
          priority: 'high',
          due_date: new Date(Date.now() - 86400000).toISOString(),
          assignees: [{ id: '1', nickname: '李四' }],
          created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        },
      ]);
    } catch (error) {
      console.error('获取任务失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkLeaderStatus = async () => {
    try {
      const user = Taro.getStorageSync('user');
      const res = await Network.request({
        url: '/api/teams/my/members',
        method: 'GET',
      });
      if (res.data?.code === 200) {
        const myInfo = res.data.data?.find((m: any) => m.user_id === user?.id);
        setIsLeader(myInfo?.role === 'leader');
      }
    } catch (error) {
      console.error('检查权限失败:', error);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return { color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.15)', text: '已完成', icon: Check };
      case 'in_progress':
        return { color: '#fbbf24', bgColor: 'rgba(251, 191, 36, 0.15)', text: '进行中', icon: Clock };
      default:
        return { color: '#64748b', bgColor: 'rgba(100, 116, 139, 0.15)', text: '待处理', icon: CircleAlert };
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'high':
        return { color: '#f43f5e', text: '紧急' };
      case 'medium':
        return { color: '#fbbf24', text: '重要' };
      default:
        return { color: '#64748b', text: '普通' };
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'completed') return false;
    return new Date(dueDate) < new Date();
  };

  const filteredTasks = tasks.filter((task) => {
    if (activeTab === 'completed') return task.status === 'completed';
    if (activeTab === 'my') return task.status !== 'completed';
    return true;
  });

  const handleCreateTask = () => {
    Taro.showToast({ title: '功能开发中', icon: 'none' });
  };

  const handleViewTask = (task: Task) => {
    Taro.showModal({
      title: task.title,
      content: `描述：${task.description}\n\n截止日期：${formatDate(task.due_date)}\n负责人：${task.assignees.map(a => a.nickname).join('、')}`,
      showCancel: false,
      confirmText: '知道了',
    });
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a' }}>
      {/* Header */}
      <View style={{ padding: '48px 20px 20px', backgroundColor: '#111827', borderBottom: '1px solid #1e3a5f' }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ display: 'flex', alignItems: 'center' }}>
            <View
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px',
              }}
              onClick={() => Taro.navigateBack()}
            >
              <ArrowLeft size={20} color="#ffffff" />
            </View>
            <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>任务分配</Text>
          </View>
          {isLeader && (
            <View
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 14px',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                borderRadius: '20px',
              }}
              onClick={handleCreateTask}
            >
              <Plus size={16} color="#38bdf8" />
              <Text style={{ fontSize: '13px', color: '#38bdf8' }}>新建任务</Text>
            </View>
          )}
        </View>

        {/* Tab 切换 */}
        <View style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          {[
            { key: 'all', label: '全部' },
            { key: 'my', label: '进行中' },
            { key: 'completed', label: '已完成' },
          ].map((tab) => (
            <View
              key={tab.key}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                backgroundColor: activeTab === tab.key ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                border: activeTab === tab.key ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid #1e3a5f',
              }}
              onClick={() => setActiveTab(tab.key as any)}
            >
              <Text style={{ fontSize: '13px', color: activeTab === tab.key ? '#38bdf8' : '#64748b' }}>{tab.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView scrollY style={{ flex: 1, padding: '16px 20px' }}>
        {loading ? (
          <View style={{ textAlign: 'center', padding: '40px' }}>
            <Text style={{ color: '#64748b' }}>加载中...</Text>
          </View>
        ) : filteredTasks.length === 0 ? (
          <View style={{
            backgroundColor: '#111827',
            borderRadius: '16px',
            padding: '40px 20px',
            textAlign: 'center',
            border: '1px solid #1e3a5f',
          }}
          >
            <View style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
            >
              <ClipboardList size={32} color="#38bdf8" />
            </View>
            <Text style={{ fontSize: '16px', color: '#ffffff', marginBottom: '8px', display: 'block' }}>暂无任务</Text>
            <Text style={{ fontSize: '13px', color: '#64748b', display: 'block' }}>团队任务将在这里显示</Text>
          </View>
        ) : (
          <View style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredTasks.map((task) => {
              const statusStyle = getStatusStyle(task.status);
              const priorityStyle = getPriorityStyle(task.priority);
              const StatusIcon = statusStyle.icon;
              const overdue = isOverdue(task.due_date, task.status);

              return (
                <View
                  key={task.id}
                  style={{
                    backgroundColor: '#111827',
                    borderRadius: '12px',
                    border: '1px solid #1e3a5f',
                    padding: '16px',
                  }}
                  onClick={() => handleViewTask(task)}
                >
                  {/* 标题行 */}
                  <View style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <View style={{ flex: 1 }}>
                      <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <Text style={{ fontSize: '12px', color: priorityStyle.color }}>{priorityStyle.text}</Text>
                        <Text style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>{task.title}</Text>
                      </View>
                      <Text style={{ fontSize: '13px', color: '#94a3b8', display: 'block' }}>
                        {task.description.length > 40 ? task.description.slice(0, 40) + '...' : task.description}
                      </Text>
                    </View>
                    <ChevronRight size={18} color="#64748b" />
                  </View>

                  {/* 底部信息 */}
                  <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <View style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        backgroundColor: statusStyle.bgColor,
                        borderRadius: '12px',
                      }}
                      >
                        <StatusIcon size={12} color={statusStyle.color} />
                        <Text style={{ fontSize: '12px', color: statusStyle.color }}>{statusStyle.text}</Text>
                      </View>
                      <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Users size={12} color="#64748b" />
                        <Text style={{ fontSize: '12px', color: '#64748b' }}>
                          {task.assignees.map(a => a.nickname).join('、')}
                        </Text>
                      </View>
                    </View>
                    <View style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} color={overdue ? '#f43f5e' : '#64748b'} />
                      <Text style={{ fontSize: '12px', color: overdue ? '#f43f5e' : '#64748b' }}>
                        {formatDate(task.due_date)}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
