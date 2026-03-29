import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import {
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
    <View style={{ minHeight: '100vh', backgroundColor: '#0a0f1a', paddingBottom: '60px' }}>
      {/* Header */}
      <View style={{ padding: '48px 20px 20px', backgroundColor: '#111827', borderBottom: '1px solid #1e3a5f' }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <View style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            
            <View>
              <Text style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', display: 'block' }}>客资管理</Text>
              <Text style={{ fontSize: '13px', color: '#71717a', display: 'block', marginTop: '2px' }}>{customers.length} 位客户</Text>
            </View>
          </View>

          <View
            style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setShowAddDialog(true)}
          >
            <Plus size={20} color="#000" />
          </View>
        </View>

        {/* 搜索框 */}
        <View style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#1e293b', borderRadius: '12px', padding: '12px 16px' }}>
          <Search size={20} color="#71717a" />
          <Input
            style={{ flex: 1, fontSize: '14px', color: '#ffffff' }}
            placeholder="搜索客户..."
            placeholderStyle="color: #64748b"
            value={searchKeyword}
            onInput={(e) => setSearchKeyword(e.detail.value)}
          />
        </View>

        {/* 来源筛选 */}
        <ScrollView scrollX style={{ marginTop: '16px', whiteSpace: 'nowrap' }}>
          <View style={{ display: 'inline-flex', gap: '12px', paddingRight: '20px' }}>
            {sources.map((source) => (
              <View
                key={source}
                style={{
                  flexShrink: 0,
                  padding: '10px 16px',
                  borderRadius: '12px',
                  backgroundColor: selectedSource === source ? '#38bdf8' : '#1e293b',
                }}
                onClick={() => setSelectedSource(source)}
              >
                <Text style={{ fontSize: '14px', color: selectedSource === source ? '#000' : '#94a3b8' }}>{source}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 客户列表 */}
      <ScrollView scrollY style={{ height: 'calc(100vh - 200px)' }}>
        <View style={{ padding: '20px' }}>
          {loading ? (
            <View style={{ padding: '60px 20px', textAlign: 'center' }}>
              <Users size={48} color="#38bdf8" />
              <Text style={{ fontSize: '14px', color: '#71717a', display: 'block', marginTop: '16px' }}>加载中...</Text>
            </View>
          ) : filteredCustomers.length === 0 ? (
            <View style={{ padding: '60px 20px', textAlign: 'center' }}>
              <Inbox size={64} color="#71717a" />
              <Text style={{ fontSize: '15px', color: '#71717a', display: 'block', marginTop: '16px' }}>
                {searchKeyword ? '没有找到相关客户' : '还没有客户'}
              </Text>
              {!searchKeyword && (
                <Text style={{ fontSize: '14px', color: '#38bdf8', display: 'block', marginTop: '8px' }} onClick={() => setShowAddDialog(true)}>
                  点击添加第一位客户
                </Text>
              )}
            </View>
          ) : (
            filteredCustomers.map((customer) => (
              <View
                key={customer.id}
                style={{
                  backgroundColor: '#111827',
                  border: '1px solid #1e3a5f',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '12px',
                }}
              >
                <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', display: 'block' }}>{customer.name}</Text>
                    <View style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <Text style={{ fontSize: '13px', color: '#94a3b8' }}>{customer.phone}</Text>
                      {customer.wechat && <Text style={{ fontSize: '13px', color: '#64748b' }}>| {customer.wechat}</Text>}
                    </View>
                  </View>

                  <View style={{ display: 'flex', gap: '8px' }}>
                    <View
                      style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(74, 222, 128, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onClick={() => handleCall(customer.phone)}
                    >
                      <Phone size={18} color="#4ade80" />
                    </View>
                    {customer.wechat && (
                      <View
                        style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(96, 165, 250, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={() => handleCopy(customer.wechat!)}
                      >
                        <MessageCircle size={18} color="#60a5fa" />
                      </View>
                    )}
                    <View
                      style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onClick={() => handleCopy(customer.phone)}
                    >
                      <Copy size={18} color="#38bdf8" />
                    </View>
                  </View>
                </View>

                <View style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                  <View style={{ padding: '4px 10px', backgroundColor: 'rgba(56, 189, 248, 0.15)', borderRadius: '6px' }}>
                    <Text style={{ fontSize: '12px', color: '#38bdf8' }}>{customer.source}</Text>
                  </View>
                  {customer.tags.map((tag, index) => (
                    <View key={index} style={{ padding: '4px 10px', backgroundColor: '#1e293b', borderRadius: '6px' }}>
                      <Text style={{ fontSize: '12px', color: '#94a3b8' }}>{tag}</Text>
                    </View>
                  ))}
                </View>

                <Text style={{ fontSize: '12px', color: '#64748b' }}>添加于 {formatDate(customer.createdAt)}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* 新增客户弹窗 */}
      {showAddDialog && (
        <View
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'flex-end', zIndex: 1000 }}
          onClick={() => setShowAddDialog(false)}
        >
          <View
            style={{ width: '100%', backgroundColor: '#111827', borderRadius: '20px 20px 0 0', padding: '20px', maxHeight: '80vh', overflow: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <Text style={{ fontSize: '18px', fontWeight: '600', color: '#ffffff' }}>新建客户</Text>
              <View style={{ padding: '8px' }} onClick={() => setShowAddDialog(false)}>
                <X size={20} color="#71717a" />
              </View>
            </View>

            <View style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <View>
                <Text style={{ fontSize: '13px', color: '#71717a', marginBottom: '8px', display: 'block' }}>姓名</Text>
                <View style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '12px 16px', border: '1px solid #1e3a5f' }}>
                  <Input
                    style={{ fontSize: '14px', color: '#ffffff', width: '100%' }}
                    placeholder="请输入姓名"
                    placeholderStyle="color: #64748b"
                    value={newCustomer.name}
                    onInput={(e) => setNewCustomer({ ...newCustomer, name: e.detail.value })}
                  />
                </View>
              </View>

              <View>
                <Text style={{ fontSize: '13px', color: '#71717a', marginBottom: '8px', display: 'block' }}>手机号</Text>
                <View style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '12px 16px', border: '1px solid #1e3a5f' }}>
                  <Input
                    style={{ fontSize: '14px', color: '#ffffff', width: '100%' }}
                    placeholder="请输入手机号"
                    placeholderStyle="color: #64748b"
                    value={newCustomer.phone}
                    onInput={(e) => setNewCustomer({ ...newCustomer, phone: e.detail.value })}
                  />
                </View>
              </View>

              <View>
                <Text style={{ fontSize: '13px', color: '#71717a', marginBottom: '8px', display: 'block' }}>微信号</Text>
                <View style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '12px 16px', border: '1px solid #1e3a5f' }}>
                  <Input
                    style={{ fontSize: '14px', color: '#ffffff', width: '100%' }}
                    placeholder="请输入微信号（选填）"
                    placeholderStyle="color: #64748b"
                    value={newCustomer.wechat}
                    onInput={(e) => setNewCustomer({ ...newCustomer, wechat: e.detail.value })}
                  />
                </View>
              </View>

              <View>
                <Text style={{ fontSize: '13px', color: '#71717a', marginBottom: '8px', display: 'block' }}>来源</Text>
                <ScrollView scrollX style={{ whiteSpace: 'nowrap' }}>
                  <View style={{ display: 'inline-flex', gap: '12px' }}>
                    {sources.slice(1).map((source) => (
                      <View
                        key={source}
                        style={{
                          flexShrink: 0,
                          padding: '10px 16px',
                          backgroundColor: newCustomer.source === source ? '#38bdf8' : '#1e293b',
                          borderRadius: '12px',
                        }}
                        onClick={() => setNewCustomer({ ...newCustomer, source })}
                      >
                        <Text style={{ fontSize: '14px', color: newCustomer.source === source ? '#000' : '#94a3b8' }}>{source}</Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View>
                <Text style={{ fontSize: '13px', color: '#71717a', marginBottom: '8px', display: 'block' }}>标签（逗号分隔）</Text>
                <View style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '12px 16px', border: '1px solid #1e3a5f' }}>
                  <Input
                    style={{ fontSize: '14px', color: '#ffffff', width: '100%' }}
                    placeholder="如：VIP, 意向客户"
                    placeholderStyle="color: #64748b"
                    value={newCustomer.tags}
                    onInput={(e) => setNewCustomer({ ...newCustomer, tags: e.detail.value })}
                  />
                </View>
              </View>

              <View>
                <Text style={{ fontSize: '13px', color: '#71717a', marginBottom: '8px', display: 'block' }}>备注</Text>
                <View style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '12px 16px', border: '1px solid #1e3a5f' }}>
                  <Input
                    style={{ fontSize: '14px', color: '#ffffff', width: '100%' }}
                    placeholder="请输入备注（选填）"
                    placeholderStyle="color: #64748b"
                    value={newCustomer.remark}
                    onInput={(e) => setNewCustomer({ ...newCustomer, remark: e.detail.value })}
                  />
                </View>
              </View>
            </View>

            <View
              style={{ marginTop: '24px', backgroundColor: '#38bdf8', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={handleAddCustomer}
            >
              <Text style={{ fontSize: '15px', fontWeight: '600', color: '#000' }}>添加客户</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default CustomerManagementPage;
