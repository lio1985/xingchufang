import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useState, useEffect } from 'react';
import { Network } from '@/network';

const FEATURES = [
  { id: 'quick-note', title: '灵感速记', desc: '快速记录创作灵感', color: '#3b82f6' },
  { id: 'customer', title: '客资管理', desc: '客户资料管理与跟进', color: '#22c55e' },
  { id: 'recycle', title: '厨具回收', desc: '厨具设备回收管理', color: '#22c55e' },
  { id: 'knowledge', title: '知识分享', desc: '分享创作经验和技巧', color: '#a855f7' },
  { id: 'topic', title: '选题策划', desc: '快速发现优质选题', color: '#06b6d4' },
  { id: 'content', title: '内容创作', desc: '高效创作优质内容', color: '#6366f1' },
  { id: 'lexicon', title: '语料优化', desc: '管理优化语料库', color: '#14b8a6' },
  { id: 'viral', title: '爆款复刻', desc: '解析爆款内容', color: '#ec4899' },
  { id: 'live', title: '直播数据', desc: '抖音直播数据分析', color: '#f43f5e' },
];

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try {
      const user = Taro.getStorageSync('user');
      const token = Taro.getStorageSync('token');
      if (user && token) {
        setIsLoggedIn(true);
        setIsAdmin(user.role === 'admin');
      }
    } catch (e) {
      console.log('storage error');
    }
  }, []);

  const handleNav = (path) => {
    Taro.navigateTo({ url: path });
  };

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#fff', padding: '32px', borderBottom: '1px solid #f0f0f0' }}>
        <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: '40px', fontWeight: '600', color: '#333', display: 'block' }}>星厨房</Text>
            <Text style={{ fontSize: '24px', color: '#999', marginTop: '8px', display: 'block' }}>内容创作助手</Text>
          </View>
          <View 
            style={{ backgroundColor: '#f5f5f5', padding: '16px 24px', borderRadius: '16px' }}
            onClick={() => handleNav('/pages/login/index')}
          >
            <Text style={{ fontSize: '28px' }}>{isLoggedIn ? '已登录' : '登录'}</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView scrollY style={{ flex: 1, paddingBottom: '120px' }}>
        <View style={{ padding: '24px' }}>
          <Text style={{ fontSize: '32px', fontWeight: '600', color: '#333', display: 'block', marginBottom: '24px' }}>
            功能列表
          </Text>
          
          {FEATURES.map((item) => (
            <View
              key={item.id}
              style={{
                backgroundColor: '#fff',
                borderRadius: '20px',
                padding: '28px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
              onClick={() => handleNav(`/pages/${item.id}/index`)}
            >
              <View style={{
                width: '88px',
                height: '88px',
                borderRadius: '20px',
                backgroundColor: item.color + '15',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '24px'
              }}>
                <Text style={{ fontSize: '44px' }}>{item.title[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: '32px', fontWeight: '500', color: '#333', display: 'block', marginBottom: '8px' }}>
                  {item.title}
                </Text>
                <Text style={{ fontSize: '24px', color: '#999', display: 'block' }}>
                  {item.desc}
                </Text>
              </View>
              <Text style={{ fontSize: '48px', color: '#ccc', fontWeight: '300' }}>{'>'}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default Index;
