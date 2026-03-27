import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
  ChevronLeft,
  Plus,
  Search,
  Phone,
  MessageCircle,
  Copy,
  X,
  Users,
  Inbox,
} from 'lucide-react-taro';
import { Network } from '@/network';
import '@/styles/pages.css';
import './index.css';

interface Customer {
  id: string;
  name: string;
  phone: string;
  wechat?: string;
  source: string;
  tags: string[];
  remark?: string;
  createdAt: string;
  lastContact?: string;
}

const CustomerManagementPage = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedSource, setSelectedSource] = useState('全部');
  const [loading, setLoading] = useState(false);

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    wechat: '',
    source: '抖音',
    tags: '',
    remark: '',
  });

  const sources = ['全部', '抖音', '小红书', '微信', '朋友推荐', '线下活动', '其他'];

  const filterCustomers = useCallback(() => {
    let filtered = customers;

    if (selectedSource !== '全部') {
      filtered = filtered.filter((c) => c.source === selectedSource);
    }

    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(keyword) ||
          c.phone.includes(keyword) ||
          c.wechat?.toLowerCase().includes(keyword)
      );
    }

    setFilteredCustomers(filtered);
  }, [customers, searchKeyword, selectedSource]);

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [filterCustomers]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await Network.request({
        url: '/api/customers',
        method: 'GET',
      });

      if (res.data.code === 200) {
        setCustomers(res.data.data || []);
      }
    } catch (error) {
      console.error('加载客户失败', error);
      const localData = Taro.getStorageSync('customers') || [];
      setCustomers(localData);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = () => {
    if (!newCustomer.name.trim()) {
      Taro.showToast({ title: '请输入姓名', icon: 'none' });
      return;
    }
    if (!newCustomer.phone.trim()) {
      Taro.showToast({ title: '请输入手机号', icon: 'none' });
      return;
    }

    const customer: Customer = {
      id: Date.now().toString(),
      name: newCustomer.name.trim(),
      phone: newCustomer.phone.trim(),
      wechat: newCustomer.wechat.trim(),
      source: newCustomer.source,
      tags: newCustomer.tags
        ? newCustomer.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      remark: newCustomer.remark.trim(),
      createdAt: new Date().toISOString(),
    };

    const updated = [customer, ...customers];
    setCustomers(updated);
    Taro.setStorageSync('customers', updated);
    Taro.showToast({ title: '添加成功', icon: 'success' });

    setNewCustomer({
      name: '',
      phone: '',
      wechat: '',
      source: '抖音',
      tags: '',
      remark: '',
    });
    setShowAddDialog(false);
  };

  const handleCall = (phone: string) => {
    if (!phone) return;
    Taro.makePhoneCall({ phoneNumber: phone });
  };

  const handleCopy = (text: string) => {
    if (!text) return;
    Taro.setClipboardData({ data: text });
    Taro.showToast({ title: '已复制', icon: 'success' });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <View className="customer-management-page">
      {/* Header */}
      <View className="page-header">
        <View className="header-top">
          <View className="header-left">
            <View className="back-button" onClick={() => Taro.navigateBack()}>
              <ChevronLeft size={32} color="#fafafa" />
            </View>
            <View className="header-title-group">
              <Text className="header-title">客资管理</Text>
              <Text className="header-subtitle">{customers.length} 位客户</Text>
            </View>
          </View>

          <View className="primary-action-btn" onClick={() => setShowAddDialog(true)}>
            <Plus size={40} color="#000" />
          </View>
        </View>

        {/* 搜索框 */}
        <View className="search-box">
          <Search size={28} color="#71717a" />
          <Input
            className="search-input"
            placeholder="搜索客户..."
            placeholderStyle="color: #52525b"
            value={searchKeyword}
            onInput={(e) => setSearchKeyword(e.detail.value)}
          />
        </View>

        {/* 来源筛选 */}
        <ScrollView scrollX className="source-filter-scroll">
          <View className="source-filter-container">
            {sources.map((source) => (
              <View
                key={source}
                className={`source-filter-item ${selectedSource === source ? 'source-filter-active' : ''}`}
                onClick={() => setSelectedSource(source)}
              >
                {source}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 客户列表 */}
      <View className="content-area">
        {loading ? (
          <View className="loading-state">
            <Users size={64} color="#f59e0b" />
            <Text className="loading-text">加载中...</Text>
          </View>
        ) : filteredCustomers.length === 0 ? (
          <View className="empty-state">
            <Inbox size={80} color="#71717a" />
            <Text className="empty-title">
              {searchKeyword ? '没有找到相关客户' : '还没有客户'}
            </Text>
            {!searchKeyword && (
              <Text className="empty-action" onClick={() => setShowAddDialog(true)}>
                点击添加第一位客户
              </Text>
            )}
          </View>
        ) : (
          filteredCustomers.map((customer) => (
            <View key={customer.id} className="customer-card">
              <View className="customer-header">
                <View style={{ flex: 1 }}>
                  <Text className="customer-name">{customer.name}</Text>
                  <View className="customer-contact">
                    <Text>{customer.phone}</Text>
                    {customer.wechat && <Text>| {customer.wechat}</Text>}
                  </View>
                </View>

                <View className="customer-actions">
                  <View className="action-icon-btn action-phone" onClick={() => handleCall(customer.phone)}>
                    <Phone size={24} color="#22c55e" />
                  </View>
                  {customer.wechat && (
                    <View className="action-icon-btn action-wechat" onClick={() => handleCopy(customer.wechat!)}>
                      <MessageCircle size={24} color="#3b82f6" />
                    </View>
                  )}
                  <View className="action-icon-btn action-copy" onClick={() => handleCopy(customer.phone)}>
                    <Copy size={24} color="#f59e0b" />
                  </View>
                </View>
              </View>

              <View className="customer-info">
                <View className="customer-tag customer-tag-source">{customer.source}</View>
                {customer.tags.map((tag, index) => (
                  <View key={index} className="customer-tag">
                    {tag}
                  </View>
                ))}
              </View>

              <Text className="customer-time">添加于 {formatDate(customer.createdAt)}</Text>
            </View>
          ))
        )}
      </View>

      {/* 新增客户弹窗 */}
      {showAddDialog && (
        <View className="modal-overlay" onClick={() => setShowAddDialog(false)}>
          <View className="modal-content" onClick={(e) => e.stopPropagation()}>
            <View className="modal-header">
              <Text className="modal-title">新建客户</Text>
              <View onClick={() => setShowAddDialog(false)}>
                <X size={28} color="#71717a" />
              </View>
            </View>

            <View className="form-group">
              <Text className="form-label">姓名</Text>
              <Input
                className="form-input"
                placeholder="请输入姓名"
                placeholderStyle="color: #52525b"
                value={newCustomer.name}
                onInput={(e) => setNewCustomer({ ...newCustomer, name: e.detail.value })}
              />
            </View>

            <View className="form-group">
              <Text className="form-label">手机号</Text>
              <Input
                className="form-input"
                placeholder="请输入手机号"
                placeholderStyle="color: #52525b"
                value={newCustomer.phone}
                onInput={(e) => setNewCustomer({ ...newCustomer, phone: e.detail.value })}
              />
            </View>

            <View className="form-group">
              <Text className="form-label">微信号</Text>
              <Input
                className="form-input"
                placeholder="请输入微信号（选填）"
                placeholderStyle="color: #52525b"
                value={newCustomer.wechat}
                onInput={(e) => setNewCustomer({ ...newCustomer, wechat: e.detail.value })}
              />
            </View>

            <View className="form-group">
              <Text className="form-label">来源</Text>
              <ScrollView scrollX>
                <View style={{ display: 'flex', gap: '12px' }}>
                  {sources.slice(1).map((source) => (
                    <View
                      key={source}
                      style={{
                        flexShrink: 0,
                        padding: '12px 20px',
                        backgroundColor: newCustomer.source === source ? '#f59e0b' : '#1e293b',
                        borderRadius: '12px',
                        fontSize: '24px',
                        color: newCustomer.source === source ? '#000' : '#a1a1aa',
                      }}
                      onClick={() => setNewCustomer({ ...newCustomer, source })}
                    >
                      {source}
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View className="form-group">
              <Text className="form-label">标签（逗号分隔）</Text>
              <Input
                className="form-input"
                placeholder="如：VIP, 意向客户"
                placeholderStyle="color: #52525b"
                value={newCustomer.tags}
                onInput={(e) => setNewCustomer({ ...newCustomer, tags: e.detail.value })}
              />
            </View>

            <View className="form-group">
              <Text className="form-label">备注</Text>
              <Input
                className="form-input"
                placeholder="请输入备注（选填）"
                placeholderStyle="color: #52525b"
                value={newCustomer.remark}
                onInput={(e) => setNewCustomer({ ...newCustomer, remark: e.detail.value })}
              />
            </View>

            <View className="action-btn-primary" onClick={handleAddCustomer}>
              <Text className="action-btn-primary-text">添加客户</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default CustomerManagementPage;
