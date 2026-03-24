import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Network } from '@/network';

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
  
  // 新建客户表单
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    wechat: '',
    source: '抖音',
    tags: '',
    remark: ''
  });

  const sources = ['全部', '抖音', '小红书', '微信', '朋友推荐', '线下活动', '其他'];

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [customers, searchKeyword, selectedSource]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await Network.request({
        url: '/api/customers',
        method: 'GET'
      });

      if (res.data.code === 200) {
        setCustomers(res.data.data || []);
      }
    } catch (error) {
      console.error('加载客户失败', error);
      // 使用本地数据作为降级
      const localData = Taro.getStorageSync('customers') || [];
      setCustomers(localData);
    } finally {
      setLoading(false);
    }
  };

  const filterCustomers = () => {
    let filtered = customers;

    if (selectedSource !== '全部') {
      filtered = filtered.filter(c => c.source === selectedSource);
    }

    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(keyword) ||
        c.phone.includes(keyword) ||
        c.wechat?.toLowerCase().includes(keyword)
      );
    }

    setFilteredCustomers(filtered);
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
      tags: newCustomer.tags ? newCustomer.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      remark: newCustomer.remark.trim(),
      createdAt: new Date().toISOString()
    };

    const updated = [customer, ...customers];
    setCustomers(updated);
    Taro.setStorageSync('customers', updated);
    Taro.showToast({ title: '添加成功', icon: 'success' });

    setNewCustomer({ name: '', phone: '', wechat: '', source: '抖音', tags: '', remark: '' });
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
    <View style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0a0a0b',
      paddingBottom: '120px'
    }}>
      {/* Header */}
      <View style={{ 
        background: 'linear-gradient(180deg, #141416 0%, #0a0a0b 100%)',
        padding: '48px 32px 32px',
        borderBottom: '1px solid #27272a'
      }}>
        <View style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <View style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <View 
              style={{ padding: '8px' }}
              onClick={() => Taro.navigateBack()}
            >
              <Text style={{ fontSize: '32px', color: '#fafafa' }}>←</Text>
            </View>
            <Text style={{ 
              fontSize: '36px', 
              fontWeight: '700', 
              color: '#fafafa'
            }}>
              客户管理
            </Text>
          </View>
          <View 
            style={{
              width: '88px',
              height: '88px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #fb923c 100%)',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px'
            }}
            onClick={() => setShowAddDialog(true)}
          >
            +
          </View>
        </View>

        {/* 搜索框 */}
        <View style={{
          backgroundColor: '#1a1a1d',
          borderRadius: '16px',
          border: '1px solid #27272a',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <Text style={{ fontSize: '28px', color: '#71717a' }}>🔍</Text>
          <Input
            style={{ 
              flex: 1,
              fontSize: '28px', 
              color: '#fafafa'
            }}
            placeholder="搜索姓名/手机/微信..."
            placeholderStyle="color: #52525b"
            value={searchKeyword}
            onInput={(e) => setSearchKeyword(e.detail.value)}
          />
        </View>

        {/* 来源筛选 */}
        <ScrollView 
          scrollX 
          style={{ marginTop: '20px', width: '100%' }}
          showHorizontalScrollIndicator={false}
        >
          <View style={{ display: 'flex', gap: '12px', paddingRight: '32px' }}>
            {sources.map((source) => (
              <View
                key={source}
                style={{
                  flexShrink: 0,
                  padding: '12px 20px',
                  backgroundColor: selectedSource === source ? '#f59e0b' : '#141416',
                  color: selectedSource === source ? '#000' : '#a1a1aa',
                  borderRadius: '12px',
                  fontSize: '24px',
                  fontWeight: '500',
                  border: selectedSource === source ? 'none' : '1px solid #27272a'
                }}
                onClick={() => setSelectedSource(source)}
              >
                {source}
              </View>
            ))}
          </View>
        </ScrollView>

        {/* 统计 */}
        <View style={{
          marginTop: '24px',
          padding: '20px 24px',
          backgroundColor: '#1a1a1d',
          borderRadius: '16px',
          display: 'flex',
          justifyContent: 'space-around'
        }}>
          <View style={{ textAlign: 'center' }}>
            <Text style={{ 
              fontSize: '36px', 
              fontWeight: '700', 
              color: '#f59e0b',
              display: 'block'
            }}>
              {customers.length}
            </Text>
            <Text style={{ 
              fontSize: '22px', 
              color: '#71717a'
            }}>
              全部客户
            </Text>
          </View>
          <View style={{ 
            width: '1px', 
            backgroundColor: '#27272a',
            marginTop: '8px',
            marginBottom: '8px'
          }} />
          <View style={{ textAlign: 'center' }}>
            <Text style={{ 
              fontSize: '36px', 
              fontWeight: '700', 
              color: '#fafafa',
              display: 'block'
            }}>
              {filteredCustomers.length}
            </Text>
            <Text style={{ 
              fontSize: '22px', 
              color: '#71717a'
            }}>
              当前显示
            </Text>
          </View>
        </View>
      </View>

      {/* 客户列表 */}
      <View style={{ padding: '32px' }}>
        {loading ? (
          <View style={{ textAlign: 'center', paddingTop: '120px' }}>
            <Text style={{ fontSize: '64px' }}>⏳</Text>
            <Text style={{ fontSize: '28px', color: '#71717a', marginTop: '24px' }}>加载中...</Text>
          </View>
        ) : filteredCustomers.length === 0 ? (
          <View style={{ textAlign: 'center', paddingTop: '120px' }}>
            <Text style={{ fontSize: '80px' }}>👥</Text>
            <Text style={{ fontSize: '28px', color: '#71717a', marginTop: '24px' }}>
              {searchKeyword || selectedSource !== '全部' ? '没有找到客户' : '暂无客户数据'}
            </Text>
          </View>
        ) : (
          filteredCustomers.map((customer) => (
            <View
              key={customer.id}
              style={{
                backgroundColor: '#141416',
                borderRadius: '20px',
                padding: '28px',
                marginBottom: '16px',
                border: '1px solid #27272a'
              }}
            >
              <View style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginBottom: '16px'
              }}>
                <View>
                  <Text style={{ 
                    fontSize: '32px', 
                    fontWeight: '600', 
                    color: '#fafafa'
                  }}>
                    {customer.name}
                  </Text>
                  <Text style={{ 
                    fontSize: '24px', 
                    color: '#71717a',
                    marginTop: '4px'
                  }}>
                    {formatDate(customer.createdAt)} 添加
                  </Text>
                </View>
                <View style={{
                  padding: '8px 16px',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: '8px'
                }}>
                  <Text style={{ 
                    fontSize: '22px', 
                    color: '#3b82f6'
                  }}>
                    {customer.source}
                  </Text>
                </View>
              </View>

              {/* 联系方式 */}
              <View style={{ 
                display: 'flex', 
                gap: '16px',
                marginBottom: '16px'
              }}>
                <View 
                  style={{
                    flex: 1,
                    padding: '16px 20px',
                    backgroundColor: '#1a1a1d',
                    borderRadius: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  onClick={() => handleCopy(customer.phone)}
                >
                  <View>
                    <Text style={{ fontSize: '20px', color: '#71717a', display: 'block' }}>📱 手机</Text>
                    <Text style={{ fontSize: '26px', color: '#fafafa', marginTop: '4px' }}>{customer.phone}</Text>
                  </View>
                  <Text style={{ fontSize: '28px', color: '#f59e0b' }}>📋</Text>
                </View>
                {customer.wechat && (
                  <View 
                    style={{
                      flex: 1,
                      padding: '16px 20px',
                      backgroundColor: '#1a1a1d',
                      borderRadius: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                    onClick={() => handleCopy(customer.wechat!)}
                  >
                    <View>
                      <Text style={{ fontSize: '20px', color: '#71717a', display: 'block' }}>💬 微信</Text>
                      <Text style={{ fontSize: '26px', color: '#fafafa', marginTop: '4px' }}>{customer.wechat}</Text>
                    </View>
                    <Text style={{ fontSize: '28px', color: '#22c55e' }}>📋</Text>
                  </View>
                )}
              </View>

              {/* 操作按钮 */}
              <View style={{ display: 'flex', gap: '12px' }}>
                <View 
                  style={{
                    flex: 1,
                    padding: '16px',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}
                  onClick={() => handleCall(customer.phone)}
                >
                  <Text style={{ fontSize: '26px', color: '#f59e0b' }}>📞 拨打</Text>
                </View>
                <View 
                  style={{
                    flex: 1,
                    padding: '16px',
                    backgroundColor: '#1a1a1d',
                    borderRadius: '12px',
                    textAlign: 'center',
                    border: '1px solid #27272a'
                  }}
                  onClick={() => Taro.showToast({ title: '功能开发中', icon: 'none' })}
                >
                  <Text style={{ fontSize: '26px', color: '#a1a1aa' }}>📝 编辑</Text>
                </View>
              </View>

              {/* 标签 */}
              {customer.tags.length > 0 && (
                <View style={{ 
                  display: 'flex', 
                  gap: '8px',
                  flexWrap: 'wrap',
                  marginTop: '16px'
                }}>
                  {customer.tags.map((tag, index) => (
                    <View
                      key={index}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: 'rgba(168, 85, 247, 0.1)',
                        borderRadius: '8px',
                        fontSize: '20px',
                        color: '#a855f7'
                      }}
                    >
                      {tag}
                    </View>
                  ))}
                </View>
              )}

              {/* 备注 */}
              {customer.remark && (
                <Text style={{ 
                  fontSize: '22px', 
                  color: '#71717a',
                  marginTop: '12px',
                  padding: '12px 16px',
                  backgroundColor: '#1a1a1d',
                  borderRadius: '8px'
                }}>
                  💡 {customer.remark}
                </Text>
              )}
            </View>
          ))
        )}
      </View>

      {/* 新增客户弹窗 */}
      {showAddDialog && (
        <View style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'flex-end',
          zIndex: 1000
        }}
          onClick={() => setShowAddDialog(false)}
        >
          <View 
            style={{
              width: '100%',
              backgroundColor: '#141416',
              borderRadius: '32px 32px 0 0',
              padding: '32px',
              maxHeight: '85vh'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <View style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '32px'
            }}>
              <Text style={{ fontSize: '32px', fontWeight: '600', color: '#fafafa' }}>新增客户</Text>
              <Text style={{ fontSize: '28px', color: '#71717a' }} onClick={() => setShowAddDialog(false)}>✕</Text>
            </View>

            <ScrollView scrollY style={{ maxHeight: 'calc(85vh - 200px)' }}>
              <View style={{ marginBottom: '24px' }}>
                <Text style={{ fontSize: '24px', color: '#a1a1aa', marginBottom: '12px', display: 'block' }}>姓名 *</Text>
                <Input
                  style={{ backgroundColor: '#1a1a1d', borderRadius: '16px', padding: '20px 24px', fontSize: '28px', color: '#fafafa', border: '1px solid #27272a' }}
                  placeholder="请输入姓名"
                  placeholderStyle="color: #52525b"
                  value={newCustomer.name}
                  onInput={(e) => setNewCustomer({ ...newCustomer, name: e.detail.value })}
                />
              </View>

              <View style={{ marginBottom: '24px' }}>
                <Text style={{ fontSize: '24px', color: '#a1a1aa', marginBottom: '12px', display: 'block' }}>手机号 *</Text>
                <Input
                  style={{ backgroundColor: '#1a1a1d', borderRadius: '16px', padding: '20px 24px', fontSize: '28px', color: '#fafafa', border: '1px solid #27272a' }}
                  placeholder="请输入手机号"
                  placeholderStyle="color: #52525b"
                  type="number"
                  value={newCustomer.phone}
                  onInput={(e) => setNewCustomer({ ...newCustomer, phone: e.detail.value })}
                />
              </View>

              <View style={{ marginBottom: '24px' }}>
                <Text style={{ fontSize: '24px', color: '#a1a1aa', marginBottom: '12px', display: 'block' }}>微信号</Text>
                <Input
                  style={{ backgroundColor: '#1a1a1d', borderRadius: '16px', padding: '20px 24px', fontSize: '28px', color: '#fafafa', border: '1px solid #27272a' }}
                  placeholder="请输入微信号"
                  placeholderStyle="color: #52525b"
                  value={newCustomer.wechat}
                  onInput={(e) => setNewCustomer({ ...newCustomer, wechat: e.detail.value })}
                />
              </View>

              <View style={{ marginBottom: '24px' }}>
                <Text style={{ fontSize: '24px', color: '#a1a1aa', marginBottom: '12px', display: 'block' }}>来源</Text>
                <ScrollView scrollX showHorizontalScrollIndicator={false}>
                  <View style={{ display: 'flex', gap: '12px' }}>
                    {sources.slice(1).map((source) => (
                      <View
                        key={source}
                        style={{
                          flexShrink: 0,
                          padding: '12px 20px',
                          backgroundColor: newCustomer.source === source ? '#f59e0b' : '#1a1a1d',
                          color: newCustomer.source === source ? '#000' : '#a1a1aa',
                          borderRadius: '12px',
                          fontSize: '24px',
                          border: newCustomer.source === source ? 'none' : '1px solid #27272a'
                        }}
                        onClick={() => setNewCustomer({ ...newCustomer, source })}
                      >
                        {source}
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View style={{ marginBottom: '24px' }}>
                <Text style={{ fontSize: '24px', color: '#a1a1aa', marginBottom: '12px', display: 'block' }}>标签（逗号分隔）</Text>
                <Input
                  style={{ backgroundColor: '#1a1a1d', borderRadius: '16px', padding: '20px 24px', fontSize: '28px', color: '#fafafa', border: '1px solid #27272a' }}
                  placeholder="如：VIP, 高意向, 美食爱好者"
                  placeholderStyle="color: #52525b"
                  value={newCustomer.tags}
                  onInput={(e) => setNewCustomer({ ...newCustomer, tags: e.detail.value })}
                />
              </View>

              <View style={{ marginBottom: '32px' }}>
                <Text style={{ fontSize: '24px', color: '#a1a1aa', marginBottom: '12px', display: 'block' }}>备注</Text>
                <Input
                  style={{ backgroundColor: '#1a1a1d', borderRadius: '16px', padding: '20px 24px', fontSize: '28px', color: '#fafafa', border: '1px solid #27272a', minHeight: '120px' }}
                  placeholder="添加备注信息..."
                  placeholderStyle="color: #52525b"
                  value={newCustomer.remark}
                  onInput={(e) => setNewCustomer({ ...newCustomer, remark: e.detail.value })}
                />
              </View>

              <View
                style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #fb923c 100%)',
                  borderRadius: '16px',
                  padding: '28px',
                  textAlign: 'center'
                }}
                onClick={handleAddCustomer}
              >
                <Text style={{ fontSize: '32px', fontWeight: '600', color: '#000' }}>保存客户</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
};

export default CustomerManagementPage;
